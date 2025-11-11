/**
 * 🚀 通用缓存管理器
 * 支持 TTL、LRU 策略、内存管理
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 60000) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0
    };
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL; // 默认 60 秒
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, ttl?: number): void {
    // 如果缓存满了，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now(),
      hits: 0
    });

    this.updateStats();
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // 更新命中次数
    entry.hits++;
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * 获取或设置（如果不存在则通过 factory 函数创建）
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    return result;
  }

  /**
   * 根据前缀删除缓存
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.updateStats();
    return count;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.updateStats();
  }

  /**
   * 清理过期条目
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.updateStats();
    return count;
  }

  /**
   * LRU 策略：删除最少使用的条目
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // 优先删除命中次数少的
      if (entry.hits < minHits || 
          (entry.hits === minHits && entry.createdAt < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.createdAt;
        minHits = entry.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    
    // 估算内存使用（简化版）
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; // 字符串大小
      memoryUsage += JSON.stringify(entry.data).length * 2; // 数据大小
    }
    
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 检查键是否存在且未过期
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

/**
 * 全局缓存实例
 */
export const globalCache = {
  markets: new CacheManager(500, 30000),      // 市场数据：30秒
  orderbooks: new CacheManager(500, 5000),    // 订单簿：5秒
  stats: new CacheManager(200, 10000),        // 统计数据：10秒
  prices: new CacheManager(300, 15000),       // 价格数据：15秒
  general: new CacheManager(1000, 60000),     // 通用缓存：60秒
};

/**
 * 自动清理过期缓存（每分钟）
 */
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(globalCache).forEach(cache => {
      const removed = cache.cleanup();
      if (removed > 0) {
        console.log(`🧹 清理了 ${removed} 个过期缓存条目`);
      }
    });
  }, 60000);
}

/**
 * 生成缓存键的辅助函数
 */
export const cacheKeys = {
  market: (id: number) => `market:${id}`,
  markets: (category?: string) => `markets:${category || 'all'}`,
  orderbook: (marketId: number) => `orderbook:${marketId}`,
  batchStats: (ids: number[]) => `batch-stats:${ids.sort().join(',')}`,
  price: (marketId: number) => `price:${marketId}`,
  marketsList: (category: string, page: number) => `markets-list:${category}:${page}`,
};

export default CacheManager;

