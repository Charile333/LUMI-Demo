/**
 * 🚀 交易缓存系统
 * 专门为交易订单、订单簿、持仓等数据优化的缓存层
 */

import { CacheManager } from './cache-manager';

interface TradingCacheConfig {
  // 订单簿缓存配置
  orderbookTTL: number;        // 订单簿缓存时间（实时性要求高）
  orderbookMaxSize: number;    // 最大缓存条目
  
  // 用户订单缓存配置
  userOrdersTTL: number;       // 用户订单列表缓存时间
  userOrdersMaxSize: number;   // 最大缓存条目
  
  // 交易历史缓存
  tradeHistoryTTL: number;     // 交易历史缓存时间
  tradeHistoryMaxSize: number; // 最大缓存条目
  
  // 用户持仓缓存
  userPositionsTTL: number;    // 持仓缓存时间
  userPositionsMaxSize: number;// 最大缓存条目
}

export class TradingCache {
  // 缓存实例
  private orderbookCache: CacheManager<any>;
  private userOrdersCache: CacheManager<any[]>;
  private tradeHistoryCache: CacheManager<any[]>;
  private userPositionsCache: CacheManager<any>;
  
  // 配置
  private config: TradingCacheConfig;
  
  constructor(config?: Partial<TradingCacheConfig>) {
    this.config = {
      orderbookTTL: 3 * 1000,              // 3秒（订单簿实时性高）
      orderbookMaxSize: 100,
      userOrdersTTL: 10 * 1000,            // 10秒
      userOrdersMaxSize: 200,
      tradeHistoryTTL: 30 * 1000,          // 30秒
      tradeHistoryMaxSize: 100,
      userPositionsTTL: 15 * 1000,         // 15秒
      userPositionsMaxSize: 500,
      ...config
    };
    
    // 初始化缓存管理器
    this.orderbookCache = new CacheManager(
      this.config.orderbookMaxSize,
      this.config.orderbookTTL
    );
    
    this.userOrdersCache = new CacheManager(
      this.config.userOrdersMaxSize,
      this.config.userOrdersTTL
    );
    
    this.tradeHistoryCache = new CacheManager(
      this.config.tradeHistoryMaxSize,
      this.config.tradeHistoryTTL
    );
    
    this.userPositionsCache = new CacheManager(
      this.config.userPositionsMaxSize,
      this.config.userPositionsTTL
    );
    
    console.log('✅ TradingCache 初始化完成');
  }
  
  /**
   * 📊 缓存订单簿数据
   */
  getOrderbook(marketId: number, outcome?: number): any | null {
    const key = `orderbook:${marketId}${outcome !== undefined ? `:${outcome}` : ''}`;
    return this.orderbookCache.get(key);
  }
  
  setOrderbook(marketId: number, data: any, outcome?: number, ttl?: number): void {
    const key = `orderbook:${marketId}${outcome !== undefined ? `:${outcome}` : ''}`;
    this.orderbookCache.set(key, data, ttl);
    console.log(`✅ 缓存订单簿: Market ${marketId}${outcome !== undefined ? ` Outcome ${outcome}` : ''}`);
  }
  
  /**
   * 📋 缓存用户订单列表
   */
  getUserOrders(userAddress: string, status?: string): any[] | null {
    const key = `user-orders:${userAddress}${status ? `:${status}` : ''}`;
    return this.userOrdersCache.get(key);
  }
  
  setUserOrders(userAddress: string, orders: any[], status?: string, ttl?: number): void {
    const key = `user-orders:${userAddress}${status ? `:${status}` : ''}`;
    this.userOrdersCache.set(key, orders, ttl);
    console.log(`✅ 缓存用户订单: ${userAddress}, ${orders.length} 条`);
  }
  
  /**
   * 🔄 清除用户订单缓存（订单变更时）
   */
  clearUserOrders(userAddress: string): void {
    this.userOrdersCache.deleteByPrefix(`user-orders:${userAddress}`);
    console.log(`🧹 已清除用户 ${userAddress} 的订单缓存`);
  }
  
  /**
   * 📈 缓存交易历史
   */
  getTradeHistory(marketId: number, limit?: number): any[] | null {
    const key = `trade-history:${marketId}:${limit || 50}`;
    return this.tradeHistoryCache.get(key);
  }
  
  setTradeHistory(marketId: number, trades: any[], limit?: number, ttl?: number): void {
    const key = `trade-history:${marketId}:${limit || 50}`;
    this.tradeHistoryCache.set(key, trades, ttl);
    console.log(`✅ 缓存交易历史: Market ${marketId}, ${trades.length} 条`);
  }
  
  /**
   * 💼 缓存用户持仓
   */
  getUserPositions(userAddress: string, marketId?: number): any | null {
    const key = marketId 
      ? `positions:${userAddress}:${marketId}`
      : `positions:${userAddress}:all`;
    return this.userPositionsCache.get(key);
  }
  
