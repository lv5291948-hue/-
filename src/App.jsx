import React, { useEffect, useMemo, useRef, useState } from 'react';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
const appHref = (path = '') => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const initialProjects = [
  {
    title: 'AI 品牌生成系统',
    type: 'Brand System / AI Workflow',
    image: assetPath('assets/project-01.png'),
    cover: assetPath('assets/project-01.png'),
    fileType: 'image',
    copy: '把品牌关键词、视觉语言和生成式图像流程收束成可复用的设计系统。',
  },
  {
    title: '科技产品发布视觉',
    type: 'Campaign / Motion Direction',
    image: assetPath('assets/project-02.png'),
    cover: assetPath('assets/project-02.png'),
    fileType: 'image',
    copy: '面向发布会与线上传播，建立高辨识度的深色视觉叙事。',
  },
  {
    title: '智能硬件体验界面',
    type: 'UI / Visual Design',
    image: assetPath('assets/project-03.png'),
    cover: assetPath('assets/project-03.png'),
    fileType: 'image',
    copy: '以低噪声信息层级和精致动效，让复杂数据更容易被理解。',
  },
];

const initialContent = {
  version: 4,
  heroTitle: '把智能、品牌与视觉体验做得清晰而有质感。',
  heroLead:
    '从品牌策略到生成式视觉，从产品界面到传播素材，我把复杂想法整理成可感知、可落地、可传播的设计。',
  intro:
    '擅长品牌视觉、产品界面、AI 生成流程和商业化视觉表达。能在早期概念、系统搭建和最终交付之间保持一致的审美与效率。',
  email: 'hello@example.com',
  phone: '+86 138 0000 0000',
  accent: '#0071e3',
  textColor: '#111111',
  heroImage: assetPath('assets/hero-bg.jpg'),
  portrait: assetPath('assets/portrait.png'),
  advantagesTitle: '能独立完成从概念到交付的视觉闭环。',
  strengths: [
    {
      title: '品牌视觉系统',
      copy: '快速定义方向，建立可复用规范，并把结果推进到真实上线场景。',
    },
    {
      title: 'AI 图像工作流',
      copy: '把生成式工具纳入稳定流程，让创意探索更快、更一致。',
    },
    {
      title: '产品界面美术',
      copy: '用清晰层级和克制视觉，让复杂信息变得容易理解。',
    },
    {
      title: '动效与叙事',
      copy: '用节奏、转场和视觉线索，强化品牌记忆与内容表达。',
    },
  ],
  closingEyebrow: 'Let’s Build',
  closingTitle: '需要一个更像产品发布页的作品集？我们可以从这里继续。',
  projects: initialProjects,
};

const EDITOR_PASSWORD = 'LvHaiTao19990724';
const EDITOR_UNLOCK_KEY = 'editor-unlocked-v2';
const MAX_PROJECT_IMAGES = 32;
const ASSET_PREFIX = 'portfolio-asset:';
const ASSET_DB_NAME = 'portfolio-assets';
const ASSET_STORE_NAME = 'files';
const REMOTE_CONTENT_PATH = 'data/content.json';
const GITHUB_API_VERSION = '2022-11-28';

function normalizeProject(project) {
  const isPdf = project.fileType === 'pdf' || project.image?.startsWith('data:application/pdf');
  const sourceImages = Array.isArray(project.images)
    ? project.images.filter(Boolean).slice(0, MAX_PROJECT_IMAGES)
    : [];
  const images = isPdf
    ? []
    : (sourceImages.length ? sourceImages : [project.image].filter(Boolean)).slice(0, MAX_PROJECT_IMAGES);
  const fileType = isPdf ? 'pdf' : images.length > 1 ? 'images' : 'image';
  const image = isPdf ? project.image : images[0] || project.image || '';

  return {
    ...project,
    image,
    images,
    cover: project.cover || (fileType !== 'pdf' ? image : ''),
    fileType,
    pageCount: fileType === 'pdf' ? Math.max(1, project.pageCount || countPdfPages(image)) : undefined,
  };
}

function normalizeStrengths(strengths) {
  const source = Array.isArray(strengths) && strengths.length ? strengths : initialContent.strengths;
  return source.slice(0, 4).map((item, index) => {
    if (typeof item === 'string') {
      return {
        title: item,
        copy: initialContent.strengths[index]?.copy || '',
      };
    }
    return {
      title: item?.title || initialContent.strengths[index]?.title || '',
      copy: item?.copy || initialContent.strengths[index]?.copy || '',
    };
  });
}

