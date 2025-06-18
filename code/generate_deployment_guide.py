#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
部署实施指南生成器
生成完整的分步骤部署实施方案和配置指南
"""

import json
from datetime import datetime

def generate_deployment_guide():
    """生成完整的部署实施指南"""
    
    deployment_guide = {
        "environment_setup": generate_environment_setup(),
        "database_migration": generate_database_migration(),
        "frontend_deployment": generate_frontend_deployment(),
        "backend_deployment": generate_backend_deployment(),
        "ai_services_setup": generate_ai_services_setup(),
        "security_configuration": generate_security_configuration(),
        "monitoring_setup": generate_monitoring_setup(),
        "testing_checklist": generate_testing_checklist(),
        "maintenance_procedures": generate_maintenance_procedures()
    }
    
    # 保存部署指南
    with open('/workspace/data/deployment_guide.json', 'w', encoding='utf-8') as f:
        json.dump(deployment_guide, f, ensure_ascii=False, indent=2)
    
    # 生成部署指南文档
    generate_deployment_document(deployment_guide)
    
    return deployment_guide

def generate_environment_setup():
    """生成环境搭建指南"""
    return {
        "prerequisites": {
            "accounts_required": [
                "GitHub账户（用于代码管理和Pages部署）",
                "Vercel账户（用于API部署）",
                "Supabase账户（用于数据库服务）",
                "OpenAI账户（用于AI服务）",
                "百度AI账户（备用AI服务）"
            ],
            "local_environment": [
                "Node.js 18+",
                "npm或yarn包管理器",
                "Git版本控制",
                "VS Code或其他代码编辑器"
            ]
        },
        "repository_setup": {
            "github_repository": {
                "steps": [
                    "创建GitHub仓库：loess-plateau-case-library",
                    "设置仓库为公开（GitHub Pages需要）",
                    "启用GitHub Actions",
                    "配置分支保护规则"
                ],
                "branch_strategy": {
                    "main": "生产环境分支",
                    "develop": "开发环境分支",
                    "feature/*": "功能开发分支"
                }
            }
        },
        "vercel_setup": {
            "project_creation": [
                "登录Vercel控制台",
                "连接GitHub仓库",
                "配置构建设置",
                "设置环境变量"
            ],
            "build_configuration": {
                "framework": "Vue.js",
                "build_command": "npm run build",
                "output_directory": "dist",
                "install_command": "npm install"
            }
        },
        "supabase_setup": {
            "project_creation": [
                "创建Supabase项目",
                "选择数据库区域（建议：Singapore）",
                "配置数据库设置",
                "启用必要的扩展"
            ],
            "database_extensions": [
                "pgvector - 向量搜索支持",
                "uuid-ossp - UUID生成",
                "pg_stat_statements - 性能监控"
            ]
        }
    }

def generate_database_migration():
    """生成数据库迁移指南"""
    return {
        "database_schema": {
            "tables_creation": [
                {
                    "table": "users",
                    "sql": """
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE,
    role user_role DEFAULT 'viewer',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
                    """
                },
                {
                    "table": "categories",
                    "sql": """
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
                    """
                },
                {
                    "table": "cases",
                    "sql": """
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

-- 创建案例状态枚举
CREATE TYPE case_status AS ENUM ('draft', 'published', 'archived');

-- 创建索引
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_featured ON cases(featured);
CREATE INDEX idx_cases_published_at ON cases(published_at);
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);
                    """
                },
                {
                    "table": "case_images",
                    "sql": """
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
                    """
                }
            ]
        },
        "rls_policies": {
            "setup_instructions": [
                "启用Row Level Security",
                "创建安全策略",
                "配置用户权限",
                "测试访问控制"
            ],
            "policies": [
                {
                    "table": "users",
                    "policy": """
-- 用户只能查看自己的信息
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
                    """
                },
                {
                    "table": "cases",
                    "policy": """
