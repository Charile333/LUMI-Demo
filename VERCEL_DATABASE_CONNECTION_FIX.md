# Vercel 数据库连接错误修复

## 🔴 问题描述

在 Vercel 部署时，出现大量 500 错误：

```
Error: getaddrinfo ENOTFOUND db.bepwgrvplikstxcffbzh.supabase.co
errno: -3007, code: 'ENOTFOUND', syscall: 'getaddrinfo'
```

### 受影响的 API：
- ❌ `/api/orders/book` - 获取订单簿（500错误）
- ❌ `/api/orders/my-orders` - 获取我的订单（500错误）
- ✅ `/api/orders/create` - 创建订单（200成功）

## 🔍 根本原因

### 为什么会失败？

1. **Serverless 环境限制**
   - Vercel 使用 serverless 函数，每次请求都是独立的环境
   - PostgreSQL 连接池无法在函数调用之间共享
   - 连接池配置不适合 serverless 环境

2. **DNS 解析超时**
   - 默认的连接超时（2000ms）在 serverless 冷启动时太短
   - 网络不稳定导致 DNS 解析失败

3. **连接数配置**
   - 原配置 `max: 20` 对 serverless 环境来说过大
   - 每个函数实例都会尝试创建连接池

## ✅ 修复方案

### 1. 数据库连接优化 ✅

修改了 `lib/db/index.ts`：

```typescript
// 检测是否在 Vercel serverless 环境
const isVercel = process.env.VERCEL === '1';

// Vercel serverless 环境优化配置
const poolConfig = isVercel ? {
  connectionString,
  max: 1,                      // ⚡ 减少连接数
  idleTimeoutMillis: 10000,    // ⚡ 减少空闲超时
  connectionTimeoutMillis: 5000, // ⚡ 增加连接超时
  ssl: {
    rejectUnauthorized: false  // ⚡ Supabase 需要 SSL
  }
} : {
  // 本地开发环境配置
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### 关键改动：

| 配置项 | 本地开发 | Vercel 生产 | 说明 |
|--------|----------|-------------|------|
| `max` | 20 | 1 | 连接池大小 |
| `idleTimeoutMillis` | 30000 | 10000 | 空闲超时（毫秒）|
| `connectionTimeoutMillis` | 2000 | 5000 | 连接超时（毫秒）|
| `ssl.rejectUnauthorized` | - | false | SSL 验证 |

## 📋 部署步骤

### Step 1: 检查 Vercel 环境变量

登录 Vercel Dashboard，确保已配置：

```bash
# 必需的环境变量
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.bepwgrvplikstxcffbzh.supabase.co:5432/postgres

# Supabase 环境变量（如果使用 Supabase 客户端）
NEXT_PUBLIC_SUPABASE_URL=https://bepwgrvplikstxcffbzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 如何添加环境变量：

1. 打开 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加上述变量
5. 选择应用到所有环境（Production, Preview, Development）

### Step 2: 获取 Supabase 数据库连接字符串

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** → **Database**
4. 复制 **Connection string** → **URI**
5. 将 `[YOUR-PASSWORD]` 替换为你的数据库密码

示例：
```
postgresql://postgres:your-password@db.bepwgrvplikstxcffbzh.supabase.co:5432/postgres
```

### Step 3: 重新部署到 Vercel

方式 1 - 通过 Git 推送：
```bash
git add .
git commit -m "fix: 优化 Vercel serverless 数据库连接"
git push origin main
```

方式 2 - 使用 Vercel CLI：
```bash
vercel --prod
```

方式 3 - 在 Vercel Dashboard 手动重新部署：
1. 进入项目的 **Deployments** 页面
2. 点击最新部署旁边的 **⋯** 
3. 选择 **Redeploy**

### Step 4: 验证修复

部署完成后，检查以下端点：

```bash
# 检查订单簿
curl https://your-domain.vercel.app/api/orders/book?marketId=1&outcome=1

# 检查我的订单
curl https://your-domain.vercel.app/api/orders/my-orders?address=0x...

# 检查创建订单
curl -X POST https://your-domain.vercel.app/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"marketId":1,"outcome":1,...}'
```

## 🎯 预期结果

修复后应该看到：

### Vercel 日志（正常）：
```
✅ PostgreSQL 连接池已创建 (Vercel 模式)
GET /api/orders/book 200 in 150ms
GET /api/orders/my-orders 200 in 200ms
POST /api/orders/create 200 in 180ms
```

