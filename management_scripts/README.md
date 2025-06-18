# 黄土高原案例库管理工具集

这个目录包含了管理黄土高原案例库系统的所有必需工具和脚本。通过这些工具，您可以完全控制和管理整个系统。

## 📁 工具概览

| 工具 | 功能 | 类型 | 主要用途 |
|------|------|------|----------|
| `setup.sh` | 环境设置 | Shell脚本 | 初始化开发环境和依赖 |
| `deploy.sh` | 自动部署 | Shell脚本 | 部署到各种云平台 |
| `database_tools.py` | 数据库管理 | Python脚本 | 数据库操作、备份、统计 |
| `monitor.py` | 系统监控 | Python脚本 | 实时监控系统健康状况 |
| `content_manager.py` | 内容管理 | Python脚本 | 批量管理案例内容 |

---

## 🚀 快速开始

### 1. 系统初始化

首次获得系统后，运行环境设置脚本：

```bash
# 进入项目目录
cd your-project-directory

# 运行设置脚本
bash management_scripts/setup.sh

# 按照提示完成配置
```

### 2. 配置数据库

```bash
# 使用数据库管理工具检查连接
python management_scripts/database_tools.py --stats

# 如果需要备份数据库
python management_scripts/database_tools.py --backup
```

### 3. 部署系统

```bash
# 配置部署参数
bash management_scripts/deploy.sh --setup

# 执行完整部署
bash management_scripts/deploy.sh --full
```

---

## 🔧 详细工具说明

### setup.sh - 环境设置工具

**功能**: 自动化项目初始化和环境配置

**使用方法**:
```bash
bash setup.sh [选项]
```

**主要功能**:
- ✅ 检查Node.js和pnpm环境
- ✅ 安装项目依赖
- ✅ 创建环境配置文件
- ✅ 验证项目结构
- ✅ 启动开发服务器

**使用场景**:
- 新系统部署
- 开发环境切换
- 依赖更新

### deploy.sh - 自动部署工具

**功能**: 支持多平台的自动化部署

**使用方法**:
```bash
bash deploy.sh [选项]
```

**支持的部署平台**:
- 🌐 GitHub Pages
- ⚡ Vercel
- 🖥️ 自定义服务器

**主要功能**:
- ✅ 自动构建项目
- ✅ 运行测试验证
- ✅ 创建部署备份
- ✅ 多平台部署
- ✅ 健康检查

**常用命令**:
```bash
# 配置向导
bash deploy.sh --setup

# 仅构建项目
bash deploy.sh --build

# 完整部署流程
bash deploy.sh --full

# 部署到GitHub Pages
bash deploy.sh --github-pages

# 部署到Vercel
bash deploy.sh --vercel
```

### database_tools.py - 数据库管理工具

**功能**: 全面的数据库管理和分析

**依赖安装**:
```bash
pip install psycopg2-binary
```

**使用方法**:
```bash
python database_tools.py [选项]
```

**主要功能**:
- 📊 网站统计分析
- 🔥 热门案例排行
- 👥 用户活动分析
- 🤖 AI使用统计
- 💾 数据库备份
- 🧹 日志清理
- 🔍 搜索索引更新

**常用命令**:
```bash
# 显示网站统计
python database_tools.py --stats

# 查看热门案例
python database_tools.py --popular

# 用户活动分析
python database_tools.py --activity

# AI使用统计
python database_tools.py --ai-stats

# 备份数据库
python database_tools.py --backup

# 清理30天前的日志
python database_tools.py --clean-logs 30

# 更新搜索索引
python database_tools.py --update-index

# 执行所有统计查询
python database_tools.py --all
```

### monitor.py - 系统监控工具

**功能**: 实时监控系统健康状况和性能

**依赖安装**:
```bash
pip install psutil requests
```

**使用方法**:
```bash
python monitor.py [选项]
```

**监控项目**:
- 🌐 网站可访问性
- 🗄️ 数据库连接状态
- 💻 系统资源使用率
- 🔒 SSL证书状态
- 📧 邮件告警通知

