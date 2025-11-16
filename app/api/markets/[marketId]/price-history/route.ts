// 📊 获取市场价格历史 API

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PriceHistoryParams {
  params: {
    marketId: string;
  };
}

interface PriceHistoryItem {
  price: number;
  bestBid: number;
  bestAsk: number;
  recordedAt: string;
}

/**
 * 根据时间范围对数据进行采样
 * 1D: 每小时一个点（最多24个点）
 * 1W: 每6小时一个点（最多28个点）
 * 1M: 每天一个点（最多31个点）
 * 3M: 每3天一个点（最多31个点）
 * ALL: 每周一个点（最多52个点）
 */
function sampleDataByTimeRange(data: PriceHistoryItem[], timeRange: string): PriceHistoryItem[] {
  if (data.length === 0) return data;

  // 按时间排序（确保顺序正确）
  const sortedData = [...data].sort((a, b) => 
    new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  // 定义采样间隔（毫秒）
  let intervalMs: number;
  let maxPoints: number;

  switch (timeRange) {
    case '1D':
      intervalMs = 60 * 60 * 1000; // 1小时
      maxPoints = 24;
      break;
    case '1W':
      intervalMs = 6 * 60 * 60 * 1000; // 6小时
      maxPoints = 28;
      break;
    case '1M':
      intervalMs = 24 * 60 * 60 * 1000; // 1天
      maxPoints = 31;
      break;
    case '3M':
      intervalMs = 3 * 24 * 60 * 60 * 1000; // 3天
      maxPoints = 31;
      break;
    case 'ALL':
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1周
      maxPoints = 52;
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000; // 默认1天
      maxPoints = 31;
  }

  // 如果数据点已经很少，不需要采样
  if (sortedData.length <= maxPoints) {
    return sortedData;
  }

  const sampled: PriceHistoryItem[] = [];
  const startTime = new Date(sortedData[0].recordedAt).getTime();
  let nextSampleTime = startTime;

  // 总是包含第一个点
  sampled.push(sortedData[0]);

  for (let i = 1; i < sortedData.length; i++) {
    const itemTime = new Date(sortedData[i].recordedAt).getTime();

    // 如果超过采样间隔，或者接近最后一个点，添加到采样结果
    if (itemTime >= nextSampleTime || i === sortedData.length - 1) {
      // 找到这个时间窗口内最接近采样时间的点
      let bestMatch = sortedData[i];
      let minDiff = Math.abs(itemTime - nextSampleTime);

      // 向前查找是否有更接近的点
      for (let j = i + 1; j < Math.min(i + 10, sortedData.length); j++) {
        const jTime = new Date(sortedData[j].recordedAt).getTime();
        if (jTime <= nextSampleTime + intervalMs) {
          const diff = Math.abs(jTime - nextSampleTime);
          if (diff < minDiff) {
            minDiff = diff;
            bestMatch = sortedData[j];
            i = j; // 跳过已处理的点
          }
        }
      }

      sampled.push(bestMatch);
      nextSampleTime = new Date(bestMatch.recordedAt).getTime() + intervalMs;

      // 如果已达到最大点数，添加最后一个点并退出
      if (sampled.length >= maxPoints - 1) {
        // 确保包含最后一个点
        if (i < sortedData.length - 1) {
          sampled.push(sortedData[sortedData.length - 1]);
        }
        break;
      }
    }
  }

  // 确保包含最后一个点
  const lastPoint = sortedData[sortedData.length - 1];
  if (sampled.length === 0 || sampled[sampled.length - 1].recordedAt !== lastPoint.recordedAt) {
    sampled.push(lastPoint);
  }

  return sampled;
}

export async function GET(
  request: NextRequest,
  { params }: PriceHistoryParams
) {
  // 在 try 块外部定义变量，以便在 catch 块中使用
  let marketId: number = NaN;
  let timeRange: string = '1M';
  
  try {
    marketId = parseInt(params.marketId);
    const { searchParams } = new URL(request.url);
    timeRange = searchParams.get('range') || '1M'; // 1D, 1W, 1M, 3M, ALL
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;

    console.log(`📊 价格历史 API 调用: marketId=${marketId}, timeRange=${timeRange}`);

    if (isNaN(marketId)) {
      console.error('❌ 无效的市场ID:', params.marketId);
      return NextResponse.json(
        { error: 'Invalid market ID' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;
    
    if (!supabase) {
      console.error('❌ Supabase 客户端未初始化');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // 计算时间范围
    let startDate: Date | null = null;
    if (timeRange === '1D') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
    } else if (timeRange === '1W') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === '1M') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === '3M') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
    }
    // ALL 不设置时间限制

    // 构建查询
    let query = supabase
      .from('market_price_history')
      .select('price, best_bid, best_ask, recorded_at')
      .eq('market_id', marketId)
      .order('recorded_at', { ascending: true });

    if (startDate) {
      query = query.gte('recorded_at', startDate.toISOString());
    }

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ 查询价格历史失败:', error);
      console.error('查询错误详情:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        marketId,
        timeRange,
        startDate: startDate?.toISOString()
      });
      
      // 🔥 如果表不存在或其他数据库错误，返回空数组而不是500错误
      // 这样前端可以优雅降级，显示当前价格而不是崩溃
      const errorMessage = error.message || '';
      const isTableNotFound = 
        error.code === '42P01' || 
        errorMessage.includes('does not exist') || 
        errorMessage.includes('Could not find the table') ||
        errorMessage.includes('schema cache') ||
        (errorMessage.includes('relation') && errorMessage.includes('does not exist'));
      
      if (isTableNotFound) {
        console.warn('⚠️ market_price_history 表不存在，返回空数组');
        console.warn('错误详情:', errorMessage);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          originalCount: 0,
          timeRange,
          message: 'Price history table does not exist. Please run migration script: scripts/migration-add-price-history.sql',
          warning: true
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch price history', details: error.message },
        { status: 500 }
      );
    }

    // 如果没有历史数据，返回空数组
    if (!data || data.length === 0) {
      console.log(`📊 市场 ${marketId} 没有价格历史数据, 时间范围=${timeRange}`);
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No price history available'
      });
    }

    // 格式化数据
    const formattedData: PriceHistoryItem[] = data.map((item) => ({
      price: parseFloat(item.price || '0'),
      bestBid: parseFloat(item.best_bid || '0'),
      bestAsk: parseFloat(item.best_ask || '0'),
      recordedAt: item.recorded_at
    }));

    // 🔍 调试：显示数据日期范围
    if (formattedData.length > 0) {
      const firstDate = new Date(formattedData[0].recordedAt);
      const lastDate = new Date(formattedData[formattedData.length - 1].recordedAt);
      const uniqueDates = new Set(
        formattedData.map(item => new Date(item.recordedAt).toLocaleDateString('zh-CN'))
      );
      
      console.log(`📊 市场 ${marketId} 价格历史查询结果:`);
      console.log(`  - 时间范围参数: ${timeRange}`);
      console.log(`  - 查询起始日期: ${startDate ? startDate.toISOString() : '无限制（ALL）'}`);
      console.log(`  - 数据总数: ${formattedData.length} 条`);
      console.log(`  - 数据日期范围: ${firstDate.toLocaleDateString('zh-CN')} 至 ${lastDate.toLocaleDateString('zh-CN')}`);
      console.log(`  - 唯一日期数: ${uniqueDates.size} 天`);
      console.log(`  - 唯一日期列表:`, Array.from(uniqueDates).sort().join(', '));
    }

    // 🔥 根据时间范围对数据进行采样，避免数据点过多导致图表显示问题
    let sampledData: PriceHistoryItem[] = [];
    try {
      sampledData = sampleDataByTimeRange(formattedData, timeRange);
    } catch (sampleError: any) {
      console.error('❌ 数据采样失败:', sampleError);
      console.error('采样错误详情:', {
        message: sampleError.message,
        stack: sampleError.stack,
        dataLength: formattedData.length,
        timeRange
      });
      // 如果采样失败，使用原始数据
      sampledData = formattedData;
    }

    if (sampledData.length > 0) {
      const sampledFirstDate = new Date(sampledData[0].recordedAt);
      const sampledLastDate = new Date(sampledData[sampledData.length - 1].recordedAt);
      const sampledUniqueDates = new Set(
        sampledData.map(item => new Date(item.recordedAt).toLocaleDateString('zh-CN'))
      );
      
      console.log(`📊 采样结果:`);
      console.log(`  - 原始数据: ${formattedData.length} 条`);
      console.log(`  - 采样后数据: ${sampledData.length} 条`);
      console.log(`  - 采样后日期范围: ${sampledFirstDate.toLocaleDateString('zh-CN')} 至 ${sampledLastDate.toLocaleDateString('zh-CN')}`);
      console.log(`  - 采样后唯一日期数: ${sampledUniqueDates.size} 天`);
      console.log(`  - 采样后唯一日期列表: ${Array.from(sampledUniqueDates).sort().join(', ')}`);
    }

    return NextResponse.json({
      success: true,
      data: sampledData,
      count: sampledData.length,
      originalCount: formattedData.length,
      timeRange
    });

  } catch (error: any) {
    console.error('❌ 获取价格历史失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      marketId: isNaN(marketId) ? 'invalid' : marketId,
      timeRange: timeRange || 'unknown'
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

