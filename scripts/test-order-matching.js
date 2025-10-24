// 🧪 测试订单匹配（模拟对手单）

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testMatching() {
  console.log('\n🧪 测试订单匹配...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. 查看现有订单
  console.log('📋 1. 查看现有订单...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('❌ 查询失败:', ordersError);
    return;
  }

  console.log(`✅ 找到 ${orders?.length || 0} 个订单：`);
  orders?.forEach(order => {
    console.log(`  - 市场${order.market_id}: ${order.side.toUpperCase()} @ ${order.price}, 剩余 ${order.remaining_amount}`);
  });

  // 2. 检查交易记录
  console.log('\n💰 2. 检查交易记录...');
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (tradesError) {
    console.error('❌ 查询失败:', tradesError);
  } else {
    console.log(`✅ 找到 ${trades?.length || 0} 笔交易`);
    if (trades && trades.length > 0) {
      trades.forEach(trade => {
        console.log(`  - 市场${trade.market_id}: ${trade.amount} @ ${trade.price} = $${(parseFloat(trade.amount) * parseFloat(trade.price)).toFixed(2)}`);
      });
    }
  }

  // 3. 说明
  console.log('\n📝 说明：');
  console.log('');
  console.log('  为什么交易量是 $0？');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  您的订单：买 YES @ $0.50  ← 等待匹配');
  console.log('  需要的：卖 YES @ $0.50  ← 还没有人下卖单');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  交易量 = 已成交的订单金额');
  console.log('  因为还没有成交，所以交易量 = $0');
  console.log('');
  console.log('  如何测试成交？');
  console.log('  1. 用另一个钱包连接');
  console.log('  2. 在同一市场下相反的单：');
  console.log('     - 如果您买了 YES，对方卖 YES');
  console.log('     - 价格相同或更好');
  console.log('  3. 订单自动匹配成交');
  console.log('  4. 交易量更新！');
  console.log('');
}

testMatching().catch(console.error);






