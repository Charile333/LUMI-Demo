/**
 * 实时订单簿Hook - 使用Supabase Realtime
 * 替代原有的WebSocket方案，完美兼容Vercel
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase-client';

// 获取单例 Supabase 客户端
const supabase = getSupabase();
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface OrderBookData {
  bids: Array<{ price: number; quantity: number; total: number }>;
  asks: Array<{ price: number; quantity: number; total: number }>;
  lastPrice?: number;
  volume24h?: number;
}

export interface UseOrderBookRealtimeResult {
  orderBook: OrderBookData | null;
  connected: boolean;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * 实时订单簿Hook
 * @param marketId 市场ID
 * @returns 订单簿数据和状态
 */
export function useOrderBookRealtime(marketId: number | string): UseOrderBookRealtimeResult {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // 获取初始数据
  const fetchInitialData = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orderbooks')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // 没有数据，创建空订单簿
          console.log(`📊 市场 ${marketId} 的订单簿尚未创建，将在首次订单时自动创建`);
          setOrderBook({
            bids: [],
            asks: [],
            lastPrice: undefined,
            volume24h: 0
          });
        } else {
          throw fetchError;
        }
      } else if (data) {
        setOrderBook({
          bids: data.bids || [],
          asks: data.asks || [],
          lastPrice: data.last_price ? parseFloat(data.last_price) : undefined,
          volume24h: data.volume_24h ? parseFloat(data.volume_24h) : 0
        });
        console.log(`✅ 订单簿数据加载成功:`, data);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('❌ 获取订单簿失败:', err);
      setError(err.message || '获取订单簿失败');
      setLoading(false);
    }
  }, [marketId]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    // 首次加载数据
    fetchInitialData();

    // 创建实时订阅
    const channelName = `orderbook:${marketId}`;
    console.log(`📡 订阅实时订单簿: ${channelName}`);

    const newChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有事件（INSERT, UPDATE, DELETE）
          schema: 'public',
          table: 'orderbooks',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          console.log('📊 订单簿实时更新:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as any;
            setOrderBook({
              bids: newData.bids || [],
              asks: newData.asks || [],
              lastPrice: newData.last_price ? parseFloat(newData.last_price) : undefined,
              volume24h: newData.volume_24h ? parseFloat(newData.volume_24h) : 0
            });
          } else if (payload.eventType === 'DELETE') {
            // 订单簿被删除，重置为空
            console.log('⚠️ 订单簿已删除');
            setOrderBook({
              bids: [],
              asks: [],
              lastPrice: undefined,
              volume24h: 0
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 订阅状态 [${channelName}]:`, status);
        
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          setError(null);
          console.log(`✅ 成功订阅实时订单簿`);
        } else if (status === 'CLOSED') {
          setConnected(false);
          console.log(`🔌 订阅已关闭`);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
          setError('订阅失败，请检查网络连接');
          console.error(`❌ 订阅失败`);
        }
      });

    setChannel(newChannel);

    // 清理函数
    return () => {
      console.log(`🔌 取消订阅: ${channelName}`);
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [marketId, fetchInitialData]);

  return {
    orderBook,
    connected,
    error,
    loading,
    refresh
  };
}

/**
 * 批量市场订单簿Hook（用于市场列表页面）
 * @param marketIds 市场ID数组
 */
export function useMultipleOrderBooks(marketIds: number[]) {
  const [orderBooks, setOrderBooks] = useState<Map<number, OrderBookData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (marketIds.length === 0) {
      setLoading(false);
      return;
    }

    // 获取初始数据
    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('orderbooks')
          .select('*')
          .in('market_id', marketIds);

        if (error) throw error;

        const newMap = new Map<number, OrderBookData>();
        data?.forEach((item: any) => {
          newMap.set(item.market_id, {
            bids: item.bids || [],
            asks: item.asks || [],
            lastPrice: item.last_price ? parseFloat(item.last_price) : undefined,
            volume24h: item.volume_24h ? parseFloat(item.volume_24h) : 0
          });
        });

        setOrderBooks(newMap);
        setLoading(false);
      } catch (err) {
        console.error('批量获取订单簿失败:', err);
        setLoading(false);
      }
    };

    fetchInitialData();

    // 订阅所有市场的更新
    const channel = supabase
      .channel('multiple_orderbooks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orderbooks'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as any;
            const marketId = data.market_id;
            
            if (marketIds.includes(marketId)) {
              setOrderBooks(prev => {
                const newMap = new Map(prev);
                newMap.set(marketId, {
                  bids: data.bids || [],
                  asks: data.asks || [],
                  lastPrice: data.last_price ? parseFloat(data.last_price) : undefined,
                  volume24h: data.volume_24h ? parseFloat(data.volume_24h) : 0
                });
                return newMap;
              });
            }
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketIds]);

  return { orderBooks, loading, connected };
}





















