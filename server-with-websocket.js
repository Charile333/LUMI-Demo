// 🚀 Next.js 自定义服务器（支持 WebSocket）

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const WebSocket = require('ws');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// 创建 Next.js 应用
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // 创建 HTTP 服务器
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 初始化 Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST']
    }
  });

  // WebSocket 连接处理 (Socket.IO for markets)
  io.on('connection', (socket) => {
    console.log('✅ Socket.IO 客户端连接:', socket.id);

    // 订阅特定市场
    socket.on('subscribe:market', (marketId) => {
      const room = `market:${marketId}`;
      socket.join(room);
      console.log(`📊 ${socket.id} 订阅市场 ${marketId}`);
    });

    // 取消订阅市场
    socket.on('unsubscribe:market', (marketId) => {
      const room = `market:${marketId}`;
      socket.leave(room);
      console.log(`📊 ${socket.id} 取消订阅市场 ${marketId}`);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('❌ Socket.IO 客户端断开:', socket.id);
    });
  });

  // 将 io 实例存储到全局，供 API 路由使用
  global.io = io;

  // 创建原生 WebSocket 服务器用于 /ws/alerts
  const wss = new WebSocket.Server({ noServer: true });
  const alertClients = new Set();

  // 处理 WebSocket 升级请求
  server.on('upgrade', (request, socket, head) => {
    const pathname = parse(request.url).pathname;

    // 只处理我们的警报 WebSocket，其他请求（如 Next.js HMR）让它们通过
    if (pathname === '/ws/alerts') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // 注意：不要 destroy 其他 WebSocket，让 Next.js 处理 HMR
  });

  // WebSocket 连接处理 (Native WebSocket for alerts)
  wss.on('connection', (ws) => {
    console.log('🦢 Alert WebSocket 客户端连接');
    alertClients.add(ws);

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Black Swan alert system'
    }));

    // 处理客户端消息
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('收到客户端消息:', data);
      } catch (e) {
        console.error('解析消息出错:', e);
      }
    });

    // 处理断开连接
    ws.on('close', () => {
      console.log('🦢 Alert WebSocket 客户端断开');
      alertClients.delete(ws);
    });

    // 处理错误
    ws.on('error', (error) => {
      console.error('WebSocket 错误:', error);
      alertClients.delete(ws);
    });
  });

  // 广播警报到所有连接的客户端
  function broadcastAlert(alert) {
    const alertData = JSON.stringify({
      type: 'alert',
      data: alert
    });

    alertClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(alertData);
      }
    });

    console.log(`🦢 广播警报到 ${alertClients.size} 个客户端`);
  }

  // 设置数据库监视器（如果数据库存在）
  function setupDatabaseWatcher() {
    const dbFile = path.join(__dirname, 'database', 'alerts.db');
    let lastAlertId = null;

    // 检查数据库是否存在
    const fs = require('fs');
    if (!fs.existsSync(dbFile)) {
      console.log('⚠️  警报数据库未找到，跳过数据库监视器');
      return;
    }

    // 获取最新的警报ID
    const getLastAlertId = () => {
      const db = new sqlite3.Database(dbFile);
      db.get('SELECT id FROM alerts ORDER BY id DESC LIMIT 1', (err, row) => {
        if (!err && row) {
          lastAlertId = row.id;
          console.log(`🦢 初始化警报监视器。最新警报ID: ${lastAlertId}`);
        }
        db.close();
      });
    };

    // 定期检查新警报
    const checkForNewAlerts = () => {
      const db = new sqlite3.Database(dbFile);

      if (lastAlertId !== null) {
        // 只选择实时警报，排除历史崩盘事件
        db.all('SELECT * FROM alerts WHERE id > ? AND type != \'historical_crash\' ORDER BY id ASC', [lastAlertId], (err, rows) => {
          if (!err && rows && rows.length > 0) {
            rows.forEach(row => {
              if (row.id > lastAlertId) {
                lastAlertId = row.id;
              }

              let details = null;
              if (row.details) {
                try {
                  details = JSON.parse(row.details);
                } catch (parseErr) {
                  console.error('解析详情字段出错:', parseErr.message);
                }
              }

              const alert = {
                symbol: row.symbol,
                type: row.type,
                message: row.message,
                timestamp: row.timestamp,
                details: details
              };

              broadcastAlert(alert);
            });
          }
          db.close();
        });
      } else {
        getLastAlertId();
        db.close();
      }
    };

    getLastAlertId();
    setInterval(checkForNewAlerts, 2000);
  }

  // 启动数据库监视器
  setupDatabaseWatcher();

  // 启动实时市场监控
  const MarketMonitor = require('./lib/market-monitor');
  const dbFile = path.join(__dirname, 'database', 'alerts.db');
  const marketMonitor = new MarketMonitor(dbFile);
  
  // 检查数据库是否存在后再启动监控
  const fs = require('fs');
  if (fs.existsSync(dbFile)) {
    marketMonitor.start();
  } else {
    console.log('⚠️  数据库未找到，跳过市场监控');
  }

  // 启动服务器
  server.listen(port, (err) => {
    if (err) throw err;
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 服务器已启动`);
    console.log(`📍 地址: http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO: ws://${hostname}:${port}`);
    console.log(`🦢 Alert WebSocket: ws://${hostname}:${port}/ws/alerts`);
    console.log(`🔍 市场监控: BTC/USDT, ETH/USDT`);
    console.log(`🌍 环境: ${dev ? 'development' : 'production'}`);
    console.log('='.repeat(60) + '\n');
  });
});



