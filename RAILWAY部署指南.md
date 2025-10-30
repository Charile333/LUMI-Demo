# 🚂 Railway 部署 WebSocket - 超简单

---

## ✅ 已完成
- Railway CLI 已安装
- ws-server 代码已准备
- 配置文件已创建

---

## 🚀 3 步部署（5分钟）

### 第 1 步：登录 Railway

打开 PowerShell，执行：

```powershell
cd E:\project\demo\LUMI\ws-server
railway login
```

会自动打开浏览器：
1. 选择 GitHub 登录（推荐）或邮箱登录
2. 授权 Railway
3. 完成后返回终端

---

### 第 2 步：创建项目并链接

```powershell
# 初始化项目
railway init

# 按提示输入：
# Project name: lumi-websocket
# 选择: Create new project
```

---

### 第 3 步：设置环境变量

```powershell
railway variables set DATABASE_URL="postgresql://postgres:Abcabc123123++@db.bepwgrvplikstxcffbzh.supabase.co:6543/postgres"
```

---

### 第 4 步：部署

```powershell
railway up
```

等待 2-3 分钟完成部署。

---

### 第 5 步：获取 WebSocket 地址

```powershell
railway status
```

会显示您的部署 URL，类似：
```
lumi-websocket.up.railway.app
```

您的 WebSocket 地址：
```
wss://lumi-websocket.up.railway.app
```

---

## 📋 完整命令（按顺序执行）

```powershell
# 1. 进入目录
cd E:\project\demo\LUMI\ws-server

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 设置数据库
railway variables set DATABASE_URL="postgresql://postgres:Abcabc123123++@db.bepwgrvplikstxcffbzh.supabase.co:6543/postgres"

# 5. 部署
railway up

# 6. 查看状态
railway status

# 7. 查看日志
railway logs
```

---

## 💰 费用

```
✅ 免费 $5/月额度
✅ 大约可运行 500-1000 小时
✅ 足够个人项目使用
```

---

## 🔧 常用命令

```powershell
# 查看日志
railway logs

# 重新部署
railway up

# 查看环境变量
railway variables

# 打开控制台
railway open
```

---

## 🎯 更新前端代码

部署成功后，更新前端：

```typescript
// hooks/useWebSocket.ts
const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://lumi-websocket.up.railway.app'  // ✅ Railway
  : 'ws://localhost:8080';
```

---

**现在打开 PowerShell，从第 1 步开始吧！** 🚀



