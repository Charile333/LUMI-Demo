// 🔧 直接在 Supabase 中添加 orders 表的列
// 使用 Supabase 客户端执行 SQL

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function addOrdersColumns() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 添加 orders 表字段 - 链上交易支持');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    console.log('   需要: NEXT_PUBLIC_SUPABASE_URL');
    console.log('   需要: SUPABASE_SERVICE_ROLE_KEY (需要 service role key 才能执行 DDL)\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 使用 Supabase 的 REST API 直接执行 SQL
  // 注意：Supabase JS 客户端不直接支持执行 DDL，需要使用 REST API 或 SQL Editor
  console.log('📝 准备执行 SQL 迁移...\n');

  // 方法1: 尝试通过 REST API（需要 service role key）
  const sqlStatements = [
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS condition_id TEXT;',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_signature TEXT;',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_order_data JSONB;'
  ];

  console.log('🔍 检测当前 orders 表结构...\n');

  // 先检查列是否存在
  const { data: existingColumns, error: checkError } = await supabase
    .from('orders')
    .select('*')
    .limit(0);

  if (checkError) {
    console.error('❌ 无法访问 orders 表:', checkError.message);
    return;
  }

  console.log('✅ orders 表存在\n');

  // 由于 Supabase JS 客户端不支持直接执行 DDL，我们需要使用 REST API
  // 或者提供手动执行的 SQL
  console.log('📋 由于 Supabase JS 客户端限制，请手动执行以下 SQL：\n');
  console.log('='.repeat(60));
  console.log('请在 Supabase Dashboard > SQL Editor 中执行：');
  console.log('='.repeat(60) + '\n');

  sqlStatements.forEach((sql, index) => {
    console.log(`${index + 1}. ${sql}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('执行步骤：');
  console.log('   1. 打开 https://supabase.com/dashboard');
  console.log('   2. 选择你的项目');
  console.log('   3. 点击左侧菜单 "SQL Editor"');
  console.log('   4. 粘贴上面的 SQL 语句');
  console.log('   5. 点击 "Run" 执行');
  console.log('='.repeat(60) + '\n');

  // 尝试通过 HTTP 请求直接执行（如果 Supabase 支持）
  try {
    console.log('🔍 尝试通过 REST API 执行...\n');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: sqlStatements.join('\n')
      })
    }).catch(() => null);

    if (response && response.ok) {
      console.log('✅ 通过 REST API 执行成功！\n');
    } else {
      console.log('⚠️ REST API 不可用，请使用手动执行方式\n');
    }
  } catch (error) {
    console.log('⚠️ REST API 执行失败，请使用手动执行方式\n');
  }

  // 验证字段（如果可以）
  console.log('🔍 验证字段...\n');
  try {
    // 尝试查询包含新字段的数据（如果字段存在，不会报错）
    const { error: testError } = await supabase
      .from('orders')
      .select('condition_id, ctf_signature, ctf_order_data')
      .limit(1);

    if (testError && testError.message.includes('column') && testError.message.includes('does not exist')) {
      console.log('❌ 字段尚未添加，请执行上面的 SQL\n');
    } else {
      console.log('✅ 字段已存在或查询成功！\n');
      console.log('💡 如果之前有错误，现在应该已经修复了\n');
    }
  } catch (error) {
    console.log('⚠️ 无法验证字段状态:', error.message);
    console.log('💡 请手动执行 SQL 并验证\n');
  }

  console.log('='.repeat(60) + '\n');
}

addOrdersColumns().catch(console.error);

