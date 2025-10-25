import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 获取所有话题
export async function GET() {
  try {
    const result = await db.query(
      `SELECT 
        id, 
        title, 
        description, 
        votes,
        created_by as "createdBy",
        created_at as "createdAt"
      FROM user_topics 
      ORDER BY votes DESC, created_at DESC
      LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      topics: result.rows
    });
  } catch (error) {
    console.error('获取话题失败:', error);
    return NextResponse.json(
      { success: false, error: '获取话题失败' },
      { status: 500 }
    );
  }
}

// 创建新话题
export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '标题不能为空' },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { success: false, error: '标题不能超过100个字符' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { success: false, error: '描述不能超过500个字符' },
        { status: 400 }
      );
    }

    // 获取用户信息（简化版，实际应该从认证中获取）
    const userAddress = request.headers.get('x-user-address') || 'anonymous';

    const result = await db.query(
      `INSERT INTO user_topics (title, description, created_by, votes, created_at)
       VALUES ($1, $2, $3, 0, NOW())
       RETURNING id, title, description, votes, created_by as "createdBy", created_at as "createdAt"`,
      [title.trim(), description?.trim() || '', userAddress]
    );

    return NextResponse.json({
      success: true,
      topic: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('创建话题失败:', error);
    
    // 检查是否是重复标题
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: '该话题已存在' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: '创建话题失败' },
      { status: 500 }
    );
  }
}

