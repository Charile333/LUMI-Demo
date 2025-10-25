Write-Host "============================================================" -ForegroundColor Green
Write-Host " Starting LUMI Development Server with WebSocket Support" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
node server-with-websocket.js

