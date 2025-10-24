@echo off
REM DuoLume + Market 整合项目启动脚本 (Windows)

echo 🚀 启动 DuoLume + Market 整合项目...
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
)

REM 创建 .env.local 文件（如果不存在）
if not exist ".env.local" (
    echo ⚙️  创建环境变量文件...
    (
        echo # Flask Backend API URL
        echo FLASK_API_URL=http://localhost:5000
        echo.
        echo # Next.js
        echo NEXT_PUBLIC_WS_URL=ws://localhost:3001
    ) > .env.local
    echo ✅ 已创建 .env.local 文件
)

echo.
echo 🌐 启动 Next.js 开发服务器...
echo 📍 主页: http://localhost:3000
echo 📍 预测市场: http://localhost:3000/market
echo.
echo ⚠️  提示：
echo    - 如需实时警报功能，请确保 Flask 后端 (端口 5000) 已启动
echo    - 如需 WebSocket 推送，请确保 alert_server.js (端口 3001) 已启动
echo.

call npm run dev

