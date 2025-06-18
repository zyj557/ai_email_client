#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
黄土高原案例库项目技术架构设计生成器
基于现有代码分析，设计GitHub Pages + Vercel + Supabase的完整技术架构
"""

import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

def setup_matplotlib_for_plotting():
    """
    Setup matplotlib for plotting with proper configuration.
    """
    import warnings
    import matplotlib.pyplot as plt
    
    warnings.filterwarnings('default')
    plt.switch_backend("Agg")
    plt.style.use("default")
    plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", "Arial Unicode MS", "Hiragino Sans GB"]
    plt.rcParams["axes.unicode_minus"] = False

def generate_architecture_design():
    """生成完整的技术架构设计方案"""
    
    # 读取现有分析结果
    with open('/workspace/data/html_analysis_detailed.json', 'r', encoding='utf-8') as f:
        analysis_data = json.load(f)
    
    # 生成架构设计方案
    architecture_design = {
        "deployment_architecture": generate_deployment_architecture(),
        "frontend_architecture": generate_frontend_architecture(analysis_data),
        "backend_architecture": generate_backend_architecture(),
        "database_design": generate_database_design(),
        "ai_integration": generate_ai_integration_plan(),
        "security_measures": generate_security_measures(),
        "performance_optimization": generate_performance_optimization(),
        "migration_strategy": generate_migration_strategy(analysis_data)
    }
    
    # 保存架构设计
    with open('/workspace/data/architecture_design.json', 'w', encoding='utf-8') as f:
        json.dump(architecture_design, f, ensure_ascii=False, indent=2)
    
    # 生成架构图
    generate_architecture_diagrams(architecture_design)
    
    # 生成技术架构设计文档
    generate_architecture_document(architecture_design, analysis_data)
    
    return architecture_design

def generate_deployment_architecture():
    """生成部署架构设计"""
    return {
        "overview": "基于现代云服务的三层分离架构",
        "components": {
            "github_pages": {
                "role": "静态前端托管",
                "responsibilities": [
                    "托管React/Vue.js构建后的静态文件",
                    "提供CDN加速的全球访问",
                    "SSL/TLS加密",
                    "Git版本控制集成"
                ],
                "configuration": {
                    "custom_domain": "案例库自定义域名",
                    "https_enforcement": True,
                    "build_process": "GitHub Actions自动构建部署"
                }
            },
            "vercel": {
                "role": "无服务器后端和API层",
                "responsibilities": [
                    "API路由处理",
                    "AI服务集成",
                    "文件上传处理",
                    "图片处理和优化",
                    "缓存管理"
                ],
                "configuration": {
                    "runtime": "Node.js 18+",
                    "regions": ["sin1", "hkg1"],  # 亚洲地区
                    "environment_variables": [
                        "SUPABASE_URL",
                        "SUPABASE_ANON_KEY",
                        "SUPABASE_SERVICE_KEY",
                        "AI_API_KEYS"
                    ]
                }
            },
            "supabase": {
                "role": "数据库和用户认证",
                "responsibilities": [
                    "PostgreSQL数据库",
                    "用户认证和授权",
                    "实时数据同步",
                    "文件存储",
                    "Row Level Security (RLS)"
                ],
                "configuration": {
                    "database_region": "Singapore",
                    "backup_retention": "30天",
                    "connection_pooling": True
                }
            }
        },
        "data_flow": {
            "user_access": "用户 → GitHub Pages → Vercel API → Supabase",
            "admin_management": "管理员 → Vercel API → Supabase → 数据更新",
            "ai_services": "前端请求 → Vercel API → AI服务 → 结果返回"
        },
        "advantages": [
            "成本效益高（大部分免费额度内）",
            "自动扩展和负载均衡",
            "全球CDN加速",
            "Git工作流集成",
            "企业级安全性"
        ]
    }

def generate_frontend_architecture(analysis_data):
    """生成前端架构设计"""
    return {
        "framework_selection": {
            "recommended": "Vue.js 3 + Vite",
            "reasoning": [
                "学习曲线平缓，适合现有Bootstrap项目迁移",
                "组件化开发，便于维护",
                "优秀的TypeScript支持",
                "Vite提供快速的开发体验"
            ],
            "alternative": "React + Next.js"
        },
        "component_structure": {
            "layout_components": [
                "AppHeader.vue - 导航栏组件",
                "AppSidebar.vue - 侧边栏组件（管理系统）",
                "AppFooter.vue - 页脚组件",
                "ThemeToggle.vue - 主题切换组件"
            ],
            "business_components": [
                "CaseCard.vue - 案例展示卡片",
                "CaseSearch.vue - 搜索筛选组件",
                "CaseDetail.vue - 案例详情组件",
                "ChartDisplay.vue - 图表展示组件",
                "ImageGallery.vue - 图片展示组件",
                "FileUpload.vue - 文件上传组件"
            ],
            "ai_components": [
                "AISearchBox.vue - AI智能搜索",
                "AIImageGenerator.vue - AI图片生成",
                "AIContentGenerator.vue - AI内容生成",
                "AIAssistant.vue - AI助手界面"
            ]
        },
        "state_management": {
            "solution": "Pinia",
            "stores": [
                "useAuthStore - 用户认证状态",
                "useCaseStore - 案例数据管理",
                "useThemeStore - 主题状态",
                "useAIStore - AI功能状态"
            ]
        },
        "routing_structure": {
            "public_routes": [
                "/ - 首页",
                "/cases - 案例库",
                "/case/:id - 案例详情",
                "/about - 关于页面"
            ],
            "admin_routes": [
                "/admin - 管理首页",
                "/admin/cases - 案例管理",
                "/admin/upload - 文件上传",
                "/admin/ai - AI功能管理"
            ]
        },
        "styling_approach": {
            "css_framework": "保留Bootstrap 5",
            "enhancement": "Tailwind CSS作为补充",
            "organization": [
                "styles/variables.css - CSS变量定义",
                "styles/components.css - 组件样式",
                "styles/themes.css - 主题变量",
                "styles/responsive.css - 响应式样式"
            ]
        },
        "migration_from_current": {
            "phase_1": "保留现有样式和布局",
            "phase_2": "逐步组件化关键功能",
            "phase_3": "优化和增强用户体验",
            "preserved_features": [
                "绿色生态主题设计",
                "响应式布局",
                "深色模式支持",
                "现有交互逻辑"
            ]
        }
    }

def generate_backend_architecture():
    """生成后端架构设计"""
    return {
        "serverless_api": {
            "platform": "Vercel Functions",
            "language": "Node.js with TypeScript",
            "structure": {
                "api/auth/": [
                    "login.ts - 用户登录",
                    "register.ts - 用户注册",
                    "refresh.ts - token刷新"
                ],
                "api/cases/": [
                    "index.ts - 案例列表查询",
                    "[id].ts - 案例详情",
                    "create.ts - 创建案例",
                    "update.ts - 更新案例",
                    "delete.ts - 删除案例"
                ],
                "api/upload/": [
                    "image.ts - 图片上传",
                    "file.ts - 文件上传",
                    "batch.ts - 批量上传"
                ],
                "api/ai/": [
                    "search-images.ts - AI图片搜索",
                    "generate-content.ts - AI内容生成",
                    "generate-image.ts - AI图片生成",
                    "analyze-text.ts - AI文本分析"
                ]
            }
        },
        "middleware": [
            "cors.ts - 跨域处理",
            "auth.ts - 身份验证",
            "rateLimit.ts - 限流保护",
            "errorHandler.ts - 错误处理",
            "logger.ts - 日志记录"
        ],
        "external_integrations": {
            "ai_services": [
                "OpenAI API - GPT模型",
                "Stability AI - 图片生成",
                "Unsplash API - 图片搜索",
                "百度AI API - 中文处理"
            ],
            "storage_services": [
                "Supabase Storage - 文件存储",
                "Cloudinary - 图片处理"
            ]
        },
        "caching_strategy": {
            "levels": [
                "Browser Cache - 静态资源",
                "CDN Cache - API响应",
                "Application Cache - 数据库查询",
                "Database Cache - 查询结果"
            ],
            "cache_keys": [
                "cases:list:{filters}",
                "case:detail:{id}",
                "ai:images:{query}",
                "stats:overview"
            ]
        }
    }

def generate_database_design():
    """生成数据库设计"""
    return {
        "database_platform": "Supabase PostgreSQL",
        "tables": {
            "users": {
                "description": "用户表",
                "columns": [
                    "id (UUID, PK) - 用户ID",
                    "email (VARCHAR) - 邮箱",
                    "username (VARCHAR) - 用户名",
                    "role (ENUM) - 角色 (admin, editor, viewer)",
                    "avatar_url (TEXT) - 头像URL",
                    "created_at (TIMESTAMP) - 创建时间",
                    "updated_at (TIMESTAMP) - 更新时间"
                ],
                "indexes": ["email", "username"],
                "rls_policy": "用户只能查看和修改自己的信息"
            },
            "cases": {
                "description": "案例表",
                "columns": [
                    "id (UUID, PK) - 案例ID",
                    "title (VARCHAR) - 案例标题",
                    "subtitle (VARCHAR) - 副标题",
                    "description (TEXT) - 案例描述",
                    "content (JSONB) - 案例内容（富文本）",
                    "category (VARCHAR) - 分类",
                    "tags (TEXT[]) - 标签数组",
                    "location (JSONB) - 地理位置信息",
                    "project_scale (VARCHAR) - 项目规模",
                    "investment_amount (DECIMAL) - 投资金额",
                    "implementation_period (JSONB) - 实施周期",
                    "status (ENUM) - 状态 (draft, published, archived)",
                    "featured (BOOLEAN) - 是否精选",
                    "view_count (INTEGER) - 浏览次数",
                    "author_id (UUID, FK) - 作者ID",
                    "created_at (TIMESTAMP) - 创建时间",
                    "updated_at (TIMESTAMP) - 更新时间",
                    "published_at (TIMESTAMP) - 发布时间"
                ],
                "indexes": ["category", "tags", "status", "featured", "published_at"],
                "rls_policy": "已发布案例公开可见，草稿仅作者可见"
            },
            "case_images": {
                "description": "案例图片表",
                "columns": [
                    "id (UUID, PK) - 图片ID",
                    "case_id (UUID, FK) - 案例ID",
                    "url (TEXT) - 图片URL",
                    "thumbnail_url (TEXT) - 缩略图URL",
                    "alt_text (VARCHAR) - 替代文本",
                    "caption (TEXT) - 图片说明",
                    "sort_order (INTEGER) - 排序",
                    "file_size (INTEGER) - 文件大小",
                    "dimensions (JSONB) - 图片尺寸",
                    "is_cover (BOOLEAN) - 是否封面图",
                    "uploaded_by (UUID, FK) - 上传者ID",
                    "created_at (TIMESTAMP) - 上传时间"
                ],
                "indexes": ["case_id", "sort_order"],
                "rls_policy": "与关联案例相同的可见性"
            },
            "categories": {
                "description": "案例分类表",
                "columns": [
                    "id (UUID, PK) - 分类ID",
                    "name (VARCHAR) - 分类名称",
                    "slug (VARCHAR) - URL友好名称",
                    "description (TEXT) - 分类描述",
                    "icon (VARCHAR) - 图标类名",
                    "color (VARCHAR) - 主题色",
                    "parent_id (UUID, FK) - 父分类ID",
                    "sort_order (INTEGER) - 排序",
                    "is_active (BOOLEAN) - 是否启用",
                    "created_at (TIMESTAMP) - 创建时间"
                ],
                "indexes": ["slug", "parent_id", "sort_order"],
                "rls_policy": "公开可见"
            },
            "ai_generated_content": {
                "description": "AI生成内容记录表",
                "columns": [
                    "id (UUID, PK) - 记录ID",
                    "content_type (ENUM) - 内容类型 (text, image, suggestion)",
                    "prompt (TEXT) - 生成提示",
                    "result (JSONB) - 生成结果",
                    "model_used (VARCHAR) - 使用的AI模型",
                    "case_id (UUID, FK) - 关联案例ID",
                    "user_id (UUID, FK) - 用户ID",
                    "api_cost (DECIMAL) - API成本",
                    "generation_time (INTEGER) - 生成耗时（毫秒）",
                    "created_at (TIMESTAMP) - 生成时间"
                ],
                "indexes": ["content_type", "case_id", "user_id", "created_at"],
                "rls_policy": "用户仅可见自己的生成记录"
            },
            "system_settings": {
                "description": "系统设置表",
                "columns": [
                    "key (VARCHAR, PK) - 设置键",
                    "value (JSONB) - 设置值",
                    "description (TEXT) - 设置描述",
                    "is_public (BOOLEAN) - 是否公开",
                    "updated_by (UUID, FK) - 更新者",
                    "updated_at (TIMESTAMP) - 更新时间"
                ],
                "rls_policy": "公开设置可见，私有设置仅管理员可见"
            }
        },
        "views": {
            "case_stats": "案例统计视图",
            "popular_cases": "热门案例视图",
            "category_counts": "分类统计视图"
        },
        "functions": {
            "search_cases": "全文搜索函数",
            "update_view_count": "更新浏览次数函数",
            "get_related_cases": "获取相关案例函数"
        },
        "triggers": {
            "update_timestamps": "自动更新时间戳",
            "sync_case_stats": "同步案例统计",
            "validate_content": "内容验证"
        }
    }

def generate_ai_integration_plan():
    """生成AI功能集成方案"""
    return {
        "ai_services_architecture": {
            "service_provider_strategy": {
                "primary": "OpenAI API",
                "backup": "百度文心一言API",
                "image_generation": "Stability AI",
                "image_search": "Unsplash API + Google Vision API"
            },
            "api_management": {
                "rate_limiting": "每用户每小时限制",
                "cost_control": "月度预算限制",
                "failover": "多服务商自动切换",
                "caching": "结果缓存减少API调用"
            }
        },
        "ai_features": {
            "intelligent_search": {
                "description": "AI驱动的案例智能搜索",
                "implementation": [
                    "自然语言查询理解",
                    "语义相似度匹配",
                    "搜索结果智能排序",
                    "搜索建议和纠错"
                ],
                "api_integration": "OpenAI Embedding API",
                "user_interface": "增强现有搜索框"
            },
            "image_search_generation": {
                "description": "AI图片搜索和生成",
                "implementation": [
                    "关键词图片搜索",
                    "图片内容理解",
                    "生态主题图片生成",
                    "图片智能标注"
                ],
                "api_integration": "Unsplash API + DALL-E",
                "user_interface": "图片选择器组件"
            },
            "content_generation": {
                "description": "AI辅助内容生成",
                "implementation": [
                    "案例描述自动生成",
                    "技术方案建议",
                    "成效评估模板",
                    "报告摘要生成"
                ],
                "api_integration": "GPT-4 API",
                "user_interface": "编辑器AI助手"
            },
            "data_analysis": {
                "description": "AI数据分析和洞察",
                "implementation": [
                    "案例数据统计分析",
                    "趋势预测",
                    "成功因素提取",
                    "最佳实践推荐"
                ],
                "api_integration": "自定义分析模型",
                "user_interface": "分析报告仪表板"
            }
        },
        "implementation_phases": {
            "phase_1": {
                "timeline": "1-2个月",
                "features": ["基础AI搜索", "图片搜索"],
                "priority": "高"
            },
            "phase_2": {
                "timeline": "2-3个月", 
                "features": ["内容生成", "图片生成"],
                "priority": "中"
            },
            "phase_3": {
                "timeline": "3-4个月",
                "features": ["数据分析", "智能推荐"],
                "priority": "低"
            }
        },
        "security_considerations": {
            "api_key_management": "环境变量 + Vercel Secrets",
            "user_input_validation": "防止提示注入攻击",
            "content_filtering": "生成内容审核",
            "usage_monitoring": "API使用量监控"
        }
    }

def generate_security_measures():
    """生成安全措施方案"""
    return {
        "authentication_authorization": {
            "auth_provider": "Supabase Auth",
            "supported_methods": [
                "邮箱密码登录",
                "OAuth (Google, GitHub)",
                "微信登录（可选）"
            ],
            "jwt_configuration": {
                "algorithm": "HS256",
                "expiration": "1小时",
                "refresh_token": "30天"
            },
            "role_based_access": {
                "admin": "完全访问权限",
                "editor": "内容编辑权限",
                "viewer": "仅查看权限"
            }
        },
        "data_protection": {
            "encryption": {
                "in_transit": "TLS 1.3",
                "at_rest": "AES-256",
                "database": "Supabase内置加密"
            },
            "privacy_compliance": {
                "gdpr_ready": True,
                "data_retention": "用户可删除账户",
                "cookie_policy": "仅必要cookies"
            }
        },
        "api_security": {
            "rate_limiting": {
                "public_api": "100请求/分钟",
                "authenticated_api": "1000请求/分钟",
                "ai_api": "50请求/小时"
            },
            "input_validation": [
                "SQL注入防护",
                "XSS防护",
                "CSRF防护",
                "文件上传安全检查"
            ]
        },
        "infrastructure_security": {
            "vercel_security": [
                "自动SSL证书",
                "DDoS防护",
                "IP白名单（管理功能）"
            ],
            "supabase_security": [
                "Row Level Security",
                "数据库连接池",
                "自动备份"
            ]
        }
    }

def generate_performance_optimization():
    """生成性能优化方案"""
    return {
        "frontend_optimization": {
            "code_splitting": [
                "路由级别代码分割",
                "组件懒加载",
                "第三方库按需加载"
            ],
            "asset_optimization": [
                "图片WebP格式转换",
                "SVG图标优化",
                "CSS/JS压缩",
                "Gzip压缩"
            ],
            "caching_strategy": [
                "服务工作者缓存",
                "浏览器缓存策略",
                "CDN缓存配置"
            ]
        },
        "backend_optimization": {
            "database_optimization": [
                "查询索引优化",
                "连接池配置",
                "查询结果缓存",
                "分页查询优化"
            ],
            "api_optimization": [
                "响应压缩",
                "数据预加载",
                "批量操作API",
                "GraphQL（可选）"
            ]
        },
        "monitoring_analytics": {
            "performance_monitoring": [
                "Core Web Vitals",
                "API响应时间",
                "错误率监控",
                "用户体验指标"
            ],
            "tools": [
                "Vercel Analytics",
                "Google Analytics",
                "Sentry错误监控"
            ]
        }
    }

def generate_migration_strategy(analysis_data):
    """生成迁移策略"""
    return {
        "migration_phases": {
            "phase_1_preparation": {
                "duration": "1周",
                "tasks": [
                    "环境搭建和配置",
                    "数据库表结构创建",
                    "基础组件开发",
                    "样式系统迁移"
                ],
                "deliverables": [
                    "开发环境配置",
                    "数据库schema",
                    "UI组件库"
                ]
            },
            "phase_2_core_features": {
                "duration": "2-3周",
                "tasks": [
                    "案例展示功能迁移",
                    "搜索筛选功能重构",
                    "用户认证集成",
                    "基础管理功能"
                ],
                "deliverables": [
                    "核心功能模块",
                    "用户系统",
                    "基础API"
                ]
            },
            "phase_3_enhanced_features": {
                "duration": "2周",
                "tasks": [
                    "文件上传功能",
                    "图表可视化",
                    "主题切换",
                    "响应式优化"
                ],
                "deliverables": [
                    "完整功能集",
                    "移动端适配"
                ]
            },
            "phase_4_ai_integration": {
                "duration": "2-3周",
                "tasks": [
                    "AI搜索功能",
                    "AI图片功能",
                    "AI内容生成",
                    "功能测试优化"
                ],
                "deliverables": [
                    "AI功能模块",
                    "完整系统"
                ]
            }
        },
        "data_migration": {
            "current_state": "静态HTML中的演示数据",
            "migration_steps": [
                "提取现有案例数据",
                "数据格式标准化",
                "导入到Supabase数据库",
                "数据完整性验证"
            ],
            "data_mapping": {
                "案例信息": "cases表",
                "图片资源": "case_images表 + Supabase Storage",
                "分类信息": "categories表"
            }
        },
        "testing_strategy": {
            "unit_testing": "Vue Test Utils + Jest",
            "integration_testing": "Cypress",
            "performance_testing": "Lighthouse CI",
            "compatibility_testing": "多浏览器测试"
        },
        "deployment_process": {
            "staging_environment": "Vercel预览部署",
            "production_deployment": "GitHub Actions自动化",
            "rollback_strategy": "Git版本回滚",
            "monitoring": "部署后健康检查"
        }
    }

def generate_architecture_diagrams(architecture_design):
    """生成架构图表"""
    setup_matplotlib_for_plotting()
    
    # 1. 系统架构图
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    # 用户层
    user_rect = patches.FancyBboxPatch((0.5, 6.5), 2, 1, boxstyle="round,pad=0.1", 
                                       facecolor='#e8f5e8', edgecolor='#2d6a4f', linewidth=2)
    ax.add_patch(user_rect)
    ax.text(1.5, 7, '用户访问层\n(浏览器)', ha='center', va='center', fontsize=11, fontweight='bold')
    
    # GitHub Pages
    github_rect = patches.FancyBboxPatch((4, 6.5), 2, 1, boxstyle="round,pad=0.1",
                                        facecolor='#f0f8ff', edgecolor='#0066cc', linewidth=2)
    ax.add_patch(github_rect)
    ax.text(5, 7, 'GitHub Pages\n(静态前端)', ha='center', va='center', fontsize=11, fontweight='bold')
    
    # Vercel
    vercel_rect = patches.FancyBboxPatch((7.5, 6.5), 2, 1, boxstyle="round,pad=0.1",
                                        facecolor='#000000', edgecolor='#ffffff', linewidth=2)
    ax.add_patch(vercel_rect)
    ax.text(8.5, 7, 'Vercel\n(API层)', ha='center', va='center', fontsize=11, fontweight='bold', color='white')
    
    # Supabase
    supabase_rect = patches.FancyBboxPatch((4, 4.5), 2, 1, boxstyle="round,pad=0.1",
                                          facecolor='#3ecf8e', edgecolor='#1a7f45', linewidth=2)
    ax.add_patch(supabase_rect)
    ax.text(5, 5, 'Supabase\n(数据库+认证)', ha='center', va='center', fontsize=11, fontweight='bold')
    
    # AI Services
    ai_rect = patches.FancyBboxPatch((7.5, 4.5), 2, 1, boxstyle="round,pad=0.1",
                                    facecolor='#ff6b35', edgecolor='#cc5529', linewidth=2)
    ax.add_patch(ai_rect)
    ax.text(8.5, 5, 'AI服务\n(OpenAI等)', ha='center', va='center', fontsize=11, fontweight='bold', color='white')
    
    # 添加箭头
    arrows = [
        ((2.5, 7), (4, 7)),  # 用户 -> GitHub Pages
        ((6, 7), (7.5, 7)),  # GitHub Pages -> Vercel
        ((8.5, 6.5), (8.5, 5.5)),  # Vercel -> AI Services
        ((8, 6.5), (6, 5.5)),  # Vercel -> Supabase
        ((5, 6.5), (5, 5.5)),  # GitHub Pages -> Supabase
    ]
    
    for start, end in arrows:
        ax.annotate('', xy=end, xytext=start,
                   arrowprops=dict(arrowstyle='->', lw=2, color='#333333'))
    
    ax.set_title('黄土高原案例库系统架构图', fontsize=16, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/system_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 2. 数据流图
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    # 数据流组件
    components = [
        (1, 5, '前端应用\n(Vue.js)', '#e8f5e8'),
        (5, 5, 'API网关\n(Vercel)', '#f0f8ff'),
        (9, 5, 'AI服务\n(OpenAI)', '#ff6b35'),
        (3, 3, '数据库\n(Supabase)', '#3ecf8e'),
        (7, 3, '文件存储\n(Supabase Storage)', '#52b788'),
        (5, 1, '外部API\n(图片服务)', '#ffd700')
    ]
    
    for x, y, label, color in components:
        rect = patches.FancyBboxPatch((x-0.8, y-0.4), 1.6, 0.8, boxstyle="round,pad=0.1",
                                     facecolor=color, edgecolor='#333333', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, fontweight='bold')
    
    ax.set_title('数据流架构图', fontsize=16, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/data_flow_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()

def generate_architecture_document(architecture_design, analysis_data):
    """生成技术架构设计文档"""
    
    doc_content = f"""# 黄土高原水土保持与生态文明建设案例库技术架构设计方案

