/**
 * 快速检查数据
 */

async function quickCheck() {
  console.log('🔍 快速检查...\n');
  
  const response = await fetch('http://localhost:3001/api/markets?categoryType=sports-gaming&limit=30');
  const result = await response.json();
  
  const count = result.data?.markets?.length || 0;
  
  if (count > 0) {
    console.log(`✅ 太好了！找到 ${count} 条数据！\n`);
    result.data.markets.forEach(m => {
      console.log(`📌 ${m.title} (ID: ${m.id})`);
    });
    console.log('\n🎉 现在访问前端应该能看到数据了：');
    console.log('   http://localhost:3001/sports-gaming\n');
  } else {
    console.log('❌ 还是没有数据\n');
    console.log('请确认 Supabase 中的数据：');
    console.log('1. categoryType = "sports-gaming" （注意大小写和横杠）');
    console.log('2. isActive = true （勾选框打勾）\n');
  }
}

quickCheck();










