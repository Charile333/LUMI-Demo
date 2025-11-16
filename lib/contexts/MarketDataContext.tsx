// 🎯 全局市场数据管理 Context
// 优化方案：统一管理所有市场数据，减少重复请求和订阅

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ==================== 类型定义 ====================

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface MarketStats {
  probability: number;      // 概率 (0-100)
  yes: number;              // YES 价格（中间价 0-1）
  no: number;               // NO 价格（中间价 0-1）
  bestBid: number;          // 最佳买价 (0-1)
  bestAsk: number;          // 最佳卖价 (0-1)
  volume24h: number;        // 24小时交易量
  participants: number;     // 参与人数
  priceChange24h: number;   // 24小时价格变化百分比
  lastUpdated: string;      // 最后更新时间
  orderBook?: OrderBookData; // 完整订单簿数据（可选）
}

interface MarketDataContextValue {
  getStats: (marketId: number) => MarketStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  connected: boolean;
}

// ==================== Context 创建 ====================

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

// ==================== Provider 组件 ====================

export function MarketDataProvider({ 
  children,
  marketIds 
}: { 
  children: React.ReactNode;
  marketIds: number[];
}) {
  const [dataMap, setDataMap] = useState<Map<number, MarketStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // 🚀 批量获取初始数据
  const fetchBatchData = useCallback(async () => {
    if (marketIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      console.log(`📊 批量获取 ${marketIds.length} 个市场数据...`);
      setLoading(true);
      
      const response = await fetch('/api/markets/batch-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketIds })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // 转换为 Map
        const newMap = new Map<number, MarketStats>();
        Object.entries(result.data).forEach(([id, stats]) => {
          newMap.set(Number(id), stats as MarketStats);
        });
        
        setDataMap(newMap);
        setError(null);
        
        console.log(`✅ 成功加载 ${newMap.size} 个市场数据`);
      } else {
        throw new Error(result.error || 'Failed to fetch market stats');
      }
    } catch (err: any) {
      console.error('❌ 批量获取数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [marketIds.join(',')]);

  // 初始加载
  useEffect(() => {
    fetchBatchData();
  }, [fetchBatchData]);

  // 🔥 单一 Realtime 订阅（核心优化）
  useEffect(() => {
    if (marketIds.length === 0) return;

    const supabase = getSupabase();
    const newChannels: RealtimeChannel[] = [];

    console.log(`📡 创建实时订阅（${marketIds.length}个市场）...`);

    // 订阅1: markets 表更新（交易量、参与人数等）
    const marketsChannel = supabase
      .channel('global_markets_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=in.(${marketIds.join(',')})`
        },
        (payload) => {
          const updated = payload.new as any;
          console.log(`📊 市场 ${updated.id} 数据更新`);
          
          setDataMap(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(updated.id);
            
            if (existing) {
              newMap.set(updated.id, {
                ...existing,
                volume24h: updated.volume ?? existing.volume24h,
                participants: updated.participants ?? existing.participants,
                priceChange24h: updated.price_change_24h ?? existing.priceChange24h,
                lastUpdated: updated.updated_at || new Date().toISOString()
              });
            }
            
            return newMap;
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Markets订阅状态:`, status);
        setConnected(status === 'SUBSCRIBED');
      });

    newChannels.push(marketsChannel);

    // 订阅2: orderbooks 表更新（价格变化 + 完整订单簿）
    // 注意：Supabase Realtime 不支持 IN 操作符，所以我们监听所有市场，然后在回调中过滤
    const orderbooksChannel = supabase
      .channel('global_orderbooks_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orderbooks'
          // 移除 filter，因为 Supabase Realtime 的 filter 语法有限制
        },
        (payload) => {
          if (payload.eventType === 'DELETE') return;
          
          const updated = payload.new as any;
          const marketId = updated.market_id;
          
          // 只处理我们关心的市场
          if (!marketIds.includes(marketId)) {
            return;
          }
          
          console.log(`📈 市场 ${marketId} 订单簿更新（MarketDataContext）`);

          // 提取最佳价格（与 useMarketPrice 保持一致）
          let bestBid = 0;
          let bestAsk = 0;

          // 从订单簿中提取数据
          if (updated.bids && updated.bids.length > 0) {
            bestBid = parseFloat(String(updated.bids[0].price)) || 0;
          }

          if (updated.asks && updated.asks.length > 0) {
            bestAsk = parseFloat(String(updated.asks[0].price)) || 0;
          }

          // 处理特殊情况（与 useMarketPrice 保持一致）
          if (bestBid === 0 && bestAsk > 0) {
            // 只有卖单
            bestBid = Math.max(0.01, bestAsk - 0.05);
          } else if (bestAsk === 0 && bestBid > 0) {
            // 只有买单
            bestAsk = Math.min(0.99, bestBid + 0.05);
          } else if (bestBid === 0 && bestAsk === 0) {
            // 订单簿为空，使用默认值
            bestBid = 0.49;
            bestAsk = 0.51;
          }

          // 🔥 提取完整订单簿数据
          const orderBook: OrderBookData = {
            bids: updated.bids || [],
            asks: updated.asks || []
          };

          setDataMap(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(marketId);
            
            // 计算中间价（与 useMarketPrice 保持一致）
            const midPrice = (bestBid + bestAsk) / 2;
            // 计算概率（与 useMarketPrice 保持一致，不使用 toFixed 保持精度）
            const calculatedProbability = midPrice * 100;
            
            console.log(`🔥 MarketDataContext 更新市场 ${marketId}:`, {
              bestBid,
              bestAsk,
              midPrice,
              probability: calculatedProbability.toFixed(1) + '%',
              yes: midPrice.toFixed(4),
              no: (1 - midPrice).toFixed(4)
            });
            
            if (existing) {
              newMap.set(marketId, {
                ...existing,
                probability: calculatedProbability, // 与 useMarketPrice 保持一致，不使用 toFixed(2)
                yes: parseFloat(midPrice.toFixed(4)),
                no: parseFloat((1 - midPrice).toFixed(4)),
                bestBid: parseFloat(bestBid.toFixed(4)),
                bestAsk: parseFloat(bestAsk.toFixed(4)),
                volume24h: updated.volume_24h ?? existing.volume24h,
                orderBook: orderBook, // 🔥 保存完整订单簿
                lastUpdated: new Date().toISOString()
              });
            } else {
              // 新市场数据
              newMap.set(marketId, {
                probability: calculatedProbability, // 与 useMarketPrice 保持一致，不使用 toFixed(2)
                yes: parseFloat(midPrice.toFixed(4)),
                no: parseFloat((1 - midPrice).toFixed(4)),
                bestBid: parseFloat(bestBid.toFixed(4)),
                bestAsk: parseFloat(bestAsk.toFixed(4)),
                volume24h: updated.volume_24h || 0,
                participants: 0,
                priceChange24h: 0,
                orderBook: orderBook, // 🔥 保存完整订单簿
                lastUpdated: new Date().toISOString()
              });
            }
            
            return newMap;
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Orderbooks订阅状态:`, status);
        if (status === 'SUBSCRIBED') {
          console.log(`✅ MarketDataContext 已成功订阅 orderbooks 表`);
          console.log(`📊 监控市场ID:`, marketIds);
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ MarketDataContext 订阅失败`);
          setConnected(false);
        }
      });

    newChannels.push(orderbooksChannel);
    setChannels(newChannels);

    // 清理函数
    return () => {
      console.log('🔌 取消所有实时订阅');
      newChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [marketIds.join(',')]);

  // 手动刷新
  const refresh = useCallback(async () => {
    console.log('🔄 手动刷新市场数据...');
    await fetchBatchData();
  }, [fetchBatchData]);

  // 获取单个市场数据
  const getStats = useCallback((marketId: number): MarketStats | null => {
    return dataMap.get(marketId) || null;
  }, [dataMap]);

  const value: MarketDataContextValue = {
    getStats,
    loading,
    error,
    refresh,
    connected
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

// ==================== Custom Hook ====================

export function useMarketData(marketId: number) {
  const context = useContext(MarketDataContext);
  
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  
  const stats = context.getStats(marketId);
  
  return {
    stats,
    loading: context.loading,
    error: context.error,
    refresh: context.refresh,
    connected: context.connected
  };
}

// ==================== 批量Hook（可选）====================

export function useMarketDataContext() {
  const context = useContext(MarketDataContext);
  
  if (!context) {
    throw new Error('useMarketDataContext must be used within MarketDataProvider');
  }
  
  return context;
}