-- 案例访问策略
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

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
                    """
                }
            ]
        },
        "data_seeding": {
            "initial_data": [
                {
                    "description": "创建默认分类",
                    "sql": """
INSERT INTO categories (name, slug, description, icon, color) VALUES
('水土保持', 'water-conservation', '水土流失治理相关案例', 'fas fa-tint', '#4A90E2'),
('生态修复', 'ecological-restoration', '生态环境修复案例', 'fas fa-leaf', '#7ED321'),
('退耕还林', 'reforestation', '退耕还林还草案例', 'fas fa-tree', '#50E3C2'),
('小流域治理', 'watershed-management', '小流域综合治理案例', 'fas fa-water', '#B8E986'),
('生态农业', 'ecological-agriculture', '生态农业发展案例', 'fas fa-seedling', '#F5A623');
                    """
                },
                {
                    "description": "创建管理员用户",
                    "sql": """
-- 注意：实际用户需要通过Supabase Auth创建
-- 这里只是示例数据结构
INSERT INTO users (email, username, role) VALUES
('admin@example.com', 'admin', 'admin'),
('editor@example.com', 'editor', 'editor');
                    """
                }
            ]
        }
    }

def generate_frontend_deployment():
    """生成前端部署指南"""
    return {
        "project_setup": {
            "vue_project_creation": [
                "使用Vite创建Vue项目",
                "配置TypeScript支持",
                "安装必要依赖",
                "配置开发环境"
            ],
            "commands": [
                "npm create vue@latest loess-plateau-frontend",
                "cd loess-plateau-frontend",
                "npm install",
                "npm install @supabase/supabase-js pinia vue-router",
                "npm install bootstrap @fortawesome/fontawesome-free",
                "npm install chart.js vue-chartjs"
            ]
        },
        "configuration_files": {
            "vite_config": {
                "file": "vite.config.ts",
                "content": """
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
                """
            },
            "env_config": {
                "file": ".env.example",
                "content": """
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel API配置
VITE_API_BASE_URL=https://your-project.vercel.app/api

# AI服务配置（前端不直接使用，通过API调用）
# OPENAI_API_KEY=your_openai_key (仅后端使用)
                """
            }
        },
        "github_actions": {
            "workflow_file": ".github/workflows/deploy.yml",
            "content": """
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
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
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
            """
        }
    }

def generate_backend_deployment():
    """生成后端部署指南"""
    return {
        "vercel_functions": {
            "project_structure": """
