// 🗑️ 删除市场（管理员接口）

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    const supabase = getSupabaseAdmin();
    
    console.log(`🗑️ 开始删除市场 ${marketId}...`);
    
    // 1. 删除关联数据（按依赖顺序）
    
    // 删除订单
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('market_id', marketId);
    
    if (ordersError && ordersError.code !== 'PGRST116') { // PGRST116 = 没有记录
      console.warn('删除订单失败:', ordersError);
    } else {
      console.log('✅ 订单已删除');
    }
    
    // 删除用户兴趣
    const { error: interestsError } = await supabase
      .from('user_interests')
      .delete()
      .eq('market_id', marketId);
    
    if (interestsError && interestsError.code !== 'PGRST116') {
      console.warn('删除用户兴趣失败:', interestsError);
    } else {
      console.log('✅ 用户兴趣已删除');
    }
    
    // 删除市场状态
    const { error: stateError } = await supabase
      .from('market_states')
      .delete()
      .eq('market_id', marketId);
    
    if (stateError && stateError.code !== 'PGRST116') {
      console.warn('删除市场状态失败:', stateError);
    } else {
      console.log('✅ 市场状态已删除');
    }
    
    // 删除订单簿
    const { error: orderbookError } = await supabase
      .from('orderbooks')
      .delete()
      .eq('market_id', marketId);
    
    if (orderbookError && orderbookError.code !== 'PGRST116') {
      console.warn('删除订单簿失败:', orderbookError);
    } else {
      console.log('✅ 订单簿已删除');
    }
    
    // 删除活动日志（如果有）
    try {
      const { error: logsError } = await supabase
        .from('activity_logs')
        .delete()
        .eq('market_id', marketId);
      
      if (logsError && logsError.code !== 'PGRST116') {
        console.warn('删除活动日志失败:', logsError);
      } else {
        console.log('✅ 活动日志已删除');
      }
    } catch (e) {
      // 活动日志表可能不存在，忽略错误
    }
    
    // 2. 最后删除市场本身
    const { error: marketError } = await supabase
      .from('markets')
      .delete()
      .eq('id', marketId);
    
    if (marketError) {
      console.error('❌ 删除市场失败:', marketError);
      return NextResponse.json(
        { error: `删除市场失败: ${marketError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ 市场删除成功！');
    
    return NextResponse.json({
      success: true,
      message: '市场及所有关联数据已删除'
    });
    
  } catch (error: any) {
    console.error('❌ 删除失败:', error);
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    );
  }
}



































