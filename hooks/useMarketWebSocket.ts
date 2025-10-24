// 🔌 市场 WebSocket Hook

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface MarketEvent {
  marketId: number;
  timestamp: number;
  [key: string]: any;
}

interface UseMarketWebSocketResult {
  socket: Socket | null;
  isConnected: boolean;
  events: {
    interested?: MarketEvent;
    activating?: MarketEvent;
    activated?: MarketEvent;
    failed?: MarketEvent;
  };
}

export function useMarketWebSocket(marketId: number): UseMarketWebSocketResult {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<UseMarketWebSocketResult['events']>({});

  useEffect(() => {
    // 连接 WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // 连接事件
    newSocket.on('connect', () => {
      console.log('✅ WebSocket 已连接');
      setIsConnected(true);

      // 订阅市场
      newSocket.emit('subscribe:market', marketId);
    });

    // 断开事件
    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket 已断开');
      setIsConnected(false);
    });

    // 感兴趣更新
    newSocket.on('market:interested:update', (data: MarketEvent) => {
      if (data.marketId === marketId) {
        console.log('📊 感兴趣更新:', data);
        setEvents(prev => ({ ...prev, interested: data }));
      }
    });

    // 激活中
    newSocket.on('market:activating', (data: MarketEvent) => {
      if (data.marketId === marketId) {
        console.log('🚀 市场激活中:', data);
        setEvents(prev => ({ ...prev, activating: data }));
      }
    });

    // 已激活
    newSocket.on('market:activated', (data: MarketEvent) => {
      if (data.marketId === marketId) {
        console.log('✅ 市场已激活:', data);
        setEvents(prev => ({ ...prev, activated: data }));
      }
    });

    // 激活失败
    newSocket.on('market:activation:failed', (data: MarketEvent) => {
      if (data.marketId === marketId) {
        console.log('❌ 激活失败:', data);
        setEvents(prev => ({ ...prev, failed: data }));
      }
    });

    // 清理
    return () => {
      newSocket.emit('unsubscribe:market', marketId);
      newSocket.close();
    };
  }, [marketId]);

  return { socket, isConnected, events };
}