api/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   └── refresh.ts
├── cases/
│   ├── index.ts
│   ├── [id].ts
│   ├── create.ts
│   ├── update.ts
│   └── delete.ts
├── upload/
│   ├── image.ts
│   └── file.ts
├── ai/
│   ├── search.ts
│   ├── images/
│   │   ├── search.ts
│   │   └── generate.ts
│   ├── content/
│   │   ├── generate.ts
│   │   └── analyze.ts
│   └── chat/
│       └── assistant.ts
└── utils/
    ├── supabase.ts
    ├── auth.ts
    ├── validation.ts
    └── errors.ts
            """,
            "configuration_files": [
                {
                    "file": "vercel.json",
                    "content": """
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
                    """
                },
                {
                    "file": "package.json",
                    "content": """
{
  "name": "loess-plateau-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "build": "tsc",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "openai": "^4.20.0",
    "cors": "^2.8.5",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/cors": "^2.8.15",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.8",
    "typescript": "^5.2.0"
  }
}
                    """
                }
            ]
        },
        "api_examples": [
            {
                "file": "api/cases/index.ts",
                "description": "案例列表API",
                "content": """
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders, handleCors } from '../utils/cors';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return handleCors(req, res);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        search, 
        featured 
      } = req.query;

      let query = supabase
        .from('cases')
        .select(`
          id, title, subtitle, description, category, tags,
          location, featured, view_count, created_at, published_at,
          case_images(url, thumbnail_url, alt_text, is_cover)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // 应用筛选条件
      if (category) {
        query = query.eq('category', category);
      }
      
      if (featured === 'true') {
        query = query.eq('featured', true);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // 分页
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      res.status(200).json({
        data: data || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        },
        status: 'success'
      });

    } catch (error) {
      console.error('Cases API Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
                """
            }
        ]
    }

def generate_ai_services_setup():
    """生成AI服务配置指南"""
    return {
        "openai_setup": {
            "account_creation": [
                "注册OpenAI账户",
                "验证手机号和邮箱",
                "配置付费方式",
                "获取API密钥"
            ],
            "api_configuration": {
                "models_to_use": [
                    "gpt-4-turbo-preview (文本生成)",
                    "gpt-3.5-turbo (快速响应)",
                    "text-embedding-ada-002 (向量嵌入)",
                    "dall-e-3 (图像生成)"
                ],
                "rate_limits": {
                    "gpt-4": "40,000 TPM (Tokens Per Minute)",
                    "gpt-3.5-turbo": "90,000 TPM",
                    "embeddings": "1,000,000 TPM",
                    "dall-e-3": "5 images/minute"
                }
            }
        },
        "backup_services": {
            "baidu_ai": {
                "setup_steps": [
                    "注册百度智能云账户",
                    "开通文心一言服务",
                    "获取API Key和Secret Key",
                    "配置应用权限"
                ],
                "models": [
                    "ERNIE-Bot-turbo (文本生成)",
                    "ERNIE-ViLG (图像生成)"
                ]
            }
        },
        "api_integration": {
            "service_wrapper": {
                "file": "api/utils/ai-services.ts",
                "content": """
import OpenAI from 'openai';

interface AIServiceConfig {
  provider: 'openai' | 'baidu';
  apiKey: string;
  baseURL?: string;
}

class AIServiceManager {
  private openai: OpenAI;
  private fallbackServices: Map<string, any> = new Map();

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
      // 回退到备用服务
      return this.fallbackTextGeneration(prompt, options);
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

  async generateImage(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        n: 1,
      });

      return response.data[0]?.url || '';
    } catch (error) {
      console.error('Image Generation Error:', error);
      throw new Error('图像生成失败');
    }
  }

  private async fallbackTextGeneration(prompt: string, options: any): Promise<string> {
    // 实现百度AI等备用服务
    throw new Error('备用服务暂未实现');
  }
}

export const aiService = new AIServiceManager();
                """
            }
        }
    }

def generate_security_configuration():
    """生成安全配置指南"""
    return {
        "authentication_setup": {
            "supabase_auth": [
                "启用邮箱认证",
                "配置OAuth提供商",
                "设置JWT密钥",
                "配置重定向URL"
            ],
            "oauth_providers": {
                "google": {
                    "steps": [
                        "在Google Cloud Console创建OAuth应用",
                        "获取Client ID和Client Secret",
                        "在Supabase中配置Google OAuth",
                        "测试OAuth登录流程"
                    ]
                }
            }
        },
        "api_security": {
            "rate_limiting": {
                "configuration": """
// api/utils/rate-limit.ts
export const rateLimitConfig = {
  public: {
    windowMs: 60 * 1000, // 1分钟
    max: 100 // 最多100个请求
  },
  authenticated: {
    windowMs: 60 * 1000,
    max: 1000 // 认证用户1000个请求
  },
  ai: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 50 // AI功能50个请求
  }
};
                """,
                "implementation": "使用Vercel Edge Config实现分布式限流"
            },
            "input_validation": [
                "使用Joi进行请求参数验证",
                "SQL注入防护",
                "XSS攻击防护",
                "文件上传安全检查"
            ]
        },
        "environment_variables": {
            "production_secrets": [
                "SUPABASE_URL",
                "SUPABASE_SERVICE_KEY", 
                "OPENAI_API_KEY",
                "BAIDU_API_KEY",
                "JWT_SECRET",
                "ENCRYPTION_KEY"
            ],
            "security_headers": """
// 安全头配置
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval'"
};
            """
        }
    }

def generate_monitoring_setup():
    """生成监控配置指南"""
    return {
        "vercel_analytics": {
            "setup_steps": [
                "在Vercel项目中启用Analytics",
                "添加Vercel Analytics包",
                "配置自定义事件跟踪",
                "设置性能监控"
            ],
            "implementation": """
// 在main.ts中添加
import { inject } from '@vercel/analytics';

inject({
  debug: process.env.NODE_ENV === 'development'
});
            """
        },
        "error_monitoring": {
            "sentry_setup": [
                "注册Sentry账户",
                "创建Vue.js项目",
                "安装Sentry SDK",
                "配置错误追踪"
            ],
            "configuration": """
// sentry.config.ts
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
            """
        },
        "performance_monitoring": {
            "metrics_to_track": [
                "API响应时间",
                "页面加载时间",
                "数据库查询性能",
                "AI API调用延迟",
                "错误率统计"
            ],
            "custom_monitoring": """
// 性能监控工具
export class PerformanceMonitor {
  static trackAPICall(endpoint: string, duration: number) {
    // 发送到分析服务
    analytics.track('api_call', {
      endpoint,
      duration,
      timestamp: Date.now()
    });
  }

  static trackUserAction(action: string, metadata?: any) {
    analytics.track('user_action', {
      action,
      metadata,
      timestamp: Date.now()
    });
  }
}
            """
        }
    }

def generate_testing_checklist():
    """生成测试检查清单"""
    return {
        "pre_deployment_tests": [
            "所有单元测试通过",
            "集成测试验证",
            "API端点功能测试",
            "数据库连接测试",
            "AI服务集成测试",
            "用户认证流程测试",
            "文件上传功能测试",
            "搜索功能准确性测试"
        ],
        "performance_tests": [
            "页面加载速度测试",
            "API响应时间测试",
            "并发用户测试",
            "数据库查询性能测试",
            "移动端响应式测试",
            "跨浏览器兼容性测试"
        ],
        "security_tests": [
            "身份验证测试",
            "授权控制测试",
            "SQL注入防护测试",
            "XSS攻击防护测试",
            "CSRF防护测试",
            "文件上传安全测试",
            "API限流测试",
            "数据加密验证"
        ],
        "user_acceptance_tests": [
            "案例浏览功能",
            "搜索和筛选功能",
            "AI功能可用性",
            "管理后台功能",
            "文件上传管理",
            "用户注册登录",
            "主题切换功能",
            "移动端用户体验"
        ]
    }

def generate_maintenance_procedures():
    """生成维护程序指南"""
    return {
        "daily_maintenance": [
            "检查系统运行状态",
            "监控API响应时间",
            "查看错误日志",
            "检查AI服务使用量",
            "备份关键数据"
        ],
        "weekly_maintenance": [
            "性能报告分析",
            "用户反馈处理",
            "安全更新检查",
            "数据库性能优化",
            "成本使用分析"
        ],
        "monthly_maintenance": [
            "功能使用统计分析",
            "系统性能评估",
            "安全漏洞扫描",
            "依赖包更新",
            "备份策略验证"
        ],
        "emergency_procedures": {
            "service_outage": [
                "快速故障诊断",
                "切换到备用服务",
                "用户通知机制",
                "问题修复流程",
                "服务恢复验证"
            ],
            "security_incident": [
                "立即隔离受影响系统",
                "评估安全威胁范围",
                "实施临时防护措施",
                "通知相关用户",
                "修复安全漏洞"
            ]
        }
    }

def generate_deployment_document(deployment_guide):
    """生成部署指南文档"""
    
    doc_content = f"""# 黄土高原案例库项目部署实施指南

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
import {{ defineConfig }} from 'vite'
import vue from '@vitejs/plugin-vue'
import {{ resolve }} from 'path'

export default defineConfig({{
  plugins: [vue()],
  resolve: {{
    alias: {{
      '@': resolve(__dirname, 'src'),
    }},
  }},
  build: {{
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {{
      output: {{
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }}
    }}
  }},
  server: {{
    host: true,
    port: 3000
  }}
}})
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
        VITE_SUPABASE_URL: ${{{{ secrets.VITE_SUPABASE_URL }}}}
        VITE_SUPABASE_ANON_KEY: ${{{{ secrets.VITE_SUPABASE_ANON_KEY }}}}
        VITE_API_BASE_URL: ${{{{ secrets.VITE_API_BASE_URL }}}}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{{{ secrets.GITHUB_TOKEN }}}}
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
{{
  "functions": {{
    "api/**/*.ts": {{
      "runtime": "nodejs18.x"
    }}
  }},
  "env": {{
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "BAIDU_API_KEY": "@baidu-api-key",
    "STABILITY_API_KEY": "@stability-api-key"
  }},
  "build": {{
    "env": {{
      "NPM_FLAGS": "--production=false"
    }}
  }}
}}
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

class AIServiceManager {{
  private openai: OpenAI;

  constructor() {{
    this.openai = new OpenAI({{
      apiKey: process.env.OPENAI_API_KEY,
    }});
  }}

  async generateText(prompt: string, options: any = {{}}): Promise<string> {{
    try {{
      const response = await this.openai.chat.completions.create({{
        model: options.model || 'gpt-4-turbo-preview',
        messages: [{{ role: 'user', content: prompt }}],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      }});

      return response.choices[0]?.message?.content || '';
    }} catch (error) {{
      console.error('OpenAI API Error:', error);
      throw new Error('AI服务暂时不可用');
    }}
  }}

  async generateEmbedding(text: string): Promise<number[]> {{
    try {{
      const response = await this.openai.embeddings.create({{
        model: 'text-embedding-ada-002',
        input: text,
      }});

      return response.data[0]?.embedding || [];
    }} catch (error) {{
      console.error('Embedding API Error:', error);
      throw new Error('向量生成失败');
    }}
  }}
}}

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
import {{ createClient }} from '@supabase/supabase-js';

export async function verifyToken(token: string) {{
  try {{
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const {{ data: {{ user }}, error }} = await supabase.auth.getUser(token);
    
    if (error || !user) {{
      throw new Error('Invalid token');
    }}

    return user;
  }} catch (error) {{
    throw new Error('Token verification failed');
  }}
}}
```

### 7.3 限流配置
```typescript
// api/utils/rate-limit.ts
const rateLimitStore = new Map();

export function rateLimit(identifier: string, limit: number, windowMs: number) {{
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // 清除过期请求
  const validRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (validRequests.length >= limit) {{
    throw new Error('Rate limit exceeded');
  }}
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
}}
```

## 8. 监控和分析

### 8.1 Vercel Analytics
```bash
# 安装Vercel Analytics
npm install @vercel/analytics
```

在 `main.ts` 中添加：
```typescript
import {{ inject }} from '@vercel/analytics';

inject({{
  debug: process.env.NODE_ENV === 'development'
}});
```

### 8.2 错误监控 (Sentry)
```bash
# 安装Sentry
npm install @sentry/vue @sentry/tracing
```

配置Sentry：
```typescript
import * as Sentry from '@sentry/vue';

Sentry.init({{
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
}});
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
"""
    
    # 保存部署指南文档
    with open('/workspace/docs/deployment_implementation_guide.md', 'w', encoding='utf-8') as f:
        f.write(doc_content)
    
    print("\n" + "="*70)
    print("🚀 部署实施指南生成完成！")
    print("="*70)
    print(f"📋 部署指南：/workspace/docs/deployment_implementation_guide.md")
    print(f"📄 配置数据：/workspace/data/deployment_guide.json")
    print("="*70)

if __name__ == "__main__":
    generate_deployment_guide()
