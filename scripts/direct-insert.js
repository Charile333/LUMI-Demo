/**
 * 使用 REST API 直接插入数据（绕过 schema cache）
 */

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const markets = [
  {title: "CBA 2025-2026赛季总冠军是否为辽宁队？", category: "篮球", categoryType: "sports-gaming", probability: 42.8, volume: "$3,456,789", volumeNum: 3456789, participants: 2345, endDate: "May 15, 2026", trend: "up", change: "+8.3%", description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。", resolutionCriteria: ["CBA官方公告"], relatedMarkets: ["广东宏远"], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 80},
  {title: "中国男足是否晋级2026世界杯？", category: "足球", categoryType: "sports-gaming", probability: 18.3, volume: "$8,234,567", volumeNum: 8234567, participants: 5678, endDate: "Nov 30, 2025", trend: "down", change: "-12.5%", description: "预测中国男足是否晋级2026世界杯。", resolutionCriteria: ["FIFA官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "recommended", customWeight: 90, isHot: true},
  {title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？", category: "电竞", categoryType: "sports-gaming", probability: 78.5, volume: "$5,678,901", volumeNum: 5678901, participants: 4567, endDate: "Aug 31, 2026", trend: "up", change: "+15.2%", description: "预测KIC 2026冠军。", resolutionCriteria: ["官方公告"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 85, isTrending: true},
  {title: "Faker是否在2026年获得LCK春季赛MVP？", category: "国际电竞", categoryType: "sports-gaming", probability: 45.8, volume: "$4,123,456", volumeNum: 4123456, participants: 3456, endDate: "Apr 30, 2026", trend: "up", change: "+11.3%", description: "预测Faker获得LCK MVP。", resolutionCriteria: ["LCK官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "normal", customWeight: 70},
  {title: "T1是否获得英雄联盟2026全球总决赛冠军？", category: "国际电竞", categoryType: "sports-gaming", probability: 28.6, volume: "$6,789,012", volumeNum: 6789012, participants: 5234, endDate: "Nov 30, 2026", trend: "down", change: "-6.4%", description: "预测T1战队Worlds冠军。", resolutionCriteria: ["Riot官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "recommended", customWeight: 75},
  {title: "中国LPL战队是否获得Worlds 2026冠军？", category: "国际电竞", categoryType: "sports-gaming", probability: 52.3, volume: "$5,456,789", volumeNum: 5456789, participants: 4123, endDate: "Nov 30, 2026", trend: "up", change: "+13.7%", description: "预测LPL战队冠军。", resolutionCriteria: ["Riot官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "featured", customWeight: 85, isHot: true},
  {title: "Mobile Legends东南亚杯2026冠军是否来自印尼？", category: "东南亚电竞", categoryType: "sports-gaming", probability: 56.7, volume: "$3,234,567", volumeNum: 3234567, participants: 2678, endDate: "Dec 31, 2026", trend: "up", change: "+10.8%", description: "预测MSC 2026冠军。", resolutionCriteria: ["官方公告"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "normal", customWeight: 60},
  {title: "中国女排是否获得2026世界女排联赛冠军？", category: "排球", categoryType: "sports-gaming", probability: 42.5, volume: "$2,890,123", volumeNum: 2890123, participants: 1876, endDate: "Jul 31, 2026", trend: "up", change: "+8.6%", description: "预测女排VNL冠军。", resolutionCriteria: ["FIVB官方"], relatedMarkets: [], isActive: true, source: "custom", priorityLevel: "recommended", customWeight: 70}
];

async function insertDirectly() {
  console.log('🚀 使用 REST API 直接插入数据...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/markets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(markets)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ 插入失败:', response.status, error);
      console.log('\n可能的原因：');
      console.log('1. 表还未创建');
      console.log('2. 字段类型不匹配');
      console.log('\n请手动在 Supabase Table Editor 中查看 markets 表\n');
      return;
    }

    const data = await response.json();
    console.log(`✅ 成功插入 ${data.length} 条数据！\n`);
    
    console.log('📊 已导入的市场：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    data.forEach((m, i) => {
      console.log(`${i+1}. ${m.title}`);
      console.log(`   ID: ${m.id} | 分类: ${m.category} | 概率: ${m.probability}%`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 导入完成！\n');
    console.log('📍 下一步：');
    console.log('✅ 访问 http://localhost:3001/sports-gaming 查看效果');
    console.log('✅ 访问 http://localhost:3001/admin/markets 管理市场\n');
    console.log('💡 提示：系统现已切换为 100% 自定义内容模式\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log('\n请确认：');
    console.log('1. Supabase markets 表已创建');
    console.log('2. .env.local 配置正确');
    console.log('3. 网络连接正常\n');
  }
}

insertDirectly();










