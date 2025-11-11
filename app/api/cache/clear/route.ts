import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/cache/marketCache';
import { globalCache } from '@/lib/cache/cache-manager';
import { productCache } from '@/lib/cache/product-cache';

/**
 * 清除缓存的 API 端点
 * GET /api/cache/clear?category=sports-gaming&type=all
 * 
 * 参数：
 * - category: 特定分类（可选）
 * - type: markets|orderbooks|stats|prices|general|products|all（默认 all）
 * 
 * 🚀 已优化：支持清除产品缓存
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type') || 'all';
    
    let clearedCount = 0;
    const results: string[] = [];
    
    // 清除产品缓存
    if (type === 'all' || type === 'products') {
      productCache.clearAll();
      results.push('产品缓存');
      clearedCount++;
    }
    
    // 清除新缓存系统
    if (type === 'all' || type === 'markets') {
      globalCache.markets.clear();
      results.push('市场数据缓存');
      clearedCount++;
    }
    
    if (type === 'all' || type === 'orderbooks') {
      globalCache.orderbooks.clear();
      results.push('订单簿缓存');
      clearedCount++;
    }
    
    if (type === 'all' || type === 'stats') {
      globalCache.stats.clear();
      results.push('统计数据缓存');
      clearedCount++;
    }
    
    if (type === 'all' || type === 'prices') {
      globalCache.prices.clear();
      results.push('价格数据缓存');
      clearedCount++;
    }
    
    if (type === 'all' || type === 'general') {
      globalCache.general.clear();
      results.push('通用缓存');
      clearedCount++;
    }
    
    // 清除旧的 marketCache（向后兼容）
    if (category) {
      marketCache.clear(category as any);
      results.push(`${category} 分类的旧缓存`);
    } else if (type === 'all') {
      marketCache.clear();
      results.push('所有旧缓存');
    }
    
    console.log(`🧹 已清除缓存: ${results.join(', ')}`);
    
    return NextResponse.json({
      success: true,
      message: `已清除 ${results.join(', ')}`,
      clearedTypes: results,
      count: clearedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}










