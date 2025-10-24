/**
 * 为所有分类导入测试数据
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 所有分类的测试数据
const allMarkets = [
  // ========== tech-ai (科技与AI) ==========
  {
    title: "OpenAI GPT-5 是否在2025年发布？",
    category: "AI大模型",
    categoryType: "tech-ai",
    probability: 68.5,
    volume: "$12,345,678",
    volumeNum: 12345678,
    participants: 8900,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+12.3%",
    description: "预测OpenAI是否会在2025年发布GPT-5模型。",
    resolutionCriteria: ["OpenAI官方公告"],
    relatedMarkets: ["Claude 4发布预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 90,
    isHot: true
  },
  {
    title: "苹果Vision Pro 2025年销量超100万台？",
    category: "硬件",
    categoryType: "tech-ai",
    probability: 45.2,
    volume: "$5,432,100",
    volumeNum: 5432100,
    participants: 3400,
    endDate: "Dec 31, 2025",
    trend: "down",
    change: "-5.8%",
    description: "预测Apple Vision Pro在2025年的全球销量。",
    resolutionCriteria: ["苹果官方或第三方市场调研数据"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 75
  },
  {
    title: "特斯拉FSD在2025年实现完全自动驾驶？",
    category: "自动驾驶",
    categoryType: "tech-ai",
    probability: 32.8,
    volume: "$8,765,432",
    volumeNum: 8765432,
    participants: 5600,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+8.9%",
    description: "预测特斯拉FSD是否能在2025年实现L5级别完全自动驾驶。",
    resolutionCriteria: ["SAE自动驾驶级别定义", "特斯拉官方声明"],
    relatedMarkets: ["Waymo扩展预测"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85
  },

  // ========== automotive (汽车与新能源) ==========
  {
    title: "比亚迪2025年销量超过特斯拉？",
    category: "销量对比",
    categoryType: "automotive",
    probability: 58.3,
    volume: "$15,678,900",
    volumeNum: 15678900,
    participants: 12000,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+15.6%",
    description: "预测比亚迪2025年全球新能源汽车销量是否超过特斯拉。",
    resolutionCriteria: ["官方销量数据", "第三方统计"],
    relatedMarkets: ["比亚迪海外市场"],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 95,
    isHot: true
  },
  {
    title: "小米汽车2025年交付量突破10万辆？",
    category: "新势力",
    categoryType: "automotive",
    probability: 71.5,
    volume: "$9,876,543",
    volumeNum: 9876543,
    participants: 7800,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+22.1%",
    description: "预测小米汽车在2025年的交付量。",
    resolutionCriteria: ["小米官方公告"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 90,
    isTrending: true
  },

  // ========== entertainment (娱乐) ==========
  {
    title: "《流浪地球3》票房突破60亿？",
    category: "电影票房",
    categoryType: "entertainment",
    probability: 52.7,
    volume: "$6,543,210",
    volumeNum: 6543210,
    participants: 4500,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+18.3%",
    description: "预测《流浪地球3》中国内地票房是否突破60亿人民币。",
    resolutionCriteria: ["猫眼、灯塔等票房统计平台"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85,
    isHot: true
  },
  {
    title: "周杰伦2025年发布新专辑？",
    category: "音乐",
    categoryType: "entertainment",
    probability: 38.5,
    volume: "$3,456,789",
    volumeNum: 3456789,
    participants: 6700,
    endDate: "Dec 31, 2025",
    trend: "down",
    change: "-8.2%",
    description: "预测周杰伦是否会在2025年发布新专辑。",
    resolutionCriteria: ["官方宣布", "正式发行"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 70
  },

  // ========== smart-devices (智能设备) ==========
  {
    title: "iPhone 17销量突破2.5亿台？",
    category: "智能手机",
    categoryType: "smart-devices",
    probability: 65.8,
    volume: "$18,765,432",
    volumeNum: 18765432,
    participants: 15000,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+9.4%",
    description: "预测iPhone 17系列2025年全球销量。",
    resolutionCriteria: ["苹果财报", "第三方市场调研"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 90,
    isHot: true
  },
  {
    title: "华为Mate 70销量超过1000万台？",
    category: "智能手机",
    categoryType: "smart-devices",
    probability: 78.2,
    volume: "$12,345,678",
    volumeNum: 12345678,
    participants: 9800,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+25.6%",
    description: "预测华为Mate 70系列在2025年的销量。",
    resolutionCriteria: ["华为官方数据"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85
  },

  // ========== economy-social (经济与社会) ==========
  {
    title: "2025年中国GDP增速超过5%？",
    category: "宏观经济",
    categoryType: "economy-social",
    probability: 72.5,
    volume: "$25,678,900",
    volumeNum: 25678900,
    participants: 18000,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+6.8%",
    description: "预测2025年中国GDP增速是否超过5%。",
    resolutionCriteria: ["国家统计局官方数据"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 95,
    isHot: true
  },
  {
    title: "美联储2025年降息3次以上？",
    category: "货币政策",
    categoryType: "economy-social",
    probability: 45.8,
    volume: "$32,100,000",
    volumeNum: 32100000,
    participants: 22000,
    endDate: "Dec 31, 2025",
    trend: "down",
    change: "-12.3%",
    description: "预测美联储在2025年的降息次数。",
    resolutionCriteria: ["美联储官方决议"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 90
  },

  // ========== emerging (新兴市场) ==========
  {
    title: "比特币2025年突破15万美元？",
    category: "加密货币",
    categoryType: "emerging",
    probability: 38.6,
    volume: "$45,678,900",
    volumeNum: 45678900,
    participants: 35000,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+28.9%",
    description: "预测比特币价格在2025年是否突破15万美元。",
    resolutionCriteria: ["主流交易所价格"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "featured",
    customWeight: 85,
    isTrending: true
  },
  {
    title: "以太坊2025年市值超过5000亿美元？",
    category: "加密货币",
    categoryType: "emerging",
    probability: 42.3,
    volume: "$28,765,432",
    volumeNum: 28765432,
    participants: 18000,
    endDate: "Dec 31, 2025",
    trend: "up",
    change: "+15.7%",
    description: "预测以太坊在2025年的市值。",
    resolutionCriteria: ["CoinMarketCap等数据"],
    relatedMarkets: [],
    isActive: true,
    source: "custom",
    priorityLevel: "recommended",
    customWeight: 75
  }
];

async function importAllCategories() {
  console.log('🚀 开始为所有分类导入测试数据...\n');
  
  // 按分类统计
  const stats = {};
  allMarkets.forEach(m => {
    stats[m.categoryType] = (stats[m.categoryType] || 0) + 1;
  });
  
  console.log('📊 数据统计：');
  Object.entries(stats).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} 条`);
  });
  console.log(`   总计: ${allMarkets.length} 条\n`);
  
  try {
    const { data, error } = await supabase
      .from('markets')
      .insert(allMarkets)
      .select();
    
    if (error) {
      console.error('❌ 导入失败:', error.message);
      return;
    }
    
    console.log(`✅ 成功导入 ${data.length} 条数据！\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 按分类显示
    const byCategory = {};
    data.forEach(m => {
      if (!byCategory[m.categoryType]) {
        byCategory[m.categoryType] = [];
      }
      byCategory[m.categoryType].push(m);
    });
    
    Object.entries(byCategory).forEach(([cat, markets]) => {
      console.log(`\n【${cat}】 (${markets.length}条):`);
      markets.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.title} (ID: ${m.id})`);
      });
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 导入完成！现在可以访问各个分类页面：\n');
    console.log('   http://localhost:3001/tech-ai');
    console.log('   http://localhost:3001/automotive');
    console.log('   http://localhost:3001/entertainment');
    console.log('   http://localhost:3001/smart-devices');
    console.log('   http://localhost:3001/economy-social');
    console.log('   http://localhost:3001/emerging\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

importAllCategories();










