# Git Setup Script for LUMI Project
Write-Host "Starting Git setup for LUMI project..." -ForegroundColor Green

# Get current script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "Git repository already exists." -ForegroundColor Yellow
}

# Add remote repository
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/Charile333/Demo.git

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit: LUMI预测市场 - 合并DuoLume和Market项目"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main --force

Write-Host "Git setup completed!" -ForegroundColor Green
Write-Host "Repository URL: https://github.com/Charile333/Demo" -ForegroundColor Cyan

