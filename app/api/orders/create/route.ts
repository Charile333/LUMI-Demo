// 📝 创建订单 API - 使用Supabase（Vercel兼容）

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 兼容两种参数格式
    const marketId = body.marketId || 1;
    const userAddress = body.maker || body.userAddress || '0x0';
    const side = body.side;
    const price = parseFloat(body.price);
    const quantity = parseFloat(body.amount || body.quantity || 0);

    // 验证输入
    if (!side || !price || !quantity) {
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

    // 2. 简单撮合逻辑：查找对手盘
    let matched = false;
    if (side === 'buy') {
      // 买单：查找价格<=买入价的卖单
      const { data: matchingSells } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('market_id', marketId)
        .eq('side', 'sell')
        .eq('status', 'open')
        .lte('price', price)
        .order('price', { ascending: true })
        .limit(1);
      
      if (matchingSells && matchingSells.length > 0) {
        const matchOrder = matchingSells[0];
        const matchQty = Math.min(quantity, parseFloat(matchOrder.quantity) - parseFloat(matchOrder.filled_quantity || '0'));
        
        // 更新双方订单
        await supabaseAdmin
          .from('orders')
          .update({
            filled_quantity: parseFloat(matchOrder.filled_quantity || '0') + matchQty,
            status: (parseFloat(matchOrder.filled_quantity || '0') + matchQty >= parseFloat(matchOrder.quantity)) ? 'filled' : 'partial'
          })
          .eq('id', matchOrder.id);
        
        await supabaseAdmin
          .from('orders')
          .update({
            filled_quantity: matchQty,
            status: matchQty >= quantity ? 'filled' : 'partial'
          })
          .eq('id', order.id);
        
        matched = true;
        console.log('✅ 订单已撮合:', matchQty, '@', matchOrder.price);
      }
    } else {
      // 卖单：查找价格>=卖出价的买单
      const { data: matchingBuys } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('market_id', marketId)
        .eq('side', 'buy')
        .eq('status', 'open')
        .gte('price', price)
        .order('price', { ascending: false })
        .limit(1);
      
      if (matchingBuys && matchingBuys.length > 0) {
        const matchOrder = matchingBuys[0];
        const matchQty = Math.min(quantity, parseFloat(matchOrder.quantity) - parseFloat(matchOrder.filled_quantity || '0'));
        
        // 更新双方订单
        await supabaseAdmin
          .from('orders')
          .update({
            filled_quantity: parseFloat(matchOrder.filled_quantity || '0') + matchQty,
            status: (parseFloat(matchOrder.filled_quantity || '0') + matchQty >= parseFloat(matchOrder.quantity)) ? 'filled' : 'partial'
          })
          .eq('id', matchOrder.id);
        
        await supabaseAdmin
          .from('orders')
          .update({
            filled_quantity: matchQty,
            status: matchQty >= quantity ? 'filled' : 'partial'
          })
          .eq('id', order.id);
        
        matched = true;
        console.log('✅ 订单已撮合:', matchQty, '@', matchOrder.price);
      }
    }

    // 3. 重新计算订单簿
    const { data: allOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('market_id', marketId)
      .in('status', ['open', 'partial']);

    if (fetchError) {
      console.error('❌ 获取订单失败:', fetchError);
      throw fetchError;
    }

    // 聚合买单和卖单
    const bidsMap = new Map<number, number>();
    const asksMap = new Map<number, number>();

    allOrders?.forEach(order => {
      const orderPrice = parseFloat(order.price);
      const qty = parseFloat(order.quantity) - parseFloat(order.filled_quantity || '0');

      if (qty > 0) {
        if (order.side === 'buy') {
          bidsMap.set(orderPrice, (bidsMap.get(orderPrice) || 0) + qty);
        } else {
          asksMap.set(orderPrice, (asksMap.get(orderPrice) || 0) + qty);
        }
      }
    });

    // 转换为数组并排序
    const bids = Array.from(bidsMap.entries())
      .map(([p, quantity]) => ({
        price: p,
        quantity,
        total: p * quantity
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 20);

    const asks = Array.from(asksMap.entries())
      .map(([p, quantity]) => ({
        price: p,
        quantity,
        total: p * quantity
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 20);

    // 4. 更新订单簿
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

    console.log('✅ 订单簿更新成功');

    // 5. 更新市场数据（交易量和参与者）
    try {
      // 计算总交易量
      const { data: marketOrders } = await supabaseAdmin
        .from('orders')
        .select('quantity, price')
        .eq('market_id', marketId);
      
      const totalVolume = marketOrders?.reduce((sum, o) => {
        return sum + (parseFloat(o.quantity) * parseFloat(o.price));
      }, 0) || 0;
      
      // 统计唯一参与者
      const { data: uniqueUsers } = await supabaseAdmin
        .from('orders')
        .select('user_address')
        .eq('market_id', marketId);
      
      const participants = new Set(uniqueUsers?.map(o => o.user_address)).size;
      
      // 更新市场表
      await supabaseAdmin
        .from('markets')
        .update({
          volume: totalVolume.toFixed(2),
          participants: participants
        })
        .eq('id', marketId);
      
      console.log('✅ 市场数据已更新:', { totalVolume, participants });
    } catch (error) {
      console.error('⚠️ 更新市场数据失败（非致命错误）:', error);
    }

    // 返回兼容旧格式的结果
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.id.toString(),
        status: order.status,
        filledAmount: '0',
        remainingAmount: quantity.toString()
      },
      trades: [],
      message: '订单已提交到订单簿'
    });

  } catch (error: any) {
    console.error('❌ 创建订单失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '创建订单失败',
        details: error.details || error.hint 
      },
      { status: 400 }
    );
  }
}

// 强制动态渲染
export const dynamic = 'force-dynamic';
