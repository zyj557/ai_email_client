#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
黄土高原案例库系统监控脚本
功能：实时监控系统状态、性能指标、错误日志

使用方法：
python monitor.py --help
"""

import os
import sys
import time
import json
import requests
import psutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import smtplib
from email.mime.text import MimeText

class SystemMonitor:
    def __init__(self, config_file='monitor_config.json'):
        self.config = self.load_config(config_file)
        self.alerts = []
    
    def load_config(self, config_file: str) -> Dict:
        """加载监控配置"""
        default_config = {
            "website_url": "https://your-website.com",
            "supabase_url": "",
            "supabase_key": "",
            "check_interval": 300,  # 5分钟
            "thresholds": {
                "response_time": 5000,  # 5秒
                "cpu_usage": 80,        # 80%
                "memory_usage": 90,     # 90%
                "disk_usage": 85        # 85%
            },
            "notifications": {
                "email": {
                    "enabled": False,
                    "smtp_host": "smtp.gmail.com",
                    "smtp_port": 587,
                    "username": "",
                    "password": "",
                    "to_emails": []
                }
            }
        }
        
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        else:
            # 创建默认配置文件
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)
            print(f"📝 已创建默认配置文件: {config_file}")
            print("请编辑配置文件后重新运行")
        
        return default_config
    
    def check_website_health(self) -> Dict:
        """检查网站健康状况"""
        url = self.config['website_url']
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000  # 毫秒
            
            result = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'status_code': response.status_code,
                'response_time': round(response_time, 2),
                'timestamp': datetime.now().isoformat()
            }
            
            # 检查响应时间阈值
            if response_time > self.config['thresholds']['response_time']:
                self.alerts.append(f"⚠️ 网站响应时间过长: {response_time:.2f}ms")
            
            return result
            
        except requests.RequestException as e:
            result = {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.alerts.append(f"❌ 网站无法访问: {e}")
            return result
    
    def check_database_health(self) -> Dict:
        """检查数据库健康状况"""
        if not self.config['supabase_url'] or not self.config['supabase_key']:
            return {'status': 'skipped', 'reason': 'No database config'}
        
        try:
            # 简单的健康检查请求
            url = f"{self.config['supabase_url']}/rest/v1/cases"
            headers = {
                'apikey': self.config['supabase_key'],
                'Authorization': f"Bearer {self.config['supabase_key']}"
            }
            
            start_time = time.time()
            response = requests.get(f"{url}?select=count", headers=headers, timeout=5)
            response_time = (time.time() - start_time) * 1000
            
            result = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'status_code': response.status_code,
                'response_time': round(response_time, 2),
                'timestamp': datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            result = {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.alerts.append(f"❌ 数据库连接错误: {e}")
            return result
    
    def check_system_resources(self) -> Dict:
        """检查系统资源使用情况"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            result = {
                'cpu_usage': round(cpu_percent, 2),
                'memory_usage': round(memory.percent, 2),
                'disk_usage': round(disk.percent, 2),
                'memory_available': round(memory.available / (1024**3), 2),  # GB
                'disk_free': round(disk.free / (1024**3), 2),  # GB
                'timestamp': datetime.now().isoformat()
            }
            
            # 检查阈值
            if cpu_percent > self.config['thresholds']['cpu_usage']:
                self.alerts.append(f"⚠️ CPU使用率过高: {cpu_percent:.1f}%")
            
            if memory.percent > self.config['thresholds']['memory_usage']:
                self.alerts.append(f"⚠️ 内存使用率过高: {memory.percent:.1f}%")
            
            if disk.percent > self.config['thresholds']['disk_usage']:
                self.alerts.append(f"⚠️ 磁盘使用率过高: {disk.percent:.1f}%")
            
            return result
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def check_ssl_certificate(self) -> Dict:
        """检查SSL证书状态"""
        try:
            import ssl
            import socket
            from urllib.parse import urlparse
            
            parsed_url = urlparse(self.config['website_url'])
            hostname = parsed_url.hostname
            
            if not hostname or parsed_url.scheme != 'https':
                return {'status': 'skipped', 'reason': 'Not HTTPS or invalid URL'}
            
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    # 解析证书到期时间
                    not_after = cert['notAfter']
                    expire_date = datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                    days_until_expire = (expire_date - datetime.now()).days
                    
                    result = {
                        'status': 'valid',
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'subject': dict(x[0] for x in cert['subject']),
                        'expire_date': expire_date.isoformat(),
                        'days_until_expire': days_until_expire,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # 检查证书是否即将到期
                    if days_until_expire <= 30:
                        self.alerts.append(f"⚠️ SSL证书即将到期: {days_until_expire}天后")
                    
                    return result
                    
        except Exception as e:
            result = {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.alerts.append(f"❌ SSL证书检查失败: {e}")
            return result
    
    def send_alert_notification(self, alerts: List[str]):
        """发送告警通知"""
        if not alerts or not self.config['notifications']['email']['enabled']:
            return
        
        email_config = self.config['notifications']['email']
        
        try:
            # 构建邮件内容
            subject = f"[告警] 黄土高原案例库系统监控 - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            body = "检测到系统异常:\n\n" + "\n".join(alerts)
            body += f"\n\n检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            body += f"\n监控地址: {self.config['website_url']}"
            
            msg = MimeText(body, 'plain', 'utf-8')
            msg['Subject'] = subject
            msg['From'] = email_config['username']
            msg['To'] = ', '.join(email_config['to_emails'])
            
            # 发送邮件
            with smtplib.SMTP(email_config['smtp_host'], email_config['smtp_port']) as server:
                server.starttls()
                server.login(email_config['username'], email_config['password'])
                server.send_message(msg)
            
            print(f"📧 告警邮件已发送给 {len(email_config['to_emails'])} 个收件人")
            
        except Exception as e:
            print(f"❌ 发送告警邮件失败: {e}")
    
    def save_monitoring_data(self, data: Dict):
        """保存监控数据到文件"""
        log_file = f"monitoring_log_{datetime.now().strftime('%Y%m')}.json"
        
        try:
            # 读取现有数据
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    log_data = json.load(f)
            else:
                log_data = []
            
            # 添加新数据
            log_data.append(data)
            
            # 保持文件大小合理（最多保留1000条记录）
            if len(log_data) > 1000:
                log_data = log_data[-1000:]
            
            # 保存数据
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ 保存监控数据失败: {e}")
    
    def run_single_check(self) -> Dict:
        """执行单次检查"""
        print("🔍 开始系统监控检查...")
        
        self.alerts = []  # 重置告警列表
        
        # 执行各项检查
        website_health = self.check_website_health()
        database_health = self.check_database_health()
        system_resources = self.check_system_resources()
        ssl_status = self.check_ssl_certificate()
        
        # 汇总结果
        result = {
            'timestamp': datetime.now().isoformat(),
            'website': website_health,
            'database': database_health,
            'system': system_resources,
            'ssl': ssl_status,
            'alerts': self.alerts
        }
        
        # 显示结果
        self.display_results(result)
        
        # 发送告警
        if self.alerts:
            self.send_alert_notification(self.alerts)
        
        # 保存数据
        self.save_monitoring_data(result)
        
        return result
    
    def display_results(self, result: Dict):
        """显示监控结果"""
        print(f"\n📊 监控报告 - {result['timestamp']}")
        print("=" * 50)
        
        # 网站状态
        website = result['website']
        status_emoji = "✅" if website.get('status') == 'healthy' else "❌"
        print(f"{status_emoji} 网站状态: {website.get('status', 'unknown')}")
        if 'response_time' in website:
            print(f"   响应时间: {website['response_time']}ms")
        if 'error' in website:
            print(f"   错误信息: {website['error']}")
        
        # 数据库状态
        database = result['database']
        if database.get('status') != 'skipped':
            status_emoji = "✅" if database.get('status') == 'healthy' else "❌"
            print(f"{status_emoji} 数据库: {database.get('status', 'unknown')}")
            if 'response_time' in database:
                print(f"   响应时间: {database['response_time']}ms")
        
        # 系统资源
        system = result['system']
        if 'error' not in system:
            print(f"💻 系统资源:")
            print(f"   CPU使用率: {system['cpu_usage']}%")
            print(f"   内存使用率: {system['memory_usage']}%")
            print(f"   磁盘使用率: {system['disk_usage']}%")
            print(f"   可用内存: {system['memory_available']}GB")
            print(f"   剩余磁盘: {system['disk_free']}GB")
        
        # SSL证书
        ssl = result['ssl']
        if ssl.get('status') == 'valid':
            print(f"🔒 SSL证书: 有效，{ssl['days_until_expire']}天后到期")
        elif ssl.get('status') == 'error':
            print(f"🔒 SSL证书: 检查失败")
        
        # 告警信息
        if result['alerts']:
            print(f"\n⚠️  告警信息 ({len(result['alerts'])}条):")
            for alert in result['alerts']:
                print(f"   {alert}")
        else:
            print(f"\n✅ 所有检查正常，无告警")
        
        print()
    
    def run_continuous_monitoring(self):
        """持续监控模式"""
        interval = self.config['check_interval']
        print(f"🔄 启动持续监控模式，检查间隔: {interval}秒")
        print("按 Ctrl+C 停止监控")
        
        try:
            while True:
                self.run_single_check()
                print(f"⏰ 下次检查时间: {(datetime.now() + timedelta(seconds=interval)).strftime('%H:%M:%S')}")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n🛑 监控已停止")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='黄土高原案例库系统监控工具')
    parser.add_argument('--config', default='monitor_config.json', help='配置文件路径')
    parser.add_argument('--check', action='store_true', help='执行单次检查')
    parser.add_argument('--monitor', action='store_true', help='启动持续监控')
    parser.add_argument('--setup', action='store_true', help='配置向导')
    
    args = parser.parse_args()
    
    if args.setup:
        # 配置向导
        print("🔧 监控配置向导")
        print("=" * 30)
        
        config = {}
        config['website_url'] = input("网站URL: ")
        config['supabase_url'] = input("Supabase URL (可选): ")
        config['supabase_key'] = input("Supabase API Key (可选): ")
        
        print("\n设置检查间隔 (秒):")
        config['check_interval'] = int(input("检查间隔 [300]: ") or 300)
        
        print("\n设置告警阈值:")
        config['thresholds'] = {
            'response_time': int(input("响应时间阈值 (毫秒) [5000]: ") or 5000),
            'cpu_usage': int(input("CPU使用率阈值 (%) [80]: ") or 80),
            'memory_usage': int(input("内存使用率阈值 (%) [90]: ") or 90),
            'disk_usage': int(input("磁盘使用率阈值 (%) [85]: ") or 85)
        }
        
        print("\n配置邮件通知 (可选):")
        email_enabled = input("启用邮件通知? (y/N): ").lower() == 'y'
        
        config['notifications'] = {'email': {'enabled': email_enabled}}
        
        if email_enabled:
            config['notifications']['email'].update({
                'smtp_host': input("SMTP服务器 [smtp.gmail.com]: ") or "smtp.gmail.com",
                'smtp_port': int(input("SMTP端口 [587]: ") or 587),
                'username': input("邮箱用户名: "),
                'password': input("邮箱密码/应用密码: "),
                'to_emails': input("收件人邮箱 (逗号分隔): ").split(',')
            })
        
        # 保存配置
        with open(args.config, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ 配置已保存到 {args.config}")
        return
    
    # 创建监控器
    monitor = SystemMonitor(args.config)
    
    if args.check or (not args.monitor):
        # 单次检查
        monitor.run_single_check()
    elif args.monitor:
        # 持续监控
        monitor.run_continuous_monitoring()

if __name__ == "__main__":
    main()