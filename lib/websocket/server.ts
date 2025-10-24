// 🔌 获取全局 Socket.IO 实例

import { Server as SocketIOServer } from 'socket.io';

declare global {
  var io: SocketIOServer | undefined;
}

/**
 * 获取 Socket.IO 实例
 */
export function getIO(): SocketIOServer | null {
  if (typeof global.io !== 'undefined') {
    return global.io;
  }
  return null;
}

/**
 * 广播到特定市场房间
 */
export function broadcastToMarket(marketId: number, event: string, data: any) {
  const io = getIO();
  if (!io) {
    console.warn('⚠️ Socket.IO 未初始化');
    return;
  }

  const room = `market:${marketId}`;
  io.to(room).emit(event, data);
  console.log(`📢 广播到市场 ${marketId}: ${event}`);
}

/**
 * 全局广播
 */
export function broadcast(event: string, data: any) {
  const io = getIO();
  if (!io) {
    console.warn('⚠️ Socket.IO 未初始化');
    return;
  }

  io.emit(event, data);
  console.log(`📢 全局广播: ${event}`);
}