**常用命令**:
```bash
# 配置监控参数
python monitor.py --setup

# 执行单次检查
python monitor.py --check

# 启动持续监控
python monitor.py --monitor
```

**配置文件示例** (`monitor_config.json`):
```json
{
  \"website_url\": \"https://your-website.com\",
  \"supabase_url\": \"https://your-project.supabase.co\",
  \"supabase_key\": \"your-api-key\",
  \"check_interval\": 300,
  \"thresholds\": {
    \"response_time\": 5000,
    \"cpu_usage\": 80,
    \"memory_usage\": 90,
    \"disk_usage\": 85
  },
  \"notifications\": {
    \"email\": {
      \"enabled\": true,
      \"smtp_host\": \"smtp.gmail.com\",
      \"smtp_port\": 587,
      \"username\": \"your-email@gmail.com\",
      \"password\": \"your-app-password\",
      \"to_emails\": [\"admin@company.com\"]
    }
  }
}
```

### content_manager.py - 内容管理工具

**功能**: 批量管理案例内容和数据

**使用方法**:
```bash
python content_manager.py [选项]
```

**主要功能**:
- 📝 创建单个案例
- 📊 批量导入CSV数据
- 📤 导出案例数据
- 🖼️ 更新案例图片
- 📈 生成内容分析报告
- ✅ 数据验证和SEO优化

**常用命令**:
```bash
# 创建案例 (从JSON文件)
python content_manager.py --create case_data.json

# 生成CSV导入模板
python content_manager.py --template

# 从CSV批量导入
python content_manager.py --import-csv cases.csv

# 导出已发布案例
python content_manager.py --export-csv published_cases.csv --status published

# 生成内容分析报告
python content_manager.py --report

# 更新案例图片
python content_manager.py --update-images \"case-id,url1,url2,url3\"
```

**CSV导入格式**:
```csv
title,description,content,category_id,region,status,tags,summary,subtitle
案例标题,简短描述,详细内容,1,地区名称,published,\"标签1,标签2\",摘要,副标题
```

---

## 📋 日常管理流程

### 每日检查 (5分钟)
```bash
# 1. 检查系统状态
python management_scripts/monitor.py --check

# 2. 查看网站统计
python management_scripts/database_tools.py --stats
```

### 每周维护 (15分钟)
```bash
# 1. 备份数据库
python management_scripts/database_tools.py --backup

# 2. 清理旧日志
python management_scripts/database_tools.py --clean-logs 30

# 3. 生成内容报告
python management_scripts/content_manager.py --report

# 4. 更新搜索索引
python management_scripts/database_tools.py --update-index
```

### 每月分析 (30分钟)
```bash
# 1. 生成详细统计报告
python management_scripts/database_tools.py --all

# 2. AI使用成本分析
python management_scripts/database_tools.py --ai-stats

# 3. 导出数据用于分析
python management_scripts/content_manager.py --export-csv monthly_backup.csv
```

---

## 🛡️ 安全和备份

### 自动备份设置

**1. 设置定时任务** (crontab):
```bash
# 编辑定时任务
crontab -e

# 添加以下行 (每天凌晨2点备份)
0 2 * * * cd /path/to/your/project && python management_scripts/database_tools.py --backup >/dev/null 2>&1

# 每周日清理旧日志
0 3 * * 0 cd /path/to/your/project && python management_scripts/database_tools.py --clean-logs 30 >/dev/null 2>&1
```

**2. 监控告警设置**:
```bash
# 启动持续监控 (后台运行)
nohup python management_scripts/monitor.py --monitor > monitor.log 2>&1 &
```

### 数据安全

**重要文件清单**:
- ✅ `.env.local` - 环境配置 (包含API密钥)
- ✅ `monitor_config.json` - 监控配置
- ✅ `deploy-config` - 部署配置
- ✅ 数据库备份文件 (`backups/` 目录)

**备份策略**:
- 📅 每日：数据库自动备份
- 📅 每周：配置文件手动备份
- 📅 每月：完整系统备份

