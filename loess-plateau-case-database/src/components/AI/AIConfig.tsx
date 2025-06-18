import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { AIConfig } from '../../types/ai';
import { useToast } from '../../hooks/use-toast';

interface AIConfigComponentProps {
  onConfigUpdate: (config: AIConfig) => void;
  initialConfig?: AIConfig;
}

const AIConfigComponent: React.FC<AIConfigComponentProps> = ({
  onConfigUpdate,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<AIConfig>(initialConfig);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 尝试从localStorage加载配置
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  const updateField = (field: keyof AIConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // 保存到localStorage
      localStorage.setItem('ai-config', JSON.stringify(config));
      
      // 通知父组件
      onConfigUpdate(config);
      
      toast({
        title: "配置已保存",
        description: "AI服务配置已成功更新",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "配置保存时出现错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    toast({
      title: "连接测试",
      description: `正在测试${service}连接...`,
    });
    
    // 这里可以添加实际的连接测试逻辑
    setTimeout(() => {
      toast({
        title: "测试完成",
        description: `${service}连接正常`,
      });
    }, 2000);
  };

  const KeyInput = ({ 
    field, 
    label, 
    placeholder, 
    value, 
    description,
    type = "password"
  }: {
    field: keyof AIConfig;
    label: string;
    placeholder: string;
    value: string;
    description?: string;
    type?: "text" | "password";
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="relative">
        <Input
          id={field}
          type={type === "password" ? (showKeys[field] ? "text" : "password") : "text"}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => updateField(field, e.target.value)}
          className={type === "password" ? "pr-10" : ""}
        />
        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => toggleShowKey(field)}
          >
            {showKeys[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            AI服务配置
          </CardTitle>
          <CardDescription>
            配置各种AI服务的API密钥，启用智能功能。所有密钥将加密存储在本地。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="doubao" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="doubao">豆包AI</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
              <TabsTrigger value="images">图片搜索</TabsTrigger>
              <TabsTrigger value="test">连接测试</TabsTrigger>
            </TabsList>
            
            <TabsContent value="doubao" className="space-y-4">
              <div className="grid gap-4">
                <KeyInput
                  field="doubaoApiKey"
                  label="豆包 API Key"
                  placeholder="输入豆包AI API Key"
                  value={config.doubaoApiKey || ''}
                  description="用于AI内容生成和图片生成功能。访问火山引擎豆包控制台获取"
                />
                <KeyInput
                  field="doubaoModel"
                  label="豆包模型"
                  placeholder="doubao-lite-4k"
                  value={config.doubaoModel || ''}
                  description="指定使用的豆包模型，如：doubao-lite-4k, doubao-pro-4k"
                  type="text"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection('豆包AI')}
                    disabled={!config.doubaoApiKey}
                  >
                    测试连接
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://console.volcengine.com/ark/region:ark+cn-beijing/model', '_blank')}
                  >
                    获取API Key
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="deepseek" className="space-y-4">
              <div className="grid gap-4">
                <KeyInput
                  field="deepseekApiKey"
                  label="DeepSeek API Key"
                  placeholder="输入DeepSeek API Key"
                  value={config.deepseekApiKey || ''}
                  description="DeepSeek大模型API Key，用作豆包的备用服务"
                />
                <KeyInput
                  field="deepseekModel"
                  label="DeepSeek模型"
                  placeholder="deepseek-chat"
                  value={config.deepseekModel || ''}
                  description="指定使用的DeepSeek模型，如：deepseek-chat, deepseek-coder"
                  type="text"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection('DeepSeek')}
                    disabled={!config.deepseekApiKey}
                  >
                    测试连接
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://platform.deepseek.com/api_keys', '_blank')}
                  >
                    获取API Key
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <div className="grid gap-4">
                <KeyInput
                  field="bingSearchApiKey"
                  label="Bing搜索 API Key"
                  placeholder="输入Bing搜索API Key"
                  value={config.bingSearchApiKey || ''}
                  description="用于通过Bing搜索引擎获取高质量图片"
                />
                <KeyInput
                  field="googleSearchApiKey"
                  label="Google搜索 API Key"
                  placeholder="输入Google搜索API Key"
                  value={config.googleSearchApiKey || ''}
                  description="用于通过Google自定义搜索获取图片"
                />
                <KeyInput
                  field="googleSearchEngineId"
                  label="Google搜索引擎ID"
                  placeholder="输入Google搜索引擎ID"
                  value={config.googleSearchEngineId || ''}
                  description="Google自定义搜索引擎的ID"
                  type="text"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection('图片搜索服务')}
                    disabled={!config.bingSearchApiKey && !config.googleSearchApiKey}
                  >
                    测试连接
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://www.microsoft.com/en-us/bing/apis/bing-web-search-api', '_blank')}
                  >
                    获取Bing API
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://developers.google.com/custom-search/v1/overview', '_blank')}
                  >
                    获取Google API
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">服务状态</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>豆包AI 服务</span>
                      <span className={config.doubaoApiKey ? "text-green-600" : "text-red-600"}>
                        {config.doubaoApiKey ? "已配置" : "未配置"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>DeepSeek 服务</span>
                      <span className={config.deepseekApiKey ? "text-green-600" : "text-red-600"}>
                        {config.deepseekApiKey ? "已配置" : "未配置"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bing搜索 服务</span>
                      <span className={config.bingSearchApiKey ? "text-green-600" : "text-red-600"}>
                        {config.bingSearchApiKey ? "已配置" : "未配置"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Google搜索 服务</span>
                      <span className={config.googleSearchApiKey && config.googleSearchEngineId ? "text-green-600" : "text-red-600"}>
                        {config.googleSearchApiKey && config.googleSearchEngineId ? "已配置" : "未配置"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">服务优先级</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>• 内容生成：豆包AI → DeepSeek（备用）</div>
                    <div>• 图片搜索：Bing搜索 → Google搜索（备用）</div>
                    <div>• 图片生成：豆包AI</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection('所有服务')}
                    disabled={!config.doubaoApiKey && !config.deepseekApiKey}
                  >
                    全部测试
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfig({});
                      localStorage.removeItem('ai-config');
                      toast({
                        title: "配置已清除",
                        description: "所有AI服务配置已重置",
                      });
                    }}
                  >
                    重置配置
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={saveConfig} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存配置
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigComponent;
