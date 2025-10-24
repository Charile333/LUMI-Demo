// 📝 创建订单 API（链下）

import { NextRequest, NextResponse } from 'next/server';
import { matchingEngine } from '@/lib/clob/matching-engine';
import { Order } from '@/lib/clob/signing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 构造订单对象
    const order: Order = {
      orderId: body.orderId,
      maker: body.maker,
      marketId: parseInt(body.marketId),
      outcome: parseInt(body.outcome),
      side: body.side,
      price: body.price,
      amount: body.amount,
      expiration: parseInt(body.expiration),
      nonce: parseInt(body.nonce),
      salt: body.salt,
      signature: body.signature
    };
    
    // 提交订单（自动匹配）
    const result = await matchingEngine.submitOrder(order);
    
    // 返回结果
    return NextResponse.json({
      success: true,
      order: {
        id: result.order.id,
        orderId: result.order.order_id,
        status: result.order.status,
        filledAmount: result.order.filled_amount,
        remainingAmount: result.remainingAmount
      },
      trades: result.trades.map(trade => ({
        id: trade.id,
        tradeId: trade.trade_id,
        price: trade.price,
        amount: trade.amount,
        side: trade.side,
        createdAt: trade.created_at
      })),
      message: result.trades.length > 0 
        ? `订单已部分/全部成交，成交 ${result.trades.length} 笔`
        : '订单已提交到订单簿'
    });
    
  } catch (error: any) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '创建订单失败' 
      },
      { status: 400 }
    );
  }
}
