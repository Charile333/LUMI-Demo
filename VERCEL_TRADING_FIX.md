# Vercel 部署后交易问题修复指南

## 问题诊断

用户无法在 Vercel 部署的站点上交易，可能的原因：

### 1. 环境变量未配置 ⚠️

**检查方法：**
登录 Vercel Dashboard → 选择项目 → Settings → Environment Variables

**需要配置的变量：**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**获取方式：**
1. 登录 https://supabase.com
2. 选择你的项目
3. Settings → API
4. 复制 Project URL 和 API Keys

### 2. Supabase RLS 权限问题 ⚠️

**问题表现：**
- 控制台显示 403 Forbidden 错误
- 订单创建失败

**解决方案：**
在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 允许匿名用户创建订单
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人创建订单"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "允许所有人查看订单"
ON orders FOR SELECT
TO public
USING (true);

-- 允许更新订单簿
ALTER TABLE orderbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人查看订单簿"
ON orderbooks FOR SELECT
TO public
USING (true);

CREATE POLICY "允许服务角色更新订单簿"
ON orderbooks FOR ALL
TO service_role
USING (true);
```

### 3. CORS 配置问题

**检查方法：**
打开浏览器控制台，查看是否有 CORS 错误

**解决方案：**
Supabase 已自动配置 CORS，无需额外设置

### 4. MetaMask 钱包问题

**用户端检查清单：**
- ✅ 已安装 MetaMask 浏览器扩展
- ✅ 已创建或导入钱包
- ✅ 已连接到正确的网络（Polygon）
- ✅ 点击"Connect Wallet"按钮连接钱包

### 5. API 路由问题

**检查方法：**
直接访问 API 端点：
```
https://your-domain.vercel.app/api/orders/create
```

应该返回 405 Method Not Allowed（因为需要 POST 请求）

**如果返回 404：**
检查 `app/api/orders/create/route.ts` 文件是否存在

## 快速修复步骤

### 步骤 1: 配置 Vercel 环境变量

1. 登录 Vercel Dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加以下变量（Production 环境）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 点击 Save
5. 重新部署项目（Deployments → Redeploy）

### 步骤 2: 配置 Supabase 权限

1. 登录 Supabase Dashboard
2. 选择项目 → SQL Editor
3. 执行上面的 SQL 语句
4. Authentication → Providers → Enable Anonymous Sign-ins（可选）

### 步骤 3: 测试交易功能

1. 访问 Vercel 部署的网站
2. 打开浏览器控制台（F12）
3. 点击任意市场的 YES 或 NO 按钮
4. 检查控制台是否有错误信息

## 常见错误及解决方案

### 错误 1: "请先安装 MetaMask 钱包！"
**解决：** 用户需要安装 MetaMask 扩展

### 错误 2: "创建订单失败: 缺少必要参数"
**原因：** API 请求参数不完整
**检查：** `QuickTradeModal.tsx` 中的订单数据结构

### 错误 3: "Network Error" 或 "Failed to fetch"
**原因：** Supabase 配置错误或 API 路由未部署
**检查：** 
1. 环境变量是否正确
2. Supabase 项目是否暂停
3. API 路由是否正确部署

### 错误 4: "Invalid API key"
**原因：** Supabase API Key 错误
**解决：** 重新复制正确的 API Key

## 验证清单

部署后请验证：

- [ ] 环境变量已在 Vercel 配置
- [ ] Supabase RLS 策略已创建
- [ ] 可以访问 API 端点
- [ ] 浏览器控制台无 CORS 错误
- [ ] MetaMask 可以连接
- [ ] 可以成功提交订单
- [ ] 订单簿实时更新

## 调试技巧

### 1. 查看 Vercel 日志
Vercel Dashboard → Deployments → 选择最新部署 → Functions → 查看函数日志

### 2. 查看浏览器控制台
F12 → Console → 查看错误信息

### 3. 查看网络请求
F12 → Network → 筛选 API 请求 → 查看请求/响应详情

### 4. 使用 Supabase 日志
Supabase Dashboard → Logs → API → 查看请求日志

## 联系支持

如果问题仍未解决，请提供：
1. 浏览器控制台完整错误信息
2. Vercel 函数日志
3. Supabase API 日志
4. 用户操作步骤

## 相关文档

- [Vercel 环境变量配置指南](./VERCEL_环境变量配置指南.md)
- [Supabase 实时订单簿实施指南](./Supabase实时订单簿实施指南.md)
- [Vercel 部署指南](./VERCEL_DEPLOYMENT_GUIDE.md)

