// 📊 获取订单簿 API

import { NextRequest, NextResponse } from 'next/server';
import { matchingEngine } from '@/lib/clob/matching-engine';
import { globalCache, cacheKeys } from '@/lib/cache/cache-manager';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');
    const outcome = searchParams.get('outcome');
    
    if (!marketId || !outcome) {
      return NextResponse.json(
        { error: '缺少 marketId 或 outcome 参数' },
        { status: 400 }
      );
    }
    
    const marketIdNum = parseInt(marketId);
    const cacheKey = `${cacheKeys.orderbook(marketIdNum)}:${outcome}`;
    
    // 🚀 检查缓存（订单簿使用较短的缓存时间：5秒）
    const cachedData = globalCache.orderbooks.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        success: true,
        orderBook: {
          ...cachedData,
          updatedAt: Date.now()
        },
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
        }
      });
    }
    
    // 获取订单簿（如果数据库连接失败，会返回空订单簿）
    const orderBook = await matchingEngine.getOrderBook(
      marketIdNum,
      parseInt(outcome)
    );
    
    // 计算价差
    let spread = null;
    if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
      const bestBid = parseFloat(orderBook.bids[0].price);
      const bestAsk = parseFloat(orderBook.asks[0].price);
      spread = parseFloat((bestAsk - bestBid).toFixed(4));
    }
    
    const result = {
      bids: orderBook.bids,
      asks: orderBook.asks,
      spread
    };
    
    // 🚀 保存到缓存（5秒）
    globalCache.orderbooks.set(cacheKey, result, 5000);
    
    return NextResponse.json({
      success: true,
      orderBook: {
        ...result,
        updatedAt: Date.now()
      },
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
      }
    });
    
  } catch (error: any) {
    console.error('获取订单簿失败:', error);
    
    // 即使出错也返回空订单簿，避免前端500错误
    return NextResponse.json({
      success: true,
      orderBook: {
        bids: [],
        asks: [],
        spread: null,
        updatedAt: Date.now()
      },
      warning: '数据库连接失败，返回空订单簿'
    });
  }
}
