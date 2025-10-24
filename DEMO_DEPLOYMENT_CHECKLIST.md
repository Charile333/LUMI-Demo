# ✅ Demo 发布检查清单

## 🎯 准备发布 Demo

**目标**: 安全地发布到公网供演示使用

---

## 🔐 安全加固（已完成）✅

### 1. 管理后台保护
- [x] ✅ 添加登录页面（`/admin/login`）
- [x] ✅ 密码认证
- [x] ✅ Cookie Session 管理
- [x] ✅ 中间件路由保护
- [x] ✅ API 权限验证
- [x] ✅ 登出功能

**现在访问 `/admin/create-market` 会自动跳转到登录页！** 🔒

---

## ⚙️ 环境配置

### 必需配置的环境变量

在 `.env.local` 中添加：

```env
# ==========================================
# 管理员认证（必需！）
# ==========================================

# 管理员密码（请修改为复杂密码！）
ADMIN_PASSWORD=your_strong_password_here_123!

# API 密钥（可选，用于程序化访问）
ADMIN_API_SECRET=your_api_secret_key_456!

# ==========================================
# 数据库（必需）
# ==========================================

# 使用 Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 或使用 PostgreSQL
# DATABASE_URL=postgresql://user:password@host:5432/database

# ==========================================
# 区块链（必需）
# ==========================================

# 平台钱包私钥（用于激活市场）⚠️ 保密！
PLATFORM_WALLET_PRIVATE_KEY=0x...

# RPC 节点
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com

# ==========================================
# 合约地址
# ==========================================

NEXT_PUBLIC_ADAPTER_ADDRESS=0x5D440c98B55000087a8b0C164f1690551d18CfcC
NEXT_PUBLIC_USDC_ADDRESS=0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a
NEXT_PUBLIC_CTF_ADDRESS=0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2
```

---

## 📋 部署前检查清单

### 1. 环境变量 ✅

```bash
# 检查关键环境变量是否已设置
- [ ] ADMIN_PASSWORD（强密码）
- [ ] NEXT_PUBLIC_SUPABASE_URL 或 DATABASE_URL
- [ ] PLATFORM_WALLET_PRIVATE_KEY
- [ ] NEXT_PUBLIC_RPC_URL
```

### 2. 数据库 ✅

```bash
# 确保数据库表已创建
npm run db:setup
npm run db:migrate
npm run db:add-options

# 或在 Supabase Dashboard 执行：
# - scripts/supabase-step2-tables.sql
# - scripts/add-activity-fields.sql
# - scripts/add-outcome-options.sql
```

### 3. 本地测试 ✅

```bash
# 启动服务器
npm run dev

# 测试登录
http://localhost:3000/admin/login
密码: 你设置的 ADMIN_PASSWORD

# 测试创建市场
http://localhost:3000/admin/create-market

# 测试前端显示
http://localhost:3000
```

### 4. 安全性检查 ✅

```bash
- [ ] 管理后台需要密码登录
- [ ] API 路径有权限验证
- [ ] 敏感信息不在前端代码中
- [ ] .env.local 在 .gitignore 中
- [ ] 平台钱包私钥保密
```

---

## 🚀 部署方案

### 方案 A：Vercel 部署（推荐）⭐

**优点**:
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 一键部署

**步骤**:

1. **连接 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 配置环境变量（复制 .env.local 的内容）
   - 点击 Deploy

3. **配置环境变量（重要！）**
   
   在 Vercel Dashboard → Settings → Environment Variables 添加：
   ```
   ADMIN_PASSWORD=your_strong_password
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   PLATFORM_WALLET_PRIVATE_KEY=0x...
   NEXT_PUBLIC_RPC_URL=https://...
   （其他环境变量）
   ```

4. **完成！**
   ```
   你的 Demo 地址: https://your-app.vercel.app
   管理后台: https://your-app.vercel.app/admin/login
   ```

---

### 方案 B：自己的服务器部署

**步骤**:

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置环境变量**
   ```bash
   # 在服务器上创建 .env.local
   nano .env.local
   # 粘贴配置
   ```

3. **启动生产服务**
   ```bash
   npm run start:ws
   
   # 或使用 PM2（推荐）
   npm install -g pm2
   pm2 start npm --name "market-app" -- run start:ws
   pm2 save
   ```

4. **配置 Nginx 反向代理**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
     }
   }
   ```

---

## 🔒 安全建议（生产环境）

### 必须做 ⚠️

```
1. 修改默认密码
   ADMIN_PASSWORD=strong_password_with_symbols_123!@#

2. 启用 HTTPS
   - Vercel 自动提供
   - 自建服务器需要 Let's Encrypt

3. 环境变量保密
   - 不要提交到 Git
   - 不要在前端暴露
   - 使用 Vercel/服务器的安全存储

4. 定期更换密钥
   - 管理员密码
   - API 密钥
   - 平台钱包私钥（慎重！）
```

### 推荐做 ✅

```
1. 添加速率限制
   - 防止暴力破解
   - 限制 API 调用频率

2. 启用审计日志
   - 记录所有管理操作
   - 谁、何时、做了什么

3. 备份策略
   - 定期备份数据库
   - Supabase 自动备份

4. 监控告警
   - Vercel Analytics
   - Sentry 错误追踪
```

---

## 📝 Demo 使用说明

### 给用户的说明

```
Demo 地址: https://your-app.vercel.app

功能:
  ✅ 浏览预测市场
  ✅ 查看市场详情
  ✅ 标记感兴趣
  ✅ 连接钱包（测试网）
  ✅ 模拟交易

