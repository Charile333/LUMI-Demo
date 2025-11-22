// 📝 管理员创建市场 API（使用 Supabase REST API）
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

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
    
    const supabase = getSupabaseAdmin();
    
    // 生成 question_id
    const questionId = 'market-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // 准备插入数据
    const marketData = {
      question_id: questionId,
      title: body.title,
      description: body.description,
      main_category: body.mainCategory || 'emerging',
      sub_category: body.subCategory || null,
      tags: body.tags || [],
      end_time: body.endTime ? new Date(body.endTime).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      blockchain_status: 'not_created',
      priority_level: body.priorityLevel || 'recommended',
      reward_amount: body.rewardAmount || 10
    };
    
    console.log('📥 准备插入数据:', marketData);
    
    // 使用 Supabase REST API 插入
    const { data, error } = await supabase
      .from('markets')
      .insert([marketData])
      .select();
    
    if (error) {
      console.error('❌ Supabase 错误:', error);
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    const market = data[0];
    
    console.log('✅ 创建成功:', market);
    
    return NextResponse.json({
      success: true,
      market: market,
      message: '✅ 市场创建成功！\n' +
               `ID: ${market.id}\n` +
               `标题: ${market.title}\n` +
               `分类: ${market.main_category}`
    });
    
  } catch (error: any) {
    console.error('❌ 创建市场失败:', error);
    return NextResponse.json(
      { 
        error: error.message || '创建失败',
        stack: error.stack
      },
      { status: 500 }
    );
  }
}






























