/**
 * 市场数据缓存服务
 */

import { Market, CategoryType } from '@/lib/types/market';

interface CacheEntry {
  data: Market[];
  timestamp: number;
  ttl: number;
}

class MarketCache {
  private cache: Map<string, CacheEntry> = new Map();
  
  /**
   * 生成缓存 key
   */
  private getKey(category: CategoryType, limit: number): string {
    return `${category}:${limit}`;
  }
  
  /**
   * 获取缓存
   */
  get(category: CategoryType, limit: number): Market[] | null {
    const key = this.getKey(category, limit);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`[Cache] 命中: ${key}`);
    return entry.data;
  }
  
  /**
   * 设置缓存
   */
  set(
    category: CategoryType,
    limit: number,
    data: Market[],
    ttl: number = 300  // 默认5分钟
  ): void {
    const key = this.getKey(category, limit);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`[Cache] 设置: ${key}, ${data.length} 条数据`);
  }
  
  /**
   * 清除缓存
   */
  clear(category?: CategoryType): void {
    if (category) {
      // 清除特定分类的所有缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${category}:`)) {
          this.cache.delete(key);
        }
      }
      console.log(`[Cache] 清除分类: ${category}`);
    } else {
      // 清除所有缓存
      this.cache.clear();
      console.log(`[Cache] 清除所有缓存`);
    }
  }
  
  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        count: entry.data.length,
        age: Math.round((Date.now() - entry.timestamp) / 1000),
        ttl: entry.ttl
      }))
    };
  }
}

export const marketCache = new MarketCache();

