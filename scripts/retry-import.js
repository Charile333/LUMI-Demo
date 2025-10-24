/**
 * 等待后重试导入
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const markets = [
  {title: "CBA 2025-2026赛季总冠军是否为辽宁队？", category: "篮球", categoryType: "sports-gaming", probability: 42.8, volume: "$3,456,789", volumeNum: 3456789, participants: 2345, endDate: "May 15, 2026", trend: "up", change: "+8.3%", description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。", resolutionCriteria: ["CBA官方公告"], relatedMarkets: ["广东宏远"], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 80, isHot: true},
  {title: "中国男足是否晋级2026世界杯？", category: "足球", categoryType: "sports-gaming", probability: 18.3, volume: "$8,234,567", volumeNum: 8234567, participants: 5678, endDate: "Nov 30, 2025", trend: "down", change: "-12.5%", description: "预测中国男足是否晋级2026世界杯。", resolutionCriteria: ["FIFA官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "recommended", customWeight: 90, isHot: true},
  {title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？", category: "电竞", categoryType: "sports-gaming", probability: 78.5, volume: "$5,678,901", volumeNum: 5678901, participants: 4567, endDate: "Aug 31, 2026", trend: "up", change: "+15.2%", description: "预测KIC 2026冠军。", resolutionCriteria: ["官方公告"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 85, isTrending: true},
  {title: "Faker是否在2026年获得LCK春季赛MVP？", category: "国际电竞", categoryType: "sports-gaming", probability: 45.8, volume: "$4,123,456", volumeNum: 4123456, participants: 3456, endDate: "Apr 30, 2026", trend: "up", change: "+11.3%", description: "预测Faker获得LCK MVP。", resolutionCriteria: ["LCK官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "normal", customWeight: 70}
];

async function retryImport() {
  console.log('⏳ 等待 Supabase schema cache 更新...\n');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`📍 第 ${attempt} 次尝试...`);
    
    const { data, error } = await supabase
      .from('markets')
      .insert(markets)
      .select();
    
    if (!error) {
      console.log(`\n✅ 成功导入 ${data.length} 条数据！\n`);
      data.forEach((m, i) => console.log(`${i+1}. ${m.title} (ID: ${m.id})`));
      console.log('\n🎉 完成！访问 http://localhost:3001/sports-gaming 查看效果\n');
      return;
    }
    
    if (attempt < 3) {
      console.log(`   等待 20 秒后重试...\n`);
      await new Promise(r => setTimeout(r, 20000));
    } else {
      console.error('\n❌ 3次尝试均失败:', error.message);
      console.log('\n💡 解决方案：');
      console.log('1. 在 Supabase 控制台刷新页面');
      console.log('2. 访问 Settings > API > 点击 "Reload schema cache"');
      console.log('3. 或者等待1-2分钟后再次运行此脚本\n');
    }
  }
}

retryImport();










