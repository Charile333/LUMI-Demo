/**
 * 🚀 产品数据缓存系统
 * 专门为 Market/Product 数据优化的缓存层
 */

import { CacheManager, cacheKeys } from './cache-manager';
import { Market, CategoryType } from '@/lib/types/market';

interface ProductCacheConfig {
  // Polymarket API 缓存配置
  polymarketTTL: number;        // Polymarket 数据缓存时间
  polymarketMaxSize: number;    // 最大缓存条目
  
  // 产品列表缓存配置
  productListTTL: number;       // 产品列表缓存时间
  productListMaxSize: number;   // 最大列表缓存数
  
  // 产品详情缓存配置
  productDetailTTL: number;     // 详情页缓存时间
  productDetailMaxSize: number; // 最大详情缓存数
  
  // 批量查询缓存
  batchQueryTTL: number;        // 批量查询缓存时间
}

export class ProductCache {
  // 缓存实例
  private polymarketCache: CacheManager<any>;
  private productListCache: CacheManager<Market[]>;
  private productDetailCache: CacheManager<Market>;
  private batchCache: CacheManager<any>;
  
  // 配置
  private config: ProductCacheConfig;
  
  constructor(config?: Partial<ProductCacheConfig>) {
    this.config = {
      polymarketTTL: 5 * 60 * 1000,        // 5分钟
      polymarketMaxSize: 100,
      productListTTL: 2 * 60 * 1000,       // 2分钟
      productListMaxSize: 50,
      productDetailTTL: 30 * 1000,         // 30秒
      productDetailMaxSize: 200,
      batchQueryTTL: 10 * 1000,            // 10秒
      ...config
    };
    
    // 初始化缓存管理器
    this.polymarketCache = new CacheManager(
      this.config.polymarketMaxSize,
      this.config.polymarketTTL
    );
    
    this.productListCache = new CacheManager(
      this.config.productListMaxSize,
      this.config.productListTTL
    );
    
    this.productDetailCache = new CacheManager(
      this.config.productDetailMaxSize,
      this.config.productDetailTTL
    );
    
    this.batchCache = new CacheManager(
      100,
      this.config.batchQueryTTL
    );
    
    console.log('✅ ProductCache 初始化完成');
  }
  
