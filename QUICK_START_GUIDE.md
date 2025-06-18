# 🚀 黄土高原案例库快速接管指南

## 📋 5分钟快速接管

如果您想快速接管这个系统，按照以下步骤操作：

### 步骤1：获取项目代码（2分钟）
```bash
# 下载项目文件包（如果您有访问权限）
# 或者从GitHub克隆：git clone 您的仓库地址

# 进入项目目录
cd loess-plateau-case-database

# 安装依赖
npm install -g pnpm  # 如果没有安装pnpm
pnpm install
```

### 步骤2：配置Supabase数据库（2分钟）
```bash
# 1. 访问 https://supabase.com 注册账号
# 2. 创建新项目
# 3. 复制项目URL和API密钥
# 4. 在SQL编辑器中执行 docs/supabase_setup.sql 脚本
```

### 步骤3：配置环境变量（1分钟）
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入：
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

### 步骤4：启动和测试
```bash
# 启动开发服务器
pnpm dev

# 打开浏览器访问 http://localhost:5173
# 检查功能是否正常
```

### 步骤5：部署上线
```bash
# 构建生产版本
pnpm build

# 部署到您的服务器或使用GitHub Pages
```

**🎉 完成！您现在已经拥有了一个完全属于自己的案例库系统！**

---

## 🔑 重要信息

### 当前系统信息
- **演示地址**: https://gx8e9fl2ic.space.minimax.io
- **代码位置**: `/workspace/loess-plateau-case-database/`
- **数据库脚本**: `/workspace/docs/supabase_setup.sql`
- **部署指南**: `/workspace/deployment_guide_complete.md`

### 默认登录信息
```
# 系统暂未设置默认管理员账号
# 您需要通过Supabase控制台手动创建第一个管理员用户
```

### 必需的API服务（按优先级）
1. **Supabase**: 必需，数据库和后端服务
2. **豆包AI**: 推荐，AI内容生成和图片生成功能
3. **DeepSeek**: 可选，豆包AI的备用方案
4. **Bing/Google搜索**: 可选，AI图片搜索功能

---

## 💡 快速操作指南

### 添加第一个管理员用户
```sql
-- 在Supabase SQL编辑器执行
-- 首先在Authentication > Users中创建用户，然后执行：

INSERT INTO users (id, email, full_name, role)
VALUES (
  '从Authentication页面复制的用户ID',
  'admin@yourcompany.com',
  '系统管理员',
  'admin'
);
```

### 快速添加测试案例
```sql
-- 添加一个测试案例
INSERT INTO cases (title, description, category_id, status, author_id)
VALUES (
  '测试案例：高西沟流域治理',
  '这是一个测试案例，展示系统功能。',
  1,  -- 使用第一个分类
  'published',
  '管理员用户ID'
);
```

### 快速配置AI功能
```bash
# 最小配置（仅支持基础功能）
VITE_SUPABASE_URL=您的项目URL
VITE_SUPABASE_ANON_KEY=您的匿名密钥

# 推荐配置（支持AI功能）
VITE_DOUBAO_API_KEY=您的豆包AI密钥
VITE_BING_SEARCH_API_KEY=您的Bing搜索密钥
```

---

## 🛠️ 常用管理操作

### 访问管理后台
```
地址：https://您的域名/#/admin
功能：案例管理、用户管理、数据分析、AI工具
```

### 查看系统统计
```sql
-- 在Supabase SQL编辑器查看
SELECT 
  (SELECT COUNT(*) FROM cases WHERE status = 'published') as 案例总数,
  (SELECT COUNT(*) FROM users WHERE is_active = true) as 用户总数,
  (SELECT SUM(view_count) FROM cases) as 总浏览量;
```

### 备份重要数据
```bash
# 在Supabase控制台
Settings > Database > Create backup
# 建议每周备份一次
```

---

## 📞 获取帮助

### 如果遇到问题：
1. **查看详细文档**: `/workspace/SYSTEM_MANAGEMENT_GUIDE.md`
2. **检查部署指南**: `/workspace/deployment_guide_complete.md`
3. **参考技术文档**: `/workspace/docs/` 目录下的所有文档
4. **在线资源**: 
   - Supabase文档：https://supabase.com/docs
   - React文档：https://react.dev
   - 相关技术社区和论坛

### 常见问题快速解决：
- **网站打不开**: 检查部署状态和域名配置
- **数据库连接失败**: 检查Supabase配置和网络
- **AI功能不工作**: 检查API密钥配置
- **图片无法显示**: 检查存储桶配置和图片路径

---

**💪 您现在已经准备好管理这个现代化的案例库系统了！**

这个系统完全属于您，您可以：
- ✅ 添加和管理生态治理案例
- ✅ 使用AI功能生成专业内容
- ✅ 管理用户和权限
- ✅ 分析访问数据和用户行为
- ✅ 根据需要扩展功能

祝您使用愉快！如有任何问题，请参考详细文档或联系技术支持。