---

## 🚨 故障排除

### 常见问题及解决方案

#### 问题1: 数据库连接失败
```bash
# 检查网络连接
ping db.your-project.supabase.co

# 验证API密钥
python -c \"import requests; print(requests.get('https://your-project.supabase.co/rest/v1/', headers={'apikey': 'your-key'}).status_code)\"

# 重新配置连接信息
python management_scripts/database_tools.py --help
```

#### 问题2: 部署失败
```bash
# 检查构建过程
bash management_scripts/deploy.sh --build

# 查看错误日志
cat deploy.log

# 重新配置部署
bash management_scripts/deploy.sh --setup
```

#### 问题3: 监控告警过多
```bash
# 调整监控阈值
python management_scripts/monitor.py --setup

# 检查系统资源
python management_scripts/monitor.py --check
```

#### 问题4: AI功能不可用
```bash
# 检查API密钥配置
grep OPENAI .env.local

# 测试API连接
curl -H \"Authorization: Bearer sk-your-key\" https://api.openai.com/v1/models
```

---

## 📞 技术支持

### 获取帮助

**1. 查看工具帮助**:
```bash
bash setup.sh --help
bash deploy.sh --help  
python database_tools.py --help
python monitor.py --help
python content_manager.py --help
```

**2. 错误日志位置**:
- 部署日志: `deploy.log`
- 监控日志: `monitor.log`
- 应用日志: 浏览器开发者工具
- 数据库日志: Supabase控制台

**3. 配置文件检查**:
```bash
# 检查环境配置
cat .env.local

# 检查项目配置
cat package.json

# 检查部署配置
cat .deploy-config
```

### 系统升级

**升级步骤**:
1. 备份当前系统
2. 更新代码和依赖
3. 测试新功能
4. 部署到生产环境

```bash
# 1. 备份
python management_scripts/database_tools.py --backup
cp -r . ../backup_$(date +%Y%m%d)

# 2. 更新依赖
pnpm update

# 3. 重新构建
bash management_scripts/deploy.sh --build

# 4. 部署
bash management_scripts/deploy.sh --deploy
```

---

## 📈 性能优化

### 优化建议

**1. 数据库优化**:
```bash
# 定期更新搜索索引
python management_scripts/database_tools.py --update-index

# 清理旧数据
python management_scripts/database_tools.py --clean-logs 30
```

**2. 内容优化**:
```bash
# 生成SEO友好的内容
python management_scripts/content_manager.py --create optimized_case.json

# 批量优化现有内容
python management_scripts/content_manager.py --report
```

**3. 监控优化**:
```bash
# 调整监控间隔
python management_scripts/monitor.py --setup

# 设置合理的告警阈值
```

---

## 🎯 最佳实践

### 管理建议

1. **定期维护**: 按照每日、每周、每月的维护计划执行
2. **监控告警**: 及时处理系统告警，预防问题发生
3. **备份策略**: 保持多份备份，定期测试恢复流程
4. **安全管理**: 定期更新API密钥，使用强密码
5. **性能监控**: 关注系统性能指标，及时优化
6. **内容质量**: 使用内容管理工具保证数据质量
7. **用户体验**: 定期检查网站功能，确保用户体验

### 团队协作

如果您有团队成员需要参与管理：

1. **权限分配**: 在Supabase中设置合适的用户权限
2. **文档分享**: 分享这些管理文档和工具
3. **操作培训**: 确保团队成员了解管理流程
4. **责任分工**: 明确不同成员的管理职责

---

**🎉 恭喜！您现在拥有了完整的系统管理能力。**

通过这些工具，您可以：
- ✅ 完全控制系统的各个方面
- ✅ 自动化日常管理任务
- ✅ 监控系统健康状况
- ✅ 高效管理内容和用户
- ✅ 及时发现和解决问题
- ✅ 不断优化系统性能

如有任何问题，请参考各工具的帮助文档或联系技术支持。祝您使用愉快！
