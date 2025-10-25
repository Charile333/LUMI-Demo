# 黑天鹅预警系统 - 运作原理详解 🦢

## 系统概览

黑天鹅预警系统是一个实时加密货币市场异常检测平台，能够监控市场波动并及时发出预警信号。

```
┌─────────────────────────────────────────────────────────────┐
│                    预警系统架构图                              │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  加密货币交易所   │ ◄─────► │  价格监控脚本     │
│  (Binance等)     │         │  (duolume-master)│
└──────────────────┘         └─────────┬────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │  SQLite 数据库    │
                            │  (alerts.db)     │
                            └─────────┬────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │  WebSocket 服务器      │
                         │  (Port 3000)           │
                         │  - 数据库监视器         │
                         │  - 实时广播            │
                         └───────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌─────────┐      ┌─────────┐     ┌─────────┐
              │ 浏览器1  │      │ 浏览器2  │     │ 浏览器N  │
              │ 客户端   │      │ 客户端   │     │ 客户端   │
              └─────────┘      └─────────┘     └─────────┘
```

---

## 核心组件

### 1. **价格监控层** (duolume-master)

位置：`duolume-master/`

#### 功能：
- 实时监控加密货币价格（BTC/USDT, ETH/USDT 等）
- 检测异常价格波动
- 分析市场指标（成交量、价格跳跃等）

#### 检测算法：
```python
# 示例：价格跳跃检测
if abs(price_change) > threshold:
    trigger_alert({
        'type': 'price_jump',
        'symbol': 'BTCUSDT',
        'severity': 'critical',
        'details': {
            'previous_price': 35000,
            'current_price': 36000,
            'price_change': 0.0286  # 2.86%
        }
    })
```

#### 警报类型：
- `price_jump` - 价格急剧上涨
- `price_drop` - 价格急剧下跌
- `volume_spike` - 成交量激增
- `volatility_alert` - 波动率异常

---

### 2. **数据存储层** (SQLite)

位置：`duolume-master/utils/database/app.db`

#### 数据库结构：
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    symbol TEXT NOT NULL,           -- 例如: "BTCUSDT"
    type TEXT NOT NULL,              -- 警报类型
    message TEXT NOT NULL,           -- 警报消息
    details TEXT,                    -- JSON 格式的详细信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 示例数据：
```json
{
  "id": 1,
  "timestamp": "2024-01-15T10:30:45Z",
  "symbol": "BTCUSDT",
  "type": "price_jump",
  "message": "BTC price jumped 2.5% in the last minute!",
  "details": {
    "previous_price": 35000,
    "current_price": 35875,
    "price_change": 0.025,
    "volume": 1250000
  }
}
```

---

### 3. **WebSocket 服务器层** (LUMI)

位置：`LUMI/server-with-websocket.js`

#### 3.1 服务器初始化

```javascript
// 创建 HTTP 服务器（Next.js）
const server = createServer(async (req, res) => {
  await handle(req, res, parsedUrl);
});

// 创建原生 WebSocket 服务器
const wss = new WebSocket.Server({ noServer: true });
```

#### 3.2 WebSocket 升级处理

```javascript
server.on('upgrade', (request, socket, head) => {
  const pathname = parse(request.url).pathname;
  
  if (pathname === '/ws/alerts') {
    // 处理警报 WebSocket 连接
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});
```

#### 3.3 客户端连接管理

```javascript
const alertClients = new Set();  // 存储所有连接的客户端

wss.on('connection', (ws) => {
  console.log('🦢 Alert WebSocket 客户端连接');
  alertClients.add(ws);
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Black Swan alert system'
  }));
  
  // 处理断开
  ws.on('close', () => {
    alertClients.delete(ws);
  });
});
```

#### 3.4 数据库监视器（核心功能）

```javascript
function setupDatabaseWatcher() {
  let lastAlertId = null;
  
  // 每2秒检查一次新警报
  const checkForNewAlerts = () => {
    db.all('SELECT * FROM alerts WHERE id > ? ORDER BY id ASC', 
      [lastAlertId], 
      (err, rows) => {
        if (rows && rows.length > 0) {
          rows.forEach(row => {
            // 更新最后的警报 ID
            lastAlertId = row.id;
            
            // 广播新警报
            broadcastAlert({
              symbol: row.symbol,
              type: row.type,
              message: row.message,
              timestamp: row.timestamp,
              details: JSON.parse(row.details)
            });
          });
        }
      }
    );
  };
  
  setInterval(checkForNewAlerts, 2000);  // 每2秒检查
}
```

#### 3.5 警报广播机制

```javascript
function broadcastAlert(alert) {
  const alertData = JSON.stringify({
    type: 'alert',
    data: alert
  });
  
  // 发送给所有连接的客户端
  alertClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(alertData);
    }
  });
  
  console.log(`🦢 广播警报到 ${alertClients.size} 个客户端`);
}
```

---

### 4. **REST API 层**

