// 🔍 检查订单和市场统计

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkOrders() {
  console.log('\n🔍 检查订单和市场统计...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. 检查所有订单
  console.log('📋 1. 检查订单表...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (ordersError) {
    console.error('❌ 查询订单失败:', ordersError);
  } else {
    console.log(`✅ 找到 ${orders?.length || 0} 个订单`);
    orders?.forEach(order => {
      console.log(`  - 订单 ${order.order_id}: 市场${order.market_id}, ${order.side} @ ${order.price}, ${order.remaining_amount} 剩余`);
    });
  }

  // 2. 检查所有交易
  console.log('\n💰 2. 检查交易表...');
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (tradesError) {
    console.error('❌ 查询交易失败:', tradesError);
  } else {
    console.log(`✅ 找到 ${trades?.length || 0} 笔交易`);
    trades?.forEach(trade => {
      console.log(`  - 交易 ${trade.id}: 市场${trade.market_id}, 金额${trade.amount} @ ${trade.price}`);
    });
  }

  // 3. 检查市场统计
  console.log('\n📊 3. 检查市场统计...');
  const { data: markets, error: marketsError } = await supabase
    .from('markets')
    .select('id, title, participants, volume, main_category')
    .order('id');

  if (marketsError) {
    console.error('❌ 查询市场失败:', marketsError);
  } else {
    console.log(`✅ 找到 ${markets?.length || 0} 个市场`);
    markets?.forEach(market => {
      console.log(`  - 市场${market.id} [${market.main_category}]: ${market.title}`);
      console.log(`    参与人数: ${market.participants || 0} 人`);
      console.log(`    交易量: $${market.volume || 0}`);
    });
  }

  // 4. 统计每个市场的实际参与人数（从订单表）
  console.log('\n🔢 4. 计算实际参与人数（从订单表）...');
  
  if (orders && orders.length > 0) {
    // 按市场ID分组
    const marketParticipants = {};
    orders.forEach(order => {
      if (!marketParticipants[order.market_id]) {
        marketParticipants[order.market_id] = new Set();
      }
      marketParticipants[order.market_id].add(order.maker_address);
    });

    Object.entries(marketParticipants).forEach(([marketId, addresses]) => {
      console.log(`  - 市场 ${marketId}: 实际有 ${addresses.size} 个唯一地址参与`);
      console.log(`    地址: ${Array.from(addresses).join(', ')}`);
    });
  } else {
    console.log('  ℹ️  暂无订单数据');
  }

  console.log('\n✅ 检查完成！');
  console.log('\n💡 如果订单表有数据，但 markets 表的 participants 是 0：');
  console.log('   → 说明下单是真实的，只是统计没有自动更新');
  console.log('   → 请运行 scripts/update-market-stats-trigger.sql 创建自动更新触发器');
}

checkOrders().catch(console.error);






