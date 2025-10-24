# Conditional Tokens 合约测试脚本 (PowerShell)
# 用法: .\scripts\test-contract.ps1

Write-Host "🧪 Conditional Tokens 合约测试工具" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

function Show-Menu {
    Write-Host "请选择测试方案:" -ForegroundColor White
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host "1" -ForegroundColor Green -NoNewline
    Write-Host ") 只读测试 (免费，30秒)"
    Write-Host "     - 验证合约可用性" -ForegroundColor Gray
    Write-Host "     - 测试查询功能" -ForegroundColor Gray
    Write-Host "     - 不消耗 Gas" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "2" -ForegroundColor Green -NoNewline
    Write-Host ") Fork 模式测试 (免费，2-5分钟)"
    Write-Host "     - 模拟 BSC 环境" -ForegroundColor Gray
    Write-Host "     - 测试写入操作" -ForegroundColor Gray
    Write-Host "     - 估算 Gas 消耗" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "3" -ForegroundColor Green -NoNewline
    Write-Host ") 产品场景测试 (免费，5分钟)"
    Write-Host "     - 测试实际业务场景" -ForegroundColor Gray
    Write-Host "     - Gas 消耗分析" -ForegroundColor Gray
    Write-Host "     - 批量创建模拟" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "4" -ForegroundColor Green -NoNewline
    Write-Host ") 完整测试套件 (免费，10分钟)"
    Write-Host "     - 运行所有测试" -ForegroundColor Gray
    Write-Host "     - 生成详细报告" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "5" -ForegroundColor Yellow -NoNewline
    Write-Host ") 真实网络测试 (需要 BNB，谨慎使用)"
    Write-Host "     - 在 BSC 主网创建真实市场" -ForegroundColor Gray
    Write-Host "     - 消耗真实 Gas" -ForegroundColor Gray
    Write-Host "     - 需要配置私钥" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "6" -ForegroundColor Cyan -NoNewline
    Write-Host ") Gas 基准测试"
    Write-Host "     - 测试不同选项数量的 Gas" -ForegroundColor Gray
    Write-Host "     - 生成性能报告" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  " -NoNewline
    Write-Host "0" -ForegroundColor Red -NoNewline
    Write-Host ") 退出"
    Write-Host ""
}

function Run-ReadonlyTest {
    Write-Host ""
    Write-Host "▶ 运行只读测试..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "只读"
    
    Write-Host ""
    Write-Host "✓ 只读测试完成" -ForegroundColor Green
}

function Run-ForkTest {
    Write-Host ""
    Write-Host "▶ 运行 Fork 模式测试..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $env:FORK_BSC = "true"
    npx hardhat test contracts/test/BSC-RealContract.test.js
    
    Write-Host ""
    Write-Host "✓ Fork 测试完成" -ForegroundColor Green
}

function Run-ProductTest {
    Write-Host ""
    Write-Host "▶ 运行产品场景测试..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $env:FORK_BSC = "true"
    npx hardhat test contracts/test/ProductScenarios.test.js
    
    Write-Host ""
    Write-Host "✓ 产品场景测试完成" -ForegroundColor Green
}

function Run-FullTest {
    Write-Host ""
    Write-Host "▶ 运行完整测试套件..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    Write-Host "[1/3] 本地合约测试" -ForegroundColor Cyan
    npx hardhat test contracts/test/ConditionalTokens.test.js
    
    Write-Host ""
    Write-Host "[2/3] 只读功能测试" -ForegroundColor Cyan
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "只读"
    
    Write-Host ""
    Write-Host "[3/3] 产品场景测试 (Fork 模式)" -ForegroundColor Cyan
    $env:FORK_BSC = "true"
    npx hardhat test contracts/test/ProductScenarios.test.js
    
    Write-Host ""
    Write-Host "✓ 完整测试套件完成" -ForegroundColor Green
}

function Run-MainnetTest {
    Write-Host ""
    Write-Host "⚠️  警告：这将在 BSC 主网上创建真实交易" -ForegroundColor Yellow
    Write-Host "⚠️  这会消耗真实的 BNB！" -ForegroundColor Yellow
    Write-Host ""
    
    # 检查 .env 文件
    if (-not (Test-Path .env)) {
        Write-Host "❌ 错误：未找到 .env 文件" -ForegroundColor Red
        Write-Host ""
        Write-Host "请创建 .env 文件并添加以下内容:"
        Write-Host "  PRIVATE_KEY=你的私钥"
        Write-Host ""
        return
    }
    
    # 确认
    $confirm = Read-Host "确认要继续吗？(yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "已取消" -ForegroundColor Yellow
        return
    }
    
    Write-Host ""
    Write-Host "▶ 运行真实网络测试..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    npx hardhat test contracts/test/BSC-RealContract.test.js --grep "创建" --network bscMainnet
    
    Write-Host ""
    Write-Host "✓ 真实网络测试完成" -ForegroundColor Green
}

function Run-BenchmarkTest {
    Write-Host ""
    Write-Host "▶ 运行 Gas 基准测试..." -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $env:FORK_BSC = "true"
    npx hardhat test contracts/test/ProductScenarios.test.js --grep "性能基准"
    
    Write-Host ""
    Write-Host "✓ 基准测试完成" -ForegroundColor Green
}

# 主循环
while ($true) {
    Show-Menu
    $choice = Read-Host "请输入选项 (0-6)"
    
    switch ($choice) {
        "1" {
            Run-ReadonlyTest
        }
        "2" {
            Run-ForkTest
        }
        "3" {
            Run-ProductTest
        }
        "4" {
            Run-FullTest
        }
        "5" {
            Run-MainnetTest
        }
        "6" {
            Run-BenchmarkTest
        }
        "0" {
            Write-Host ""
            Write-Host "👋 再见！" -ForegroundColor Cyan
            exit
        }
        default {
            Write-Host "❌ 无效选项，请重新选择" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    Read-Host "按 Enter 键继续"
    Clear-Host
    Write-Host "🧪 Conditional Tokens 合约测试工具" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
}

