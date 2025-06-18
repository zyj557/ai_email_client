import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Download, Eye, User, Calendar, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ImageSearchResult } from '../../types/ai';
import AIService from '../../services/ai';
import { useToast } from '../../hooks/use-toast';

interface ImageSearchProps {
  aiService: AIService;
  onImageSelect?: (image: ImageSearchResult) => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ aiService, onImageSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<'auto' | 'bing' | 'google'>('auto');
  const [selectedImage, setSelectedImage] = useState<ImageSearchResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "请输入搜索关键词",
        description: "请输入您要搜索的图片相关关键词",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await aiService.searchImages(searchQuery, selectedSource);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "未找到相关图片",
          description: "请尝试其他关键词或检查网络连接",
        });
      } else {
        toast({
          title: "搜索完成",
          description: `找到 ${results.length} 张相关图片`,
        });
      }
    } catch (error) {
      console.error('Image search failed:', error);
      toast({
        title: "搜索失败",
        description: "图片搜索服务暂时不可用，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (image: ImageSearchResult) => {
    setSelectedImage(image);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const downloadImage = async (image: ImageSearchResult) => {
    try {
      const response = await fetch(image.downloadUrl || image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
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

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'bing':
        return 'bg-blue-100 text-blue-800';
      case 'google':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const commonSearchTerms = [
    '黄土高原', '水土保持', '生态修复', '退耕还林', '梯田建设',
    '淤地坝', '植被恢复', '流域治理', '生态文明', '可持续发展'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI智能图片搜索
          </CardTitle>
          <CardDescription>
            使用AI技术通过Bing和Google搜索引擎获取高质量的专业图片
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜索控件 */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="输入图片搜索关键词，如：黄土高原生态治理"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={selectedSource} onValueChange={(value: any) => setSelectedSource(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动选择</SelectItem>
                  <SelectItem value="bing">Bing搜索</SelectItem>
                  <SelectItem value="google">Google搜索</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    搜索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    搜索
                  </>
                )}
              </Button>
            </div>

            {/* 常用搜索词 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">常用搜索词：</p>
              <div className="flex flex-wrap gap-2">
                {commonSearchTerms.map((term) => (
                  <Badge
                    key={term}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setSearchQuery(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>搜索结果 ({searchResults.length})</CardTitle>
            <CardDescription>
              点击图片查看详情，选择合适的图片用于您的案例
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.thumbnailUrl}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* 覆盖层 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{image.title}</DialogTitle>
                              <DialogDescription>
                                来源：{image.source} | 作者：{image.author}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img
                                src={image.url}
                                alt={image.title}
                                className="w-full max-h-96 object-contain rounded-lg"
                              />
                              <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                  <Badge className={getSourceBadgeColor(image.source)}>
                                    {image.source}
                                  </Badge>
                                  {image.license && (
                                    <Badge variant="outline">{image.license}</Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadImage(image)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    下载
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleImageSelect(image)}
                                  >
                                    选择此图
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleImageSelect(image)}
                        >
                          选择
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 图片信息 */}
                  <div className="mt-2 space-y-1">
                    <h4 className="text-sm font-medium line-clamp-2">{image.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{image.author}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSourceBadgeColor(image.source)}`}
                      >
                        {image.source}
                      </Badge>
                    </div>
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

export default ImageSearch;
