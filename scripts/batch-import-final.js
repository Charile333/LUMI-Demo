/**
 * 批量导入体育市场数据（最终版）
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const markets = [
  {
    title: "中国男足是否晋级2026世界杯？",
    category: "足球",
    categoryType: "sports-gaming",
    probability: 18.3,
    volume: "$8,234,567",
    volumeNum: 8234567,
    participants: 5678,
    endDate: "Nov 30, 2025",
    trend: "down",
    change: "-12.5%",
    description: "此市场预测中国国家男子足球队是否能够晋级2026年FIFA世界杯决赛圈。",
    resolutionCriteria: ["FIFA官方公告", "亚足联官方结果"],
    relatedMarkets: ["日本晋级预测", "韩国晋级预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 90,
    isHot: true
  },
  {
    title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？",
    category: "电竞",
    categoryType: "sports-gaming",
    probability: 78.5,
    volume: "$5,678,901",
    volumeNum: 5678901,
    participants: 4567,
    endDate: "Aug 31, 2026",
    trend: "up",
    change: "+15.2%",
    description: "此市场预测2026年王者荣耀世界冠军杯（KIC）的冠军是否来自中国赛区。",
    resolutionCriteria: ["王者荣耀官方公告", "KIC官方结果"],
    relatedMarkets: ["AG超玩会冠军预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85,
    isTrending: true
  },
  {
    title: "Faker是否在2026年获得LCK春季赛MVP？",
    category: "国际电竞",
    categoryType: "sports-gaming",
    probability: 45.8,
    volume: "$4,123,456",
    volumeNum: 4123456,
    participants: 3456,
    endDate: "Apr 30, 2026",
    trend: "up",
    change: "+11.3%",
    description: "此市场预测韩国电竞选手Faker是否能够在2026年LCK春季赛中获得MVP称号。",
    resolutionCriteria: ["LCK官方公告", "Riot Games声明"],
    relatedMarkets: ["T1春季赛冠军"],
    isActive: true,
    source: "custom",
    priorityLevel: "normal",
    customWeight: 70
  },
  {
    title: "T1是否获得英雄联盟2026全球总决赛冠军？",
    category: "国际电竞",
    categoryType: "sports-gaming",
    probability: 28.6,
    volume: "$6,789,012",
    volumeNum: 6789012,
    participants: 5234,
    endDate: "Nov 30, 2026",
    trend: "down",
    change: "-6.4%",
    description: "此市场预测韩国T1战队是否能够获得2026年英雄联盟全球总决赛冠军。",
    resolutionCriteria: ["Riot Games官方公告"],
    relatedMarkets: ["LPL战队夺冠预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 75
  },
  {
    title: "中国LPL战队是否获得Worlds 2026冠军？",
    category: "国际电竞",
    categoryType: "sports-gaming",
    probability: 52.3,
    volume: "$5,456,789",
    volumeNum: 5456789,
    participants: 4123,
    endDate: "Nov 30, 2026",
    trend: "up",
    change: "+13.7%",
    description: "此市场预测来自中国LPL的战队是否能够获得2026年英雄联盟全球总决赛冠军。",
    resolutionCriteria: ["Riot Games官方公告"],
    relatedMarkets: ["T1夺冠预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85,
    isHot: true
  },
  {
    title: "中国女排是否获得2026世界女排联赛冠军？",
    category: "排球",
    categoryType: "sports-gaming",
    probability: 42.5,
    volume: "$2,890,123",
    volumeNum: 2890123,
    participants: 1876,
    endDate: "Jul 31, 2026",
    trend: "up",
    change: "+8.6%",
    description: "此市场预测中国国家女子排球队是否能够获得2026年世界女排联赛冠军。",
    resolutionCriteria: ["国际排联官方公告"],
    relatedMarkets: ["中国女排四强预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 70
  }
];

async function batchImport() {
  console.log('🚀 批量导入更多市场数据...\n');
  
  const { data, error } = await supabase
    .from('markets')
    .insert(markets)
    .select();
  
  if (error) {
    console.error('❌ 导入失败:', error.message);
    return;
  }
  
  console.log(`✅ 成功导入 ${data.length} 条数据！\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  data.forEach((m, i) => {
    console.log(`${i + 1}. ${m.title}`);
    console.log(`   ID: ${m.id} | 分类: ${m.category} | 概率: ${m.probability}%`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🎉 导入完成！现在总共有 8 条体育市场数据！\n');
  console.log('📍 刷新页面查看：http://localhost:3001/sports-gaming\n');
}

batchImport();










