#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
黄土高原案例库数据库管理工具
功能：数据备份、恢复、初始化、统计分析

使用方法：
python database_tools.py --help
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# 数据库连接配置
DB_CONFIG = {
    'host': 'db.your-project.supabase.co',
    'port': '5432',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'your-database-password'
}

# SQL查询模板
QUERIES = {
    'site_stats': """
        SELECT 
            (SELECT COUNT(*) FROM cases WHERE status = 'published') as total_cases,
            (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories,
            (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
            (SELECT SUM(view_count) FROM cases) as total_views,
            (SELECT COUNT(*) FROM access_logs WHERE created_at > NOW() - INTERVAL '30 days') as monthly_visits;
    """,
    
    'popular_cases': """
        SELECT 
            c.title,
            c.view_count,
            c.like_count,
            cat.name as category_name,
            c.created_at
        FROM cases c
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.status = 'published'
        ORDER BY c.view_count DESC
        LIMIT 10;
    """,
    
    'user_activity': """
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_actions,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(CASE WHEN action = 'view' THEN 1 END) as views,
            COUNT(CASE WHEN action = 'download' THEN 1 END) as downloads
        FROM access_logs
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC;
    """,
    
    'ai_usage_stats': """
        SELECT 
            generation_type,
            model,
            COUNT(*) as usage_count,
            SUM(tokens_used) as total_tokens,
            SUM(cost_cents) / 100.0 as total_cost_usd,
            AVG(cost_cents) / 100.0 as avg_cost_usd
        FROM ai_generations
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY generation_type, model
        ORDER BY usage_count DESC;
    """
}

class DatabaseManager:
    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.connection_string = f"postgresql://{config['user']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
    
    def execute_query(self, query: str) -> List[Dict]:
        """执行SQL查询并返回结果"""
        try:
            import psycopg2
            import psycopg2.extras
            
            conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                database=self.config['database'],
                user=self.config['user'],
                password=self.config['password']
            )
            
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute(query)
                results = cursor.fetchall()
                return [dict(row) for row in results]
                
        except ImportError:
            print("❌ 错误: 请安装psycopg2-binary库")
            print("运行: pip install psycopg2-binary")
            return []
        except Exception as e:
            print(f"❌ 数据库查询错误: {e}")
            return []
        finally:
            if 'conn' in locals():
                conn.close()
    
    def get_site_statistics(self) -> Dict:
        """获取网站统计信息"""
        print("📊 获取网站统计信息...")
        results = self.execute_query(QUERIES['site_stats'])
        if results:
            stats = results[0]
            print("\n=== 网站统计信息 ===")
            print(f"📚 发布案例数: {stats['total_cases']}")
            print(f"📂 活跃分类数: {stats['total_categories']}")
            print(f"👥 活跃用户数: {stats['total_users']}")
            print(f"👁 总浏览量: {stats['total_views']}")
            print(f"📈 月度访问: {stats['monthly_visits']}")
            return stats
        return {}
    
    def get_popular_cases(self) -> List[Dict]:
        """获取热门案例"""
        print("🔥 获取热门案例...")
        results = self.execute_query(QUERIES['popular_cases'])
        if results:
            print("\n=== 热门案例排行 ===")
            for i, case in enumerate(results, 1):
                print(f"{i:2d}. {case['title'][:30]:<30} | 浏览: {case['view_count']:>5} | 分类: {case['category_name']}")
        return results
    
    def get_user_activity(self) -> List[Dict]:
        """获取用户活动统计"""
        print("📈 获取用户活动统计...")
        results = self.execute_query(QUERIES['user_activity'])
        if results:
            print("\n=== 近7天用户活动 ===")
            print("日期       | 总操作 | 独立用户 | 浏览量 | 下载量")
            print("-" * 50)
            for activity in results:
                print(f"{activity['date']} | {activity['total_actions']:>6} | {activity['unique_users']:>8} | {activity['views']:>6} | {activity['downloads']:>6}")
        return results
    
    def get_ai_usage_stats(self) -> List[Dict]:
        """获取AI使用统计"""
        print("🤖 获取AI使用统计...")
        results = self.execute_query(QUERIES['ai_usage_stats'])
        if results:
            print("\n=== AI功能使用统计（近30天） ===")
            print("类型          | 模型        | 使用次数 | 总Token | 总成本($) | 平均成本($)")
            print("-" * 75)
            for stat in results:
                print(f"{stat['generation_type']:<12} | {stat['model']:<10} | {stat['usage_count']:>8} | {stat['total_tokens']:>7} | {stat['total_cost_usd']:>9.2f} | {stat['avg_cost_usd']:>11.3f}")
        return results
    
    def backup_database(self, backup_dir: str = "backups") -> str:
        """备份数据库"""
        print("💾 开始数据库备份...")
        
        # 创建备份目录
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        # 生成备份文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(backup_dir, f"database_backup_{timestamp}.sql")
        
        # 执行pg_dump命令
        try:
            cmd = [
                "pg_dump",
                "--host", self.config['host'],
                "--port", self.config['port'],
                "--username", self.config['user'],
                "--dbname", self.config['database'],
                "--no-password",
                "--verbose",
                "--file", backup_file
            ]
            
            # 设置密码环境变量
            env = os.environ.copy()
            env['PGPASSWORD'] = self.config['password']
            
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                file_size = os.path.getsize(backup_file) / (1024 * 1024)  # MB
                print(f"✅ 备份成功: {backup_file} ({file_size:.2f} MB)")
                return backup_file
            else:
                print(f"❌ 备份失败: {result.stderr}")
                return ""
                
        except FileNotFoundError:
            print("❌ 错误: 未找到pg_dump命令，请确保PostgreSQL客户端工具已安装")
            return ""
        except Exception as e:
            print(f"❌ 备份错误: {e}")
            return ""
    
    def clean_old_logs(self, days: int = 30) -> int:
        """清理旧的访问日志"""
        print(f"🧹 清理{days}天前的访问日志...")
        
        query = f"""
        DELETE FROM access_logs 
        WHERE created_at < NOW() - INTERVAL '{days} days';
        """
        
        try:
            import psycopg2
            
            conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                database=self.config['database'],
                user=self.config['user'],
                password=self.config['password']
            )
            
            with conn.cursor() as cursor:
                cursor.execute(query)
                deleted_count = cursor.rowcount
                conn.commit()
                
            print(f"✅ 已清理{deleted_count}条旧日志记录")
            return deleted_count
            
        except Exception as e:
            print(f"❌ 清理日志错误: {e}")
            return 0
        finally:
            if 'conn' in locals():
                conn.close()
    
    def update_search_index(self) -> bool:
        """更新搜索索引"""
        print("🔍 更新搜索索引...")
        
        query = """
        UPDATE cases 
        SET search_vector = 
            setweight(to_tsvector('chinese', COALESCE(title, '')), 'A') ||
            setweight(to_tsvector('chinese', COALESCE(subtitle, '')), 'B') ||
            setweight(to_tsvector('chinese', COALESCE(description, '')), 'C') ||
            setweight(to_tsvector('chinese', COALESCE(summary, '')), 'C') ||
            setweight(to_tsvector('chinese', COALESCE(array_to_string(tags, ' '), '')), 'D')
        WHERE status = 'published';
        """
        
        try:
            import psycopg2
            
            conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                database=self.config['database'],
                user=self.config['user'],
                password=self.config['password']
            )
            
            with conn.cursor() as cursor:
                cursor.execute(query)
                updated_count = cursor.rowcount
                conn.commit()
                
            print(f"✅ 已更新{updated_count}个案例的搜索索引")
            return True
            
        except Exception as e:
            print(f"❌ 更新搜索索引错误: {e}")
            return False
        finally:
            if 'conn' in locals():
                conn.close()

