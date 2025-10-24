// 🚀 Next.js 自定义服务器（支持 WebSocket）

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

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

  // WebSocket 连接处理
  io.on('connection', (socket) => {
    console.log('✅ WebSocket 客户端连接:', socket.id);

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
      console.log('❌ WebSocket 客户端断开:', socket.id);
    });
  });

  // 将 io 实例存储到全局，供 API 路由使用
  global.io = io;

  // 启动服务器
  server.listen(port, (err) => {
    if (err) throw err;
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 服务器已启动`);
    console.log(`📍 地址: http://${hostname}:${port}`);
    console.log(`🔌 WebSocket: ws://${hostname}:${port}`);
    console.log(`🌍 环境: ${dev ? 'development' : 'production'}`);
    console.log('='.repeat(60) + '\n');
  });
});



