@echo off
echo ============================================================
echo  Starting LUMI Development Server with WebSocket Support
echo ============================================================
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
node server-with-websocket.js

