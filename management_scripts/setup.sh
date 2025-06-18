#!/bin/bash

# 黄土高原案例库系统自动化设置脚本
# 使用方法：bash setup.sh

echo "🚀 黄土高原案例库系统自动化设置开始..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js是否安装
check_nodejs() {
    echo -e "${BLUE}检查Node.js环境...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✓ Node.js已安装: $NODE_VERSION${NC}"
        
        # 检查版本是否符合要求 (v16+)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            echo -e "${YELLOW}⚠ 警告: Node.js版本过低，建议升级到v16+${NC}"
        fi
    else
        echo -e "${RED}✗ Node.js未安装${NC}"
        echo "请访问 https://nodejs.org 下载安装Node.js"
        exit 1
    fi
}

# 检查pnpm是否安装
check_pnpm() {
    echo -e "${BLUE}检查pnpm包管理器...${NC}"
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        echo -e "${GREEN}✓ pnpm已安装: $PNPM_VERSION${NC}"
    else
        echo -e "${YELLOW}pnpm未安装，正在安装...${NC}"
        npm install -g pnpm
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ pnpm安装成功${NC}"
        else
            echo -e "${RED}✗ pnpm安装失败${NC}"
            exit 1
        fi
    fi
}

# 安装项目依赖
install_dependencies() {
    echo -e "${BLUE}安装项目依赖...${NC}"
    if [ -f "package.json" ]; then
        pnpm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 依赖安装成功${NC}"
        else
            echo -e "${RED}✗ 依赖安装失败${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ 未找到package.json文件，请确保在项目根目录执行此脚本${NC}"
        exit 1
    fi
}

# 创建环境配置文件
setup_env() {
    echo -e "${BLUE}设置环境配置文件...${NC}"
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✓ 已创建.env.local文件${NC}"
            echo -e "${YELLOW}请编辑.env.local文件，配置您的API密钥${NC}"
        else
            echo -e "${YELLOW}⚠ 未找到.env.example文件${NC}"
        fi
    else
        echo -e "${GREEN}✓ .env.local文件已存在${NC}"
    fi
}

# 检查项目结构
check_project_structure() {
    echo -e "${BLUE}检查项目结构...${NC}"
    
    REQUIRED_DIRS=("src" "public" "docs")
    REQUIRED_FILES=("package.json" "vite.config.ts" "tailwind.config.js")
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✓ 目录存在: $dir${NC}"
        else
            echo -e "${RED}✗ 缺少目录: $dir${NC}"
        fi
    done
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✓ 文件存在: $file${NC}"
        else
            echo -e "${RED}✗ 缺少文件: $file${NC}"
        fi
    done
}

# 启动开发服务器
start_dev_server() {
    echo -e "${BLUE}准备启动开发服务器...${NC}"
    echo -e "${YELLOW}请确保已配置.env.local文件中的必要参数${NC}"
    echo -e "${YELLOW}按Enter键启动开发服务器，或按Ctrl+C取消${NC}"
    read
    
    echo -e "${GREEN}启动开发服务器...${NC}"
    pnpm dev
}

# 显示配置说明
show_config_help() {
    echo ""
    echo -e "${BLUE}=== 配置说明 ===${NC}"
    echo -e "${YELLOW}请在.env.local文件中配置以下参数：${NC}"
    echo ""
    echo -e "${GREEN}必需配置（基础功能）：${NC}"
    echo "VITE_SUPABASE_URL=您的Supabase项目URL"
    echo "VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥"
    echo ""
    echo -e "${GREEN}推荐配置（AI功能）：${NC}"
    echo "VITE_OPENAI_API_KEY=您的OpenAI API密钥"
    echo "VITE_UNSPLASH_API_KEY=您的Unsplash API密钥"
    echo ""
    echo -e "${GREEN}可选配置（备用服务）：${NC}"
    echo "VITE_BAIDU_API_KEY=您的百度AI API密钥"
    echo "VITE_BAIDU_SECRET_KEY=您的百度AI Secret密钥"
    echo "VITE_PIXABAY_API_KEY=您的Pixabay API密钥"
    echo ""
    echo -e "${BLUE}获取API密钥的链接：${NC}"
    echo "Supabase: https://supabase.com/dashboard"
    echo "OpenAI: https://platform.openai.com/api-keys"
    echo "Unsplash: https://unsplash.com/developers"
    echo "Pixabay: https://pixabay.com/api/docs/"
    echo ""
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  黄土高原案例库系统自动化设置工具  ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    check_nodejs
    check_pnpm
    check_project_structure
    install_dependencies
    setup_env
    show_config_help
    
    echo ""
    echo -e "${GREEN}✅ 基础设置完成！${NC}"
    echo ""
    echo -e "${BLUE}下一步操作：${NC}"
    echo "1. 编辑 .env.local 文件，配置您的API密钥"
    echo "2. 运行 'pnpm dev' 启动开发服务器"
    echo "3. 访问 http://localhost:5173 查看应用"
    echo ""
    
    echo -e "${YELLOW}是否现在启动开发服务器？(y/n)${NC}"
    read -p "请选择: " choice
    case "$choice" in 
        y|Y|yes|YES) start_dev_server ;;
        *) echo -e "${GREEN}设置完成！请手动运行 'pnpm dev' 启动服务器${NC}" ;;
    esac
}

# 运行主函数
main
