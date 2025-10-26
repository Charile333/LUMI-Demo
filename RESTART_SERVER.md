# 🚨 服务器重启指南

## 当前问题

```
⨯ Error: Cannot find module 'E:\project\demo\LUMI\.next\server\pages\_document.js'
GET / 500 in 692ms
```

**原因**: 删除了 `.next` 缓存但服务器还在运行，导致状态不一致。

---

## ✅ 解决方案（按顺序执行）

### 步骤 1: 停止当前服务器

在终端中按：
```
Ctrl + C
```

等待服务器完全停止（看到命令行提示符）。

### 步骤 2: 确认服务器已停止

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 步骤 3: 重新启动服务器

```bash
cd E:\project\demo\LUMI
npm run dev
```

### 步骤 4: 等待编译完成

你应该会看到：
```
✓ Compiled successfully
Ready on http://localhost:3000
```

---

## 🧪 测试

### 1. 访问首页
```
http://localhost:3000
```

应该正常显示首页，没有错误。

### 2. 测试彩票博彩平台跳转

- 点击时间轴上的 "2026-Q1 彩票/一站式链上博彩平台"
- 应该跳转到：`http://localhost:3000/blockchain-gambling.html`

### 3. 直接访问彩票页面
```
http://localhost:3000/blockchain-gambling.html
```

应该直接打开彩票博彩平台页面。

---

## 🔍 如果还有问题

### 完全清理并重建

```powershell
# 停止所有 Node 进程
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 进入项目目录
cd E:\project\demo\LUMI

# 删除缓存（如果还存在）
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# 重新启动
npm run dev
```

### 检查端口占用

```powershell
# 查看端口 3000 是否被占用
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# 如果被占用，杀掉进程
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Stop-Process -Id $port.OwningProcess -Force
}
```

---

## ✨ 预期结果

重启后，你应该看到：

```
============================================================
🚀 服务器已启动
📍 地址: http://localhost:3000
🔌 Socket.IO: ws://localhost:3000
🦢 Alert WebSocket: ws://localhost:3000/ws/alerts
🌍 环境: development
============================================================
```

没有任何错误信息！

---

## 📋 快速命令

```powershell
# 一键重启（复制粘贴到 PowerShell）
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; cd E:\project\demo\LUMI; npm run dev
```

---

**现在请停止服务器（Ctrl+C）并重新启动！**



