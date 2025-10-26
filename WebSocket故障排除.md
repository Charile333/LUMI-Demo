# WebSocket 故障排除指南

## 🔍 问题诊断

### 症状 1: `WebSocket 错误: Event {isTrusted: true...}`

**可能原因**：
1. 服务器未启动
2. 服务器刚重启，浏览器页面未刷新
3. 数据库路径配置错误（已修复）

**解决方案**：

#### ✅ 步骤 1: 确认服务器运行
```powershell
# 检查端口 3000 是否在监听
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

如果没有输出，启动服务器：
```bash
cd LUMI
npm run dev
```

#### ✅ 步骤 2: 硬刷新浏览器
- Windows: `Ctrl + Shift + R` 或 `Ctrl + F5`
- Mac: `Cmd + Shift + R`

#### ✅ 步骤 3: 清除浏览器缓存
1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

---

### 症状 2: `WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed`

**说明**: 这是 Next.js 的热模块替换（HMR）WebSocket 错误。

**影响**: 不影响应用功能，只影响开发时的热更新。

**解决方案**:

#### 方法 A: 忽略（推荐）
这个错误不影响实时预警系统，可以安全忽略。

#### 方法 B: 重启服务器
```bash
# 停止服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

#### 方法 C: 修改 Next.js 配置
在 `next.config.js` 中添加：
```javascript
module.exports = {
  // ... 其他配置
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  }
}
```

---

## 🧪 测试 WebSocket 连接

### 方法 1: 浏览器控制台测试

在 http://localhost:3000/black-swan 页面打开控制台（F12），运行：

```javascript
// 检查 WebSocket 状态
console.log('WebSocket 状态:', window.ws ? window.ws.readyState : '未初始化');

// 状态值说明：
// 0 = CONNECTING (连接中)
// 1 = OPEN (已连接)
// 2 = CLOSING (关闭中)
// 3 = CLOSED (已关闭)

// 如果是 1，说明连接正常
if (window.ws && window.ws.readyState === 1) {
  console.log('✅ WebSocket 连接正常！');
} else {
  console.log('❌ WebSocket 未连接');
}
```

### 方法 2: 使用在线工具测试

访问：https://www.websocket.org/echo.html

输入：`ws://localhost:3000/ws/alerts`

点击 "Connect"，应该看到连接成功的消息。

### 方法 3: 使用 Node.js 脚本测试

创建 `test-websocket.js`：
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/ws/alerts');

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功！');
});

ws.on('message', (data) => {
  console.log('📨 收到消息:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket 错误:', error.message);
});

ws.on('close', () => {
  console.log('🔌 WebSocket 已断开');
});

// 10秒后关闭连接
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 10000);
```

运行：
```bash
node test-websocket.js
```

---

## 🔧 完整重置步骤

如果以上方法都不行，执行完整重置：

### 1. 停止所有 Node 进程
```powershell
Get-Process -Name node | Stop-Process -Force
```

### 2. 清理依赖
```bash
cd LUMI
rm -rf node_modules
rm package-lock.json
```

### 3. 重新安装
```bash
npm install
```

### 4. 重启服务器
```bash
npm run dev
```

### 5. 清除浏览器
- 清空所有浏览器缓存
- 关闭所有标签页
- 重新打开浏览器
- 访问 http://localhost:3000/black-swan

---

## 📊 正常运行的标志

### 服务器日志应显示：
```
════════════════════════════════════════
🚀 服务器已启动
📍 地址: http://localhost:3000
🔌 Socket.IO: ws://localhost:3000
🦢 Alert WebSocket: ws://localhost:3000/ws/alerts
🌍 环境: development
════════════════════════════════════════

🦢 初始化警报监视器。最新警报ID: XXX
```

### 浏览器控制台应显示：
```
✅ 已连接到预警系统
```

### 插入测试预警后：
```
🦢 广播警报到 X 个客户端
```

---

## 🐛 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `ECONNREFUSED` | 连接被拒绝 | 服务器未启动 |
| `ETIMEDOUT` | 连接超时 | 防火墙阻止或网络问题 |
| `EADDRINUSE` | 端口已被占用 | 更改端口或关闭占用进程 |
| `ERR_BLOCKED_BY_CLIENT` | 被浏览器扩展阻止 | 禁用广告拦截器 |

---

## 📱 移动设备测试

如果要在移动设备上测试：

1. 获取本机 IP：
```powershell
ipconfig | findstr IPv4
```

2. 修改 WebSocket URL：
```javascript
// 在 black-swan/page.tsx 中
const wsUrl = `ws://192.168.x.x:3000/ws/alerts`;
```

3. 确保防火墙允许端口 3000

---

## 🆘 终极解决方案

如果所有方法都失败，尝试以下步骤：

### 1. 使用备用服务器
```bash
# 使用 server.js 而不是 server-with-websocket.js
npm run dev:old
```

### 2. 检查系统日志
```powershell
# Windows 事件查看器
eventvwr.msc
```

### 3. 检查 Node.js 版本
```bash
node --version
# 推荐: v18.x 或 v20.x
```

### 4. 重启计算机
有时候系统资源没有正确释放，重启可以解决问题。

---

## ✅ 验证清单

- [ ] 服务器在端口 3000 上运行
- [ ] 浏览器显示"已连接到预警系统"
- [ ] 运行 `test-alert.js` 后能看到新预警
- [ ] 浏览器控制台没有 WebSocket 错误（除了 HMR）
- [ ] 数据库文件存在：`database/alerts.db`
- [ ] Node 版本 >= 16.x

---

## 📞 获取帮助

如果问题仍未解决：

1. **复制完整错误信息**
   - 浏览器控制台（F12 → Console 标签）
   - 服务器终端输出
   - 错误截图

2. **提供系统信息**
   ```bash
   node --version
   npm --version
   ```

3. **检查文件完整性**
   ```bash
   # 确认关键文件存在
   ls server-with-websocket.js
   ls database/alerts.db
   ls test-alert.js
   ```

---

**最后更新**: 2025-10-26
**状态**: ✅ WebSocket 系统已修复并正常工作


