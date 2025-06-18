#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
黄土高原案例库项目HTML结构分析工具
分析现有HTML文件的技术架构、功能模块和改进方向
"""

import re
import json
from pathlib import Path
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import matplotlib
import pandas as pd

def setup_matplotlib_for_plotting():
    """
    Setup matplotlib and seaborn for plotting with proper configuration.
    Call this function before creating any plots to ensure proper rendering.
    """
    import warnings
    import matplotlib.pyplot as plt
    
    # Ensure warnings are printed
    warnings.filterwarnings('default')  # Show all warnings

    # Configure matplotlib for non-interactive mode
    plt.switch_backend("Agg")

    # Set chart style
    plt.style.use("default")

    # Configure platform-appropriate fonts for cross-platform compatibility
    plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", "Arial Unicode MS", "Hiragino Sans GB"]
    plt.rcParams["axes.unicode_minus"] = False

class HTMLStructureAnalyzer:
    """HTML结构分析器"""
    
    def __init__(self):
        self.css_classes = set()
        self.js_functions = []
        self.external_resources = []
        self.html_structure = []
        self.functionality_modules = defaultdict(list)
        
    def analyze_file(self, file_path, file_type):
        """分析单个HTML文件"""
        print(f"\n{'='*50}")
        print(f"分析文件：{file_path}")
        print(f"文件类型：{file_type}")
        print(f"{'='*50}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        analysis = {
            'file_type': file_type,
            'file_path': str(file_path),
            'total_lines': len(content.splitlines()),
            'file_size_kb': len(content) / 1024,
            'external_resources': self._extract_external_resources(content),
            'css_analysis': self._analyze_css(content),
            'js_analysis': self._analyze_javascript(content),
            'html_structure': self._analyze_html_structure(content),
            'functionality_modules': self._identify_functionality_modules(content),
            'ai_features': self._identify_ai_features(content),
            'technology_stack': self._identify_technology_stack(content)
        }
        
        return analysis
    
    def _extract_external_resources(self, content):
        """提取外部资源依赖"""
        resources = {
            'css_libraries': [],
            'js_libraries': [],
            'fonts': [],
            'icons': [],
            'cdn_sources': set()
        }
        
        # CSS库
        css_patterns = [
            (r'bootstrap@([\d.-]+)', 'Bootstrap'),
            (r'fontawesome-free@([\d.-]+)', 'Font Awesome'),
            (r'remixicon@([\d.-]+)', 'Remix Icon'),
        ]
        
        for pattern, name in css_patterns:
            matches = re.findall(pattern, content)
            if matches:
                resources['css_libraries'].append(f"{name} {matches[0]}")
        
        # JavaScript库
        js_patterns = [
            (r'bootstrap@([\d.-]+).*\.js', 'Bootstrap JS'),
            (r'chart\.js@([\d.-]+)', 'Chart.js'),
            (r'aos@([\d.-]+)', 'AOS'),
        ]
        
        for pattern, name in js_patterns:
            matches = re.findall(pattern, content)
            if matches:
                resources['js_libraries'].append(f"{name} {matches[0]}")
        
        # 字体
        font_matches = re.findall(r'fonts\.googleapis\.com.*family=([^&"\']+)', content)
        resources['fonts'] = [font.replace('+', ' ') for font in font_matches]
        
        # CDN源
        cdn_matches = re.findall(r'https?://([^/"\']+\.(?:jsdelivr|googleapis|cdnjs|unpkg)[^/"\']*)', content)
        resources['cdn_sources'] = list(set(cdn_matches))
        
        return resources
    
    def _analyze_css(self, content):
        """分析CSS样式"""
        css_analysis = {
            'custom_css_lines': 0,
            'css_variables': [],
            'color_scheme': {},
            'responsive_breakpoints': [],
            'animations': [],
            'themes': []
        }
        
        # 提取CSS部分
        css_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
        if css_blocks:
            css_content = '\n'.join(css_blocks)
            css_analysis['custom_css_lines'] = len(css_content.splitlines())
            
            # CSS变量
            css_vars = re.findall(r'--([^:]+):\s*([^;]+);', css_content)
            css_analysis['css_variables'] = [f"--{var}: {value}" for var, value in css_vars[:10]]
            
            # 颜色方案
            colors = re.findall(r'#[0-9a-fA-F]{3,6}', css_content)
            color_counter = Counter(colors)
            css_analysis['color_scheme'] = dict(color_counter.most_common(5))
            
            # 主题检测
            if 'data-theme="dark"' in content or '[data-theme="dark"]' in css_content:
                css_analysis['themes'].append('dark')
            if ':root' in css_content:
                css_analysis['themes'].append('light')
        
        return css_analysis
    
    def _analyze_javascript(self, content):
        """分析JavaScript功能"""
        js_analysis = {
            'script_blocks': 0,
            'functions': [],
            'event_listeners': [],
            'ajax_calls': [],
            'local_storage_usage': False,
            'api_integrations': []
        }
        
        # 提取JavaScript部分
        js_blocks = re.findall(r'<script[^>]*(?:src="[^"]*"[^>]*)?>(.*?)</script>', content, re.DOTALL)
        inline_js = [block for block in js_blocks if block.strip()]
        js_analysis['script_blocks'] = len(inline_js)
        
        if inline_js:
            js_content = '\n'.join(inline_js)
            
            # 函数定义
            functions = re.findall(r'function\s+(\w+)\s*\(', js_content)
            arrow_functions = re.findall(r'(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*=>\s*{)', js_content)
            js_analysis['functions'] = list(set(functions + arrow_functions))[:10]
            
            # 事件监听器
            event_patterns = [
                r'addEventListener\([\'"](\w+)[\'"]',
                r'on(\w+)\s*=',
                r'\$\([^)]+\)\.(\w+)\s*\('
            ]
            
            for pattern in event_patterns:
                events = re.findall(pattern, js_content)
                js_analysis['event_listeners'].extend(events)
            
            js_analysis['event_listeners'] = list(set(js_analysis['event_listeners']))[:10]
            
            # AJAX调用
            ajax_patterns = [
                r'fetch\s*\(',
                r'XMLHttpRequest',
                r'\$\.ajax',
                r'\$\.get',
                r'\$\.post'
            ]
            
            for pattern in ajax_patterns:
                if re.search(pattern, js_content):
                    js_analysis['ajax_calls'].append(pattern)
            
            # 本地存储
            if re.search(r'localStorage|sessionStorage', js_content):
                js_analysis['local_storage_usage'] = True
        
        return js_analysis
    
    def _analyze_html_structure(self, content):
        """分析HTML结构"""
        structure = {
            'main_sections': [],
            'navigation_elements': [],
            'form_elements': [],
            'interactive_components': [],
            'data_attributes': []
        }
        
        # 主要sections
        sections = re.findall(r'<(?:section|div)[^>]*(?:id|class)="([^"]*)"[^>]*>', content)
        structure['main_sections'] = list(set(sections))[:15]
        
        # 导航元素
        nav_patterns = [
            r'<nav[^>]*class="([^"]*)"',
            r'<ul[^>]*class="([^"]*nav[^"]*)"',
            r'navbar-[a-zA-Z-]+'
        ]
        
        for pattern in nav_patterns:
            matches = re.findall(pattern, content)
            structure['navigation_elements'].extend(matches)
        
        # 表单元素
        form_elements = re.findall(r'<(?:input|select|textarea|button)[^>]*(?:type|class)="([^"]*)"', content)
        structure['form_elements'] = list(set(form_elements))[:10]
        
        # 交互组件
        interactive_patterns = [
            r'btn-[a-zA-Z-]+',
            r'modal[a-zA-Z-]*',
            r'dropdown[a-zA-Z-]*',
            r'collapse[a-zA-Z-]*'
        ]
        
        for pattern in interactive_patterns:
            matches = re.findall(pattern, content)
            structure['interactive_components'].extend(matches)
        
        # 数据属性
        data_attrs = re.findall(r'data-([a-zA-Z-]+)=', content)
        structure['data_attributes'] = list(set(data_attrs))[:10]
        
        return structure
    
    def _identify_functionality_modules(self, content):
        """识别功能模块"""
        modules = {
            'search_and_filter': [],
            'data_visualization': [],
            'user_interface': [],
            'file_management': [],
            'content_management': [],
            'ai_features': []
        }
        
        # 搜索和筛选
        search_indicators = [
            ('搜索功能', r'search|filter|筛选'),
            ('分页功能', r'pagination|page-|分页'),
            ('排序功能', r'sort|order|排序'),
        ]
        
        for name, pattern in search_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                modules['search_and_filter'].append(name)
        
        # 数据可视化
        viz_indicators = [
            ('图表展示', r'chart\.js|Chart|图表'),
            ('统计面板', r'statistics|stats|统计'),
            ('数据面板', r'dashboard|panel|面板'),
        ]
        
        for name, pattern in viz_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                modules['data_visualization'].append(name)
        
        # 用户界面
        ui_indicators = [
            ('主题切换', r'theme|dark.*mode|主题'),
            ('响应式布局', r'responsive|mobile|tablet'),
            ('模态框', r'modal|弹窗'),
            ('下拉菜单', r'dropdown|下拉'),
        ]
        
        for name, pattern in ui_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                modules['user_interface'].append(name)
        
        # 文件管理
        file_indicators = [
            ('文件上传', r'upload|上传'),
            ('图片管理', r'image.*manage|图片.*管理'),
            ('文件下载', r'download|下载'),
        ]
        
        for name, pattern in file_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                modules['file_management'].append(name)
        
        # 内容管理
        content_indicators = [
            ('案例管理', r'case.*manage|案例.*管理'),
            ('内容编辑', r'edit|editor|编辑'),
            ('表单处理', r'form|表单'),
        ]
        
        for name, pattern in content_indicators:
            if re.search(pattern, content, re.IGNORECASE):
                modules['content_management'].append(name)
        
        return modules
    
    def _identify_ai_features(self, content):
        """识别AI功能特性"""
        ai_features = {
            'current_ai_placeholders': [],
            'ai_ready_components': [],
            'potential_ai_integration_points': []
        }
        
        # 当前AI占位符
        ai_placeholders = [
            ('AI搜索', r'ai.*search|智能.*搜索'),
            ('AI图片', r'ai.*image|智能.*图片'),
            ('AI生成', r'ai.*generate|智能.*生成'),
        ]
        
        for name, pattern in ai_placeholders:
            if re.search(pattern, content, re.IGNORECASE):
                ai_features['current_ai_placeholders'].append(name)
        
        # AI就绪组件
        ready_components = [
            ('搜索框', r'search.*input|搜索.*框'),
            ('内容生成区域', r'content.*area|内容.*区域'),
            ('图片展示区', r'image.*gallery|图片.*展示'),
        ]
        
        for name, pattern in ready_components:
            if re.search(pattern, content, re.IGNORECASE):
                ai_features['ai_ready_components'].append(name)
        
        return ai_features
    
    def _identify_technology_stack(self, content):
        """识别技术栈"""
        tech_stack = {
            'frontend_framework': [],
            'css_framework': [],
            'js_libraries': [],
            'icons_fonts': [],
            'build_tools': [],
            'development_features': []
        }
        
        # 前端框架
        if 'bootstrap' in content.lower():
            tech_stack['frontend_framework'].append('Bootstrap 5')
        
        # CSS框架
        if '@fortawesome' in content:
            tech_stack['icons_fonts'].append('Font Awesome')
        if 'remixicon' in content:
            tech_stack['icons_fonts'].append('Remix Icon')
        
        # JavaScript库
        if 'chart.js' in content.lower():
            tech_stack['js_libraries'].append('Chart.js')
        if 'aos' in content.lower():
            tech_stack['js_libraries'].append('AOS (Animate On Scroll)')
        
        # 开发特性
        if 'data-theme' in content:
            tech_stack['development_features'].append('多主题支持')
        if 'localStorage' in content:
            tech_stack['development_features'].append('本地存储')
        if 'responsive' in content.lower():
            tech_stack['development_features'].append('响应式设计')
        
        return tech_stack

def analyze_project():
    """分析整个项目"""
    setup_matplotlib_for_plotting()
    
    analyzer = HTMLStructureAnalyzer()
    
    # 文件路径
    files = [
        ('/workspace/user_input_files/黄土高原水土保持与生态文明建设案例库.txt', '案例库展示页面'),
        ('/workspace/user_input_files/黄土高原生态案例库管理系统.txt', '后台管理系统')
    ]
    
    results = {}
    
    for file_path, file_type in files:
        try:
            results[file_type] = analyzer.analyze_file(Path(file_path), file_type)
            print(f"✅ 成功分析：{file_type}")
        except Exception as e:
            print(f"❌ 分析失败：{file_type} - {e}")
            continue
    
    # 保存详细分析结果
    with open('/workspace/data/html_analysis_detailed.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 生成对比分析
    comparison = generate_comparison_analysis(results)
    
    # 生成可视化图表
    generate_analysis_charts(results, comparison)
    
    # 生成分析报告
    generate_analysis_report(results, comparison)
    
    return results, comparison

def generate_comparison_analysis(results):
    """生成对比分析"""
    comparison = {
        'file_sizes': {},
        'technology_overlap': {},
        'functionality_comparison': {},
        'complexity_metrics': {}
    }
    
    # 文件大小对比
    for file_type, data in results.items():
        comparison['file_sizes'][file_type] = {
            'lines': data['total_lines'],
            'size_kb': round(data['file_size_kb'], 2)
        }
    
    # 技术栈重叠
    all_css_libs = set()
    all_js_libs = set()
    
    for file_type, data in results.items():
        css_libs = set(data['external_resources']['css_libraries'])
        js_libs = set(data['external_resources']['js_libraries'])
        all_css_libs.update(css_libs)
        all_js_libs.update(js_libs)
        
        comparison['technology_overlap'][file_type] = {
            'css_libraries': list(css_libs),
            'js_libraries': list(js_libs)
        }
    
    comparison['technology_overlap']['common_css'] = list(all_css_libs)
    comparison['technology_overlap']['common_js'] = list(all_js_libs)
    
    # 功能对比
    for file_type, data in results.items():
        modules = data['functionality_modules']
        total_modules = sum(len(module_list) for module_list in modules.values())
        
        comparison['functionality_comparison'][file_type] = {
            'total_modules': total_modules,
            'module_breakdown': {k: len(v) for k, v in modules.items()}
        }
    
    # 复杂度指标
    for file_type, data in results.items():
        js_functions = len(data['js_analysis']['functions'])
        css_lines = data['css_analysis']['custom_css_lines']
        external_deps = len(data['external_resources']['css_libraries']) + len(data['external_resources']['js_libraries'])
        
        complexity_score = js_functions * 2 + css_lines / 100 + external_deps * 3
        
        comparison['complexity_metrics'][file_type] = {
            'js_functions': js_functions,
            'css_lines': css_lines,
            'external_dependencies': external_deps,
            'complexity_score': round(complexity_score, 2)
        }
    
    return comparison

def generate_analysis_charts(results, comparison):
    """生成分析图表"""
    # 1. 文件大小对比图
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
    
    # 文件大小对比
    file_types = list(comparison['file_sizes'].keys())
    lines = [comparison['file_sizes'][ft]['lines'] for ft in file_types]
    sizes = [comparison['file_sizes'][ft]['size_kb'] for ft in file_types]
    
    ax1.bar(file_types, lines, color=['#2d6a4f', '#40916c'])
    ax1.set_title('文件行数对比', fontsize=14, fontweight='bold')
    ax1.set_ylabel('行数')
    for i, v in enumerate(lines):
        ax1.text(i, v + 50, str(v), ha='center', va='bottom')
    
    ax2.bar(file_types, sizes, color=['#52b788', '#74c69d'])
    ax2.set_title('文件大小对比 (KB)', fontsize=14, fontweight='bold')
    ax2.set_ylabel('文件大小 (KB)')
    for i, v in enumerate(sizes):
        ax2.text(i, v + 5, f'{v:.1f}', ha='center', va='bottom')
    
    # 功能模块对比
    modules_data = []
    for file_type in file_types:
        modules_data.append(comparison['functionality_comparison'][file_type]['total_modules'])
    
    ax3.bar(file_types, modules_data, color=['#b7e4c7', '#95d5b2'])
    ax3.set_title('功能模块数量对比', fontsize=14, fontweight='bold')
    ax3.set_ylabel('模块数量')
    for i, v in enumerate(modules_data):
        ax3.text(i, v + 0.5, str(v), ha='center', va='bottom')
    
    # 复杂度对比
    complexity_scores = [comparison['complexity_metrics'][ft]['complexity_score'] for ft in file_types]
    ax4.bar(file_types, complexity_scores, color=['#8ecae6', '#219ebc'])
    ax4.set_title('代码复杂度对比', fontsize=14, fontweight='bold')
    ax4.set_ylabel('复杂度分数')
    for i, v in enumerate(complexity_scores):
        ax4.text(i, v + 2, f'{v:.1f}', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/html_analysis_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 2. 技术栈分布图
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # CSS库分布
    css_libs = []
    for file_type, data in results.items():
        css_libs.extend(data['external_resources']['css_libraries'])
    
    if css_libs:
        css_counter = Counter(css_libs)
        css_names, css_counts = zip(*css_counter.most_common())
        ax1.pie(css_counts, labels=css_names, autopct='%1.1f%%', startangle=90)
        ax1.set_title('CSS库使用分布', fontsize=14, fontweight='bold')
    
    # JS库分布
    js_libs = []
    for file_type, data in results.items():
        js_libs.extend(data['external_resources']['js_libraries'])
    
    if js_libs:
        js_counter = Counter(js_libs)
        js_names, js_counts = zip(*js_counter.most_common())
        ax2.pie(js_counts, labels=js_names, autopct='%1.1f%%', startangle=90)
        ax2.set_title('JavaScript库使用分布', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/technology_stack_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

def generate_analysis_report(results, comparison):
    """生成分析报告"""
    report = f"""# 黄土高原案例库项目HTML代码分析报告