def load_config_from_env() -> Dict[str, str]:
    """从环境变量加载数据库配置"""
    config = {}
    
    # 尝试从.env.local文件读取
    env_file = '.env.local'
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    if key.startswith('VITE_SUPABASE_'):
                        config[key] = value
    
    # 从Supabase URL解析数据库配置
    supabase_url = config.get('VITE_SUPABASE_URL', os.getenv('VITE_SUPABASE_URL', ''))
    if supabase_url:
        # 解析Supabase URL: https://xxxxx.supabase.co
        project_id = supabase_url.replace('https://', '').replace('.supabase.co', '')
        config.update({
            'host': f'db.{project_id}.supabase.co',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres',
            'password': input("请输入Supabase数据库密码: ")
        })
    
    return config

def main():
    parser = argparse.ArgumentParser(description='黄土高原案例库数据库管理工具')
    parser.add_argument('--stats', action='store_true', help='显示网站统计信息')
    parser.add_argument('--popular', action='store_true', help='显示热门案例')
    parser.add_argument('--activity', action='store_true', help='显示用户活动统计')
    parser.add_argument('--ai-stats', action='store_true', help='显示AI使用统计')
    parser.add_argument('--backup', action='store_true', help='备份数据库')
    parser.add_argument('--clean-logs', type=int, metavar='DAYS', help='清理N天前的访问日志')
    parser.add_argument('--update-index', action='store_true', help='更新搜索索引')
    parser.add_argument('--all', action='store_true', help='执行所有统计查询')
    
    args = parser.parse_args()
    
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    # 加载数据库配置
    config = load_config_from_env()
    if not config.get('host'):
        print("❌ 错误: 无法获取数据库配置")
        print("请确保.env.local文件中包含VITE_SUPABASE_URL配置")
        return
    
    # 创建数据库管理器
    db_manager = DatabaseManager(config)
    
    try:
        if args.stats or args.all:
            db_manager.get_site_statistics()
            print()
        
        if args.popular or args.all:
            db_manager.get_popular_cases()
            print()
        
        if args.activity or args.all:
            db_manager.get_user_activity()
            print()
        
        if args.ai_stats or args.all:
            db_manager.get_ai_usage_stats()
            print()
        
        if args.backup:
            backup_file = db_manager.backup_database()
            if backup_file:
                print(f"📁 备份文件位置: {backup_file}")
        
        if args.clean_logs:
            db_manager.clean_old_logs(args.clean_logs)
        
        if args.update_index:
            db_manager.update_search_index()
            
    except KeyboardInterrupt:
        print("\n\n⚠ 操作已取消")
    except Exception as e:
        print(f"\n❌ 执行错误: {e}")

if __name__ == "__main__":
    main()
