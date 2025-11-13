// 🔍 检查 orders 表结构
// 验证是否已添加 condition_id 等字段

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkOrdersTableSchema() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 orders 表结构');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 需要检查的字段（包括所有链上交易相关的字段）
  const requiredColumns = [
    'condition_id',
    'ctf_signature', 
    'ctf_order_data',
    'expiration',
    'salt',
    'nonce'
  ];

  console.log('📋 检查以下字段是否存在：\n');
  requiredColumns.forEach(col => {
    console.log(`   - ${col}`);
  });
  console.log('');

  // 尝试查询每个字段
  const missingColumns = [];
  const existingColumns = [];

  for (const column of requiredColumns) {
    try {
      // 尝试查询该字段
      const { error } = await supabase
        .from('orders')
        .select(column)
        .limit(1);

      if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          missingColumns.push(column);
          console.log(`❌ ${column}: 不存在`);
        } else {
          // 其他错误（可能是权限问题等）
          console.log(`⚠️ ${column}: 无法检查 (${error.message})`);
        }
      } else {
        existingColumns.push(column);
        console.log(`✅ ${column}: 已存在`);
      }
    } catch (error) {
      console.log(`⚠️ ${column}: 检查失败 (${error.message})`);
    }
  }

  console.log('');

  if (missingColumns.length === 0) {
    console.log('✅ 所有必需字段都已存在！\n');
    console.log('💡 orders 表已准备好支持链上交易\n');
  } else {
    console.log('❌ 缺少以下字段：\n');
    missingColumns.forEach(col => {
      console.log(`   - ${col}`);
    });
    console.log('\n💡 请执行以下 SQL 添加字段：\n');
    console.log('='.repeat(60));
    missingColumns.forEach(col => {
      let sqlType = 'TEXT';
      if (col === 'ctf_order_data') {
        sqlType = 'JSONB';
      } else if (col === 'expiration' || col === 'nonce') {
        sqlType = 'BIGINT';
      } else if (col === 'salt') {
        sqlType = 'VARCHAR(100)';
      } else if (col === 'condition_id') {
        sqlType = 'VARCHAR(200)';
      }
      console.log(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col} ${sqlType};`);
    });
    console.log('='.repeat(60) + '\n');
    console.log('执行步骤：');
    console.log('   1. 打开 Supabase Dashboard > SQL Editor');
    console.log('   2. 粘贴上面的 SQL');
    console.log('   3. 点击 Run 执行');
    console.log('   4. 然后再次运行此脚本验证\n');
  }

  console.log('='.repeat(60) + '\n');
}

checkOrdersTableSchema().catch(console.error);