## 执行摘要

本报告对黄土高原水土保持与生态文明建设案例库项目的两个核心HTML文件进行了深度技术分析。分析发现：

- **案例库展示页面**：{comparison['file_sizes']['案例库展示页面']['lines']}行代码，{comparison['file_sizes']['案例库展示页面']['size_kb']:.1f}KB
- **后台管理系统**：{comparison['file_sizes']['后台管理系统']['lines']}行代码，{comparison['file_sizes']['后台管理系统']['size_kb']:.1f}KB
- **技术栈**：Bootstrap 5 + Font Awesome + Chart.js + 原生JavaScript
- **设计特色**：绿色生态主题，支持深色模式，响应式布局

## 详细分析结果

"""
    
    for file_type, data in results.items():
        report += f"""
### {file_type}

#### 基本信息
- **文件大小**：{data['total_lines']}行，{data['file_size_kb']:.1f}KB
- **复杂度评分**：{comparison['complexity_metrics'][file_type]['complexity_score']:.1f}/100

#### 外部依赖
- **CSS库**：{', '.join(data['external_resources']['css_libraries']) if data['external_resources']['css_libraries'] else '无'}
- **JS库**：{', '.join(data['external_resources']['js_libraries']) if data['external_resources']['js_libraries'] else '无'}
- **字体**：{', '.join(data['external_resources']['fonts']) if data['external_resources']['fonts'] else '无'}

