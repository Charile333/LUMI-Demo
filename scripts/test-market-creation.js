// 🧪 测试市场创建功能

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

// 测试数据
const testMarkets = [
  {
    title: "特斯拉 2025 Q1 交付量会超过 50 万吗？",
    description: "预测特斯拉 2025 年第一季度全球交付量是否会超过 50 万辆",
    mainCategory: "automotive",
    subCategory: "新能源",
    tags: ["特斯拉", "电动车", "交付量"],
    priorityLevel: "recommended",
    rewardAmount: "10"
  },
  {
    title: "比亚迪 2025 年销量会超过特斯拉吗？",
    description: "预测比亚迪 2025 年全年全球销量是否会超过特斯拉",
    mainCategory: "automotive",
    subCategory: "新能源",
    tags: ["比亚迪", "特斯拉", "销量"],
    priorityLevel: "hot",
    rewardAmount: "20"
  },
  {
    title: "GPT-5 会在 2025 年发布吗？",
    description: "预测 OpenAI 是否会在 2025 年内发布 GPT-5",
    mainCategory: "tech-ai",
    subCategory: "人工智能",
    tags: ["OpenAI", "GPT-5", "AI"],
    priorityLevel: "hot",
    rewardAmount: "15"
  }
];

async function testSingleCreate() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试 1：创建单个市场');
  console.log('='.repeat(60) + '\n');

  try {
    const response = await fetch(`${API_URL}/api/admin/markets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMarkets[0])
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 创建成功！');
      console.log('市场 ID:', data.market.id);
      console.log('标题:', data.market.title);
      console.log('状态:', data.market.status);
      console.log('区块链状态:', data.market.blockchain_status);
      console.log('\n消息:', data.message);
    } else {
      console.log('❌ 创建失败:', data.error);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function testBatchCreate() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试 2：批量创建市场');
  console.log('='.repeat(60) + '\n');

  try {
    const response = await fetch(`${API_URL}/api/admin/markets/batch-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markets: testMarkets })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 批量创建成功！');
      console.log('创建数量:', data.count);
      console.log('\n市场列表:');
      data.markets.forEach((market, index) => {
        console.log(`  ${index + 1}. ${market.title}`);
        console.log(`     ID: ${market.id} | 状态: ${market.blockchain_status}`);
      });
      console.log('\n消息:', data.message);
    } else {
      console.log('❌ 批量创建失败:', data.error);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

async function checkDatabase() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试 3：查询数据库');
  console.log('='.repeat(60) + '\n');

  const { db } = require('../lib/db');

  try {
    const result = await db.query(`
      SELECT 
        id, 
        title, 
        status, 
        blockchain_status,
        views,
        interested_users,
        activity_score,
        created_at
      FROM markets
      ORDER BY id DESC
      LIMIT 5
    `);

    console.log(`✅ 查询成功！找到 ${result.rows.length} 个市场\n`);

    result.rows.forEach((market, index) => {
      console.log(`${index + 1}. ${market.title}`);
      console.log(`   ID: ${market.id}`);
      console.log(`   状态: ${market.status} | 区块链: ${market.blockchain_status}`);
      console.log(`   浏览: ${market.views} | 感兴趣: ${market.interested_users} | 评分: ${market.activity_score}`);
      console.log(`   创建时间: ${new Date(market.created_at).toLocaleString('zh-CN')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

async function main() {
  console.log('\n🚀 开始测试后台批量创建功能...\n');

  // 检查服务器是否运行
  try {
    const response = await fetch(`${API_URL}/api/health`);
    console.log('✅ Next.js 服务器正在运行\n');
  } catch (error) {
    console.error('❌ Next.js 服务器未运行！');
    console.error('请先运行: npm run dev 或 npm run dev:ws\n');
    process.exit(1);
  }

  // 运行测试
  await testSingleCreate();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testBatchCreate();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await checkDatabase();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有测试完成！');
  console.log('='.repeat(60) + '\n');
  
  console.log('下一步：');
  console.log('  1. 访问管理后台: http://localhost:3000/admin/create-market');
  console.log('  2. 手动创建市场测试界面');
  console.log('  3. 测试活跃度追踪功能\n');
}

main().catch(console.error);



