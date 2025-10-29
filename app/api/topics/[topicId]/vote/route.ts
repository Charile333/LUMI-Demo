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

    // 获取用户信息
    const userAddress = request.headers.get('x-user-address') || `anonymous-${Date.now()}`;

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

    // 记录投票
    const { error: voteError } = await supabase
      .from('topic_votes')
      .insert({
        topic_id: topicId,
        user_address: userAddress
      });

    if (voteError) {
      console.error('记录投票失败:', voteError);
      throw voteError;
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

