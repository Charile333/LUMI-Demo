// 🔔 市场事件 WebSocket 系统

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * 初始化 WebSocket 服务器
 */
export function initializeWebSocket(httpServer: HTTPServer) {
  if (io) {
    console.log('⚠️ WebSocket 已经初始化');
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ 客户端连接:', socket.id);

    // 订阅特定市场
    socket.on('subscribe:market', (marketId: number) => {
      const room = `market:${marketId}`;
      socket.join(room);
      console.log(`📊 ${socket.id} 订阅市场 ${marketId}`);
    });

    // 取消订阅市场
    socket.on('unsubscribe:market', (marketId: number) => {
      const room = `market:${marketId}`;
      socket.leave(room);
      console.log(`📊 ${socket.id} 取消订阅市场 ${marketId}`);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('❌ 客户端断开:', socket.id);
    });
  });

  console.log('✅ WebSocket 服务器已初始化');
  return io;
}

/**
 * 获取 WebSocket 实例
 */
export function getWebSocket(): SocketIOServer | null {
  return io;
}

/**
 * 广播市场激活事件
 */
export function broadcastMarketActivating(marketId: number, data: {
  title: string;
  interestedUsers: number;
  threshold: number;
}) {
  if (!io) return;

  const room = `market:${marketId}`;
  io.to(room).emit('market:activating', {
    marketId,
    ...data,
    timestamp: Date.now()
  });

  console.log(`📢 广播市场激活中: ${marketId}`);
}

/**
 * 广播市场已激活事件
 */
export function broadcastMarketActivated(marketId: number, data: {
  title: string;
  conditionId: string;
  txHash: string;
}) {
  if (!io) return;

  // 广播到特定市场房间
  const room = `market:${marketId}`;
  io.to(room).emit('market:activated', {
    marketId,
    ...data,
    timestamp: Date.now()
  });

  // 广播到全局
  io.emit('market:activated:global', {
    marketId,
    ...data,
    timestamp: Date.now()
  });

  console.log(`📢 广播市场已激活: ${marketId}`);
}

/**
 * 广播感兴趣用户更新
 */
export function broadcastInterestedUpdate(marketId: number, data: {
  interestedUsers: number;
  threshold: number;
  progress: number;
}) {
  if (!io) return;

  const room = `market:${marketId}`;
  io.to(room).emit('market:interested:update', {
    marketId,
    ...data,
    timestamp: Date.now()
  });

  console.log(`📢 广播感兴趣更新: 市场 ${marketId}, ${data.interestedUsers}/${data.threshold}`);
}

/**
 * 广播激活失败事件
 */
export function broadcastActivationFailed(marketId: number, error: string) {
  if (!io) return;

  const room = `market:${marketId}`;
  io.to(room).emit('market:activation:failed', {
    marketId,
    error,
    timestamp: Date.now()
  });

  console.log(`📢 广播激活失败: ${marketId}`);
}



