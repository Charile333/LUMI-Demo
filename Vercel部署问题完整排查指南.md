# 🔧 Vercel部署问题完整排查指南

## ✅ 已确认
- 环境变量已配置（NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY）
- 添加时间：Oct 25

---

## 🔍 接下来需要检查的问题

### 问题1：环境变量配置后是否重新部署了？⚠️

**重要**：环境变量需要重新部署才能生效！

#### 检查方法：
```
1. 查看环境变量添加时间：Oct 25
2. 查看最新部署时间：？
3. 如果部署时间早于Oct 25，需要重新部署！
```

#### 立即重新部署：
1. 访问 Vercel Dashboard → 你的项目
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧 **⋯** 菜单
5. 选择 **Redeploy**
6. 点击 **Redeploy** 确认

⏳ 等待1-2分钟部署完成

---

### 问题2：Supabase数据库表是否存在？🗄️

错误可能是因为数据库表不存在。

#### 检查步骤：

**1. 登录Supabase Dashboard**
- 访问 https://supabase.com
- 登录账号
- 选择你的项目

**2. 检查表是否存在**
- 点击左侧 **Table Editor**
- 查看是否有以下表：

| 表名 | 用途 | 是否存在？ |
|------|------|-----------|
| `orders` | 存储订单 | ☐ |
| `orderbooks` | 订单簿聚合 | ☐ |
| `markets` | 市场信息 | ☐ |
| `alerts` | 预警数据 | ☐ |
| `users` | 用户信息 | ☐ |

**3. 如果表不存在，创建表**

在 Supabase Dashboard：
1. 点击左侧 **SQL Editor**
2. 点击 **New query**
3. 复制项目中的SQL文件内容：

```bash
# 方法1：创建完整数据库
使用文件：scripts/supabase-orderbook-clean-install.sql

# 方法2：只创建订单簿表
使用文件：scripts/supabase-orderbook-schema-simple.sql
```

4. 粘贴到SQL编辑器
5. 点击 **Run** 执行

---

### 问题3：Supabase RLS（行级安全）策略 🔐

Supabase默认启用RLS，可能阻止了API访问。

#### 检查和修复：

**方法1：临时禁用RLS（快速测试）**
```sql
-- 在Supabase SQL Editor中运行
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE orderbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;
```

**方法2：添加允许所有操作的策略（推荐）**
```sql
-- 允许所有人读取订单
CREATE POLICY "Allow read orders" ON orders
FOR SELECT USING (true);

-- 允许所有人创建订单
CREATE POLICY "Allow insert orders" ON orders
FOR INSERT WITH CHECK (true);

-- 允许读取订单簿
CREATE POLICY "Allow read orderbooks" ON orderbooks
FOR SELECT USING (true);

-- 允许更新订单簿
CREATE POLICY "Allow upsert orderbooks" ON orderbooks
FOR ALL USING (true);

-- 允许读取市场
CREATE POLICY "Allow read markets" ON markets
FOR SELECT USING (true);
```

---

### 问题4：Soon页面实时预警不工作 📊

这是独立的功能，使用币安API。

#### 检查步骤：

**1. 打开浏览器控制台**
- 访问 https://lumi-demo-rsdza49cw-korncs-projects.vercel.app
- 按 F12 打开开发者工具
- 点击 **Console** 标签

**2. 查看日志**
应该看到：
```javascript
✅ 实时市场数据更新成功 2 条警报
🔄 Vercel 环境：使用轮询模式 + 币安API实时数据
```

**3. 如果看到错误**
- `CORS error` → 币安API被浏览器阻止
- `Failed to fetch` → 网络问题或币安API限流
- `No alerts` → 正常，表示当前BTC/ETH价格变化<1%

**4. 手动测试币安API**
在控制台运行：
```javascript
fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]')
  .then(r => r.json())
  .then(console.log)
```

如果返回数据，说明币安API可用。

---

## 🧪 完整测试流程

### 测试1：检查环境变量是否生效

在Vercel部署的网站，打开浏览器控制台运行：
```javascript
// 这个应该显示你的Supabase URL
console.log('检查环境变量:', !!window.location.href);

// 测试API是否能连接
fetch('/api/alerts/stats')
  .then(r => r.json())
  .then(data => console.log('API测试:', data))
  .catch(err => console.error('API错误:', err));
```

### 测试2：测试创建订单

```javascript
fetch('/api/orders/create-realtime', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    marketId: 1,
    userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    side: 'buy',
    price: 0.65,
    quantity: 10
  })
})
.then(r => r.json())
.then(data => {
  console.log('订单结果:', data);
  if (data.success) {
    console.log('✅ 订单创建成功！');
  } else {
    console.error('❌ 失败原因:', data.error);
  }
});
```

---

## 📋 问题诊断清单

按顺序检查：

- [ ] **步骤1**: 重新部署Vercel项目（最重要！）
- [ ] **步骤2**: 检查Supabase表是否存在
- [ ] **步骤3**: 禁用RLS或添加策略
- [ ] **步骤4**: 测试API连接
- [ ] **步骤5**: 测试创建订单
- [ ] **步骤6**: 检查Soon页面实时预警

---

## 🆘 常见错误和解决方案

### 错误1: ENOTFOUND db.xxx.supabase.co
**原因**: 环境变量未生效
**解决**: 重新部署Vercel

### 错误2: relation "orders" does not exist
**原因**: 数据库表未创建
**解决**: 运行SQL文件创建表

### 错误3: new row violates row-level security policy
**原因**: RLS策略阻止
**解决**: 禁用RLS或添加策略

### 错误4: permission denied for table orders
**原因**: 使用anon key但表有RLS
**解决**: 使用service_role key或添加策略

---

## 🎯 预期结果

全部修复后：

✅ **Soon页面**
- 右侧终端显示 "BINANCE API" 状态
- 每10秒更新BTC/ETH价格
- 显示24小时价格变化

✅ **交易功能**
- 点击交易按钮
- 填写价格和数量
- 提交订单成功
- 订单显示在订单簿

✅ **控制台**
- 没有 ENOTFOUND 错误
- 没有 Supabase 连接错误
- 订单API返回 success: true

---

## 📞 需要帮助？

如果完成上述步骤后仍有问题：

1. **查看Vercel运行时日志**
   - Vercel Dashboard → Logs
   - 搜索 "error" 或 "failed"

2. **查看Supabase日志**
   - Supabase Dashboard → Logs
   - 查看API请求记录

3. **提供错误信息**
   - 完整的错误消息
   - 浏览器控制台截图
   - Vercel部署日志

---

## ⚡ 快速命令参考

```bash
# 本地测试
npm run dev

# 查看Vercel日志
vercel logs [deployment-url]

# 重新部署
vercel --prod
```

---

**开始从步骤1执行，逐步排查！** 🚀

