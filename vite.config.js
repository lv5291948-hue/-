import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const mimeExtensions = {
  'application/pdf': 'pdf',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

function localContentSavePlugin() {
  return {
    name: 'portfolio-local-content-save',
    handleHotUpdate(context) {
      const normalizedPath = context.file.replace(/\\/g, '/');
      if (normalizedPath.endsWith('/src/content.json')) return [];
      return undefined;
    },
    configureServer(server) {
      server.middlewares.use('/__portfolio/save', (request, response, next) => {
        if (request.method !== 'POST') {
          next();
          return;
        }

        const chunks = [];
        let size = 0;
        request.on('data', (chunk) => {
          size += chunk.length;
          if (size > 256 * 1024 * 1024) {
            request.destroy(new Error('保存内容超过 256 MB 限制。'));
            return;
          }
          chunks.push(chunk);
        });

        request.on('end', async () => {
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          try {
            const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const root = server.config.root;
            const uploadDirectory = resolve(root, 'public/assets/uploads');
            const assetMap = new Map((payload.assets || []).map((asset) => [asset.ref, asset]));
            await mkdir(uploadDirectory, { recursive: true });

            const saveDataUrl = async (dataUrl, fallbackType = '') => {
              const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
              if (!match) throw new Error('图片或 PDF 数据无法读取。');
              const type = match[1] || fallbackType || 'application/octet-stream';
              const buffer = match[2]
                ? Buffer.from(match[3], 'base64')
                : Buffer.from(decodeURIComponent(match[3]), 'utf8');
              const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 20);
              const extension = mimeExtensions[type] || 'bin';
              const relativePath = `assets/uploads/${hash}.${extension}`;
              await writeFile(resolve(root, 'public', relativePath), buffer);
              return relativePath;
            };

            const persistValue = async (value) => {
              if (Array.isArray(value)) return Promise.all(value.map(persistValue));
              if (value && typeof value === 'object') {
                const entries = await Promise.all(
                  Object.entries(value).map(async ([key, item]) => [key, await persistValue(item)]),
                );
                return Object.fromEntries(entries);
              }
              if (typeof value !== 'string') return value;

              if (value.startsWith('portfolio-asset:')) {
                const asset = assetMap.get(value);
                if (!asset?.dataUrl) throw new Error(`找不到作品资源：${asset?.name || value}`);
                return saveDataUrl(asset.dataUrl, asset.type);
              }
              if (value.startsWith('data:')) return saveDataUrl(value);
              if (/^(?:\.\/|\/)?assets\//.test(value)) {
                return value.replace(/^\.\//, '').replace(/^\//, '');
              }
              return value;
            };

            const content = await persistValue(payload.content);
            const contentPath = resolve(root, 'src/content.json');
            const temporaryPath = `${contentPath}.tmp`;
            await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
            await rename(temporaryPath, contentPath);

            response.statusCode = 200;
            response.end(JSON.stringify({ ok: true, projects: content.projects?.length || 0 }));
          } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({ message: error?.message || '无法保存到本地项目。' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [localContentSavePlugin()],
});
