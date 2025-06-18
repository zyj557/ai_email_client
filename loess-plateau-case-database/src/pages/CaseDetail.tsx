import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Calendar, Tag, Share2, Download, 
  TrendingUp, Target, CheckCircle, FileText, Image as ImageIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';

interface Case {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  detailedDescription: string;
  achievementData: {
    [key: string]: {
      before?: number;
      after?: number;
      value?: number;
      total?: number;
      unit: string;
    };
  };
  timeline: Array<{
    year: number;
    event: string;
  }>;
  measures: string[];
  benefits: {
    ecological: string;
    economic: string;
    social: string;
  };
  image: string;
  tags: string[];
  status: string;
  priority: string;
  createTime: string;
  updateTime: string;
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [relatedCases, setRelatedCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await fetch('/data/cases.json');
        const allCases = await response.json();
        
        const selectedCase = allCases.find((c: Case) => c.id === id);
        if (selectedCase) {
          setCaseData(selectedCase);
          
          // 获取相关案例（同分类的其他案例）
          const related = allCases
            .filter((c: Case) => c.category === selectedCase.category && c.id !== selectedCase.id)
            .slice(0, 3);
          setRelatedCases(related);
        }
      } catch (error) {
        console.error('Failed to fetch case data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCaseData();
    }
  }, [id]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: caseData?.title,
        text: caseData?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // 这里可以添加一个提示
    }
  };

  const handleDownload = () => {
    // 这里可以实现PDF下载功能
    console.log('Download case report');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-eco-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-eco-primary">加载案例详情中...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-eco-forest mb-4">案例未找到</h2>
          <p className="text-muted-foreground mb-4">请检查案例ID是否正确</p>
          <Link to="/cases">
            <Button>返回案例库</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link to="/cases">
            <Button variant="ghost" className="text-eco-primary hover:text-eco-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回案例库
            </Button>
          </Link>
        </motion.div>

        {/* 案例头部信息 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <div className="relative h-64 md:h-96">
              <img 
                src={caseData.image} 
                alt={caseData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/ecological-protection.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-eco-primary text-white">
                    {caseData.category}
                  </Badge>
                  <Badge className={`${getStatusColor(caseData.status)}`}>
                    {getStatusText(caseData.status)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                    优先级: {caseData.priority === 'high' ? '高' : caseData.priority === 'medium' ? '中' : '低'}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                  {caseData.title}
                </h1>
                <div className="flex items-center space-x-4 text-eco-light">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {caseData.region}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(caseData.updateTime).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <p className="text-lg text-muted-foreground mb-4 md:mb-0 flex-grow">
                  {caseData.description}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {caseData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-eco-primary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 详细内容 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概述</TabsTrigger>
              <TabsTrigger value="achievements">成效数据</TabsTrigger>
              <TabsTrigger value="timeline">时间线</TabsTrigger>
              <TabsTrigger value="measures">措施分析</TabsTrigger>
            </TabsList>

            {/* 概述标签页 */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-eco-primary" />
                    详细描述
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-eco max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {caseData.detailedDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-eco-primary">生态效益</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {caseData.benefits.ecological}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-eco-secondary">经济效益</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {caseData.benefits.economic}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-eco-tertiary">社会效益</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {caseData.benefits.social}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 成效数据标签页 */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-eco-primary" />
                    关键指标
                  </CardTitle>
                  <CardDescription>
                    项目实施前后的关键生态指标对比
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(caseData.achievementData).map(([key, data]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-eco-forest">
                            {key === 'forestCoverage' ? '森林覆盖率' :
                             key === 'vegetationCoverage' ? '植被覆盖率' :
                             key === 'sedimentReduction' ? '减沙效果' :
                             key === 'area' ? '治理面积' :
                             key === 'soilErosionControl' ? '水土流失控制' :
                             key === 'perCapitaIncome' ? '人均收入' :
                             key === 'reservoirCapacity' ? '库容' :
                             key === 'powerGeneration' ? '发电量' :
                             key === 'floodControl' ? '防洪标准' :
                             key === 'retiredArea' ? '退耕面积' :
                             key === 'airQuality' ? '空气质量' :
                             key === 'damNumber' ? '淤地坝数量' :
                             key === 'siltageLand' ? '淤地面积' :
                             key === 'grainIncrease' ? '粮食增产' :
                             key === 'terraceArea' ? '梯田面积' :
                             key === 'soilRetention' ? '保土效果' :
                             key === 'waterRetention' ? '保水效果' :
                             key === 'yieldIncrease' ? '产量提升' : key}
                          </span>
                          <span className="text-sm text-muted-foreground">{data.unit}</span>
                        </div>
                        
                        {data.before !== undefined && data.after !== undefined ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>治理前: {data.before}{data.unit}</span>
                              <span>治理后: {data.after}{data.unit}</span>
                            </div>
                            <Progress 
                              value={(data.after / Math.max(data.before, data.after)) * 100} 
                              className="h-2"
                            />
                            <div className="text-center text-sm text-eco-primary font-medium">
                              提升 {((data.after - data.before) / data.before * 100).toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-eco-primary">
                              {data.value || data.total}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {data.unit}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 时间线标签页 */}
            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-eco-primary" />
                    项目时间线
                  </CardTitle>
                  <CardDescription>
                    项目从开始到现在的重要节点和里程碑
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-eco-light"></div>
                    <div className="space-y-6">
                      {caseData.timeline.map((item, index) => (
                        <div key={index} className="relative flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-eco-forest">{item.year}</span>
                              <Badge variant="outline" className="text-xs">
                                第{index + 1}年
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{item.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 措施分析标签页 */}
            <TabsContent value="measures" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-eco-primary" />
                    实施措施
                  </CardTitle>
                  <CardDescription>
                    项目采取的主要治理措施和技术手段
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseData.measures.map((measure, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-eco-grass">
                        <CheckCircle className="w-5 h-5 text-eco-primary flex-shrink-0" />
                        <span className="text-eco-forest">{measure}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* 相关案例 */}
        {relatedCases.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Separator className="mb-8" />
            <h2 className="text-2xl font-serif font-bold text-eco-forest mb-6">
              相关案例
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCases.map((relatedCase) => (
                <Link key={relatedCase.id} to={`/cases/${relatedCase.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 eco-card">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={relatedCase.image} 
                        alt={relatedCase.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/ecological-protection.png';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-eco-primary text-white">
                          {relatedCase.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg group-hover:text-eco-primary transition-colors">
                        {relatedCase.title}
                      </CardTitle>
                      <CardDescription className="text-eco-secondary">
                        {relatedCase.region}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedCase.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CaseDetail;
