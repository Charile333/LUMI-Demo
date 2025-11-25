# 🗑️ Docs 目录清理清单

## 清理原则

1. **保留**: 核心功能文档、最新版本、技术参考
2. **删除**: 重复文档、过程性文档（修复/完成/说明）、过时文档
3. **合并**: 相似主题的文档合并为一个

---

## 📋 待删除文档列表

### 1. 钱包连接相关（6个 → 保留1个）
- ❌ `钱包连接功能验证.md`
- ❌ `钱包连接完全统一完成.md`
- ❌ `钱包连接统一完成说明.md`
- ❌ `统一钱包连接组件方案.md`
- ❌ `钱包连接组件说明.md`
- ❌ `钱包连接组件分析.md`
- ✅ **保留**: `钱包账户授权和Signer创建说明.md`（技术参考）

### 2. 批量结算相关（10个 → 保留1-2个）
- ❌ `Cron-job.org批量结算配置指南.md`
- ❌ `EasyCron批量结算配置指南.md`
- ❌ `GitLab任务运行说明.md`
- ❌ `GitLab批量结算配置步骤.md`
- ❌ `GitLab批量结算配置步骤详解.md`
- ❌ `GitLab批量结算配置指南.md`
- ❌ `Vercel免费版批量结算替代方案.md`
- ❌ `Vercel批量结算配置指南.md`
- ❌ `批量结算功能用途说明.md`
- ❌ `批量结算功能说明.md`
- ✅ **保留**: `启动平台批量自动结算指南.md`（最新版本）

### 3. 交易功能相关（8个 → 保留1-2个）
- ❌ `交易功能完整性分析.md`
- ❌ `已实现的链上功能总结.md`
- ❌ `当前交易流程详解.md`
- ❌ `手动执行链上交易指南.md`
- ❌ `链上交易执行说明.md`
- ❌ `链上交易方案对比.md`
- ❌ `链上交易测试指南.md`
- ❌ `为什么只有QuickTradeModal支持链上结算.md`
- ✅ **保留**: `COMPACT_TRADE_MODAL.md`（当前使用的组件）

### 4. QuickTradeModal/CompactTradeModal相关（5个 → 保留1个）
- ❌ `移除未使用的QuickTradeModal代码.md`
- ❌ `统一CompactTradeModal和QuickTradeModal功能.md`
- ❌ `主流平台UI组件与链上结算实现对比.md`
- ❌ `MARKET_CARD_QUICK_TRADE.md`
- ❌ `QUICK_TRADE_MODAL_OPTIMIZATION.md`
- ✅ **保留**: `COMPACT_TRADE_MODAL.md`

### 5. 过程性/修复文档（10个 → 删除）
- ❌ `修复unknown-account错误.md`
- ❌ `修复topics-API-500错误.md`
- ❌ `修复概率显示不一致问题.md`
- ❌ `Vercel部署问题修复说明.md`
- ❌ `PM2配置修复说明.md`
- ❌ `浏览器Cookie问题解决方案.md`
- ❌ `登录问题排查指南.md`
- ❌ `激活失败排查指南.md`
- ❌ `Supabase Schema Cache刷新指南.md`
- ❌ `RPC连接超时解决方案.md`
- **说明**: 这些是过程性文档，问题已解决，无需保留

### 6. 状态报告/对比文档（5个 → 保留1个）
- ❌ `LUMI完整功能状态总结.md`
- ❌ `LUMI还缺少的功能清单.md`
- ❌ `LUMI与其他平台最新对比.md`
- ❌ `主流平台结算方式对比.md`
- ❌ `主流预测市场平台交易流程对比.md`
- ✅ **保留**: `LUMI优化美化建议.md`（当前优化指南）

### 7. 重复的快速开始文档（2个 → 保留1个）
- ❌ `QUICK_START_COMPACT_TRADE.md`
- ✅ **保留**: `QUICK_START_OPTIMIZATION.md`

### 8. 其他过程性文档（5个 → 删除）
- ❌ `用户连接钱包功能状态.md`
- ❌ `加载状态美化实施说明.md`
- ❌ `测试步骤.md`
- ❌ `管理后台访问路径.md`
- ❌ `本地访问限制说明.md`

---

## ✅ 保留的核心文档

### 核心功能文档
1. ✅ `LUMI优化美化建议.md` - 当前优化指南
2. ✅ `PERFORMANCE_OPTIMIZATION.md` - 性能优化
3. ✅ `DESIGN_SYSTEM_USAGE.md` - 设计系统
4. ✅ `ORDERBOOK_OPTIMIZATION.md` - 订单簿优化
5. ✅ `SMART_SEARCH_FEATURE.md` - 搜索功能
6. ✅ `TOAST_NOTIFICATION_SYSTEM.md` - 通知系统
7. ✅ `UMA_ORACLE_OPTIMIZATION.md` - UMA优化

### 功能指南
8. ✅ `CREATE_TOPIC_FEATURE.md` - 话题创建
9. ✅ `TOPIC_CLEANUP_GUIDE.md` - 话题清理
10. ✅ `COMPACT_TRADE_MODAL.md` - 交易弹窗

### 配置和部署
11. ✅ `数据库迁移指南.md` - 数据库迁移
12. ✅ `激活市场指南.md` - 激活市场
13. ✅ `直接激活市场指南.md` - 直接激活
14. ✅ `本地管理后台说明.md` - 管理后台
15. ✅ `安全增强说明.md` - 安全说明
16. ✅ `安全管理指南.md` - 安全管理

### 技术文档
17. ✅ `话题创建和投票功能详细说明.md` - 话题功能
18. ✅ `话题创建问题排查指南.md` - 话题排查
19. ✅ `创建user_topics表步骤.md` - 表创建
20. ✅ `钱包账户授权和Signer创建说明.md` - 钱包技术
21. ✅ `启动平台批量自动结算指南.md` - 批量结算

### 清理相关
22. ✅ `CLEANUP_PLAN.md` - 清理计划
23. ✅ `CLEANUP_SUMMARY.md` - 清理总结
24. ✅ `DOCS_CLEANUP_LIST.md` - 本文档

---

## 📊 清理统计

- **当前文档数**: 79 个
- **待删除**: ~45 个
- **保留**: ~24 个核心文档
- **清理率**: ~57%

---

## 🎯 执行步骤

1. 创建 `_deprecated_docs` 目录
2. 移动待删除文档到该目录（而不是直接删除）
3. 更新 DOCS_INDEX.md
4. 确认无问题后，可以删除 `_deprecated_docs` 目录






