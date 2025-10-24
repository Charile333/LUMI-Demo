// 🎯 带实时价格的市场数据 Hook
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface Market {
  id: number;
  questionId: string;
  title: string;
  description: string;
  category: string;
  probability: number;  // 实时计算
  endDate: string;
  volume: string;
  participants: string;
  trend: 'up' | 'down';
  change: string;
  image_url?: string;
  resolutionCriteria?: string;
  relatedMarkets?: any[];
}

export function useMarketsWithRealTimePrices(category: string) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketsWithPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 从 Supabase 加载市场数据
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: marketsData, error: queryError } = await supabase
          .from('markets')
          .select('*')
          .eq('main_category', category)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (queryError) {
          console.error(`[${category}] 查询失败:`, queryError);
          setError('数据加载失败');
          return;
        }

        if (!marketsData || marketsData.length === 0) {
          setMarkets([]);
          return;
        }

        // 2. 为每个市场获取实时价格
        const marketsWithPrices = await Promise.all(
          marketsData.map(async (market: any) => {
            let probability = 50; // 默认 50%

            try {
              // 从订单簿 API 获取最佳买价（YES 的概率）
              const response = await fetch(
                `/api/orders/book?marketId=${market.id}&outcome=1`
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.orderBook) {
                  // 最佳买价 = 市场对 YES 的估价
                  const bestBuyPrice = data.orderBook.buy?.[0]?.price;
                  if (bestBuyPrice) {
                    probability = Math.round(parseFloat(bestBuyPrice) * 100);
                  }
                }
              }
            } catch (err) {
              console.error(`[市场${market.id}] 获取价格失败:`, err);
              // 使用默认值
            }

            return {
              id: market.id,
              questionId: market.question_id,
              title: market.title,
              description: market.description || '暂无描述',
              category: market.sub_category || '未分类',
              probability: probability, // ✅ 实时计算
              endDate: market.end_time 
                ? new Date(market.end_time).toLocaleDateString('zh-CN')
                : '2025-12-31',
              volume: `$${market.volume || 0}`,
              participants: `${market.participants || 0}人参与`,
              trend: probability > 50 ? 'up' as const : 'down' as const,
              change: `${probability > 50 ? '+' : ''}${probability - 50}%`,
              image_url: market.image_url,
              resolutionCriteria: market.description,
              relatedMarkets: []
            };
          })
        );

        setMarkets(marketsWithPrices);
        console.log(`[${category}] 加载 ${marketsWithPrices.length} 个市场（含实时价格）`);
      } catch (err) {
        console.error(`[${category}] 加载失败:`, err);
        setError('数据加载失败，请刷新页面');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketsWithPrices();
    
    // 每 30 秒刷新一次价格
    const interval = setInterval(fetchMarketsWithPrices, 30000);
    
    return () => clearInterval(interval);
  }, [category]);

  return { markets, loading, error };
}






