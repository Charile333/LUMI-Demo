/**
 * 数据提供者基础接口
 */

import { Market, CategoryType } from '@/lib/types/market';

// 数据提供者接口
export interface IDataProvider {
  name: string;
  supportedCategories: CategoryType[];
  defaultPriority: number;  // 该数据源的基础优先级
  
  fetchMarkets(
    category: CategoryType,
    limit: number
  ): Promise<Market[]>;
  
  isAvailable(): Promise<boolean>;
}

// 聚合配置
export interface AggregatorConfig {
  category: CategoryType;
  limit: number;
  strategy?: 'balanced' | 'priority-first' | 'quality-first';
  minCustomCount?: number;  // 最少自定义市场数
}

// 优先级权重配置
export interface PriorityWeights {
  level: {
    pinned: number;
    featured: number;
    recommended: number;
    normal: number;
  };
  source: {
    custom: number;
    polymarket: number;
    kalshi: number;
    metaculus: number;
    other: number;
  };
  tags: {
    homepage: number;
    hot: number;
    trending: number;
  };
  engagement: {
    participants: number;
    volume: number;
  };
  freshness: number;  // 每小时扣分
}

