import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, TreePine, Mountain, Droplets, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: '首页' },
    { href: '/cases', label: '案例库' },
    { href: '/admin', label: '管理系统' },
  ];

  const ecoLinks = [
    { href: '/cases?category=ecological-restoration', label: '生态修复' },
    { href: '/cases?category=engineering-measures', label: '工程措施' },
    { href: '/cases?category=comprehensive-treatment', label: '综合治理' },
    { href: '/cases?category=ecological-civilization', label: '生态文明建设' },
  ];

  return (
    <footer className="bg-eco-forest text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-eco-tertiary to-eco-quaternary rounded-lg flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-eco-forest" />
                  </div>
                  <Mountain className="absolute -top-1 -right-1 w-4 h-4 text-eco-quaternary" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-eco-light">
                    黄土高原水土保持与生态文明建设案例库
                  </h3>
                  <p className="text-sm text-eco-quaternary">
                    理论与实践的生态治理典型案例集合
                  </p>
                </div>
              </div>
              <p className="text-eco-light mb-4 leading-relaxed">
                致力于收集和展示黄土高原地区水土保持与生态文明建设的成功案例，
                为生态治理提供科学参考和实践指导，推动可持续发展理念的传播与应用。
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-eco-quaternary">
                  <TreePine className="w-4 h-4" />
                  <span className="text-sm">生态优先</span>
                </div>
                <div className="flex items-center space-x-2 text-eco-quaternary">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">绿色发展</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-eco-light mb-4">
                快速导航
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-eco-quaternary hover:text-eco-light transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ecological Categories */}
            <div>
              <h4 className="text-lg font-semibold text-eco-light mb-4">
                案例分类
              </h4>
              <ul className="space-y-2">
                {ecoLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-eco-quaternary hover:text-eco-light transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-eco-primary"></div>

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-eco-quaternary text-sm">
                © {currentYear} 黄土高原案例库. 保留所有权利.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-eco-quaternary text-sm">
                技术支持:
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-eco-tertiary rounded flex items-center justify-center">
                  <Github className="w-3 h-3 text-eco-forest" />
                </div>
                <div className="w-6 h-6 bg-eco-tertiary rounded flex items-center justify-center">
                  <Mail className="w-3 h-3 text-eco-forest" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
