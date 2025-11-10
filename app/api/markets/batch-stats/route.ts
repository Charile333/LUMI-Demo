// 📊 批量获取市场统计数据 API
// 优化方案：一次请求获取所有卡片数据

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { globalCache, cacheKeys } from '@/lib/cache/cache-manager';

// ✅ 使用 Node.js Runtime（Edge Runtime 与 Supabase 客户端有兼容性问题）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 🔧 生成模拟数据（降级方案）
function generateMockData(marketIds: number[]) {
  console.log('⚠️ 使用模拟数据降级方案');
  const statsMap: Record<number, any> = {};
  
  marketIds.forEach(id => {
    const probability = 45 + Math.random() * 10; // 45-55%
    const bestBid = (probability / 100) - 0.02;
    const bestAsk = (probability / 100) + 0.02;
    const midPrice = (bestBid + bestAsk) / 2;
    
    statsMap[id] = {
      probability: parseFloat(probability.toFixed(2)),
      yes: parseFloat(midPrice.toFixed(4)),
      no: parseFloat((1 - midPrice).toFixed(4)),
      bestBid: parseFloat(bestBid.toFixed(4)),
      bestAsk: parseFloat(bestAsk.toFixed(4)),
      volume24h: Math.floor(Math.random() * 10000),
      participants: Math.floor(Math.random() * 500),
      priceChange24h: (Math.random() - 0.5) * 10,
      orderBook: {
        bids: [[bestBid, Math.random() * 1000]],
        asks: [[bestAsk, Math.random() * 1000]]
      },
      lastUpdated: new Date().toISOString(),
      isMockData: true
    };
  });
  
  return statsMap;
}

// 🔄 重试函数
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (i > 0) {
        console.log(`🔄 重试 ${i}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`❌ 尝试 ${i + 1} 失败:`, error);
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  let marketIds: number[] = [];
  
  try {
    ({ marketIds } = await request.json());
    
    // 验证参数
    if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid marketIds parameter' }, 
        { status: 400 }
      );
    }

    // 限制单次查询数量（防止性能问题）
    if (marketIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 markets per request' }, 
        { status: 400 }
      );
    }

    // 🚀 检查缓存
    const cacheKey = cacheKeys.batchStats(marketIds);
    const cachedData = globalCache.stats.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ 从缓存返回 ${marketIds.length} 个市场数据`);
      return NextResponse.json({
        success: true,
        data: cachedData,
        count: Object.keys(cachedData).length,
        timestamp: new Date().toISOString(),
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
          'CDN-Cache-Control': 'public, s-maxage=5',
        }
      });
    }

    // ✅ 验证环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase 环境变量未配置');
      console.error('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
      console.error('SUPABASE_KEY:', supabaseKey ? '✅' : '❌');
      
      // 降级到模拟数据
      return NextResponse.json({
        success: true,
        data: generateMockData(marketIds),
        count: marketIds.length,
        timestamp: new Date().toISOString(),
        warning: 'Using mock data - Supabase not configured'
      });
    }

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log(`📊 查询 ${marketIds.length} 个市场数据...`);

    // 🚀 带重试的并行查询
    const queryOperation = async () => {
      return await Promise.all([
        // 查询市场基础数据（移除不存在的 price_change_24h 列）
        supabase
          .from('markets')
          .select('id, title, volume, participants, updated_at')
          .in('id', marketIds),
        
        // 查询订单簿数据
        supabase
          .from('orderbooks')
          .select('market_id, bids, asks, volume_24h, last_price')
          .in('market_id', marketIds)
      ]);
    };

    let marketsResult, orderbooksResult;
    
    try {
      [marketsResult, orderbooksResult] = await retryOperation(queryOperation, 2, 1000);
    } catch (error: any) {
      console.error('❌ Supabase 查询失败（重试后）:', error.message);
      
      // 降级到模拟数据
      return NextResponse.json({
        success: true,
        data: generateMockData(marketIds),
        count: marketIds.length,
        timestamp: new Date().toISOString(),
        warning: 'Using mock data - Database connection failed'
      });
    }

    if (marketsResult.error) {
      console.error('❌ Markets 查询错误:', marketsResult.error);
      throw new Error(`Markets query failed: ${marketsResult.error.message}`);
    }

    if (orderbooksResult.error) {
      console.warn('Orderbooks query failed:', orderbooksResult.error);
      // 订单簿失败不致命，继续处理
    }

    // 🔥 转换为 Map 格式（便于前端快速查找）
    const statsMap: Record<number, any> = {};
    
    marketsResult.data?.forEach(market => {
      // 查找对应的订单簿
      const orderbook = orderbooksResult.data?.find(
        ob => ob.market_id === market.id
      );

      // 从订单簿提取最佳价格
      const bestBid = orderbook?.bids?.[0]?.price 
        ? parseFloat(String(orderbook.bids[0].price)) 
        : 0.49;
      
      const bestAsk = orderbook?.asks?.[0]?.price 
        ? parseFloat(String(orderbook.asks[0].price)) 
        : 0.51;

      // 计算中间价和概率（与 useMarketPrice 保持一致）
      const midPrice = (bestBid + bestAsk) / 2;
      const probability = midPrice * 100;

      // 整合数据
      statsMap[market.id] = {
        // 价格数据
        probability: parseFloat(probability.toFixed(2)),
        yes: parseFloat(midPrice.toFixed(4)),
        no: parseFloat((1 - midPrice).toFixed(4)),
        bestBid: parseFloat(bestBid.toFixed(4)),
        bestAsk: parseFloat(bestAsk.toFixed(4)),
        
        // 交易统计
        volume24h: market.volume || orderbook?.volume_24h || 0,
        participants: market.participants || 0,
        
        // 价格变化（未来可从历史数据计算）
        priceChange24h: 0,
        
        // 🔥 完整订单簿数据
        orderBook: orderbook ? {
          bids: orderbook.bids || [],
          asks: orderbook.asks || []
        } : undefined,
        
        // 元数据
        lastUpdated: market.updated_at || new Date().toISOString()
      };
    });

    // 🚀 保存到缓存（10秒 TTL）
    globalCache.stats.set(cacheKey, statsMap, 10000);
    
    // 返回结果
    return NextResponse.json({
      success: true,
      data: statsMap,
      count: Object.keys(statsMap).length,
      timestamp: new Date().toISOString(),
      cached: false
    }, {
      headers: {
        // ✅ CDN 缓存配置（5秒缓存，10秒过期重验证）
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
        'CDN-Cache-Control': 'public, s-maxage=5',
      }
    });

  } catch (error: any) {
    console.error('❌ Batch stats API error:', error);
    console.error('Stack:', error.stack);
    
    // 即使出错也返回模拟数据（保证前端可用）
    if (marketIds && Array.isArray(marketIds) && marketIds.length > 0) {
      console.log('⚠️ 返回模拟数据作为降级方案');
      return NextResponse.json({
        success: true,
        data: generateMockData(marketIds),
        count: marketIds.length,
        timestamp: new Date().toISOString(),
        warning: `Using mock data - Error: ${error.message}`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      data: {}
    }, { 
      status: 500 
    });
  }
}