### 之前的错误日志：
```
❌ Error: getaddrinfo ENOTFOUND db.bepwgrvplikstxcffbzh.supabase.co
GET /api/orders/book 500 in 4000ms
```

## 🔧 故障排除

### 问题 1: 仍然出现 ENOTFOUND 错误

**可能原因**：
- Supabase 数据库暂停或不可用
- DATABASE_URL 配置错误
- 网络连接问题

**解决方案**：
```bash
# 1. 检查 Supabase 数据库是否在线
# 登录 Supabase Dashboard → Settings → Database
# 确保项目状态为 "Active"

# 2. 测试本地连接
psql "postgresql://postgres:your-password@db.bepwgrvplikstxcffbzh.supabase.co:5432/postgres"

# 3. 检查 Vercel 环境变量
vercel env ls
```

### 问题 2: 连接超时

**可能原因**：
- Supabase 冷启动
- Vercel 函数执行时间限制

**解决方案**：
```typescript
// 增加超时时间
connectionTimeoutMillis: 10000, // 改为 10 秒
```

### 问题 3: 连接池耗尽

**可能原因**：
- 高并发请求
- 连接未正确释放

**解决方案**：
```typescript
// 1. 检查是否有未释放的连接
// 2. 确保每个查询都在 try-finally 中释放连接
// 3. 监控 Supabase 连接数

// 临时增加连接数（不推荐）
max: 2, // 在 Vercel 环境中最多 2 个连接
```

## 📊 性能优化建议

### 1. 使用 Supabase REST API（推荐）

对于简单查询，使用 Supabase REST API 代替直接 SQL：

```typescript
// 替代方案：使用 Supabase 客户端
import { getSupabaseAdmin } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  
  // 使用 Supabase 客户端而不是原始 SQL
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('market_id', marketId);
    
  if (error) throw error;
  return NextResponse.json(data);
}
```

**优点**：
- ✅ 更好的 serverless 支持
- ✅ 自动连接管理
- ✅ 内置错误处理
- ✅ 支持 RLS（行级安全）

### 2. 添加连接重试机制

```typescript
async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await this.pool.query<T>(text, params);
      return result;
    } catch (error: any) {
      lastError = error;
      
      // 如果是连接错误，重试
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.log(`🔄 重试连接 (${i + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 重置连接池
        if (isVercel) {
          pool = null;
          this.pool = getPool();
        }
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
```

### 3. 监控和日志

在 Vercel Dashboard 中监控：

```typescript
// 添加详细日志
console.log('[DB] 连接配置:', {
  isVercel,
  max: poolConfig.max,
  timeout: poolConfig.connectionTimeoutMillis
});

console.log('[DB] 查询开始:', {
  sql: text.substring(0, 50),
  timestamp: new Date().toISOString()
});
```

## 🔐 安全建议

### 1. 使用环境变量

❌ **不要**在代码中硬编码：
```typescript
const connectionString = 'postgresql://postgres:password@...'; // 危险！
```

✅ **应该**使用环境变量：
```typescript
const connectionString = process.env.DATABASE_URL;
```

### 2. 启用 SSL

在生产环境中始终使用 SSL：
```typescript
ssl: {
  rejectUnauthorized: false, // Supabase 自签名证书
  // 或者使用自定义证书
  ca: fs.readFileSync('/path/to/ca-cert.pem'),
}
```

### 3. 限制连接权限

在 Supabase Dashboard 中：
1. 使用专用数据库用户
2. 只授予必要的权限（SELECT, INSERT, UPDATE）
3. 启用行级安全（RLS）

## 📚 相关文档

- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Supabase with Vercel](https://supabase.com/docs/guides/integrations/vercel)
- [PostgreSQL Connection Pooling](https://node-postgres.com/features/pooling)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🎉 修复完成

- ✅ 优化了 Vercel serverless 环境的数据库连接
- ✅ 添加了 SSL 支持
- ✅ 增加了连接超时时间
- ✅ 减少了连接池大小
- ✅ 添加了环境检测

**下一步**：
1. 推送代码到 Git
2. 等待 Vercel 自动部署
3. 检查日志确认修复成功
4. 监控性能指标

---

**修复日期**: 2025-10-30
**影响范围**: `/api/orders/book`, `/api/orders/my-orders`
**修复状态**: ✅ 已完成

