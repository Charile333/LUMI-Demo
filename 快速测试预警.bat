@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════
echo    🦢 黑天鹅实时预警系统 - 快速测试
echo ════════════════════════════════════════
echo.
echo 📌 使用说明：
echo    1. 确保开发服务器正在运行 (npm run dev)
echo    2. 在浏览器打开: http://localhost:3000/black-swan
echo    3. 运行此脚本插入测试预警
echo    4. 观察浏览器页面的实时更新
echo.
echo ════════════════════════════════════════
echo.

node test-alert.js

echo.
echo ════════════════════════════════════════
echo 💡 提示：
echo    - 打开黑天鹅页面查看实时预警
echo    - 预警会在 2 秒内自动推送到浏览器
echo    - 按 F12 查看浏览器控制台日志
echo ════════════════════════════════════════
echo.
pause


