# 🔧 Supabase 连接问题修复指南

## 🎯 问题描述

看到的错误：
```
❌ Markets 查询错误: TypeError: fetch failed
⚠️ 返回模拟数据作为降级方案
```

这说明 Supabase 数据库连接失败了。

---

## 📋 可能的原因

### 1️⃣ 环境变量未配置
最常见的原因是缺少 Supabase 配置。

### 2️⃣ 网络连接问题
类似 RPC 问题，可能是：
- 防火墙阻止
- 网络限制
- SSL/证书问题

### 3️⃣ Supabase 项目问题
- 项目已暂停
- 免费额度用完
- 项目已删除

---

## 🚀 解决方案

### 步骤 1: 运行诊断工具

```bash
node scripts/diagnose-supabase.js
```

这会检查：
- ✅ 环境变量是否配置
- ✅ Supabase 服务器是否可访问
- ✅ REST API 是否正常
- ✅ 数据查询是否成功

### 步骤 2: 检查环境变量

检查 `.env.local` 文件是否包含：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostgreSQL 连接（可选，用于直接数据库访问）
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### 步骤 3: 获取 Supabase 配置

如果没有 Supabase 项目：

1. **访问**: https://supabase.com/
2. **注册/登录**（免费）
3. **创建新项目**
   - 项目名称: lumi-market
   - 数据库密码: 设置一个强密码（记住它！）
   - 地区: 选择离你最近的

4. **获取配置**
   - 项目创建后，进入 **Settings → API**
   - 复制以下信息：
     - Project URL (NEXT_PUBLIC_SUPABASE_URL)
     - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
     - service_role key (SUPABASE_SERVICE_ROLE_KEY)

5. **配置到 .env.local**

6. **重启服务器**
   ```bash
   npm run dev
   ```

---

## 🔍 详细诊断

### 诊断 1: 检查 URL 格式

正确格式：
```
https://xxxxxxxxxxxxx.supabase.co
```

错误格式：
```
❌ http://xxxxxxxxxxxxx.supabase.co  (应该是 https)
❌ https://supabase.co               (缺少项目 ID)
❌ https://xxxxxxxxxxxxx.supabase.com (应该是 .co 不是 .com)
```

### 诊断 2: 检查 API Key

API Key 应该是长字符串：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

如果太短或格式不对，需要重新获取。

### 诊断 3: 测试连接

使用 curl 测试：

```bash
# Windows PowerShell
$headers = @{
    "apikey" = "YOUR_ANON_KEY"
    "Authorization" = "Bearer YOUR_ANON_KEY"
}

Invoke-WebRequest -Uri "https://your-project.supabase.co/rest/v1/" -Headers $headers

# 或使用 curl（如果安装了）
curl "https://your-project.supabase.co/rest/v1/" ^
  -H "apikey: YOUR_ANON_KEY" ^
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

预期结果：
- 状态码: 200 或 404（都表示连接成功）
- 错误: 表示有问题

---

## ✅ 已实施的优化

### 1. Supabase 客户端优化

更新了 `lib/supabase-client.ts`：
```typescript
createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'lumi-market@1.0.0'
    }
  }
});
```

### 2. 降级方案

`/api/markets/batch-stats` 已有降级逻辑：
```typescript
// Supabase 失败时自动返回模拟数据
if (error) {
  return generateMockData(marketIds);
}
```

这保证了即使 Supabase 连接失败，应用也能继续运行。

---

## 🎯 临时解决方案

### 方案 1: 使用模拟数据（当前）

✅ **已自动启用**
- 系统检测到 Supabase 失败
- 自动返回模拟数据
- 应用可以继续浏览

⚠️ **限制**：
- 数据不会持久化
- 无法查询真实订单
- 仅用于演示和测试

### 方案 2: 配置 Supabase（推荐）

配置后可以：
- ✅ 持久化数据
- ✅ 真实订单系统
- ✅ 实时更新
- ✅ 完整功能

### 方案 3: 使用本地数据库

如果 Supabase 连接有问题，可以使用本地 PostgreSQL：

```bash
# .env.local
DATABASE_URL=postgresql://localhost:5432/lumi_market
```

但这需要本地安装 PostgreSQL。

---

## 🔧 常见问题修复

### 问题 1: fetch failed

**症状**: `TypeError: fetch failed`

**原因**:
- 网络无法访问 Supabase
- SSL 证书问题
- 防火墙阻止

**解决**:
```bash
# 1. 检查网络
ping your-project.supabase.co

# 2. 运行诊断
node scripts/diagnose-supabase.js

