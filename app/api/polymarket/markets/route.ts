import { NextRequest, NextResponse } from 'next/server';
import { fetchPolymarketMarkets } from '@/lib/polymarket/api';
import { transformPolymarketMarkets, filterMarketsByCategoryType } from '@/lib/polymarket/transformer';
import { CategoryType } from '@/lib/types/market';
import { productCache } from '@/lib/cache/product-cache';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * GET /api/polymarket/markets
 * 获取 Polymarket 的真实市场数据并转换为项目格式
 * 🚀 已优化：使用产品缓存加快响应速度
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryType = searchParams.get('categoryType') as CategoryType | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const active = searchParams.get('active') !== 'false';
    const skipCache = searchParams.get('skipCache') === 'true';

    console.log('📊 获取 Polymarket 数据，参数:', { categoryType, limit, active, skipCache });

    // 🚀 尝试从缓存获取（如果指定了分类）
    if (categoryType && !skipCache) {
      const cachedMarkets = productCache.getProductList(categoryType, 1);
      if (cachedMarkets && cachedMarkets.length > 0) {
        console.log(`✅ 从缓存返回 ${cachedMarkets.length} 条 ${categoryType} 市场数据`);
        return NextResponse.json({
          success: true,
          data: {
            markets: cachedMarkets.slice(0, limit),
            total: cachedMarkets.length,
          },
          source: 'polymarket',
          cached: true,
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          }
        });
      }
    }

    // 📡 从 Polymarket 获取原始数据
    console.log('📡 从 Polymarket API 获取数据...');
    const polymarkets = await fetchPolymarketMarkets({ 
      limit, 
      active,
      skipCache 
    });
    
    if (!polymarkets || polymarkets.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          markets: [],
          total: 0,
        },
        message: '未获取到市场数据',
        source: 'polymarket',
        cached: false
      });
    }

    // 🔄 转换为项目的 Market 格式
    let markets = transformPolymarketMarkets(polymarkets);
    
    // 🎯 按分类过滤
    if (categoryType) {
      markets = filterMarketsByCategoryType(markets, categoryType);
      
      // 💾 缓存分类数据
      if (markets.length > 0) {
        productCache.setProductList(categoryType, 1, markets);
        productCache.batchSetProductDetails(markets);
        console.log(`💾 已缓存 ${markets.length} 条 ${categoryType} 市场数据`);
      }
    }

    console.log(`✅ 成功转换 ${markets.length} 条市场数据`);

    return NextResponse.json({
      success: true,
      data: {
        markets,
        total: markets.length,
      },
      source: 'polymarket',
      cached: false,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    });

  } catch (error) {
    console.error('❌ Polymarket API 错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      data: {
        markets: [],
        total: 0,
      },
      cached: false
    }, { status: 500 });
  }
}

