/**
 * 🎯 市场参与人数 Hook
 * 统计在此市场实际交易过的用户数量
 */

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase-client';

export function useMarketParticipants(marketId: number, enabled: boolean = true) {
  const [participants, setParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    async function fetchParticipants() {
      try {
        const supabase = getSupabase();

        // 从 orders 表统计不同的用户地址数量
        const { data, error } = await supabase
          .from('orders')
          .select('user_address')
          .eq('market_id', marketId)
          .eq('status', 'completed'); // 只统计已完成的订单

        if (error) {
          console.error('获取参与人数失败:', error);
          setParticipants(0);
        } else if (data) {
          // 去重统计唯一用户地址
          const uniqueUsers = new Set(data.map(order => order.user_address));
          setParticipants(uniqueUsers.size);
        }
      } catch (err) {
        console.error('统计参与人数出错:', err);
        setParticipants(0);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();

    // 可选：订阅实时更新
    const supabase = getSupabase();
    const channel = supabase
      .channel(`market_${marketId}_participants`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `market_id=eq.${marketId}`
        },
        () => {
          // 有新订单时重新统计
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [marketId, enabled]);

  return { participants, loading };
}

