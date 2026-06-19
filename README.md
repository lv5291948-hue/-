# 个人项目网页展示

个人作品集网站，基于 React + Vite 构建，支持编辑内容、上传作品、PDF 单页预览、联系弹窗和 GitHub Pages 在线同步更新。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 编辑后同步上线

进入 `/editor`，输入编辑页密码后，在页面底部填写 GitHub 用户名、仓库名、分支和 Token，点击“同步上线”。Token 需要当前仓库 `Contents` 读写权限；同步成功后等待 GitHub Actions 部署完成即可看到线上更新。
