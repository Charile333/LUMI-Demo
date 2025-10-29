/**
 * 🎯 市场价格 Hook
 * 获取市场的实时价格和概率
 * 
 * 核心公式：显示价格 = (最高买价 + 最低卖价) ÷ 2
 */

import { useState, useEffect, useCallback } from 'react';

export interface MarketPrice {
  yes: number;        // YES 价格（0-1）
  no: number;         // NO 价格（0-1）
  probability: number; // 概率百分比（0-100）
  bestBid: number;    // 最高买价
  bestAsk: number;    // 最低卖价
  spread: number;     // 价差
  loading: boolean;   // 加载状态
  error: string | null; // 错误信息
  refresh: () => Promise<void>; // 手动刷新函数
}

export function useMarketPrice(marketId: number | string, enabled: boolean = true): MarketPrice {
  const [price, setPrice] = useState<MarketPrice>({
    yes: 0.5,
    no: 0.5,
    probability: 50,
    bestBid: 0.49,
    bestAsk: 0.51,
    spread: 0.02,
    loading: true,
    error: null,
    refresh: async () => {}
  });

  // 使用 useCallback 定义 fetchPrice，避免无限循环
  const fetchPrice = useCallback(async (): Promise<void> => {
    if (!enabled || !marketId) {
      return;
    }

    try {
      setPrice(prev => ({ ...prev, loading: true, error: null }));

      // 添加时间戳避免缓存
      const response = await fetch(`/api/orders/book?marketId=${marketId}&outcome=1&t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.orderBook) {
        let bestBid = data.orderBook.bids?.[0]?.price
          ? parseFloat(data.orderBook.bids[0].price)
          : 0;

        let bestAsk = data.orderBook.asks?.[0]?.price
          ? parseFloat(data.orderBook.asks[0].price)
          : 0;

        // 处理特殊情况
        if (bestBid === 0 && bestAsk > 0) {
          // 只有卖单
          bestBid = Math.max(0.01, bestAsk - 0.05);
        } else if (bestAsk === 0 && bestBid > 0) {
          // 只有买单
          bestAsk = Math.min(0.99, bestBid + 0.05);
        } else if (bestBid === 0 && bestAsk === 0) {
          // 订单簿为空
          bestBid = 0.49;
          bestAsk = 0.51;
        }

        // 核心公式：显示价格 = (最高买价 + 最低卖价) ÷ 2
        const midPrice = (bestBid + bestAsk) / 2;
        const spread = bestAsk - bestBid;

        setPrice({
          yes: midPrice,
          no: 1 - midPrice,
          probability: midPrice * 100,
          bestBid,
          bestAsk,
          spread,
          loading: false,
          error: null,
          refresh: fetchPrice
        });
        
        console.log('✅ 价格已更新:', {
          marketId,
          midPrice: midPrice.toFixed(4),
          bestBid,
          bestAsk,
          spread: (spread * 100).toFixed(2) + '%'
        });
      } else {
        // 使用默认值但保留 refresh 函数
        setPrice(prev => ({
          yes: 0.5,
          no: 0.5,
          probability: 50,
          bestBid: 0.49,
          bestAsk: 0.51,
          spread: 0.02,
          loading: false,
          error: null,
          refresh: fetchPrice
        }));
      }
    } catch (error) {
      console.error('获取价格失败:', error);
      
      setPrice(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '获取价格失败',
        refresh: fetchPrice
      }));
    }
  }, [marketId, enabled]);

  useEffect(() => {
    if (!enabled || !marketId) {
      return;
    }

    // 首次加载
    fetchPrice();

    // 每30秒刷新一次价格
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [marketId, enabled, fetchPrice]);

  return price;
}
