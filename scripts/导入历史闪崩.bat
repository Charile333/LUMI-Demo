@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║     导入历史闪崩事件到数据库                               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 这将导入以下真实历史事件：
echo   • 2024年 - 最近的市场波动
echo   • 2023年 - CZ认罪、SVB倒闭等
echo   • 2022年 - FTX崩盘、Terra崩盘等
echo   • 2021年 - 中国禁令、历史最高点
echo   • 2020年 - 黑色星期四（COVID-19）
echo   • 2018-2019 - 熊市事件
echo.
echo 按任意键继续，或 Ctrl+C 取消...
pause >nul
echo.
node import-historical-crashes.js
echo.
echo 按任意键退出...
pause >nul







