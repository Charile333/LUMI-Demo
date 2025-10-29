# 🔧 Vercel 部署错误修复说明

## 已修复的问题

### ✅ 问题 1: GoTrueClient 多实例警告
**错误信息**: 
```
Multiple GoTrueClient instances detected in the same browser context
```

**原因**: 项目中有 3 个重复的 Supabase 客户端文件，导致创建了多个实例。

**修复内容**:
- ✅ 删除了重复文件：
  - `lib/supabase/client.ts`
  - `lib/db/supabase-client.ts`
- ✅ 保留并优化了 `lib/supabase-client.ts`，使用单例模式
- ✅ 更新了所有 API 路由，统一使用 `@/lib/supabase-client`

**验证方法**: 重新部署后，浏览器控制台不应再显示 GoTrueClient 警告。

---

### ⚠️ 问题 2: API 500 错误（需要配置环境变量）

**错误信息**:
```
GET /api/orders/book?marketId=4&outcome=1 500 (Internal Server Error)
GET /api/orders/my-orders?address=0x... 500 (Internal Server Error)
```

**原因**: Vercel 环境中缺少 `DATABASE_URL` 环境变量，订单 API 无法连接 PostgreSQL 数据库。

**修复内容**:
- ✅ 添加了更好的错误处理和提示信息
- ✅ 更新了环境变量配置文档
- ✅ 为数据库连接添加了清晰的错误提示

**需要用户操作**: 在 Vercel 中配置 DATABASE_URL 环境变量（见下方步骤）

---

## 🚀 完成修复的步骤

### 步骤 1: 获取 Supabase 数据库连接字符串

1. 登录 https://supabase.com
2. 选择你的项目
3. 点击左侧 **Settings** → **Database**
4. 向下滚动找到 **Connection string**
5. 选择 **URI** 格式
6. 复制连接字符串，例如：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.bepwgrvplikstxcffbzh.supabase.co:5432/postgres
   ```
7. 将 `[YOUR-PASSWORD]` 替换为你的数据库密码

---

### 步骤 2: 在 Vercel 配置环境变量

1. 访问 https://vercel.com
2. 进入你的项目（lumi-demo）
3. 点击 **Settings** → **Environment Variables**
4. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bepwgrvplikstxcffbzh.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase 公开密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase 服务端密钥 |
| `DATABASE_URL` | `postgresql://postgres:...` | PostgreSQL 连接字符串 |

**重要提示**: 
- 每个变量都要勾选 ✅ Production, Preview, Development
- DATABASE_URL 是新增的，必须配置才能使用订单功能

---

### 步骤 3: 重新部署

1. 在 Vercel 项目页面，点击 **Deployments**
2. 找到最新的部署
3. 点击右侧 **...** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache**
6. 点击 **Redeploy**

⏳ 等待 1-2 分钟部署完成

---

## 🧪 验证修复

部署完成后，打开浏览器控制台：

### 验证 1: GoTrueClient 警告已消失
```javascript
// 打开浏览器控制台 (F12)
// 刷新页面，检查是否还有 "Multiple GoTrueClient instances" 警告
```

✅ **预期结果**: 不应再出现 GoTrueClient 相关警告

### 验证 2: 订单 API 正常工作
```javascript
// 在控制台运行以下测试
fetch('https://lumi-demo.vercel.app/api/orders/book?marketId=4&outcome=1')
  .then(r => r.json())
  .then(console.log)
```

✅ **预期结果**: 
- 如果配置了 DATABASE_URL：返回订单簿数据
- 如果未配置：返回清晰的错误提示，包含配置指引

---

## 📋 完整的环境变量检查清单

在 Vercel → Settings → Environment Variables 中确认以下变量都已配置：

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 公开密钥（anon key）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 服务端密钥（service role key）
- [ ] `DATABASE_URL` - PostgreSQL 连接字符串（**新增！**）

---

## 🔍 如果问题仍然存在

### 检查 Vercel 日志

1. Vercel Dashboard → 项目 → **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs** 和 **Function Logs**
4. 搜索关键词：`DATABASE_URL`、`Supabase`、`GoTrueClient`

### 检查环境变量是否生效

在部署的页面控制台运行：
```javascript
// 这些应该显示实际的 URL，而不是 undefined
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

如果显示 `undefined`，说明环境变量没有生效，需要：
1. 确认变量名拼写正确
2. 确认勾选了 Production 环境
3. 重新部署项目

---

## 📚 相关文档

- [Vercel 环境变量配置指南](./VERCEL_环境变量配置指南.md)
- [Supabase 设置指南](./SUPABASE_SETUP_GUIDE.md)
- [环境变量示例](./env.example)

---

## ✅ 预期修复效果

修复完成后，你应该看到：

1. ✅ **GoTrueClient 警告消失** - 浏览器控制台干净
2. ✅ **订单 API 正常工作** - 不再返回 500 错误
3. ✅ **清晰的错误提示** - 如果配置有误，会显示详细的解决方案

如果配置了所有环境变量，订单功能应该完全正常：
- 创建订单 ✅
- 查看订单簿 ✅
- 获取我的订单 ✅

---

**修复完成后请反馈结果！** 🎉

如有问题，请提供：
1. Vercel 控制台截图
2. 浏览器控制台错误信息
3. 已配置的环境变量列表（不要包含实际的 key 值）