## 1. 项目概述

### 1.1 项目背景
基于现有的两个HTML文件（案例库展示页面和后台管理系统），设计现代化的云原生技术架构，实现前后端分离、AI功能集成和现代化部署。

### 1.2 现状分析
- **案例库展示页面**：2985行代码，功能完善，包含搜索、筛选、图表展示等
- **后台管理系统**：2293行代码，包含文件上传、内容管理等功能
- **技术栈**：Bootstrap 5 + Font Awesome + Chart.js + 原生JavaScript
- **设计特色**：绿色生态主题，支持深色模式，响应式布局

### 1.3 目标架构
采用 **GitHub Pages + Vercel + Supabase** 的现代云服务架构，实现：
- 前后端完全分离
- 无服务器后端架构
- AI功能深度集成
- 企业级安全性和性能

## 2. 总体架构设计

### 2.1 架构概览
```
用户浏览器 → GitHub Pages (前端) → Vercel (API) → Supabase (数据库)
                                    ↓
                              AI服务 (OpenAI/百度等)
```

### 2.2 核心组件
{architecture_design['deployment_architecture']['components']['github_pages']['role']}、{architecture_design['deployment_architecture']['components']['vercel']['role']}、{architecture_design['deployment_architecture']['components']['supabase']['role']}

### 2.3 技术选型理由
- **成本效益**：大部分服务在免费额度内
- **开发效率**：现代工具链，快速开发部署
- **可扩展性**：自动扩展，无需运维
- **安全性**：企业级安全保障

