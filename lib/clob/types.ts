// 🎯 CLOB 系统类型定义

import { ethers } from 'ethers';

/**
 * 订单
 */
export interface Order {
  // 订单标识
  orderId: string;
  orderHash?: string;
  
  // 市场
  marketId: number;
  questionId: string;
  
  // 用户
  maker: string;
  
  // 订单类型
  side: 'buy' | 'sell';
  outcome: number; // 0=NO, 1=YES
  
  // 价格和数量
  price: string; // "0.65"
  amount: string; // "100"
  filledAmount?: string;
  remainingAmount?: string;
  
  // EIP-712 签名
  salt: string;
  nonce: number;
  expiration: number; // Unix timestamp
  signature?: string;
  
  // 状态
  status?: 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';
  settlementStatus?: 'pending' | 'settling' | 'settled' | 'failed';
  
  // 时间
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 成交记录
 */
export interface Trade {
  id?: number;
  tradeId: string;
  
  // 市场
  marketId: number;
  questionId: string;
  
  // 订单
  makerOrderId: number;
  takerOrderId: number;
  
  // 用户
  makerAddress: string;
  takerAddress: string;
  
  // 成交信息
  side: 'buy' | 'sell';
  outcome: number;
  price: string;
  amount: string;
  
  // 费用
  makerFee?: string;
  takerFee?: string;
  
  // 结算
  settlementBatchId?: number;
  settlementTxHash?: string;
  settlementBlockNumber?: number;
  settled: boolean;
  settledAt?: Date;
  
  // 时间
  createdAt: Date;
}

/**
 * 订单簿
 */
export interface OrderBook {
  marketId: number;
  questionId: string;
  outcome: number;
  
  // 买单（从高到低）
  bids: OrderBookLevel[];
  
  // 卖单（从低到高）
  asks: OrderBookLevel[];
  
  // 价差
  spread: number | null;
  
  // 更新时间
  updatedAt: Date;
}

/**
 * 订单簿层级
 */
export interface OrderBookLevel {
  price: string;
  amount: string;
  orderCount: number;
}

/**
 * 结算批次
 */
export interface SettlementBatch {
  id?: number;
  batchId: string;
  tradeIds: number[];
  tradeCount: number;
  
  // 状态
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // 链上
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: string;
  
  // 时间
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  
  // 错误
  errorMessage?: string;
  retryCount: number;
}

/**
 * 用户余额
 */
export interface Balance {
  id?: number;
  userAddress: string;
  tokenAddress: string;
  tokenType: 'collateral' | 'outcome';
  
  // 市场信息（仅 outcome token）
  marketId?: number;
  outcome?: number;
  
  // 余额
  balance: string;
  lockedBalance: string;
  availableBalance?: string;
  
  // 时间
  updatedAt: Date;
}

/**
 * 市场（数据库）
 */
export interface MarketDB {
  id: number;
  questionId: string;
  conditionId?: string;
  
  // 基本信息
  title: string;
  description?: string;
  imageUrl?: string;
  
  // 分类
  mainCategory: string;
  subCategory?: string;
  tags?: string[];
  
  // 时间
  startTime?: Date;
  endTime?: Date;
  resolutionTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // 状态
  status: 'draft' | 'pending' | 'active' | 'resolved' | 'cancelled';
  blockchainStatus: 'not_created' | 'creating' | 'created' | 'failed';
  
  // 链上数据
  adapterAddress?: string;
  ctfAddress?: string;
  oracleAddress?: string;
  collateralToken?: string;
  rewardAmount?: string;
  
  // 结算
  resolved: boolean;
  resolutionData?: any;
  winningOutcome?: number;
  
  // 统计
  volume: string;
  liquidity: string;
  participants: number;
  
  // 优先级
  priorityLevel: 'recommended' | 'normal' | 'low';
}

/**
 * EIP-712 Domain
 */
export const ORDER_DOMAIN = {
  name: 'Market CLOB',
  version: '1',
  chainId: 80002, // Amoy
  verifyingContract: '0x0000000000000000000000000000000000000000' // 将被实际合约地址替换
};

/**
 * EIP-712 订单类型
 */
export const ORDER_TYPES = {
  Order: [
    { name: 'orderId', type: 'string' },
    { name: 'marketId', type: 'uint256' },
    { name: 'questionId', type: 'string' },
    { name: 'maker', type: 'address' },
    { name: 'side', type: 'string' },
    { name: 'outcome', type: 'uint256' },
    { name: 'price', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'salt', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiration', type: 'uint256' }
  ]
};

/**
 * 订单匹配结果
 */
export interface MatchResult {
  order: Order;
  trades: Trade[];
  remainingAmount: string;
  fullyFilled: boolean;
}

/**
 * 活动日志
 */
export interface ActivityLog {
  id?: number;
  userAddress: string;
  actionType: 'create_order' | 'cancel_order' | 'trade' | 'settlement';
  
  // 关联数据
  marketId?: number;
  orderId?: number;
  tradeId?: number;
  
  // 详细信息
  details?: any;
  
  // 请求信息
  ipAddress?: string;
  userAgent?: string;
  
  // 时间
  createdAt: Date;
}

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 订单验证错误
 */
export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

/**
 * 余额不足错误
 */
export class InsufficientBalanceError extends Error {
  constructor(
    public required: string,
    public available: string
  ) {
    super(`余额不足: 需要 ${required}, 可用 ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

/**
 * 订单过期错误
 */
export class OrderExpiredError extends Error {
  constructor() {
    super('订单已过期');
    this.name = 'OrderExpiredError';
  }
}