  /**
   * 🚀 缓存 Polymarket API 数据
   */
  async getPolymarketData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return this.polymarketCache.getOrSet(
      `polymarket:${key}`,
      fetcher,
      ttl || this.config.polymarketTTL
    );
  }
  
  /**
   * 📋 缓存产品列表
   */
  getProductList(category: CategoryType, page: number = 1): Market[] | null {
    const key = `list:${category}:${page}`;
    return this.productListCache.get(key);
  }
  
  setProductList(category: CategoryType, page: number, data: Market[], ttl?: number): void {
    const key = `list:${category}:${page}`;
    this.productListCache.set(key, data, ttl);
    console.log(`✅ 缓存产品列表: ${category}, 第${page}页, ${data.length}条`);
  }
  
  /**
   * 📦 缓存单个产品详情
   */
  getProductDetail(marketId: number): Market | null {
    const key = `detail:${marketId}`;
    return this.productDetailCache.get(key);
  }
  
  setProductDetail(marketId: number, data: Market, ttl?: number): void {
    const key = `detail:${marketId}`;
    this.productDetailCache.set(key, data, ttl);
    console.log(`✅ 缓存产品详情: Market ${marketId}`);
  }
  
  /**
   * 🔄 批量缓存产品详情（用于预热）
   */
  batchSetProductDetails(markets: Market[], ttl?: number): void {
    markets.forEach(market => {
      if (market.id) {
        this.setProductDetail(market.id, market, ttl);
      }
    });
    console.log(`✅ 批量缓存 ${markets.length} 个产品详情`);
  }
  
  /**
   * 🎯 智能缓存：根据热度调整 TTL
   */
  setProductDetailWithHotness(
    marketId: number,
    data: Market,
    viewCount: number = 0
  ): void {
    // 根据浏览量调整缓存时间
    let ttl = this.config.productDetailTTL;
    
    if (viewCount > 1000) {
      ttl = 5 * 60 * 1000; // 热门产品：5分钟
    } else if (viewCount > 100) {
      ttl = 2 * 60 * 1000; // 中等热度：2分钟
    } else {
      ttl = 30 * 1000;     // 低热度：30秒
    }
    
    this.setProductDetail(marketId, data, ttl);
  }
  
  /**
   * 🔍 批量查询缓存
   */
  getBatchQuery(marketIds: number[]): any | null {
    const key = `batch:${marketIds.sort().join(',')}`;
    return this.batchCache.get(key);
  }
  
  setBatchQuery(marketIds: number[], data: any, ttl?: number): void {
    const key = `batch:${marketIds.sort().join(',')}`;
    this.batchCache.set(key, data, ttl);
  }
  
  /**
   * 🧹 清除特定分类的缓存
   */
  clearCategory(category: CategoryType): void {
    this.productListCache.deleteByPrefix(`list:${category}`);
    console.log(`🧹 已清除分类 ${category} 的缓存`);
  }
  
  /**
   * 🧹 清除单个产品缓存
   */
  clearProduct(marketId: number): void {
    this.productDetailCache.delete(`detail:${marketId}`);
    console.log(`🧹 已清除产品 ${marketId} 的缓存`);
  }
  
  /**
   * 🧹 清除所有缓存
   */
  clearAll(): void {
    this.polymarketCache.clear();
    this.productListCache.clear();
    this.productDetailCache.clear();
    this.batchCache.clear();
    console.log('🧹 已清除所有产品缓存');
  }
  
  /**
   * 📊 获取缓存统计
   */
  getStats() {
    return {
      polymarket: this.polymarketCache.getStats(),
      productList: this.productListCache.getStats(),
      productDetail: this.productDetailCache.getStats(),
      batch: this.batchCache.getStats(),
      total: {
        size: 
          this.polymarketCache.size() +
          this.productListCache.size() +
          this.productDetailCache.size() +
          this.batchCache.size(),
        memory: 
          this.polymarketCache.getStats().memoryUsage +
          this.productListCache.getStats().memoryUsage +
          this.productDetailCache.getStats().memoryUsage +
          this.batchCache.getStats().memoryUsage,
      }
    };
  }
  
  /**
   * 🔥 缓存预热：提前加载热门产品
   */
  async warmupCache(
    fetcher: () => Promise<Market[]>,
    category?: CategoryType
  ): Promise<void> {
    try {
      console.log(`🔥 开始预热${category ? ` ${category}` : ''}缓存...`);
      
      const markets = await fetcher();
      
      // 缓存列表
      if (category) {
        this.setProductList(category, 1, markets);
      }
      
      // 批量缓存详情
      this.batchSetProductDetails(markets);
      
      console.log(`✅ 缓存预热完成，加载了 ${markets.length} 个产品`);
    } catch (error) {
      console.error('❌ 缓存预热失败:', error);
    }
  }
  
  /**
   * 🔄 智能刷新：后台更新缓存
   */
  async refreshInBackground(
    key: string,
    fetcher: () => Promise<any>,
    onUpdate?: (data: any) => void
  ): Promise<void> {
    try {
      const newData = await fetcher();
      
      // 更新缓存（使用较长的TTL，因为是后台刷新的）
      this.polymarketCache.set(key, newData, this.config.polymarketTTL * 2);
      
      if (onUpdate) {
        onUpdate(newData);
      }
      
      console.log(`🔄 后台刷新缓存: ${key}`);
    } catch (error) {
      console.error(`❌ 后台刷新失败 ${key}:`, error);
    }
  }
}

/**
 * 全局产品缓存实例
 */
export const productCache = new ProductCache();

/**
 * 缓存装饰器：自动缓存函数结果
 */
export function Cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${propertyKey}:${JSON.stringify(args)}`;
      
      const cached = productCache.getBatchQuery([cacheKey as any]);
      if (cached) {
        console.log(`✅ 方法缓存命中: ${propertyKey}`);
        return cached;
      }
      
      const result = await originalMethod.apply(this, args);
      productCache.setBatchQuery([cacheKey as any], result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

export default productCache;



