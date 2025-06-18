import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Plus, Upload, Settings, Users, Database, TrendingUp, 
  FileText, Image as ImageIcon, Filter, Search, Edit, 
  Trash2, Eye, Download, RefreshCw, Calendar, Wand2,
  Brain, Palette, Bot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// AI功能组件
import AIConfigComponent from '../components/AI/AIConfig';
import ImageSearch from '../components/AI/ImageSearch';
import ContentGenerator from '../components/AI/ContentGenerator';
import ImageGenerator from '../components/AI/ImageGenerator';
import AIService from '../services/ai';
import { AIConfig } from '../types/ai';

interface Case {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  image: string;
  tags: string[];
  status: string;
  priority: string;
  createTime: string;
  updateTime: string;
}

interface DashboardStats {
  totalCases: number;
  categoriesCount: number;
  completedCases: number;
  ongoingCases: number;
  monthlyViews: number;
  avgRating: number;
}

const AdminDashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    categoriesCount: 0,
    completedCases: 0,
    ongoingCases: 0,
    monthlyViews: 0,
    avgRating: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // AI服务相关状态
  const [aiService, setAiService] = useState<AIService>(new AIService());
  const [aiConfig, setAiConfig] = useState<AIConfig>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/cases.json');
        const casesData = await response.json();
        setCases(casesData);
        
        // 计算统计数据
        const categories = new Set(casesData.map((c: Case) => c.category));
        const completed = casesData.filter((c: Case) => c.status === 'completed');
        const ongoing = casesData.filter((c: Case) => c.status === 'ongoing');
        
        setStats({
          totalCases: casesData.length,
          categoriesCount: categories.size,
          completedCases: completed.length,
          ongoingCases: ongoing.length,
          monthlyViews: Math.floor(Math.random() * 10000) + 5000, // 模拟数据
          avgRating: 4.6 // 模拟数据
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 分类统计数据
  const categoryData = React.useMemo(() => {
    const categoryCount: { [key: string]: number } = {};
    cases.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      cases: value
    }));
  }, [cases]);

  // 状态统计数据
  const statusData = React.useMemo(() => {
    const statusCount: { [key: string]: number } = {};
    cases.forEach(c => {
      const statusName = c.status === 'completed' ? '已完成' : 
                        c.status === 'ongoing' ? '进行中' : '计划中';
      statusCount[statusName] = (statusCount[statusName] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [cases]);

  // 月度趋势数据（模拟）
  const monthlyTrendData = [
    { month: '1月', cases: 8, views: 1200 },
    { month: '2月', cases: 12, views: 1500 },
    { month: '3月', cases: 15, views: 1800 },
    { month: '4月', cases: 18, views: 2100 },
    { month: '5月', cases: 22, views: 2400 },
    { month: '6月', cases: 25, views: 2800 },
  ];

  const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'];

  const filteredCases = React.useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [cases, searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'ongoing': return '进行中';
      case 'planned': return '计划中';
      default: return '未知';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  // AI配置更新处理
  const handleAIConfigUpdate = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    aiService.updateConfig(newConfig);
  };

  // AI功能回调处理
  const handleImageSelect = (image: any) => {
    console.log('Selected image:', image);
    // 这里可以添加将选中图片添加到案例的逻辑
  };

  const handleContentGenerated = (content: any) => {
    console.log('Generated content:', content);
    // 这里可以添加将生成内容添加到案例的逻辑
  };

  const handleImageGenerated = (image: any) => {
    console.log('Generated image:', image);
    // 这里可以添加将生成图片添加到案例的逻辑
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-eco-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-eco-primary">加载管理面板中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-eco-forest mb-2">
                管理面板
              </h1>
              <p className="text-lg text-eco-primary">
                案例库内容管理与数据分析
              </p>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-eco-primary hover:bg-eco-secondary text-white">
                <Plus className="w-4 h-4 mr-2" />
                新增案例
              </Button>
              <Button variant="outline" className="border-eco-primary text-eco-primary hover:bg-eco-light">
                <Upload className="w-4 h-4 mr-2" />
                批量导入
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-8 h-8 text-eco-primary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.totalCases}</div>
                    <div className="text-sm text-muted-foreground">总案例数</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-8 h-8 text-eco-secondary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.categoriesCount}</div>
                    <div className="text-sm text-muted-foreground">案例分类</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-eco-tertiary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.completedCases}</div>
                    <div className="text-sm text-muted-foreground">已完成</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-8 h-8 text-eco-quaternary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.ongoingCases}</div>
                    <div className="text-sm text-muted-foreground">进行中</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-8 h-8 text-eco-primary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.monthlyViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">月访问量</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="eco-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-eco-secondary" />
                  <div>
                    <div className="text-2xl font-bold text-eco-forest">{stats.avgRating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">平均评分</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 主要内容 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">数据概览</TabsTrigger>
              <TabsTrigger value="cases">案例管理</TabsTrigger>
              <TabsTrigger value="ai-tools">AI工具</TabsTrigger>
              <TabsTrigger value="ai-content">AI内容</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
              <TabsTrigger value="settings">系统设置</TabsTrigger>
            </TabsList>

            {/* 数据概览 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>案例分类分布</CardTitle>
                    <CardDescription>各类别案例数量统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="cases" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>案例状态分布</CardTitle>
                    <CardDescription>项目完成状态占比</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>月度趋势</CardTitle>
                  <CardDescription>案例新增和访问量趋势</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="cases" fill="#40916c" name="新增案例" />
                      <Line yAxisId="right" type="monotone" dataKey="views" stroke="#52b788" strokeWidth={2} name="访问量" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 案例管理 */}
            <TabsContent value="cases" className="space-y-6">
              {/* 搜索和筛选 */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="搜索案例..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有分类</SelectItem>
                        {Array.from(new Set(cases.map(c => c.category))).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有状态</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="ongoing">进行中</SelectItem>
                        <SelectItem value="planned">计划中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 案例表格 */}
              <Card>
                <CardHeader>
                  <CardTitle>案例列表</CardTitle>
                  <CardDescription>
                    共 {filteredCases.length} 条记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>案例标题</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>地区</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>优先级</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.slice(0, 10).map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={caseItem.image} 
                                alt={caseItem.title}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/ecological-protection.png';
                                }}
                              />
                              <span className="truncate max-w-48">{caseItem.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-eco-primary">
                              {caseItem.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{caseItem.region}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(caseItem.status)}>
                              {getStatusText(caseItem.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(caseItem.priority)}>
                              {getPriorityText(caseItem.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(caseItem.updateTime).toLocaleDateString('zh-CN')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 数据分析 */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-eco-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-eco-forest mb-2">数据分析功能</h3>
                <p className="text-muted-foreground mb-4">
                  详细的访问统计、用户行为分析和案例效果评估
                </p>
                <Button className="bg-eco-primary hover:bg-eco-secondary text-white">
                  即将上线
                </Button>
              </div>
            </TabsContent>

            {/* AI工具 */}
            <TabsContent value="ai-tools" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI配置 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      AI服务配置
                    </CardTitle>
                    <CardDescription>
                      配置各种AI服务的API密钥以启用智能功能
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIConfigComponent
                      onConfigUpdate={handleAIConfigUpdate}
                      initialConfig={aiConfig}
                    />
                  </CardContent>
                </Card>

                {/* AI图片搜索 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      AI图片搜索
                    </CardTitle>
                    <CardDescription>
                      使用AI技术搜索高质量的专业图片
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageSearch
                      aiService={aiService}
                      onImageSelect={handleImageSelect}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI内容生成 */}
            <TabsContent value="ai-content" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* AI内容生成 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI内容生成
                    </CardTitle>
                    <CardDescription>
                      使用AI技术生成专业的案例内容和分析
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContentGenerator
                      aiService={aiService}
                      onContentGenerated={handleContentGenerated}
                    />
                  </CardContent>
                </Card>

                {/* AI图片生成 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      AI图片生成
                    </CardTitle>
                    <CardDescription>
                      使用AI技术生成专业的生态治理主题图片
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageGenerator
                      aiService={aiService}
                      onImageGenerated={handleImageGenerated}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 系统设置 */}
            <TabsContent value="settings" className="space-y-6">
              <div className="text-center py-16">
                <Settings className="w-16 h-16 text-eco-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-eco-forest mb-2">系统设置</h3>
                <p className="text-muted-foreground mb-4">
                  系统配置、用户权限管理和数据备份设置
                </p>
                <Button className="bg-eco-primary hover:bg-eco-secondary text-white">
                  配置系统
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
