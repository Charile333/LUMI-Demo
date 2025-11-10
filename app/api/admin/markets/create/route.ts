// 📝 管理员创建市场 API（数据库）

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: '标题和描述不能为空' },
        { status: 400 }
      );
    }
    
    // 生成 question_id（如果字段存在的话）
    const questionId = 'market-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // 智能检测数据库架构并插入
    try {
      // 尝试使用新架构
      const result = await db.query(
        `INSERT INTO markets (
          question_id,
          title,
          description,
          main_category,
          sub_category,
          tags,
          end_time,
          status,
          blockchain_status,
          priority_level,
          reward_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          questionId,
          body.title,
          body.description,
          body.mainCategory || 'emerging',
          body.subCategory || null,
          body.tags || [],
          body.endTime ? new Date(body.endTime) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          'active', // 直接设为 active，立即在前端显示
          'not_created',
          body.priorityLevel || 'recommended',
          body.rewardAmount || 10
        ]
      );
      
      const market = result.rows[0];
      
      return NextResponse.json({
        success: true,
        market: market,
        message: '✅ 市场创建成功！\n' +
                 `ID: ${market.id}\n` +
                 `标题: ${market.title}`
      });
      
    } catch (newSchemaError: any) {
      // 如果新架构失败，尝试旧架构
      console.log('新架构失败，尝试旧架构...', newSchemaError.message);
      
      const fallbackResult = await db.query(
        `INSERT INTO markets (
          title,
          description,
          categoryType,
          category,
          endDate,
          isActive,
          priorityLevel
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          body.title,
          body.description,
          body.mainCategory || 'emerging',
          body.subCategory || '',
          body.endTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          true,
          body.priorityLevel || 'recommended'
        ]
      );
      
      const market = fallbackResult.rows[0];
      
      return NextResponse.json({
        success: true,
        market: market,
        message: '✅ 市场创建成功（使用旧架构）！\n' +
                 `ID: ${market.id}\n` +
                 `标题: ${market.title}\n` +
                 `💡 建议运行数据库迁移脚本`
      });
    }
    
  } catch (error: any) {
    console.error('创建市场失败:', error);
    return NextResponse.json(
      { error: error.message || '创建失败' },
      { status: 500 }
    );
  }
}

