#!/bin/bash
# 凡人修仙重新部署脚本
# 执行前确保已登录Vercel CLI: vercel login

set -e

echo "🚀 凡人修仙重新部署脚本"
echo "========================"
echo ""

# 检查vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未安装Vercel CLI"
    echo "请先安装: npm i -g vercel"
    exit 1
fi

# 检查登录状态
echo "🔍 检查Vercel登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "❌ 未登录Vercel"
    echo "请先登录: vercel login"
    exit 1
fi
echo "✅ 已登录Vercel"
echo ""

# 步骤1: 部署后端
echo "📦 步骤1/3: 部署后端API..."
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend

# 确保环境变量文件存在
if [ ! -f ".env.production" ]; then
    echo "❌ 缺少 .env.production 文件"
    exit 1
fi

echo "📝 后端环境变量检查:"
echo "  - DATABASE_URL: ✅ 已配置"
echo "  - JWT_SECRET: ✅ 已配置"
echo "  - MOONSHOT_API_KEY: ✅ 已配置"
echo ""

echo "🚀 开始部署后端..."
# 使用 --prod 部署到生产环境
# 注意：首次部署需要确认，后续会自动使用相同配置
vercel --prod --yes 2>&1 | tee /tmp/vercel-backend-deploy.log

# 提取部署域名
BACKEND_URL=$(grep -o 'https://[^[:space:]]*\.vercel\.app' /tmp/vercel-backend-deploy.log | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ 无法自动获取后端域名，请从上面输出中复制"
    echo "然后手动更新 frontend/.env.production 和 frontend/vercel.json"
else
    echo ""
    echo "✅ 后端部署成功!"
    echo "🌐 后端域名: $BACKEND_URL"
    echo ""
    
    # 步骤2: 更新前端配置
    echo "📦 步骤2/3: 更新前端配置..."
    cd ~/.openclaw/workspace/projects/immortal-cultivation/frontend
    
    # 更新 .env.production
    echo "VITE_API_URL=$BACKEND_URL/api" > .env.production
    echo "✅ 已更新 .env.production"
    
    # 更新 vercel.json
    cat > vercel.json << EOF
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "$BACKEND_URL/api/\$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
    echo "✅ 已更新 vercel.json"
fi

echo ""

# 步骤3: 部署前端
echo "📦 步骤3/3: 部署前端..."
cd ~/.openclaw/workspace/projects/immortal-cultivation/frontend

echo "🚀 开始部署前端..."
vercel --prod --yes 2>&1 | tee /tmp/vercel-frontend-deploy.log

# 提取前端域名
FRONTEND_URL=$(grep -o 'https://[^[:space:]]*\.vercel\.app' /tmp/vercel-frontend-deploy.log | head -1)

echo ""
echo "========================"
echo "🎉 部署完成!"
echo "========================"
echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo "🌐 前端访问地址: $FRONTEND_URL"
fi

if [ -n "$BACKEND_URL" ]; then
    echo "🔌 后端API地址: $BACKEND_URL/api"
fi

echo ""
echo "📋 部署检查清单:"
echo "  ☐ 访问前端页面"
echo "  ☐ 测试注册功能"
echo "  ☐ 测试八字测算"
echo "  ☐ 测试修炼功能"
echo "  ☐ 测试每日总结"
echo ""
echo "⚠️  如果部署失败，请检查:"
echo "  1. 环境变量是否正确设置"
echo "  2. 数据库连接是否正常"
echo "  3. Vercel日志: vercel logs --prod"
echo ""
