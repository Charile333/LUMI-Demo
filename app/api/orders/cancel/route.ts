// ❌ 取消订单 API

import { NextRequest, NextResponse } from 'next/server';
import { matchingEngine } from '@/lib/clob/matching-engine';
import { globalCache } from '@/lib/cache/cache-manager';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userAddress } = await request.json();
    
    if (!orderId || !userAddress) {
      return NextResponse.json(
        { error: '缺少 orderId 或 userAddress 参数' },
        { status: 400 }
      );
    }
    
    // 先获取订单信息（用于清除缓存）
    const { data: orderData } = await supabaseAdmin
      .from('orders')
      .select('market_id')
      .eq('id', orderId)
      .single();
    
    // 取消订单
    const success = await matchingEngine.cancelOrder(orderId, userAddress);
    
    if (success) {
      // 🚀 清除相关缓存
      if (orderData?.market_id) {
        globalCache.orderbooks.deleteByPrefix(`orderbook:${orderData.market_id}`);
        globalCache.markets.delete(`market:${orderData.market_id}`);
        globalCache.stats.deleteByPrefix('batch-stats:');
        console.log(`🧹 已清除市场 ${orderData.market_id} 的相关缓存（订单取消）`);
      }
      
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
