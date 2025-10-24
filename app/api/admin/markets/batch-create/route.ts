// 📦 批量创建市场 API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { markets } = await request.json();
    
    if (!Array.isArray(markets) || markets.length === 0) {
      return NextResponse.json(
        { error: '请提供市场数组' },
        { status: 400 }
      );
    }
    
    const createdMarkets = [];
    
    // 使用事务批量插入
    await db.transaction(async (client) => {
      for (const market of markets) {
        const questionId = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(market.title + Date.now() + Math.random())
        );
        
        const result = await client.query(
          `INSERT INTO markets (
            question_id, title, description, image_url,
            main_category, sub_category, tags,
            status, blockchain_status, priority_level, reward_amount
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
          [
            questionId,
            market.title,
            market.description,
            market.imageUrl || null,
            market.mainCategory || 'emerging',
            market.subCategory || null,
            market.tags || [],
            'draft',
            'not_created',
            market.priorityLevel || 'recommended',
            market.rewardAmount || 10
          ]
        );
        
        createdMarkets.push(result.rows[0]);
      }
    });
    
    return NextResponse.json({
      success: true,
      count: createdMarkets.length,
      markets: createdMarkets,
      message: `✅ 成功创建 ${createdMarkets.length} 个市场\n` +
               `成本：$0\n` +
               `所有市场将在活跃后自动上链`
    });
    
  } catch (error: any) {
    console.error('批量创建失败:', error);
    return NextResponse.json(
      { error: error.message || '批量创建失败' },
      { status: 500 }
    );
  }
}

