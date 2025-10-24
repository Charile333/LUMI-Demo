// 🎯 按分类加载市场数据的 Hook
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface Market {
  id: number;
  questionId: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  endDate: string;
  volume: string;
  participants: string;
  trend: 'up' | 'down';
  change: string;
  image_url?: string;
  resolutionCriteria?: string;
  relatedMarkets?: any[];
  priorityLevel?: 'normal' | 'recommended' | 'featured' | 'pinned';
  source?: 'custom' | 'polymarket' | 'kalshi' | 'metaculus' | 'other';
}

export function useMarketsByCategory(category: string) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);

        // 从 Supabase 加载指定分类的市场
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: queryError } = await supabase
          .from('markets')
          .select('*')
          .eq('main_category', category) // 按分类过滤
          .eq('status', 'active') // 只显示活跃市场
          .order('created_at', { ascending: false });

        if (queryError) {
          console.error(`[${category}页面] 查询失败:`, queryError);
          setError('数据加载失败');
          return;
        }

        // 转换数据格式（不包含价格，价格由 WebSocket 提供）
        const formattedMarkets: Market[] = (data || []).map((market: any) => ({
          id: market.id,
          questionId: market.question_id,
          title: market.title,
          description: market.description || '暂无描述',
          category: market.sub_category || '未分类',
          probability: 50, // 默认值，将由 WebSocket 更新
          endDate: market.end_time 
            ? new Date(market.end_time).toLocaleDateString('zh-CN')
            : '2025-12-31',
          volume: `$${market.volume || 0}`,
          participants: `${market.participants || 0}人参与`,
          trend: 'up' as const, // 默认值，将由 WebSocket 更新
          change: '0%', // 默认值，将由 WebSocket 更新
          image_url: market.image_url,
          resolutionCriteria: market.description,
          relatedMarkets: [],
          priorityLevel: market.priority_level || 'normal',
          source: market.source || 'custom'
        }));

        setMarkets(formattedMarkets);
        console.log(`[${category}页面] 从数据库加载 ${formattedMarkets.length} 个市场`);
      } catch (err) {
        console.error(`[${category}页面] 加载失败:`, err);
        setError('数据加载失败，请刷新页面');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [category]);

  return { markets, loading, error };
}



