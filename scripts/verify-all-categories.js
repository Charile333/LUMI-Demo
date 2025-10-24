/**
 * 验证所有分类的数据
 */

const categories = [
  { type: 'sports-gaming', name: '体育与电竞' },
  { type: 'tech-ai', name: '科技与AI' },
  { type: 'automotive', name: '汽车与新能源' },
  { type: 'entertainment', name: '娱乐' },
  { type: 'smart-devices', name: '智能设备' },
  { type: 'economy-social', name: '经济与社会' },
  { type: 'emerging', name: '新兴市场' }
];

async function verifyCategory(category) {
  try {
    const response = await fetch(`http://localhost:3001/api/markets?categoryType=${category.type}&limit=30`);
    const result = await response.json();
    
    if (result.success) {
      const count = result.data.markets.length;
      const icon = count > 0 ? '✅' : '⚠️';
      console.log(`${icon} ${category.name} (${category.type}): ${count} 条数据`);
      
      if (count > 0) {
        result.data.markets.forEach((m, i) => {
          console.log(`   ${i + 1}. ${m.title}`);
        });
      }
    } else {
      console.log(`❌ ${category.name}: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ ${category.name}: 网络错误`);
  }
  console.log('');
}

async function verifyAll() {
  console.log('🔍 验证所有分类的数据...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const category of categories) {
    await verifyCategory(category);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ 验证完成！\n');
  console.log('📱 可以访问以下页面查看：\n');
  categories.forEach(cat => {
    console.log(`   http://localhost:3001/${cat.type}`);
  });
  console.log('');
}

verifyAll();










