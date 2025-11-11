// 🐛 调试版本 - 显示详细错误信息
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 收到的请求数据:', JSON.stringify(body, null, 2));
    
    // 验证必填字段
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: '标题和描述不能为空' },
        { status: 400 }
      );
    }
    
    // 生成 question_id
    const questionId = 'market-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    console.log('🔧 准备插入的数据:');
    console.log('  question_id:', questionId);
    console.log('  title:', body.title);
    console.log('  description:', body.description);
    console.log('  main_category:', body.mainCategory || 'emerging');
    
    // 使用最简单的插入语句
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
        body.title,
        body.description,
        body.mainCategory || 'emerging'
      ]
    );
    
    console.log('✅ 插入成功:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      market: result.rows[0],
      message: '✅ 市场创建成功！'
    });
    
  } catch (error: any) {
    console.error('❌ 详细错误信息:');
    console.error('  错误消息:', error.message);
    console.error('  错误代码:', error.code);
    console.error('  错误详情:', error.detail);
    console.error('  完整错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      where: error.where,
      fullStack: error.stack
    }, { status: 500 });
  }
}










