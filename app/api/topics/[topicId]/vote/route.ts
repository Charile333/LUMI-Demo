import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // 获取用户信息（简化版）
    const userAddress = request.headers.get('x-user-address') || `anonymous-${Date.now()}`;

    // 检查用户是否已经投票
    const voteCheck = await db.query(
      `SELECT id FROM topic_votes WHERE topic_id = $1 AND user_address = $2`,
      [topicId, userAddress]
    );

    if (voteCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: '您已经投过票了' },
        { status: 400 }
      );
    }

    // 记录投票
    await db.query(
      `INSERT INTO topic_votes (topic_id, user_address, voted_at)
       VALUES ($1, $2, NOW())`,
      [topicId, userAddress]
    );

    // 增加话题投票数
    const result = await db.query(
      `UPDATE user_topics 
       SET votes = votes + 1 
       WHERE id = $1 
       RETURNING votes`,
      [topicId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '话题不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      votes: result.rows[0].votes
    });
  } catch (error) {
    console.error('投票失败:', error);
    return NextResponse.json(
      { success: false, error: '投票失败' },
      { status: 500 }
    );
  }
}

