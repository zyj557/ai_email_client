import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  FileText, 
  Wand2, 
  Copy, 
  Download, 
  RefreshCw, 
  Lightbulb,
  BarChart3,
  Target,
  BookOpen
} from 'lucide-react';
import { 
  ContentGenerationRequest, 
  ContentGenerationResult,
  CaseAnalysisRequest,
  CaseAnalysisResult 
} from '../../types/ai';
import AIService from '../../services/ai';
import { useToast } from '../../hooks/use-toast';

interface ContentGeneratorProps {
  aiService: AIService;
  onContentGenerated?: (content: ContentGenerationResult | CaseAnalysisResult) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ 
  aiService, 
  onContentGenerated 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult | null>(null);
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysisResult | null>(null);
  const { toast } = useToast();

  // 基础内容生成表单状态
  const [contentForm, setContentForm] = useState({
    type: 'case-description' as 'case-description' | 'technical-analysis' | 'effect-summary',
    prompt: '',
    projectName: '',
    location: '',
    technology: ''
  });

  // 智能案例分析表单状态
  const [caseForm, setCaseForm] = useState({
    title: '',
    location: '',
    description: '',
    keywords: [] as string[],
    targetLength: 1000
  });

  const [keywordInput, setKeywordInput] = useState('');

  const generateContent = async () => {
    if (!contentForm.prompt.trim()) {
      toast({
        title: "请输入生成提示",
        description: "请提供详细的内容生成要求",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: ContentGenerationRequest = {
        type: contentForm.type,
        prompt: contentForm.prompt,
        context: {
          projectName: contentForm.projectName,
          location: contentForm.location,
          technology: contentForm.technology
        }
      };

      const result = await aiService.generateContent(request);
      setGeneratedContent(result);
      
      if (onContentGenerated) {
        onContentGenerated(result);
      }

      toast({
        title: "内容生成成功",
        description: `已生成 ${result.metadata?.wordCount || 0} 字的内容`,
      });
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        title: "生成失败",
        description: "内容生成时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCaseContent = async () => {
    if (!caseForm.title.trim() || !caseForm.location.trim()) {
      toast({
        title: "请填写必要信息",
        description: "案例名称和地点是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: CaseAnalysisRequest = {
        title: caseForm.title,
        location: caseForm.location,
        description: caseForm.description,
        keywords: caseForm.keywords,
        targetLength: caseForm.targetLength
      };

      const result = await aiService.analyzeCase(request);
      setCaseAnalysis(result);
      
      if (onContentGenerated) {
        onContentGenerated(result);
      }

      toast({
        title: "案例分析完成",
        description: "AI已为您生成详细的案例分析",
      });
    } catch (error) {
      console.error('Case analysis failed:', error);
      toast({
        title: "分析失败",
        description: "案例分析时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动选择复制",
        variant: "destructive",
      });
    }
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: "内容已保存为文本文件",
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !caseForm.keywords.includes(keywordInput.trim())) {
      setCaseForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setCaseForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const contentTypeOptions = [
    { value: 'case-description', label: '案例描述', icon: FileText, description: '生成详细的案例描述文档' },
    { value: 'technical-analysis', label: '技术分析', icon: BarChart3, description: '分析技术方案和实施要点' },
    { value: 'effect-summary', label: '效果总结', icon: Target, description: '总结项目成效和经验' }
  ];

  const promptTemplates = {
    'case-description': [
      '请详细描述这个水土保持项目的实施过程和技术措施',
      '请介绍这个生态修复案例的背景、措施和成效',
      '请分析这个流域治理项目的创新点和推广价值'
    ],
    'technical-analysis': [
      '请分析这项技术的原理、适用条件和实施要点',
      '请评估这种治理模式的技术优势和局限性',
      '请比较不同技术方案的效果和成本'
    ],
    'effect-summary': [
      '请总结这个项目的生态效益、经济效益和社会效益',
      '请评价项目实施前后的变化和改善程度',
      '请分析项目成功的关键因素和经验启示'
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI智能内容生成
          </CardTitle>
          <CardDescription>
            使用豆包AI和DeepSeek生成专业的案例内容，支持多种内容类型和自定义要求
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基础内容生成</TabsTrigger>
              <TabsTrigger value="analysis">智能案例分析</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                {/* 内容类型选择 */}
                <div className="space-y-2">
                  <Label>内容类型</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {contentTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Card
                          key={option.value}
                          className={`cursor-pointer transition-all ${
                            contentForm.type === option.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setContentForm(prev => ({ ...prev, type: option.value as any }))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5 text-primary" />
                              <div>
                                <h4 className="font-medium">{option.label}</h4>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* 上下文信息 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">项目名称</Label>
                    <Input
                      id="projectName"
                      placeholder="如：安塞县高西沟流域治理"
                      value={contentForm.projectName}
                      onChange={(e) => setContentForm(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">项目地点</Label>
                    <Input
                      id="location"
                      placeholder="如：陕西省延安市安塞县"
                      value={contentForm.location}
                      onChange={(e) => setContentForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technology">主要技术</Label>
                    <Input
                      id="technology"
                      placeholder="如：梯田+淤地坝+植被恢复"
                      value={contentForm.technology}
                      onChange={(e) => setContentForm(prev => ({ ...prev, technology: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 生成提示 */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">生成要求</Label>
                  <Textarea
                    id="prompt"
                    placeholder="请详细描述您希望生成的内容..."
                    value={contentForm.prompt}
                    onChange={(e) => setContentForm(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={4}
                  />
                  
                  {/* 提示模板 */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">常用提示模板：</p>
                    <div className="flex flex-wrap gap-2">
                      {promptTemplates[contentForm.type].map((template, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setContentForm(prev => ({ ...prev, prompt: template }))}
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          模板 {index + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={generateContent} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      生成内容
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseTitle">案例名称 *</Label>
                    <Input
                      id="caseTitle"
                      placeholder="请输入案例名称"
                      value={caseForm.title}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caseLocation">项目地点 *</Label>
                    <Input
                      id="caseLocation"
                      placeholder="请输入项目地点"
                      value={caseForm.location}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseDescription">案例描述</Label>
                  <Textarea
                    id="caseDescription"
                    placeholder="请简要描述案例的基本情况..."
                    value={caseForm.description}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>关键词</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入关键词后按回车添加"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <Button type="button" onClick={addKeyword}>
                      添加
                    </Button>
                  </div>
                  {caseForm.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {caseForm.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetLength">目标字数</Label>
                  <Select 
                    value={caseForm.targetLength.toString()} 
                    onValueChange={(value) => setCaseForm(prev => ({ ...prev, targetLength: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">500字（简要版）</SelectItem>
                      <SelectItem value="1000">1000字（标准版）</SelectItem>
                      <SelectItem value="1500">1500字（详细版）</SelectItem>
                      <SelectItem value="2000">2000字（完整版）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={analyzeCaseContent} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      智能分析
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 生成结果显示 */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成的内容</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadContent(generatedContent.content, '生成内容')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </CardTitle>
            {generatedContent.metadata && (
              <CardDescription>
                字数：{generatedContent.metadata.wordCount} | 
                生成时间：{new Date(generatedContent.metadata.generatedAt).toLocaleString()} | 
                模型：{generatedContent.metadata.model}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
            </div>
            
            {generatedContent.sections && generatedContent.sections.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">内容分段</h4>
                <div className="space-y-4">
                  {generatedContent.sections.map((section, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h5 className="font-medium">{section.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 案例分析结果 */}
      {caseAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>案例分析结果</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const fullContent = `
${caseAnalysis.title}

${caseAnalysis.description}

【项目背景】
${caseAnalysis.sections.background}

【技术措施】
${caseAnalysis.sections.technology}

【实施过程】
${caseAnalysis.sections.implementation}

【治理效果】
${caseAnalysis.sections.results}

【推广意义】
${caseAnalysis.sections.significance}

关键词：${caseAnalysis.tags.join('、')}
分类：${caseAnalysis.category}
                    `.trim();
                    copyToClipboard(fullContent);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const fullContent = `
${caseAnalysis.title}

${caseAnalysis.description}

【项目背景】
${caseAnalysis.sections.background}

【技术措施】
${caseAnalysis.sections.technology}

【实施过程】
${caseAnalysis.sections.implementation}

【治理效果】
${caseAnalysis.sections.results}

【推广意义】
${caseAnalysis.sections.significance}

关键词：${caseAnalysis.tags.join('、')}
分类：${caseAnalysis.category}
                    `.trim();
                    downloadContent(fullContent, caseAnalysis.title);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              分类：{caseAnalysis.category} | 关键词：{caseAnalysis.tags.join('、')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">{caseAnalysis.title}</h4>
                <p className="text-muted-foreground">{caseAnalysis.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid gap-6">
                {Object.entries(caseAnalysis.sections).map(([key, content]) => {
                  const titles = {
                    background: '项目背景',
                    technology: '技术措施',
                    implementation: '实施过程',
                    results: '治理效果',
                    significance: '推广意义'
                  };
                  
                  return (
                    <div key={key}>
                      <h5 className="font-medium mb-2">【{titles[key as keyof typeof titles]}】</h5>
                      <p className="text-sm leading-relaxed">{content}</p>
                    </div>
                  );
                })}
              </div>
              
              <Separator />
              
              <div className="flex flex-wrap gap-2">
                {caseAnalysis.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              
              {caseAnalysis.suggestedImages.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">建议配图</h5>
                  <div className="flex flex-wrap gap-2">
                    {caseAnalysis.suggestedImages.map((suggestion, index) => (
                      <Badge key={index} variant="outline">{suggestion}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGenerator;
