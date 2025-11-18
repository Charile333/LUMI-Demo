// ✅ 检查用户是否已投票

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const topicId = parseInt(params.topicId);
    const userAddress = request.nextUrl.searchParams.get('userAddress');

    if (isNaN(topicId)) {
      return NextResponse.json(
        { success: false, error: '无效的话题ID' },
        { status: 400 }
      );
    }

    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress.trim())) {
      return NextResponse.json(
        { success: false, hasVoted: false },
        { status: 200 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existingVote } = await supabase
      .from('topic_votes')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_address', userAddress.trim().toLowerCase())
      .single();

    return NextResponse.json({
      success: true,
      hasVoted: !!existingVote
    });
    
  } catch (error: any) {
    console.error('检查投票状态失败:', error);
    return NextResponse.json(
      { success: false, hasVoted: false },
      { status: 200 }
    );
  }
}

