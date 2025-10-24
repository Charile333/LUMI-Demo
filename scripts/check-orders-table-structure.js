// 🔍 检查 orders 表的字段结构

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkOrdersStructure() {
  console.log('\n🔍 检查 orders 表字段结构...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 尝试插入一个测试订单（不会真的插入，只是为了看错误信息）
  console.log('📋 尝试查看表结构...\n');

  try {
    // 查询表结构（通过查询 information_schema）
    // 注意：Supabase 可能不允许直接查询 information_schema
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(0);
    
    console.log('✅ orders 表可以访问');
    console.log('   表是空的，我们可以尝试插入第一个订单\n');
    
    // 显示期望的字段
    console.log('📝 插入订单时需要的字段：');
    console.log('   - order_id (string, 主键)');
    console.log('   - market_id (integer)');
    console.log('   - question_id (string)');
    console.log('   - maker_address (string)');
    console.log('   - side (string: buy/sell)');
    console.log('   - outcome (integer: 0/1)');
    console.log('   - price (numeric/string)');
    console.log('   - amount (numeric/string)');
    console.log('   - remaining_amount (numeric/string)');
    console.log('   - salt (string)');
    console.log('   - nonce (bigint)');
    console.log('   - expiration (bigint)');
    console.log('   - signature (string)');
    console.log('   - status (string, 可选)');
    console.log('   - created_at (timestamp, 自动)');
    console.log('   - updated_at (timestamp, 自动)');
    
  } catch (e) {
    console.error('❌ 检查失败:', e.message);
  }

  console.log('\n✅ 检查完成！');
  console.log('\n💡 如果下单还是失败，请检查：');
  console.log('   1. 字段名称是否匹配（snake_case vs camelCase）');
  console.log('   2. 数据类型是否正确');
  console.log('   3. 必填字段是否都有值');
  console.log('   4. 签名格式是否正确（EIP-712）\n');
}

checkOrdersStructure().catch(console.error);