function normalizeContent(content) {
  const source = content?.content || content || {};
  return {
    ...initialContent,
    ...source,
    version: initialContent.version,
    projects: (source.projects || initialProjects).map(normalizeProject),
    strengths: normalizeStrengths(source.strengths),
  };
}

function loadContent() {
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio-content'));
    if (!saved) return initialContent;
    return normalizeContent(saved);
  } catch {
    return initialContent;
  }
}

function SlideIn({ as: Tag = 'div', className = '', delay = 0, children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.18 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      className={`slide-in ${visible ? 'is-visible' : ''} ${className}`}
      ref={ref}
      style={{ '--delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SplitText({ text }) {
  return (
    <span className="split-text" aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span
          aria-hidden="true"
          className="split-char"
          key={`${char}-${index}`}
          style={{ '--i': index }}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </span>
  );
}

function isAssetRef(src) {
  return typeof src === 'string' && src.startsWith(ASSET_PREFIX);
}

function openAssetDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(ASSET_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSET_STORE_NAME)) {
        db.createObjectStore(ASSET_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function saveAsset(file) {
  try {
    const db = await openAssetDb();
    const id = `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(ASSET_STORE_NAME, 'readwrite');
      transaction.objectStore(ASSET_STORE_NAME).put({
        id,
        blob: file,
        name: file.name,
        type: file.type,
        createdAt: Date.now(),
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    return `${ASSET_PREFIX}${id}`;
  } catch {
    return readFileAsDataUrl(file);
  }
}

async function getAssetRecord(src) {
  if (!isAssetRef(src)) return null;
  const id = src.slice(ASSET_PREFIX.length);
  const db = await openAssetDb();
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction(ASSET_STORE_NAME, 'readonly')
      .objectStore(ASSET_STORE_NAME)
      .get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record || null;
}

async function getAssetBlob(src) {
  const record = await getAssetRecord(src);
  return record?.blob || null;
}

function useAssetUrl(src) {
  const [url, setUrl] = useState(isAssetRef(src) ? '' : src || '');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    if (!src) {
      setUrl('');
      return undefined;
    }

    if (!isAssetRef(src)) {
      setUrl(src);
      return undefined;
    }

    getAssetBlob(src)
      .then((blob) => {
        if (!active) return;
        if (!blob) {
          setUrl('');
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setUrl('');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return url;
}

function AssetImage({ src, alt, ...props }) {
  const resolvedSrc = useAssetUrl(src);
  if (!resolvedSrc) return <div className="media-empty">文件加载中</div>;
  return <img src={resolvedSrc} alt={alt} {...props} />;
}

function readFile(file, onLoad) {
  if (!file) return;
  readFileAsDataUrl(file).then((result) => {
    const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
    onLoad({
      image: result,
      fileType,
      pageCount: fileType === 'pdf' ? countPdfPages(result) : undefined,
    });
  });
}

async function readImageAsset(file, onLoad) {
  if (!file || !file.type.startsWith('image/')) return;
  const image = await saveAsset(file);
  onLoad(image);
}

async function readProjectFiles(fileList, onLoad) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  const imageFiles = files
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, MAX_PROJECT_IMAGES);

  if (imageFiles.length) {
    const images = [];
    for (const file of imageFiles) {
      images.push(await saveAsset(file));
    }
    onLoad({
      image: images[0],
      images,
      fileType: images.length > 1 ? 'images' : 'image',
      pageCount: undefined,
    });
    return;
  }

  const pdfFile = files.find((file) => file.type === 'application/pdf');
  if (!pdfFile) return;

  onLoad({
    image: await saveAsset(pdfFile),
    images: [],
    fileType: 'pdf',
    pageCount: await countPdfPagesFromFile(pdfFile),
  });
}

function countPdfPages(src) {
  if (!src?.startsWith('data:application/pdf')) return 1;
  const commaIndex = src.indexOf(',');
  if (commaIndex === -1) return 1;

  try {
    const meta = src.slice(0, commaIndex);
    const payload = src.slice(commaIndex + 1);
    const text = meta.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
    return countPdfPagesFromText(text);
  } catch {
    return 1;
  }
}

function countPdfPagesFromText(text) {
  const pageObjectCount = text.match(/\/Type\s*\/Page\b/g)?.length || 0;
  const pageTreeCounts = [
    ...text.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,500}?\/Count\s+(\d+)/g),
    ...text.matchAll(/\/Count\s+(\d+)[\s\S]{0,500}?\/Type\s*\/Pages\b/g),
  ].map((match) => Number(match[1]) || 0);
  return Math.max(1, pageObjectCount, ...pageTreeCounts);
}

async function countPdfPagesFromFile(file) {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let text = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      text += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return countPdfPagesFromText(text);
  } catch {
    return 1;
  }
}

function sanitizeFileSegment(value, fallback = 'asset') {
  const safe = String(value || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return safe || fallback;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function extensionFromType(type, name = '') {
  const fileExt = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fileExt) return fileExt === 'jpeg' ? 'jpg' : fileExt;

  const map = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };
  return map[type] || type?.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'bin';
}

function dataUrlToBlob(dataUrl) {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return null;
  const meta = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  const type = meta.match(/^data:([^;,]+)/)?.[1] || 'application/octet-stream';
  const binary = meta.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

async function blobToBase64(blob) {
  const dataUrl = await readFileAsDataUrl(blob);
  return String(dataUrl).split(',')[1] || '';
}

function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function encodeGitHubPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function cleanGitHubSettings(settings) {
  return {
    owner: settings.owner.trim(),
    repo: settings.repo.trim(),
    branch: settings.branch.trim() || 'main',
    token: settings.token.trim(),
  };
}

async function githubJson(settings, path, options = {}) {
  const { allowNotFound = false, query = '', ...requestOptions } = options;
  const url = `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${encodeGitHubPath(path)}${query}`;
  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.token}`,
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...(requestOptions.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    throw new Error(payload?.message || `GitHub 请求失败（${response.status}）`);
  }
  return payload;
}

async function getGitHubFileSha(settings, path) {
  const payload = await githubJson(settings, path, {
    allowNotFound: true,
    method: 'GET',
    query: `?ref=${encodeURIComponent(settings.branch)}`,
  });
  return payload?.sha;
}

async function putGitHubFile(settings, path, base64Content, message) {
  const sha = await getGitHubFileSha(settings, path);
  return githubJson(settings, path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: settings.branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

async function publishAsset(src, settings, context) {
  if (!src || (!isAssetRef(src) && !src.startsWith('data:'))) return src;
  if (context.cache.has(src)) return context.cache.get(src);

  let blob = null;
  let name = context.label || 'asset';
  let type = '';
  let fingerprint = hashString(src);

  if (isAssetRef(src)) {
    const record = await getAssetRecord(src);
    if (!record?.blob) {
      throw new Error(`资源文件未找到：${context.label || 'asset'}。请重新上传这个文件后再同步。`);
    }
    blob = record.blob;
    name = record.name || name;
    type = record.type || blob.type;
    fingerprint = sanitizeFileSegment(record.id || fingerprint, fingerprint).slice(0, 24);
  } else {
    blob = dataUrlToBlob(src);
    if (!blob) {
      throw new Error(`资源文件无法读取：${context.label || 'asset'}。请重新上传这个文件后再同步。`);
    }
    type = blob.type;
  }

  const extension = extensionFromType(type, name);
  const baseName = sanitizeFileSegment(name || context.label);
  const fileName = `${baseName}-${fingerprint}.${extension}`;
  const publicPath = `data/assets/${fileName}`;

  context.onStatus?.(`正在上传资源：${fileName}`);
  await putGitHubFile(
    settings,
    `public/${publicPath}`,
    await blobToBase64(blob),
    `Publish portfolio asset: ${fileName}`,
  );

  context.cache.set(src, publicPath);
  return publicPath;
}

async function prepareContentForPublish(content, settings, onStatus) {
  const published = normalizeContent(content);
  const context = { cache: new Map(), onStatus };

  published.heroImage = await publishAsset(published.heroImage, settings, {
    ...context,
    label: 'hero-image',
  });
  published.portrait = await publishAsset(published.portrait, settings, {
    ...context,
    label: 'portrait',
  });

  published.projects = [];
  for (const project of normalizeContent(content).projects) {
    const nextProject = { ...project };
    nextProject.image = await publishAsset(nextProject.image, settings, {
      ...context,
      label: `${nextProject.title || 'project'}-file`,
    });
    nextProject.cover = await publishAsset(nextProject.cover, settings, {
      ...context,
      label: `${nextProject.title || 'project'}-cover`,
    });
    nextProject.images = [];
    for (const [index, image] of (project.images || []).entries()) {
      nextProject.images.push(await publishAsset(image, settings, {
        ...context,
        label: `${nextProject.title || 'project'}-${index + 1}`,
      }));
    }
    if (nextProject.fileType !== 'pdf' && nextProject.images.length) {
      nextProject.image = nextProject.images[0];
    }
    published.projects.push(normalizeProject(nextProject));
  }

  return published;
}

async function syncContentToGitHub(rawSettings, content, onStatus) {
  const settings = cleanGitHubSettings(rawSettings);
  if (!settings.owner || !settings.repo || !settings.token) {
    throw new Error('请填写 GitHub 用户名、仓库名和 Token。');
  }

  onStatus?.('正在整理可上线内容...');
  const published = await prepareContentForPublish(content, settings, onStatus);
  const payload = {
    version: initialContent.version,
    updatedAt: new Date().toISOString(),
    content: published,
  };

  onStatus?.('正在写入线上内容文件...');
  await putGitHubFile(
    settings,
    `public/${REMOTE_CONTENT_PATH}`,
    textToBase64(JSON.stringify(payload, null, 2)),
    'Update portfolio online content',
  );

  return payload;
}

function singlePagePdfUrl(src, page) {
  return `${src.split('#')[0]}#page=${page}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;
}

function createPdfPreviewUrl(src) {
  if (!src?.startsWith('data:application/pdf')) return src;
  const commaIndex = src.indexOf(',');
  if (commaIndex === -1) return src;

  try {
    const meta = src.slice(0, commaIndex);
    const payload = src.slice(commaIndex + 1);
    const binary = meta.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch {
    return src;
  }
}

function ProjectMedia({ project, compact = false }) {
  const [page, setPage] = useState(1);
  const [pdfPreview, setPdfPreview] = useState({ source: '', url: '' });
  const mediaUrl = useAssetUrl(project?.image || '');
  const galleryImages = useMemo(() => {
    if (project?.fileType === 'pdf') return [];
    const images = Array.isArray(project?.images) && project.images.length
      ? project.images
      : [project?.image].filter(Boolean);
    return images.filter(Boolean).slice(0, MAX_PROJECT_IMAGES);
  }, [project?.fileType, project?.image, project?.images]);
  const pageCount = useMemo(
    () => Math.max(1, project?.pageCount || countPdfPages(project?.image)),
    [project?.image, project?.pageCount],
  );
  const mediaPageCount = project?.fileType === 'pdf' ? pageCount : Math.max(1, galleryImages.length);

  useEffect(() => {
    setPage(1);
  }, [project?.image, pageCount, galleryImages.length]);

  useEffect(() => {
    if (project?.fileType !== 'pdf' || !mediaUrl) return undefined;

    const previewUrl = createPdfPreviewUrl(mediaUrl);
    setPdfPreview({ source: mediaUrl, url: previewUrl });
    return () => {
      if (previewUrl?.startsWith('blob:') && previewUrl !== mediaUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [project?.fileType, mediaUrl]);

  const previousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const nextPage = () => {
    setPage((current) => Math.min(mediaPageCount, current + 1));
  };

  if (!project?.image && !galleryImages.length) return <div className="media-empty">暂无文件</div>;
  if (project.fileType === 'pdf') {
    const previewUrl = pdfPreview.source === mediaUrl ? pdfPreview.url : mediaUrl;
    return compact ? (
      <div className="pdf-card">PDF</div>
    ) : !previewUrl ? (
      <div className="media-empty">文件加载中</div>
    ) : (
      <div className="pdf-shell">
        <div className="pdf-bar">
          <span>PDF 单页预览 · 第 {page} / {pageCount} 页</span>
          <a href={previewUrl} target="_blank" rel="noreferrer">打开原文件</a>
        </div>
        <div className="pdf-page">
          <iframe
            className="pdf-viewer"
            key={`${project.title}-${previewUrl}-${page}`}
            src={singlePagePdfUrl(previewUrl, page)}
            title={`${project.title} 第 ${page} 页`}
            scrolling="no"
          />
          <div className="pdf-click-zones" aria-label="PDF 翻页">
            <button
              aria-label="上一页"
              className="pdf-page-zone"
              disabled={page <= 1}
              onClick={previousPage}
              type="button"
            />
            <button
              aria-label="下一页"
              className="pdf-page-zone"
              disabled={page >= pageCount}
              onClick={nextPage}
              type="button"
            />
          </div>
        </div>
      </div>
    );
  }

  if (compact || galleryImages.length <= 1) {
    return <AssetImage src={galleryImages[0] || project.image} alt={project.title} />;
  }

  const imageIndex = Math.min(page - 1, galleryImages.length - 1);
  return (
    <div className="image-gallery-shell">
      <div className="image-gallery-bar">
        <span>图片预览 · 第 {page} / {galleryImages.length} 张</span>
      </div>
      <div className="image-gallery-page">
        <AssetImage src={galleryImages[imageIndex]} alt={`${project.title} 第 ${page} 张`} />
        <div className="pdf-click-zones" aria-label="图片翻页">
          <button
            aria-label="上一张"
            className="pdf-page-zone"
            disabled={page <= 1}
            onClick={previousPage}
            type="button"
          />
          <button
            aria-label="下一张"
            className="pdf-page-zone"
            disabled={page >= galleryImages.length}
            onClick={nextPage}
            type="button"
          />
        </div>
      </div>
    </div>
  );
}

function ProjectCover({ project }) {
  if (project.cover) return <AssetImage src={project.cover} alt={`${project.title} 封面`} />;
  return <ProjectMedia compact project={project} />;
}

function App() {
  const [content, setContent] = useState(loadContent);
  const [selected, setSelected] = useState(0);
  const [saveError, setSaveError] = useState('');
  const isEditor = window.location.pathname.replace(/\/+$/, '').endsWith('/editor');
  const hasStoredContent = useRef(Boolean(localStorage.getItem('portfolio-content')));
  const [editorUnlocked, setEditorUnlocked] = useState(
    () => sessionStorage.getItem(EDITOR_UNLOCK_KEY) === 'true',
  );
  const [draftProject, setDraftProject] = useState({
    title: '',
    type: '',
    copy: '',
    image: '',
    images: [],
    cover: '',
    fileType: 'image',
  });

  useEffect(() => {
    if (hasStoredContent.current) return undefined;

    let active = true;
    fetch(`${import.meta.env.BASE_URL}${REMOTE_CONTENT_PATH}?t=${Date.now()}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active && payload) {
          setContent(normalizeContent(payload));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditor) return;

    try {
      localStorage.setItem('portfolio-content', JSON.stringify(content));
      hasStoredContent.current = true;
      setSaveError('');
    } catch {
      setSaveError('浏览器本地存储空间不足，当前改动可继续编辑，但可能无法完整保存。建议重新上传较小文件或减少大文件数量。');
    }
  }, [content, isEditor]);

  const update = (key, value) => setContent((current) => ({ ...current, [key]: value }));
  const updateProject = (index, patch) =>
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, i) =>
        i === index ? normalizeProject({ ...project, ...patch }) : project,
      ),
    }));
  const updateStrength = (index, patch) =>
    setContent((current) => ({
      ...current,
      strengths: current.strengths.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));

  const addProject = () => {
    if (!draftProject.title.trim()) return;
    setContent((current) => ({
      ...current,
      projects: [
        ...current.projects,
        normalizeProject({
          title: draftProject.title,
          type: draftProject.type || 'Portfolio Upload',
          copy: draftProject.copy || '上传作品说明。',
          image: draftProject.image || assetPath('assets/project-01.png'),
          images: draftProject.images || [],
          cover: draftProject.cover || '',
          fileType: draftProject.fileType || 'image',
          pageCount: draftProject.pageCount,
        }),
      ],
    }));
    setSelected(content.projects.length);
    setDraftProject({ title: '', type: '', copy: '', image: '', images: [], cover: '', fileType: 'image' });
  };

  const deleteProject = (index) => {
    setContent((current) => ({
      ...current,
      projects: current.projects.filter((_, i) => i !== index),
    }));
    setSelected((current) => Math.max(0, Math.min(current, content.projects.length - 2)));
  };

  const activeProject = content.projects[selected] || {
    title: '暂无作品',
    type: 'Portfolio',
    copy: '去编辑页添加图片或 PDF 作品。',
    image: '',
    fileType: 'image',
  };

  if (isEditor) {
    if (!editorUnlocked) {
      return <PasswordPage onUnlock={() => setEditorUnlocked(true)} />;
    }
    return (
      <EditorPage
        addProject={addProject}
        content={content}
        deleteProject={deleteProject}
        draftProject={draftProject}
        saveError={saveError}
        setDraftProject={setDraftProject}
        update={update}
        updateProject={updateProject}
        updateStrength={updateStrength}
      />
    );
  }

  return (
    <HomePage
      activeProject={activeProject}
      content={content}
      selected={selected}
      setSelected={setSelected}
    />
  );
}

