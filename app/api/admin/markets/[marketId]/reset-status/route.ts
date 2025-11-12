// 🔄 重置市场状态 API
// 用于重置激活失败的市场状态

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);
    
    // 1. 检查市场是否存在
    const marketResult = await db.query(
      `SELECT id, title, blockchain_status FROM markets WHERE id = $1`,
      [marketId]
    );
    
    if (marketResult.rows.length === 0) {
      return NextResponse.json(
        { error: '市场不存在' },
        { status: 404 }
      );
    }
    
    const market = marketResult.rows[0];
    
    // 2. 重置状态
    const { status } = await request.json().catch(() => ({ status: 'not_created' }));
    const newStatus = status || 'not_created';
    
    await db.query(
      `UPDATE markets 
       SET blockchain_status = $1, 
           condition_id = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [newStatus, marketId]
    );
    
    console.log(`✅ 市场 ${marketId} 状态已重置: ${market.blockchain_status} → ${newStatus}`);
    
    return NextResponse.json({
      success: true,
      message: `市场状态已重置为 ${newStatus}`,
      market: {
        id: marketId,
        title: market.title,
        oldStatus: market.blockchain_status,
        newStatus
      }
    });
    
  } catch (error: any) {
    console.error('重置状态失败:', error);
    return NextResponse.json(
      { error: error.message || '重置失败' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

