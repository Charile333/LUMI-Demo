/**
 * 显示数据库中所有体育市场数据
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showAllData() {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('categoryType', 'sports-gaming')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('错误:', error.message);
    return;
  }
  
  console.log(`\n📊 数据库中共有 ${data.length} 条体育市场数据：\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  data.forEach((m, i) => {
    console.log(`${i + 1}. ${m.title}`);
    console.log(`   ID: ${m.id}`);
    console.log(`   分类: ${m.category}`);
    console.log(`   概率: ${m.probability}%`);
    console.log(`   优先级: ${m.priorityLevel}`);
    console.log(`   权重: ${m.customWeight}`);
    console.log(`   激活: ${m.isActive}`);
    console.log('');
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ 这些数据就是前端显示的内容！\n');
}

showAllData();










