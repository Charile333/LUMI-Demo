# 🚀 Vercel环境变量配置指南 - 紧急修复

## ⚠️ 当前问题

**错误**: `getaddrinfo ENOTFOUND db.bepwgrvplikstxcffbzh.supabase.co`

**原因**: Vercel没有配置Supabase数据库连接信息

---

## ✅ 立即修复步骤（3分钟）

### 第一步：获取Supabase凭据

1. 访问 https://supabase.com
2. 登录你的账号
3. 选择你的项目（或创建新项目）
4. 点击左侧 **Settings** → **API**
5. 复制以下信息：

```
Project URL: https://xxx.supabase.co
anon public key: eyJhbG...（很长的字符串）
service_role key: eyJhbG...（另一个很长的字符串）
```

---

### 第二步：在Vercel配置环境变量

1. 打开 https://vercel.com
2. 进入你的项目：`lumi-demo-rsdza49cw-korncs-projects`
3. 点击 **Settings** → **Environment Variables**
4. 添加以下3个变量：

#### 变量1：NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://bepwgrvplikstxcffbzh.supabase.co  （你的Supabase URL）
```
✅ 勾选: Production, Preview, Development

#### 变量2：NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbG...  （你的anon key，很长）
```
✅ 勾选: Production, Preview, Development

#### 变量3：SUPABASE_SERVICE_ROLE_KEY（可选但推荐）
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbG...  （你的service role key）
```
✅ 勾选: Production, Preview, Development

---

### 第三步：重新部署

在Vercel项目页面：
1. 点击 **Deployments**
2. 找到最新的部署
3. 点击右侧 **...** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache** （更快）
6. 点击 **Redeploy**

⏳ 等待1-2分钟重新部署完成

---

## 🧪 测试修复

部署完成后，测试以下功能：

### 1. Soon页面实时预警
```
访问: https://lumi-demo-rsdza49cw-korncs-projects.vercel.app
检查: 右侧终端是否显示BTC/ETH价格更新
预期: 每10秒更新一次币安数据
```

### 2. 交易功能
```
访问: https://lumi-demo-rsdza49cw-korncs-projects.vercel.app/markets
选择一个市场
点击交易
提交订单
预期: 订单成功创建，不再报错
```

---

## 🔍 如何验证环境变量

在浏览器控制台运行：
```javascript
// 检查前端环境变量（应该显示URL）
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

如果显示`undefined`，说明环境变量没有生效，需要重新部署。

---

## 📋 完整的环境变量列表

### Supabase相关（必需）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bepwgrvplikstxcffbzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 可选配置
```bash
ADMIN_PASSWORD=your_admin_password  # 管理后台密码
```

---

## ❓ 常见问题

### Q1: 为什么添加环境变量后还是报错？
**A**: 需要重新部署才能生效。环境变量在构建时注入，不会自动更新。

### Q2: anon key和service role key有什么区别？
**A**: 
- `anon key`: 公开密钥，用于前端，权限受RLS限制
- `service role key`: 服务端密钥，绕过RLS，用于API路由

### Q3: 如何创建Supabase数据库表？
**A**: 参考项目中的SQL文件：
```bash
scripts/supabase-orderbook-clean-install.sql  # 订单簿表
scripts/setup-database-clean.sql              # 完整数据库
```

在Supabase Dashboard → SQL Editor 中运行这些SQL脚本。

---

## 🎯 快速检查清单

- [ ] 在Supabase获取了3个值（URL + 2个key）
- [ ] 在Vercel添加了3个环境变量
- [ ] 重新部署了项目
- [ ] 测试Soon页面（实时预警）
- [ ] 测试交易功能（下单）
- [ ] 在Supabase运行了SQL初始化脚本

---

## 🆘 如果还是不工作

### 检查Supabase表是否存在
1. 登录 Supabase Dashboard
2. 点击 **Table Editor**
3. 确认以下表存在：
   - `orders` - 订单表
   - `orderbooks` - 订单簿表
   - `markets` - 市场表
   - `alerts` - 预警表（可选）

如果表不存在，运行：
```sql
-- 在Supabase SQL Editor中运行
-- 复制 scripts/supabase-orderbook-clean-install.sql 的内容
```

### 检查Vercel日志
1. Vercel Dashboard → 项目 → **Logs**
2. 查看部署日志和运行时日志
3. 搜索 "supabase" 或 "ENOTFOUND"
4. 查看具体错误信息

---

## ✅ 预期结果

修复后，你应该看到：
- ✅ Soon页面右侧终端显示实时BTC/ETH价格
- ✅ 交易时不再报`ENOTFOUND`错误
- ✅ 订单成功创建并显示在订单簿
- ✅ 浏览器控制台没有Supabase相关错误

---

**修复完成后请测试并反馈！** 🎉

