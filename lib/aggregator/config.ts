/**
 * 优先级权重配置
 */

export const priorityWeights = {
  // 优先级等级分数（最重要）
  level: {
    pinned: 10000,      // 置顶 - 最高优先级
    featured: 5000,     // 精选 - 高优先级
    recommended: 2000,  // 推荐 - 中等优先级
    normal: 0,          // 普通 - 基础优先级
  },
  
  // 特殊标签加分
  tags: {
    homepage: 1000,  // 首页展示
    hot: 500,        // 热门标签
    trending: 300,   // 趋势标签
  },
  
  // 数据源基础分
  source: {
    polymarket: 100,  // Polymarket
    custom: 50,       // 自定义市场
    other: 10,        // 其他来源
  },
  
  // 用户参与度权重
  engagement: {
    participants: 2,  // 参与者数量权重
    volume: 1,        // 成交量权重
  },
  
  // 新鲜度权重（负值，越新越靠前）
  freshness: -0.1,
};

