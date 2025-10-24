// 🚀 手动激活市场

import { NextRequest, NextResponse } from 'next/server';
import { activateMarketOnChain } from '@/lib/market-activation/blockchain-activator';
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
    
    // 2. 检查是否已激活
    if (market.blockchain_status === 'created') {
      return NextResponse.json(
        { error: '市场已激活' },
        { status: 400 }
      );
    }
    
    if (market.blockchain_status === 'creating') {
      return NextResponse.json(
        { error: '市场正在激活中' },
        { status: 400 }
      );
    }
    
    // 3. 激活市场
    console.log(`手动激活市场: ${market.title} (ID: ${marketId})`);
    
    const result = await activateMarketOnChain(marketId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ 市场激活成功',
        conditionId: result.conditionId,
        txHash: result.txHash
      });
    } else {
      return NextResponse.json(
        { error: result.error || '激活失败' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('手动激活失败:', error);
    return NextResponse.json(
      { error: error.message || '激活失败' },
      { status: 500 }
    );
  }
}



