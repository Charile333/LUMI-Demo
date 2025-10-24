/**
 * Polymarket API 集成
 * 获取真实的预测市场数据
 */

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
 * 获取 Polymarket 市场数据
 */
export async function fetchPolymarketMarkets(options?: {
  limit?: number;
  active?: boolean;
  category?: string;
}): Promise<PolymarketMarket[]> {
  try {
    const { limit = 20, active = true } = options || {};
    
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('active', active.toString());
    
    const url = `https://gamma-api.polymarket.com/markets?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 不缓存，获取最新数据
      next: { revalidate: 300 } // 5分钟后重新验证
    });

    if (!response.ok) {
      throw new Error(`Polymarket API 返回错误: ${response.status}`);
    }

    const data = await response.json();
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('获取 Polymarket 数据失败:', error);
    return [];
  }
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

