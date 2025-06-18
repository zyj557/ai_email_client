// Supabase 客户端配置和服务
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          role: 'user' | 'editor' | 'admin' | 'superadmin';
          bio?: string;
          organization?: string;
          is_active: boolean;
          last_login_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          role?: 'user' | 'editor' | 'admin' | 'superadmin';
          bio?: string;
          organization?: string;
          is_active?: boolean;
        };
        Update: {
          username?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          organization?: string;
          is_active?: boolean;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          name_en?: string;
          description?: string;
          icon?: string;
          color?: string;
          parent_id?: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          name_en?: string;
          description?: string;
          icon?: string;
          color?: string;
          parent_id?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          name_en?: string;
          description?: string;
          icon?: string;
          color?: string;
          parent_id?: number;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      cases: {
        Row: {
          id: string;
          title: string;
          subtitle?: string;
          slug?: string;
          category_id?: number;
          region?: string;
          province?: string;
          city?: string;
          location_description?: string;
          description?: string;
          content?: string;
          summary?: string;
          key_points?: string[];
          project_scale?: string;
          start_date?: string;
          end_date?: string;
          total_investment?: number;
          funding_source?: string;
          main_technologies?: string[];
          innovation_points?: string[];
          technical_indicators?: any;
          ecological_benefits?: any;
          economic_benefits?: any;
          social_benefits?: any;
          environmental_data?: any;
          cover_image?: string;
          gallery_images?: string[];
          video_urls?: string[];
          tags?: string[];
          keywords?: string[];
          difficulty_level?: number;
          promotion_value?: number;
          replication_difficulty?: number;
          status: 'draft' | 'review' | 'published' | 'archived';
          priority: 'low' | 'medium' | 'high';
          featured: boolean;
          published_at?: string;
          author_id?: string;
          reviewer_id?: string;
          reviewed_at?: string;
          review_notes?: string;
          view_count: number;
          like_count: number;
          download_count: number;
          share_count: number;
          quality_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          subtitle?: string;
          category_id?: number;
          region?: string;
          province?: string;
          city?: string;
          location_description?: string;
          description?: string;
          content?: string;
          summary?: string;
          key_points?: string[];
          project_scale?: string;
          start_date?: string;
          end_date?: string;
          total_investment?: number;
          funding_source?: string;
          main_technologies?: string[];
          innovation_points?: string[];
          technical_indicators?: any;
          ecological_benefits?: any;
          economic_benefits?: any;
          social_benefits?: any;
          environmental_data?: any;
          cover_image?: string;
          gallery_images?: string[];
          video_urls?: string[];
          tags?: string[];
          keywords?: string[];
          difficulty_level?: number;
          promotion_value?: number;
          replication_difficulty?: number;
          status?: 'draft' | 'review' | 'published' | 'archived';
          priority?: 'low' | 'medium' | 'high';
          featured?: boolean;
          author_id?: string;
        };
        Update: {
          title?: string;
          subtitle?: string;
          category_id?: number;
          region?: string;
          province?: string;
          city?: string;
          location_description?: string;
          description?: string;
          content?: string;
          summary?: string;
          key_points?: string[];
          project_scale?: string;
          start_date?: string;
          end_date?: string;
          total_investment?: number;
          funding_source?: string;
          main_technologies?: string[];
          innovation_points?: string[];
          technical_indicators?: any;
          ecological_benefits?: any;
          economic_benefits?: any;
          social_benefits?: any;
          environmental_data?: any;
          cover_image?: string;
          gallery_images?: string[];
          video_urls?: string[];
          tags?: string[];
          keywords?: string[];
          difficulty_level?: number;
          promotion_value?: number;
          replication_difficulty?: number;
          status?: 'draft' | 'review' | 'published' | 'archived';
          priority?: 'low' | 'medium' | 'high';
          featured?: boolean;
        };
      };
      media_files: {
        Row: {
          id: string;
          filename: string;
          original_name?: string;
          file_type: 'image' | 'video' | 'document' | 'audio';
          mime_type?: string;
          file_size?: number;
          file_url: string;
          thumbnail_url?: string;
          width?: number;
          height?: number;
          alt_text?: string;
          duration?: number;
          ai_generated: boolean;
          ai_model?: string;
          ai_prompt?: string;
          ai_metadata?: any;
          copyright_info?: any;
          license?: string;
          source_url?: string;
          attribution?: string;
          case_id?: string;
          uploader_id?: string;
          is_processed: boolean;
          processing_status?: string;
          created_at: string;
        };
        Insert: {
          filename: string;
          original_name?: string;
          file_type: 'image' | 'video' | 'document' | 'audio';
          mime_type?: string;
          file_size?: number;
          file_url: string;
          thumbnail_url?: string;
          width?: number;
          height?: number;
          alt_text?: string;
          duration?: number;
          ai_generated?: boolean;
          ai_model?: string;
          ai_prompt?: string;
          ai_metadata?: any;
          copyright_info?: any;
          license?: string;
          source_url?: string;
          attribution?: string;
          case_id?: string;
          uploader_id?: string;
          is_processed?: boolean;
          processing_status?: string;
        };
        Update: {
          filename?: string;
          alt_text?: string;
          copyright_info?: any;
          license?: string;
          attribution?: string;
          is_processed?: boolean;
          processing_status?: string;
        };
      };
    };
    Functions: {
      search_cases: {
        Args: {
          search_query?: string;
          category_filter?: number;
          region_filter?: string;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          description: string;
          category_name: string;
          region: string;
          cover_image: string;
          view_count: number;
          created_at: string;
          relevance: number;
        }[];
      };
    };
  };
}

