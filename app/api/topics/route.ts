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
  const startTime = Date.now();
  
  try {
    console.log('📝 POST /api/topics - 开始处理请求');
    
    // ✅ 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 环境变量检查:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未配置'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase 环境变量未配置');
      return NextResponse.json(
        { success: false, error: 'Supabase 未配置，无法创建话题' },
        { status: 503 }
      );
    }
    
    // ✅ 安全地解析请求体
    let title, description;
    try {
      const body = await request.json();
      title = body?.title;
      description = body?.description;
      console.log('📥 解析请求体成功:', { title, description: description ? `${description.substring(0, 20)}...` : '' });
    } catch (parseError: any) {
      console.error('❌ 解析请求体失败:', parseError);
      return NextResponse.json(
        { success: false, error: '请求体格式错误: ' + (parseError.message || '无法解析JSON') },
        { status: 400 }
      );
    }

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
      console.log('🔧 初始化 Supabase 客户端...');
      supabase = getSupabaseAdmin();
      console.log('✅ Supabase 客户端初始化成功');
    } catch (initError: any) {
      console.error('❌ 初始化 Supabase 客户端失败:', initError);
      console.error('错误堆栈:', initError.stack);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase 客户端初始化失败: ' + (initError.message || '未知错误'),
          errorCode: initError.code || 'INIT_ERROR',
          errorDetails: process.env.NODE_ENV === 'development' ? initError.stack : undefined
        },
        { status: 503 }
      );
    }
    
    // ✅ 增强错误处理：确保所有错误都被正确捕获
    let data, error;
    try {
      console.log('💾 开始插入数据到 user_topics 表...');
      const result = await supabase
        .from('user_topics')
        .insert({
          title: title.trim(),
          description: description?.trim() || '',
          created_by: userAddress,
          votes: 0
        })
        .select()
        .single();
      
      console.log('📊 Supabase 插入结果:', {
        hasData: !!result.data,
        hasError: !!result.error,
        errorCode: result.error?.code,
        errorMessage: result.error?.message
      });
      
      data = result.data;
      error = result.error;
    } catch (insertError: any) {
      console.error('❌ 插入操作异常:', insertError);
      console.error('错误堆栈:', insertError.stack);
      console.error('错误详情:', JSON.stringify(insertError, Object.getOwnPropertyNames(insertError), 2));
      
      return NextResponse.json(
        { 
          success: false, 
          error: '插入数据时发生异常: ' + (insertError.message || '未知错误'),
          errorCode: insertError.code || 'INSERT_ERROR',
          errorDetails: process.env.NODE_ENV === 'development' ? insertError.stack : undefined
        },
        { status: 500 }
      );
    }

    if (error) {
      console.error('Supabase 插入失败:', error);
      console.error('错误代码:', error.code);
      console.error('错误消息:', error.message);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      
      // ✅ 处理表不存在的情况
      // PostgreSQL 错误: 42P01 (表不存在)
      // Supabase PostgREST 错误: PGRST205 (表在 schema cache 中找不到)
      if (
        error.code === '42P01' || 
        error.code === 'PGRST205' ||
        error.message?.includes('does not exist') || 
        error.message?.includes('Could not find the table') ||
        (error.message?.includes('relation') && error.message?.includes('does not exist'))
      ) {
        return NextResponse.json(
          { 
            success: false, 
            error: '话题表尚未创建',
            errorCode: error.code || 'TABLE_NOT_FOUND',
            solution: '请在 Supabase SQL Editor 中运行 database/create-user-topics-table.sql 创建表'
          },
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
      
      // ✅ 返回详细的错误信息，而不是抛出错误
      return NextResponse.json(
        { 
          success: false, 
          error: '创建话题失败: ' + (error.message || error.code || '未知错误'),
          errorCode: error.code,
          errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      );
    }

    // ✅ 验证数据是否存在
    if (!data) {
      console.error('插入成功但未返回数据');
      return NextResponse.json(
        { success: false, error: '创建话题成功但未返回数据' },
        { status: 500 }
      );
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

    console.log('✅ 话题创建成功:', topic.id);
    return NextResponse.json({
      success: true,
      topic
    }, { status: 201 });
    
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('❌ 创建话题失败（catch 块）:', error);
    console.error('错误堆栈:', error.stack);
    console.error('执行时间:', executionTime + 'ms');
    console.error('错误类型:', error.constructor?.name);
    console.error('完整错误对象:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // ✅ 确保返回友好的错误信息
    const errorMessage = error.message || '未知错误';
    const errorCode = error.code || error.name || 'UNKNOWN';
    
    // ✅ 捕获常见的错误类型
    let statusCode = 500;
    if (error instanceof SyntaxError) {
      statusCode = 400;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      statusCode = 502; // Bad Gateway - 服务器连接问题
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '创建话题失败: ' + errorMessage,
        errorCode,
        errorType: error.constructor?.name,
        executionTime,
        errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

