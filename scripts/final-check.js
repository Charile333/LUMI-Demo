/**
 * 最终验证
 */

async function finalCheck() {
  console.log('🔍 最终验证...\n');
  
  // 检查 API
  const response = await fetch('http://localhost:3001/api/markets?categoryType=sports-gaming');
  const result = await response.json();
  
  const count = result.data?.markets?.length || 0;
  
  console.log(`📊 API 返回数据量: ${count} 条\n`);
  
  if (count > 0) {
    console.log('✅✅✅ 成功了！数据已经可以显示！\n');
    
    result.data.markets.forEach((m, i) => {
      console.log(`${i + 1}. ${m.title}`);
      console.log(`   ID: ${m.id} | 概率: ${m.probability}% | 分类: ${m.category}`);
      console.log('');
    });
    
    console.log('🎉 恭喜！您的动态市场卡片已经生效！\n');
    console.log('📍 访问查看：');
    console.log('   ✅ http://localhost:3001/sports-gaming');
    console.log('   ✅ http://localhost:3001/admin/markets\n');
    
    console.log('💡 接下来可以：');
    console.log('   1. 在后台继续创建更多市场');
    console.log('   2. 修改现有市场的数据');
    console.log('   3. 查看其他页面（tech-ai, entertainment 等）\n');
    
  } else {
    console.log('❌ 还是没有数据\n');
    console.log('请确认：');
    console.log('1. 后台创建时有看到成功提示吗？');
    console.log('2. 主分类选择的是 "体育与游戏" 吗？');
    console.log('3. "激活显示" 勾选了吗？\n');
  }
}

finalCheck();










