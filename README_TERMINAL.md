# 🖥️ 黑天鹅终端监控系统

<div align="center">

```
  ╔══════════════════════════════════════════════════════════════════╗
  ║                                                                  ║
  ║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗    ███████╗██╗    ██╗║
  ║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝    ██╔════╝██║    ██║║
  ║   ██████╔╝██║     ███████║██║     █████╔╝     ███████╗██║ █╗ ██║║
  ║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗     ╚════██║██║███╗██║║
  ║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗    ███████║╚███╔███╔╝║
  ║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝ ╚══╝╚══╝ ║
  ║                                                                  ║
  ║              REAL-TIME MARKET ANOMALY DETECTION SYSTEM           ║
  ║                    黑天鹅事件实时监控终端                         ║
  ╚══════════════════════════════════════════════════════════════════╝
```

**专业的终端样式实时市场监控系统**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](.)
[![Status](https://img.shields.io/badge/status-active-success.svg)](.)

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [命令列表](#-命令列表) • [文档](#-文档)

</div>

---

## ✨ 特性概览

- 🖥️ **经典终端风格** - 黑底绿字，专业黑客美学
- 📊 **实时数据流** - WebSocket毫秒级实时推送
- ⌨️ **命令行界面** - 完整的CLI操作体验
- 🎨 **彩色编码** - 直观的严重程度标识
- 📈 **系统监控** - 全面的运行状态展示
- 🔄 **自动重连** - 断线自动恢复连接
- 🎯 **智能过滤** - 多级警报筛选系统
- 🚀 **一键启动** - 简单快速的部署

---

## 🚀 快速开始

### 最快方式（推荐）

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

### 手动启动

```bash
# 1. 安装依赖（首次）
npm install

# 2. 生成演示数据
node scripts/generate-demo-alerts.js 30

# 3. 启动服务器
npm run dev

# 4. 访问终端
# http://localhost:3000/black-swan-terminal
```

---

## 🎨 界面预览

### 终端布局

```
┌─────────────────────────────────────────────────────────────────┐
│ [BACK] BLACK SWAN TERMINAL v2.1.0          ● WS: CONNECTED     │
│ UPTIME: 00:15:32  ALERTS: 156  CRITICAL: 12                    │
├──────────────────────────────┬──────────────────────────────────┤
│  ═══ ALERT STREAM ═══        │  ═══ SYSTEM PANEL ═══           │
│                              │                                  │
│ [2025-01-15 10:23:45]        │  ╔═ SYSTEM STATUS ═╗            │
│ 🔴 CRITICAL  BTC/USDT -5.23% │  WebSocket: ✓ ONLINE            │
│ Sudden price drop            │  Monitoring: ✓ ACTIVE           │
│                              │  Uptime: 00:15:32               │
│ [2025-01-15 10:22:18]        │                                  │
│ 🟠 HIGH      ETH/USDT +3.14% │  ╔═ STATISTICS ═╗               │
│ Whale transfer detected      │  Total: 156                     │
│                              │  Critical: 12                   │
│ [2025-01-15 10:21:05]        │  High: 34                       │
│ 🟡 MEDIUM    SOL/USDT +1.87% │  Assets: 8                      │
│ Volume surge                 │                                  │
│                              │  ╔═ DETECTORS ═╗                │
│ [2025-01-15 10:20:32]        │  ✓ price_jump.py                │
│ 🟢 LOW       BNB/USDT +0.45% │  ✓ whale_transfer.py            │
│ Minor fluctuation            │  ✓ funding_spike.py             │
│                              │                                  │
│ ...                          │  ╔═ QUICK COMMANDS ═╗           │
│                              │  → stats                        │
│                              │  → clear                        │
│                              │  → filter critical              │
├──────────────────────────────┴──────────────────────────────────┤
│ root@blackswan:~$ █                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 命令列表

### 基础命令

| 命令 | 说明 | 示例输出 |
|------|------|---------|
| `help` | 显示帮助 | Available commands: help, clear, stats... |
| `clear` | 清空屏幕 | Terminal cleared |
| `stats` | 统计信息 | Total: 156 \| Critical: 12 \| Uptime: 00:15:32 |
| `status` | 系统状态 | WS: CONNECTED \| CPU: 12% \| MEM: 45% |
| `exit` | 退出提示 | Use browser back button to exit |

### 过滤命令

| 命令 | 说明 | 效果 |
|------|------|-----|
| `filter all` | 显示全部 | 显示所有级别警报 |
| `filter critical` | 严重警报 | 仅显示 CRITICAL (>5%) |
| `filter high` | 高级警报 | 仅显示 HIGH (2-5%) |
| `filter medium` | 中级警报 | 仅显示 MEDIUM (1-2%) |

### 使用示例

```bash
root@blackswan:~$ help
[SYSTEM] Available commands: help, clear, stats, filter [all|critical|high|medium], exit, status

root@blackswan:~$ stats
[SYSTEM] Total Alerts: 156 | Critical: 12 | Assets: 8 | Uptime: 00:15:32

root@blackswan:~$ filter critical
[SYSTEM] Filter: CRITICAL alerts only

root@blackswan:~$ clear
[SYSTEM] Terminal cleared
```

---

## 📊 警报级别

### 严重程度分类

<table>
  <tr>
    <th>级别</th>
    <th>符号</th>
    <th>颜色</th>
    <th>变化幅度</th>
    <th>说明</th>
  </tr>
  <tr>
    <td><strong>CRITICAL</strong></td>
    <td>🔴</td>
    <td>红色</td>
    <td>> 5%</td>
    <td>严重市场异常，需立即关注</td>
  </tr>
  <tr>
    <td><strong>HIGH</strong></td>
    <td>🟠</td>
    <td>橙色</td>
    <td>2-5%</td>
    <td>高级警报，重要市场变化</td>
  </tr>
  <tr>
    <td><strong>MEDIUM</strong></td>
    <td>🟡</td>
    <td>黄色</td>
    <td>1-2%</td>
    <td>中级警报，正常波动</td>
  </tr>
  <tr>
    <td><strong>LOW</strong></td>
    <td>🟢</td>
    <td>绿色</td>
    <td>< 1%</td>
    <td>低级警报，轻微变化</td>
  </tr>
</table>

---

## 🔧 功能特性

### 实时监控
- ✅ WebSocket自动连接
- ✅ 实时警报推送
- ✅ 断线自动重连（5秒）
- ✅ 连接状态显示

### 数据展示
- ✅ 时间戳格式化
- ✅ 资产代码识别
- ✅ 价格变化计算
- ✅ 严重程度自动分级
- ✅ 最多保留100条记录

### 交互功能
- ✅ 命令行输入
- ✅ 快捷按钮操作
- ✅ 智能过滤系统
- ✅ 自动聚焦输入框

### 系统监控
- ✅ 运行时间计数
- ✅ 警报数量统计
- ✅ 资产监控数量
- ✅ 检测模块状态
- ✅ CPU/内存显示

---

## 🎯 使用场景

### 1. 实时监控
```bash
npm run dev
# 访问: http://localhost:3000/black-swan-terminal
# 实时观察市场异常
```

### 2. 演示展示
```bash
scripts\start-demo.bat
# 自动生成数据并启动
# 适合团队演示
```

### 3. 数据分析
```bash
# 使用 stats 命令查看统计
# 使用过滤器分析趋势
# 识别市场模式
```

### 4. 开发调试
```bash
node scripts/generate-demo-alerts.js 100
# 生成测试数据
# 验证功能
```

---

## 📚 文档

### 快速参考
- **5分钟快速入门**: [TERMINAL_QUICKSTART.md](./TERMINAL_QUICKSTART.md)
- **完整使用文档**: [BLACK_SWAN_TERMINAL_README.md](./BLACK_SWAN_TERMINAL_README.md)
- **中文使用指南**: [../黑天鹅终端监控_使用指南.md](../黑天鹅终端监控_使用指南.md)
- **项目完成报告**: [../黑天鹅终端监控_完成报告.md](../黑天鹅终端监控_完成报告.md)

### 相关文档
- **黑天鹅集成指南**: [BLACK_SWAN_INTEGRATION_GUIDE.md](./BLACK_SWAN_INTEGRATION_GUIDE.md)
- **项目主README**: [README.md](./README.md)

---

## 🔌 技术架构

### 技术栈

**前端**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

**后端**
- Node.js
- Express
- WebSocket
- SQLite

### 数据流

```
Binance API → main.py → SQLite DB → server.js → WebSocket → Terminal UI
```

### 检测模块

- **price_jump.py** - 价格波动检测
- **whale_transfer.py** - 大额转账检测
- **funding_spike.py** - 资金费率检测

---

## 📁 文件结构

```
LUMI/
├── app/
│   ├── black-swan-terminal/     # 终端界面
│   │   └── page.tsx
│   ├── black-swan/              # 图形界面
│   │   └── page.tsx
│   └── globals.css              # 全局样式
├── scripts/
│   ├── generate-demo-alerts.js  # 数据生成器
│   ├── start-demo.bat           # Windows启动
│   └── start-demo.sh            # Linux/Mac启动
├── BLACK_SWAN_TERMINAL_README.md
├── TERMINAL_QUICKSTART.md
└── server.js                    # WebSocket服务
```

---

## 🛠️ 高级配置

### 修改主题颜色

```typescript
// 在 page.tsx 中修改
className="text-green-400"  // 主色调
className="text-cyan-400"   // 青色主题
className="text-amber-400"  // 琥珀色主题
```

### 调整警报限制

```typescript
// 修改保留数量
setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // 当前
setAlerts(prev => [newAlert, ...prev].slice(0, 200)); // 修改为200
```

### 自定义严重程度

```typescript
// 修改阈值
if (Math.abs(change) > 5) severity = 'CRITICAL';   // >5%
if (Math.abs(change) > 10) severity = 'CRITICAL';  // 改为>10%
```

---

## 🐛 故障排查

### 常见问题

| 问题 | 解决方案 |
|------|---------|
| 页面空白 | 运行 `npm run dev` |
| 无数据显示 | 运行 `node scripts/generate-demo-alerts.js 30` |
| WebSocket断开 | 等待5秒自动重连或刷新页面 |
| 命令无响应 | 检查拼写，输入 `help` 查看命令列表 |
| 端口被占用 | 修改端口或关闭占用进程 |

### 获取帮助

```bash
# 查看数据库警报
cd ../duolume-master
python check_btc_eth_alerts.py

# 生成测试警报
python test_alert_trigger.py

# 启动监控程序
python main.py
```

---

## 📈 性能指标

- **初始加载**: < 2秒
- **内存占用**: < 100MB
- **CPU使用**: < 5%
- **WebSocket延迟**: < 50ms
- **警报处理**: < 10ms

---

## 🎓 学习路径

### 初学者
1. 运行 `start-demo.bat`
2. 阅读 `TERMINAL_QUICKSTART.md`
3. 尝试基础命令

### 进阶用户
1. 阅读完整文档
2. 学习命令系统
3. 自定义配置

### 开发者
1. 研究源代码
2. 修改检测规则
3. 扩展功能

---

## 🚀 未来功能

- [ ] 导出功能（CSV/JSON）
- [ ] 声音/桌面通知
- [ ] 命令自动补全
- [ ] 命令历史（↑/↓）
- [ ] 多主题切换
- [ ] 图表可视化
- [ ] 警报搜索
- [ ] 自定义规则

---

## 🤝 贡献

欢迎提交问题和改进建议！

---

## 📄 许可证

MIT License

---

## 🎉 开始使用

```bash
cd LUMI
scripts\start-demo.bat  # Windows
./scripts/start-demo.sh # Linux/Mac
```

访问: http://localhost:3000/black-swan-terminal

---

<div align="center">

**🦢 享受专业的终端监控体验！**

```
root@blackswan:~$ █
```

Made with ❤️ for crypto traders

</div>



