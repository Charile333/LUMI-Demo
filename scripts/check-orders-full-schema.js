// 🔍 检查 orders 表的完整结构
// 检查所有必需字段，包括基本字段

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkOrdersFullSchema() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查 orders 表完整结构');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 检查所有必需字段（包括基本字段和新增字段）
  const allRequiredColumns = [
    // 基本字段
    'id',
    'order_id',
    'market_id',
    'question_id',
    'user_address',
    'side',
    'outcome',
    'price',
    'quantity',
    'filled_quantity',
    'status',
    'created_at',
    'updated_at',
    // 签名字段
    'signature',
    // 链上交易字段
    'condition_id',
    'ctf_signature',
    'ctf_order_data',
    'expiration',
    'salt',
    'nonce'
  ];

  console.log('📋 检查所有必需字段...\n');

  const missingColumns = [];
  const existingColumns = [];

  for (const column of allRequiredColumns) {
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
          console.log(`⚠️ ${column}: 无法检查 (${error.message.substring(0, 50)}...)`);
        }
      } else {
        existingColumns.push(column);
        console.log(`✅ ${column}: 已存在`);
      }
    } catch (error) {
      console.log(`⚠️ ${column}: 检查失败 (${error.message.substring(0, 50)}...)`);
    }
  }

  console.log('');

  if (missingColumns.length === 0) {
    console.log('✅ 所有必需字段都已存在！\n');
    console.log('💡 orders 表结构完整\n');
  } else {
    console.log('❌ 缺少以下字段：\n');
    missingColumns.forEach(col => {
      console.log(`   - ${col}`);
    });
    console.log('\n💡 请执行以下 SQL 添加字段：\n');
    console.log('='.repeat(60));
    
    // 根据字段类型生成 SQL
    missingColumns.forEach(col => {
      let sql = '';
      
      if (col === 'order_id') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id VARCHAR(100) UNIQUE NOT NULL;';
      } else if (col === 'condition_id') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS condition_id VARCHAR(200);';
      } else if (col === 'ctf_order_data') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_order_data JSONB;';
      } else if (col === 'ctf_signature') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_signature TEXT;';
      } else if (col === 'expiration' || col === 'nonce') {
        sql = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col} BIGINT;`;
      } else if (col === 'salt') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS salt VARCHAR(100);';
      } else if (col === 'signature') {
        sql = 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS signature TEXT;';
      } else {
        // 其他基本字段
        sql = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col} TEXT;`;
      }
      
      console.log(sql);
    });
    
    console.log('='.repeat(60) + '\n');
    console.log('⚠️ 注意：如果缺少基本字段（如 order_id），可能需要重新创建表');
    console.log('   建议：');
    console.log('   1. 备份现有数据（如果有）');
    console.log('   2. 执行 database/create-orders-table.sql 重新创建表');
    console.log('   3. 或者手动添加缺失的字段\n');
  }

  // 尝试获取表的完整结构信息
  console.log('\n📊 尝试获取表结构信息...\n');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'orders'
        ORDER BY ordinal_position;
      `
    }).catch(() => ({ data: null, error: 'RPC not available' }));

    if (!error && data) {
      console.log('✅ 表结构信息：\n');
      data.forEach((col) => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      console.log('');
    } else {
      console.log('⚠️ 无法通过 RPC 获取表结构');
      console.log('💡 请在 Supabase Dashboard > Table Editor > orders 中查看表结构\n');
    }
  } catch (error) {
    console.log('⚠️ 获取表结构失败:', error.message);
  }

  console.log('='.repeat(60) + '\n');
}

checkOrdersFullSchema().catch(console.error);

