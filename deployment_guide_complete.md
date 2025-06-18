# 黄土高原水土保持与生态文明建设案例库项目部署指南

**版本**: 1.0  
**最后更新**: 2025-06-18

---

## 文档概述

本指南详细介绍了如何部署“黄土高原水土保持与生态文明建设案例库”项目。该项目采用现代化的云原生技术栈，实现了前后端分离、AI功能深度集成和自动化部署。

### 技术架构概览
- **前端**: React 18 + TypeScript + Vite，托管于 **GitHub Pages**。
- **后端服务**: 直接集成 **Supabase** (数据库, 认证, 存储) 和各大 **AI服务商 API**。
- **部署流程**: 通过 **GitHub Actions** 实现自动化构建和部署。

---

## 1. 前期准备

在开始部署之前，请确保您已完成以下准备工作。

### 1.1 系统要求
- **Node.js**: `v18.0.0` 或更高版本。
- **pnpm**: `v8.0.0` 或更高版本。推荐使用 `pnpm` 作为包管理器，因为它在项目中被使用。
- **Git**: 最新版本。
- **操作系统**: macOS, Windows (使用 WSL2), 或 Linux。

### 1.2 账号注册
您需要注册以下平台的账号，并获取相应的访问权限和API密钥：

| 服务平台 | 用途 | 注册链接 |
| :--- | :--- | :--- |
| **GitHub** | 代码托管、GitHub Actions CI/CD、前端托管 (GitHub Pages) | [https://github.com](https://github.com) |
| **Supabase** | 数据库、对象存储、用户认证 | [https://supabase.com](https://supabase.com) |
| **Vercel** | (可选，用于后端API) | [https://vercel.com](https://vercel.com) |
| **OpenAI** | AI内容生成、图片生成 | [https://platform.openai.com](https://platform.openai.com) |
| **百度AI开放平台** | (备用) AI内容生成 | [https://ai.baidu.com](https://ai.baidu.com) |
| **Unsplash / Pexels** | AI图片搜索 | [https://unsplash.com/developers](https://unsplash.com/developers) / [https://www.pexels.com/api/](https://www.pexels.com/api/) |

### 1.3 开发环境设置
1.  **安装 pnpm**: 如果您尚未安装 pnpm，请运行以下命令：
    ```bash
    npm install -g pnpm
    ```
2.  **配置 Git**: 确保您的 Git 已正确配置用户名和邮箱。
    ```bash
    git config --global user.name "Your Name"
    git config --global user.email "you@example.com"
    ```

---

## 2. 项目代码获取和配置

### 2.1 获取代码
克隆项目代码到您的本地计算机：
```bash
git clone https://github.com/your-username/loess-plateau-case-database.git
cd loess-plateau-case-database
```

### 2.2 安装依赖
使用 `pnpm` 安装项目所需的所有依赖项。
```bash
pnpm install
```
此命令将根据 `pnpm-lock.yaml` 文件安装精确版本的依赖，确保环境一致性。

### 2.3 环境变量配置
环境变量用于存储敏感信息，如API密钥和数据库连接信息。

1.  **创建 `.env` 文件**: 复制环境变量示例文件 `.env.example` 并重命名为 `.env`。
    ```bash
    cp .env.example .env
    ```

2.  **配置环境变量**: 打开 `.env` 文件，并填入您在“前期准备”阶段获取到的真实值。

    ```dotenv
    # .env

    # Supabase 配置
    # 从 Supabase 项目的 API 设置中获取
    VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
    VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

    # AI 服务 API 密钥
    # 注意：这些密钥将暴露在前端，建议通过后端代理调用以保证安全
    VITE_OPENAI_API_KEY="sk-..."
    VITE_BAIDU_APP_ID="your-baidu-app-id"
    VITE_BAIDU_API_KEY="your-baidu-api-key"
    VITE_BAIDU_SECRET_KEY="your-baidu-secret-key"
    VITE_UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
    VITE_PEXELS_API_KEY="your-pexels-api-key"

    # 应用基础 URL
    VITE_APP_BASE_URL="/loess-plateau-case-database/"
    ```

    **重要安全提示**: `VITE_` 前缀的环境变量会直接暴露在前端客户端代码中。对于生产环境，强烈建议创建一个简单的后端代理（例如使用 Vercel Serverless Functions）来调用AI服务，将API密钥安全地存储在后端。

---

## 3. 数据库部署 (Supabase)

### 3.1 创建 Supabase 项目
1.  登录 [Supabase 仪表盘](https://app.supabase.com/)。
2.  点击 "New project" 创建一个新项目。
3.  设置项目名称，生成一个安全的数据库密码并妥善保管。
4.  选择离您用户最近的区域 (Region)，例如 `Asia Pacific (Singapore)`。
5.  等待项目初始化完成（大约需要2分钟）。

### 3.2 数据库初始化
1.  进入项目主页，在左侧导航栏找到 `SQL Editor`。
2.  点击 `New query` 创建一个新的查询。
3.  将项目文件 `docs/supabase_setup.sql` 中的全部内容复制并粘贴到 SQL 编辑器中。
4.  点击 `RUN` 按钮执行脚本。这将完成以下操作：
    - 创建 `categories`, `cases`, `case_images`, `ai_generations` 等核心数据表。
    - 创建所需的 PostgreSQL 扩展（如 `pgvector`）。
    - 插入初始的分类数据和示例案例。
    - 设置数据库函数和触发器。

### 3.3 行级安全 (Row Level Security - RLS)
为了保护数据安全，项目已默认启用了RLS策略。
1.  在 `SQL Editor` 中执行的 `supabase_setup.sql` 脚本已包含创建RLS策略的语句。
2.  您可以访问 `Authentication` -> `Policies` 页面，检查并确认 `cases`, `case_images` 等表已成功启用RLS并附加了相应的策略。
    - **例如**: `Published cases are viewable by everyone` 策略确保了只有状态为 `published` 的案例才能被公开访问。

### 3.4 存储桶 (Storage) 设置
项目使用 Supabase Storage 存储案例相关的图片。
1.  在左侧导航栏进入 `Storage`。
2.  点击 `New Bucket` 创建一个新的存储桶。
3.  **存储桶名称**: `case-images`。
4.  **访问权限**: 将其设置为**公开 (Public)**，以便图片可以在网页上直接访问。
5.  创建完成后，您可以进入 `Storage` -> `Policies` 为该存储桶设置更精细的访问策略，例如只允许认证用户上传图片。

---

## 4. AI 服务配置

### 4.1 获取 API 密钥
根据您在 `.env` 文件中看到的变量，前往各自的AI服务商平台获取密钥。

- **OpenAI**: 前往 [API keys](https://platform.openai.com/api-keys) 页面创建新的 Secret Key。
- **百度AI**: 登录百度智能云控制台，进入 "文心一言" 服务，创建应用并获取 AppID, API Key, Secret Key。
- **Unsplash / Pexels**: 登录开发者门户，创建应用并获取 Access Key。

### 4.2 填入环境变量
将获取到的所有密钥填入您本地的 `.env` 文件中对应的变量。

### 4.3 测试 AI 功能
在本地运行项目，并测试所有AI功能是否正常工作：
```bash
pnpm dev
```
- 测试内容生成、图片生成和图片搜索功能，确保API调用成功。
- 检查浏览器开发者工具的网络(Network)和控制台(Console)选项卡，排查潜在的API错误。

---

## 5. 前端部署 (GitHub Pages)

### 5.1 GitHub 仓库设置
1.  **创建仓库**: 在 GitHub 上创建一个新的公开仓库，例如 `loess-plateau-case-database`。
2.  **推送代码**: 将您的本地代码推送到该仓库。
    ```bash
    git remote add origin https://github.com/your-username/loess-plateau-case-database.git
    git branch -M main
    git push -u origin main
    ```

### 5.2 GitHub Actions 配置
1.  **设置 Secrets**: 为了在部署时安全地使用环境变量，需要将它们添加到GitHub仓库的Secrets中。
    - 进入仓库的 `Settings` -> `Secrets and variables` -> `Actions`。
    - 点击 `New repository secret`，依次添加以下 **所有** 在 `.env` 文件中以 `VITE_` 开头的变量和对应的值。
        - `VITE_SUPABASE_URL`
        - `VITE_SUPABASE_ANON_KEY`
        - `VITE_OPENAI_API_KEY`
        - (以及其他所有AI相关的密钥)

2.  **创建 Workflow 文件**:
    - 在项目根目录下创建 `.github/workflows/deploy.yml` 文件。
    - 将以下内容粘贴到文件中：

    ```yaml
    # .github/workflows/deploy.yml

    name: Deploy to GitHub Pages

    on:
      push:
        branches:
          - main # 只在 main 分支被推送时触发
      workflow_dispatch: # 允许手动触发

    # 指定工作流的权限
    permissions:
      contents: read
      pages: write
      id-token: write

    # 设置并发控制，防止多个工作流同时运行
    concurrency:
      group: "pages"
      cancel-in-progress: true

    jobs:
      deploy:
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4
          
          - name: Set up pnpm
            uses: pnpm/action-setup@v2
            with:
              version: 8

          - name: Set up Node.js
            uses: actions/setup-node@v4
            with:
              node-version: "18"
              cache: "pnpm"

          - name: Install dependencies
            run: pnpm install --frozen-lockfile

          - name: Build
            run: pnpm build
            env:
              # 引用 GitHub Secrets
              VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
              VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
              VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
              VITE_BAIDU_APP_ID: ${{ secrets.VITE_BAIDU_APP_ID }}
              VITE_BAIDU_API_KEY: ${{ secrets.VITE_BAIDU_API_KEY }}
              VITE_BAIDU_SECRET_KEY: ${{ secrets.VITE_BAIDU_SECRET_KEY }}
              VITE_UNSPLASH_ACCESS_KEY: ${{ secrets.VITE_UNSPLASH_ACCESS_KEY }}
              VITE_PEXELS_API_KEY: ${{ secrets.VITE_PEXELS_API_KEY }}
              VITE_APP_BASE_URL: /${{ github.event.repository.name }}/ # 自动设置基础路径

          - name: Setup Pages
            uses: actions/configure-pages@v4

          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: './dist'

          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```

### 5.3 启用 GitHub Pages
1.  进入仓库的 `Settings` -> `Pages`。
2.  在 `Build and deployment` -> `Source` 下拉菜单中，选择 `GitHub Actions`。
3.  将代码推送到 `main` 分支，部署工作流将自动运行。成功后，您将在此页面看到您的网站URL。

### 5.4 自定义域名 (可选)
1.  在 `Settings` -> `Pages` -> `Custom domain` 中输入您的域名。
2.  根据提示在您的域名提供商处配置 CNAME 或 A 记录。

---

## 6. 后端 API 部署 (说明)

本项目当前的架构**不包含独立部署的后端API层** (如 Vercel Functions)。前端应用直接与 Supabase 和 AI 服务商的 API进行通信。

**优势**:
- 部署简单，成本低。

**风险与建议**:
- **安全风险**: 将AI服务的API密钥直接暴露在前端是不安全的。
- **改进建议**: 为了提高安全性，建议在未来创建一个后端代理。
    - **方案**: 使用 **Vercel Serverless Functions** 或 **Cloudflare Workers**。
    - **流程**:
        1.  创建一个API路由，例如 `/api/ai/generate`。
        2.  前端将请求发送到此路由。
        3.  该后端函数安全地持有API密钥，并代表前端调用真正的AI服务。
        4.  这样可以避免将密钥暴露在客户端。

---

## 7. 系统集成测试

部署完成后，进行全面的系统测试。

### 7.1 功能测试清单
- [ ] **用户认证**: 注册、登录、登出功能正常。
- [ ] **案例库**: 案例列表、详情页、搜索和筛选功能正常。
- [ ] **AI内容生成**: 可以成功生成案例描述、分析等。
- [ ] **AI图片搜索**: 可以根据关键词搜索并展示图片。
- [ ] **AI图片生成**: 可以根据提示词生成图片。
- [ ] **后台管理**: (如果适用) 案例的增、删、改、查功能正常。
- [ ] **响应式布局**: 在桌面、平板和移动设备上显示正常。

### 7.2 性能测试
- 使用 **Google Lighthouse** 检查性能、可访问性、最佳实践和SEO分数。
- 检查关键页面的加载速度，特别是图片较多的页面。
- 检查AI功能调用的响应时间。

### 7.3 安全检查
- 确认 GitHub Pages 已启用 HTTPS。
- 检查 Supabase 的 RLS 策略是否按预期工作，防止未授权的数据访问。
- 确认存储桶的访问策略是否正确配置。
- **强烈建议**：检查浏览器开发者工具，确认没有将除 `VITE_` 变量外的任何敏感信息暴露在前端。

---

## 8. 运维和维护

### 8.1 监控配置
- **Supabase**: 利用其内置的仪表盘监控数据库性能、API调用次数和存储使用情况。
- **Vercel/Netlify**: (如果使用) 利用其分析工具监控前端流量和性能。
- **AI服务商**: 在各自的平台监控API调用次数和费用。

### 8.2 备份策略
- **Supabase**: 默认提供每日自动备份（根据您的套餐），您也可以在仪表盘手动创建备份。建议定期下载备份并存储在安全的位置。

### 8.3 更新流程
1.  在本地完成新功能开发或修复。
2.  将代码推送到 `main` 分支。
3.  GitHub Actions 将自动完成构建和部署流程。
4.  部署后，验证线上功能是否正常。

### 8.4 成本管理
- 定期检查 Supabase 和 AI 服务商的账单和用量，防止意外的费用超支。
- 为AI服务设置消费上限或预警通知。

---

## 9. 常见问题和解决方案

### Q1: 部署后图片或CSS样式无法加载？
- **原因**: 路径配置错误。
- **解决方案**: 检查 `vite.config.ts` 中的 `base` 选项是否正确设置为您的仓库名称，例如 `/your-repo-name/`。本指南提供的 `deploy.yml` 工作流会自动处理此问题。

### Q2: AI API 调用返回 401 Unauthorized 错误？
- **原因**: API 密钥无效或未正确配置。
- **解决方案**:
    1.  确认 `.env` 文件中的密钥是否正确。
    2.  检查 GitHub Secrets 中存储的密钥是否与您的本地密钥一致。
    3.  确认您的AI服务商账户是否有效，以及账单是否正常。

### Q3: Supabase 查询返回空数据或权限错误？
- **原因**: RLS 策略阻止了数据访问。
- **解决方案**:
    1.  检查浏览器的网络请求，查看 Supabase 返回的具体错误信息。
    2.  在 Supabase `SQL Editor` 中，使用 `SET ROLE authenticated;` 和 `SELECT * FROM cases;` 来模拟认证用户的查询，以调试RLS策略。
    3.  确保您的查询满足RLS策略中定义的条件。

### Q4: GitHub Actions 部署失败？
- **原因**: 依赖安装失败、构建错误或环境变量缺失。
- **解决方案**:
    1.  点击失败的 `deploy` 工作流，查看详细的日志输出。
    2.  检查是否所有的 Secrets 都已在仓库中正确设置。
    3.  在本地运行 `pnpm build`，确保项目可以成功构建。

---

## 10. 扩展和定制

### 10.1 功能扩展指南
- **添加新页面**: 在 `src/pages` 目录下创建新的组件，并在路由配置中添加新路径。
- **添加新AI服务**:
    1.  在 `src/services/ai.ts` 中添加新的服务调用逻辑。
    2.  在 `.env` 文件中添加新的API密钥环境变量。
    3.  在 `src/components/AI` 目录下创建新的UI组件。

### 10.2 二次开发建议
- **安全增强**: 优先将AI API调用迁移到安全的后端代理（如 Vercel Functions）。
- **状态管理**: 对于更复杂的应用状态，可以引入 `Pinia` 或 `Redux Toolkit` 等状态管理库。
- **组件库**: 持续完善 `src/components/ui` 中的通用组件，提高开发效率。

---
本部署指南到此结束。祝您部署顺利！
