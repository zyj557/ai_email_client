#!/bin/bash

# 黄土高原案例库系统部署脚本
# 支持GitHub Pages、Vercel等多种部署方式

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件
CONFIG_FILE=".deploy-config"
BUILD_DIR="dist"
BACKUP_DIR="deploy-backups"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_requirements() {
    log_info "检查部署工具..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm未安装，正在安装..."
        npm install -g pnpm
    fi
    
    # 检查git
    if ! command -v git &> /dev/null; then
        log_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    log_success "所有必要工具已准备就绪"
}

# 加载配置
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        log_info "已加载部署配置"
    else
        log_warning "未找到部署配置文件，将使用默认配置"
    fi
}

# 保存配置
save_config() {
    cat > "$CONFIG_FILE" << EOF
# 部署配置文件
DEPLOY_TYPE="$DEPLOY_TYPE"
GITHUB_REPO="$GITHUB_REPO"
GITHUB_BRANCH="$GITHUB_BRANCH"
VERCEL_PROJECT="$VERCEL_PROJECT"
CUSTOM_DOMAIN="$CUSTOM_DOMAIN"
BUILD_COMMAND="$BUILD_COMMAND"
BUILD_DIR="$BUILD_DIR"
LAST_DEPLOY_TIME="$(date)"
EOF
    log_success "配置已保存到 $CONFIG_FILE"
}

# 环境检查
check_environment() {
    log_info "检查项目环境..."
    
    # 检查package.json
    if [ ! -f "package.json" ]; then
        log_error "未找到package.json文件"
        exit 1
    fi
    
    # 检查环境变量配置
    if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
        log_warning "未找到环境配置文件(.env.local 或 .env.production)"
        echo "请确保已配置必要的环境变量"
    fi
    
    # 检查构建脚本
    if ! grep -q '"build"' package.json; then
        log_error "package.json中未找到build脚本"
        exit 1
    fi
    
    log_success "项目环境检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    elif [ -f "yarn.lock" ]; then
        yarn install --frozen-lockfile
    else
        npm ci
    fi
    
    log_success "依赖安装完成"
}

# 运行测试
run_tests() {
    log_info "运行项目测试..."
    
    # 检查是否有测试脚本
    if grep -q '"test"' package.json; then
        if [ -f "pnpm-lock.yaml" ]; then
            pnpm test
        else
            npm test
        fi
    else
        log_warning "未找到测试脚本，跳过测试"
    fi
}

# 构建项目
build_project() {
    log_info "构建生产版本..."
    
    # 清理旧的构建文件
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "已清理旧的构建文件"
    fi
    
    # 执行构建
    BUILD_COMMAND=${BUILD_COMMAND:-"build"}
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm run "$BUILD_COMMAND"
    else
        npm run "$BUILD_COMMAND"
    fi
    
    # 检查构建结果
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "构建失败：未生成$BUILD_DIR目录"
        exit 1
    fi
    
    # 显示构建信息
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
    log_success "构建完成：$BUILD_SIZE, $FILE_COUNT个文件"
}

# 创建部署备份
create_backup() {
    if [ -d "$BUILD_DIR" ]; then
        log_info "创建部署备份..."
        
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$BACKUP_DIR/$BACKUP_NAME" "$BUILD_DIR"
        
        log_success "备份已创建：$BACKUP_DIR/$BACKUP_NAME"
        
        # 清理旧备份（保留最近5个）
        cd "$BACKUP_DIR"
        ls -t backup_*.tar.gz | tail -n +6 | xargs -r rm
        cd ..
    fi
}

