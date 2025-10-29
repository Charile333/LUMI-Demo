/**
 * 市场状态实时Hook - 使用Supabase Realtime
 * 跟踪市场激活状态和感兴趣人数
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

export interface MarketState {
  marketId: number;
  status: 'pending' | 'activating' | 'active' | 'failed';
  interestedCount: number;
  activationThreshold: number;
  message?: string;
  updatedAt?: string;
}

export interface UseMarketStateRealtimeResult {
  marketState: MarketState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * 市场状态实时Hook
 * @param marketId 市场ID
 */
export function useMarketStateRealtime(marketId: number | string): UseMarketStateRealtimeResult {
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取或创建市场状态
  const fetchInitialState = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('market_states')
        .select('*')
        .eq('market_id', marketId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // 市场状态不存在，创建初始状态
          console.log(`📊 创建市场 ${marketId} 的初始状态`);
          
          const { data: newData, error: insertError } = await supabase
            .from('market_states')
            .insert({
              market_id: marketId,
              status: 'pending',
              interested_count: 0,
              activation_threshold: 10
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          if (newData) {
            setMarketState({
              marketId: newData.market_id,
              status: newData.status,
              interestedCount: newData.interested_count,
              activationThreshold: newData.activation_threshold,
              message: newData.message,
              updatedAt: newData.updated_at
            });
          }
        } else {
          throw fetchError;
        }
      } else if (data) {
        setMarketState({
          marketId: data.market_id,
          status: data.status,
          interestedCount: data.interested_count,
          activationThreshold: data.activation_threshold,
          message: data.message,
          updatedAt: data.updated_at
        });
        console.log(`✅ 市场状态加载成功:`, data);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('❌ 获取市场状态失败:', err);
      setError(err.message || '获取市场状态失败');
      setLoading(false);
    }
  }, [marketId]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchInitialState();
  }, [fetchInitialState]);

  useEffect(() => {
    // 首次加载
    fetchInitialState();

    // 订阅实时更新
    const channelName = `market_state:${marketId}`;
    console.log(`📡 订阅市场状态: ${channelName}`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_states',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          console.log('🚀 市场状态实时更新:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as any;
            setMarketState({
              marketId: data.market_id,
              status: data.status,
              interestedCount: data.interested_count,
              activationThreshold: data.activation_threshold,
              message: data.message,
              updatedAt: data.updated_at
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('⚠️ 市场状态已删除');
            setMarketState(null);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 市场状态订阅: ${status}`);
        
        if (status === 'CHANNEL_ERROR') {
          setError('订阅失败');
        }
      });

    return () => {
      console.log(`🔌 取消订阅市场状态: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [marketId, fetchInitialState]);

  return {
    marketState,
    loading,
    error,
    refresh
  };
}

/**
 * 批量市场状态Hook（用于市场列表）
 */
export function useMultipleMarketStates(marketIds: number[]) {
  const [marketStates, setMarketStates] = useState<Map<number, MarketState>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (marketIds.length === 0) {
      setLoading(false);
      return;
    }

    // 获取初始数据
    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('market_states')
          .select('*')
          .in('market_id', marketIds);

        if (error) throw error;

        const newMap = new Map<number, MarketState>();
        data?.forEach((item: any) => {
          newMap.set(item.market_id, {
            marketId: item.market_id,
            status: item.status,
            interestedCount: item.interested_count,
            activationThreshold: item.activation_threshold,
            message: item.message,
            updatedAt: item.updated_at
          });
        });

        setMarketStates(newMap);
        setLoading(false);
      } catch (err) {
        console.error('批量获取市场状态失败:', err);
        setLoading(false);
      }
    };

    fetchInitialData();

    // 订阅所有更新
    const channel = supabase
      .channel('multiple_market_states')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_states'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new as any;
            const marketId = data.market_id;
            
            if (marketIds.includes(marketId)) {
              setMarketStates(prev => {
                const newMap = new Map(prev);
                newMap.set(marketId, {
                  marketId: data.market_id,
                  status: data.status,
                  interestedCount: data.interested_count,
                  activationThreshold: data.activation_threshold,
                  message: data.message,
                  updatedAt: data.updated_at
                });
                return newMap;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketIds]);

  return { marketStates, loading };
}




















