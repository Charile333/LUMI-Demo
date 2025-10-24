import { NextRequest, NextResponse } from 'next/server';
import { fetchPolymarketMarkets } from '@/lib/polymarket/api';
import { transformPolymarketMarkets, filterMarketsByCategoryType } from '@/lib/polymarket/transformer';
import { CategoryType } from '@/lib/types/market';

/**
 * GET /api/polymarket/markets
 * 获取 Polymarket 的真实市场数据并转换为项目格式
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryType = searchParams.get('categoryType') as CategoryType | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const active = searchParams.get('active') !== 'false';

    console.log('获取 Polymarket 数据，参数:', { categoryType, limit, active });

    // 从 Polymarket 获取原始数据
    const polymarkets = await fetchPolymarketMarkets({ limit, active });
    
    if (!polymarkets || polymarkets.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          markets: [],
          total: 0,
        },
        message: '未获取到市场数据',
        source: 'polymarket'
      });
    }

    // 转换为项目的 Market 格式
    let markets = transformPolymarketMarkets(polymarkets);
    
    // 按分类过滤
    if (categoryType) {
      markets = filterMarketsByCategoryType(markets, categoryType);
    }

    console.log(`成功转换 ${markets.length} 条市场数据`);

    return NextResponse.json({
      success: true,
      data: {
        markets,
        total: markets.length,
      },
      source: 'polymarket',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Polymarket API 错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      data: {
        markets: [],
        total: 0,
      }
    }, { status: 500 });
  }
}