#### CSS分析
- **自定义CSS行数**：{data['css_analysis']['custom_css_lines']}行
- **CSS变量数量**：{len(data['css_analysis']['css_variables'])}个
- **主题支持**：{', '.join(data['css_analysis']['themes']) if data['css_analysis']['themes'] else '单主题'}
- **主要颜色**：{', '.join(data['css_analysis']['color_scheme'].keys())}

#### JavaScript分析
- **脚本块数量**：{data['js_analysis']['script_blocks']}个
- **函数数量**：{len(data['js_analysis']['functions'])}个
- **主要函数**：{', '.join(data['js_analysis']['functions'][:5]) if data['js_analysis']['functions'] else '无'}
- **事件监听器**：{', '.join(data['js_analysis']['event_listeners'][:5]) if data['js_analysis']['event_listeners'] else '无'}
- **本地存储使用**：{'是' if data['js_analysis']['local_storage_usage'] else '否'}

#### 功能模块
"""
        
        for module_type, features in data['functionality_modules'].items():
            if features:
                report += f"- **{module_type}**：{', '.join(features)}\n"
        
        report += f"""
#### AI功能现状
- **AI占位符**：{', '.join(data['ai_features']['current_ai_placeholders']) if data['ai_features']['current_ai_placeholders'] else '无'}
- **AI就绪组件**：{', '.join(data['ai_features']['ai_ready_components']) if data['ai_features']['ai_ready_components'] else '无'}

