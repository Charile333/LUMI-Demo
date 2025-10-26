@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo    实时预警系统 - 快速测试
echo ════════════════════════════════════════
echo.
node test-alert.js
echo.
pause


