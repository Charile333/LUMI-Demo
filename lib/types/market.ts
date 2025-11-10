// 通用市场数据类型定义
export interface Market {
  id: number | string;
  title: string;
  description: string;
  
  // ===== 旧架构字段（保持向后兼容）=====
  category: string; // 映射到 sub_category
  categoryType?: string; // 映射到 main_category
  probability: number; // 从实时数据获取
  volume: string; // 格式化显示字符串
  volumeNum?: number; // 数值型成交量，用于排序
  participants: number;
  endDate: string; // 格式化日期字符串
  trend: 'up' | 'down';
  change: string;
  resolutionCriteria: string[];
  relatedMarkets: string[];
  createdAt?: string; // 映射到 created_at
  updatedAt?: string; // 映射到 updated_at
  isActive?: boolean; // 映射到 status = 'active'
  priorityLevel?: 'normal' | 'recommended' | 'featured' | 'pinned'; // 映射到 priority_level
  customWeight?: number; // 0-100，运营自定义权重
  isHomepage?: boolean; // 是否首页推荐
  isHot?: boolean; // 是否热门标记
  isTrending?: boolean; // 是否趋势标记
  
  // ===== 新架构字段 =====
  question_id?: string; // 链上问题ID（唯一）
  condition_id?: string; // 链上条件ID
  main_category?: string; // 主分类（automotive, tech-ai等）
  sub_category?: string; // 子分类（品牌月度销量等）
  tags?: string[]; // 标签数组
  
  // 时间字段（新架构使用 TIMESTAMP）
  start_time?: string; // 开始时间
  end_time?: string; // 结束时间
  resolution_time?: string; // 结算时间
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
  
  // 状态字段
  status?: 'draft' | 'pending' | 'active' | 'resolved' | 'cancelled'; // 市场状态
  blockchain_status?: 'not_created' | 'creating' | 'created' | 'failed'; // 区块链状态
  resolved?: boolean; // 是否已结算
  resolution_data?: any; // 结算数据（JSONB）
  winning_outcome?: number; // 获胜结果（0或1）
  
  // 区块链集成字段
  adapter_address?: string; // 适配器合约地址
  ctf_address?: string; // CTF代币地址
  oracle_address?: string; // 预言机地址
  collateral_token?: string; // 抵押代币地址
  reward_amount?: number; // 奖励金额
  
  // 统计字段
  liquidity?: number; // 流动性
  
  // 优先级
  priority_level?: 'recommended' | 'normal' | 'low'; // 优先级（新架构）
  
  // 扩展字段
  question?: string; // 市场问题
  image?: string; // 市场图片（旧）
  image_url?: string; // 市场图片URL（新）
  options?: Array<{
    name: string;
    probability: string;
    totalValue: string;
  }>; // 市场选项
  sourceUrl?: string; // 来源URL（内部链接）
  externalUrl?: string; // 外部链接
  metadata?: any; // 元数据
  
  // 数据来源
  source?: 'custom' | 'polymarket' | 'kalshi' | 'metaculus' | 'blockchain' | 'other';
  
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


