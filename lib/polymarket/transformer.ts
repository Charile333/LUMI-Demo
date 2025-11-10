/**
 * 将 Polymarket 数据转换为项目的 Market 格式
 */

import { PolymarketMarket, calculateProbability, formatVolume, formatEndDate } from './api';
import { Market, CategoryType } from '../types/market';

/**
 * 映射 Polymarket 分类到项目分类
 */
export function mapCategory(polymarketCategory?: string, tags?: string[]): CategoryType {
  const category = polymarketCategory?.toLowerCase() || '';
  const allTags = tags?.map(t => t.toLowerCase()).join(' ') || '';
  const combined = `${category} ${allTags}`;
  
  // 科技与AI
  if (combined.match(/tech|ai|artificial intelligence|technology|innovation/i)) {
    return 'tech-ai';
  }
  
  // 汽车与新能源
  if (combined.match(/automotive|car|vehicle|tesla|electric|ev/i)) {
    return 'automotive';
  }
  
  // 娱乐
  if (combined.match(/entertainment|movie|music|celebrity|film|show/i)) {
    return 'entertainment';
  }
  
  // 体育与游戏
  if (combined.match(/sports|gaming|game|football|basketball|soccer/i)) {
    return 'sports-gaming';
  }
  
  // 经济与社会
  if (combined.match(/economy|economic|finance|business|market|stock/i)) {
    return 'economy-social';
  }
  
  // 智能设备
  if (combined.match(/device|gadget|smartphone|iot/i)) {
    return 'smart-devices';
  }
  
  // 新兴市场
  if (combined.match(/emerging|crypto|nft|blockchain|web3/i)) {
    return 'emerging';
  }
  
  // 默认归类到热门趋势
  return 'trending';
}

/**
 * 转换单个市场数据
 */
export function transformPolymarketToMarket(
  polymarket: PolymarketMarket,
  index: number
): Market {
  // 获取第一个代币的价格作为 YES 的概率
  const yesToken = polymarket.tokens?.[0];
  const probability = yesToken ? calculateProbability(yesToken.price) : 50;
  
  // 计算变化（随机生成，因为 Polymarket API 不提供历史变化）
  const change = probability > 50 
    ? `+${(Math.random() * 10).toFixed(1)}%`
    : `-${(Math.random() * 5).toFixed(1)}%`;
  
  const trend = probability > 50 ? 'up' : 'down';
  const mappedCategory = mapCategory(polymarket.category, polymarket.tags);
  
  return {
    // 基础字段
    id: polymarket.condition_id || `polymarket-${index}`,
    title: polymarket.question || 'Untitled Market',
    description: polymarket.description || polymarket.question || '',
    
    // 旧架构字段（向后兼容）
    category: polymarket.category || 'General',
    categoryType: mappedCategory,
    probability,
    volume: formatVolume(polymarket.volume_num || polymarket.volume),
    volumeNum: polymarket.volume_num || 0,
    participants: Math.floor(Math.random() * 1000) + 100, // 模拟参与人数
    endDate: formatEndDate(polymarket.end_date_iso || polymarket.end_date),
    trend,
    change,
    resolutionCriteria: [
      'Based on official sources and market resolution',
      'Market will resolve according to outcome criteria'
    ],
    relatedMarkets: [],
    isActive: polymarket.active !== false,
    createdAt: new Date().toISOString(),
    priorityLevel: 'normal',
    
    // 新架构字段
    question_id: polymarket.question_id,
    condition_id: polymarket.condition_id,
    main_category: mappedCategory,
    sub_category: polymarket.category || 'General',
    tags: polymarket.tags || [],
    end_time: polymarket.end_date_iso || polymarket.end_date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: polymarket.active !== false ? 'active' : 'resolved',
    blockchain_status: 'created', // Polymarket的市场都已在链上
    resolved: polymarket.active === false,
    image_url: polymarket.image || polymarket.icon,
    priority_level: 'normal',
    source: 'polymarket',
    
    // 额外的 Polymarket 信息
    polymarketData: {
      marketSlug: polymarket.market_slug,
      conditionId: polymarket.condition_id,
      questionId: polymarket.question_id,
      tokens: polymarket.tokens,
      icon: polymarket.icon,
      image: polymarket.image,
      tags: polymarket.tags
    }
  } as Market;
}

/**
 * 批量转换市场数据
 */
export function transformPolymarketMarkets(
  polymarkets: PolymarketMarket[]
): Market[] {
  return polymarkets
    .filter(market => market.question && market.active !== false)
    .map((market, index) => transformPolymarketToMarket(market, index));
}

/**
 * 按分类过滤转换后的市场
 */
export function filterMarketsByCategoryType(
  markets: Market[],
  categoryType?: CategoryType
): Market[] {
  if (!categoryType) return markets;
  return markets.filter(market => market.categoryType === categoryType);
}

