/**
 * 通过 API 接口批量创建市场（绕过 schema cache）
 */

const markets = [
  {
    title: "CBA 2025-2026赛季总冠军是否为辽宁队？",
    category: "篮球",
    categoryType: "sports-gaming",
    probability: 42.8,
    volume: "$3,456,789",
    participants: 2345,
    endDate: "May 15, 2026",
    trend: "up",
    change: "+8.3%",
    description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。",
    resolutionCriteria: ["CBA官方公告", "总决赛结果"],
    relatedMarkets: ["广东宏远冠军预测"],
    isActive: true
  },
  {
    title: "中国男足是否晋级2026世界杯？",
    category: "足球",
    categoryType: "sports-gaming",
    probability: 18.3,
    volume: "$8,234,567",
    participants: 5678,
    endDate: "Nov 30, 2025",
    trend: "down",
    change: "-12.5%",
    description: "此市场预测中国国家男子足球队是否能够晋级2026年FIFA世界杯决赛圈。",
    resolutionCriteria: ["FIFA官方公告"],
    relatedMarkets: [],
    isActive: true
  },
  {
    title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？",
    category: "电竞",
    categoryType: "sports-gaming",
    probability: 78.5,
    volume: "$5,678,901",
    participants: 4567,
    endDate: "Aug 31, 2026",
    trend: "up",
    change: "+15.2%",
    description: "此市场预测2026年王者荣耀世界冠军杯（KIC）的冠军是否来自中国赛区。",
    resolutionCriteria: ["官方赛事公告"],
    relatedMarkets: [],
    isActive: true
  },
  {
    title: "Faker是否在2026年获得LCK春季赛MVP？",
    category: "国际电竞",
    categoryType: "sports-gaming",
    probability: 45.8,
    volume: "$4,123,456",
    participants: 3456,
    endDate: "Apr 30, 2026",
    trend: "up",
    change: "+11.3%",
    description: "此市场预测韩国电竞选手Faker是否能够在2026年LCK春季赛中获得MVP称号。",
    resolutionCriteria: ["LCK官方"],
    relatedMarkets: [],
    isActive: true
  }
];

async function createViaAPI() {
  console.log('🚀 通过 API 批量创建市场...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`📝 创建 ${i + 1}/${markets.length}: ${market.title}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(market)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ 成功！ID: ${result.data.id}\n`);
        successCount++;
      } else {
        console.log(`   ❌ 失败: ${result.error}\n`);
        failCount++;
      }
      
      // 等待一下，避免请求太快
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}\n`);
      failCount++;
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 成功: ${successCount} 条`);
  console.log(`❌ 失败: ${failCount} 条`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (successCount > 0) {
    console.log('🎉 创建完成！');
    console.log('📍 访问查看：');
    console.log('   http://localhost:3001/sports-gaming');
    console.log('   http://localhost:3001/admin/markets\n');
  }
}

createViaAPI();










