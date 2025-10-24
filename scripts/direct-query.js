/**
 * 直接查询 Supabase 数据库
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function directQuery() {
  console.log('🔍 直接查询 Supabase 数据库...\n');
  
  try {
    // 查询所有数据（不加筛选）
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }
    
    console.log(`📊 数据库中共有 ${data.length} 条数据：\n`);
    
    if (data.length === 0) {
      console.log('⚠️  数据库是空的！\n');
      console.log('💡 解决方法：');
      console.log('1. 在 Supabase Table Editor 中检查 markets 表');
      console.log('2. 确认是否真的有数据');
      console.log('3. 如果有数据但这里查不到，说明表名可能不对\n');
      return;
    }
    
    // 显示每条数据的关键字段
    data.forEach((item, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`数据 ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  标题: ${item.title || '(空)'}`);
      console.log(`  categoryType: ${item.categoryType || '(空)'}`);
      console.log(`  isActive: ${item.isActive}`);
      console.log(`  createdAt: ${item.createdAt}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // 筛选符合条件的
    const filtered = data.filter(item => 
      item.categoryType === 'sports-gaming' && item.isActive === true
    );
    
    console.log(`✅ 符合条件的数据 (categoryType='sports-gaming' AND isActive=true): ${filtered.length} 条\n`);
    
    if (filtered.length === 0) {
      console.log('💡 问题找到了！数据存在，但字段值不对：\n');
      
      const wrongCategoryType = data.filter(item => item.categoryType !== 'sports-gaming');
      const wrongIsActive = data.filter(item => item.isActive !== true);
      
      if (wrongCategoryType.length > 0) {
        console.log('❌ 这些数据的 categoryType 不是 "sports-gaming":');
        wrongCategoryType.forEach(item => {
          console.log(`   ID ${item.id}: categoryType = "${item.categoryType}"`);
        });
        console.log('');
      }
      
      if (wrongIsActive.length > 0) {
        console.log('❌ 这些数据的 isActive 不是 true:');
        wrongIsActive.forEach(item => {
          console.log(`   ID ${item.id}: isActive = ${item.isActive}`);
        });
        console.log('');
      }
      
      console.log('🔧 修复方法：');
      console.log('1. 在 Supabase Table Editor 中点击 markets 表');
      console.log('2. 找到上面列出的数据行');
      console.log('3. 双击编辑，修改字段值');
      console.log('4. categoryType 改为: sports-gaming');
      console.log('5. isActive 勾选为: true');
      console.log('6. 保存\n');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

directQuery();