# 部署到GitHub Pages
deploy_github_pages() {
    log_info "部署到GitHub Pages..."
    
    GITHUB_REPO=${GITHUB_REPO:-$(git remote get-url origin | sed 's/.*github.com[\/:]//; s/.git$//')}
    GITHUB_BRANCH=${GITHUB_BRANCH:-"gh-pages"}
    
    if [ -z "$GITHUB_REPO" ]; then
        log_error "无法获取GitHub仓库信息"
        exit 1
    fi
    
    # 检查gh-pages分支
    if ! git show-ref --verify --quiet "refs/heads/$GITHUB_BRANCH"; then
        log_info "创建$GITHUB_BRANCH分支..."
        git checkout --orphan "$GITHUB_BRANCH"
        git rm -rf .
        echo "# GitHub Pages" > README.md
        git add README.md
        git commit -m "Initial commit for GitHub Pages"
        git push -u origin "$GITHUB_BRANCH"
        git checkout main
    fi
    
    # 复制构建文件到临时目录
    TEMP_DIR=$(mktemp -d)
    cp -r "$BUILD_DIR"/* "$TEMP_DIR/"
    
    # 切换到gh-pages分支
    git checkout "$GITHUB_BRANCH"
    
    # 清理并复制新文件
    git rm -rf .
    cp -r "$TEMP_DIR"/* .
    
    # 添加CNAME文件（如果有自定义域名）
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo "$CUSTOM_DOMAIN" > CNAME
    fi
    
    # 提交并推送
    git add .
    git commit -m "Deploy: $(date)"
    git push origin "$GITHUB_BRANCH"
    
    # 切换回主分支
    git checkout main
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    log_success "已部署到GitHub Pages"
    echo "访问地址: https://$GITHUB_REPO.github.io"
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo "自定义域名: https://$CUSTOM_DOMAIN"
    fi
}

# 部署到Vercel
deploy_vercel() {
    log_info "部署到Vercel..."
    
    # 检查Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_info "安装Vercel CLI..."
        npm install -g vercel
    fi
    
    # 登录Vercel（如果需要）
    if ! vercel whoami &> /dev/null; then
        log_info "请登录Vercel..."
        vercel login
    fi
    
    # 部署
    if [ -n "$VERCEL_PROJECT" ]; then
        vercel --prod --confirm --name "$VERCEL_PROJECT"
    else
        vercel --prod --confirm
    fi
    
    log_success "已部署到Vercel"
}

# 部署到自定义服务器
deploy_custom() {
    log_info "部署到自定义服务器..."
    
    if [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_PATH" ]; then
        log_error "请设置DEPLOY_HOST和DEPLOY_PATH环境变量"
        exit 1
    fi
    
    # 使用rsync同步文件
    rsync -avz --delete "$BUILD_DIR/" "$DEPLOY_HOST:$DEPLOY_PATH/"
    
    log_success "已部署到自定义服务器"
}

# 部署健康检查
health_check() {
    log_info "执行部署健康检查..."
    
    if [ -n "$HEALTH_CHECK_URL" ]; then
        log_info "检查部署URL: $HEALTH_CHECK_URL"
        
        # 等待一段时间让部署生效
        sleep 10
        
        # 检查HTTP状态
        HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$HEALTH_CHECK_URL")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            log_success "健康检查通过 (HTTP $HTTP_STATUS)"
        else
            log_warning "健康检查异常 (HTTP $HTTP_STATUS)"
        fi
    else
        log_info "未配置健康检查URL，跳过检查"
    fi
}

# 配置向导
setup_wizard() {
    echo -e "${BLUE}=== 部署配置向导 ===${NC}"
    echo ""
    
    # 选择部署类型
    echo "请选择部署类型："
    echo "1) GitHub Pages"
    echo "2) Vercel"
    echo "3) 自定义服务器"
    read -p "请输入选择 (1-3): " deploy_choice
    
    case $deploy_choice in
        1)
            DEPLOY_TYPE="github-pages"
            read -p "GitHub仓库 (user/repo): " GITHUB_REPO
            read -p "部署分支 [gh-pages]: " GITHUB_BRANCH
            GITHUB_BRANCH=${GITHUB_BRANCH:-gh-pages}
            read -p "自定义域名 (可选): " CUSTOM_DOMAIN
            ;;
        2)
            DEPLOY_TYPE="vercel"
            read -p "Vercel项目名称 (可选): " VERCEL_PROJECT
            ;;
        3)
            DEPLOY_TYPE="custom"
            read -p "服务器地址 (user@host): " DEPLOY_HOST
            read -p "部署路径: " DEPLOY_PATH
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
    
    # 构建配置
    read -p "构建命令 [build]: " BUILD_COMMAND
    BUILD_COMMAND=${BUILD_COMMAND:-build}
    
    read -p "构建目录 [dist]: " BUILD_DIR
    BUILD_DIR=${BUILD_DIR:-dist}
    
    read -p "健康检查URL (可选): " HEALTH_CHECK_URL
    
    # 保存配置
    save_config
    
    echo ""
    log_success "配置完成！"
}

# 显示帮助信息
show_help() {
    echo "黄土高原案例库系统部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -s, --setup         运行配置向导"
    echo "  -t, --test          运行测试"
    echo "  -b, --build         仅构建项目"
    echo "  -d, --deploy        仅部署（需要先构建）"
    echo "  -f, --full          完整部署流程（测试+构建+部署）"
    echo "  --github-pages      部署到GitHub Pages"
    echo "  --vercel           部署到Vercel"
    echo "  --custom           部署到自定义服务器"
    echo "  --skip-test        跳过测试"
    echo "  --skip-backup      跳过备份"
    echo ""
    echo "环境变量:"
    echo "  DEPLOY_TYPE        部署类型 (github-pages, vercel, custom)"
    echo "  GITHUB_REPO        GitHub仓库"
    echo "  VERCEL_PROJECT     Vercel项目名称"
    echo "  DEPLOY_HOST        自定义服务器地址"
    echo "  DEPLOY_PATH        部署路径"
    echo "  HEALTH_CHECK_URL   健康检查URL"
    echo ""
}

# 主函数
main() {
    # 参数解析
    SKIP_TEST=false
    SKIP_BACKUP=false
    ACTION=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--setup)
                setup_wizard
                exit 0
                ;;
            -t|--test)
                ACTION="test"
                shift
                ;;
            -b|--build)
                ACTION="build"
                shift
                ;;
            -d|--deploy)
                ACTION="deploy"
                shift
                ;;
            -f|--full)
                ACTION="full"
                shift
                ;;
            --github-pages)
                DEPLOY_TYPE="github-pages"
                shift
                ;;
            --vercel)
                DEPLOY_TYPE="vercel"
                shift
                ;;
            --custom)
                DEPLOY_TYPE="custom"
                shift
                ;;
            --skip-test)
                SKIP_TEST=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定操作，默认为完整部署
    if [ -z "$ACTION" ]; then
        ACTION="full"
    fi
    
    # 加载配置
    load_config
    
    # 检查环境
    check_requirements
    check_environment
    
    echo -e "${GREEN}=== 开始部署流程 ===${NC}"
    echo "项目: $(basename $(pwd))"
    echo "操作: $ACTION"
    echo "时间: $(date)"
    echo ""
    
    # 执行操作
    case $ACTION in
        test)
            install_dependencies
            run_tests
            ;;
        build)
            install_dependencies
            build_project
            ;;
        deploy)
            # 检查是否已构建
            if [ ! -d "$BUILD_DIR" ]; then
                log_error "未找到构建文件，请先运行构建"
                exit 1
            fi
            
            if [ "$SKIP_BACKUP" != true ]; then
                create_backup
            fi
            
            # 根据类型部署
            case $DEPLOY_TYPE in
                github-pages)
                    deploy_github_pages
                    ;;
                vercel)
                    deploy_vercel
                    ;;
                custom)
                    deploy_custom
                    ;;
                *)
                    log_error "未配置部署类型，请先运行 $0 --setup"
                    exit 1
                    ;;
            esac
            
            health_check
            ;;
        full)
            install_dependencies
            
            if [ "$SKIP_TEST" != true ]; then
                run_tests
            fi
            
            build_project
            
            if [ "$SKIP_BACKUP" != true ]; then
                create_backup
            fi
            
            # 根据类型部署
            case $DEPLOY_TYPE in
                github-pages)
                    deploy_github_pages
                    ;;
                vercel)
                    deploy_vercel
                    ;;
                custom)
                    deploy_custom
                    ;;
                *)
                    log_error "未配置部署类型，请先运行 $0 --setup"
                    exit 1
                    ;;
            esac
            
            health_check
            ;;
    esac
    
    echo ""
    log_success "=== 部署完成 ==="
    echo "时间: $(date)"
}

# 运行主函数
main "$@"
