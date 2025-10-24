// WebSocket Hook - 实时价格更新
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface OrderBookUpdate {
  bestBid: number;
  bestAsk: number;
  spread: number;
  bids?: any[];
  asks?: any[];
}

interface WebSocketMessage {
  type: string;
  marketId?: number;
  marketIds?: number[];
  data?: OrderBookUpdate;
  timestamp?: number;
  message?: string;
  count?: number;
}

export function useOrderBookWebSocket(marketId: number | string) {
  const [orderBook, setOrderBook] = useState<OrderBookUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // WebSocket URL
      const wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws/orderbook`;
      console.log('📡 连接 WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket 已连接');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // 订阅特定市场
        ws.send(JSON.stringify({
          type: 'subscribe',
          marketId: Number(marketId)
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('📡', message.message);
              break;
              
            case 'subscribed':
              console.log('📊 已订阅市场:', message.marketId);
              break;
              
            case 'orderbook_update':
              console.log('📈 订单簿实时更新:', message.data);
              if (message.data) {
                setOrderBook(message.data);
              }
              break;
              
            default:
              console.log('📨 收到消息:', message);
          }
        } catch (err) {
          console.error('❌ 解析消息失败:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket 错误:', event);
        setError('WebSocket 连接错误');
      };

      ws.onclose = () => {
        console.log('📡 WebSocket 已断开');
        setConnected(false);
        wsRef.current = null;

        // 自动重连（最多尝试 5 次）
        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 ${delay/1000}秒后尝试重连... (尝试 ${reconnectAttemptsRef.current}/5)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('WebSocket 连接失败，请刷新页面');
        }
      };
    } catch (err) {
      console.error('❌ 创建 WebSocket 失败:', err);
      setError('无法创建 WebSocket 连接');
    }
  }, [marketId]);

  useEffect(() => {
    connect();

    // 清理函数
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        // 取消订阅
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    orderBook,
    connected,
    error
  };
}

// 🔥 批量市场价格 Hook（用于分类页面）
export function useMarketListWebSocket(marketIds: number[]) {
  const [pricesMap, setPricesMap] = useState<Map<number, OrderBookUpdate>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || marketIds.length === 0) return;

    try {
      const wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws/orderbook`;
      console.log('📡 [批量] 连接 WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [批量] WebSocket 已连接');
        setConnected(true);
        setError(null);

        // 🔥 批量订阅多个市场
        ws.send(JSON.stringify({
          type: 'subscribe_multiple',
          marketIds: marketIds
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('📡 [批量]', message.message);
              break;
              
            case 'subscribed_multiple':
              console.log('📊 [批量] 已订阅市场数:', message.count);
              break;
              
            case 'orderbook_update':
              // 单个市场更新
              if (message.marketId && message.data) {
                setPricesMap(prev => {
                  const newMap = new Map(prev);
                  newMap.set(message.marketId!, message.data!);
                  return newMap;
                });
                console.log('📈 [批量] 市场', message.marketId, '价格更新');
              }
              break;
              
            default:
              console.log('📨 [批量] 收到消息:', message);
          }
        } catch (err) {
          console.error('❌ [批量] 解析消息失败:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ [批量] WebSocket 错误:', event);
        setError('WebSocket 连接错误');
      };

      ws.onclose = () => {
        console.log('📡 [批量] WebSocket 已断开');
        setConnected(false);
        wsRef.current = null;

        // 自动重连
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 [批量] 尝试重连...');
          connect();
        }, 3000);
      };
    } catch (err) {
      console.error('❌ [批量] 创建 WebSocket 失败:', err);
      setError('无法创建 WebSocket 连接');
    }
  }, [marketIds]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    pricesMap,
    connected,
    error
  };
}

