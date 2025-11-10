/**
 * Vercel Cron Job: 崩盘检测
 * 
 * 配置在 vercel.json 中：
 * {
 *   "crons": [{
 *     "path": "/api/cron/detect-crash",
 *     "schedule": "0 * * * *"  // 每小时执行一次
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';

// #vercel环境禁用 - 使用单例 Supabase Admin 客户端，避免多实例警告
const supabase = getSupabaseAdmin();

// 支持的资产列表
const MONITORED_ASSETS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];

// 崩盘检测阈值
const CRASH_THRESHOLDS = {
  high: -10,      // -10% 高风险
  extreme: -20,   // -20% 极端风险
};

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 从币安获取K线数据
 */
async function getBinanceKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 24
): Promise<KlineData[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!Array.isArray(data)) {
    throw new Error('Invalid response from Binance API');
  }
  
  return data.map((k: any) => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

/**
 * 分析价格数据，检测崩盘
 */
function detectCrash(klines: KlineData[]) {
  if (klines.length < 2) return null;
  
  // 找到24小时内的最高和最低价
  let highestPrice = 0;
  let lowestPrice = Infinity;
  let highestTime = 0;
  let lowestTime = 0;
  
  klines.forEach(k => {
    if (k.high > highestPrice) {
      highestPrice = k.high;
      highestTime = k.time;
    }
    if (k.low < lowestPrice) {
      lowestPrice = k.low;
      lowestTime = k.time;
    }
  });
  
  // 计算跌幅
  const changePercent = ((lowestPrice - highestPrice) / highestPrice) * 100;
  
  // 计算持续时间（分钟）
  const durationMinutes = Math.abs(lowestTime - highestTime) / 60000;
  
  return {
    highestPrice,
    lowestPrice,
    highestTime,
    lowestTime,
    changePercent,
    durationMinutes,
    severity: changePercent < CRASH_THRESHOLDS.extreme ? 'extreme' :
              changePercent < CRASH_THRESHOLDS.high ? 'high' : 'medium',
  };
}

/**
 * 保存崩盘事件到数据库
 */
async function saveCrashEvent(asset: string, detection: any) {
  const { data, error } = await supabase
    .from('crash_events')
    .insert({
      asset: asset.replace('USDT', '/USDT'),
      event_date: new Date(detection.lowestTime).toISOString().split('T')[0],
      event_name: `${asset} 崩盘`,
      crash_start: new Date(detection.highestTime).toISOString(),
      lowest_point: new Date(detection.lowestTime).toISOString(),
      highest_price: detection.highestPrice,
      lowest_price: detection.lowestPrice,
      crash_percentage: detection.changePercent,
      duration_hours: Math.round(detection.durationMinutes / 60),
      status: 'detected',
      severity: detection.severity,
    })
    .select()
    .single();
  
  return { data, error };
}

/**
 * 保存检测日志
 */
async function saveDetectionLog(asset: string, detection: any, eventCreated: boolean, eventId?: string) {
  await supabase
    .from('crash_detection_logs')
    .insert({
      asset: asset.replace('USDT', '/USDT'),
      price_drop_percent: detection.changePercent,
      duration_minutes: Math.round(detection.durationMinutes),
      trigger_threshold: CRASH_THRESHOLDS.high,
      created_event: eventCreated,
      event_id: eventId,
      detection_data: detection,
    });
}

/**
 * 保存价格监控数据
 */
async function savePriceMonitoring(asset: string, klines: KlineData[]) {
  const latest = klines[klines.length - 1];
  const high24h = Math.max(...klines.map(k => k.high));
  const low24h = Math.min(...klines.map(k => k.low));
  const change24h = ((latest.close - klines[0].open) / klines[0].open) * 100;
  
  await supabase
    .from('price_monitoring')
    .upsert({
      asset: asset.replace('USDT', '/USDT'),
      timestamp: new Date(latest.time).toISOString(),
      price: latest.close,
      volume: latest.volume,
      high_24h: high24h,
      low_24h: low24h,
      change_24h: change24h,
    }, {
      onConflict: 'asset,timestamp'
    });
}

/**
 * 主函数
 */
export async function GET(request: NextRequest) {
  // 验证Cron Secret（安全措施）
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const results = [];
  
  try {
    for (const asset of MONITORED_ASSETS) {
      try {
        // 获取24小时K线数据
        const klines = await getBinanceKlines(asset, '1h', 24);
        
        // 保存监控数据
        await savePriceMonitoring(asset, klines);
        
        // 检测崩盘
        const detection = detectCrash(klines);
        
        if (detection && detection.changePercent < CRASH_THRESHOLDS.high) {
          console.log(`🚨 检测到崩盘: ${asset}`, detection);
          
          // 检查是否已存在相同日期的事件
          const eventDate = new Date(detection.lowestTime).toISOString().split('T')[0];
          const { data: existing } = await supabase
            .from('crash_events')
            .select('id')
            .eq('asset', asset.replace('USDT', '/USDT'))
            .eq('event_date', eventDate)
            .single();
          
          let eventId = existing?.id;
          let eventCreated = false;
          
          if (!existing) {
            // 创建新事件
            const { data: newEvent, error } = await saveCrashEvent(asset, detection);
            if (!error && newEvent) {
              eventId = newEvent.id;
              eventCreated = true;
            }
          }
          
          // 保存检测日志
          await saveDetectionLog(asset, detection, eventCreated, eventId);
          
          results.push({
            asset,
            detected: true,
            eventCreated,
            detection,
          });
        } else {
          results.push({
            asset,
            detected: false,
            change24h: detection?.changePercent,
          });
        }
        
        // 避免API限流
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing ${asset}:`, error);
        results.push({
          asset,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}