## 3. 前端架构设计

### 3.1 技术栈升级
- **框架**：{architecture_design['frontend_architecture']['framework_selection']['recommended']}
- **构建工具**：Vite（快速开发体验）
- **样式**：保留Bootstrap 5 + 补充Tailwind CSS
- **状态管理**：{architecture_design['frontend_architecture']['state_management']['solution']}

### 3.2 组件化重构计划
基于现有HTML代码分析，将大型文件拆分为以下组件：

#### 布局组件
- `AppHeader.vue` - 基于现有导航栏
- `AppSidebar.vue` - 基于管理系统侧边栏
- `ThemeToggle.vue` - 保留现有主题切换功能

#### 业务组件
- `CaseCard.vue` - 案例展示卡片
- `CaseSearch.vue` - 增强现有搜索功能
- `ChartDisplay.vue` - 基于Chart.js的图表组件
- `FileUpload.vue` - 增强现有上传功能

#### AI增强组件
- `AISearchBox.vue` - AI智能搜索
- `AIImageGenerator.vue` - AI图片生成
- `AIContentGenerator.vue` - AI内容生成

### 3.3 样式保持策略
- **完全保留**现有绿色生态主题设计
- **保持**响应式布局和深色模式
- **增强**组件的可复用性和维护性

### 3.4 路由结构
```
公开路由：
- / (首页)
- /cases (案例库)
- /case/:id (案例详情)

管理路由：
- /admin (管理首页)
- /admin/cases (案例管理)
- /admin/ai (AI功能管理)
```

