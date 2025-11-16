# 🔧 PM2 配置修复说明

## ⚠️ 问题

在 Windows 上使用 PM2 运行 TypeScript 文件时，出现 `ts-node` 不可用的错误。

## ✅ 解决方案

已修复 `ecosystem.config.js` 配置文件，使用正确的路径调用 `ts-node`：

```javascript
{
  name: 'lumi-cron',
  script: 'node',
  args: 'node_modules/ts-node/dist/bin.js scripts/cron-scheduler.ts',
  // ...
}
```

---

## 📋 启用步骤（Windows）

### 步骤 1：确保 ts-node 已安装

```powershell
npm install
```

确认 `ts-node` 在 `package.json` 的 `devDependencies` 中。

---

### 步骤 2：删除旧的 PM2 进程（如果有）

```powershell
pm2 delete lumi-cron
```

---

### 步骤 3：启动 Cron 调度器

```powershell
npm run cron:start
```

或直接使用 PM2：

```powershell
pm2 start ecosystem.config.js
```

---

### 步骤 4：查看状态

```powershell
npm run cron:status
```

或：

```powershell
pm2 status
```

应该看到 `lumi-cron` 状态为 `online`。

---

### 步骤 5：查看日志

```powershell
npm run cron:logs
```

或：

```powershell
pm2 logs lumi-cron
```

应该看到：
```
✅ Cron 调度器已启动
任务列表:
  1. 市场激活 - 每小时 (0 * * * *)
  2. 清理订单 - 每 30 分钟 (*/30 * * * *)
  3. 批量结算 - 每 5 分钟 (*/5 * * * *)
```

---

## 🔍 故障排查

### 问题 1：进程状态为 `errored`

**检查错误日志**：
```powershell
pm2 logs lumi-cron --err
```

**常见原因**：
1. `ts-node` 未安装
2. 脚本路径错误
3. 环境变量未加载

**解决方案**：
1. 安装依赖：`npm install`
2. 确认 `ts-node` 在 `package.json` 中
3. 检查 `.env.local` 文件

---

### 问题 2：进程状态为 `stopped`

**检查日志**：
```powershell
pm2 logs lumi-cron --lines 50
```

**可能原因**：
1. 脚本启动后立即退出
2. 配置文件错误

**解决方案**：
1. 手动运行脚本测试：
   ```powershell
   npm run cron
   ```
2. 检查脚本是否正常运行

---

### 问题 3：无法找到 ts-node

**错误**：
```
Error: Interpreter ts-node is NOT AVAILABLE in PATH
```

**解决方案**：
使用修复后的 `ecosystem.config.js`，它使用：
```javascript
script: 'node',
args: 'node_modules/ts-node/dist/bin.js scripts/cron-scheduler.ts',
```

---

## ✅ 验证启用成功

### 1. 检查 PM2 状态

```powershell
pm2 status
```

应该看到：
```
│ 0  │ lumi-cron    │ default     │ 1.0.0   │ cluster │ XXXXX    │ XXs    │ 0    │ online    │ 0%       │ XXmb    │ ...
```

状态应该是 `online`，而不是 `stopped` 或 `errored`。

---

### 2. 查看日志

```powershell
pm2 logs lumi-cron --lines 30
```

应该看到 Cron 调度器启动的日志。

---

### 3. 等待 5 分钟测试批量结算

批量结算任务每 5 分钟运行一次，等待 5 分钟后检查日志：

```powershell
pm2 logs lumi-cron --lines 50
```

应该看到：
```
⏰ 触发：批量结算任务
时间: ...
💰 开始批量结算交易...
```

---

## 📝 常用命令

### 查看状态

```powershell
npm run cron:status
pm2 status
```

### 查看日志

```powershell
npm run cron:logs
pm2 logs lumi-cron
pm2 logs lumi-cron --lines 50
pm2 logs lumi-cron --err
```

### 重启

```powershell
npm run cron:restart
pm2 restart lumi-cron
```

### 停止

```powershell
npm run cron:stop
pm2 stop lumi-cron
```

### 删除

```powershell
pm2 delete lumi-cron
```

---

## 🎉 完成！

如果状态显示为 `online`，说明平台自动结算已成功启用！

现在用户的订单将每 5 分钟自动批量结算，无需手动操作。

