/**
 * 等待后导入
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const markets = [
  {title: "CBA 2025-2026赛季总冠军是否为辽宁队？", category: "篮球", categoryType: "sports-gaming", probability: 42.8, volume: "$3,456,789", volumeNum: 3456789, participants: 2345, endDate: "May 15, 2026", trend: "up", change: "+8.3%", description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。", resolutionCriteria: ["CBA官方公告"], relatedMarkets: ["广东宏远"], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 80},
  {title: "中国男足是否晋级2026世界杯？", category: "足球", categoryType: "sports-gaming", probability: 18.3, volume: "$8,234,567", volumeNum: 8234567, participants: 5678, endDate: "Nov 30, 2025", trend: "down", change: "-12.5%", description: "预测中国男足是否晋级2026世界杯。", resolutionCriteria: ["FIFA官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "recommended", customWeight: 90, isHot: true},
  {title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？", category: "电竞", categoryType: "sports-gaming", probability: 78.5, volume: "$5,678,901", volumeNum: 5678901, participants: 4567, endDate: "Aug 31, 2026", trend: "up", change: "+15.2%", description: "预测KIC 2026冠军。", resolutionCriteria: ["官方公告"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 85, isTrending: true},
  {title: "Faker是否在2026年获得LCK春季赛MVP？", category: "国际电竞", categoryType: "sports-gaming", probability: 45.8, volume: "$4,123,456", volumeNum: 4123456, participants: 3456, endDate: "Apr 30, 2026", trend: "up", change: "+11.3%", description: "预测Faker获得LCK MVP。", resolutionCriteria: ["LCK官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "normal", customWeight: 70}
];

async function retry() {
  console.log('⏳ 等待 60 秒后重试...\n');
  
  for (let i = 60; i > 0; i--) {
    process.stdout.write(`\r   剩余 ${i} 秒...`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n\n📥 开始导入...\n');
  
  const { data, error } = await supabase.from('markets').insert(markets).select();
  
  if (error) {
    console.error('❌ 还是失败:', error.message);
    console.log('\n请在 Supabase 中：');
    console.log('1. 打开 Table Editor');
    console.log('2. 确认 markets 表存在');
    console.log('3. 点击 Settings > API > Reload schema cache\n');
    return;
  }
  
  console.log(`✅ 成功导入 ${data.length} 条数据！\n`);
  data.forEach((m, i) => console.log(`${i+1}. ${m.title} (ID: ${m.id})`));
  console.log('\n🎉 完成！访问 http://localhost:3001/sports-gaming 查看\n');
}

retry();










