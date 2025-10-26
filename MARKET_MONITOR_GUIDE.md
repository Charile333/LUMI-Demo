# 🔍 集成市场监控系统

## ✅ 已完成集成

黑天鹅预警系统现在**内置了实时市场监控**，无需运行外部脚本！

## 🎯 功能说明

### 自动监控
- **BTC/USDT** - 比特币对 USDT
- **ETH/USDT** - 以太坊对 USDT
- 使用 **Binance WebSocket API** 获取实时价格
- 24/7 自动运行

### 智能检测
- **1% 价格波动** - 自动生成警报
- **2% 波动** - 标记为 HIGH 级别
- **5% 波动** - 标记为 CRITICAL 级别

### 自动推送
- 检测到异常 → 写入数据库
- WebSocket 自动广播
- 前端实时显示

## 🚀 启动方式

### 方法一：开发环境
```bash
cd LUMI
npm run dev
```

### 方法二：生产环境
```bash
cd LUMI
npm run build
npm start
```

## 📊 工作原理

```
Binance WebSocket API
        ↓
接收实时 Ticker 数据
        ↓
检测价格波动 (>1%)
        ↓
生成警报 → 数据库
        ↓
WebSocket 广播
        ↓
前端实时显示
```

## 🌐 查看效果

1. 启动服务器：`npm run dev`
2. 打开页面：http://localhost:3000/black-swan
3. 右侧实时警报流会自动显示市场异常

## 📝 控制台输出

启动成功后会看到：
```
============================================================
🚀 服务器已启动
📍 地址: http://localhost:3000
🔌 Socket.IO: ws://localhost:3000
🦢 Alert WebSocket: ws://localhost:3000/ws/alerts
🔍 市场监控: BTC/USDT, ETH/USDT
🌍 环境: development
============================================================
🔍 启动市场监控...
✅ 已连接 BTCUSDT 市场数据流
✅ 已连接 ETHUSDT 市场数据流
🦢 初始化警报监视器。最新警报ID: xxx
```

## ⚙️ 配置调整

### 修改监控阈值
编辑 `LUMI/lib/market-monitor.js`:
```javascript
this.thresholds = {
  price_jump: 0.01,  // 1% 涨幅阈值
  price_drop: -0.01, // 1% 跌幅阈值
};
```

### 添加更多交易对
编辑 `LUMI/lib/market-monitor.js`:
```javascript
this.symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
```

### 调整检查频率
编辑 `LUMI/lib/market-monitor.js`:
```javascript
this.checkInterval = 30000; // 30秒检查一次
```

## 🔧 优势

- ✅ **无需额外脚本** - 完全集成到 Next.js
- ✅ **自动启动** - 随服务器一起运行
- ✅ **实时数据** - Binance WebSocket 直连
- ✅ **自动重连** - 断线后自动恢复
- ✅ **低延迟** - 毫秒级推送
- ✅ **易于维护** - 单一服务器进程

## 📈 数据来源

- **Binance WebSocket API**
- 官方文档：https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
- 免费使用，无需 API Key
- 实时 24小时 ticker 数据

## 🎉 完成

现在你的黑天鹅预警系统已经完全集成了实时市场监控！

**只需运行 `npm run dev`，一切都自动工作！** 🚀