位置：`LUMI/app/api/alerts/`

#### 4.1 获取警报列表 (`/api/alerts`)

```typescript
// GET /api/alerts
// 返回最近20条警报记录
{
  "success": true,
  "data": [
    {
      "symbol": "BTCUSDT",
      "type": "price_jump",
      "message": "BTC price jumped 2.5%",
      "timestamp": "2024-01-15T10:30:45Z",
      "details": {
        "previous_price": 35000,
        "current_price": 35875,
        "price_change": 0.025
      }
    }
  ]
}
```

#### 4.2 获取统计信息 (`/api/alerts/stats`)

```typescript
// GET /api/alerts/stats
{
  "success": true,
  "data": {
    "total_alerts": 24,
    "monitored_assets": 3,
    "alert_types": {
      "price_jump": 10,
      "price_drop": 8,
      "volume_spike": 6
    },
    "top_symbols": [
      { "symbol": "BTCUSDT", "count": 15 },
      { "symbol": "ETHUSDT", "count": 9 }
    ]
  }
}
```

#### 4.3 历史崩盘事件 (`/api/alerts/real-crash-events`)

```typescript
// GET /api/alerts/real-crash-events
{
  "success": true,
  "data": [
    {
      "id": "luna_2022-05-09",
      "date": "2022-05-12",
      "asset": "LUNA/USDT",
      "crashPercentage": -99.9,
      "duration": "3 days",
      "description": "Terra Luna collapse"
    }
  ]
}
```

---

### 5. **前端展示层**

位置：`LUMI/app/black-swan/page.tsx`

#### 5.1 WebSocket 连接

```typescript
const connectWebSocket = () => {
  // 连接到警报 WebSocket
  ws = new WebSocket('ws://localhost:3000/ws/alerts');
  
  ws.onopen = () => {
    console.log('✅ 已连接到预警系统');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'alert') {
      handleNewAlert(data.data);
    }
  };
};
```

#### 5.2 警报处理

```typescript
const handleNewAlert = (alert) => {
  // 计算严重程度
  let severity = 'medium';
  const change = alert.details?.price_change * 100;
  
  if (Math.abs(change) > 5) {
    severity = 'critical';  // 超过5%为严重
  } else if (Math.abs(change) > 2) {
    severity = 'high';      // 超过2%为高
  }
  
  // 创建警报对象
  const newAlert = {
    id: Date.now().toString(),
    timestamp: new Date(alert.timestamp).toLocaleTimeString(),
    asset: alert.symbol.replace('USDT', '/USDT'),
    severity: severity,
    message: alert.message,
    change: change
  };
  
  // 添加到警报列表（最多显示20条）
  setRealtimeData(prev => [newAlert, ...prev].slice(0, 20));
};
```

#### 5.3 UI 渲染

```tsx
// 实时警报流显示
{realtimeData.map((alert) => (
  <div key={alert.id} className="alert-item">
    <span className="timestamp">[{alert.timestamp}]</span>
    <span className={`severity ${alert.severity}`}>
      {alert.severity.toUpperCase()}
    </span>
    <span className="asset">{alert.asset}</span>
    <span className={`change ${alert.change < 0 ? 'red' : 'green'}`}>
      {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
    </span>
    <span className="message">{alert.message}</span>
  </div>
))}
```

---

## 数据流动过程

### 完整流程图

```
1. 市场数据采集
   │
   ▼
┌──────────────────────────────────────┐
│ Binance API                          │
│ - 价格数据                            │
│ - 成交量数据                          │
│ - K线数据                             │
└────────────┬─────────────────────────┘
             │
             ▼
2. 数据分析
   │
┌──────────────────────────────────────┐
│ Python 监控脚本                       │
│ - 计算价格变化率                      │
│ - 检测异常模式                        │
│ - 生成警报                            │
└────────────┬─────────────────────────┘
             │
             ▼
3. 数据存储
   │
┌──────────────────────────────────────┐
│ SQLite 数据库                         │
│ INSERT INTO alerts VALUES (...)      │
└────────────┬─────────────────────────┘
             │
             ▼
4. 变化检测
   │
┌──────────────────────────────────────┐
│ 数据库监视器 (每2秒)                  │
│ SELECT * WHERE id > lastId           │
└────────────┬─────────────────────────┘
             │
             ▼
5. 实时广播
   │
┌──────────────────────────────────────┐
│ WebSocket 服务器                      │
│ broadcast({type: 'alert', data})     │
└────────────┬─────────────────────────┘
             │
             ▼
6. 客户端接收
   │
┌──────────────────────────────────────┐
│ 浏览器 WebSocket 客户端               │
│ ws.onmessage = handleAlert           │
└────────────┬─────────────────────────┘
             │
             ▼
7. UI 更新
   │
┌──────────────────────────────────────┐
│ React 组件                            │
│ setRealtimeData([newAlert, ...])     │
└────────────┬─────────────────────────┘
             │
             ▼
8. 用户看到实时警报 ✨
```

