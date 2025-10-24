/**
 * 简化版：只插入必需字段
 */

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 只包含必需字段
const markets = [
  {
    title: "CBA 2025-2026赛季总冠军是否为辽宁队？",
    categoryType: "sports-gaming",
    endDate: "May 15, 2026",
    description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。"
  },
  {
    title: "中国男足是否晋级2026世界杯？",
    categoryType: "sports-gaming",
    endDate: "Nov 30, 2025",
    description: "预测中国国家男子足球队是否能够晋级2026年FIFA世界杯决赛圈。"
  },
  {
    title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？",
    categoryType: "sports-gaming",
    endDate: "Aug 31, 2026",
    description: "此市场预测2026年王者荣耀世界冠军杯（KIC）的冠军是否来自中国赛区。"
  },
  {
    title: "Faker是否在2026年获得LCK春季赛MVP？",
    categoryType: "sports-gaming",
    endDate: "Apr 30, 2026",
    description: "此市场预测韩国电竞选手Faker（李相赫）是否能够在2026年LCK春季赛中获得MVP称号。"
  }
];

async function insert() {
  console.log('🚀 插入简化数据...\n');

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

    const responseText = await response.text();
    console.log('响应状态:', response.status);
    console.log('响应内容:', responseText.substring(0, 200));

    if (!response.ok) {
      console.error('\n❌ 失败\n');
      console.log('请在 Supabase 手动测试：');
      console.log('1. 打开 Table Editor → markets表');
      console.log('2. 点击 Insert row');
      console.log('3. 填入以下数据测试：');
      console.log('   title: "测试市场"');
      console.log('   categoryType: "sports-gaming"');
      console.log('   endDate: "Dec 31, 2026"');
      console.log('   description: "测试描述"');
      console.log('4. 点击 Save\n');
      return;
    }

    const data = JSON.parse(responseText);
    console.log(`\n✅ 成功插入 ${data.length} 条数据！\n`);
    data.forEach((m, i) => console.log(`${i+1}. ${m.title} (ID: ${m.id})`));
    console.log('\n🎉 访问 http://localhost:3001/sports-gaming 查看\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

insert();