## 4. 后端架构设计

### 4.1 无服务器API设计
使用Vercel Functions构建RESTful API：

```
api/
├── auth/           # 用户认证
├── cases/          # 案例管理
├── upload/         # 文件上传
├── ai/             # AI功能
└── admin/          # 管理功能
```

### 4.2 API设计规范
- **RESTful风格**：标准HTTP方法
- **JSON格式**：统一数据交换格式
- **错误处理**：标准化错误响应
- **版本控制**：API版本管理

### 4.3 外部服务集成
- **AI服务**：OpenAI API（主）+ 百度API（备）
- **图片服务**：Unsplash API + Cloudinary
- **存储服务**：Supabase Storage

## 5. 数据库设计

### 5.1 数据库选择
**Supabase PostgreSQL** - 提供：
- 关系型数据库
- 实时数据同步
- Row Level Security
- 内置认证系统

### 5.2 核心表结构

#### users 表（用户管理）
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
```

#### cases 表（案例管理）
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    content JSONB,
    category VARCHAR,
    tags TEXT[],
    location JSONB,
    status case_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);
```

#### case_images 表（图片管理）
```sql
CREATE TABLE case_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR,
    caption TEXT,
    sort_order INTEGER,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 数据安全
- **Row Level Security**：用户只能访问授权数据
- **数据加密**：传输和存储加密
- **定期备份**：自动数据备份

## 6. AI功能集成方案

### 6.1 AI服务架构
采用多提供商策略确保服务稳定性：
- **主要服务**：OpenAI API
- **备用服务**：百度文心一言API
- **图片生成**：Stability AI
- **图片搜索**：Unsplash API

### 6.2 核心AI功能

#### 6.2.1 智能搜索
- **功能**：自然语言查询理解
- **实现**：OpenAI Embedding API
- **用户体验**：在现有搜索框基础上增强

#### 6.2.2 AI图片功能
- **图片搜索**：关键词匹配高质量生态图片
- **图片生成**：生成符合生态主题的插图
- **智能标注**：自动生成图片说明

#### 6.2.3 内容生成
- **案例描述**：根据基本信息生成详细描述
- **技术方案**：提供技术实施建议
- **成效评估**：生成项目评估报告

### 6.3 实施阶段
1. **第一阶段**（1-2个月）：基础AI搜索和图片搜索
2. **第二阶段**（2-3个月）：内容生成和图片生成
3. **第三阶段**（3-4个月）：数据分析和智能推荐

### 6.4 成本控制
- **API配额管理**：每用户每小时限制
- **结果缓存**：减少重复API调用
- **分级服务**：不同用户角色不同权限

## 7. 安全性设计

### 7.1 认证授权
- **认证方式**：Supabase Auth（邮箱、OAuth）
- **权限管理**：基于角色的访问控制（RBAC）
- **会话管理**：JWT token + 刷新机制

### 7.2 数据保护
- **传输加密**：TLS 1.3
- **存储加密**：AES-256
- **隐私合规**：GDPR就绪

### 7.3 API安全
- **限流保护**：按用户角色设置不同限制
- **输入验证**：防SQL注入、XSS等攻击
- **CORS配置**：严格的跨域策略

## 8. 性能优化策略

### 8.1 前端优化
- **代码分割**：路由级别懒加载
- **资源优化**：图片WebP格式、资源压缩
- **缓存策略**：多层缓存机制

### 8.2 后端优化
- **数据库优化**：索引优化、查询缓存
- **API优化**：响应压缩、批量操作
- **CDN加速**：全球内容分发

### 8.3 监控分析
- **性能监控**：Core Web Vitals
- **错误监控**：Sentry集成
- **用户分析**：Google Analytics

## 9. 部署与运维

### 9.1 部署架构
- **前端部署**：GitHub Pages自动部署
- **API部署**：Vercel自动部署
- **数据库**：Supabase托管

### 9.2 CI/CD流程
```
代码提交 → GitHub Actions → 自动测试 → 构建部署 → 健康检查
```

### 9.3 环境管理
- **开发环境**：本地开发 + Vercel预览
- **测试环境**：Vercel预览部署
- **生产环境**：正式域名部署

## 10. 迁移实施计划

### 10.1 阶段规划

#### 第一阶段：环境搭建（1周）
- [x] GitHub仓库创建和配置
- [x] Supabase项目设置和数据库初始化
- [x] Vercel项目配置和环境变量
- [x] 基础开发环境搭建

#### 第二阶段：核心功能迁移（2-3周）
- [ ] Vue.js项目初始化
- [ ] 组件化重构现有界面
- [ ] 基础API开发
- [ ] 用户认证系统集成

#### 第三阶段：功能增强（2周）
- [ ] 文件上传和管理功能
- [ ] 图表可视化迁移
- [ ] 主题系统优化
- [ ] 响应式布局调优

#### 第四阶段：AI功能集成（2-3周）
- [ ] AI搜索功能开发
- [ ] AI图片功能集成
- [ ] AI内容生成功能
- [ ] 系统测试和优化

### 10.2 数据迁移
- **现有数据**：从HTML中提取演示数据
- **数据清洗**：标准化数据格式
- **数据导入**：批量导入到Supabase
- **数据验证**：确保数据完整性

### 10.3 质量保证
- **单元测试**：Vue Test Utils + Jest
- **集成测试**：Cypress端到端测试
- **性能测试**：Lighthouse CI
- **安全测试**：OWASP安全检查

## 11. 成本估算

### 11.1 服务成本（月度）
- **GitHub Pages**：免费
- **Vercel**：免费额度（$0-20）
- **Supabase**：免费额度（$0-25）
- **AI API**：根据使用量（$50-200）
- **域名和SSL**：免费（Let's Encrypt）

**总计**：$50-245/月（主要是AI API成本）

### 11.2 开发成本
- **初期开发**：6-8周
- **持续维护**：每月20-40小时
- **功能迭代**：按需规划

## 12. 风险评估与应对

### 12.1 技术风险
- **API限制**：多服务商备用方案
- **性能问题**：缓存和优化策略
- **兼容性**：渐进式增强设计

### 12.2 业务风险
- **成本控制**：设置预算警告
- **数据安全**：多重备份策略
- **服务稳定**：监控和告警系统

## 13. 总结与建议

### 13.1 架构优势
1. **现代化**：采用最新云原生技术
2. **可扩展**：自动扩展，无需运维
3. **经济性**：大部分免费额度内运行
4. **安全性**：企业级安全保障
5. **AI就绪**：深度集成AI功能

### 13.2 实施建议
1. **渐进式迁移**：分阶段实施，降低风险
2. **保持设计**：完全保留现有优秀设计
3. **功能增强**：在原有基础上添加AI功能
4. **性能优先**：注重用户体验和性能
5. **安全第一**：从设计阶段考虑安全性

### 13.3 预期成果
完成迁移后，将获得：
- 现代化的技术架构
- 增强的AI功能
- 更好的用户体验
- 更低的维护成本
- 更强的可扩展性

---

**文档版本**：v1.0  
**编制时间**：2025-06-18  
**编制人员**：MiniMax Agent  
**审核状态**：待审核  

## 附录

### 附录A：技术栈对比表
| 组件类型 | 现有技术 | 新架构技术 | 升级理由 |
|---------|---------|-----------|---------|
| 前端框架 | 原生HTML/JS | Vue.js 3 | 组件化、可维护性 |
| 样式框架 | Bootstrap 5 | Bootstrap 5 + Tailwind | 保持兼容，增加灵活性 |
| 构建工具 | 无 | Vite | 快速开发体验 |
| 状态管理 | 无 | Pinia | 状态管理标准化 |
| 后端架构 | 无 | Vercel Functions | 无服务器，自动扩展 |
| 数据库 | 无 | Supabase PostgreSQL | 现代数据库，内置功能 |
| 认证系统 | 无 | Supabase Auth | 企业级认证 |
| AI功能 | 占位符 | OpenAI API | 真实AI功能 |

### 附录B：API接口设计示例
```typescript
// 案例查询API
GET /api/cases?category=water-conservation&page=1&limit=20
Response: {{
  "data": [{{ "id": "uuid", "title": "案例标题", ... }}],
  "pagination": {{ "total": 100, "page": 1, "limit": 20 }},
  "status": "success"
}}

