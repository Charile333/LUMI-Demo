// 🗳️ 话题投票 API - 使用 Supabase 客户端（Vercel 优化版）

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const topicId = parseInt(params.topicId);

    if (isNaN(topicId)) {
      return NextResponse.json(
        { success: false, error: '无效的话题ID' },
        { status: 400 }
      );
    }

    // ✅ 获取用户地址（优先从 header，然后从 body）
    let userAddress: string | null = null;
    let requestBody: any = null;
    
    // 方法1: 从 header 获取
    userAddress = request.headers.get('x-user-address');
    
    // 方法2: 从请求体获取（如果没有从 header 获取到）
    if (!userAddress) {
      try {
        requestBody = await request.json();
        userAddress = requestBody?.userAddress || null;
      } catch (e) {
        // 请求体可能为空或已读取，继续
      }
    }
    
    // ✅ 如果没有用户地址，拒绝投票
    if (!userAddress || userAddress.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请连接钱包后投票' },
        { status: 401 }
      );
    }
    
    // ✅ 验证地址格式（简单的以太坊地址检查）
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress.trim())) {
      return NextResponse.json(
        { success: false, error: '无效的钱包地址' },
        { status: 400 }
      );
    }
    
    userAddress = userAddress.trim().toLowerCase(); // 统一转为小写
    const supabase = getSupabaseAdmin();

    // 检查用户是否已经投票
    const { data: existingVote } = await supabase
      .from('topic_votes')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_address', userAddress)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: '您已经投过票了' },
        { status: 400 }
      );
    }

    // ✅ 记录投票（使用 INSERT ... ON CONFLICT DO NOTHING 防止重复）
    const { data: voteData, error: voteError } = await supabase
      .from('topic_votes')
      .insert({
        topic_id: topicId,
        user_address: userAddress
      })
      .select();

    if (voteError) {
      console.error('记录投票失败:', voteError);
      console.error('错误代码:', voteError.code);
      console.error('错误消息:', voteError.message);
      
      // ✅ 处理唯一约束冲突（用户已投票）
      if (voteError.code === '23505' || voteError.message?.includes('duplicate key') || voteError.message?.includes('unique constraint')) {
        // 重新检查投票状态，确保数据一致性
        const { data: existingVoteCheck } = await supabase
          .from('topic_votes')
          .select('id')
          .eq('topic_id', topicId)
          .eq('user_address', userAddress)
          .single();
          
        if (existingVoteCheck) {
          // 获取当前投票数
          const { data: currentTopic } = await supabase
            .from('user_topics')
            .select('votes')
            .eq('id', topicId)
            .single();
            
          return NextResponse.json(
            { 
              success: false, 
              error: '您已经投过票了',
              votes: currentTopic?.votes || 0
            },
            { status: 400 }
          );
        }
      }
      
      throw voteError;
    }
    
    // ✅ 如果没有插入数据（已存在），返回错误
    if (!voteData || voteData.length === 0) {
      const { data: currentTopic } = await supabase
        .from('user_topics')
        .select('votes')
        .eq('id', topicId)
        .single();
        
      return NextResponse.json(
        { 
          success: false, 
          error: '您已经投过票了',
          votes: currentTopic?.votes || 0
        },
        { status: 400 }
      );
    }

    // 先获取当前投票数
    const { data: currentTopic } = await supabase
      .from('user_topics')
      .select('votes')
      .eq('id', topicId)
      .single();

    if (!currentTopic) {
      return NextResponse.json(
        { success: false, error: '话题不存在' },
        { status: 404 }
      );
    }

    // 更新投票数
    const { data: updatedTopic, error: updateError } = await supabase
      .from('user_topics')
      .update({ votes: currentTopic.votes + 1 })
      .eq('id', topicId)
      .select('votes')
      .single();

    if (updateError) {
      console.error('更新投票数失败:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      votes: updatedTopic.votes
    });
    
  } catch (error: any) {
    console.error('投票失败:', error);
    return NextResponse.json(
      { success: false, error: '投票失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}

