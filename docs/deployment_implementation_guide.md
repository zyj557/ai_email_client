# 黄土高原案例库项目部署实施指南

## 1. 部署概述

### 1.1 部署架构
本项目采用现代云服务架构，实现前后端分离部署：
- **前端**：Vue.js + GitHub Pages 
- **后端**：Node.js + Vercel Functions
- **数据库**：Supabase PostgreSQL
- **AI服务**：OpenAI API + 备用服务

### 1.2 部署流程
1. 环境准备和账户设置
2. 数据库初始化和配置
3. 前端项目构建和部署
4. 后端API开发和部署
5. AI服务集成和测试
6. 安全配置和监控设置
7. 测试验证和上线发布

## 2. 环境准备

### 2.1 必要账户注册
请依次注册以下服务账户：

| 服务 | 用途 | 注册链接 | 费用 |
|------|------|----------|------|
| GitHub | 代码管理和静态托管 | https://github.com | 免费 |
| Vercel | API托管和部署 | https://vercel.com | 免费额度 |
| Supabase | 数据库和认证 | https://supabase.com | 免费额度 |
| OpenAI | AI服务 | https://openai.com | 按使用量 |
| 百度AI | 备用AI服务 | https://ai.baidu.com | 按使用量 |

### 2.2 本地开发环境
确保本地环境具备以下工具：
```bash
# 检查Node.js版本（需要18+）
node --version

# 检查npm版本
npm --version

# 检查Git版本
git --version
```

## 3. 数据库初始化

### 3.1 Supabase项目创建
1. 登录Supabase控制台
2. 点击"New Project"创建项目
3. 选择组织和项目名称
4. 选择数据库区域（建议：Singapore）
5. 设置数据库密码（强密码）
6. 等待项目初始化完成

### 3.2 数据库Schema创建
在Supabase SQL编辑器中依次执行以下SQL：

#### 创建枚举类型
```sql
-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- 案例状态枚举  
CREATE TYPE case_status AS ENUM ('draft', 'published', 'archived');
```

#### 创建用户表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE,
    role user_role DEFAULT 'viewer',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### 创建分类表
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR,
    color VARCHAR,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

#### 创建案例表
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    description TEXT,
    content JSONB,
    category VARCHAR,
    tags TEXT[],
    location JSONB,
    project_scale VARCHAR,
    investment_amount DECIMAL,
    implementation_period JSONB,
    status case_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_featured ON cases(featured);
CREATE INDEX idx_cases_published_at ON cases(published_at);
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);
```

#### 创建图片表
```sql
CREATE TABLE case_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    file_size INTEGER,
    dimensions JSONB,
    is_cover BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_case_images_case_id ON case_images(case_id);
CREATE INDEX idx_case_images_sort_order ON case_images(sort_order);
```

### 3.3 安全策略配置
```sql
-- 启用Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_images ENABLE ROW LEVEL SECURITY;

-- 用户访问策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 案例访问策略
CREATE POLICY "Published cases are viewable by everyone" ON cases
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own cases" ON cases
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Editors can manage cases" ON cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );
```

### 3.4 初始数据插入
```sql
-- 插入默认分类
INSERT INTO categories (name, slug, description, icon, color) VALUES
('水土保持', 'water-conservation', '水土流失治理相关案例', 'fas fa-tint', '#4A90E2'),
('生态修复', 'ecological-restoration', '生态环境修复案例', 'fas fa-leaf', '#7ED321'),
('退耕还林', 'reforestation', '退耕还林还草案例', 'fas fa-tree', '#50E3C2'),
('小流域治理', 'watershed-management', '小流域综合治理案例', 'fas fa-water', '#B8E986'),
('生态农业', 'ecological-agriculture', '生态农业发展案例', 'fas fa-seedling', '#F5A623');
```

## 4. 前端项目部署

### 4.1 创建Vue项目
```bash
# 创建项目
npm create vue@latest loess-plateau-frontend

# 进入项目目录
cd loess-plateau-frontend

# 安装基础依赖
npm install

