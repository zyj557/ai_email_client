import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TreePine, Droplets, Mountain, Leaf, TrendingUp, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

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
}

const HomePage: React.FC = () => {
  const [featuredCases, setFeaturedCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCases = async () => {
      try {
        const response = await fetch('/data/cases.json');
        const allCases = await response.json();
        // 获取优先级高的案例作为特色案例
        const featured = allCases.filter((c: Case) => c.priority === 'high').slice(0, 3);
        setFeaturedCases(featured);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCases();
  }, []);

  const statistics = [
    {
      icon: <TreePine className="w-8 h-8 text-eco-primary" />,
      title: "案例总数",
      value: "120+",
      description: "涵盖生态修复各个领域",
      color: "bg-eco-light"
    },
    {
      icon: <Mountain className="w-8 h-8 text-eco-secondary" />,
      title: "治理面积",
      value: "2000+",
      description: "万亩治理成果",
      color: "bg-eco-accent"
    },
    {
      icon: <Droplets className="w-8 h-8 text-eco-tertiary" />,
      title: "减沙效果",
      value: "85%",
      description: "平均减沙率",
      color: "bg-eco-quaternary"
    },
    {
      icon: <Users className="w-8 h-8 text-eco-primary" />,
      title: "受益人口",
      value: "500+",
      description: "万人直接受益",
      color: "bg-eco-light"
    }
  ];

  const categories = [
    {
      name: "生态修复",
      description: "退耕还林、植被恢复等",
      icon: <Leaf className="w-6 h-6" />,
      color: "bg-eco-primary",
      count: 45
    },
    {
      name: "工程措施",
      description: "淤地坝、梯田建设等",
      icon: <Mountain className="w-6 h-6" />,
      color: "bg-eco-secondary",
      count: 38
    },
    {
      name: "综合治理",
      description: "小流域综合治理",
      icon: <TreePine className="w-6 h-6" />,
      color: "bg-eco-tertiary",
      count: 32
    },
    {
      name: "政策创新",
      description: "生态文明建设实践",
      icon: <Award className="w-6 h-6" />,
      color: "bg-eco-quaternary",
      count: 28
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eco-primary via-eco-secondary to-eco-tertiary"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="mb-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                  生态文明建设典型案例
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
                  黄土高原
                  <br />
                  <span className="text-eco-light">生态治理</span>
                  <br />
                  案例库
                </h1>
                <p className="text-xl text-eco-light leading-relaxed mb-8">
                  汇聚理论与实践的生态治理典型案例，展现黄土高原水土保持与生态文明建设的卓越成就，
                  为可持续发展提供科学参考和实践指导。
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/cases">
                  <Button size="lg" className="bg-white text-eco-primary hover:bg-eco-light hover:text-eco-forest group">
                    探索案例库
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-eco-primary">
                  了解更多
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/loess-plateau-terraces.jpg" 
                  alt="黄土高原梯田"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Floating Stats Cards */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-eco-primary" />
                        <div>
                          <div className="text-lg font-bold text-eco-forest">53.1%</div>
                          <div className="text-xs text-gray-600">森林覆盖率</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-eco-secondary" />
                        <div>
                          <div className="text-lg font-bold text-eco-forest">88%</div>
                          <div className="text-xs text-gray-600">减沙效果</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-eco-grass">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-eco-forest mb-4">
              生态治理成果
            </h2>
            <p className="text-lg text-eco-primary max-w-2xl mx-auto">
              通过科学治理和持续努力，黄土高原生态环境发生了根本性改变
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-eco-forest mb-2">{stat.value}</div>
                    <div className="font-semibold text-eco-primary mb-2">{stat.title}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-eco-forest mb-4">
              案例分类
            </h2>
            <p className="text-lg text-eco-primary max-w-2xl mx-auto">
              涵盖水土保持与生态文明建设的各个领域
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/cases?category=${category.name}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer eco-card">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-eco-forest mb-2 group-hover:text-eco-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-eco-light text-eco-forest">
                          {category.count} 个案例
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-eco-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-eco-forest mb-4">
              典型案例
            </h2>
            <p className="text-lg text-eco-primary max-w-2xl mx-auto">
              精选具有代表性和示范意义的生态治理成功案例
            </p>
          </motion.div>

          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCases.map((caseItem, index) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/cases/${caseItem.id}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 eco-card">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={caseItem.image} 
                          alt={caseItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-eco-primary text-white">
                            {caseItem.category}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="group-hover:text-eco-primary transition-colors">
                          {caseItem.title}
                        </CardTitle>
                        <CardDescription className="text-eco-secondary">
                          {caseItem.region}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {caseItem.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {caseItem.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/cases">
              <Button size="lg" className="bg-eco-primary hover:bg-eco-secondary text-white">
                查看更多案例
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-eco-primary to-eco-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6">
              共建生态文明，守护绿水青山
            </h2>
            <p className="text-xl text-eco-light mb-8">
              让我们携手努力，为黄土高原的生态文明建设贡献力量，
              为子孙后代留下天更蓝、山更绿、水更清的美好家园。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cases">
                <Button size="lg" className="bg-white text-eco-primary hover:bg-eco-light">
                  探索更多案例
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-eco-primary">
                  参与建设
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
