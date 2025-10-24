// 🎯 市场活跃度评分算法

export interface ActivityMetrics {
  views: number;              // 浏览次数
  interestedUsers: number;    // 感兴趣用户数
  timeToExpiry: number;       // 距离结束的天数
  priorityLevel: string;      // 优先级
  createdDaysAgo: number;     // 创建天数
}

/**
 * 计算市场活跃度评分（0-100）
 */
export function calculateActivityScore(metrics: ActivityMetrics): number {
  let score = 0;
  
  // 1. 浏览量权重：40%
  // 0-50 浏览：线性增长
  // 50-200 浏览：缓慢增长
  // 200+ 浏览：满分
  if (metrics.views <= 50) {
    score += (metrics.views / 50) * 20;
  } else if (metrics.views <= 200) {
    score += 20 + ((metrics.views - 50) / 150) * 20;
  } else {
    score += 40;
  }
  
  // 2. 用户兴趣权重：30%
  // 每个感兴趣的用户：3分，最高30分
  score += Math.min(metrics.interestedUsers * 3, 30);
  
  // 3. 时间因素权重：15%
  // 即将到期的市场优先激活
  if (metrics.timeToExpiry <= 7) {
    score += 15; // 一周内到期，满分
  } else if (metrics.timeToExpiry <= 30) {
    score += 10; // 一月内到期
  } else if (metrics.timeToExpiry <= 90) {
    score += 5;  // 三月内到期
  }
  
  // 4. 创建时间因素：-5%
  // 创建时间太久但没激活，减分
  if (metrics.createdDaysAgo > 30) {
    score -= 5;
  }
  
  // 5. 优先级加成：10-15%
  switch (metrics.priorityLevel) {
    case 'hot':
      score += 15;
      break;
    case 'recommended':
      score += 10;
      break;
    case 'normal':
      score += 5;
      break;
    default:
      score += 0;
  }
  
  // 确保评分在 0-100 之间
  return Math.max(0, Math.min(100, score));
}

/**
 * 判断是否应该激活市场
 * @param score 活跃度评分
 * @returns 是否应该激活
 */
export function shouldActivateMarket(score: number): boolean {
  // 评分超过 60 分就激活
  return score >= 60;
}

/**
 * 获取评分等级
 */
export function getScoreLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      level: '极高',
      color: 'red',
      description: '立即激活'
    };
  } else if (score >= 60) {
    return {
      level: '高',
      color: 'orange',
      description: '建议激活'
    };
  } else if (score >= 40) {
    return {
      level: '中等',
      color: 'yellow',
      description: '继续观察'
    };
  } else if (score >= 20) {
    return {
      level: '低',
      color: 'blue',
      description: '等待更多活跃'
    };
  } else {
    return {
      level: '极低',
      color: 'gray',
      description: '考虑取消'
    };
  }
}

/**
 * 批量计算市场评分
 */
export function calculateBatchScores(markets: any[]): Array<{
  marketId: number;
  score: number;
  shouldActivate: boolean;
}> {
  return markets.map(market => {
    const now = new Date();
    const endTime = market.end_time ? new Date(market.end_time) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const createdTime = new Date(market.created_at);
    
    const metrics: ActivityMetrics = {
      views: market.views || 0,
      interestedUsers: market.interested_users || 0,
      timeToExpiry: Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      priorityLevel: market.priority_level || 'normal',
      createdDaysAgo: Math.ceil((now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24))
    };
    
    const score = calculateActivityScore(metrics);
    
    return {
      marketId: market.id,
      score,
      shouldActivate: shouldActivateMarket(score)
    };
  });
}