# 安装项目特定依赖
npm install @supabase/supabase-js pinia vue-router
npm install bootstrap @fortawesome/fontawesome-free
npm install chart.js vue-chartjs
npm install @vueuse/core
```

### 4.2 项目配置

#### Vite配置 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})
```

#### 环境变量配置
创建 `.env.local` 文件：
```bash
# Supabase配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API配置
VITE_API_BASE_URL=https://your-project.vercel.app/api
```

### 4.3 GitHub Actions部署配置
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4.4 GitHub Pages配置
1. 在GitHub仓库设置中启用Pages
2. 选择GitHub Actions作为部署源
3. 配置自定义域名（可选）
4. 启用HTTPS强制

## 5. 后端API部署

### 5.1 Vercel项目创建
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 在项目根目录初始化
vercel

# 按提示配置项目
```

### 5.2 API项目结构
```
api/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   └── refresh.ts
├── cases/
│   ├── index.ts      # GET /api/cases - 案例列表
│   ├── [id].ts       # GET /api/cases/[id] - 案例详情
│   ├── create.ts     # POST /api/cases/create - 创建案例
│   ├── update.ts     # PUT /api/cases/update - 更新案例
│   └── delete.ts     # DELETE /api/cases/delete - 删除案例
├── upload/
│   ├── image.ts      # POST /api/upload/image - 图片上传
│   └── file.ts       # POST /api/upload/file - 文件上传
├── ai/
│   ├── search.ts     # POST /api/ai/search - AI搜索
│   ├── images/
│   │   ├── search.ts # POST /api/ai/images/search - 图片搜索
│   │   └── generate.ts # POST /api/ai/images/generate - 图片生成
│   ├── content/
│   │   ├── generate.ts # POST /api/ai/content/generate - 内容生成
│   │   └── analyze.ts  # POST /api/ai/content/analyze - 内容分析
│   └── chat/
│       └── assistant.ts # POST /api/ai/chat/assistant - 智能助手
└── utils/
    ├── supabase.ts   # Supabase客户端
    ├── auth.ts       # 认证中间件
    ├── validation.ts # 数据验证
    └── errors.ts     # 错误处理
```

### 5.3 Vercel配置文件
创建 `vercel.json`：
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "BAIDU_API_KEY": "@baidu-api-key",
    "STABILITY_API_KEY": "@stability-api-key"
  },
  "build": {
    "env": {
      "NPM_FLAGS": "--production=false"
    }
  }
}
```

### 5.4 环境变量配置
在Vercel项目设置中添加环境变量：
```bash
# 必需的环境变量
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
BAIDU_API_KEY=your_baidu_api_key
STABILITY_API_KEY=your_stability_api_key
JWT_SECRET=your_jwt_secret
```

## 6. AI服务集成

### 6.1 OpenAI配置
1. 注册OpenAI账户并完成验证
2. 添加付费方式（信用卡）
3. 生成API密钥
4. 设置使用限制和预算

### 6.2 AI服务包装器
创建 `api/utils/ai-services.ts`：
```typescript
import OpenAI from 'openai';

class AIServiceManager {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('AI服务暂时不可用');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Embedding API Error:', error);
      throw new Error('向量生成失败');
    }
  }
}

export const aiService = new AIServiceManager();
```

## 7. 安全配置

### 7.1 Supabase认证设置
1. 在Supabase项目中配置认证设置
2. 启用邮箱认证
3. 配置OAuth提供商（Google, GitHub等）
4. 设置重定向URL
5. 配置JWT设置

### 7.2 API安全措施
```typescript
// api/utils/auth.ts
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export async function verifyToken(token: string) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid token');
    }

    return user;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}
```

### 7.3 限流配置
```typescript
// api/utils/rate-limit.ts
const rateLimitStore = new Map();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // 清除过期请求
  const validRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (validRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
}
```

## 8. 监控和分析

### 8.1 Vercel Analytics
```bash
# 安装Vercel Analytics
npm install @vercel/analytics
```

在 `main.ts` 中添加：
```typescript
import { inject } from '@vercel/analytics';

inject({
  debug: process.env.NODE_ENV === 'development'
});
```

### 8.2 错误监控 (Sentry)
```bash
# 安装Sentry
npm install @sentry/vue @sentry/tracing
```

