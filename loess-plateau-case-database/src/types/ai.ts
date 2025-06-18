// AI功能相关类型定义

export interface AIConfig {
  // 豆包配置
  doubaoApiKey?: string;
  doubaoModel?: string;
  
  // DeepSeek配置  
  deepseekApiKey?: string;
  deepseekModel?: string;
  
  // 图片搜索配置
  bingSearchApiKey?: string;
  googleSearchApiKey?: string;
  googleSearchEngineId?: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  author?: string;
  source: 'bing' | 'google' | 'ai-generated';
  license?: string;
  downloadUrl?: string;
}

export interface ContentGenerationRequest {
  type: 'case-description' | 'technical-analysis' | 'effect-summary';
  prompt: string;
  context?: {
    projectName?: string;
    location?: string;
    technology?: string;
    data?: any;
  };
}

export interface ContentGenerationResult {
  content: string;
  sections?: {
    title: string;
    content: string;
  }[];
  metadata?: {
    wordCount: number;
    generatedAt: string;
    model: string;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  style: 'ecological' | 'technical' | 'comparison' | 'geographic';
  size: '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResult {
  imageUrl: string;
  imageData?: string; // base64 if needed
  prompt: string;
  revisedPrompt?: string;
  metadata: {
    generatedAt: string;
    model: string;
    size: string;
  };
}

export interface CaseAnalysisRequest {
  title: string;
  location: string;
  description?: string;
  keywords?: string[];
  targetLength?: number;
}

export interface CaseAnalysisResult {
  title: string;
  description: string;
  sections: {
    background: string;
    technology: string;
    implementation: string;
    results: string;
    significance: string;
  };
  tags: string[];
  category: string;
  suggestedImages: string[];
}
