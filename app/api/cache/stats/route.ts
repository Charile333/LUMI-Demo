import { NextRequest, NextResponse } from 'next/server';
import { globalCache } from '@/lib/cache/cache-manager';
import { productCache } from '@/lib/cache/product-cache';

/**
 * 获取缓存统计信息的 API 端点
 * GET /api/cache/stats
 * 🚀 已优化：包含产品缓存统计
 */
export async function GET(request: NextRequest) {
  try {
    // 获取各缓存统计
    const stats = {
      markets: globalCache.markets.getStats(),
      orderbooks: globalCache.orderbooks.getStats(),
      stats: globalCache.stats.getStats(),
      prices: globalCache.prices.getStats(),
      general: globalCache.general.getStats(),
    };
    
    // 获取产品缓存统计
    const productStats = productCache.getStats();
    
    // 计算总计（全局缓存）
    const globalTotals = {
      size: Object.values(stats).reduce((sum, s) => sum + s.size, 0),
      hits: Object.values(stats).reduce((sum, s) => sum + s.hits, 0),
      misses: Object.values(stats).reduce((sum, s) => sum + s.misses, 0),
      memoryUsage: Object.values(stats).reduce((sum, s) => sum + s.memoryUsage, 0),
    };
    
    // 计算产品缓存总计
    const productTotals = {
      size: productStats.total.size,
      hits: 
        productStats.polymarket.hits +
        productStats.productList.hits +
        productStats.productDetail.hits +
        productStats.batch.hits,
      misses:
        productStats.polymarket.misses +
        productStats.productList.misses +
        productStats.productDetail.misses +
        productStats.batch.misses,
      memoryUsage: productStats.total.memory,
    };
    
    // 综合总计
    const combinedTotals = {
      size: globalTotals.size + productTotals.size,
      hits: globalTotals.hits + productTotals.hits,
      misses: globalTotals.misses + productTotals.misses,
      memoryUsage: globalTotals.memoryUsage + productTotals.memoryUsage,
    };
    
    const overallHitRate = combinedTotals.hits / (combinedTotals.hits + combinedTotals.misses) || 0;
    const globalHitRate = globalTotals.hits / (globalTotals.hits + globalTotals.misses) || 0;
    const productHitRate = productTotals.hits / (productTotals.hits + productTotals.misses) || 0;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      
      // 全局缓存统计
      globalCaches: {
        stats,
        totals: {
          ...globalTotals,
          hitRate: globalHitRate,
          memoryUsageMB: (globalTotals.memoryUsage / 1024 / 1024).toFixed(2),
        }
      },
      
      // 产品缓存统计
      productCaches: {
        stats: {
          polymarket: {
            ...productStats.polymarket,
            hitRate: `${(productStats.polymarket.hitRate * 100).toFixed(2)}%`,
          },
          productList: {
            ...productStats.productList,
            hitRate: `${(productStats.productList.hitRate * 100).toFixed(2)}%`,
          },
          productDetail: {
            ...productStats.productDetail,
            hitRate: `${(productStats.productDetail.hitRate * 100).toFixed(2)}%`,
          },
          batch: {
            ...productStats.batch,
            hitRate: `${(productStats.batch.hitRate * 100).toFixed(2)}%`,
          },
        },
        totals: {
          ...productTotals,
          hitRate: productHitRate,
          memoryUsageMB: (productTotals.memoryUsage / 1024 / 1024).toFixed(2),
        }
      },
      
      // 综合统计
      summary: {
        totalCacheEntries: combinedTotals.size,
        totalMemoryUsageMB: (combinedTotals.memoryUsage / 1024 / 1024).toFixed(2),
        overallHitRate: `${(overallHitRate * 100).toFixed(2)}%`,
        totalRequests: combinedTotals.hits + combinedTotals.misses,
        cachedResponses: combinedTotals.hits,
        missedResponses: combinedTotals.misses,
        estimatedApiCallsSaved: combinedTotals.hits,
      },
      
      // 性能指标
      performance: {
        global: {
          hitRate: `${(globalHitRate * 100).toFixed(2)}%`,
          requests: globalTotals.hits + globalTotals.misses,
        },
        products: {
          hitRate: `${(productHitRate * 100).toFixed(2)}%`,
          requests: productTotals.hits + productTotals.misses,
        },
        overall: {
          hitRate: `${(overallHitRate * 100).toFixed(2)}%`,
          requests: combinedTotals.hits + combinedTotals.misses,
        }
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

