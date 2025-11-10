/**
 * 崩盘事件API - 从Supabase读取
 * GET /api/crash-events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase-client';

// #vercel环境禁用 - 使用单例 Supabase 客户端，避免多实例警告
const supabase = getSupabase();

export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'verified'; // 默认只返回verified的事件
    const asset = searchParams.get('asset');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // 构建查询
    let query = supabase
      .from('crash_events')
      .select('*');
    
    // 过滤条件
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (asset) {
      query = query.eq('asset', asset);
    }
    
    if (severity) {
      query = query.eq('severity', severity);
    }
    
    // 排序和限制
    const { data, error } = await query
      .order('event_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 转换为前端期望的格式
    const formattedData = data?.map(event => ({
      id: event.id,
      date: event.event_date,
      asset: event.asset,
      crashPercentage: event.crash_percentage.toString(),
      duration: `${event.duration_hours}h`,
      description: event.event_name || `${event.asset} 崩盘`,
      timestamp: event.lowest_point,
      crashStart: event.crash_start,
      crashEnd: event.crash_end,
      details: {
        previous_price: parseFloat(event.highest_price),
        current_price: parseFloat(event.lowest_price),
        price_change: parseFloat(event.crash_percentage),
      },
      severity: event.severity,
      status: event.status,
    })) || [];
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * 创建新的崩盘事件（手动添加）
 * POST /api/crash-events
 */
export async function POST(request: NextRequest) {
  try {
    // #vercel环境禁用 - 使用顶层的单例 supabase 客户端
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('crash_events')
      .insert({
        asset: body.asset,
        event_date: body.date,
        event_name: body.description,
        crash_start: body.crashStart,
        lowest_point: body.timestamp,
        crash_end: body.crashEnd,
        highest_price: body.details.previous_price,
        lowest_price: body.details.current_price,
        crash_percentage: body.details.price_change,
        duration_hours: parseInt(body.duration),
        status: 'verified',
        severity: body.severity || 'medium',
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
    });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}






