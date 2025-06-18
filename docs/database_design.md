# 黄土高原案例库数据库设计方案

## 1. 数据库架构概览

### 技术选型
- **数据库类型**: PostgreSQL (Supabase提供)
- **ORM**: Supabase自带的JavaScript客户端
- **认证系统**: Supabase Auth
- **文件存储**: Supabase Storage
- **实时同步**: Supabase Realtime

## 2. 数据表设计

### 2.1 核心数据表

#### 用户表 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'editor', 'user'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 案例分类表 (categories)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7), -- HEX颜色代码
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 案例主表 (cases)
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  region VARCHAR(100),
  location JSONB, -- 地理位置信息
  description TEXT,
  content TEXT, -- 详细内容（Markdown格式）
  summary TEXT, -- 摘要
  
  -- 项目信息
  project_scale VARCHAR(100), -- 项目规模
  implementation_period DATERANGE, -- 实施周期
  total_investment DECIMAL(15,2), -- 总投资
  
  -- 技术信息
  main_technologies TEXT[], -- 主要技术
  innovation_points TEXT[], -- 创新点
  
  -- 效果数据
  ecological_benefits JSONB, -- 生态效益数据
  economic_benefits JSONB, -- 经济效益数据
  social_benefits JSONB, -- 社会效益数据
  
  -- 元数据
  tags TEXT[],
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  promotion_value INTEGER CHECK (promotion_value BETWEEN 1 AND 5),
  
  -- 状态信息
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high'
  featured BOOLEAN DEFAULT false,
  
  -- 审核信息
  author_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- 统计信息
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 媒体文件表 (media_files)
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type VARCHAR(50), -- 'image', 'video', 'document', 'audio'
  mime_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- 图片特定信息
  width INTEGER,
  height INTEGER,
  
  -- AI相关信息
  ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(100),
  ai_prompt TEXT,
  
  -- 版权信息
  copyright_info JSONB,
  license VARCHAR(100),
  
  -- 关联信息
  case_id UUID REFERENCES cases(id),
  uploader_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 AI功能相关表

#### AI配置表 (ai_configs)
```sql
CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  config_name VARCHAR(100),
  
  -- API密钥配置（加密存储）
  openai_api_key_encrypted TEXT,
  baidu_api_key_encrypted TEXT,
  baidu_secret_key_encrypted TEXT,
  unsplash_api_key_encrypted TEXT,
  pixabay_api_key_encrypted TEXT,
  
  -- 配置元数据
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### AI生成记录表 (ai_generations)
```sql
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  generation_type VARCHAR(50), -- 'content', 'image', 'search'
  
  -- 生成参数
  prompt TEXT NOT NULL,
  model VARCHAR(100),
  parameters JSONB,
  
  -- 生成结果
  result JSONB,
  file_url TEXT, -- 对于图片生成
  
  -- 成本信息
  tokens_used INTEGER,
  cost_cents INTEGER, -- 成本（分）
  
  -- 状态信息
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 统计和分析表

#### 访问统计表 (access_logs)
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  action VARCHAR(50), -- 'view', 'download', 'like', 'search'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 搜索记录表 (search_logs)
```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  query TEXT NOT NULL,
  search_type VARCHAR(50), -- 'keyword', 'ai', 'filter'
  results_count INTEGER,
  clicked_result_id UUID REFERENCES cases(id),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 索引设计

```sql
-- 案例表索引
CREATE INDEX idx_cases_category ON cases(category_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_author ON cases(author_id);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_featured ON cases(featured) WHERE featured = true;
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);
CREATE INDEX idx_cases_location ON cases USING GIN(location);

-- 全文搜索索引
CREATE INDEX idx_cases_fulltext ON cases USING GIN(
  to_tsvector('chinese', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))
);

-- 媒体文件索引
CREATE INDEX idx_media_case ON media_files(case_id);
CREATE INDEX idx_media_type ON media_files(file_type);

-- 访问日志索引
CREATE INDEX idx_access_logs_case ON access_logs(case_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
```

## 4. 行级安全策略 (RLS)

```sql
-- 启用行级安全
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;

-- 案例访问策略
CREATE POLICY "Public cases are viewable by everyone" ON cases
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view their own cases" ON cases
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all cases" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 媒体文件访问策略
CREATE POLICY "Media files are viewable with case access" ON media_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = media_files.case_id 
      AND (cases.status = 'published' OR cases.author_id = auth.uid())
    )
  );

-- AI配置访问策略
CREATE POLICY "Users can only access their own AI configs" ON ai_configs
  FOR ALL USING (auth.uid() = user_id);
```

## 5. 触发器和函数

```sql
-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON cases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 访问统计触发器
CREATE OR REPLACE FUNCTION log_case_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO access_logs (case_id, action, metadata)
  VALUES (NEW.id, 'view', '{}');
  RETURN NEW;
END;
$$ language 'plpgsql';
```

## 6. 初始数据

```sql
-- 插入默认分类
INSERT INTO categories (name, description, icon, color, sort_order) VALUES
('水土保持', '水土流失治理和防护工程', 'droplets', '#2563eb', 1),
('生态修复', '生态系统恢复和重建项目', 'trees', '#16a34a', 2),
('农业发展', '农业技术推广和产业发展', 'wheat', '#ca8a04', 3),
('流域治理', '流域综合治理和管理', 'waves', '#0891b2', 4),
('技术创新', '新技术新方法的应用', 'lightbulb', '#dc2626', 5);

-- 插入管理员用户（需要在Supabase认证系统中创建）
INSERT INTO users (email, username, full_name, role) VALUES
('admin@example.com', 'admin', '系统管理员', 'admin');
```

## 7. 备份和恢复策略

### 自动备份
- Supabase提供自动备份功能
- 每日增量备份
- 每周全量备份
- 备份保留期：30天

### 数据迁移
```sql
-- 导出案例数据
COPY (
  SELECT c.*, cat.name as category_name 
  FROM cases c 
  LEFT JOIN categories cat ON c.category_id = cat.id
) TO '/tmp/cases_export.csv' WITH CSV HEADER;

-- 导出媒体文件信息
COPY media_files TO '/tmp/media_files_export.csv' WITH CSV HEADER;
```

## 8. 性能优化

### 查询优化
1. 使用适当的索引
2. 分页查询限制
3. 预加载关联数据
4. 查询结果缓存

### 存储优化
1. 图片压缩和多尺寸存储
2. CDN加速
3. 大文件分块上传
4. 定期清理临时文件

## 9. 安全措施

### 数据安全
1. API密钥加密存储
2. 敏感数据脱敏
3. 访问日志记录
4. 定期安全审计

### 访问控制
1. 基于角色的权限控制
2. 行级安全策略
3. API速率限制
4. 防SQL注入

## 10. 监控和维护

### 监控指标
- 数据库连接数
- 查询响应时间
- 存储空间使用
- API调用频率

### 维护任务
- 定期清理访问日志
- 优化查询性能
- 更新统计信息
- 检查数据一致性
