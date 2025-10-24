// ⭐ 标记用户感兴趣

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateActivityScore } from '@/lib/market-activation/scoring';

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    const { userAddress } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json(
        { error: '需要提供用户地址' },
        { status: 400 }
      );
    }
    
    // 1. 检查是否已标记
    const existingResult = await db.query(
      `SELECT id FROM user_interests 
       WHERE market_id = $1 AND user_address = $2`,
      [marketId, userAddress]
    );
    
    if (existingResult.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: '您已标记过感兴趣'
      });
    }
    
    // 2. 获取当前市场信息
    const marketResult = await db.query(
      `SELECT interested_users FROM markets WHERE id = $1`,
      [marketId]
    );
    
    const market = marketResult.rows[0] || { interested_users: 0 };
    
    // 3. 插入兴趣记录
    await db.query(
      `INSERT INTO user_interests (market_id, user_address, created_at)
       VALUES ($1, $2, NOW())`,
      [marketId, userAddress]
    );
    
    // 4. 增加感兴趣用户数
    await db.query(
      `UPDATE markets 
       SET interested_users = interested_users + 1 
       WHERE id = $1`,
      [marketId]
    );
    
    // 5. 记录活动日志
    await db.query(
      `INSERT INTO activity_logs (user_address, action_type, market_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userAddress, 'interested', marketId]
    );
    
    // 6. 更新活跃度评分
    await updateActivityScore(marketId);
    
    // 7. 广播感兴趣更新（WebSocket）
    try {
      const { broadcastInterestedUpdate } = await import('@/lib/websocket/market-events');
      const threshold = 5;
      const newCount = (market.interested_users || 0) + 1;
      broadcastInterestedUpdate(marketId, {
        interestedUsers: newCount,
        threshold: threshold,
        progress: (newCount / threshold) * 100
      });
    } catch (error) {
      console.error('WebSocket 广播失败:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ 已标记感兴趣'
    });
    
  } catch (error: any) {
    console.error('标记感兴趣失败:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 取消感兴趣
export async function DELETE(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    const { userAddress } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json(
        { error: '需要提供用户地址' },
        { status: 400 }
      );
    }
    
    // 1. 删除兴趣记录
    const result = await db.query(
      `DELETE FROM user_interests 
       WHERE market_id = $1 AND user_address = $2
       RETURNING id`,
      [marketId, userAddress]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '未找到兴趣记录' },
        { status: 404 }
      );
    }
    
    // 2. 减少感兴趣用户数
    await db.query(
      `UPDATE markets 
       SET interested_users = GREATEST(interested_users - 1, 0)
       WHERE id = $1`,
      [marketId]
    );
    
    // 3. 更新活跃度评分
    await updateActivityScore(marketId);
    
    return NextResponse.json({
      success: true,
      message: '已取消感兴趣'
    });
    
  } catch (error: any) {
    console.error('取消感兴趣失败:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function updateActivityScore(marketId: number) {
  try {
    const marketResult = await db.query(
      `SELECT 
        id, views, interested_users, end_time, 
        created_at, priority_level
       FROM markets 
       WHERE id = $1`,
      [marketId]
    );
    
    if (marketResult.rows.length === 0) return;
    
    const market = marketResult.rows[0];
    const now = new Date();
    const endTime = market.end_time ? new Date(market.end_time) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const createdTime = new Date(market.created_at);
    
    const score = calculateActivityScore({
      views: market.views || 0,
      interestedUsers: market.interested_users || 0,
      timeToExpiry: Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      priorityLevel: market.priority_level || 'normal',
      createdDaysAgo: Math.ceil((now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    await db.query(
      `UPDATE markets SET activity_score = $1 WHERE id = $2`,
      [score, marketId]
    );
    
    console.log(`市场 ${marketId} 活跃度评分: ${score}`);
    
  } catch (error) {
    console.error('更新活跃度评分失败:', error);
  }
}



