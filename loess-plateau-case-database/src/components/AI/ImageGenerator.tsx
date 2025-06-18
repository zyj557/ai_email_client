import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Image as ImageIcon, 
  Wand2, 
  Download, 
  Copy, 
  RefreshCw, 
  Palette,
  Settings,
  Lightbulb,
  Eye
} from 'lucide-react';
import { ImageGenerationRequest, ImageGenerationResult } from '../../types/ai';
import AIService from '../../services/ai';
import { useToast } from '../../hooks/use-toast';

interface ImageGeneratorProps {
  aiService: AIService;
  onImageGenerated?: (image: ImageGenerationResult) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  aiService, 
  onImageGenerated 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResult | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageGenerationResult[]>([]);
  const { toast } = useToast();

  const [generationForm, setGenerationForm] = useState({
    prompt: '',
    style: 'ecological' as 'ecological' | 'technical' | 'comparison' | 'geographic',
    size: '1024x1024' as '512x512' | '1024x1024' | '1792x1024' | '1024x1792',
    quality: 'standard' as 'standard' | 'hd'
  });

  const generateImage = async () => {
    if (!generationForm.prompt.trim()) {
      toast({
        title: "请输入图片描述",
        description: "请详细描述您希望生成的图片内容",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: ImageGenerationRequest = {
        prompt: generationForm.prompt,
        style: generationForm.style,
        size: generationForm.size,
        quality: generationForm.quality
      };

      const result = await aiService.generateImage(request);
      setGeneratedImage(result);
      setImageHistory(prev => [result, ...prev].slice(0, 10)); // 保留最近10张
      
      if (onImageGenerated) {
        onImageGenerated(result);
      }

      toast({
        title: "图片生成成功",
        description: "AI已为您生成专业图片",
      });
    } catch (error) {
      console.error('Image generation failed:', error);
      toast({
        title: "生成失败",
        description: "图片生成时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "下载成功",
        description: "图片已保存到本地",
      });
    } catch (error) {
      toast({
        title: "下载失败",
        description: "图片下载时出现错误",
        variant: "destructive",
      });
    }
  };

  const copyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "复制成功",
        description: "图片链接已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制图片链接",
        variant: "destructive",
      });
    }
  };

  const styleOptions = [
    {
      value: 'ecological',
      label: '生态风格',
      description: '自然生态主题，绿色环保，美丽自然景观',
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'technical',
      label: '技术风格',
      description: '技术图表，简洁专业，工程图纸样式',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      value: 'comparison',
      label: '对比风格',
      description: '前后对比效果图，视觉冲击强',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      value: 'geographic',
      label: '地理风格',
      description: '地理信息图，地图样式，区域标注',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const sizeOptions = [
    { value: '512x512', label: '正方形 (512×512)', aspect: '1:1' },
    { value: '1024x1024', label: '正方形 (1024×1024)', aspect: '1:1' },
    { value: '1792x1024', label: '横向 (1792×1024)', aspect: '16:9' },
    { value: '1024x1792', label: '纵向 (1024×1792)', aspect: '9:16' }
  ];

  const promptTemplates = {
    ecological: [
      '黄土高原梯田景观，层层叠叠的绿色梯田，远山如黛，蓝天白云',
      '水土保持工程效果图，植被茂盛的山坡，清澈的河流，生态和谐',
      '退耕还林后的生态恢复，从荒山到绿岭的转变，生机盎然'
    ],
    technical: [
      '淤地坝工程技术示意图，结构清晰，标注详细，专业工程图',
      '水土保持技术流程图，步骤明确，逻辑清晰，技术规范',
      '生态治理技术对比图，多种方案并列展示，效果对比明显'
    ],
    comparison: [
      '治理前后对比图，左侧荒山秃岭，右侧绿树成荫，对比强烈',
      '生态修复前后航拍对比，黄土裸露vs绿色覆盖，效果显著',
      '流域治理前后对比，水土流失vs生态恢复，变化巨大'
    ],
    geographic: [
      '黄土高原地理位置图，标注重要城市和河流，地形地貌清晰',
      '水土保持示范区分布图，区域划分明确，位置标识准确',
      '生态治理项目分布图，项目点位标注，覆盖范围展示'
    ]
  };

  const qualityDescriptions = {
    standard: '标准质量，生成速度快，适合预览和测试',
    hd: '高清质量，细节丰富，适合正式使用和印刷'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            AI图片生成
          </CardTitle>
          <CardDescription>
            使用豆包AI技术生成专业的生态治理主题图片，支持多种风格和尺寸
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 图片描述 */}
            <div className="space-y-2">
              <Label htmlFor="prompt">图片描述 *</Label>
              <Textarea
                id="prompt"
                placeholder="请详细描述您希望生成的图片内容，例如：黄土高原梯田景观，层层叠叠的绿色梯田..."
                value={generationForm.prompt}
                onChange={(e) => setGenerationForm(prev => ({ ...prev, prompt: e.target.value }))}
                rows={4}
              />
              
              {/* 提示模板 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">提示模板（点击使用）：</p>
                <div className="grid gap-2">
                  {promptTemplates[generationForm.style].map((template, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground justify-start text-left h-auto p-2"
                      onClick={() => setGenerationForm(prev => ({ ...prev, prompt: template }))}
                    >
                      <Lightbulb className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="text-xs">{template}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 风格选择 */}
            <div className="space-y-3">
              <Label>图片风格</Label>
              <div className="grid grid-cols-2 gap-3">
                {styleOptions.map((style) => (
                  <Card
                    key={style.value}
                    className={`cursor-pointer transition-all ${
                      generationForm.style === style.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setGenerationForm(prev => ({ ...prev, style: style.value as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{style.label}</h4>
                          <Badge className={style.color} variant="secondary">
                            {style.value}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 尺寸和质量设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>图片尺寸</Label>
                <Select 
                  value={generationForm.size} 
                  onValueChange={(value: any) => setGenerationForm(prev => ({ ...prev, size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label} - {size.aspect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>图片质量</Label>
                <Select 
                  value={generationForm.quality} 
                  onValueChange={(value: any) => setGenerationForm(prev => ({ ...prev, quality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准质量</SelectItem>
                    <SelectItem value="hd">高清质量</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {qualityDescriptions[generationForm.quality]}
                </p>
              </div>
            </div>

            {/* 生成按钮 */}
            <Button onClick={generateImage} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  生成中，请稍候...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  生成图片
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 生成结果 */}
      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成的图片</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyImageUrl(generatedImage.imageUrl)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制链接
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadImage(generatedImage.imageUrl, generatedImage.prompt)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              生成时间：{new Date(generatedImage.metadata.generatedAt).toLocaleString()} | 
              模型：{generatedImage.metadata.model} | 
              尺寸：{generatedImage.metadata.size}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={generatedImage.imageUrl}
                  alt={generatedImage.prompt}
                  className="w-full max-h-96 object-contain rounded-lg border bg-muted"
                />
                
                {/* 图片预览覆盖层 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded-lg">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看大图
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>生成的图片</DialogTitle>
                        <DialogDescription>
                          {generatedImage.prompt}
                        </DialogDescription>
                      </DialogHeader>
                      <img
                        src={generatedImage.imageUrl}
                        alt={generatedImage.prompt}
                        className="w-full max-h-[70vh] object-contain rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm">原始提示词</h4>
                  <p className="text-sm text-muted-foreground">{generatedImage.prompt}</p>
                </div>
                
                {generatedImage.revisedPrompt && (
                  <div>
                    <h4 className="font-medium text-sm">AI优化后的提示词</h4>
                    <p className="text-sm text-muted-foreground">{generatedImage.revisedPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史生成记录 */}
      {imageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成历史</CardTitle>
            <CardDescription>
              最近生成的图片记录，点击查看详情
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageHistory.map((image, index) => (
                <div key={index} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* 覆盖层 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setGeneratedImage(image)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image.imageUrl, image.prompt)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(image.metadata.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;
