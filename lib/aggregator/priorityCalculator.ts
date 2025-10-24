/**
 * 优先级计算器
 */

import { Market } from '@/lib/types/market';
import { priorityWeights } from './config';

export class PriorityCalculator {
  
  /**
   * 计算市场的最终优先级分数
   */
  static calculate(market: Market): number {
    let score = 0;
    const weights = priorityWeights;
    
    // 1. 优先级等级分数（最重要）
    if (market.priorityLevel) {
      score += weights.level[market.priorityLevel] || 0;
    }
    
    // 2. 特殊标签加分
    if (market.isHomepage) score += weights.tags.homepage;
    if (market.isHot) score += weights.tags.hot;
    if (market.isTrending) score += weights.tags.trending;
    
    // 3. 运营自定义权重（0-100）
    if (market.customWeight !== undefined) {
      score += market.customWeight * 20;
    }
    
    // 4. 数据源基础分
    const sourceKey = market.source as keyof typeof weights.source;
    const sourceScore = weights.source[sourceKey] || weights.source.other;
    score += sourceScore;
    
    // 5. 用户参与度
    if (market.participants) {
      score += Math.log(market.participants + 1) * weights.engagement.participants;
    }
    
    // 6. 成交量
    if (market.volumeNum) {
      score += Math.log(market.volumeNum + 1) * weights.engagement.volume;
    }
    
    // 7. 新鲜度（新创建的排前面）
    if (market.createdAt) {
      const hoursSinceCreated = this.getHoursSince(market.createdAt);
      score += hoursSinceCreated * weights.freshness;
    }
    
    return Math.round(score);
  }
  
  /**
   * 批量计算并排序
   */
  static sortByPriority(markets: Market[]): Market[] {
    return markets
      .map(market => ({
        ...market,
        _priorityScore: this.calculate(market)
      }))
      .sort((a, b) => (b._priorityScore || 0) - (a._priorityScore || 0));
  }
  
  /**
   * 获取市场标签
   */
  static getLabel(market: Market): string {
    if (market.priorityLevel === 'pinned') return '📌 置顶';
    if (market.priorityLevel === 'featured') return '⭐ 精选';
    if (market.priorityLevel === 'recommended') return '🔥 推荐';
    if (market.source === 'polymarket') return '🔴 Live';
    if (market.source === 'custom') return '📝 自定义';
    return '';
  }
  
  private static getHoursSince(date: string | Date): number {
    const then = new Date(date).getTime();
    const now = Date.now();
    return (now - then) / (1000 * 60 * 60);
  }
}

