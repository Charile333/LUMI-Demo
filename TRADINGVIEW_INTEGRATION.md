# TradingView 免费Widget集成指南

## ✅ 已完成集成

TradingView的**免费Widget**已成功集成到黑天鹅监控页面！

## 🎯 功能特性

### 1. **实时K线图表**
- ✅ 显示BTC、ETH、SOL等加密货币的实时价格
- ✅ 多种时间周期（15分钟、1小时、4小时、日线）
- ✅ 自动适配时间范围（1h/3h/6h/12h/24h）
- ✅ 暗色主题，与终端风格完美融合

### 2. **技术分析工具**
- ✅ 内置成交量指标（Volume）
- ✅ 简单移动平均线（MA）
- ✅ 用户可自行添加其他指标（MACD、RSI等）
- ✅ 支持绘制趋势线、支撑阻力位

### 3. **交互功能**
- ✅ 放大/缩小图表
- ✅ 拖动查看历史数据
- ✅ 切换到其他交易对
- ✅ 保存图表快照

## 📖 使用方法

### 第一步：选择历史闪崩事件
1. 访问 http://localhost:3000/black-swan
2. 在左侧面板选择一个历史闪崩事件（如"2025-10-10 BTC"）

### 第二步：查看TradingView图表
- 中间区域会自动加载该资产的实时K线图
- 图表会根据选择的时间范围自动调整周期

### 第三步：调整时间范围
- 点击左侧的时间范围按钮（1h/3h/6h/12h/24h）
- 图表会自动更新显示对应的K线周期

### 第四步：使用图表工具
- **缩放**：鼠标滚轮或双指缩放
- **拖动**：点击拖动图表查看历史
- **指标**：点击顶部"指标"按钮添加技术指标
- **绘图**：点击左侧工具栏绘制趋势线
- **切换币种**：点击顶部交易对名称可切换其他币

## 🔧 技术实现

### Widget配置
```typescript
{
  symbol: 'BINANCE:BTCUSDT',     // 币安交易对
  interval: '60',                 // 时间周期（分钟）
  timezone: 'Asia/Shanghai',      // 时区
  theme: 'dark',                  // 暗色主题
  locale: 'zh_CN',               // 中文界面
  backgroundColor: '#000000',     // 黑色背景
  studies: [                      // 预加载指标
    'Volume@tv-basicstudies',
    'MASimple@tv-basicstudies'
  ]
}
```

### 支持的交易对
- **BTC/USDT** → `BINANCE:BTCUSDT`
- **ETH/USDT** → `BINANCE:ETHUSDT`
- **SOL/USDT** → `BINANCE:SOLUSDT`
- 支持所有币安上架的交易对

### 时间周期映射
| 时间范围 | 图表周期 |
|---------|---------|
| 1小时   | 15分钟  |
| 3小时   | 1小时   |
| 6小时   | 4小时   |
| 12小时  | 日线    |
| 24小时  | 日线    |

## 🎨 界面展示

```
╔═══════════════════════════════════════╗
║  CRASH DATA ANALYSIS                  ║
╠═══════════════════════════════════════╣
║                                       ║
║  > PRICE CHART:   Powered by TradingView ║
║  ┌─────────────────────────────────┐ ║
║  │                                 │ ║
║  │   [TradingView 实时K线图]      │ ║
║  │                                 │ ║
║  │   - 可缩放、拖动               │ ║
║  │   - 技术指标                   │ ║
║  │   - 绘图工具                   │ ║
║  │                                 │ ║
║  └─────────────────────────────────┘ ║
║  > Asset: BTC/USDT | Date: 2025-10-10 ║
║                                       ║
╚═══════════════════════════════════════╝
```

## 🆓 免费版限制

### ✅ 可以做的：
- 查看实时数据
- 使用所有内置指标
- 绘制技术分析图形
- 切换任意交易对
- 保存图表快照

### ❌ 不能做的：
- 获取原始价格数据（需要API）
- 设置自动警报（需要账户）
- 去除TradingView水印（需要付费）
- 自定义Pine Script指标（需要账户）

## 🚀 下一步增强

### 可选：集成Webhook（需要TradingView Pro账户）

如果你有TradingView Pro账户，可以设置价格警报：

1. **在TradingView平台设置警报**：
   - 登录 TradingView.com
   - 设置价格/指标警报
   - 选择"Webhook URL"

2. **配置Webhook接收**：
   ```javascript
   // 在 server.js 添加
   app.post('/api/tradingview-webhook', (req, res) => {
     const alert = req.body;
     // 处理TradingView警报
     // 发送到你的WebSocket客户端
   });
   ```

3. **自动触发警报**：
   - TradingView检测到价格条件
   - 发送POST请求到你的服务器
   - 服务器推送到黑天鹅终端

## 📝 示例：查看10月10日BTC闪崩

1. 启动服务器：`cd LUMI && npm run dev`
2. 访问：http://localhost:3000/black-swan
3. 左侧面板点击"2025-10-10 BTCUSDT"
4. 中间区域会加载BTC/USDT图表
5. 可以看到10月10日的暴跌K线
6. 拖动图表查看闪崩前后的价格走势

## 🎓 学习资源

- TradingView Widget文档：https://cn.tradingview.com/widget/
- TradingView API文档：https://cn.tradingview.com/broker-api-docs/
- Pine Script教程：https://cn.tradingview.com/pine-script-docs/

## ❓ 常见问题

### Q: 图表加载很慢？
A: 首次加载需要下载TradingView脚本，之后会被浏览器缓存。

### Q: 可以显示历史某一天的图表吗？
A: 可以，在图表上拖动到对应日期即可。Widget会显示所有历史数据。

### Q: 能否添加更多指标？
A: 可以，点击图表顶部的"指标"按钮，TradingView提供100+种内置指标。

### Q: 数据延迟多少？
A: 免费Widget的数据是实时的，延迟<1秒（取决于你的网络）。

### Q: 可以去掉TradingView logo吗？
A: 免费版不可以，需要购买TradingView付费计划。

---

**✅ 集成完成！** 现在你的黑天鹅监控系统拥有专业级的实时图表功能！








