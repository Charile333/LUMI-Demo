// 🔥 话题 API - 使用 Supabase 客户端（Vercel 优化版）

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取所有话题
export async function GET() {
  try {
    // ✅ 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase 环境变量未配置，返回空话题列表');
      return NextResponse.json({
        success: true,
        topics: [],
        warning: 'Supabase 未配置'
      });
    }
    
    // ✅ 修复：安全地获取 Supabase 客户端
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (initError: any) {
      console.error('初始化 Supabase 客户端失败:', initError);
      return NextResponse.json({
        success: true,
        topics: [],
        warning: 'Supabase 客户端初始化失败'
      });
    }
    
    const { data, error } = await supabase
      .from('user_topics')
      .select('*')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase 查询失败:', error);
      
      // ✅ 处理表不存在的情况（42P01）
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️ user_topics 表不存在，返回空列表');
        return NextResponse.json({
          success: true,
          topics: [],
          warning: '话题表尚未创建'
        });
      }
      
      throw error;
    }

    // 转换字段名为 camelCase
    const topics = (data || []).map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      votes: topic.votes,
      createdBy: topic.created_by,
      createdAt: topic.created_at
    }));

    return NextResponse.json({
      success: true,
      topics
    });
  } catch (error: any) {
    console.error('获取话题失败:', error);
    
    // ✅ 返回 200 而不是 500，避免前端报错
    return NextResponse.json(
      { 
        success: false, 
        topics: [],
        error: '获取话题失败: ' + (error.message || '未知错误') 
      },
      { status: 200 } // 改为 200，让前端可以正常处理
    );
  }
}

// 创建新话题
export async function POST(request: NextRequest) {
  try {
    // ✅ 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase 未配置，无法创建话题' },
        { status: 503 }
      );
    }
    
    const { title, description } = await request.json();

    // 验证
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

    // 获取用户信息
    const userAddress = request.headers.get('x-user-address') || 'anonymous';

    // ✅ 修复：安全地获取 Supabase 客户端
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (initError: any) {
      console.error('初始化 Supabase 客户端失败:', initError);
      return NextResponse.json(
        { success: false, error: 'Supabase 客户端初始化失败' },
        { status: 503 }
      );
    }
    
    const { data, error } = await supabase
      .from('user_topics')
      .insert({
        title: title.trim(),
        description: description?.trim() || '',
        created_by: userAddress,
        votes: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 插入失败:', error);
      
      // ✅ 处理表不存在的情况
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { success: false, error: '话题表尚未创建，请联系管理员' },
          { status: 503 }
        );
      }
      
      // 检查是否是重复标题
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '该话题已存在' },
          { status: 409 }
        );
      }
      
      throw error;
    }

    // 转换字段名
    const topic = {
      id: data.id,
      title: data.title,
      description: data.description,
      votes: data.votes,
      createdBy: data.created_by,
      createdAt: data.created_at
    };

    return NextResponse.json({
      success: true,
      topic
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('创建话题失败:', error);
    
    return NextResponse.json(
      { success: false, error: '创建话题失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}

