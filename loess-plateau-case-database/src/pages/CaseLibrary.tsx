import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin, Calendar, Tag, TrendingUp, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Case {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  detailedDescription: string;
  achievementData: any;
  timeline: any[];
  measures: string[];
  benefits: any;
  image: string;
  tags: string[];
  status: string;
  priority: string;
  createTime: string;
  updateTime: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: { id: string; name: string; count: number }[];
}

const CaseLibrary: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'updateTime');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesResponse, categoriesResponse] = await Promise.all([
          fetch('/data/cases.json'),
          fetch('/data/categories.json')
        ]);
        
        const casesData = await casesResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setCases(casesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 更新URL参数
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedRegion !== 'all') params.set('region', selectedRegion);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (sortBy !== 'updateTime') params.set('sort', sortBy);
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedRegion, selectedStatus, sortBy, setSearchParams]);

  // 获取所有地区
  const regions = useMemo(() => {
    const regionSet = new Set(cases.map(c => c.region));
    return Array.from(regionSet).sort();
  }, [cases]);

  // 过滤和排序案例
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesRegion && matchesStatus;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createTime':
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
        case 'updateTime':
          return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cases, searchQuery, selectedCategory, selectedRegion, selectedStatus, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSelectedStatus('all');
    setSortBy('updateTime');
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-eco-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-eco-primary">加载案例数据中...</p>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-eco-forest mb-4">
              案例库
            </h1>
            <p className="text-lg text-eco-primary max-w-2xl mx-auto">
              探索黄土高原水土保持与生态文明建设的典型案例，学习成功经验，指导实践应用
            </p>
          </div>

          {/* 搜索和筛选区域 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              {/* 搜索框 */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="搜索案例标题、描述或标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 分类筛选 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 地区筛选 */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有地区</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 状态筛选 */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="ongoing">进行中</SelectItem>
                  <SelectItem value="planned">计划中</SelectItem>
                </SelectContent>
              </Select>

              {/* 排序 */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updateTime">最近更新</SelectItem>
                  <SelectItem value="createTime">创建时间</SelectItem>
                  <SelectItem value="title">标题排序</SelectItem>
                  <SelectItem value="priority">优先级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  找到 {filteredAndSortedCases.length} 个案例
                </span>
                {(searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all' || selectedStatus !== 'all') && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    <Filter className="w-4 h-4 mr-2" />
                    清除筛选
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 案例列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCases.map((caseItem, index) => (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <Link to={`/cases/${caseItem.id}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 eco-card h-full">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={caseItem.image} 
                            alt={caseItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/ecological-protection.png';
                            }}
                          />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <Badge className="bg-eco-primary text-white">
                              {caseItem.category}
                            </Badge>
                            <Badge className={`${getStatusColor(caseItem.status)}`}>
                              {getStatusText(caseItem.status)}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="bg-white/90">
                              {caseItem.priority === 'high' ? '高' : caseItem.priority === 'medium' ? '中' : '低'}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <CardTitle className="group-hover:text-eco-primary transition-colors text-lg">
                            {caseItem.title}
                          </CardTitle>
                          <CardDescription className="flex items-center text-eco-secondary">
                            <MapPin className="w-4 h-4 mr-1" />
                            {caseItem.region}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {caseItem.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {caseItem.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {caseItem.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{caseItem.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(caseItem.updateTime).toLocaleDateString('zh-CN')}
                            </div>
                            <div className="flex items-center text-eco-primary">
                              <Eye className="w-3 h-3 mr-1" />
                              查看详情
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredAndSortedCases.map((caseItem, index) => (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <Link to={`/cases/${caseItem.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 eco-card">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                              <img 
                                src={caseItem.image} 
                                alt={caseItem.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/ecological-protection.png';
                                }}
                              />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold group-hover:text-eco-primary transition-colors">
                                    {caseItem.title}
                                  </h3>
                                  <div className="flex items-center text-sm text-eco-secondary mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {caseItem.region}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge className="bg-eco-primary text-white">
                                    {caseItem.category}
                                  </Badge>
                                  <Badge className={`${getStatusColor(caseItem.status)}`}>
                                    {getStatusText(caseItem.status)}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {caseItem.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {caseItem.tags.slice(0, 4).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(caseItem.updateTime).toLocaleDateString('zh-CN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredAndSortedCases.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-eco-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-eco-primary" />
              </div>
              <h3 className="text-lg font-semibold text-eco-forest mb-2">未找到匹配的案例</h3>
              <p className="text-muted-foreground mb-4">
                请尝试调整搜索条件或筛选器
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                重置筛选条件
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CaseLibrary;
