/**
 * 🎯 价格历史记录定时任务
 * 方案A: 每分钟记录所有活跃市场的价格到历史表
 * 用于计算24小时价格变化
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Market {
  id: number;
  title: string;
  status: string;
  question_id?: string;
}

interface OrderBookData {
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
}

/**
 * 获取市场的订单簿数据
 */
async function getMarketOrderBook(marketId: number): Promise<OrderBookData | null> {
  try {
    const { data, error } = await supabase
      .from('order_book')
      .select('side, price, size')
      .eq('market_id', marketId)
      .eq('status', 'open')
      .order('price', { ascending: false });

    if (error) {
      console.error(`获取市场 ${marketId} 订单簿失败:`, error);
      return null;
    }

    const bids = data.filter(order => order.side === 'buy')
      .map(order => ({ price: Number(order.price), size: Number(order.size) }));
    const asks = data.filter(order => order.side === 'sell')
      .map(order => ({ price: Number(order.price), size: Number(order.size) }))
      .reverse(); // asks 按价格升序

    return { bids, asks };
  } catch (err) {
    console.error(`查询市场 ${marketId} 订单簿出错:`, err);
    return null;
  }
}

/**
 * 计算市场价格
 */
function calculateMarketPrice(orderBook: OrderBookData): {
  price: number;
  bestBid: number;
  bestAsk: number;
} {
  let bestBid = 0;
  let bestAsk = 0;

  if (orderBook.bids.length > 0) {
    bestBid = orderBook.bids[0].price;
  }

  if (orderBook.asks.length > 0) {
    bestAsk = orderBook.asks[0].price;
  }

  // 处理特殊情况
  if (bestBid === 0 && bestAsk > 0) {
    bestBid = Math.max(0.01, bestAsk - 0.05);
  } else if (bestAsk === 0 && bestBid > 0) {
    bestAsk = Math.min(0.99, bestBid + 0.05);
  } else if (bestBid === 0 && bestAsk === 0) {
    // 没有订单，使用默认值
    bestBid = 0.49;
    bestAsk = 0.51;
  }

  // 中间价格
  const price = (bestBid + bestAsk) / 2;

  return { price, bestBid, bestAsk };
}

/**
 * 记录单个市场的价格历史
 */
async function recordMarketPrice(market: Market): Promise<boolean> {
  try {
    // 1. 获取订单簿
    const orderBook = await getMarketOrderBook(market.id);
    if (!orderBook) {
      console.log(`⚠️  市场 ${market.id} 暂无订单簿数据`);
      return false;
    }

    // 2. 计算价格
    const { price, bestBid, bestAsk } = calculateMarketPrice(orderBook);

    // 3. 获取24小时交易量
    const { data: marketData } = await supabase
      .from('markets')
      .select('volume')
      .eq('id', market.id)
      .single();

    const volume24h = marketData?.volume || 0;

    // 4. 调用数据库函数记录价格历史
    const { error: recordError } = await supabase.rpc('record_market_price_history', {
      p_market_id: market.id,
      p_price: price,
      p_best_bid: bestBid,
      p_best_ask: bestAsk,
      p_volume_24h: volume24h
    });

    if (recordError) {
      console.error(`记录市场 ${market.id} 价格失败:`, recordError);
      return false;
    }

    console.log(`✅ 市场 ${market.id} (${market.title}): 价格=${(price * 100).toFixed(1)}%, 买价=${(bestBid * 100).toFixed(1)}%, 卖价=${(bestAsk * 100).toFixed(1)}%`);
    return true;
  } catch (err) {
    console.error(`记录市场 ${market.id} 价格出错:`, err);
    return false;
  }
}

/**
 * 主函数：记录所有活跃市场的价格
 */
async function recordAllMarketsPrices() {
  console.log('\n🎯 开始记录市场价格历史...');
  console.log('⏰ 时间:', new Date().toISOString());

  try {
    // 获取所有活跃的市场
    const { data: markets, error } = await supabase
      .from('markets')
      .select('id, title, status, question_id')
      .eq('status', 'active')
      .order('id');

    if (error) {
      console.error('❌ 获取市场列表失败:', error);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('⚠️  没有活跃的市场');
      return;
    }

    console.log(`📊 找到 ${markets.length} 个活跃市场\n`);

    // 并发记录所有市场（限制并发数避免过载）
    const batchSize = 10;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < markets.length; i += batchSize) {
      const batch = markets.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(market => recordMarketPrice(market))
      );
      
      successCount += results.filter(r => r).length;
      failCount += results.filter(r => !r).length;

      // 短暂延迟避免过载
      if (i + batchSize < markets.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n📈 记录完成统计:');
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 失败: ${failCount}`);
    console.log(`  📊 总计: ${markets.length}`);
  } catch (err) {
    console.error('❌ 记录价格历史出错:', err);
  }
}

/**
 * 清理旧数据（保留90天）
 */
async function cleanupOldData() {
  try {
    const { data, error } = await supabase.rpc('cleanup_old_price_history');
    
    if (error) {
      console.error('清理旧数据失败:', error);
      return;
    }

    if (data > 0) {
      console.log(`🗑️  已清理 ${data} 条90天前的历史记录`);
    }
  } catch (err) {
    console.error('清理旧数据出错:', err);
  }
}

// 如果直接运行此脚本
const isMainModule =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
  (async () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       📊 市场价格历史记录任务 (方案A)                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    await recordAllMarketsPrices();

    // 每天清理一次旧数据（可选）
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      console.log('\n🗑️  开始清理旧数据...');
      await cleanupOldData();
    }

    console.log('\n✨ 任务完成\n');
    process.exit(0);
  })();
}

export { recordAllMarketsPrices, cleanupOldData };

