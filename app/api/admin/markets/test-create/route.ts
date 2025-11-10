// 🧪 测试创建市场（最小字段版本）
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 收到的数据:', body);
    
    // 生成一个简单的 question_id
    const questionId = 'test-' + Date.now();
    
    console.log('🔧 准备插入数据...');
    
    // 尝试最简单的插入（只使用绝对必需的字段）
    const result = await db.query(
      `INSERT INTO markets (
        question_id,
        title,
        description,
        main_category
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        questionId,
        body.title || '测试市场',
        body.description || '这是一个测试',
        body.mainCategory || 'emerging'
      ]
    );
    
    console.log('✅ 插入成功:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      market: result.rows[0],
      message: '✅ 测试创建成功！\n使用了最小字段集。'
    });
    
  } catch (error: any) {
    console.error('❌ 创建失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      fullError: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}

