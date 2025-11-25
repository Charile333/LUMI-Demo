// 📝 创建订单 API - 使用Supabase（Vercel兼容）
// 🚀 已优化：订单变更时清除相关缓存

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { globalCache, cacheKeys } from '@/lib/cache/cache-manager';
import { tradingCache } from '@/lib/cache/trading-cache';
import {
  convertToCTFOrder,
  type CTFOrder,
  serializeCTFOrder
} from '@/lib/ctf-exchange/utils';
import { ethers } from 'ethers';
import { CTF_CONFIG, ERC20_ABI, USDC_DECIMALS } from '@/lib/ctf/config';

/**
 * 准备链上执行数据
 */
async function prepareOnChainExecution(
  orderId: number,
  matchedOrderId: number,
  marketId: number
): Promise<any> {
  try {
    // 获取市场信息（需要 conditionId）
    const { data: market } = await supabaseAdmin
      .from('markets')
      .select('id, condition_id, question_id')
      .eq('id', marketId)
      .single();

    if (!market || !market.condition_id) {
      console.warn('市场缺少 condition_id，跳过链上执行');
      return null;
    }

    // 获取订单信息
    const { data: order1 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    const { data: order2 } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', matchedOrderId)
      .single();

    if (!order1 || !order2) return null;

    // 确定 maker 和 taker
    const makerOrder = order1.created_at < order2.created_at ? order1 : order2;
    const tradeAmount = Math.min(
      parseFloat(makerOrder.quantity) - parseFloat(makerOrder.filled_quantity || '0'),
      parseFloat(order1.id === makerOrder.id ? order2.quantity : order1.quantity) - 
      parseFloat((order1.id === makerOrder.id ? order2.filled_quantity : order1.filled_quantity) || '0')
    );

    // 确定 outcome（简化：买单=YES=1，卖单=NO=0）
    const outcome = makerOrder.side === 'buy' ? 1 : 0;

    // 使用存储的 CTF 订单数据（如果存在）
    let storedCtfOrder: any = makerOrder.ctf_order_data;
    if (storedCtfOrder) {
      try {
        if (typeof storedCtfOrder === 'string') {
          storedCtfOrder = JSON.parse(storedCtfOrder);
        }
      } catch {
        storedCtfOrder = null;
      }
    }

    // 如果没有存储的 CTF 订单数据，回退到根据订单信息生成
    if (!storedCtfOrder) {
      const fallbackOrder = convertToCTFOrder(
        {
          maker: makerOrder.user_address,
          marketId: makerOrder.market_id,
          outcome: outcome,
          side: makerOrder.side as 'buy' | 'sell',
          price: makerOrder.price.toString(),
          amount: makerOrder.quantity?.toString() || tradeAmount.toString(),
          expiration: makerOrder.expiration || Math.floor(Date.now() / 1000) + 86400,
          nonce: makerOrder.nonce || Date.now(),
          salt: makerOrder.salt || ethers.utils.hexlify(ethers.utils.randomBytes(32))
        },
        market.condition_id
      );
      storedCtfOrder = serializeCTFOrder(fallbackOrder);
    }

    // 计算填充数量（taker 填充金额）
    let fillAmount = storedCtfOrder.takerAmount;
    try {
      const makerAmountBN = ethers.BigNumber.from(storedCtfOrder.makerAmount);
      const takerAmountBN = ethers.BigNumber.from(storedCtfOrder.takerAmount);
      const tradeAmountBN = ethers.utils.parseEther(tradeAmount.toString());
      fillAmount = tradeAmountBN.mul(takerAmountBN).div(makerAmountBN).toString();
    } catch (error) {
      console.warn('计算 fillAmount 失败，使用默认值:', error);
    }

    const makerSignature = makerOrder.ctf_signature || null;

    return {
      needsOnChainExecution: true,
      ctfOrder: storedCtfOrder,
      makerOrder: {
        id: makerOrder.id,
        address: makerOrder.user_address,
        signature: makerSignature,
        needsSignature: !makerSignature
      },
      fillAmount,
      tradeAmount: tradeAmount.toString(),
      conditionId: market.condition_id
    };
  } catch (error) {
    console.error('准备链上执行数据失败:', error);
    return null;
  }
}

async function hasSufficientUsdcBalance(
  userAddress: string,
  requiredAmount: number
): Promise<boolean> {
  if (!requiredAmount || requiredAmount <= 0) {
    return true;
  }
  
  try {
    const rpcUrl =
      process.env.POLYGON_AMOY_RPC_URL ||
      process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL ||
      CTF_CONFIG.rpcUrl;
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const usdcContract = new ethers.Contract(
      CTF_CONFIG.contracts.usdc,
      ERC20_ABI,
      provider
    );
    const balance = await usdcContract.balanceOf(userAddress);
    const requiredUnits = ethers.utils.parseUnits(
      requiredAmount.toFixed(USDC_DECIMALS),
      USDC_DECIMALS
    );
    return balance.gte(requiredUnits);
  } catch (error) {
    console.error('USDC 余额校验失败:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 兼容两种参数格式
    const marketId = body.marketId || 1;
    const userAddress = body.maker || body.userAddress || '0x0';
    const side = body.side;
    const price = parseFloat(body.price);
    const quantity = parseFloat(body.amount || body.quantity || 0);
    const outcome = typeof body.outcome === 'number'
      ? body.outcome
      : side === 'buy'
        ? 1
        : 0;
    const orderIdValue = body.orderId || body.order_id || `order-${Date.now()}`;
    const questionId = body.questionId || body.question_id || null;
    const salt = body.salt ?? null;
    const nonce = body.nonce ?? null;
    const expiration = body.expiration ?? null;
    const ctfOrderPayload = body.ctfOrder || null;
    const ctfSignature = body.ctfSignature || null;
    const conditionIdFromBody = body.conditionId || null;
    const resolvedSalt = salt ?? ethers.utils.hexlify(ethers.utils.randomBytes(16));
    const resolvedNonce = nonce ?? Date.now();
    const resolvedExpiration =
      expiration ?? Math.floor(Date.now() / 1000) + 86400 * 7;

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

    // 0. 校验市场是否存在，避免外键错误
    const { data: marketRow, error: marketCheckError } = await supabaseAdmin
      .from('markets')
      .select('id, status')
      .eq('id', marketId)
      .maybeSingle();

    if (marketCheckError) {
      console.error('❌ 校验市场存在性失败:', marketCheckError);
      return NextResponse.json(
        { success: false, error: '市场校验失败，请稍后重试' },
        { status: 500 }
      );
    }

    if (!marketRow) {
      return NextResponse.json(
        { success: false, error: `市场不存在或未创建（id=${marketId}）` },
        { status: 400 }
      );
    }

    const finalConditionId = conditionIdFromBody || marketRow.condition_id || null;

    if (side === 'buy') {
      const requiredCollateral = price * quantity;
      const enoughBalance = await hasSufficientUsdcBalance(
        userAddress,
        requiredCollateral
      );
      if (!enoughBalance) {
        return NextResponse.json(
          {
            success: false,
            error: `USDC 余额不足，至少需要 ${requiredCollateral.toFixed(2)} USDC`
          },
          { status: 400 }
        );
      }
    }

    // 1. 创建订单记录（保存签名，如果提供）
    let orderCtfPayload = ctfOrderPayload;

    if (!orderCtfPayload && finalConditionId) {
      const fallbackOrder = convertToCTFOrder(
        {
          maker: userAddress,
          marketId,
          outcome,
          side,
          price: price.toString(),
          amount: quantity.toString(),
          expiration: resolvedExpiration,
          nonce: resolvedNonce,
          salt: resolvedSalt
        },
        finalConditionId
      );
      orderCtfPayload = serializeCTFOrder(fallbackOrder);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        market_id: marketId,
        user_address: userAddress,
        side: side,
        order_id: orderIdValue,
        question_id: questionId,
        outcome,
        price: price,
        quantity: quantity,
        status: 'open',
        signature: body.signature || null,
        ctf_signature: ctfSignature || null,
        salt: resolvedSalt,
        nonce: resolvedNonce,
        expiration: resolvedExpiration,
        condition_id: finalConditionId,
        ctf_order_data: orderCtfPayload ? JSON.stringify(orderCtfPayload) : null
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
    let matchedOrderId: number | null = null;
    let matchQty = 0;
    
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
        matchQty = Math.min(quantity, parseFloat(matchOrder.quantity) - parseFloat(matchOrder.filled_quantity || '0'));
        matchedOrderId = matchOrder.id;
        
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
        matchQty = Math.min(quantity, parseFloat(matchOrder.quantity) - parseFloat(matchOrder.filled_quantity || '0'));
        matchedOrderId = matchOrder.id;
        
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
    
    // 🚀 如果撮合成功，准备链上执行数据
    let onChainData: any = null;
    if (matched && matchedOrderId) {
      try {
        onChainData = await prepareOnChainExecution(order.id, matchedOrderId, marketId);
        if (onChainData) {
          console.log('📝 链上执行数据已准备');
        }
      } catch (onChainError) {
        console.warn('⚠️ 准备链上执行失败（非致命）:', onChainError);
        // 不影响链下撮合的成功
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
      // 计算总交易量（基于成交的 trades 表）
      const { data: trades } = await supabaseAdmin
        .from('trades')
        .select('amount, price')
        .eq('market_id', marketId);
      
      const totalVolume = trades?.reduce((sum, t) => {
        return sum + (parseFloat(t.amount) * parseFloat(t.price));
      }, 0) || 0;
      
      // 统计唯一参与者（订单创建者 + 交易参与者）
      const { data: orderUsers } = await supabaseAdmin
        .from('orders')
        .select('user_address')
        .eq('market_id', marketId);
      
      const { data: tradeUsers } = await supabaseAdmin
        .from('trades')
        .select('maker_address, taker_address')
        .eq('market_id', marketId);
      
      const allUsers = new Set<string>();
      orderUsers?.forEach(o => allUsers.add(o.user_address.toLowerCase()));
      tradeUsers?.forEach(t => {
        allUsers.add(t.maker_address.toLowerCase());
        allUsers.add(t.taker_address.toLowerCase());
      });
      
      const participants = allUsers.size;
      
      // 更新市场表
      const { error: updateError } = await supabaseAdmin
        .from('markets')
        .update({
          volume: totalVolume,
          participants: participants,
          updated_at: new Date().toISOString()
        })
        .eq('id', marketId);
      
      if (updateError) {
        console.error('❌ 更新市场数据失败:', updateError);
      } else {
        console.log('✅ 市场数据已更新:', { 
          marketId, 
          totalVolume: totalVolume.toFixed(2), 
          participants 
        });
      }
    } catch (error) {
      console.error('⚠️ 更新市场数据失败（非致命错误）:', error);
    }

    // 🚀 清除相关缓存（订单创建会影响订单簿和市场统计）
    globalCache.orderbooks.deleteByPrefix(cacheKeys.orderbook(marketId));
    globalCache.markets.delete(cacheKeys.market(marketId));
    globalCache.stats.deleteByPrefix('batch-stats:');
    
    // 🔄 清除交易相关缓存
    await tradingCache.onOrderChange({
      marketId,
      userAddress,
      outcome: body.outcome
    });
    
    console.log(`🧹 已清除市场 ${marketId} 和用户 ${userAddress.slice(0, 10)}... 的相关缓存`);

    // 返回兼容旧格式的结果
    const response: any = {
      success: true,
      order: {
        id: order.id,
        orderId: order.id.toString(),
        status: order.status,
        filledAmount: matched ? matchQty.toString() : '0',
        remainingAmount: matched ? (quantity - matchQty).toString() : quantity.toString()
      },
      trades: [],
      message: matched ? '订单已撮合' : '订单已提交到订单簿',
      matched: matched
    };

    // 如果撮合成功，添加链上执行数据
    if (matched && onChainData) {
      response.onChainExecution = onChainData;
      response.message += '，需要链上执行';
    }

    return NextResponse.json(response);

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
