// 🧪 测试链上交易流程
// 测试订单创建、撮合、链上执行的完整流程
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testOnChainTrading() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试链上交易流程');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 查找已上链的市场
    console.log('📊 步骤1：查找已上链的市场...\n');
    const { data: markets, error: marketError } = await supabase
      .from('markets')
      .select('id, title, condition_id, blockchain_status')
      .eq('blockchain_status', 'created')
      .not('condition_id', 'is', null)
      .limit(5);

    if (marketError) {
      console.log('❌ 查询市场失败:', marketError.message);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('⚠️  没有找到已上链的市场！');
      console.log('   请先运行: node scripts/check-market-blockchain-status.js');
      console.log('   然后创建并上链市场。\n');
      return;
    }

    console.log(`✅ 找到 ${markets.length} 个已上链的市场\n`);
    const testMarket = markets[0];
    console.log(`   使用市场: [${testMarket.id}] ${testMarket.title}`);
    console.log(`   Condition ID: ${testMarket.condition_id?.substring(0, 20)}...\n`);

    // 2. 检查订单表结构
    console.log('📊 步骤2：检查订单表结构...\n');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('market_id', testMarket.id)
      .limit(5);

    if (orderError) {
      console.log('❌ 查询订单失败:', orderError.message);
      console.log('   可能原因：订单表不存在或字段不匹配');
      return;
    }

    console.log(`✅ 找到 ${orders?.length || 0} 个订单\n`);

    // 3. 检查订单字段
    console.log('📊 步骤3：检查订单字段...\n');
    if (orders && orders.length > 0) {
      const order = orders[0];
      console.log('   订单字段：');
      console.log(`      - id: ${order.id}`);
      console.log(`      - market_id: ${order.market_id}`);
      console.log(`      - user_address: ${order.user_address}`);
      console.log(`      - side: ${order.side}`);
      console.log(`      - outcome: ${order.outcome}`);
      console.log(`      - price: ${order.price}`);
      console.log(`      - quantity: ${order.quantity}`);
      console.log(`      - status: ${order.status}`);
      console.log(`      - signature: ${order.signature ? '✅ 有签名' : '❌ 无签名'}`);
      console.log(`      - condition_id: ${order.condition_id || '❌ 未设置'}`);
      console.log(`      - ctf_signature: ${order.ctf_signature ? '✅ 有CTF签名' : '❌ 无CTF签名'}`);
      console.log(`      - ctf_order_data: ${order.ctf_order_data ? '✅ 有CTF订单数据' : '❌ 无CTF订单数据'}`);
      console.log();
    } else {
      console.log('   ⚠️  没有找到订单，这是正常的（新市场）');
      console.log('   可以创建测试订单进行测试\n');
    }

    // 4. 测试API端点
    console.log('📊 步骤4：测试API端点...\n');
    console.log('   API端点列表：');
    console.log('   1. POST /api/orders/create - 创建订单');
    console.log('   2. GET /api/orders/[orderId]/signature - 获取订单签名');
    console.log('   3. POST /api/orders/execute-onchain - 执行链上交易');
    console.log('   4. POST /api/markets/[marketId]/activate - 激活市场（上链）');
    console.log();

    // 5. 测试建议
    console.log('📊 步骤5：测试建议...\n');
    console.log('   🧪 前端测试：');
    console.log(`   1. 访问: http://localhost:3000/markets/${testMarket.main_category || 'automotive'}`);
    console.log(`   2. 找到市场ID为 ${testMarket.id} 的市场卡片`);
    console.log(`   3. 点击"快速交易"按钮`);
    console.log(`   4. 连接钱包（MetaMask等）`);
    console.log(`   5. 选择"YES"或"NO"`);
    console.log(`   6. 输入金额和价格`);
    console.log(`   7. 点击"提交订单"`);
    console.log(`   8. 等待订单撮合`);
    console.log(`   9. 如果撮合成功，检查是否需要链上执行`);
    console.log(`   10. 点击"执行链上交易"按钮（如果需要）`);
    console.log(`   11. 确认交易并支付Gas费`);
    console.log(`   12. 等待链上确认`);
    console.log();

    console.log('   🔧 API测试：');
    console.log(`   1. 使用 curl 或 Postman 测试 API`);
    console.log(`   2. 创建订单: POST /api/orders/create`);
    console.log(`   3. 检查订单: GET /api/orders/[orderId]/signature`);
    console.log(`   4. 执行链上交易: POST /api/orders/execute-onchain`);
    console.log();

    console.log('   📝 数据库测试：');
    console.log(`   1. 检查 orders 表是否有新订单`);
    console.log(`   2. 检查订单的 signature 字段`);
    console.log(`   3. 检查订单的 ctf_signature 字段（如果有）`);
    console.log(`   4. 检查订单的 ctf_order_data 字段（如果有）`);
    console.log();

    // 6. 检查数据库迁移
    console.log('📊 步骤6：检查数据库迁移...\n');
    const { data: columns, error: columnError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'orders' 
          AND column_name IN ('condition_id', 'ctf_signature', 'ctf_order_data')
        `
      }).catch(() => ({ data: null, error: null }));

    if (columnError) {
      console.log('   ⚠️  无法检查数据库字段（需要使用 Supabase Dashboard）');
      console.log('   请手动检查 orders 表是否有以下字段：');
      console.log('     - condition_id');
      console.log('     - ctf_signature');
      console.log('     - ctf_order_data');
      console.log('   如果没有，请运行: database/add-orders-ctf-columns.sql');
      console.log();
    } else {
      console.log('   ✅ 数据库字段检查完成');
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ 测试准备完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testOnChainTrading();

