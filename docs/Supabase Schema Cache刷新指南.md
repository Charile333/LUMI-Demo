# 🔄 Supabase Schema Cache 刷新指南

## 问题说明

即使数据库字段已添加，应用仍然报错 "Could not find the 'xxx' column in the schema cache"，这是因为 Supabase 的 schema cache 需要刷新。

## 验证字段是否存在

运行检查脚本确认字段已存在：

```bash
node scripts/check-orders-full-schema.js
```

如果所有字段都显示 "已存在"，说明数据库迁移成功，只是 cache 需要刷新。

## 解决方案

### 方法 1: 等待自动刷新（推荐）

Supabase 会自动刷新 schema cache，通常需要 **5-15 分钟**。

- ✅ 最简单，无需操作
- ⏳ 需要等待

### 方法 2: 重新部署 Vercel 应用（最快）

如果使用 Vercel 部署：

1. 在 Vercel Dashboard 中打开项目
2. 点击 "Redeploy" 或 "Deployments" > "Redeploy"
3. 等待部署完成

这会强制应用重新连接 Supabase，获取最新的 schema。

### 方法 3: 重启本地开发服务器

如果是本地开发：

```bash
# 停止服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 方法 4: 清除浏览器缓存

1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

### 方法 5: 手动刷新 Supabase API

1. 打开 Supabase Dashboard
2. 进入 Settings > API
3. 如果看到 "Refresh" 或 "Restart" 按钮，点击它

## 验证修复

刷新后，再次尝试交易：

1. 打开应用
2. 尝试创建一个订单
3. 如果成功，说明 cache 已刷新

## 故障排除

如果等待 15 分钟后仍然失败：

1. **检查字段是否正确添加**
   ```bash
   node scripts/check-orders-full-schema.js
   ```

2. **检查 Vercel 环境变量**
   - 确认 `NEXT_PUBLIC_SUPABASE_URL` 正确
   - 确认 `SUPABASE_SERVICE_ROLE_KEY` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确

3. **查看 Vercel 日志**
   - 在 Vercel Dashboard > Deployments > Logs 中查看错误信息

4. **手动执行查询验证**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'orders' 
   ORDER BY column_name;
   ```

## 相关文件

- `scripts/check-orders-full-schema.js` - 检查表结构脚本
- `scripts/refresh-supabase-schema-cache.js` - 刷新 cache 脚本
- `database/fix-orders-table-missing-columns.sql` - 修复表结构 SQL