# 3. 尝试不同网络
# - 切换 WiFi/移动网络
# - 开/关 VPN
```

### 问题 2: Invalid API key

**症状**: `Invalid API key` 或 `401 Unauthorized`

**解决**:
1. 重新获取 API Key（Settings → API）
2. 确保使用正确的 key（anon key 用于前端）
3. 检查是否有多余空格

### 问题 3: Project paused

**症状**: `Project is paused`

**解决**:
1. 登录 Supabase 控制台
2. 恢复项目（免费版可能会自动暂停）
3. 等待几分钟项目恢复

---

## 📊 降级方案说明

### 当前行为

```
尝试 Supabase 查询
    ↓
  失败？
    ↓ 是
返回模拟数据 ✅
    ↓
应用继续运行（功能受限）
```

### 模拟数据包含

```json
{
  "probability": 47.5,
  "bestBid": 0.455,
  "bestAsk": 0.475,
  "volume24h": 5432,
  "participants": 234,
  "priceChange24h": 2.3,
  "isMockData": true  // 标记为模拟数据
}
```

### 使用模拟数据时

- ✅ 可以浏览市场
- ✅ 可以查看价格
- ⚠️ 无法真实交易
- ⚠️ 数据不会保存
- ⚠️ 每次刷新数据会变化

---

## 🎓 推荐步骤

### 立即执行

1. **运行诊断**
   ```bash
   node scripts/diagnose-supabase.js
   ```

2. **根据诊断结果**：
   
   **如果环境变量未配置** →
   - 注册 Supabase
   - 创建项目
   - 配置 .env.local
   
   **如果连接失败** →
   - 检查网络
   - 尝试其他网络环境
   - 检查防火墙
   
   **如果查询失败** →
   - 检查数据库表是否存在
   - 检查 RLS 策略
   - 运行数据库迁移

3. **重启服务器**
   ```bash
   npm run dev
   ```

---

## 💡 Supabase 配置完整指南

### 1. 创建 Supabase 项目

```
访问: https://supabase.com
注册账号 → 创建组织 → 新建项目

项目信息:
- 名称: lumi-market
- 密码: 设置强密码（保存好！）
- 地区: Singapore / Tokyo（亚洲用户）
       或 US East (美国用户)
```

### 2. 获取 API 配置

```
Supabase 控制台 → Settings → API

复制以下内容：
✅ Project URL
✅ Project API keys → anon public
✅ Project API keys → service_role (点击 "Reveal" 查看)
```

### 3. 配置环境变量

创建/编辑 `.env.local`:

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 数据库连接（Settings → Database → Connection string）
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 4. 运行数据库迁移

```bash
# 如果有迁移脚本
npm run db:setup

# 或手动执行 SQL
# 在 Supabase 控制台 → SQL Editor 中执行建表语句
```

---

## ⚠️ 注意事项

### Supabase 免费版限制

- ✅ 500MB 数据库存储
- ✅ 5GB 文件存储
- ✅ 2GB 数据传输/月
- ⚠️ 7天不活跃会暂停

### 网络要求

Supabase 需要访问：
- `*.supabase.co` (HTTPS)
- 端口 443
- WebSocket 支持（Realtime 功能）

如果公司/学校网络有限制，可能无法访问。

---

## 🆘 仍然无法连接？

### 选项 1: 使用模拟数据继续开发

当前系统已经有完整的降级方案，可以：
- ✅ 浏览市场
- ✅ 查看订单簿（模拟）
- ✅ 测试界面

只是无法持久化数据。

### 选项 2: 使用本地 PostgreSQL

安装本地数据库：
```bash
# Windows: 下载安装 PostgreSQL
# https://www.postgresql.org/download/windows/

# 配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/lumi_market
```

### 选项 3: 等待网络恢复

如果是临时网络问题：
- 等待几分钟
- 重试连接
- 检查网络状态

---

## ✨ 总结

### 当前状态

❌ **Supabase 连接**: 失败（网络问题）  
✅ **降级方案**: 已启用（返回模拟数据）  
✅ **应用运行**: 正常（功能受限）

### 影响范围

**不影响**：
- ✅ 浏览市场（使用模拟数据）
- ✅ 查看界面
- ✅ 测试功能

**受影响**：
- ❌ 真实数据查询
- ❌ 订单持久化
- ❌ 用户订单历史
- ❌ 实时更新

### 解决方案优先级

1. **运行诊断**: `node scripts/diagnose-supabase.js`
2. **配置 Supabase**: 注册并获取配置
3. **测试连接**: 确保网络可达
4. **重启应用**: `npm run dev`

---

**更新时间**: 2025-11-10  
**状态**: ✅ 诊断工具已创建

**核心文件**:
- `scripts/diagnose-supabase.js` - 诊断工具
- `lib/supabase-client.ts` - 已优化
- `app/api/markets/batch-stats/route.ts` - 有降级方案

立即运行诊断工具找出问题！🔍


