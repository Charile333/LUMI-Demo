# 🚀 黑天鹅终端 - 5分钟快速入门

## 最快启动方式

### 方法 1：一键演示模式（推荐）

#### Windows:
```bash
cd LUMI
scripts\start-demo.bat
```

#### Linux/Mac:
```bash
cd LUMI
chmod +x scripts/start-demo.sh
./scripts/start-demo.sh
```

### 方法 2：手动启动

```bash
# 1. 进入LUMI目录
cd LUMI

# 2. （可选）生成演示数据
node scripts/generate-demo-alerts.js 30

# 3. 启动服务器
npm run dev

# 4. 打开浏览器
# 访问：http://localhost:3000/black-swan-terminal
```

---

## 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│ [← BACK] BLACK SWAN TERMINAL v2.1.0      ● WS: CONNECTED    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗    ███████╗      │
│   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝    ██╔════╝      │
│   ██████╔╝██║     ███████║██║     █████╔╝     ███████╗      │
│   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗     ╚════██║      │
│   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗    ███████║      │
│                                                               │
│          REAL-TIME MARKET ANOMALY DETECTION SYSTEM            │
│                 黑天鹅事件实时监控终端                         │
│                                                               │
├────────────────────────────────┬──────────────────────────────┤
│ ═══ ALERT STREAM ═══           │ ═══ SYSTEM PANEL ═══         │
│                                │                              │
│ [2025-01-15 10:23:45] CRITICAL│ ╔═ SYSTEM STATUS ═╗          │
│ BTC/USDT  -5.23%               │ WebSocket: ✓ ONLINE          │
│ Sudden price drop detected     │ Uptime: 00:15:32             │
│                                │                              │
│ [2025-01-15 10:22:18] HIGH     │ ╔═ STATISTICS ═╗             │
│ ETH/USDT  +3.14%               │ Total Alerts: 156            │
│ Whale transfer detected        │ Critical: 12                 │
│                                │                              │
│ [2025-01-15 10:21:05] MEDIUM   │ ╔═ DETECTORS ═╗              │
│ SOL/USDT  +1.87%               │ ✓ price_jump.py              │
│ Volume surge detected          │ ✓ whale_transfer.py          │
│                                │ ✓ funding_spike.py           │
├────────────────────────────────┴──────────────────────────────┤
│ root@blackswan:~$ help                                        │
└───────────────────────────────────────────────────────────────┘
```

---

## 基础操作

### 🎮 命令速查

在底部命令行输入：

```bash
# 显示帮助
help

# 查看统计数据
stats

# 只看严重警报
filter critical

# 显示所有警报
filter all

# 清空屏幕
clear
```

### 🖱️ 快捷操作

右侧面板有快捷按钮，点击即可执行常用命令！

---

## 警报等级

| 颜色 | 等级 | 变化幅度 |
|------|------|---------|
| 🔴 红 | CRITICAL | > 5% |
| 🟠 橙 | HIGH | 2-5% |
| 🟡 黄 | MEDIUM | 1-2% |
| 🟢 绿 | LOW | < 1% |

---

## 实时功能

✅ **自动连接** - 启动即连接WebSocket  
✅ **实时推送** - 新警报即时显示  
✅ **自动重连** - 断线后5秒重连  
✅ **历史数据** - 启动时加载最近警报  
✅ **智能过滤** - 多级过滤快速筛选  

---

## 常见问题

### ❓ 没有看到警报？

**解决方法：**
```bash
# 生成测试数据
node scripts/generate-demo-alerts.js 50
```

### ❓ WebSocket 显示 DISCONNECTED？

**解决方法：**
1. 确保服务器正在运行
2. 刷新页面
3. 等待自动重连

### ❓ 想要生成更多测试数据？

**解决方法：**
```bash
# 生成100条测试警报
node scripts/generate-demo-alerts.js 100
```

---

## 下一步

1. ✅ 启动终端（已完成）
2. 🎯 输入 `help` 查看所有命令
3. 🎮 尝试 `filter critical` 过滤严重警报
4. 📊 运行 `stats` 查看统计信息
5. 🧹 使用 `clear` 清空屏幕

---

## 进阶使用

### 持续监控模式

启动真实监控程序（需要Python）：

```bash
cd ../duolume-master
python main.py
```

这会连接Binance获取实时市场数据并触发真实警报！

### 查看数据库

```bash
cd ../duolume-master
python check_btc_eth_alerts.py
```

---

## 快捷键

- `Enter` - 执行命令
- 点击输入框 - 快速聚焦

---

## 相关链接

- 📖 [完整文档](./BLACK_SWAN_TERMINAL_README.md)
- 🦢 [黑天鹅集成指南](./BLACK_SWAN_INTEGRATION_GUIDE.md)
- 🏠 [返回图形界面](http://localhost:3000/black-swan)

---

**🎉 享受终端监控体验！**

```bash
root@blackswan:~$ █
```



