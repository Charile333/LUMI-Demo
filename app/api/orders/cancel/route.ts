// ❌ 取消订单 API

import { NextRequest, NextResponse } from 'next/server';
import { matchingEngine } from '@/lib/clob/matching-engine';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userAddress } = await request.json();
    
    if (!orderId || !userAddress) {
      return NextResponse.json(
        { error: '缺少 orderId 或 userAddress 参数' },
        { status: 400 }
      );
    }
    
    // 取消订单
    const success = await matchingEngine.cancelOrder(orderId, userAddress);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '订单已取消'
      });
    } else {
      return NextResponse.json(
        { error: '订单不存在或无法取消' },
        { status: 404 }
      );
    }
    
  } catch (error: any) {
    console.error('取消订单失败:', error);
    return NextResponse.json(
      { error: error.message || '取消订单失败' },
      { status: 500 }
    );
  }
}
