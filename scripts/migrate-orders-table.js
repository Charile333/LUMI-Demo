// 🔧 迁移 orders 表，添加链上交易相关字段
// 在 Supabase 中执行数据库迁移

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function migrateOrdersTable() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 迁移 orders 表 - 添加链上交易字段');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    console.log('   需要: NEXT_PUBLIC_SUPABASE_URL');
    console.log('   需要: SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // SQL 迁移语句
  const migrationSQL = `
    -- 添加 condition_id 列
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS condition_id TEXT;
    
    -- 添加 ctf_signature 列
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_signature TEXT;
    
    -- 添加 ctf_order_data 列
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS ctf_order_data JSONB;
  `;

  console.log('📝 执行迁移 SQL...\n');
  console.log('SQL:');
  console.log(migrationSQL.trim() + '\n');

  try {
    // 使用 Supabase RPC 执行 SQL（如果有）
    // 或者直接使用 SQL 查询
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    }).catch(async () => {
      // 如果 RPC 不存在，尝试使用 Supabase 的 PostgREST API
      // 或者手动执行 SQL
      console.log('⚠️ 无法通过 RPC 执行 SQL，请手动在 Supabase Dashboard 中执行\n');
      console.log('📋 手动执行步骤：');
      console.log('   1. 打开 Supabase Dashboard');
      console.log('   2. 进入 SQL Editor');
      console.log('   3. 执行以下 SQL：\n');
      console.log(migrationSQL.trim() + '\n');
      return { data: null, error: 'RPC not available' };
    });

    if (error && error.message !== 'RPC not available') {
      console.error('❌ 迁移失败:', error.message);
      console.log('\n💡 如果 RPC 不可用，请手动在 Supabase Dashboard 中执行 SQL\n');
      return;
    }

    if (error && error.message === 'RPC not available') {
      // 已经显示了手动执行步骤
      return;
    }

    console.log('✅ 迁移执行成功！\n');

    // 验证字段已添加
    console.log('🔍 验证字段是否已添加...\n');
    const { data: columns, error: verifyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type
          FROM information_schema.columns
          WHERE table_name = 'orders'
            AND column_name IN ('condition_id', 'ctf_signature', 'ctf_order_data')
          ORDER BY column_name;
        `
      })
      .catch(() => {
        // 如果无法通过 RPC 验证，尝试直接查询
        console.log('⚠️ 无法通过 RPC 验证，请手动在 Supabase Dashboard 中验证\n');
        return { data: null, error: 'RPC not available' };
      });

    if (verifyError && verifyError.message !== 'RPC not available') {
      console.error('⚠️ 验证失败:', verifyError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ 验证成功！已添加的字段：\n');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
      console.log('');
    } else if (!verifyError || verifyError.message === 'RPC not available') {
      console.log('💡 请手动在 Supabase Dashboard 中验证字段是否已添加\n');
    }

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.log('\n💡 请手动在 Supabase Dashboard 中执行以下 SQL：\n');
    console.log(migrationSQL.trim() + '\n');
  }

  console.log('='.repeat(60) + '\n');
}

migrateOrdersTable().catch(console.error);

