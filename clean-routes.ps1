# Clean all [id] routes

Write-Host "Cleaning route conflicts..." -ForegroundColor Yellow
Write-Host ""

# Stop all node processes
Write-Host "1. Stopping all node processes..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   Done" -ForegroundColor Green

# Delete .next cache
Write-Host "2. Deleting .next cache..."
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
    Write-Host "   Done" -ForegroundColor Green
} else {
    Write-Host "   .next not found" -ForegroundColor Yellow
}

# Find and delete all [id] directories in app folder
Write-Host "3. Finding [id] directories..."
$idDirs = Get-ChildItem -Path app -Recurse -Directory | Where-Object { $_.Name -eq '[id]' }

if ($idDirs) {
    Write-Host "   Found $($idDirs.Count) [id] directories:" -ForegroundColor Yellow
    foreach ($dir in $idDirs) {
        $relativePath = $dir.FullName.Replace((Get-Location).Path + '\', '')
        Write-Host "   - $relativePath" -ForegroundColor Red
        Remove-Item -LiteralPath $dir.FullName -Recurse -Force
        Write-Host "     Deleted" -ForegroundColor Green
    }
} else {
    Write-Host "   No [id] directories found" -ForegroundColor Green
}

# Verify no [id] directories remain
Write-Host "4. Verifying cleanup..."
$remaining = Get-ChildItem -Path app -Recurse -Directory | Where-Object { $_.Name -eq '[id]' }
if ($remaining) {
    Write-Host "   WARNING: Some [id] directories still exist!" -ForegroundColor Red
} else {
    Write-Host "   All [id] directories removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan


