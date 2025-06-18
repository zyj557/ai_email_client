-- 黄土高原案例库 Supabase 数据库初始化脚本
-- 
-- 使用说明：
-- 1. 在Supabase控制台的SQL编辑器中运行此脚本
-- 2. 确保启用了必要的扩展
-- 3. 按顺序执行各个部分

-- ============================================================================
-- 1. 启用必要的扩展
-- ============================================================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用PostGIS扩展（用于地理位置功能）
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 启用中文全文搜索扩展
-- CREATE EXTENSION IF NOT EXISTS zhparser;

-- ============================================================================
-- 2. 创建自定义类型
-- ============================================================================

-- 创建状态枚举类型
CREATE TYPE case_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin', 'superadmin');
CREATE TYPE file_type AS ENUM ('image', 'video', 'document', 'audio');

-- ============================================================================
-- 3. 创建数据表
-- ============================================================================

-- 用户表（扩展Supabase auth.users）
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  bio TEXT,
  organization VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 案例分类表
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7), -- HEX颜色代码
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 案例主表
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  slug VARCHAR(255) UNIQUE, -- URL友好的标识符
  category_id INTEGER REFERENCES categories(id),
  
  -- 位置信息
  region VARCHAR(100),
  province VARCHAR(100),
  city VARCHAR(100),
  location_description TEXT,
  coordinates POINT, -- 经纬度坐标
  
  -- 内容信息
  description TEXT,
  content TEXT, -- 详细内容（Markdown格式）
  summary TEXT, -- 摘要
  key_points TEXT[], -- 关键要点
  
  -- 项目信息
  project_scale VARCHAR(100), -- 项目规模
  start_date DATE,
  end_date DATE,
  total_investment DECIMAL(15,2), -- 总投资（万元）
  funding_source VARCHAR(255), -- 资金来源
  
  -- 技术信息
  main_technologies TEXT[], -- 主要技术
  innovation_points TEXT[], -- 创新点
  technical_indicators JSONB, -- 技术指标
  
  -- 效果数据
  ecological_benefits JSONB, -- 生态效益数据
  economic_benefits JSONB, -- 经济效益数据
  social_benefits JSONB, -- 社会效益数据
  environmental_data JSONB, -- 环境监测数据
  
  -- 媒体信息
  cover_image TEXT, -- 封面图片URL
  gallery_images TEXT[], -- 图片集
  video_urls TEXT[], -- 视频链接
  
  -- 元数据
  tags TEXT[],
  keywords TEXT[],
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  promotion_value INTEGER CHECK (promotion_value BETWEEN 1 AND 5),
  replication_difficulty INTEGER CHECK (replication_difficulty BETWEEN 1 AND 5),
  
  -- 状态信息
  status case_status DEFAULT 'draft',
  priority priority_level DEFAULT 'medium',
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- 审核信息
  author_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- 统计信息
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 搜索和排序
  search_vector tsvector, -- 全文搜索向量
  quality_score FLOAT DEFAULT 0, -- 质量评分
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 媒体文件表
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type file_type,
  mime_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- 图片特定信息
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  
  -- 视频特定信息
  duration INTEGER, -- 时长（秒）
  
  -- AI相关信息
  ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(100),
  ai_prompt TEXT,
  ai_metadata JSONB,
  
  -- 版权信息
  copyright_info JSONB,
  license VARCHAR(100),
  source_url TEXT,
  attribution TEXT,
  
  -- 关联信息
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES users(id),
  
  -- 状态信息
  is_processed BOOLEAN DEFAULT false,
  processing_status VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI配置表
CREATE TABLE public.ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  config_name VARCHAR(100),
  
  -- API密钥配置（加密存储）
  encrypted_keys JSONB, -- 存储加密后的API密钥
  
  -- 配置选项
  default_model VARCHAR(100),
  preferences JSONB,
  usage_limits JSONB,
  
  -- 状态信息
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_results JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI生成记录表
CREATE TABLE public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  generation_type VARCHAR(50), -- 'content', 'image', 'search', 'analysis'
  
  -- 生成参数
  prompt TEXT NOT NULL,
  model VARCHAR(100),
  parameters JSONB,
  
  -- 生成结果
  result JSONB,
  output_text TEXT,
  output_urls TEXT[], -- 生成的文件URLs
  
  -- 质量评估
  quality_score FLOAT,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  
  -- 成本信息
  tokens_used INTEGER,
  processing_time INTEGER, -- 处理时间（毫秒）
  cost_cents INTEGER, -- 成本（分）
  
  -- 状态信息
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  
  -- 关联信息
  case_id UUID REFERENCES cases(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 访问统计表
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  action VARCHAR(50), -- 'view', 'download', 'like', 'share', 'search'
  metadata JSONB,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 搜索记录表
CREATE TABLE public.search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  query TEXT NOT NULL,
  search_type VARCHAR(50), -- 'keyword', 'ai', 'filter', 'category'
  filters JSONB,
  results_count INTEGER,
  clicked_result_ids UUID[],
  no_results BOOLEAN DEFAULT false,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, case_id)
);

