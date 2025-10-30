# 🚂 Railway 网页部署 - 3分钟完成

---

## 🎯 超简单 5 步

### 第 1 步：打开 Railway

访问：https://railway.app

点击 **"Login"**，选择 **GitHub 登录**

---

### 第 2 步：创建新项目

点击 **"New Project"**

选择 **"Deploy from GitHub repo"**

---

### 第 3 步：选择仓库

1. 授权 Railway 访问您的 GitHub
2. 搜索并选择：**`Charile333/ws-LUMI`**
3. 点击 **"Deploy Now"**

---

### 第 4 步：设置环境变量

部署开始后：

1. 点击您的项目
2. 点击 **"Variables"** 标签
3. 点击 **"New Variable"**
4. 添加：
   ```
   变量名: DATABASE_URL
   值: postgresql://postgres:Abcabc123123++@db.bepwgrvplikstxcffbzh.supabase.co:6543/postgres
   ```
5. 点击 **"Add"**

Railway 会自动重新部署。

---

### 第 5 步：获取 WebSocket 地址

1. 点击 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. 复制生成的地址，类似：
   ```
   ws-lumi-production.up.railway.app
   ```

您的 WebSocket 地址：
```
wss://ws-lumi-production.up.railway.app
```

---

## ✅ 完成！

等待 2-3 分钟部署完成，然后：

### 验证部署

1. 在 Railway 点击 **"Deployments"**
2. 查看状态应该是 **"Success"** ✅
3. 点击 **"View Logs"** 查看日志

应该看到：
```
✅ WebSocket 服务器运行在端口 8080
📡 ws://localhost:8080
```

---

## 📝 更新前端代码

```typescript
// hooks/useWebSocket.ts
const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://ws-lumi-production.up.railway.app'  // ✅ 替换成您的实际域名
  : 'ws://localhost:8080';

const ws = new WebSocket(WS_URL);
```

---

## 💰 费用

```
✅ $5/月 免费额度
✅ 约 500-1000 小时运行时间
✅ 足够个人/小型项目
```

---

## 🔧 管理

Railway Dashboard:
- 查看日志：Deployments → View Logs
- 重启服务：Settings → Restart
- 环境变量：Variables 标签
- 监控：Metrics 标签

---

**现在打开 https://railway.app 开始吧！** 🚀

代码仓库已准备好：https://github.com/Charile333/ws-LUMI



