/**
 * Polymarket API 集成
 * 获取真实的预测市场数据
 * 🚀 已优化：添加智能缓存层
 */

import { productCache } from '@/lib/cache/product-cache';

export interface PolymarketMarket {
  condition_id: string;
  question: string;
  description?: string;
  end_date_iso?: string;
  game_start_time?: string;
  question_id?: string;
  market_slug?: string;
  min_incentive_size?: number;
  max_incentive_spread?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  new?: boolean;
  featured?: boolean;
  submitted_by?: string;
  volume?: string;
  volume_num?: number;
  liquidity?: string;
  liquidity_num?: number;
  end_date?: string;
  seconds_delay?: number;
  icon?: string;
  image?: string;
  category?: string;
  tags?: string[];
  tokens?: Array<{
    token_id: string;
    outcome: string;
    price: string;
    winner: boolean;
  }>;
  enable_order_book?: boolean;
  order_price_min_tick_size?: number;
  order_min_size?: number;
}

/**
 * 获取 Polymarket 市场数据（带缓存）
 * 🚀 性能优化：默认缓存5分钟，减少API调用
 */
export async function fetchPolymarketMarkets(options?: {
  limit?: number;
  active?: boolean;
  category?: string;
  skipCache?: boolean; // 是否跳过缓存
}): Promise<PolymarketMarket[]> {
  try {
    const { limit = 20, active = true, category, skipCache = false } = options || {};
    
    // 生成缓存键
    const cacheKey = `markets:${limit}:${active}:${category || 'all'}`;
    
    // 🚀 如果不跳过缓存，先尝试从缓存获取
    if (!skipCache) {
      return await productCache.getPolymarketData(
        cacheKey,
        async () => {
          console.log('📡 从 Polymarket API 获取数据...');
          return await fetchFromPolymarketAPI(limit, active);
        }
      );
    }
    
    // 跳过缓存，直接获取
    console.log('⚠️ 跳过缓存，直接从 API 获取');
    return await fetchFromPolymarketAPI(limit, active);
    
  } catch (error) {
    console.error('获取 Polymarket 数据失败:', error);
    return [];
  }
}

/**
 * 实际的 API 调用函数
 */
async function fetchFromPolymarketAPI(
  limit: number,
  active: boolean
): Promise<PolymarketMarket[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('active', active.toString());
  
  const url = `https://gamma-api.polymarket.com/markets?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // 不使用浏览器缓存
  });

  if (!response.ok) {
    throw new Error(`Polymarket API 返回错误: ${response.status}`);
  }

  const data = await response.json();
  
  return Array.isArray(data) ? data : [];
}

/**
 * 根据分类过滤市场
 */
export function filterMarketsByCategory(
  markets: PolymarketMarket[],
  category?: string
): PolymarketMarket[] {
  if (!category) return markets;
  
  return markets.filter(market => {
    const marketCategory = market.category?.toLowerCase() || '';
    const marketTags = market.tags?.map(tag => tag.toLowerCase()) || [];
    
    return marketCategory.includes(category.toLowerCase()) || 
           marketTags.some(tag => tag.includes(category.toLowerCase()));
  });
}

/**
 * 计算概率（从价格转换）
 */
export function calculateProbability(price: string | number): number {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  return Math.round(priceNum * 100);
}

/**
 * 格式化成交量
 */
export function formatVolume(volume?: string | number): string {
  if (!volume) return '$0';
  
  const volumeNum = typeof volume === 'string' ? parseFloat(volume) : volume;
  
  if (volumeNum >= 1000000) {
    return `$${(volumeNum / 1000000).toFixed(1)}M`;
  } else if (volumeNum >= 1000) {
    return `$${(volumeNum / 1000).toFixed(1)}K`;
  } else {
    return `$${volumeNum.toFixed(0)}`;
  }
}

/**
 * 格式化日期
 */
export function formatEndDate(dateString?: string): string {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'TBD';
  }
}

