# 🚀 Vercel 批量结算配置指南

## 📋 概述

在 Vercel 上部署时，**可以使用 Vercel Cron Jobs** 来实现批量自动结算功能。

**重要说明：**
- ✅ Vercel Cron Jobs 支持（需要 Pro 计划）
- ✅ 使用 API 路由代替 PM2
- ⚠️ 免费版 Cron Jobs 有限制（执行频率较低）

---

## 🎯 两种方案对比

### 方案 1：PM2（本地/VPS）

**适用场景：**
- ✅ 本地开发
- ✅ 自托管服务器（VPS）
- ✅ 需要长时间运行的进程

**特点：**
- ✅ 支持实时 Cron 调度
- ✅ 可以监控进程状态
- ❌ 需要服务器资源
- ❌ Vercel 不支持

---

### 方案 2：Vercel Cron Jobs（推荐）

**适用场景：**
- ✅ Vercel 部署
- ✅ Serverless 架构
- ✅ 无需管理服务器

**特点：**
- ✅ 自动按计划执行
- ✅ 无需管理进程
- ✅ 自动扩展
- ⚠️ 需要 Pro 计划（免费版有限制）
- ⚠️ 最长执行时间有限制（60秒）

---

## 🚀 配置步骤

### 步骤 1：创建 API 路由

已创建：`app/api/cron/settle-trades/route.ts`

这个 API 路由会：
- ✅ 每 5 分钟自动执行（由 Vercel Cron 触发）
- ✅ 查找待结算的订单
- ✅ 创建结算批次
- ✅ 执行链上结算（如果配置了私钥）

---

### 步骤 2：配置 vercel.json

已更新 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/settle-trades",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**时间说明：**
- `*/5 * * * *` = 每 5 分钟执行一次
- 可以修改为其他时间，例如：
  - `*/10 * * * *` = 每 10 分钟
  - `0 * * * *` = 每小时整点
  - `0 0 * * *` = 每天凌晨

---

### 步骤 3：配置环境变量

在 Vercel Dashboard 中配置以下环境变量：

#### 必需的环境变量：

```env
# 平台钱包私钥（用于批量结算）
PLATFORM_WALLET_PRIVATE_KEY=your_private_key_here

# Cron 安全密钥（用于验证请求）
CRON_SECRET=your_random_secret_string

# 数据库连接
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# RPC 节点 URL
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

#### 如何添加环境变量：

1. 打开 Vercel Dashboard
2. 选择你的项目
3. 进入 `Settings` > `Environment Variables`
4. 添加上述环境变量
5. 重新部署项目（让环境变量生效）

---

### 步骤 4：验证 Cron 配置

#### 4.1 检查 Cron Jobs 状态

1. 打开 Vercel Dashboard
2. 选择你的项目
3. 进入 `Settings` > `Cron Jobs`
4. 应该看到：
   - Path: `/api/cron/settle-trades`
   - Schedule: `*/5 * * * *`
   - Status: `Active`

#### 4.2 手动测试 API

```bash
# 手动触发批量结算（需要 Authorization header）
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/settle-trades
```

或者直接访问（开发环境）：
```
https://your-app.vercel.app/api/cron/settle-trades
```

---

### 步骤 5：查看执行日志

#### 5.1 在 Vercel Dashboard 查看

1. 打开 Vercel Dashboard
2. 选择你的项目
3. 进入 `Logs`
4. 筛选 `/api/cron/settle-trades`
5. 应该看到每次执行的日志

#### 5.2 查看数据库

```sql
-- 查看最近的结算批次
SELECT * FROM settlements 
ORDER BY created_at DESC 
LIMIT 10;

-- 查看待结算交易
SELECT COUNT(*) FROM trades 
WHERE settled = false 
  AND settlement_batch_id IS NULL;
```

---

## ⚠️ 重要限制和注意事项

### 1. Vercel 计划限制

#### 免费版（Hobby）
- ⚠️ Cron Jobs 执行频率较低（可能每天只执行几次）
- ⚠️ 最长执行时间：10 秒
- ⚠️ 不适合高频批量结算

#### Pro 版
- ✅ 无执行频率限制
- ✅ 最长执行时间：60 秒
- ✅ 推荐用于生产环境

### 2. 执行时间限制

**当前实现：**
- 每次最多处理 20 个订单
- 预计执行时间：< 10 秒（无链上调用）
- 有链上调用时：可能超过 60 秒（需要优化）

**如果超时：**
- 订单会保持待结算状态
- 下次执行会继续处理

### 3. 链上结算代码状态

**当前状态：** 链上结算代码被注释（模拟模式）

**原因：**
- CTF Exchange 合约需要先部署
- 需要充分测试
- 订单数据格式需要匹配

**启用方法：**
1. 取消注释 `app/api/cron/settle-trades/route.ts` 中的链上调用代码
2. 确保合约地址正确
3. 测试并监控

---

## 🔍 监控和调试

### 1. 检查 Cron 是否执行

#### 方法 1：查看 Vercel Logs

```
Vercel Dashboard > 项目 > Logs > 筛选 /api/cron/settle-trades
```

#### 方法 2：查看数据库

```sql
-- 查看最近的结算记录
SELECT 
  batch_id,
  trade_count,
  status,
  created_at,
  completed_at
FROM settlements 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. 常见问题排查

#### 问题 1：Cron 未执行

**检查：**
- ✅ Vercel 计划是否为 Pro（免费版有限制）
- ✅ `vercel.json` 中的 Cron 配置是否正确
- ✅ 项目是否已部署
- ✅ 环境变量是否配置

#### 问题 2：执行超时

**解决方案：**
- 减少每次处理的订单数量（从 20 改为 10）
- 优化数据库查询
- 异步处理链上调用

#### 问题 3：环境变量未加载

**检查：**
- ✅ 环境变量是否正确配置
- ✅ 是否需要重新部署项目
- ✅ 是否使用了 `NEXT_PUBLIC_` 前缀（会暴露到客户端）

---

## 📊 性能优化建议

### 1. 批量大小优化

```typescript
// 根据执行时间动态调整
const BATCH_SIZE = process.env.VERCEL ? 10 : 20; // Vercel 限制更严格
```

### 2. 异步处理

```typescript
// 如果链上调用耗时，可以异步处理
const settlementPromise = executeOnChainSettlement(...);
// 不等待，直接返回
```

### 3. 错误重试

```typescript
// 添加重试逻辑
// 如果失败，标记为待重试
```

---

## 🎯 总结

### ✅ 已配置的内容

1. ✅ API 路由：`app/api/cron/settle-trades/route.ts`
2. ✅ Cron 配置：`vercel.json`
3. ✅ 安全验证：`CRON_SECRET`

### ⚠️ 需要配置的内容

1. ⚠️ 环境变量（Vercel Dashboard）
   - `PLATFORM_WALLET_PRIVATE_KEY`
   - `CRON_SECRET`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_RPC_URL`

2. ⚠️ Vercel 计划（需要 Pro 版）
   - 免费版 Cron Jobs 有限制

3. ⚠️ 链上结算代码（可选）
   - 取消注释链上调用代码
   - 确保合约已部署

### 🚀 下一步

1. ✅ 配置环境变量
2. ✅ 部署到 Vercel
3. ✅ 验证 Cron 执行
4. ✅ 监控日志和数据库

---

## 📝 参考文档

- [Vercel Cron Jobs 文档](https://vercel.com/docs/cron-jobs)
- [Vercel 环境变量](https://vercel.com/docs/concepts/projects/environment-variables)
- [本地批量结算指南](./启动平台批量自动结算指南.md)