配置Sentry：
```typescript
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## 9. 测试和验证

### 9.1 部署前检查清单
- [ ] 所有环境变量已正确配置
- [ ] 数据库连接测试通过
- [ ] API端点功能测试通过
- [ ] 前端构建无错误
- [ ] AI服务集成测试通过
- [ ] 认证流程测试通过
- [ ] 安全配置验证通过

### 9.2 功能测试
- [ ] 用户注册登录功能
- [ ] 案例浏览和搜索功能
- [ ] AI搜索功能
- [ ] 文件上传功能
- [ ] 后台管理功能
- [ ] 响应式布局测试
- [ ] 跨浏览器兼容性测试

### 9.3 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 1秒
- [ ] 搜索响应时间 < 2秒
- [ ] 图片加载优化
- [ ] 移动端性能测试

## 10. 上线发布

### 10.1 生产环境部署步骤
1. **代码合并到主分支**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **触发自动部署**
   - GitHub Actions自动构建前端
   - Vercel自动部署API

3. **域名配置**
   - 配置自定义域名
   - 设置SSL证书
   - 配置DNS解析

4. **最终验证**
   - 完整功能测试
   - 性能监控检查
   - 错误监控验证

### 10.2 上线后监控
- 实时监控系统状态
- 检查错误日志
- 监控API使用量
- 跟踪用户反馈

## 11. 维护和更新

### 11.1 日常维护
- 监控系统运行状态
- 检查AI服务使用量
- 备份重要数据
- 处理用户反馈

### 11.2 定期更新
- 依赖包安全更新
- 功能迭代发布
- 性能优化调整
- 安全策略更新

## 12. 故障排除

### 12.1 常见问题
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 构建失败 | 环境变量缺失 | 检查GitHub Secrets配置 |
| API无响应 | Vercel函数超时 | 优化代码性能，增加超时设置 |
| 数据库连接失败 | 连接字符串错误 | 验证Supabase配置 |
| AI服务调用失败 | API密钥无效 | 检查OpenAI账户状态 |

### 12.2 紧急处理流程
1. **快速定位问题**
   - 查看监控面板
   - 检查错误日志
   - 确认服务状态

2. **临时缓解措施**
   - 回滚到稳定版本
   - 切换到备用服务
   - 发布临时修复

3. **根本原因分析**
   - 详细问题分析
   - 制定修复方案
   - 实施永久修复

## 13. 总结

本部署指南提供了完整的黄土高原案例库项目部署流程，包括：

✅ **完整的环境配置** - 从账户注册到服务配置  
✅ **详细的部署步骤** - 前后端分离部署方案  
✅ **AI服务集成** - 多服务商策略和备用方案  
✅ **安全最佳实践** - 认证、授权和数据保护  
✅ **监控和维护** - 持续运营保障  

按照本指南操作，您可以成功部署一个现代化、高性能、AI驱动的案例库系统。

---

**文档版本**：v1.0  
**最后更新**：2025-06-18  
**维护人员**：MiniMax Agent  

## 附录

### 附录A：环境变量完整清单
```bash
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# AI服务配置
OPENAI_API_KEY=sk-...
BAIDU_API_KEY=your_baidu_key
BAIDU_SECRET_KEY=your_baidu_secret
STABILITY_API_KEY=sk-...

# 安全配置
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# 监控配置
SENTRY_DSN=https://...@sentry.io/...
VERCEL_ANALYTICS_ID=your_analytics_id
```

### 附录B：常用命令速查
```bash
# 本地开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果

# Vercel部署
vercel               # 部署到预览环境
vercel --prod        # 部署到生产环境
vercel logs          # 查看部署日志

# Git操作
git add .            # 暂存所有更改
git commit -m ""     # 提交更改
git push origin main # 推送到主分支
```

### 附录C：性能优化建议
1. **图片优化**：使用WebP格式，启用懒加载
2. **代码分割**：按路由和组件进行代码分割
3. **缓存策略**：合理设置浏览器和CDN缓存
4. **数据库优化**：创建适当索引，优化查询
5. **API优化**：实施响应压缩，使用连接池
