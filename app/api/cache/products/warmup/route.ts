import { NextRequest, NextResponse } from 'next/server';
import { productCache } from '@/lib/cache/product-cache';
import { fetchPolymarketMarkets } from '@/lib/polymarket/api';
import { transformPolymarketMarkets } from '@/lib/polymarket/transform';
import { CategoryType } from '@/lib/types/market';

/**
 * 缓存预热 API
 * POST /api/cache/products/warmup
 * 
 * 提前加载热门产品到缓存中
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      categories = ['sports-gaming', 'emerging', 'entertainment'],
      limit = 20 
    } = body;
    
    console.log('🔥 开始缓存预热...');
    const results: any[] = [];
    
    // 并行预热多个分类
    const warmupPromises = categories.map(async (category: string) => {
      try {
        // 获取数据
        const polymarkets = await fetchPolymarketMarkets({ 
          limit, 
          active: true,
          skipCache: true // 预热时获取最新数据
        });
        
        // 转换为项目格式
        const markets = transformPolymarketMarkets(polymarkets);
        
        // 缓存列表
        productCache.setProductList(category as CategoryType, 1, markets);
        
        // 批量缓存详情
        productCache.batchSetProductDetails(markets);
        
        return {
          category,
          count: markets.length,
          success: true
        };
      } catch (error) {
        console.error(`❌ 预热分类 ${category} 失败:`, error);
        return {
          category,
          count: 0,
          success: false,
          error: String(error)
        };
      }
    });
    
    const warmupResults = await Promise.all(warmupPromises);
    
    const successCount = warmupResults.filter(r => r.success).length;
    const totalProducts = warmupResults.reduce((sum, r) => sum + r.count, 0);
    
    console.log(`✅ 缓存预热完成: ${successCount}/${categories.length} 个分类，共 ${totalProducts} 个产品`);
    
    return NextResponse.json({
      success: true,
      message: `成功预热 ${successCount} 个分类`,
      results: warmupResults,
      summary: {
        categoriesWarmed: successCount,
        totalCategories: categories.length,
        totalProducts,
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 缓存预热失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: '缓存预热失败'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取预热状态
 * GET /api/cache/products/warmup
 */
export async function GET(request: NextRequest) {
  try {
    const stats = productCache.getStats();
    
    return NextResponse.json({
      success: true,
      isWarmed: stats.total.size > 0,
      cacheStatus: {
        totalEntries: stats.total.size,
        memoryUsage: `${(stats.total.memory / 1024 / 1024).toFixed(2)} MB`,
      },
      recommendation: stats.total.size === 0 
        ? '建议执行 POST /api/cache/products/warmup 进行缓存预热'
        : '缓存已预热，运行正常',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}





