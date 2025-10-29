# 🚀 Black Swan V2 部署检查清单

## ✅ 已完成
- [x] Supabase数据库配置
- [x] 生成Cron密钥

## 📋 接下来的步骤

### 步骤1：创建本地环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cron Job安全密钥（已生成）
CRON_SECRET=PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=

# 管理后台密码（可选）
ADMIN_PASSWORD=your_admin_password
```

**如何获取Supabase密钥：**
1. 打开 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 `Settings` > `API`
4. 复制以下内容：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (点击显示) → `SUPABASE_SERVICE_ROLE_KEY`

---

### 步骤2：安装依赖（如果还没安装）

```bash
npm install @supabase/supabase-js
```

---

### 步骤3：本地测试

```bash
# 启动开发服务器
npm run dev

# 访问新页面
# http://localhost:3000/black-swan-v2

# 测试API
curl http://localhost:3000/api/crash-events

# 测试Cron（手动触发）
curl -H "Authorization: Bearer PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=" \
  http://localhost:3000/api/cron/detect-crash
```

---

### 步骤4：配置Vercel环境变量

1. 进入 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 `Settings` > `Environment Variables`
4. 添加以下变量（**所有环境：Production, Preview, Development**）：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=
```

**注意：**
- `NEXT_PUBLIC_` 开头的变量会暴露到客户端（这是安全的，Supabase设计如此）
- `SUPABASE_SERVICE_ROLE_KEY` 和 `CRON_SECRET` 只在服务端使用，不会暴露

---

### 步骤5：部署到Vercel

```bash
# 提交代码
git add .
git commit -m "feat: add Black Swan V2 with Supabase integration"
git push

# Vercel会自动部署
# 或者手动触发：vercel --prod
```

---

### 步骤6：验证部署

#### 6.1 检查页面
```
https://your-app.vercel.app/black-swan-v2
```

应该看到：
- ✅ "Realtime Connected" 绿色指示器
- ✅ 显示6个历史崩盘事件
- ✅ 可以点击查看图表

#### 6.2 测试API
```bash
curl https://your-app.vercel.app/api/crash-events
```

应该返回JSON数组包含6个事件。

#### 6.3 查看Cron状态
1. Vercel Dashboard > 你的项目 > `Cron Jobs`
2. 应该看到：
   - Path: `/api/cron/detect-crash`
   - Schedule: `0 * * * *` (每小时)
   - Status: Active

#### 6.4 手动触发Cron测试
```bash
curl -H "Authorization: Bearer PAVgYN0HRuVQSC+8DpQrcUJ8a2RCaLUsmJnBLpYVtDM=" \
  https://your-app.vercel.app/api/cron/detect-crash
```

应该返回：
```json
{
  "success": true,
  "timestamp": "2025-10-29T...",
  "results": [...]
}
```

---

### 步骤7：查看Cron执行日志

1. Vercel Dashboard > 你的项目 > `Logs`
2. 过滤：`/api/cron/detect-crash`
3. 应该能看到每小时的执行记录

---

## 🎉 完成！

现在你拥有：
- ✅ 完整的崩盘事件数据库
- ✅ 实时数据更新（Supabase Realtime）
- ✅ 自动崩盘检测（每小时运行）
- ✅ 历史数据永久存储
- ✅ 多维度筛选功能

---

## 🔧 常见问题

### Q: Realtime没有连接？
**A:** 检查：
1. Supabase Dashboard > Database > Replication
2. 确保 `crash_events` 表已启用
3. 浏览器控制台查看WebSocket连接状态

### Q: Cron没有执行？
**A:** 检查：
1. Vercel计划（免费版有限制）
2. 环境变量是否正确配置
3. Vercel Dashboard > Crons查看状态

### Q: API返回401错误？
**A:** 检查：
1. `CRON_SECRET` 是否正确设置
2. Authorization header是否包含正确的Bearer token

### Q: 没有检测到新崩盘？
**A:** 这是正常的：
1. 需要实际市场出现-10%以上跌幅
2. 检查阈值设置：`app/api/cron/detect-crash/route.ts`
3. 查看 `crash_detection_logs` 表查看所有检测记录

---

## 📚 下一步优化

- [ ] 添加Telegram通知
- [ ] 实现多事件对比视图
- [ ] 添加移动端优化
- [ ] 集成价格预警
- [ ] 添加用户自定义监控资产

---

## 🆘 需要帮助？

- 完整文档：`BLACK_SWAN_V2_DEPLOYMENT.md`
- 快速参考：`BLACK_SWAN_V2_QUICKSTART.md`
- 数据库架构：`scripts/supabase-crash-events-schema.sql`

如有问题，请查看文档或提交Issue。





