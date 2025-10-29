/**
 * 创建订单API - 使用Supabase实时更新
 * 替代原有的WebSocket推送，订单簿会自动实时更新
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, userAddress, side, price, quantity } = body;

    // 验证输入
    if (!marketId || !userAddress || !side || !price || !quantity) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (side !== 'buy' && side !== 'sell') {
      return NextResponse.json(
        { success: false, error: 'side必须是buy或sell' },
        { status: 400 }
      );
    }

    if (price <= 0 || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: '价格和数量必须大于0' },
        { status: 400 }
      );
    }

    console.log('📝 创建订单:', { marketId, userAddress, side, price, quantity });

    // 1. 创建订单记录
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        market_id: marketId,
        user_address: userAddress,
        side: side,
        price: price,
        quantity: quantity,
        status: 'open'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ 创建订单失败:', orderError);
      throw orderError;
    }

    console.log('✅ 订单创建成功:', order);

    // 2. 重新计算订单簿
    const { data: allOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('market_id', marketId)
      .eq('status', 'open');

    if (fetchError) {
      console.error('❌ 获取订单失败:', fetchError);
      throw fetchError;
    }

    // 聚合买单和卖单
    const bidsMap = new Map<number, number>();
    const asksMap = new Map<number, number>();

    allOrders?.forEach(order => {
      const price = parseFloat(order.price);
      const qty = parseFloat(order.quantity) - parseFloat(order.filled_quantity || '0');

      if (order.side === 'buy') {
        bidsMap.set(price, (bidsMap.get(price) || 0) + qty);
      } else {
        asksMap.set(price, (asksMap.get(price) || 0) + qty);
      }
    });

    // 转换为数组并排序
    const bids = Array.from(bidsMap.entries())
      .map(([price, quantity]) => ({
        price,
        quantity,
        total: price * quantity
      }))
      .sort((a, b) => b.price - a.price) // 买单按价格降序
      .slice(0, 20); // 只保留前20档

    const asks = Array.from(asksMap.entries())
      .map(([price, quantity]) => ({
        price,
        quantity,
        total: price * quantity
      }))
      .sort((a, b) => a.price - b.price) // 卖单按价格升序
      .slice(0, 20);

    console.log('📊 计算订单簿:', {
      bidsCount: bids.length,
      asksCount: asks.length,
      topBid: bids[0]?.price,
      topAsk: asks[0]?.price
    });

    // 3. 更新订单簿（这会自动触发Supabase Realtime推送！）
    const { error: updateError } = await supabaseAdmin
      .from('orderbooks')
      .upsert({
        market_id: marketId,
        bids: bids,
        asks: asks,
        last_price: price,
      }, {
        onConflict: 'market_id'
      });

    if (updateError) {
      console.error('❌ 更新订单簿失败:', updateError);
      throw updateError;
    }

    console.log('✅ 订单簿更新成功，实时推送已自动触发');

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          marketId: order.market_id,
          userAddress: order.user_address,
          side: order.side,
          price: parseFloat(order.price),
          quantity: parseFloat(order.quantity),
          status: order.status,
          createdAt: order.created_at
        },
        orderBook: {
          bids,
          asks,
          lastPrice: price
        }
      },
      message: '订单创建成功'
    });

  } catch (error: any) {
    console.error('❌ 创建订单失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '创建订单失败',
        details: error.details || error.hint 
      },
      { status: 500 }
    );
  }
}

// 强制动态渲染
export const dynamic = 'force-dynamic';
















