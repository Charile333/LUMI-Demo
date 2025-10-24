# 🚀 Windows PostgreSQL 设置脚本

Write-Host "🚀 开始设置 Market CLOB 数据库..." -ForegroundColor Green
Write-Host ""

# 1. 检查 PostgreSQL
Write-Host "1️⃣ 检查 PostgreSQL..." -ForegroundColor Cyan
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
    Write-Host "✅ PostgreSQL 已安装: $($psql.Version)" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 未安装" -ForegroundColor Red
    Write-Host "请访问: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. 请求密码
Write-Host "2️⃣ 请输入 PostgreSQL 密码（postgres 用户）:" -ForegroundColor Cyan
$password = Read-Host -AsSecureString
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""

# 3. 测试连接
Write-Host "3️⃣ 测试数据库连接..." -ForegroundColor Cyan
$testResult = psql -U postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 连接成功！" -ForegroundColor Green
} else {
    Write-Host "❌ 连接失败，请检查密码" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. 创建数据库
Write-Host "4️⃣ 创建 market_clob 数据库..." -ForegroundColor Cyan
$createResult = psql -U postgres -c "CREATE DATABASE market_clob;" 2>&1
if ($createResult -match "already exists") {
    Write-Host "⚠️  数据库已存在，跳过创建" -ForegroundColor Yellow
} elseif ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 数据库创建成功！" -ForegroundColor Green
} else {
    Write-Host "❌ 创建失败: $createResult" -ForegroundColor Red
}

Write-Host ""

# 5. 初始化表结构
Write-Host "5️⃣ 初始化表结构..." -ForegroundColor Cyan
$initResult = psql -U postgres -d market_clob -f scripts/setup-database.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 表结构初始化成功！" -ForegroundColor Green
} else {
    Write-Host "❌ 初始化失败" -ForegroundColor Red
    Write-Host $initResult
}

Write-Host ""

# 6. 验证表
Write-Host "6️⃣ 验证表结构..." -ForegroundColor Cyan
$tables = psql -U postgres -d market_clob -c "\dt" 2>&1
Write-Host $tables

Write-Host ""

# 7. 配置环境变量
Write-Host "7️⃣ 配置环境变量..." -ForegroundColor Cyan
$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "⚠️  .env.local 已存在" -ForegroundColor Yellow
    Write-Host "请手动添加以下内容:" -ForegroundColor Yellow
} else {
    Write-Host "创建 .env.local 文件..." -ForegroundColor Cyan
    Copy-Item ".env.example" $envFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "📝 需要在 .env.local 中设置:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/market_clob" -ForegroundColor White

Write-Host ""
Write-Host "✅ 设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 编辑 .env.local，设置 DATABASE_URL" -ForegroundColor White
Write-Host "2. 运行: npm run dev" -ForegroundColor White
Write-Host ""