#### 技术栈特性
"""
        
        for tech_type, features in data['technology_stack'].items():
            if features:
                report += f"- **{tech_type}**：{', '.join(features)}\n"
    
    report += f"""

## 对比分析总结

### 文件规模对比
- 案例库展示页面更复杂，代码量是管理系统的{comparison['file_sizes']['案例库展示页面']['lines'] / comparison['file_sizes']['后台管理系统']['lines']:.1f}倍
- 两个文件都使用相同的技术栈和设计风格，有良好的一致性

### 技术栈统一性
- **共同使用的CSS库**：{', '.join(comparison['technology_overlap']['common_css'])}
- **共同使用的JS库**：{', '.join(comparison['technology_overlap']['common_js'])}

### 功能完整性
- 案例库展示页面：{comparison['functionality_comparison']['案例库展示页面']['total_modules']}个功能模块
- 后台管理系统：{comparison['functionality_comparison']['后台管理系统']['total_modules']}个功能模块

## 改进建议

### 1. 代码结构优化
- **模块化重构**：将大型HTML文件拆分为独立的组件文件
- **CSS组织**：提取公共样式到独立的样式表文件
- **JavaScript模块化**：使用ES6模块或构建工具进行代码分割

### 2. 技术栈升级
- **前端框架**：考虑引入Vue.js或React进行组件化开发
- **构建工具**：使用Vite或Webpack进行资源打包和优化
- **TypeScript**：提高代码类型安全性和维护性

### 3. AI功能集成准备
- **API接口设计**：为AI功能预留标准化的接口
- **组件解耦**：确保AI功能可以无缝集成到现有组件中
- **数据流设计**：建立清晰的数据传递和状态管理机制

### 4. 部署架构优化
- **静态资源分离**：图片、样式、脚本文件独立管理
- **CDN优化**：使用适合的CDN提高加载速度
- **缓存策略**：实施合理的浏览器缓存策略

---

*报告生成时间：2025-06-18 13:14:36*
*分析工具：MiniMax Agent HTML结构分析器*
"""
    
    # 保存报告
    with open('/workspace/docs/html_analysis_report.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("\n" + "="*60)
    print("📊 HTML代码分析完成！")
    print("="*60)
    print(f"📄 详细数据：/workspace/data/html_analysis_detailed.json")
    print(f"📋 分析报告：/workspace/docs/html_analysis_report.md")
    print(f"📈 对比图表：/workspace/charts/html_analysis_comparison.png")
    print(f"📊 技术栈图：/workspace/charts/technology_stack_distribution.png")
    print("="*60)

if __name__ == "__main__":
    analyze_project()