function PasswordPage({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (password === EDITOR_PASSWORD) {
      sessionStorage.removeItem('editor-unlocked');
      sessionStorage.setItem(EDITOR_UNLOCK_KEY, 'true');
      onUnlock();
      return;
    }
    setError('密码不正确');
  };

  return (
    <>
      <Nav editor />
      <main className="editor-page">
        <section className="password-panel">
          <p className="eyebrow">Editor</p>
          <h1>输入密码。</h1>
          <form onSubmit={submit}>
            <input
              autoFocus
              placeholder="编辑页密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="button primary" type="submit">进入编辑页</button>
          </form>
          {error && <p className="password-error">{error}</p>}
        </section>
      </main>
    </>
  );
}

function Nav({ editor = false }) {
  return (
    <nav className="nav" aria-label="主导航">
      <a className="brand" href={appHref('')}>Portfolio</a>
      <div className="nav-links">
        <a href={appHref('#profile')}>经历</a>
        <a href={appHref('#work')}>项目</a>
        <a href={appHref('#portfolio')}>作品集</a>
        <a href={editor ? appHref('') : appHref('editor')}>{editor ? '返回首页' : '编辑'}</a>
      </div>
    </nav>
  );
}

function ContactDialog({ contact, onClose }) {
  useEffect(() => {
    if (!contact) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [contact, onClose]);

  if (!contact) return null;

  const copyValue = () => {
    navigator.clipboard?.writeText(contact.value);
  };

  return (
    <div className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title">
      <button className="contact-backdrop" type="button" aria-label="关闭弹窗" onClick={onClose} />
      <div className="contact-card">
        <button className="contact-close" type="button" aria-label="关闭弹窗" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">{contact.eyebrow}</p>
        <h3 id="contact-dialog-title">{contact.title}</h3>
        <p className="contact-value">{contact.value}</p>
        <div className="contact-actions">
          <button className="button primary" type="button" onClick={copyValue}>
            复制
          </button>
          <button className="button secondary" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage({ activeProject, content, setSelected }) {
  const [contact, setContact] = useState(null);
  const openEmail = () => setContact({
    eyebrow: 'Email',
    title: '我的邮箱',
    value: content.email,
  });
  const openPhone = () => setContact({
    eyebrow: 'Phone',
    title: '我的电话',
    value: content.phone,
  });

  return (
    <>
      <Nav />
      <main id="top" style={{ '--accent': content.accent, '--hero-text': content.textColor }}>
        <section className="hero">
          <div
            className="hero-bg"
            aria-hidden="true"
            style={{ backgroundImage: `url("${content.heroImage}")` }}
          />
          <div className="hero-light" aria-hidden="true" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <SlideIn className="eyebrow" delay={120}>
              Visual Designer / AI Designer / Brand Designer
            </SlideIn>
            <h1>
              <SplitText text={content.heroTitle} />
            </h1>
            <SlideIn as="p" className="lead" delay={520}>
              {content.heroLead}
            </SlideIn>
            <SlideIn className="actions" delay={760}>
              <a className="button primary" href={appHref('#work')}>查看作品</a>
            </SlideIn>
          </div>
        </section>

        <section className="profile section" id="profile">
          <SlideIn>
            <p className="eyebrow">Profile</p>
            <h2>视觉设计师，正在把 AI 变成稳定的设计生产力。</h2>
            <p>{content.intro}</p>
            <button className="text-link contact-text-button" type="button" onClick={openEmail}>
              {content.email}
            </button>
          </SlideIn>
          <SlideIn as="img" src={content.portrait} alt="设计师人物视觉" delay={140} />
          <SlideIn className="metrics" aria-label="项目数据" delay={220}>
            <strong>36+</strong><span>商业项目</span>
            <strong>12</strong><span>品牌系统</span>
            <strong>{content.projects.length}</strong><span>精选作品</span>
          </SlideIn>
        </section>

        <section className="section" id="work">
          <div className="section-head">
            <p className="eyebrow">Selected Work</p>
            <h2>精选项目。</h2>
          </div>
          <div className="project-grid">
            {content.projects.map((project, index) => (
              <a
                className="project"
                href={appHref('#portfolio')}
                key={`${project.title}-${index}`}
                draggable="false"
                onClick={(event) => {
                  setSelected(index);
                }}
              >
                <ProjectCover project={project} />
                <div>
                  <p>{project.type}</p>
                  <h3>{project.title}</h3>
                  <span>{project.copy}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="portfolio section" id="portfolio">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2>{activeProject.title}</h2>
            <p>{activeProject.copy}</p>
          </div>
          <ProjectMedia project={activeProject} />
        </section>

        <section className="advantages section">
          <div className="section-head">
            <p className="eyebrow">Advantages</p>
            <h2>{content.advantagesTitle}</h2>
          </div>
          <div className="strength-grid">
            {content.strengths.map((item) => (
              <article className="strength" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" id="contact">
          <p className="eyebrow">{content.closingEyebrow}</p>
          <h2>{content.closingTitle}</h2>
          <div className="actions">
            <button className="button primary" type="button" onClick={openEmail}>
              发送邮件
            </button>
            <button className="button secondary" type="button" onClick={openPhone}>
              电话沟通
            </button>
          </div>
        </section>
      </main>
      <ContactDialog contact={contact} onClose={() => setContact(null)} />
    </>
  );
}

function EditorPage({
  addProject,
  content,
  deleteProject,
  draftProject,
  saveError,
  setDraftProject,
  update,
  updateProject,
  updateStrength,
}) {
  const [syncSettings, setSyncSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('github-sync-settings')) || {};
      return {
        owner: '',
        repo: 'personal-portfolio-display',
        branch: 'main',
        ...saved,
        token: '',
      };
    } catch {
      return {
        owner: '',
        repo: 'personal-portfolio-display',
        branch: 'main',
        token: '',
      };
    }
  });
  const [syncState, setSyncState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const { token, ...safeSettings } = syncSettings;
    localStorage.setItem('github-sync-settings', JSON.stringify(safeSettings));
  }, [syncSettings.owner, syncSettings.repo, syncSettings.branch]);

  const updateSyncSetting = (key, value) => {
    setSyncSettings((current) => ({ ...current, [key]: value }));
  };

  const publishOnline = async () => {
    setSyncState({ status: 'working', message: '正在准备同步上线...' });
    try {
      await syncContentToGitHub(syncSettings, content, (message) => {
        setSyncState({ status: 'working', message });
      });
      setSyncState({
        status: 'success',
        message: '已同步到 GitHub。等待 Actions 部署完成后，线上网页会自动更新。',
      });
    } catch (error) {
      setSyncState({
        status: 'error',
        message: error?.message || '同步失败，请检查仓库、分支和 Token 权限。',
      });
    }
  };

  return (
    <>
      <Nav editor />
      <main className="editor-page" style={{ '--accent': content.accent }}>
        <section className="editor section" id="editor">
          <div className="section-head">
            <p className="eyebrow">Editor</p>
            <h2>编辑内容。</h2>
          </div>
          {saveError && <p className="editor-alert">{saveError}</p>}
          <div className="editor-grid">
            <label>
              首页标题
              <textarea value={content.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} />
            </label>
            <label>
              首页说明
              <textarea value={content.heroLead} onChange={(e) => update('heroLead', e.target.value)} />
            </label>
            <label>
              个人介绍
              <textarea value={content.intro} onChange={(e) => update('intro', e.target.value)} />
            </label>
            <label>
              邮箱
              <input value={content.email} onChange={(e) => update('email', e.target.value)} />
            </label>
            <label>
              电话
              <input value={content.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
            <label>
              主色
              <input type="color" value={content.accent} onChange={(e) => update('accent', e.target.value)} />
            </label>
            <label>
              首页文字颜色
              <input type="color" value={content.textColor} onChange={(e) => update('textColor', e.target.value)} />
            </label>
            <label>
              替换首页背景
              <input type="file" accept="image/*" onChange={(e) => readFile(e.target.files[0], (file) => update('heroImage', file.image))} />
            </label>
            <label>
              替换头像
              <input type="file" accept="image/*" onChange={(e) => readFile(e.target.files[0], (file) => update('portrait', file.image))} />
            </label>
          </div>

          <div className="project-editor">
            {content.projects.map((project, index) => (
              <article key={`${project.title}-edit-${index}`}>
                <ProjectCover project={project} />
                <small>封面图片</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    readImageAsset(file, (cover) => updateProject(index, { cover }));
                  }}
                />
                <input value={project.title} onChange={(e) => updateProject(index, { title: e.target.value })} />
                <input value={project.type} onChange={(e) => updateProject(index, { type: e.target.value })} />
                <textarea value={project.copy} onChange={(e) => updateProject(index, { copy: e.target.value })} />
                <small>作品文件（图片追加最多 32 张 / PDF 单文件替换）</small>
                <p className="file-summary">
                  {project.fileType === 'pdf'
                    ? `PDF 文件 · ${project.pageCount || 1} 页`
                    : `${Math.max(1, project.images?.length || 1)} 张图片`}
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    e.target.value = '';
                    readProjectFiles(files, (file) => {
                      if (file.fileType === 'pdf') {
                        updateProject(index, file);
                        return;
                      }
                      const currentImages = project.fileType === 'pdf'
                        ? []
                        : (project.images?.length ? project.images : [project.image].filter(Boolean));
                      const images = [...currentImages, ...(file.images || [file.image])]
                        .filter(Boolean)
                        .slice(0, MAX_PROJECT_IMAGES);
                      updateProject(index, {
                        ...file,
                        image: images[0],
                        images,
                        fileType: images.length > 1 ? 'images' : 'image',
                      });
                    });
                  }}
                />
                <button className="button danger" type="button" onClick={() => deleteProject(index)}>
                  删除作品
                </button>
              </article>
            ))}
          </div>

          <div className="upload-box">
            <h3>上传新作品</h3>
            <input placeholder="作品名称" value={draftProject.title} onChange={(e) => setDraftProject({ ...draftProject, title: e.target.value })} />
            <input placeholder="作品类型" value={draftProject.type} onChange={(e) => setDraftProject({ ...draftProject, type: e.target.value })} />
            <textarea placeholder="作品说明" value={draftProject.copy} onChange={(e) => setDraftProject({ ...draftProject, copy: e.target.value })} />
            <small>封面图片</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                readImageAsset(file, (cover) => setDraftProject({ ...draftProject, cover }));
              }}
            />
            <small>作品文件（图片最多 32 张 / PDF 单文件）</small>
            <p className="file-summary">
              {draftProject.fileType === 'pdf'
                ? `PDF 文件 · ${draftProject.pageCount || 1} 页`
                : `${Math.max(0, draftProject.images?.length || (draftProject.image ? 1 : 0))} 张图片`}
            </p>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                e.target.value = '';
                readProjectFiles(files, (file) => setDraftProject({ ...draftProject, ...file }));
              }}
            />
            <button className="button primary" type="button" onClick={addProject}>添加作品</button>
          </div>

          <div className="editor-block">
            <div className="section-head">
              <p className="eyebrow">Advantages</p>
              <h3>优势模块</h3>
            </div>
            <label>
              模块标题
              <textarea
                value={content.advantagesTitle}
                onChange={(e) => update('advantagesTitle', e.target.value)}
              />
            </label>
            <div className="strength-editor">
              {content.strengths.map((item, index) => (
                <article key={`strength-edit-${index}`}>
                  <small>优势 {index + 1}</small>
                  <input
                    value={item.title}
                    onChange={(e) => updateStrength(index, { title: e.target.value })}
                  />
                  <textarea
                    value={item.copy}
                    onChange={(e) => updateStrength(index, { copy: e.target.value })}
                  />
                </article>
              ))}
            </div>
          </div>

          <div className="editor-block">
            <div className="section-head">
              <p className="eyebrow">Let’s Build</p>
              <h3>底部联系模块</h3>
            </div>
            <label>
              小标题
              <input
                value={content.closingEyebrow}
                onChange={(e) => update('closingEyebrow', e.target.value)}
              />
            </label>
            <label>
              主标题
              <textarea
                value={content.closingTitle}
                onChange={(e) => update('closingTitle', e.target.value)}
              />
            </label>
            <label>
              弹出邮箱
              <input value={content.email} onChange={(e) => update('email', e.target.value)} />
            </label>
            <label>
              弹出电话
              <input value={content.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
          </div>

          <div className="editor-block sync-panel">
            <div className="section-head">
              <p className="eyebrow">Online Sync</p>
              <h3>同步上线</h3>
            </div>
            <p className="sync-note">
              将当前编辑内容、封面、作品图片和 PDF 写入 GitHub 仓库，随后由 GitHub Pages 自动部署成线上版本。
            </p>
            <div className="sync-grid">
              <label>
                GitHub 用户名或组织
                <input
                  placeholder="例如 lv5291948-hue"
                  value={syncSettings.owner}
                  onChange={(e) => updateSyncSetting('owner', e.target.value)}
                />
              </label>
              <label>
                仓库名
                <input
                  placeholder="personal-portfolio-display"
                  value={syncSettings.repo}
                  onChange={(e) => updateSyncSetting('repo', e.target.value)}
                />
              </label>
              <label>
                分支
                <input
                  placeholder="main"
                  value={syncSettings.branch}
                  onChange={(e) => updateSyncSetting('branch', e.target.value)}
                />
              </label>
              <label>
                GitHub Token
                <input
                  autoComplete="off"
                  placeholder="只在本次同步中使用，不会保存"
                  type="password"
                  value={syncSettings.token}
                  onChange={(e) => updateSyncSetting('token', e.target.value)}
                />
              </label>
            </div>
            <p className="file-summary">
              Token 需要当前仓库 Contents 读写权限。同步成功后，到 GitHub 仓库 Actions 等待部署完成。
            </p>
            <button
              className="button primary"
              disabled={syncState.status === 'working'}
              type="button"
              onClick={publishOnline}
            >
              {syncState.status === 'working' ? '同步中...' : '同步上线'}
            </button>
            {syncState.message && (
              <p className={`sync-status ${syncState.status}`}>
                {syncState.message}
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
