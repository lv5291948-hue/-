# 个人网页上传到 GitHub 并上线教程

这个文件夹已经放好了完整项目代码，可以直接上传到 GitHub。

## 一、你现在拥有的文件

- `src/`：网页主要代码
- `public/`：图片资源
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署配置
- `package.json`：项目命令和依赖
- `vite.config.js`：GitHub Pages 兼容配置
- `README.md`：项目说明

## 二、推荐方式：用 GitHub Desktop 上传

你的电脑已经安装了 GitHub Desktop，推荐使用这个方式。

1. 打开 GitHub Desktop。
2. 点击顶部菜单 `File`。
3. 点击 `Add local repository...`。
4. 选择这个文件夹：

   ```text
   C:\个人网页
   ```

5. 如果提示这是一个 Git 仓库，直接确认添加。
6. 点击右上角或中间的 `Publish repository`。
7. 仓库名称填写：

   ```text
   个人项目网页展示
   ```

   如果 GitHub 提示中文名称不可用，建议改成：

   ```text
   personal-portfolio-display
   ```

8. Description 可以填写：

   ```text
   个人项目网页展示
   ```

9. 如果你希望别人能访问网页，取消勾选 `Keep this code private`。
10. 点击 `Publish repository`。

## 三、开启 GitHub Pages

上传完成后，浏览器打开你的 GitHub 仓库页面。

1. 进入仓库的 `Settings`。
2. 左侧找到 `Pages`。
3. 在 `Build and deployment` 里，把 `Source` 选择为：

   ```text
   GitHub Actions
   ```

4. 回到仓库顶部的 `Actions`。
5. 等待 `Deploy to GitHub Pages` 运行完成，显示绿色对勾。
6. 再回到 `Settings > Pages`，会看到公开网页地址。

常见地址格式是：

```text
https://你的用户名.github.io/仓库名/
```

如果仓库名用 `personal-portfolio-display`，地址类似：

```text
https://lv5291948-hue.github.io/personal-portfolio-display/
```

## 四、以后怎么更新代码

1. 回到这个文件夹修改代码或内容：

   ```text
   C:\个人网页
   ```

2. 在 GitHub Desktop 里会看到修改记录。
3. 左下角填写提交说明，例如：

   ```text
   更新作品集内容
   ```

4. 点击 `Commit to main`。
5. 点击 `Push origin`。
6. GitHub Actions 会自动重新部署网页。

## 五、编辑页直接同步上线

这个方式适合日常改文字、换图片、上传作品和 PDF，不需要每次打开代码。

1. 打开你的线上网页。
2. 进入编辑页：

   ```text
   https://你的用户名.github.io/仓库名/editor
   ```

3. 输入编辑页密码：

   ```text
   LvHaiTao19990724
   ```

4. 修改文字、颜色、封面、作品图片或 PDF。
5. 滑到编辑页底部的 `同步上线`。
6. 填写 GitHub 用户名、仓库名和分支。分支一般是：

   ```text
   main
   ```

7. 填写 GitHub Token。

Token 创建方式：

1. 打开 GitHub，进入 `Settings`。
2. 进入 `Developer settings`。
3. 进入 `Personal access tokens`。
4. 推荐选择 `Fine-grained tokens`。
5. 只选择你的网页仓库。
6. 权限里把 `Repository permissions > Contents` 设置为 `Read and write`。
7. 生成 Token 后复制，粘贴到编辑页的 `GitHub Token` 输入框。

注意：Token 不会保存在网页里，只用于这一次同步。不要把 Token 发给别人。

点击 `同步上线` 后，网页会把当前内容写入仓库的：

```text
public/data/content.json
public/data/assets/
```

同步成功后，到 GitHub 仓库的 `Actions` 页面等待部署完成，线上网页会自动更新。

## 六、命令行方式，可选

如果你安装了 GitHub CLI，也可以用命令行上传：

```bash
cd /d C:\个人网页
gh auth login
gh repo create personal-portfolio-display --public --source . --remote origin --push
```

然后到 GitHub 仓库的 `Settings > Pages`，选择 `GitHub Actions`。

## 七、注意

- 不要上传 `node_modules`，项目已经通过 `.gitignore` 排除了。
- `dist` 不需要手动上传，GitHub Actions 会自动构建。
- 日常只改作品内容时，优先用编辑页底部的 `同步上线`。
- 编辑页密码是：

  ```text
  LvHaiTao19990724
  ```
