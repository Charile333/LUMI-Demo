// 🎯 按分类加载市场数据的 Hook
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase-client';

// #vercel环境禁用 - 使用单例 Supabase 客户端，避免多实例警告
const supabase = getSupabase();

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
  // MarketCard需要的字段
  blockchain_status?: string;
  interested_users?: number;
  views?: number;
  activity_score?: number;
  condition_id?: string;
  main_category?: string;
  volumeNum?: number; // 数字格式的交易量，用于实时更新
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

        // #vercel环境禁用 - 从 Supabase 加载指定分类的市场（使用单例客户端）
        const { data, error: queryError } = await supabase
          .from('markets')
          .select('*')
          .eq('main_category', category) // 按分类过滤
          .neq('status', 'cancelled') // 排除已取消的市场，其他都显示（包括草稿、活跃、待结算）
          .order('id', { ascending: false }); // 使用 id 排序，避免字段名问题

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
          volume: `$${market.volume || 0}`, // 字符串格式（用于显示）
          participants: `${market.participants || 0}人参与`,
          trend: 'up' as const, // 默认值，将由 WebSocket 更新
          change: '0%', // 默认值，将由 WebSocket 更新
          image_url: market.image_url,
          resolutionCriteria: market.description,
          relatedMarkets: [],
          priorityLevel: market.priority_level || 'normal',
          source: market.source || 'custom',
          // MarketCard需要的字段
          blockchain_status: market.blockchain_status || 'not_created',
          interested_users: market.interested_users || 0,
          views: market.views || 0,
          activity_score: market.activity_score || 0,
          condition_id: market.condition_id,
          main_category: market.main_category,
          // 添加数字格式的 volume，用于实时更新
          volumeNum: parseFloat(market.volume) || 0
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

    // 🔥 订阅新市场创建事件（实时更新）
    const channel = supabase
      .channel(`markets_category:${category}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'markets',
          filter: `main_category=eq.${category}`
        },
        (payload) => {
          console.log('🔥 新市场创建:', payload.new);
          const newMarket = payload.new as any;
          
          // 检查市场状态是否为 active
          if (newMarket.status === 'active') {
            // 格式化新市场数据
            const formattedMarket: Market = {
              id: newMarket.id,
              questionId: newMarket.question_id,
              title: newMarket.title,
              description: newMarket.description || '暂无描述',
              category: newMarket.sub_category || '未分类',
              probability: 50, // 默认值，将由 WebSocket 更新
              endDate: newMarket.end_time 
                ? new Date(newMarket.end_time).toLocaleDateString('zh-CN')
                : '2025-12-31',
              volume: `$${newMarket.volume || 0}`,
              participants: `${newMarket.participants || 0}人参与`,
              trend: 'up' as const,
              change: '0%',
              image_url: newMarket.image_url,
              resolutionCriteria: newMarket.description,
              relatedMarkets: [],
              priorityLevel: newMarket.priority_level || 'normal',
              source: newMarket.source || 'custom',
              blockchain_status: newMarket.blockchain_status || 'not_created',
              interested_users: newMarket.interested_users || 0,
              views: newMarket.views || 0,
              activity_score: newMarket.activity_score || 0,
              condition_id: newMarket.condition_id,
              main_category: newMarket.main_category,
              volumeNum: parseFloat(newMarket.volume) || 0
            };
            
            // 添加到列表开头（最新市场在前）
            setMarkets(prev => [formattedMarket, ...prev]);
            console.log(`✅ 新市场已添加到列表: ${newMarket.title}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `main_category=eq.${category}`
        },
        (payload) => {
          console.log('🔥 市场数据更新:', payload.new);
          const updatedMarket = payload.new as any;
          
          // 更新现有市场数据
          setMarkets(prev => {
            const updated = prev.map(market => 
              market.id === updatedMarket.id
                ? {
                    ...market,
                    title: updatedMarket.title || market.title,
                    description: updatedMarket.description || market.description,
                    volume: `$${updatedMarket.volume || 0}`,
                    participants: `${updatedMarket.participants || 0}人参与`,
                    volumeNum: parseFloat(updatedMarket.volume) || 0,
                    blockchain_status: updatedMarket.blockchain_status || market.blockchain_status,
                    interested_users: updatedMarket.interested_users || market.interested_users,
                    views: updatedMarket.views || market.views,
                    activity_score: updatedMarket.activity_score || market.activity_score
                  }
                : market
            );
            
            // 如果市场状态变为非 active，从列表中移除
            return updated.filter(market => {
              if (market.id === updatedMarket.id && updatedMarket.status !== 'active') {
                return false; // 移除非 active 的市场
              }
              return true;
            });
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ 已订阅分类 ${category} 的市场实时更新`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return { markets, loading, error };
}



