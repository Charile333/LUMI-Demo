@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║     LUMI 数据库初始化                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 这将创建LUMI独立数据库...
echo.
node setup-database.js
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 是否要迁移旧数据？(Y/N)
set /p migrate="请选择: "
if /i "%migrate%"=="Y" (
    echo.
    echo 开始迁移数据...
    node migrate-data.js
)
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 是否要导入历史闪崩事件？(Y/N)
set /p import="请选择: "
if /i "%import%"=="Y" (
    echo.
    echo 开始导入历史事件...
    node import-historical-crashes.js
)
echo.
echo 完成！按任意键退出...
pause >nul