-- 案例评论表
CREATE TABLE public.case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES case_comments(id), -- 用于回复
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. 创建索引
-- ============================================================================

-- 案例表索引
CREATE INDEX idx_cases_category ON cases(category_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_author ON cases(author_id);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_published_at ON cases(published_at DESC);
CREATE INDEX idx_cases_featured ON cases(featured) WHERE featured = true;
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);
CREATE INDEX idx_cases_region ON cases(region);
CREATE INDEX idx_cases_slug ON cases(slug);

-- 全文搜索索引
CREATE INDEX idx_cases_search_vector ON cases USING GIN(search_vector);

-- 媒体文件索引
CREATE INDEX idx_media_case ON media_files(case_id);
CREATE INDEX idx_media_type ON media_files(file_type);
CREATE INDEX idx_media_uploader ON media_files(uploader_id);

-- 访问日志索引
CREATE INDEX idx_access_logs_case ON access_logs(case_id);
CREATE INDEX idx_access_logs_user ON access_logs(user_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX idx_access_logs_action ON access_logs(action);

-- 搜索日志索引
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_search_logs_query ON search_logs(query);

-- 收藏索引
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_case ON user_favorites(case_id);

-- 评论索引
CREATE INDEX idx_comments_case ON case_comments(case_id);
CREATE INDEX idx_comments_user ON case_comments(user_id);
CREATE INDEX idx_comments_parent ON case_comments(parent_id);

-- ============================================================================
-- 5. 创建函数和触发器
-- ============================================================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON cases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configs_updated_at 
  BEFORE UPDATE ON ai_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_comments_updated_at 
  BEFORE UPDATE ON case_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 全文搜索向量更新函数
CREATE OR REPLACE FUNCTION update_case_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('chinese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('chinese', COALESCE(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('chinese', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('chinese', COALESCE(NEW.summary, '')), 'C') ||
    setweight(to_tsvector('chinese', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建搜索向量更新触发器
CREATE TRIGGER update_cases_search_vector
  BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_case_search_vector();

-- 统计更新函数
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'view' AND NEW.case_id IS NOT NULL THEN
    UPDATE cases 
    SET view_count = view_count + 1 
    WHERE id = NEW.case_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建访问统计触发器
CREATE TRIGGER increment_case_view_count
  AFTER INSERT ON access_logs
  FOR EACH ROW EXECUTE FUNCTION increment_view_count();

-- 生成slug函数
CREATE OR REPLACE FUNCTION generate_case_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\u4e00-\u9fa5]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
    -- 确保slug唯一性
    IF EXISTS (SELECT 1 FROM cases WHERE slug = NEW.slug AND id != COALESCE(NEW.id, uuid_nil())) THEN
      NEW.slug := NEW.slug || '-' || extract(epoch from now())::text;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建slug生成触发器
CREATE TRIGGER generate_cases_slug
  BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION generate_case_slug();

-- ============================================================================
-- 6. 设置行级安全策略 (RLS)
-- ============================================================================

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 案例访问策略
CREATE POLICY "Published cases are viewable by everyone" ON cases
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view their own cases" ON cases
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all cases" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own cases" ON cases
  FOR UPDATE USING (auth.uid() = author_id);

-- 媒体文件策略
CREATE POLICY "Media files are viewable with case access" ON media_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = media_files.case_id 
      AND (cases.status = 'published' OR cases.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload media for their cases" ON media_files
  FOR INSERT WITH CHECK (
    auth.uid() = uploader_id AND
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = media_files.case_id 
      AND cases.author_id = auth.uid()
    )
  );

-- AI配置策略
CREATE POLICY "Users can only access their own AI configs" ON ai_configs
  FOR ALL USING (auth.uid() = user_id);

-- AI生成记录策略
CREATE POLICY "Users can view their own AI generations" ON ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI generations" ON ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 收藏策略
CREATE POLICY "Users can manage their own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "Everyone can view approved comments" ON case_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own comments" ON case_comments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create comments" ON case_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON case_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. 插入初始数据
-- ============================================================================

-- 插入案例分类
INSERT INTO categories (name, name_en, description, icon, color, sort_order) VALUES
('水土保持', 'Soil and Water Conservation', '水土流失治理和防护工程', 'droplets', '#2563eb', 1),
('生态修复', 'Ecological Restoration', '生态系统恢复和重建项目', 'trees', '#16a34a', 2),
('农业发展', 'Agricultural Development', '农业技术推广和产业发展', 'wheat', '#ca8a04', 3),
('流域治理', 'Watershed Management', '流域综合治理和管理', 'waves', '#0891b2', 4),
('技术创新', 'Technological Innovation', '新技术新方法的应用', 'lightbulb', '#dc2626', 5),
('政策制度', 'Policy and Institution', '政策制度创新和管理体制', 'scale', '#7c3aed', 6);

-- 插入子分类
INSERT INTO categories (name, name_en, description, icon, color, parent_id, sort_order) VALUES
('淤地坝建设', 'Siltation Dam Construction', '淤地坝工程技术', 'dam', '#2563eb', 1, 11),
('梯田建设', 'Terrace Construction', '梯田工程技术', 'stairs', '#2563eb', 1, 12),
('植被恢复', 'Vegetation Restoration', '植被恢复技术', 'sprout', '#16a34a', 2, 21),
('退耕还林', 'Converting Farmland to Forest', '退耕还林还草', 'forest', '#16a34a', 2, 22);

-- ============================================================================
-- 8. 创建视图
-- ============================================================================

-- 案例详情视图
CREATE VIEW case_details AS
SELECT 
  c.*,
  cat.name as category_name,
  cat.color as category_color,
  u.full_name as author_name,
  u.organization as author_organization,
  COUNT(cf.id) as favorite_count,
  COUNT(cc.id) as comment_count
FROM cases c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN users u ON c.author_id = u.id
LEFT JOIN user_favorites cf ON c.id = cf.case_id
LEFT JOIN case_comments cc ON c.id = cc.case_id AND cc.is_approved = true
GROUP BY c.id, cat.name, cat.color, u.full_name, u.organization;

-- 统计视图
CREATE VIEW site_statistics AS
SELECT 
  (SELECT COUNT(*) FROM cases WHERE status = 'published') as total_cases,
  (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories,
  (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
  (SELECT SUM(view_count) FROM cases) as total_views,
  (SELECT COUNT(*) FROM access_logs WHERE created_at > NOW() - INTERVAL '30 days') as monthly_visits;

-- ============================================================================
-- 9. 创建存储过程
-- ============================================================================

-- 搜索案例存储过程
CREATE OR REPLACE FUNCTION search_cases(
  search_query TEXT DEFAULT '',
  category_filter INTEGER DEFAULT NULL,
  region_filter VARCHAR DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  category_name VARCHAR,
  region VARCHAR,
  cover_image TEXT,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    cat.name as category_name,
    c.region,
    c.cover_image,
    c.view_count,
    c.created_at,
    CASE 
      WHEN search_query = '' THEN 0
      ELSE ts_rank(c.search_vector, plainto_tsquery('chinese', search_query))
    END as relevance
  FROM cases c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.status = 'published'
    AND (search_query = '' OR c.search_vector @@ plainto_tsquery('chinese', search_query))
    AND (category_filter IS NULL OR c.category_id = category_filter)
    AND (region_filter IS NULL OR c.region = region_filter)
  ORDER BY 
    CASE WHEN search_query = '' THEN c.created_at END DESC,
    CASE WHEN search_query != '' THEN ts_rank(c.search_vector, plainto_tsquery('chinese', search_query)) END DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 完成初始化
-- ============================================================================

-- 提交所有更改
COMMIT;

-- 输出初始化完成信息
DO $$
BEGIN
  RAISE NOTICE '黄土高原案例库数据库初始化完成！';
  RAISE NOTICE '已创建表：users, categories, cases, media_files, ai_configs, ai_generations, access_logs, search_logs, user_favorites, case_comments';
  RAISE NOTICE '已创建索引和触发器';
  RAISE NOTICE '已设置行级安全策略';
  RAISE NOTICE '已插入初始分类数据';
  RAISE NOTICE '请在Supabase控制台检查表结构和数据';
END $$;
