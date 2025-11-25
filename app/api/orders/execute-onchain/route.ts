/**
 * 链上执行订单 API
 * 在撮合成功后，准备链上执行的订单数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { convertToCTFOrder, calculateTokenId } from '@/lib/ctf-exchange/utils';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, matchedOrderId } = body;

    if (!orderId || !matchedOrderId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 1. 获取两个订单的详细信息
    const { data: order1, error: error1 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    const { data: order2, error: error2 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', matchedOrderId)
      .single();

    if (error1 || error2 || !order1 || !order2) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 2. 获取市场信息（需要 conditionId）
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .select('id, condition_id, question_id')
      .eq('id', order1.market_id)
      .single();

    if (marketError || !market || !market.condition_id) {
      return NextResponse.json(
        { success: false, error: '市场信息不完整，需要 condition_id' },
        { status: 400 }
      );
    }

    // 3. 确定哪个是 maker，哪个是 taker
    // 通常：先创建的订单是 maker，后创建的是 taker
    const makerOrder = order1.created_at < order2.created_at ? order1 : order2;
    const takerOrder = order1.created_at < order2.created_at ? order2 : order1;

    // 4. 计算成交数量（取较小值）
    const tradeAmount = Math.min(
      parseFloat(makerOrder.quantity) - parseFloat(makerOrder.filled_quantity || '0'),
      parseFloat(takerOrder.quantity) - parseFloat(takerOrder.filled_quantity || '0')
    );

    // 5. 确定 outcome（YES=1, NO=0）
    // 这里需要根据订单的 side 和 outcome 字段判断
    // 假设买单是买 YES，卖单是卖 YES
    const outcome = makerOrder.side === 'buy' ? 1 : 0;

    // 6. 转换为 CTF Exchange 订单格式
    const ctfOrder = convertToCTFOrder(
      {
        maker: makerOrder.user_address,
        marketId: makerOrder.market_id,
        outcome: outcome,
        side: makerOrder.side as 'buy' | 'sell',
        price: makerOrder.price.toString(),
        amount: tradeAmount.toString(),
        expiration: Math.floor(Date.now() / 1000) + 86400,
        nonce: Date.now(),
        salt: ethers.utils.hexlify(ethers.utils.randomBytes(32))
      },
      market.condition_id
    );

    // 7. 检查订单是否有签名（如果没有，需要前端签名）
    const needsSignature = !makerOrder.signature;

    // 8. 保存待执行的交易记录
    const { data: pendingTrade, error: tradeError } = await supabaseAdmin
      .from('pending_onchain_trades')
      .insert({
        order_id: orderId,
        matched_order_id: matchedOrderId,
        maker_address: makerOrder.user_address,
        taker_address: takerOrder.user_address,
        market_id: makerOrder.market_id,
        condition_id: market.condition_id,
        token_id: calculateTokenId(market.condition_id, outcome),
        amount: tradeAmount,
        price: makerOrder.price,
        status: needsSignature ? 'pending_signature' : 'ready',
        ctf_order_data: ctfOrder,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (tradeError) {
      console.error('保存待执行交易失败:', tradeError);
      // 如果表不存在，返回订单数据让前端处理
      return NextResponse.json({
        success: true,
        needsOnChainExecution: true,
        ctfOrder: {
          ...ctfOrder,
          salt: ctfOrder.salt.toString(),
          tokenId: ctfOrder.tokenId.toString(),
          makerAmount: ctfOrder.makerAmount.toString(),
          takerAmount: ctfOrder.takerAmount.toString(),
          expiration: ctfOrder.expiration.toString(),
          nonce: ctfOrder.nonce.toString(),
          feeRateBps: ctfOrder.feeRateBps.toString()
        },
        makerOrder: {
          id: makerOrder.id,
          address: makerOrder.user_address,
          needsSignature: needsSignature
        },
        tradeAmount: tradeAmount.toString(),
        message: '需要链上执行，请使用返回的订单数据调用 fillOrder'
      });
    }

    return NextResponse.json({
      success: true,
      pendingTradeId: pendingTrade.id,
      needsOnChainExecution: true,
      ctfOrder: {
        ...ctfOrder,
        salt: ctfOrder.salt.toString(),
        tokenId: ctfOrder.tokenId.toString(),
        makerAmount: ctfOrder.makerAmount.toString(),
        takerAmount: ctfOrder.takerAmount.toString(),
        expiration: ctfOrder.expiration.toString(),
        nonce: ctfOrder.nonce.toString(),
        feeRateBps: ctfOrder.feeRateBps.toString()
      },
      makerOrder: {
        id: makerOrder.id,
        address: makerOrder.user_address,
        needsSignature: needsSignature
      },
      tradeAmount: tradeAmount.toString(),
      message: '待执行交易已创建，请前端调用 fillOrder 执行'
    });

  } catch (error: any) {
    console.error('准备链上执行失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '准备链上执行失败'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

