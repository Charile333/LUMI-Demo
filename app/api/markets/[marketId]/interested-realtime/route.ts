/**
 * 市场感兴趣API - 使用Supabase实时更新
 * 当用户表达兴趣时，状态会自动实时推送到所有客户端
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);

    if (isNaN(marketId)) {
      return NextResponse.json(
        { success: false, error: '无效的市场ID' },
        { status: 400 }
      );
    }

    console.log(`📊 市场 ${marketId} 收到感兴趣请求`);

    // 1. 获取当前市场状态
    let currentState: any = null;
    
    const { data, error: fetchError } = await supabaseAdmin
      .from('market_states')
      .select('*')
      .eq('market_id', marketId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    currentState = data;

    // 如果市场状态不存在，先创建
    if (!currentState) {
      console.log(`📝 创建市场 ${marketId} 的初始状态`);
      
      const { data: newState, error: insertError } = await supabaseAdmin
        .from('market_states')
        .insert({
          market_id: marketId,
          status: 'pending',
          interested_count: 0,
          activation_threshold: 10
        })
        .select()
        .single();

      if (insertError) throw insertError;
      currentState = newState;
    }

    // 2. 增加感兴趣计数
    const newCount = (currentState.interested_count || 0) + 1;
    const threshold = currentState.activation_threshold || 10;
    const shouldActivate = newCount >= threshold;

    console.log(`📈 感兴趣人数: ${newCount}/${threshold}`);

    // 3. 更新市场状态（会自动触发实时推送！）
    const { error: updateError } = await supabaseAdmin
      .from('market_states')
      .update({
        interested_count: newCount,
        status: shouldActivate ? 'activating' : 'pending',
        message: shouldActivate 
          ? '🚀 正在激活市场...' 
          : `还需要 ${threshold - newCount} 人感兴趣`
      })
      .eq('market_id', marketId);

    if (updateError) throw updateError;

    console.log(`✅ 市场状态更新成功，实时推送已触发`);

    // 4. 如果达到阈值，启动激活流程
    if (shouldActivate && currentState.status !== 'active') {
      console.log(`🚀 市场 ${marketId} 达到激活阈值，开始激活流程`);
      
      // 异步激活市场（模拟区块链合约调用）
      setTimeout(async () => {
        try {
          // 这里可以调用智能合约进行实际激活
          // 模拟激活延迟3秒
          console.log(`⏳ 模拟市场激活延迟...`);
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // 更新为已激活状态
          const { error } = await supabaseAdmin
            .from('market_states')
            .update({
              status: 'active',
              message: '✅ 市场已激活！可以开始交易'
            })
            .eq('market_id', marketId);

          if (error) {
            console.error('❌ 激活市场失败:', error);
            
            // 更新为失败状态
            await supabaseAdmin
              .from('market_states')
              .update({
                status: 'failed',
                message: '❌ 激活失败，请联系管理员'
              })
              .eq('market_id', marketId);
          } else {
            console.log(`✅ 市场 ${marketId} 激活成功`);
          }
        } catch (err) {
          console.error('❌ 激活流程出错:', err);
        }
      }, 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        marketId,
        interestedCount: newCount,
        threshold,
        status: shouldActivate ? 'activating' : 'pending',
        message: shouldActivate 
          ? '市场正在激活中...' 
          : `还需要 ${threshold - newCount} 人感兴趣`
      },
      message: '感兴趣已记录'
    });

  } catch (error: any) {
    console.error('❌ 处理感兴趣请求失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '处理失败',
        details: error.details || error.hint
      },
      { status: 500 }
    );
  }
}

// 强制动态渲染
export const dynamic = 'force-dynamic';