管理后台:
  ⚠️ 仅供演示，不对外开放
  URL: https://your-app.vercel.app/admin/login
  密码: (内部使用)
```

### 给团队的说明

```
管理后台登录:
  URL: https://your-app.vercel.app/admin/login
  密码: [在团队内部共享]

创建市场:
  1. 登录后台
  2. 访问 /admin/create-market
  3. 填写表单
  4. 提交（免费）

查看市场:
  - 前端会自动显示创建的市场
  - 活跃度高的市场会自动上链
```

---

## 🧪 发布前测试

### 本地测试所有功能

```bash
# 1. 测试登录
访问: http://localhost:3000/admin/login
输入密码 → 成功登录

# 2. 测试创建市场
访问: http://localhost:3000/admin/create-market
创建测试市场 → 成功

# 3. 测试前端显示
访问: http://localhost:3000
应该能看到市场列表

# 4. 测试登出
点击登出按钮 → 跳转到登录页

# 5. 测试未登录访问
清除 Cookie，访问 /admin/create-market
应该自动跳转到登录页
```

---

## 📦 最终文件清单

### 新增的安全文件

1. ✅ `middleware.ts` - 路由保护
2. ✅ `app/admin/login/page.tsx` - 登录页面
3. ✅ `app/api/admin/auth/login/route.ts` - 登录 API
4. ✅ `app/api/admin/auth/logout/route.ts` - 登出 API

### 修改的文件

5. ✅ `app/admin/create-market/page.tsx` - 添加登出按钮

---

## 🎯 部署步骤（Vercel）

### 1. 准备代码

```bash
# 确保所有修改已保存
git add .
git commit -m "Add admin authentication for demo"
git push
```

### 2. Vercel 部署

```
1. 登录 https://vercel.com
2. New Project
3. Import Git Repository
4. 配置环境变量（重要！）
5. Deploy
```

### 3. 设置环境变量

在 Vercel Dashboard 添加：
```
ADMIN_PASSWORD=Demo123!@#  (记住这个密码)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PLATFORM_WALLET_PRIVATE_KEY=0x...
NEXT_PUBLIC_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
```

### 4. 完成！

```
Demo 地址: https://your-app.vercel.app
管理后台: https://your-app.vercel.app/admin/login
密码: Demo123!@# (或你设置的密码)
```

---

## 📧 Demo 分享模板

### 发给客户/投资人

```
你好！

我们的预测市场平台 Demo 已上线：
https://your-app.vercel.app

核心功能:
  ✅ 浏览预测市场
  ✅ 区块链集成（Polygon 测试网）
  ✅ 链下订单匹配
  ✅ 实时通知系统

技术亮点:
  💰 成本优化：节省 80-90%
  ⚡ 性能提升：10-100 倍
  🔔 实时通知：WebSocket
  🎯 智能化：自动激活机制

欢迎体验！
如有问题随时联系。
```

---

## ⚠️ Demo 限制说明

### 告知用户

```
⚠️ 这是 Demo 版本，有以下限制：

1. 使用测试网络
   - Polygon Amoy Testnet
   - 不是真实资金

2. 数据可能重置
   - 定期清理测试数据
   - 不要依赖数据持久性

3. 功能演示
   - 展示核心功能
   - 某些功能仍在开发

4. 性能限制
   - 免费服务器
   - 可能有延迟
```

---

## 🎉 现在可以做什么

### 立即测试（本地）

```bash
# 1. 测试登录保护
访问: http://localhost:3000/admin/create-market
应该跳转到登录页

# 2. 登录
访问: http://localhost:3000/admin/login
密码: 你在 .env.local 设置的 ADMIN_PASSWORD

# 3. 创建市场
登录成功后自动跳转到创建页面

# 4. 登出测试
点击右下角"登出"按钮
```

### 准备部署

```bash
# 1. 确认环境变量
检查 .env.local 所有必需变量

# 2. 本地构建测试
npm run build
npm run start

# 3. 部署到 Vercel
按上面步骤操作

# 4. 配置 Vercel 环境变量

# 5. 测试线上 Demo
```

---

## 🔧 故障排查

### 问题：访问 /admin 没有跳转到登录页

**解决**: 清除浏览器 Cookie，刷新页面

### 问题：登录后还是跳转到登录页

**解决**: 检查 ADMIN_PASSWORD 环境变量是否正确设置

### 问题：部署后 500 错误

**解决**: 检查 Vercel 环境变量是否全部配置

---

## 📚 相关文档

- `后台架构对比.md` - 架构安全分析
- `POLYMARKET_REAL_BACKEND.md` - Polymarket 对比
- `DEPLOYMENT_GUIDE.md` - 详细部署指南

---

## ✅ 检查清单总结

部署前确认：

- [ ] ✅ 管理后台有密码保护
- [ ] ✅ 所有环境变量已配置
- [ ] ✅ 数据库表已创建
- [ ] ✅ 本地测试通过
- [ ] ✅ 登录/登出功能正常
- [ ] ✅ .env.local 未提交到 Git
- [ ] ✅ 准备好 Demo 说明文档

---

## 🎊 准备就绪！

**系统现在已经安全加固，可以发布 Demo 了！**

**默认管理员密码**: 在 `.env.local` 的 `ADMIN_PASSWORD` 中设置

**登录地址**: https://your-app.vercel.app/admin/login

---

**创建时间**: 2025-10-24  
**状态**: ✅ Demo 就绪  
**安全等级**: 🔒 基础保护已添加


