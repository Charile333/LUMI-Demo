/**
 * 🎯 市场价格 Hook - Realtime 版本
 * 使用 Supabase Realtime 获取市场的实时价格和概率
 * 
 * 核心公式：显示价格 = (最高买价 + 最低卖价) ÷ 2
 */

import { useState, useEffect, useCallback } from 'react';
import { useOrderBookRealtime } from './useOrderBookRealtime';

export interface MarketPrice {
  yes: number;        // YES 价格（0-1）
  no: number;         // NO 价格（0-1）
  probability: number; // 概率百分比（0-100）
  bestBid: number;    // 最高买价
  bestAsk: number;    // 最低卖价
  spread: number;     // 价差
  volume24h: number;  // 24小时交易量
  loading: boolean;   // 加载状态
  error: string | null; // 错误信息
  connected: boolean; // Realtime连接状态
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
    volume24h: 0,
    loading: true,
    error: null,
    connected: false,
    refresh: async () => {}
  });

  // 🔥 使用 Realtime Hook 获取订单簿
  const { orderBook, connected, loading: realtimeLoading, error: realtimeError, refresh } = useOrderBookRealtime(
    enabled ? marketId : 0
  );

  // 🔥 当 orderBook 更新时，重新计算价格
  useEffect(() => {
    if (!enabled || !orderBook) {
      return;
    }

    let bestBid = 0;
    let bestAsk = 0;
    let volume = 0;

    // 从订单簿中提取数据
    if (orderBook.bids && orderBook.bids.length > 0) {
      bestBid = parseFloat(String(orderBook.bids[0].price)) || 0;
    }

    if (orderBook.asks && orderBook.asks.length > 0) {
      bestAsk = parseFloat(String(orderBook.asks[0].price)) || 0;
    }

    if (orderBook.volume24h) {
      volume = parseFloat(String(orderBook.volume24h)) || 0;
    }

    // 处理特殊情况
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
      volume24h: volume,
      loading: realtimeLoading,
      error: realtimeError,
      connected,
      refresh
    });

    console.log('🔥 市场价格实时更新 (Realtime):', {
      marketId,
      probability: (midPrice * 100).toFixed(1) + '%',
      bestBid: bestBid.toFixed(2),
      bestAsk: bestAsk.toFixed(2),
      volume24h: volume.toFixed(0),
      spread: (spread * 100).toFixed(2) + '%'
    });
  }, [orderBook, enabled, realtimeLoading, realtimeError, connected, refresh, marketId]);

  return price;
}
