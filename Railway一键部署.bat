@echo off
chcp 65001 >nul
echo ========================================
echo    Railway WebSocket 部署
echo ========================================
echo.
echo 请按照提示操作：
echo.
echo 1. 即将打开浏览器登录 Railway
echo 2. 使用 GitHub 或邮箱登录
echo 3. 授权后返回此窗口
echo.
pause
echo.

cd ws-server
railway login

echo.
echo ========================================
echo 登录成功！开始部署...
echo ========================================
echo.

railway init

echo.
echo 设置数据库连接...
railway variables set DATABASE_URL="postgresql://postgres:Abcabc123123++@db.bepwgrvplikstxcffbzh.supabase.co:6543/postgres"

echo.
echo 开始部署（需要 2-3 分钟）...
railway up

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 查看部署信息：
railway status

echo.
echo 您的 WebSocket 地址：
echo wss://[您的项目名].up.railway.app
echo.
pause



