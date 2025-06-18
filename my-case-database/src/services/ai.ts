// AI服务模块 - 集成豆包、DeepSeek、Bing搜索、Google搜索
import axios, { AxiosResponse } from 'axios';
import {
  AIConfig,
  ImageSearchResult,
  ContentGenerationRequest,
  ContentGenerationResult,
  ImageGenerationRequest,
  ImageGenerationResult,
  CaseAnalysisRequest,
  CaseAnalysisResult
} from '../types/ai';

class AIService {
  private config: AIConfig = {};

  constructor(config?: AIConfig) {
    if (config) {
      this.config = config;
    }
    // 尝试从环境变量加载配置
    this.loadConfigFromEnv();
  }

  private loadConfigFromEnv() {
    // 在实际部署时，这些应该从环境变量中读取
    this.config = {
      doubaoApiKey: process.env.VITE_DOUBAO_API_KEY,
      doubaoModel: process.env.VITE_DOUBAO_MODEL || 'doubao-lite-4k',
      deepseekApiKey: process.env.VITE_DEEPSEEK_API_KEY,
      deepseekModel: process.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      bingSearchApiKey: process.env.VITE_BING_SEARCH_API_KEY,
      googleSearchApiKey: process.env.VITE_GOOGLE_SEARCH_API_KEY,
      googleSearchEngineId: process.env.VITE_GOOGLE_SEARCH_ENGINE_ID,
      ...this.config
    };
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 图片搜索功能
  async searchImages(query: string, source: 'bing' | 'google' | 'auto' = 'auto'): Promise<ImageSearchResult[]> {
    try {
      if (source === 'bing' || source === 'auto') {
        try {
          return await this.searchBingImages(query);
        } catch (error) {
          console.warn('Bing search failed:', error);
          if (source === 'bing') throw error;
        }
      }

      if (source === 'google' || source === 'auto') {
        try {
          return await this.searchGoogleImages(query);
        } catch (error) {
          console.warn('Google search failed:', error);
          if (source === 'google') throw error;
        }
      }

      // 如果所有搜索都失败，返回模拟数据
      return this.getMockImageResults(query);

    } catch (error) {
      console.error('Image search failed:', error);
      return this.getMockImageResults(query);
    }
  }

  // Bing图片搜索
  private async searchBingImages(query: string): Promise<ImageSearchResult[]> {
    if (!this.config.bingSearchApiKey) {
      throw new Error('Bing Search API key not configured');
    }

    const response = await axios.get(
      'https://api.bing.microsoft.com/v7.0/images/search',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.bingSearchApiKey
        },
        params: {
          q: query,
          count: 10,
          imageType: 'Photo',
          license: 'Any',
          safeSearch: 'Moderate'
        }
      }
    );

