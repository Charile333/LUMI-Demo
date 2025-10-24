// WebSocket 服务器 - 实时价格推送
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 存储所有 WebSocket 连接
const marketConnections = new Map(); // marketId -> Set of ws clients

app.prepare().then(() => {
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

  // 创建 WebSocket 服务器
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/orderbook'
  });

  wss.on('connection', (ws, req) => {
    console.log('📡 WebSocket 客户端已连接');

    let subscribedMarketIds = new Set(); // 支持订阅多个市场

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe' && data.marketId) {
          // 订阅单个市场
          const marketId = data.marketId;
          subscribedMarketIds.add(marketId);
          
          if (!marketConnections.has(marketId)) {
            marketConnections.set(marketId, new Set());
          }
          marketConnections.get(marketId).add(ws);
          
          console.log(`📊 客户端订阅市场: ${marketId}, 当前订阅数: ${marketConnections.get(marketId).size}`);
          
          // 发送确认
          ws.send(JSON.stringify({
            type: 'subscribed',
            marketId: marketId
          }));
        } else if (data.type === 'subscribe_multiple' && Array.isArray(data.marketIds)) {
          // 🔥 批量订阅多个市场
          data.marketIds.forEach(marketId => {
            subscribedMarketIds.add(marketId);
            
            if (!marketConnections.has(marketId)) {
              marketConnections.set(marketId, new Set());
            }
            marketConnections.get(marketId).add(ws);
          });
          
          console.log(`📊 客户端批量订阅 ${data.marketIds.length} 个市场:`, data.marketIds);
          
          // 发送确认
          ws.send(JSON.stringify({
            type: 'subscribed_multiple',
            marketIds: data.marketIds,
            count: data.marketIds.length
          }));
        } else if (data.type === 'unsubscribe') {
          // 取消所有订阅
          subscribedMarketIds.forEach(marketId => {
            if (marketConnections.has(marketId)) {
              marketConnections.get(marketId).delete(ws);
              console.log(`📊 客户端取消订阅市场: ${marketId}`);
            }
          });
          subscribedMarketIds.clear();
        }
      } catch (error) {
        console.error('❌ 处理消息失败:', error);
      }
    });

    ws.on('close', () => {
      // 清理所有订阅的连接
      subscribedMarketIds.forEach(marketId => {
        if (marketConnections.has(marketId)) {
          marketConnections.get(marketId).delete(ws);
          console.log(`📊 客户端断开，市场 ${marketId}, 剩余订阅数: ${marketConnections.get(marketId).size}`);
          
          // 如果没有订阅者了，删除市场
          if (marketConnections.get(marketId).size === 0) {
            marketConnections.delete(marketId);
          }
        }
      });
      console.log('📡 WebSocket 客户端已断开');
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket 错误:', error);
    });

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'connected',
      message: '已连接到实时价格服务'
    }));
  });

  // 全局广播函数 - 暴露给其他模块使用
  global.broadcastOrderBookUpdate = (marketId, orderBookData) => {
    if (!marketConnections.has(marketId)) {
      return; // 没有订阅者
    }

    const clients = marketConnections.get(marketId);
    const message = JSON.stringify({
      type: 'orderbook_update',
      marketId,
      data: orderBookData,
      timestamp: Date.now()
    });

    let successCount = 0;
    let failCount = 0;

    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          successCount++;
        } catch (error) {
          console.error('❌ 发送失败:', error);
          failCount++;
        }
      }
    });

    if (successCount > 0) {
      console.log(`📤 订单簿更新已推送到 ${successCount} 个客户端 (市场 ${marketId})`);
    }
  };

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket 服务运行在 ws://${hostname}:${port}/ws/orderbook`);
  });
});

