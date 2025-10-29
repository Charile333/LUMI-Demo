import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 清理低活跃度话题的 API 端点
 * 
 * GET /api/topics/cleanup
 * 
 * 用于：
 * - Vercel Cron Job 触发
 * - 手动触发清理
 * 
 * 安全建议：添加认证 token
 */
export async function GET(request: NextRequest) {
  try {
    // 可选：验证请求来源（推荐在生产环境添加）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🧹 开始清理低活跃度话题...');

    const INACTIVE_DAYS = 3;
    const MIN_VOTES = 3;

    // 查询符合清理条件的话题
    const checkResult = await db.query(`
      SELECT 
        id, 
        title, 
        votes,
        created_at
      FROM user_topics
      WHERE 
        created_at < NOW() - INTERVAL '${INACTIVE_DAYS} days'
        AND votes < ${MIN_VOTES}
    `);

    const topicsToDelete = checkResult.rows;

    if (topicsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要清理的话题',
        deleted: 0,
        topics: []
      });
    }

    // 删除低活跃度话题
    const deleteResult = await db.query(`
      DELETE FROM user_topics
      WHERE 
        created_at < NOW() - INTERVAL '${INACTIVE_DAYS} days'
        AND votes < ${MIN_VOTES}
      RETURNING id, title, votes
    `);

    const deletedTopics = deleteResult.rows;

    // 获取清理后的统计
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_topics,
        SUM(votes) as total_votes
      FROM user_topics
    `);

    console.log(`✅ 已清理 ${deletedTopics.length} 个低活跃度话题`);

    return NextResponse.json({
      success: true,
      message: `清理完成，删除了 ${deletedTopics.length} 个话题`,
      deleted: deletedTopics.length,
      topics: deletedTopics,
      stats: {
        remainingTopics: stats.rows[0].total_topics,
        totalVotes: stats.rows[0].total_votes || 0
      }
    });

  } catch (error: any) {
    console.error('❌ 清理话题失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '清理失败',
        message: error.message
      },
      { status: 500 }
    );
  }
}

