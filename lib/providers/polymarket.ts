/**
 * Polymarket 数据提供者
 */

import { IDataProvider } from './base';
import { Market, CategoryType } from '@/lib/types/market';
import { 
  fetchPolymarketMarkets, 
  PolymarketMarket,
  calculateProbability,
  formatVolume,
  formatEndDate
} from '@/lib/polymarket/api';

export class PolymarketProvider implements IDataProvider {
  name = 'polymarket';
  supportedCategories: CategoryType[] = [
    'tech-ai',
    'sports-gaming',
    'economy-social',
    'entertainment',
    'emerging'
  ];
  defaultPriority = 600;

  async fetchMarkets(category: CategoryType, limit: number): Promise<Market[]> {
    try {
      // 获取 Polymarket 数据
      const polymarkets = await fetchPolymarketMarkets({ limit, active: true });
      
      if (!polymarkets || polymarkets.length === 0) {
        return [];
      }

      // 过滤和转换
      const filtered = this.filterByCategory(polymarkets, category);
      return filtered.slice(0, limit).map((pm, index) => this.transform(pm, index));

    } catch (error) {
      console.error('[PolymarketProvider] 获取数据失败:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const markets = await fetchPolymarketMarkets({ limit: 1 });
      return markets && markets.length > 0;
    } catch {
      return false;
    }
  }

  private filterByCategory(markets: PolymarketMarket[], category: CategoryType): PolymarketMarket[] {
    // 根据 Polymarket 的分类和标签映射到我们的分类
    return markets.filter(market => {
      const cat = market.category?.toLowerCase() || '';
      const tags = market.tags?.map(t => t.toLowerCase()).join(' ') || '';
      const combined = `${cat} ${tags}`;

      switch (category) {
        case 'tech-ai':
          return /tech|ai|artificial intelligence|innovation|software/i.test(combined);
        case 'sports-gaming':
          return /sports|gaming|game|football|basketball|soccer|nfl|nba/i.test(combined);
        case 'economy-social':
          return /economy|economic|finance|business|market|stock|fed/i.test(combined);
        case 'entertainment':
          return /entertainment|movie|music|celebrity|film|show|pop culture/i.test(combined);
        case 'emerging':
          return /crypto|nft|blockchain|web3|defi/i.test(combined);
        default:
          return false;
      }
    });
  }

  private transform(pm: PolymarketMarket, index: number): Market {
    const yesToken = pm.tokens?.[0];
    const probability = yesToken ? calculateProbability(yesToken.price) : 50;
    
    return {
      // 基础字段
      id: pm.condition_id || `poly-${index}`,
      title: pm.question || 'Untitled',
      description: pm.description || pm.question || '',
      
      // 旧架构字段（向后兼容）
      category: pm.category || 'General',
      categoryType: undefined, // 将由聚合器设置
      probability,
      volume: formatVolume(pm.volume_num || pm.volume),
      volumeNum: pm.volume_num || 0,
      participants: Math.floor(Math.random() * 1000) + 100, // Polymarket 不提供，模拟
      endDate: formatEndDate(pm.end_date_iso || pm.end_date),
      trend: probability > 50 ? 'up' : 'down',
      change: `${probability > 50 ? '+' : '-'}${(Math.random() * 10).toFixed(1)}%`,
      resolutionCriteria: ['Based on official sources and market resolution'],
      relatedMarkets: [],
      isActive: pm.active !== false,
      createdAt: pm.end_date_iso || new Date().toISOString(),
      priorityLevel: 'normal',
      customWeight: 50,
      isHomepage: false,
      isHot: false,
      isTrending: false,
      
      // 新架构字段
      question_id: pm.question_id,
      condition_id: pm.condition_id,
      main_category: undefined, // 将由聚合器设置
      sub_category: pm.category || 'General',
      tags: pm.tags || [],
      end_time: pm.end_date_iso || pm.end_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: pm.active !== false ? 'active' : 'resolved',
      blockchain_status: 'created', // Polymarket的市场都已在链上
      resolved: pm.active === false,
      image_url: pm.image || pm.icon,
      priority_level: 'normal',
      
      // 数据源标识
      source: 'polymarket',
      
      // Polymarket 原始数据
      polymarketData: {
        marketSlug: pm.market_slug,
        conditionId: pm.condition_id,
        questionId: pm.question_id,
        tokens: pm.tokens,
        icon: pm.icon,
        image: pm.image,
        tags: pm.tags
      }
    };
  }
}