  setUserPositions(userAddress: string, positions: any, marketId?: number, ttl?: number): void {
    const key = marketId 
      ? `positions:${userAddress}:${marketId}`
      : `positions:${userAddress}:all`;
    this.userPositionsCache.set(key, positions, ttl);
    console.log(`✅ 缓存用户持仓: ${userAddress}${marketId ? ` Market ${marketId}` : ''}`);
  }
  
  /**
   * 🔄 清除用户持仓缓存（交易完成时）
   */
  clearUserPositions(userAddress: string, marketId?: number): void {
    if (marketId) {
      this.userPositionsCache.delete(`positions:${userAddress}:${marketId}`);
    } else {
      this.userPositionsCache.deleteByPrefix(`positions:${userAddress}`);
    }
    console.log(`🧹 已清除用户 ${userAddress} 的持仓缓存`);
  }
  
  /**
   * 🧹 清除订单簿缓存（订单变更时）
   */
  clearOrderbook(marketId: number, outcome?: number): void {
    if (outcome !== undefined) {
      this.orderbookCache.delete(`orderbook:${marketId}:${outcome}`);
    } else {
      this.orderbookCache.deleteByPrefix(`orderbook:${marketId}`);
    }
    console.log(`🧹 已清除 Market ${marketId} 的订单簿缓存`);
  }
  
  /**
   * 🧹 清除交易历史缓存
   */
  clearTradeHistory(marketId: number): void {
    this.tradeHistoryCache.deleteByPrefix(`trade-history:${marketId}`);
    console.log(`🧹 已清除 Market ${marketId} 的交易历史缓存`);
  }
  
  /**
   * 🧹 清除所有缓存
   */
  clearAll(): void {
    this.orderbookCache.clear();
    this.userOrdersCache.clear();
    this.tradeHistoryCache.clear();
    this.userPositionsCache.clear();
    console.log('🧹 已清除所有交易缓存');
  }
  
  /**
   * 📊 获取缓存统计
   */
  getStats() {
    return {
      orderbook: this.orderbookCache.getStats(),
      userOrders: this.userOrdersCache.getStats(),
      tradeHistory: this.tradeHistoryCache.getStats(),
      userPositions: this.userPositionsCache.getStats(),
      total: {
        size: 
          this.orderbookCache.size() +
          this.userOrdersCache.size() +
          this.tradeHistoryCache.size() +
          this.userPositionsCache.size(),
        memory: 
          this.orderbookCache.getStats().memoryUsage +
          this.userOrdersCache.getStats().memoryUsage +
          this.tradeHistoryCache.getStats().memoryUsage +
          this.userPositionsCache.getStats().memoryUsage,
      }
    };
  }
  
  /**
   * 🔄 订单变更后的缓存更新
   * 当创建、取消或成交订单时调用
   */
  async onOrderChange(params: {
    marketId: number;
    userAddress: string;
    outcome?: number;
  }): Promise<void> {
    const { marketId, userAddress, outcome } = params;
    
    // 清除相关缓存
    this.clearOrderbook(marketId, outcome);
    this.clearUserOrders(userAddress);
    this.clearUserPositions(userAddress, marketId);
    this.clearTradeHistory(marketId);
    
    console.log(`🔄 订单变更，已清除相关缓存: Market ${marketId}, User ${userAddress.slice(0, 10)}...`);
  }
  
  /**
   * 🎯 智能缓存：根据市场活跃度调整 TTL
   */
  setOrderbookWithActivity(
    marketId: number,
    data: any,
    tradeVolume24h: number = 0,
    outcome?: number
  ): void {
    // 根据24小时交易量调整缓存时间
    let ttl = this.config.orderbookTTL;
    
    if (tradeVolume24h > 100000) {
      ttl = 1 * 1000;  // 高活跃度：1秒
    } else if (tradeVolume24h > 10000) {
      ttl = 3 * 1000;  // 中等活跃度：3秒
    } else {
      ttl = 10 * 1000; // 低活跃度：10秒
    }
    
    this.setOrderbook(marketId, data, outcome, ttl);
  }
}

/**
 * 全局交易缓存实例
 */
export const tradingCache = new TradingCache();

/**
 * 缓存键生成辅助函数
 */
export const tradingCacheKeys = {
  orderbook: (marketId: number, outcome?: number) => 
    `orderbook:${marketId}${outcome !== undefined ? `:${outcome}` : ''}`,
  userOrders: (userAddress: string, status?: string) => 
    `user-orders:${userAddress}${status ? `:${status}` : ''}`,
  tradeHistory: (marketId: number, limit: number = 50) => 
    `trade-history:${marketId}:${limit}`,
  userPositions: (userAddress: string, marketId?: number) => 
    marketId ? `positions:${userAddress}:${marketId}` : `positions:${userAddress}:all`,
};

export default tradingCache;
















