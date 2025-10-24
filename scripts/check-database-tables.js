// 🔍 检查 Supabase 数据库表结构

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  console.log('\n🔍 检查数据库表结构...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 检查 markets 表
  console.log('📊 1. 检查 markets 表...');
  try {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ markets 表不存在或无法访问:', error.message);
    } else {
      console.log('✅ markets 表存在');
      if (data && data.length > 0) {
        console.log('   字段:', Object.keys(data[0]).join(', '));
      }
    }
  } catch (e) {
    console.error('❌ markets 表检查失败:', e.message);
  }

  // 检查 orders 表
  console.log('\n📋 2. 检查 orders 表...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ orders 表不存在或无法访问:', error.message);
      console.log('\n💡 解决方案：');
      console.log('   1. 打开 Supabase Dashboard');
      console.log('   2. 进入 SQL Editor');
      console.log('   3. 运行以下三个脚本（按顺序）：');
      console.log('      - scripts/supabase-step1-cleanup.sql');
      console.log('      - scripts/supabase-step2-tables.sql');
      console.log('      - scripts/supabase-step3-extras.sql');
    } else {
      console.log('✅ orders 表存在');
      if (data && data.length > 0) {
        console.log('   字段:', Object.keys(data[0]).join(', '));
        console.log('   记录数:', data.length);
      } else {
        console.log('   ⚠️  表是空的（没有订单）');
      }
    }
  } catch (e) {
    console.error('❌ orders 表检查失败:', e.message);
  }

  // 检查 trades 表
  console.log('\n💰 3. 检查 trades 表...');
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ trades 表不存在:', error.message);
    } else {
      console.log('✅ trades 表存在');
      if (data && data.length > 0) {
        console.log('   记录数:', data.length);
      }
    }
  } catch (e) {
    console.error('❌ trades 表检查失败:', e.message);
  }

  console.log('\n✅ 检查完成！\n');
}

checkTables().catch(console.error);