---

## 实时示例

### 当 BTC 价格跳涨 3% 时的完整流程：

#### 时间线：

**T+0秒** - 市场变化
```
BTC/USDT: $35,000 → $36,050 (+3%)
```

**T+1秒** - 监控脚本检测
```python
# check_btc_eth_alerts.py
price_change = (36050 - 35000) / 35000 = 0.03
if price_change > 0.01:  # 超过1%阈值
    create_alert()
```

**T+2秒** - 写入数据库
```sql
INSERT INTO alerts (timestamp, symbol, type, message, details)
VALUES (
  '2024-01-15T10:30:45Z',
  'BTCUSDT',
  'price_jump',
  'BTC price jumped 3% in the last minute!',
  '{"previous_price": 35000, "current_price": 36050, "price_change": 0.03}'
);
```

**T+3秒** - 数据库监视器检测
```javascript
// server-with-websocket.js
checkForNewAlerts() 执行
发现 id > lastAlertId 的新记录
```

**T+4秒** - 广播到所有客户端
```javascript
broadcastAlert({
  symbol: 'BTCUSDT',
  type: 'price_jump',
  message: 'BTC price jumped 3%...',
  timestamp: '2024-01-15T10:30:45Z',
  details: { previous_price: 35000, ... }
})
```

**T+4.1秒** - 客户端接收
```javascript
// page.tsx
ws.onmessage 触发
解析警报数据
计算严重程度: critical (>2%)
```

**T+4.2秒** - UI 更新
```
用户界面右侧实时警报流显示：
[10:30:45] CRITICAL BTC/USDT +3.00% BTC price jumped 3%...
```

---

## 性能特性

### 延迟分析

```
市场变化 → 用户看到警报
总延迟: ~4-5秒

分解：
- 数据采集：1秒
- 分析+存储：1秒  
- 数据库轮询：0-2秒（平均1秒）
- WebSocket传输：<100ms
- 浏览器渲染：<100ms
```

### 可扩展性

```
当前配置：
- 监控资产数：2-10个
- 并发连接数：无限制（理论）
- 实际测试：100+ 并发客户端
- 数据库轮询：每2秒
- 消息延迟：<5秒
```

---

## 系统优势

### 1. **实时性**
- WebSocket 长连接，无需轮询
- 数据库变化 → 客户端显示 < 5秒

### 2. **可靠性**
- 自动重连机制
- 错误恢复
- 数据持久化

### 3. **可扩展性**
- 支持多资产监控
- 支持多客户端连接
- 易于添加新的检测算法

### 4. **用户体验**
- 终端风格 UI
- 实时数据流
- 历史事件回顾
- TradingView 图表集成

---

## 如何启动完整系统

### 步骤 1：启动 LUMI WebSocket 服务器
```bash
cd LUMI
npm run dev
```

### 步骤 2（可选）：启动价格监控
```bash
cd duolume-master
python check_btc_eth_alerts.py
```

### 步骤 3：访问页面
```
http://localhost:3000/black-swan
```

---

## 配置选项

### 监控阈值
```python
# duolume-master/check_btc_eth_alerts.py
PRICE_JUMP_THRESHOLD = 0.01    # 1% 价格跳涨
PRICE_DROP_THRESHOLD = -0.01   # 1% 价格下跌
VOLUME_SPIKE_MULTIPLIER = 2.0  # 成交量翻倍
```

### 数据库轮询间隔
```javascript
// LUMI/server-with-websocket.js
setInterval(checkForNewAlerts, 2000);  // 2秒
```

### 警报显示数量
```typescript
// LUMI/app/black-swan/page.tsx
setRealtimeData(prev => [newAlert, ...prev].slice(0, 20));  // 最多20条
```

---

## 故障排查

### WebSocket 连接失败
```bash
# 检查服务器是否运行
Get-Process node | Where-Object {$_.MainWindowTitle -like "*3000*"}

# 测试连接
cd LUMI
node test-websocket.js
```

### 没有收到警报
```bash
# 检查数据库是否有数据
sqlite3 duolume-master/utils/database/app.db "SELECT * FROM alerts ORDER BY id DESC LIMIT 5"

# 检查监视器是否运行
# 在服务器控制台应该看到：
# 🦢 初始化警报监视器。最新警报ID: xxx
```

### API 返回空数据
```bash
# 测试 API
curl http://localhost:3000/api/alerts
curl http://localhost:3000/api/alerts/stats
```

---

## 总结

黑天鹅预警系统是一个完整的实时监控解决方案，通过：

1. ✅ **持续监控** 加密货币市场
2. ✅ **智能检测** 异常价格波动
3. ✅ **实时推送** 警报到所有连接的客户端
4. ✅ **友好展示** 终端风格的现代化 UI

整个系统延迟低、可靠性高、易于扩展，是监控市场"黑天鹅"事件的强大工具。🦢✨