// Supabase 客户端实例
class SupabaseService {
  private client: SupabaseClient<Database>;
  private static instance: SupabaseService;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
    
    this.client = createClient<Database>(supabaseUrl, supabaseKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // 获取客户端实例
  getClient() {
    return this.client;
  }

  // 认证相关方法
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    return { user, error };
  }

  // 案例相关方法
  async getCases(options: {
    limit?: number;
    offset?: number;
    category?: number;
    region?: string;
    status?: string;
    featured?: boolean;
  } = {}) {
    let query = this.client
      .from('cases')
      .select(`
        *,
        categories(name, color),
        users(full_name, organization)
      `);

    if (options.category) {
      query = query.eq('category_id', options.category);
    }
    if (options.region) {
      query = query.eq('region', options.region);
    }
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options.limit || 20);

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getCaseById(id: string) {
    const { data, error } = await this.client
      .from('cases')
      .select(`
        *,
        categories(name, color),
        users(full_name, organization, avatar_url),
        media_files(*)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }

  async searchCases(query: string, options: {
    category?: number;
    region?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { data, error } = await this.client.rpc('search_cases', {
      search_query: query,
      category_filter: options.category,
      region_filter: options.region,
      limit_count: options.limit || 20,
      offset_count: options.offset || 0
    });

    return { data, error };
  }

  async createCase(caseData: Database['public']['Tables']['cases']['Insert']) {
    const { data, error } = await this.client
      .from('cases')
      .insert(caseData)
      .select()
      .single();

    return { data, error };
  }

  async updateCase(id: string, updates: Database['public']['Tables']['cases']['Update']) {
    const { data, error } = await this.client
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async deleteCase(id: string) {
    const { error } = await this.client
      .from('cases')
      .delete()
      .eq('id', id);

    return { error };
  }

  // 分类相关方法
  async getCategories(includeInactive = false) {
    let query = this.client
      .from('categories')
      .select('*')
      .order('sort_order');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async createCategory(categoryData: Database['public']['Tables']['categories']['Insert']) {
    const { data, error } = await this.client
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    return { data, error };
  }

  // 媒体文件相关方法
  async uploadFile(file: File, bucket: string = 'media', path?: string) {
    const filename = path || `${Date.now()}-${file.name}`;
    
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(filename, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = this.client.storage
      .from(bucket)
      .getPublicUrl(filename);

    return { 
      data: { 
        path: filename, 
        publicUrl,
        fullPath: data.path 
      }, 
      error: null 
    };
  }

  async saveMediaFile(mediaData: Database['public']['Tables']['media_files']['Insert']) {
    const { data, error } = await this.client
      .from('media_files')
      .insert(mediaData)
      .select()
      .single();

    return { data, error };
  }

  async getMediaFiles(caseId?: string) {
    let query = this.client
      .from('media_files')
      .select('*');

    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  // 用户收藏相关方法
  async addToFavorites(caseId: string) {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return { error: { message: 'User not authenticated' } };

    const { data, error } = await this.client
      .from('user_favorites')
      .insert({ user_id: user.id, case_id: caseId })
      .select()
      .single();

    return { data, error };
  }

  async removeFromFavorites(caseId: string) {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await this.client
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('case_id', caseId);

    return { error };
  }

  async getUserFavorites() {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    const { data, error } = await this.client
      .from('user_favorites')
      .select(`
        case_id,
        created_at,
        cases(id, title, description, cover_image, view_count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // 访问统计相关方法
  async logAccess(caseId: string, action: string = 'view', metadata?: any) {
    const { data: { user } } = await this.client.auth.getUser();
    
    const logData = {
      case_id: caseId,
      user_id: user?.id,
      action,
      metadata: metadata || {},
      ip_address: null, // 在服务端获取
      user_agent: navigator.userAgent
    };

    const { error } = await this.client
      .from('access_logs')
      .insert(logData);

    return { error };
  }

  async getStatistics() {
    const { data, error } = await this.client
      .from('site_statistics')
      .select('*')
      .single();

    return { data, error };
  }

  // 实时订阅方法
  subscribeToCases(callback: (payload: any) => void) {
    return this.client
      .channel('cases_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cases' }, 
        callback
      )
      .subscribe();
  }

  // 断开连接
  disconnect() {
    this.client.removeAllChannels();
  }
}

// 导出服务实例
export const supabaseService = SupabaseService.getInstance();
export default supabaseService;

// 导出客户端实例（用于直接访问）
export const supabase = supabaseService.getClient();

// 辅助函数
export const isSupabaseConfigured = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !!(supabaseUrl && 
           supabaseKey && 
           supabaseUrl !== 'your-supabase-url' && 
           supabaseKey !== 'your-supabase-anon-key');
};