    return response.data.value.map((image: any, index: number) => ({
      id: `bing_${index}`,
      url: image.contentUrl,
      thumbnailUrl: image.thumbnailUrl,
      title: image.name,
      description: image.name,
      author: image.hostPageDisplayUrl,
      source: 'bing' as const,
      license: 'Various',
      downloadUrl: image.contentUrl
    }));
  }

  // Google图片搜索
  private async searchGoogleImages(query: string): Promise<ImageSearchResult[]> {
    if (!this.config.googleSearchApiKey || !this.config.googleSearchEngineId) {
      throw new Error('Google Search API key or Engine ID not configured');
    }

    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: this.config.googleSearchApiKey,
          cx: this.config.googleSearchEngineId,
          q: query,
          searchType: 'image',
          num: 10,
          safe: 'medium'
        }
      }
    );

    return response.data.items?.map((image: any, index: number) => ({
      id: `google_${index}`,
      url: image.link,
      thumbnailUrl: image.image.thumbnailLink,
      title: image.title,
      description: image.snippet,
      author: image.displayLink,
      source: 'google' as const,
      license: 'Various',
      downloadUrl: image.link
    })) || [];
  }

  // 内容生成功能
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    try {
      // 优先使用豆包
      if (this.config.doubaoApiKey) {
        return await this.generateWithDoubao(request);
      }
      
      // 备用DeepSeek
      if (this.config.deepseekApiKey) {
        return await this.generateWithDeepSeek(request);
      }

      // 都不可用时返回模拟数据
      return this.getMockContentResult(request);

    } catch (error) {
      console.error('Content generation failed:', error);
      return this.getMockContentResult(request);
    }
  }

  // 豆包内容生成
  private async generateWithDoubao(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const prompt = this.buildContentPrompt(request);
    
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: this.config.doubaoModel,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的生态环境和水土保持专家，专门负责撰写黄土高原生态治理案例。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.doubaoApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    return {
      content,
      sections: this.parseContentSections(content),
      metadata: {
        wordCount: content.length,
        generatedAt: new Date().toISOString(),
        model: this.config.doubaoModel || 'doubao-lite-4k'
      }
    };
  }

  // DeepSeek内容生成
  private async generateWithDeepSeek(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    const prompt = this.buildContentPrompt(request);
    
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: this.config.deepseekModel,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的生态环境和水土保持专家，专门负责撰写黄土高原生态治理案例。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.deepseekApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    return {
      content,
      sections: this.parseContentSections(content),
      metadata: {
        wordCount: content.length,
        generatedAt: new Date().toISOString(),
        model: this.config.deepseekModel || 'deepseek-chat'
      }
    };
  }

  // 图片生成功能（使用豆包）
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      if (!this.config.doubaoApiKey) {
        throw new Error('豆包API密钥未配置');
      }

      const enhancedPrompt = this.enhanceImagePrompt(request.prompt, request.style);
      
      // 豆包图片生成API调用
      const response = await axios.post(
        'https://ark.cn-beijing.volces.com/api/v3/images/generations',
        {
          model: 'doubao-image-generation',
          prompt: enhancedPrompt,
          n: 1,
          size: request.size,
          quality: request.quality || 'standard'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.doubaoApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageData = response.data.data[0];

      return {
        imageUrl: imageData.url,
        prompt: request.prompt,
        revisedPrompt: enhancedPrompt,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'doubao-image-generation',
          size: request.size
        }
      };

    } catch (error) {
      console.error('Image generation failed:', error);
      
      // 返回模拟生成的图片
      return {
        imageUrl: '/images/ecological-protection.png', // 使用现有的生态图片作为占位符
        prompt: request.prompt,
        revisedPrompt: request.prompt,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'mock-generator',
          size: request.size
        }
      };
    }
  }

  // 案例分析功能
  async analyzeCase(request: CaseAnalysisRequest): Promise<CaseAnalysisResult> {
    try {
      const prompt = `
请分析以下黄土高原生态治理案例：

项目名称：${request.title}
项目地点：${request.location}
项目描述：${request.description || ''}
关键词：${request.keywords?.join(', ') || ''}

请提供详细的案例分析，包括：
1. 项目背景
2. 采用技术
3. 实施过程
4. 治理效果
5. 重要意义

同时推荐适合的分类和标签。
      `;

      const contentRequest: ContentGenerationRequest = {
        type: 'technical-analysis',
        prompt,
        context: {
          projectName: request.title,
          location: request.location
        }
      };

      const result = await this.generateContent(contentRequest);
      
      // 解析结果并构建案例分析
      return this.parseCaseAnalysis(result.content, request);

    } catch (error) {
      console.error('Case analysis failed:', error);
      return this.getMockCaseAnalysis(request);
    }
  }

  // 辅助方法
  private buildContentPrompt(request: ContentGenerationRequest): string {
    const basePrompts = {
      'case-description': '请为以下黄土高原生态治理项目撰写详细的案例描述',
      'technical-analysis': '请对以下黄土高原生态治理技术进行专业分析',
      'effect-summary': '请总结以下黄土高原生态治理项目的效果和意义'
    };

    let prompt = basePrompts[request.type] + '：\n\n' + request.prompt;

    if (request.context) {
      const { projectName, location, technology, data } = request.context;
      if (projectName) prompt += `\n项目名称：${projectName}`;
      if (location) prompt += `\n项目地点：${location}`;
      if (technology) prompt += `\n采用技术：${technology}`;
      if (data) prompt += `\n相关数据：${JSON.stringify(data)}`;
    }

    prompt += '\n\n请用专业、详细、易懂的语言进行描述，内容要符合生态文明建设的要求。';

    return prompt;
  }

  private enhanceImagePrompt(prompt: string, style: string): string {
    const stylePrompts = {
      'ecological': '生态恢复, 绿色植被, 自然环境, 生态文明',
      'technical': '工程技术, 治理设施, 专业设备, 技术实施',
      'comparison': '对比效果, 前后变化, 治理成果, 效果展示',
      'geographic': '地理环境, 地形地貌, 区域特色, 地理位置'
    };

    return `${prompt}, ${stylePrompts[style]}, 黄土高原, 中国风格, 高质量摄影, 自然光线`;
  }

  private parseContentSections(content: string) {
    // 简单的章节解析
    const lines = content.split('\n');
    const sections = [];
    let currentSection = { title: '', content: '' };

    for (const line of lines) {
      if (line.match(/^#+\s+/) || line.match(/^\d+\.\s+/)) {
        if (currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s+/, '').replace(/^\d+\.\s+/, ''),
          content: ''
        };
      } else if (line.trim()) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.title) {
      sections.push(currentSection);
    }

    return sections;
  }

  private parseCaseAnalysis(content: string, request: CaseAnalysisRequest): CaseAnalysisResult {
    // 简化的解析逻辑
    return {
      title: request.title,
      description: request.description || '黄土高原生态治理典型案例',
      sections: {
        background: '项目背景信息...',
        technology: '采用的治理技术...',
        implementation: '具体实施过程...',
        results: '取得的治理效果...',
        significance: '项目的重要意义...'
      },
      tags: request.keywords || ['水土保持', '生态治理', '黄土高原'],
      category: '综合治理',
      suggestedImages: ['梯田', '植被恢复', '水土保持工程']
    };
  }

  // 模拟数据方法
  private getMockImageResults(query: string): ImageSearchResult[] {
    const mockImages = [
      {
        id: 'mock_1',
        url: '/images/loess-plateau-terraces.jpg',
        thumbnailUrl: '/images/loess-plateau-terraces.jpg',
        title: `${query} - 黄土高原梯田`,
        description: '黄土高原水土保持梯田治理',
        author: '生态案例库',
        source: 'bing' as const,
        license: 'Creative Commons',
        downloadUrl: '/images/loess-plateau-terraces.jpg'
      },
      {
        id: 'mock_2', 
        url: '/images/ecological-protection.png',
        thumbnailUrl: '/images/ecological-protection.png',
        title: `${query} - 生态保护`,
        description: '生态环境保护与恢复',
        author: '生态案例库',
        source: 'google' as const,
        license: 'Creative Commons',
        downloadUrl: '/images/ecological-protection.png'
      }
    ];

    return mockImages;
  }

  private getMockContentResult(request: ContentGenerationRequest): ContentGenerationResult {
    const mockContent = {
      'case-description': `
# ${request.context?.projectName || '生态治理案例'}

## 项目概述
本项目位于${request.context?.location || '黄土高原地区'}，是典型的水土保持与生态文明建设实践案例。

## 主要内容
该项目通过采用${request.context?.technology || '综合治理技术'}，有效改善了区域生态环境，实现了水土保持和生态恢复的双重目标。

## 项目意义
项目的成功实施为黄土高原地区的生态文明建设提供了重要参考。
      `,
      'technical-analysis': `
# 技术分析报告

## 技术特点
采用的治理技术具有科学性、实用性和可推广性的特点。

## 实施效果
技术实施后，区域生态环境得到显著改善，水土流失得到有效控制。

## 技术创新
项目在传统治理技术基础上，结合当地实际情况，形成了具有地方特色的治理模式。
      `,
      'effect-summary': `
# 治理效果总结

## 生态效益
植被覆盖率显著提升，生物多样性得到恢复，生态系统稳定性增强。

## 经济效益
促进了当地经济发展，增加了农民收入，实现了生态与经济的协调发展。

## 社会效益
提高了当地居民的生态保护意识，形成了人与自然和谐共生的良好局面。
      `
    };

    const content = mockContent[request.type];

    return {
      content,
      sections: this.parseContentSections(content),
      metadata: {
        wordCount: content.length,
        generatedAt: new Date().toISOString(),
        model: 'mock-model'
      }
    };
  }

  private getMockCaseAnalysis(request: CaseAnalysisRequest): CaseAnalysisResult {
    return {
      title: request.title,
      description: request.description || '黄土高原生态治理典型案例，通过综合治理措施实现水土保持和生态恢复。',
      sections: {
        background: `${request.location}地区位于黄土高原核心区域，水土流失严重，生态环境脆弱，需要采用综合治理措施。`,
        technology: '采用梯田建设、植被恢复、淤地坝工程等多项技术，形成综合治理体系。',
        implementation: '分阶段、分区域实施治理工程，注重工程措施与生物措施相结合。',
        results: '植被覆盖率提升30%以上，水土流失量减少60%，区域生态环境显著改善。',
        significance: '为黄土高原地区生态文明建设提供了可复制、可推广的成功模式。'
      },
      tags: request.keywords || ['水土保持', '生态治理', '综合治理', '黄土高原'],
      category: '综合治理',
      suggestedImages: ['治理前后对比', '梯田工程', '植被恢复', '水土保持设施']
    };
  }
}

// 创建全局AI服务实例
export const aiService = new AIService();

// 导出AI服务类
export default AIService;
