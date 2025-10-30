# 🚀 WebSocket 部署 - 3步完成

## ✅ 已完成
- Fly CLI 已安装
- 已登录账号：3204088879@qq.com  
- ws-server 代码已准备

---

## 📋 还需完成 3 步

### 第 1 步：获取 Supabase DATABASE_URL

#### 方法 1：从 Vercel 复制（最简单）

1. 打开 https://vercel.com
2. 进入您的 LUMI 项目
3. Settings → Environment Variables
4. 找到 `DATABASE_URL`
5. 复制值（应该类似这样）：
   ```
   postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

#### 方法 2：从 Supabase 获取

1. 打开 https://supabase.com
2. 进入您的项目
3. Settings → Database
4. 找到 "Connection string" → "URI"
5. 复制完整连接字符串

---

### 第 2 步：设置环境变量

打开新的 **PowerShell** 窗口，执行：

```powershell
# 设置 PATH
$env:Path = "C:\Users\32040\.fly\bin;$env:Path"

# 进入目录
cd E:\project\demo\LUMI\ws-server

# 设置 DATABASE_URL（替换成您的真实连接字符串）
flyctl secrets set DATABASE_URL="postgresql://postgres:您的密码@db.项目ID.supabase.co:5432/postgres"
```

---

### 第 3 步：部署

```powershell
flyctl deploy
```

等待 2-3 分钟完成部署。

---

### 第 4 步：验证

```powershell
# 查看状态
flyctl status

# 查看日志
flyctl logs

# 打开控制台
flyctl dashboard
```

---

## ✅ 部署成功后

您的 WebSocket 地址：
```
wss://lumi-websocket.fly.dev
```

更新前端代码（任选一个位置）：

```typescript
// hooks/useWebSocket.ts
const WS_URL = 'wss://lumi-websocket.fly.dev';
```

---

## 💡 提示

如果没有 DATABASE_URL，也可以先部署，但 WebSocket 服务器无法查询订单数据。

建议：从 Vercel 环境变量中复制 DATABASE_URL 最简单！

---

**准备好了吗？执行上面的命令即可！** 🚀



