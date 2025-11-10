/**
 * 🎯 24小时价格变化 Hook
 * 从数据库获取真实的价格变化数据（方案A）
 */

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase-client';

export interface PriceChange24h {
  change: number;          // 价格变化百分比（如：+5.2 或 -3.1）
  loading: boolean;        // 加载状态
  error: string | null;    // 错误信息
}

/**
 * 获取市场的24小时价格变化
 * @param marketId 市场ID
 * @param enabled 是否启用（默认true）
 */
export function usePriceChange24h(
  marketId: number | string, 
  enabled: boolean = true
): PriceChange24h {
  const [priceChange, setPriceChange] = useState<PriceChange24h>({
    change: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!enabled || !marketId) {
      setPriceChange({ change: 0, loading: false, error: null });
      return;
    }

    let isMounted = true;

    const fetchPriceChange = async () => {
      try {
        const supabase = getSupabase();

        // 方法1: 使用数据库函数计算（推荐，性能更好）
        const { data, error } = await supabase
          .rpc('get_price_change_24h', { p_market_id: Number(marketId) });

        if (error) {
          console.error('获取价格变化失败:', error);
          
          // 如果数据库函数失败，尝试方法2（前端计算）
          await fetchPriceChangeManual();
          return;
        }

        if (isMounted && data !== null) {
          setPriceChange({
            change: Number(data) || 0,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('价格变化查询出错:', err);
        if (isMounted) {
          setPriceChange({
            change: 0,
            loading: false,
            error: '无法获取价格变化'
          });
        }
      }
    };

    // 方法2: 前端手动计算（备用方案）
    const fetchPriceChangeManual = async () => {
      try {
        const supabase = getSupabase();

        // 获取当前价格
        const { data: currentData } = await supabase
          .from('markets')
          .select('current_price')
          .eq('id', marketId)
          .single();

        if (!currentData?.current_price) {
          setPriceChange({ change: 0, loading: false, error: null });
          return;
        }

        const currentPrice = Number(currentData.current_price);

        // 获取24小时前的价格
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const { data: historicalData } = await supabase
          .from('market_price_history')
          .select('price')
          .eq('market_id', marketId)
          .lte('recorded_at', twentyFourHoursAgo.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1);

        if (!historicalData || historicalData.length === 0) {
          // 没有历史数据，返回0
          setPriceChange({ change: 0, loading: false, error: null });
          return;
        }

        const oldPrice = Number(historicalData[0].price);
        
        if (oldPrice === 0) {
          setPriceChange({ change: 0, loading: false, error: null });
          return;
        }

        // 计算百分比变化
        const change = ((currentPrice - oldPrice) / oldPrice) * 100;

        if (isMounted) {
          setPriceChange({
            change: Number(change.toFixed(2)),
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('手动计算价格变化出错:', err);
        if (isMounted) {
          setPriceChange({ change: 0, loading: false, error: null });
        }
      }
    };

    // 首次加载
    fetchPriceChange();

    // 🔥 订阅实时更新（当市场价格更新时重新计算）
    const supabase = getSupabase();
    const channel = supabase
      .channel(`price_change_${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${marketId}`
        },
        () => {
          // 价格更新时重新获取变化
          fetchPriceChange();
        }
      )
      .subscribe();

    // 定期刷新（每5分钟）
    const interval = setInterval(fetchPriceChange, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [marketId, enabled]);

  return priceChange;
}

/**
 * 批量获取多个市场的价格变化（性能优化版本）
 * @param marketIds 市场ID数组
 */
export function useBatchPriceChanges(marketIds: number[]): Map<number, number> {
  const [priceChanges, setPriceChanges] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (marketIds.length === 0) return;

    let isMounted = true;

    const fetchBatch = async () => {
      try {
        const supabase = getSupabase();

        // 批量查询所有市场的统计数据
        const { data, error } = await supabase
          .rpc('get_markets_stats_batch', { market_ids: marketIds });

        if (error) {
          console.error('批量获取价格变化失败:', error);
          return;
        }

        if (isMounted && data) {
          const changesMap = new Map<number, number>();
          data.forEach((item: any) => {
            changesMap.set(item.market_id, item.price_change_24h || 0);
          });
          setPriceChanges(changesMap);
        }
      } catch (err) {
        console.error('批量查询出错:', err);
      }
    };

    fetchBatch();

    // 定期刷新
    const interval = setInterval(fetchBatch, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [marketIds.join(',')]);

  return priceChanges;
}

