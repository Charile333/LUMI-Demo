// 通用市场数据类型定义
export interface Market {
  id: number | string;
  title: string;
  category: string;
  probability: number;
  volume: string;
  volumeNum?: number; // 数值型成交量，用于排序
  participants: number;
  endDate: string;
  trend: 'up' | 'down';
  change: string;
  description: string;
  resolutionCriteria: string[];
  relatedMarkets: string[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean; // 是否激活显示
  categoryType?: string; // 所属分类类型（automotive, tech-ai, etc.）
  
  // 数据来源
  source?: 'custom' | 'polymarket' | 'kalshi' | 'metaculus' | 'other';
  
  // 优先级控制（新增）
  priorityLevel?: 'normal' | 'recommended' | 'featured' | 'pinned';
  customWeight?: number; // 0-100，运营自定义权重
  isHomepage?: boolean; // 是否首页推荐
  isHot?: boolean; // 是否热门标记
  isTrending?: boolean; // 是否趋势标记
  
  // 计算字段（运行时添加）
  _priorityScore?: number;
  
  // Polymarket 原始数据（可选）
  polymarketData?: {
    marketSlug?: string;
    conditionId?: string;
    questionId?: string;
    tokens?: Array<{
      token_id: string;
      outcome: string;
      price: string;
      winner: boolean;
    }>;
    icon?: string;
    image?: string;
    tags?: string[];
  };
}

// 市场分类类型
export type CategoryType = 
  | 'automotive'
  | 'tech-ai'
  | 'entertainment'
  | 'smart-devices'
  | 'sports-gaming'
  | 'economy-social'
  | 'emerging'
  | 'crypto'
  | 'geopolitics'
  | 'breaking'
  | 'trending';

// 市场列表响应
export interface MarketsResponse {
  markets: Market[];
  total: number;
  categoryType?: CategoryType;
}

// 创建/更新市场请求
export interface CreateMarketRequest {
  title: string;
  category: string;
  categoryType: CategoryType;
  probability?: number;
  volume?: string;
  participants?: number;
  endDate: string;
  trend?: 'up' | 'down';
  change?: string;
  description: string;
  resolutionCriteria: string[];
  relatedMarkets?: string[];
  isActive?: boolean;
}

export interface UpdateMarketRequest extends Partial<CreateMarketRequest> {
  id: number;
}

// API 响应通用格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}


