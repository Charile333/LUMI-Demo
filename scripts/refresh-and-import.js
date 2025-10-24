/**
 * 刷新 schema 并导入数据
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 体育与游戏测试数据
const sportsGamingMarkets = [
  {
    title: "CBA 2025-2026赛季总冠军是否为辽宁队？",
    category: "篮球",
    categoryType: "sports-gaming",
    probability: 42.8,
    volume: "$3,456,789",
    volumeNum: 3456789,
    participants: 2345,
    endDate: "May 15, 2026",
    trend: "up",
    change: "+8.3%",
    description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。",
    resolutionCriteria: ["数据来源：CBA联赛官方公告、总决赛官方结果。", "冠军定义：在2025-2026赛季总决赛中获胜的球队。"],
    relatedMarkets: ["广东宏远是否获得CBA 2025-2026赛季冠军？"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 80
  },
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
    resolutionCriteria: ["数据来源：FIFA官方公告、亚足联官方公告。"],
    relatedMarkets: ["日本是否晋级2026世界杯？"],
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
    description: "此市场预测2026年王者荣耀世界冠军杯（KIC）的冠军是否来自中国赛区（KPL）的战队。",
    resolutionCriteria: ["数据来源：王者荣耀官方赛事公告、KIC官方结果。"],
    relatedMarkets: ["成都AG超玩会是否获得KPL 2026春季赛冠军？"],
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
    description: "此市场预测韩国电竞选手Faker（李相赫）是否能够在2026年LCK春季赛中获得MVP称号。",
    resolutionCriteria: ["数据来源：LCK官方赛事公告、Riot Games官方声明。"],
    relatedMarkets: ["T1是否获得LCK 2026春季赛冠军？"],
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
    description: "此市场预测韩国T1战队是否能够获得2026年英雄联盟全球总决赛（Worlds）冠军。",
    resolutionCriteria: ["数据来源：Riot Games官方公告。"],
    relatedMarkets: ["中国LPL战队是否获得Worlds 2026冠军？"],
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
    resolutionCriteria: ["数据来源：Riot Games官方公告。"],
    relatedMarkets: ["T1是否获得英雄联盟2026全球总决赛冠军？"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85,
    isHot: true
  },
  {
    title: "Mobile Legends东南亚杯2026冠军是否来自印尼？",
    category: "东南亚电竞",
    categoryType: "sports-gaming",
    probability: 56.7,
    volume: "$3,234,567",
    volumeNum: 3234567,
    participants: 2678,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+10.8%",
    description: "此市场预测2026年Mobile Legends东南亚杯（MSC）的冠军战队是否来自印度尼西亚。",
    resolutionCriteria: ["数据来源：Mobile Legends官方赛事公告、MSC官方结果。"],
    relatedMarkets: ["菲律宾战队是否获得MSC 2026冠军？"],
    isActive: true,
    source: "custom",
    priorityLevel: "normal",
    customWeight: 60
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
    description: "此市场预测中国国家女子排球队是否能够获得2026年世界女排联赛（VNL）总决赛冠军。",
    resolutionCriteria: ["数据来源：国际排联（FIVB）官方公告。"],
    relatedMarkets: ["中国女排是否进入2026世界女排联赛四强？"],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 70
  }
];

async function importWithRetry() {
  console.log('🚀 刷新 schema 并导入数据...\n');

  // 等待 Supabase schema 刷新
  console.log('⏳ 等待 Supabase schema 更新（5秒）...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('📥 开始导入数据...\n');

    const { data, error } = await supabase
      .from('markets')
      .insert(sportsGamingMarkets)
      .select();

    if (error) {
      console.error('❌ 导入失败:', error.message);
      console.log('\n💡 请尝试：');
      console.log('1. 在 Supabase 项目中点击左上角刷新按钮');
      console.log('2. 等待1分钟后重新运行此脚本');
      console.log('3. 或访问 Table Editor 查看 markets 表是否存在\n');
      return;
    }

    console.log(`✅ 成功导入 ${data.length} 条市场数据！\n`);
    console.log('📊 已导入的市场：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    data.forEach((market, index) => {
      console.log(`${index + 1}. ${market.title}`);
      console.log(`   分类：${market.category} | 概率：${market.probability}% | ID: ${market.id}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 导入完成！\n');
    console.log('📍 下一步：');
    console.log('1. 访问 http://localhost:3001/sports-gaming 查看效果');
    console.log('2. 访问 http://localhost:3001/admin/markets 管理市场\n');

  } catch (error) {
    console.error('❌ 发生错误:', error);
  }
}

importWithRetry();










