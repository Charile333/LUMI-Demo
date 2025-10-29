// 📊 获取订单簿 API

import { NextRequest, NextResponse } from 'next/server';
import { matchingEngine } from '@/lib/clob/matching-engine';

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
    
    // 获取订单簿
    const orderBook = await matchingEngine.getOrderBook(
      parseInt(marketId),
      parseInt(outcome)
    );
    
    // 计算价差
    let spread = null;
    if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
      const bestBid = parseFloat(orderBook.bids[0].price);
      const bestAsk = parseFloat(orderBook.asks[0].price);
      spread = parseFloat((bestAsk - bestBid).toFixed(4));
    }
    
    return NextResponse.json({
      success: true,
      orderBook: {
        bids: orderBook.bids,
        asks: orderBook.asks,
        spread,
        updatedAt: Date.now()
      }
    });
    
  } catch (error: any) {
    console.error('获取订单簿失败:', error);
    
    // 检查是否是数据库连接错误
    if (error.message && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { 
          error: '数据库未配置',
          details: 'DATABASE_URL 环境变量未设置，请在 Vercel 配置中添加 PostgreSQL 连接字符串',
          helpUrl: 'https://github.com/your-repo/blob/main/VERCEL_环境变量配置指南.md'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || '获取订单簿失败' },
      { status: 500 }
    );
  }
}
