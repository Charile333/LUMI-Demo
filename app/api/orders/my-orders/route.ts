// 📡 API: 获取我的订单（使用 Supabase REST API）
// 🚀 已优化：添加缓存层

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { tradingCache } from '@/lib/cache/trading-cache';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skipCache = searchParams.get('skipCache') === 'true';
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: '缺少 address 参数' },
        { status: 400 }
      );
    }
    
    console.log('[API] 获取用户订单:', { address, status, limit, skipCache });
    
    // 🚀 尝试从缓存获取
    if (!skipCache) {
      const cachedOrders = tradingCache.getUserOrders(
        address.toLowerCase(),
        status === 'all' ? undefined : status
      );
      
      if (cachedOrders) {
        console.log(`✅ 从缓存返回用户订单: ${address.slice(0, 10)}..., ${cachedOrders.length} 条`);
        return NextResponse.json({
          success: true,
          orders: cachedOrders,
          count: cachedOrders.length,
          cached: true
        }, {
          headers: {
            'Cache-Control': 'private, s-maxage=5, stale-while-revalidate=10',
          }
        });
      }
    }
    
    // 📡 从数据库查询
    console.log('📡 从数据库查询用户订单...');
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        markets:market_id (
          title,
          main_category
        )
      `)
      .eq('user_address', address.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // 状态筛选
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: orders, error } = await query;
    
    if (error) {
      console.error('[API] 查询订单失败:', error);
      throw error;
    }
    
    // 格式化数据
    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      order_id: order.order_id,
      market_id: order.market_id,
      question_id: order.question_id,
      user_address: order.user_address,
      side: order.side,
      outcome: order.outcome,
      price: order.price,
      quantity: order.quantity,
      amount: order.quantity, // 兼容字段
      filled_quantity: order.filled_quantity || 0,
      filled_amount: order.filled_quantity || 0, // 兼容字段
      status: order.status,
      signature: order.signature,
      salt: order.salt,
      nonce: order.nonce,
      expiration: order.expiration,
      created_at: order.created_at,
      updated_at: order.updated_at,
      market_title: order.markets?.title,
      market_category: order.markets?.main_category,
      trades: [] // 成交记录暂时为空，如需要可以单独查询
    }));
    
    // 💾 保存到缓存（10秒 TTL）
    tradingCache.setUserOrders(
      address.toLowerCase(),
      formattedOrders,
      status === 'all' ? undefined : status
    );
    
    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=5, stale-while-revalidate=10',
      }
    });
    
  } catch (error: any) {
    console.error('[API] 获取订单失败:', error);
    
    // 返回空列表而不是错误（降级方案）
    return NextResponse.json({
      success: true,
      orders: [],
      count: 0,
      warning: '数据库连接失败，返回空列表',
      cached: false
    });
  }
}




