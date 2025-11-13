// 🔄 刷新 Supabase schema cache
// 解决 "column not found in schema cache" 错误

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function refreshSchemaCache() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 刷新 Supabase Schema Cache');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📝 尝试刷新 schema cache...\n');

  // 方法1: 执行一个简单的查询来"预热" schema cache
  try {
    console.log('1️⃣ 执行查询以刷新 cache...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ⚠️ 查询失败: ${error.message}\n`);
    } else {
      console.log('   ✅ 查询成功，schema cache 应该已更新\n');
    }
  } catch (error) {
    console.log(`   ⚠️ 查询异常: ${error.message}\n`);
  }

  // 方法2: 验证关键字段
  console.log('2️⃣ 验证关键字段是否可访问...\n');
  const criticalColumns = ['order_id', 'condition_id', 'expiration', 'salt', 'nonce'];
  
  for (const col of criticalColumns) {
    try {
      const { error } = await supabase
        .from('orders')
        .select(col)
        .limit(1);

      if (error) {
        console.log(`   ❌ ${col}: 无法访问 - ${error.message}`);
      } else {
        console.log(`   ✅ ${col}: 可访问`);
      }
    } catch (error) {
      console.log(`   ⚠️ ${col}: 检查失败 - ${error.message}`);
    }
  }

  console.log('\n💡 Supabase schema cache 刷新方法：');
  console.log('   1. 等待几分钟让 Supabase 自动刷新 cache');
  console.log('   2. 在 Supabase Dashboard 中：');
  console.log('      - 打开 Settings > API');
  console.log('      - 点击 "Restart" 或 "Refresh"（如果可用）');
  console.log('   3. 重启应用服务器（如果是本地开发）');
  console.log('   4. 清除浏览器缓存并重新加载页面\n');

  console.log('='.repeat(60) + '\n');
}

refreshSchemaCache().catch(console.error);

