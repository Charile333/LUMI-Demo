#!/bin/bash

# DuoLume + Market 整合项目启动脚本

echo "🚀 启动 DuoLume + Market 整合项目..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 创建 .env.local 文件（如果不存在）
if [ ! -f ".env.local" ]; then
    echo "⚙️  创建环境变量文件..."
    cat > .env.local << EOL
# Flask Backend API URL
FLASK_API_URL=http://localhost:5000

# Next.js
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOL
    echo "✅ 已创建 .env.local 文件"
fi

echo ""
echo "🌐 启动 Next.js 开发服务器..."
echo "📍 主页: http://localhost:3000"
echo "📍 预测市场: http://localhost:3000/market"
echo ""
echo "⚠️  提示："
echo "   - 如需实时警报功能，请确保 Flask 后端 (端口 5000) 已启动"
echo "   - 如需 WebSocket 推送，请确保 alert_server.js (端口 3001) 已启动"
echo ""

npm run dev

