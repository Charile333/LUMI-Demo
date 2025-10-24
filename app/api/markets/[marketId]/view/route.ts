// 📊 记录市场浏览

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
    
    // 1. 增加浏览量
    await db.query(
      `UPDATE markets SET views = views + 1 WHERE id = $1`,
      [marketId]
    );
    
    // 2. 记录用户浏览行为
    if (userAddress) {
      await db.query(
        `INSERT INTO activity_logs (user_address, action_type, market_id, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [userAddress, 'view', marketId]
      );
    }
    
    // 3. 更新活跃度评分
    await updateActivityScore(marketId);
    
    return NextResponse.json({
      success: true,
      message: '浏览记录已保存'
    });
    
  } catch (error: any) {
    console.error('记录浏览失败:', error);
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