// AI搜索API
POST /api/ai/search
Body: {{ "query": "黄土高原治理成功案例", "type": "semantic" }}
Response: {{
  "results": [{{ "id": "uuid", "relevance": 0.95, ... }}],
  "suggestions": ["退耕还林", "小流域治理"],
  "status": "success"
}}
```

### 附录C：数据库Schema完整版
[详细的SQL建表语句和索引创建语句]

### 附录D：部署配置文件示例
```yaml
# vercel.json
{{
  "functions": {{
    "api/**/*.ts": {{ "runtime": "nodejs18.x" }}
  }},
  "env": {{
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  }}
}}
```
"""
    
    # 保存文档
    with open('/workspace/docs/technical_architecture_design.md', 'w', encoding='utf-8') as f:
        f.write(doc_content)
    
    print("\n" + "="*70)
    print("🏗️  技术架构设计完成！")
    print("="*70)
    print(f"📐 架构设计：/workspace/docs/technical_architecture_design.md")
    print(f"🏗️  系统架构图：/workspace/charts/system_architecture.png")
    print(f"📊 数据流图：/workspace/charts/data_flow_architecture.png")
    print(f"📋 详细配置：/workspace/data/architecture_design.json")
    print("="*70)

if __name__ == "__main__":
    generate_architecture_design()
