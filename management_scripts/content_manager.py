#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
黄土高原案例库内容管理脚本
功能：批量添加案例、导入数据、内容验证、SEO优化

使用方法：
python content_manager.py --help
"""

import os
import sys
import json
import csv
import argparse
import requests
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import re
from pathlib import Path

class ContentManager:
    def __init__(self, supabase_url: str = "", supabase_key: str = ""):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
    
    def load_env_config(self):
        """从环境文件加载配置"""
        env_file = '.env.local'
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        if key == 'VITE_SUPABASE_URL':
                            self.supabase_url = value
                        elif key == 'VITE_SUPABASE_ANON_KEY':
                            self.supabase_key = value
            
            self.headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
    
    def validate_case_data(self, case_data: Dict) -> List[str]:
        """验证案例数据完整性"""
        errors = []
        required_fields = ['title', 'description', 'category_id', 'status']
        
        for field in required_fields:
            if not case_data.get(field):
                errors.append(f"缺少必需字段: {field}")
        
        # 验证标题长度
        if case_data.get('title') and len(case_data['title']) > 200:
            errors.append("标题长度不能超过200字符")
        
        # 验证状态值
        valid_statuses = ['draft', 'review', 'published', 'archived']
        if case_data.get('status') not in valid_statuses:
            errors.append(f"状态值无效，必须是: {', '.join(valid_statuses)}")
        
        # 验证分类ID
        if case_data.get('category_id') and not isinstance(case_data['category_id'], int):
            errors.append("category_id必须是整数")
        
        return errors
    
    def optimize_content_for_seo(self, case_data: Dict) -> Dict:
        """优化内容以提高SEO"""
        optimized = case_data.copy()
        
        # 生成SEO友好的slug
        if 'title' in optimized:
            slug = self.generate_slug(optimized['title'])
            optimized['slug'] = slug
        
        # 确保description长度适中（150-160字符最佳）
        if 'description' in optimized:
            desc = optimized['description']
            if len(desc) > 160:
                optimized['meta_description'] = desc[:157] + '...'\n            else:\n                optimized['meta_description'] = desc
        
        # 提取关键词作为tags
        if 'content' in optimized and 'tags' not in optimized:
            keywords = self.extract_keywords(optimized['content'])\n            optimized['tags'] = keywords[:5]  # 限制最多5个标签
        
        return optimized
    
    def generate_slug(self, title: str) -> str:
        \"\"\"生成URL友好的slug\"\"\"
        # 转换为小写并替换空格为连字符
        slug = re.sub(r'[^\\w\\s-]', '', title.lower())
        slug = re.sub(r'[-\\s]+', '-', slug)
        return slug.strip('-')
    
    def extract_keywords(self, content: str) -> List[str]:
        \"\"\"从内容中提取关键词\"\"\"
        # 简单的关键词提取（可以用更复杂的NLP方法）
        keywords = []
        
        # 定义生态相关的关键词
        eco_keywords = [
            '水土保持', '生态治理', '植被恢复', '梯田', '淤地坝',
            '黄土高原', '水土流失', '生态文明', '绿化', '造林',
            '坡面治理', '沟道治理', '小流域', '综合治理', '退耕还林'
        ]
        
        content_lower = content.lower()
        for keyword in eco_keywords:
            if keyword in content:
                keywords.append(keyword)
        
        return keywords
    
    def create_case(self, case_data: Dict) -> Optional[str]:
        \"\"\"创建新案例\"\"\"
        # 验证数据
        errors = self.validate_case_data(case_data)
        if errors:
            print(f\"❌ 数据验证失败: {', '.join(errors)}\")
            return None
        
        # SEO优化
        optimized_data = self.optimize_content_for_seo(case_data)
        
        # 添加创建时间和ID
        optimized_data.update({
            'id': str(uuid.uuid4()),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
        
        try:
            response = requests.post(
                f\"{self.supabase_url}/rest/v1/cases\",
                json=optimized_data,
                headers=self.headers
            )
            
            if response.status_code == 201:
                case_id = response.json()[0]['id']
                print(f\"✅ 案例创建成功: {case_id}\")
                return case_id
            else:
                print(f\"❌ 创建失败: {response.text}\")
                return None
                
        except Exception as e:
            print(f\"❌ 创建异常: {e}\")
            return None
    
    def batch_import_from_csv(self, csv_file: str) -> Dict:
        \"\"\"从CSV文件批量导入案例\"\"\"
        results = {'success': 0, 'failed': 0, 'errors': []}
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row_num, row in enumerate(reader, 1):
                    # 转换字符串为适当的数据类型
                    processed_row = self.process_csv_row(row)
                    
                    case_id = self.create_case(processed_row)
                    if case_id:
                        results['success'] += 1
                        print(f\"第{row_num}行: 成功创建案例 {processed_row.get('title', '')}\")
                    else:
                        results['failed'] += 1
                        results['errors'].append(f\"第{row_num}行: {processed_row.get('title', '')}\")
        
        except FileNotFoundError:
            print(f\"❌ 文件未找到: {csv_file}\")
        except Exception as e:
            print(f\"❌ 导入异常: {e}\")
        
        return results
    
    def process_csv_row(self, row: Dict) -> Dict:
        \"\"\"处理CSV行数据\"\"\"
        processed = {}
        
        # 字段映射
        field_mapping = {
            'title': 'title',
            'description': 'description', 
            'content': 'content',
            'category_id': 'category_id',
            'region': 'region',
            'status': 'status',
            'tags': 'tags',
            'summary': 'summary',
            'subtitle': 'subtitle'
        }
        
        for csv_field, db_field in field_mapping.items():
            if csv_field in row and row[csv_field]:
                value = row[csv_field].strip()
                
                # 特殊处理
                if db_field == 'category_id':
                    processed[db_field] = int(value) if value.isdigit() else 1
                elif db_field == 'tags':
                    # 处理标签（逗号分隔）
                    processed[db_field] = [tag.strip() for tag in value.split(',') if tag.strip()]
                elif db_field == 'status':
                    processed[db_field] = value if value in ['draft', 'review', 'published', 'archived'] else 'draft'
                else:
                    processed[db_field] = value
        
        return processed
    
    def export_cases_to_csv(self, output_file: str, status: str = 'published') -> bool:
        \"\"\"导出案例到CSV文件\"\"\"
        try:
            # 获取案例数据
            url = f\"{self.supabase_url}/rest/v1/cases\"
            params = {'status': f'eq.{status}'}
            
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code != 200:
                print(f\"❌ 获取数据失败: {response.text}\")
                return False
            
            cases = response.json()
            
            if not cases:
                print(\"⚠️ 没有找到匹配的案例\")
                return False
            
            # 写入CSV文件
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                fieldnames = ['id', 'title', 'description', 'content', 'category_id', 
                             'region', 'status', 'tags', 'view_count', 'like_count',
                             'created_at', 'updated_at']
                
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                for case in cases:
                    # 处理数组字段
                    row = case.copy()
                    if 'tags' in row and isinstance(row['tags'], list):
                        row['tags'] = ', '.join(row['tags'])
                    
                    writer.writerow(row)
            
            print(f\"✅ 已导出 {len(cases)} 个案例到 {output_file}\")
            return True
            
        except Exception as e:
            print(f\"❌ 导出异常: {e}\")
            return False
    
    def update_case_images(self, case_id: str, image_urls: List[str]) -> bool:
        \"\"\"更新案例图片\"\"\"
        try:
            # 构建图片数据
            media_data = []
            for i, url in enumerate(image_urls):
                media_data.append({
                    'case_id': case_id,
                    'file_type': 'image',
                    'file_url': url,
                    'file_name': f'image_{i+1}',
                    'sort_order': i
                })
            
            # 先删除现有图片
            delete_response = requests.delete(
                f\"{self.supabase_url}/rest/v1/media_files\",
                headers=self.headers,
                params={'case_id': f'eq.{case_id}', 'file_type': 'eq.image'}
            )
            
            # 添加新图片
            if media_data:
                response = requests.post(
                    f\"{self.supabase_url}/rest/v1/media_files\",
                    json=media_data,
                    headers=self.headers
                )
                
                if response.status_code == 201:
                    print(f\"✅ 已更新案例 {case_id} 的 {len(image_urls)} 张图片\")
                    return True
                else:
                    print(f\"❌ 更新图片失败: {response.text}\")
                    return False
            
            return True
            
        except Exception as e:
            print(f\"❌ 更新图片异常: {e}\")
            return False
    
    def generate_content_report(self) -> Dict:
        \"\"\"生成内容分析报告\"\"\"
        try:
            # 获取统计数据
            cases_response = requests.get(
                f\"{self.supabase_url}/rest/v1/cases\",
                headers=self.headers,
                params={'select': 'status,category_id,view_count,like_count,created_at'}
            )
            
            categories_response = requests.get(
                f\"{self.supabase_url}/rest/v1/categories\",
                headers=self.headers
            )
            
            if cases_response.status_code != 200 or categories_response.status_code != 200:
                print(\"❌ 获取数据失败\")
                return {}
            
            cases = cases_response.json()
            categories = {cat['id']: cat['name'] for cat in categories_response.json()}
            
            # 分析数据
            report = {
                'total_cases': len(cases),
                'status_distribution': {},
                'category_distribution': {},
                'engagement_stats': {
                    'total_views': sum(case.get('view_count', 0) for case in cases),
                    'total_likes': sum(case.get('like_count', 0) for case in cases),
                    'avg_views': 0,
                    'avg_likes': 0
                },
                'recent_activity': {}
            }
            
            # 状态分布
            for case in cases:
                status = case.get('status', 'unknown')
                report['status_distribution'][status] = report['status_distribution'].get(status, 0) + 1
            
            # 分类分布
            for case in cases:
                cat_id = case.get('category_id')
                cat_name = categories.get(cat_id, 'Unknown')
                report['category_distribution'][cat_name] = report['category_distribution'].get(cat_name, 0) + 1
            
            # 参与度统计
            if cases:
                report['engagement_stats']['avg_views'] = report['engagement_stats']['total_views'] / len(cases)
                report['engagement_stats']['avg_likes'] = report['engagement_stats']['total_likes'] / len(cases)
            
            # 最近活动（按月统计）
            from collections import defaultdict
            monthly_counts = defaultdict(int)
            for case in cases:
                if case.get('created_at'):
                    month = case['created_at'][:7]  # YYYY-MM
                    monthly_counts[month] += 1
            
            report['recent_activity'] = dict(sorted(monthly_counts.items(), reverse=True)[:12])
            
            return report
            
        except Exception as e:
            print(f\"❌ 生成报告异常: {e}\")
            return {}
    
    def print_content_report(self, report: Dict):
        \"\"\"打印内容分析报告\"\"\"
        if not report:
            return
        
        print(\"\\n📊 内容分析报告\")
        print(\"=\" * 50)
        
        print(f\"📚 总案例数: {report['total_cases']}\")
        print(f\"👁 总浏览量: {report['engagement_stats']['total_views']:,}\")
        print(f\"❤️ 总点赞数: {report['engagement_stats']['total_likes']:,}\")
        print(f\"📊 平均浏览量: {report['engagement_stats']['avg_views']:.1f}\")
        print(f\"📊 平均点赞数: {report['engagement_stats']['avg_likes']:.1f}\")
        
        print(\"\\n📋 状态分布:\")
        for status, count in report['status_distribution'].items():
            percentage = (count / report['total_cases']) * 100
            print(f\"   {status}: {count} ({percentage:.1f}%)\")
        
        print(\"\\n📂 分类分布:\")
        for category, count in report['category_distribution'].items():
            percentage = (count / report['total_cases']) * 100
            print(f\"   {category}: {count} ({percentage:.1f}%)\")
        
        print(\"\\n📅 最近12个月新增案例:\")
        for month, count in list(report['recent_activity'].items())[:6]:
            print(f\"   {month}: {count} 个\")

def main():
    parser = argparse.ArgumentParser(description='黄土高原案例库内容管理工具')
    parser.add_argument('--create', help='创建单个案例 (JSON文件路径)')
    parser.add_argument('--import-csv', help='从CSV文件批量导入案例')
    parser.add_argument('--export-csv', help='导出案例到CSV文件')
    parser.add_argument('--status', default='published', help='导出时的案例状态筛选')
    parser.add_argument('--report', action='store_true', help='生成内容分析报告')
    parser.add_argument('--template', action='store_true', help='生成CSV导入模板')
    parser.add_argument('--update-images', help='更新案例图片 (格式: case_id,url1,url2,...)')
    
    args = parser.parse_args()
    
    # 创建内容管理器
    manager = ContentManager()
    manager.load_env_config()
    
    if not manager.supabase_url or not manager.supabase_key:
        print(\"❌ 错误: 未配置Supabase连接信息\")
        print(\"请确保.env.local文件中包含VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY\")
        return
    
    if args.create:
        # 创建单个案例
        try:
            with open(args.create, 'r', encoding='utf-8') as f:
                case_data = json.load(f)
            manager.create_case(case_data)
        except FileNotFoundError:
            print(f\"❌ 文件未找到: {args.create}\")
        except json.JSONDecodeError:
            print(f\"❌ JSON格式错误: {args.create}\")
    
    elif args.import_csv:
        # 批量导入
        results = manager.batch_import_from_csv(args.import_csv)
        print(f\"\\n📊 导入结果: 成功 {results['success']} 个, 失败 {results['failed']} 个\")
        if results['errors']:
            print(\"❌ 失败的记录:\")
            for error in results['errors']:
                print(f\"   {error}\")
    
    elif args.export_csv:
        # 导出案例
        manager.export_cases_to_csv(args.export_csv, args.status)
    
    elif args.report:
        # 生成分析报告
        report = manager.generate_content_report()
        manager.print_content_report(report)
    
    elif args.template:
        # 生成CSV模板
        template_file = 'case_import_template.csv'
        fieldnames = ['title', 'description', 'content', 'category_id', 'region', 
                     'status', 'tags', 'summary', 'subtitle']
        
        with open(template_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            # 添加示例行
            writer.writerow({
                'title': '示例案例：高西沟流域综合治理',
                'description': '陕西省米脂县高西沟流域水土保持综合治理的成功实践',
                'content': '详细的案例内容，包括治理措施、技术方案、实施过程等...',
                'category_id': '1',
                'region': '陕西省米脂县',
                'status': 'published',
                'tags': '水土保持,流域治理,综合治理',
                'summary': '通过综合治理措施，实现了水土保持和生态恢复的双重目标',
                'subtitle': '流域综合治理的典型案例'
            })
        
        print(f\"✅ CSV导入模板已生成: {template_file}\")
    
    elif args.update_images:
        # 更新案例图片
        parts = args.update_images.split(',')
        if len(parts) >= 2:
            case_id = parts[0]
            image_urls = parts[1:]
            manager.update_case_images(case_id, image_urls)
        else:
            print(\"❌ 格式错误，正确格式: case_id,url1,url2,...\")
    
    else:
        parser.print_help()

if __name__ == \"__main__\":
    main()
