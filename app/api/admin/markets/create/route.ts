// 📝 管理员创建市场 API（数据库）

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ethers } from 'ethers';

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
    
    // 生成 questionId（使用标题 + 时间戳）
    const questionId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(body.title + Date.now())
    );
    
    // 处理结果选项
    let outcomeOptions = ['YES', 'NO']; // 默认二元选项
    let numericMin = null;
    let numericMax = null;
    
    if (body.outcomeType === 'binary') {
      outcomeOptions = body.binaryOptions || ['YES', 'NO'];
    } else if (body.outcomeType === 'multiple') {
      outcomeOptions = body.multipleOptions || ['选项 1', '选项 2'];
    } else if (body.outcomeType === 'numeric') {
      numericMin = parseFloat(body.numericMin) || 0;
      numericMax = parseFloat(body.numericMax) || 100;
      outcomeOptions = []; // 数值型没有固定选项
    }
    
    // 插入数据库
    const result = await db.query(
      `INSERT INTO markets (
        question_id,
        title,
        description,
        image_url,
        main_category,
        sub_category,
        tags,
        start_time,
        end_time,
        resolution_time,
        status,
        blockchain_status,
        priority_level,
        reward_amount,
        outcome_type,
        outcome_options,
        numeric_min,
        numeric_max
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        questionId,
        body.title,
        body.description,
        body.imageUrl || null,
        body.mainCategory || 'emerging',
        body.subCategory || null,
        body.tags || [],
        body.startTime ? new Date(body.startTime) : null,
        body.endTime ? new Date(body.endTime) : null,
        body.resolutionTime ? new Date(body.resolutionTime) : null,
        'draft', // 状态：草稿
        'not_created', // 区块链状态：未创建
        body.priorityLevel || 'recommended',
        body.rewardAmount || 10,
        body.outcomeType || 'binary',
        JSON.stringify(outcomeOptions),
        numericMin,
        numericMax
      ]
    );
    
    const market = result.rows[0];
    
    return NextResponse.json({
      success: true,
      market: market,
      message: '✅ 市场创建成功（数据库）\n' +
               '状态：草稿\n' +
               '成本：$0\n' +
               '将在活跃后自动上链'
    });
    
  } catch (error: any) {
    console.error('创建市场失败:', error);
    return NextResponse.json(
      { error: error.message || '创建失败' },
      { status: 500 }
    );
  }
}

