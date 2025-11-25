# 🧹 Docs 目录清理脚本
# 将重复和过时的文档移动到 _deprecated_docs 目录

$deprecatedDir = "docs\_deprecated_docs"
if (-not (Test-Path $deprecatedDir)) {
    New-Item -ItemType Directory -Path $deprecatedDir -Force | Out-Null
}

# 待移动的文件列表
$filesToMove = @(
    # 钱包连接相关
    "钱包连接功能验证.md",
    "钱包连接完全统一完成.md",
    "钱包连接统一完成说明.md",
    "统一钱包连接组件方案.md",
    "钱包连接组件说明.md",
    "钱包连接组件分析.md",
    
    # 批量结算相关
    "Cron-job.org批量结算配置指南.md",
    "EasyCron批量结算配置指南.md",
    "GitLab任务运行说明.md",
    "GitLab批量结算配置步骤.md",
    "GitLab批量结算配置步骤详解.md",
    "GitLab批量结算配置指南.md",
    "Vercel免费版批量结算替代方案.md",
    "Vercel批量结算配置指南.md",
    "批量结算功能用途说明.md",
    "批量结算功能说明.md",
    
    # 交易功能相关
    "交易功能完整性分析.md",
    "已实现的链上功能总结.md",
    "当前交易流程详解.md",
    "手动执行链上交易指南.md",
    "链上交易执行说明.md",
    "链上交易方案对比.md",
    "链上交易测试指南.md",
    "为什么只有QuickTradeModal支持链上结算.md",
    
    # QuickTradeModal相关
    "移除未使用的QuickTradeModal代码.md",
    "统一CompactTradeModal和QuickTradeModal功能.md",
    "主流平台UI组件与链上结算实现对比.md",
    
    # 过程性/修复文档
    "修复unknown-account错误.md",
    "修复topics-API-500错误.md",
    "修复概率显示不一致问题.md",
    "Vercel部署问题修复说明.md",
    "PM2配置修复说明.md",
    "浏览器Cookie问题解决方案.md",
    "登录问题排查指南.md",
    "激活失败排查指南.md",
    "Supabase Schema Cache刷新指南.md",
    "RPC连接超时解决方案.md",
    
    # 状态报告/对比文档
    "LUMI完整功能状态总结.md",
    "LUMI还缺少的功能清单.md",
    "LUMI与其他平台最新对比.md",
    "主流平台结算方式对比.md",
    "主流预测市场平台交易流程对比.md",
    
    # 其他过程性文档
    "用户连接钱包功能状态.md",
    "加载状态美化实施说明.md",
    "测试步骤.md",
    "管理后台访问路径.md",
    "本地访问限制说明.md",
    "如何获取GitLab配置变量.md",
    "添加CRON_SECRET步骤.md",
    "启用平台自动结算指南.md",
    "快速启用平台自动结算.md",
    "结算方式说明.md"
)

$movedCount = 0
$notFoundCount = 0

Write-Host "开始清理 docs 目录..." -ForegroundColor Green
Write-Host ""

foreach ($file in $filesToMove) {
    $srcPath = "docs\$file"
    $dstPath = "$deprecatedDir\$file"
    
    if (Test-Path $srcPath) {
        try {
            Move-Item -Path $srcPath -Destination $dstPath -Force
            Write-Host "✓ 已移动: $file" -ForegroundColor Yellow
            $movedCount++
        } catch {
            Write-Host "✗ 移动失败: $file - $_" -ForegroundColor Red
        }
    } else {
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "清理完成！" -ForegroundColor Green
Write-Host "已移动: $movedCount 个文件" -ForegroundColor Cyan
Write-Host "未找到: $notFoundCount 个文件" -ForegroundColor Gray
Write-Host ""
Write-Host "已弃用文档位置: $deprecatedDir" -ForegroundColor Cyan







