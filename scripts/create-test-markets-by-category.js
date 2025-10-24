// 为不同分类创建测试市场数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createTestMarkets() {
  console.log('\n=== 📝 创建测试市场（按分类） ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 Supabase 配置');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 测试市场数据（不同分类）
  const testMarkets = [
    {
      question_id: 'test_automotive_001',
      title: '特斯拉 Model Y 会在 2025 年成为全球销量第一吗？',
      description: '预测特斯拉 Model Y 是否会在 2025 年成为全球销量最高的汽车型号',
      main_category: 'automotive',
      sub_category: '新能源',
      status: 'active',
      end_time: '2025-12-31T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=1'
    },
    {
      question_id: 'test_tech_ai_001',
      title: 'GPT-5 会在 2025 年发布吗？',
      description: 'OpenAI 是否会在 2025 年正式发布 GPT-5 模型',
      main_category: 'tech-ai',
      sub_category: '人工智能',
      status: 'active',
      end_time: '2025-12-31T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=2'
    },
    {
      question_id: 'test_entertainment_001',
      title: '《阿凡达 3》票房会超过 20 亿美元吗？',
      description: '预测《阿凡达 3》全球票房是否能突破 20 亿美元',
      main_category: 'entertainment',
      sub_category: '电影',
      status: 'active',
      end_time: '2026-06-30T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=3'
    },
    {
      question_id: 'test_sports_001',
      title: '中国男足能进入 2026 世界杯吗？',
      description: '预测中国男足是否能获得 2026 世界杯参赛资格',
      main_category: 'sports-gaming',
      sub_category: '足球',
      status: 'active',
      end_time: '2026-03-31T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=4'
    },
    {
      question_id: 'test_economy_001',
      title: '比特币会在 2025 年突破 10 万美元吗？',
      description: '预测比特币价格是否会在 2025 年达到或超过 10 万美元',
      main_category: 'economy-social',
      sub_category: '加密货币',
      status: 'active',
      end_time: '2025-12-31T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=5'
    },
    {
      question_id: 'test_smart_devices_001',
      title: 'iPhone 17 会支持全息投影吗？',
      description: '预测苹果是否会在 iPhone 17 中引入全息投影技术',
      main_category: 'smart-devices',
      sub_category: '手机',
      status: 'active',
      end_time: '2026-09-30T23:59:59',
      image_url: 'https://picsum.photos/400/300?random=6'
    }
  ];

  let successCount = 0;
  let skippedCount = 0;

  for (const market of testMarkets) {
    console.log(`📌 创建市场: ${market.title}`);
    console.log(`   分类: ${market.main_category} / ${market.sub_category}`);

    // 检查是否已存在
    const { data: existing } = await supabase
      .from('markets')
      .select('id')
      .eq('question_id', market.question_id)
      .single();

    if (existing) {
      console.log('   ⏭️  已存在，跳过\n');
      skippedCount++;
      continue;
    }

    // 插入市场
    const { data, error } = await supabase
      .from('markets')
      .insert(market)
      .select();

    if (error) {
      console.log(`   ❌ 创建失败: ${error.message}\n`);
    } else {
      console.log(`   ✅ 创建成功 (ID: ${data[0].id})\n`);
      successCount++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log('📊 创建结果：');
  console.log('═══════════════════════════════════════');
  console.log(`   总计：    ${testMarkets.length} 个市场`);
  console.log(`   已创建：  ${successCount} 个`);
  console.log(`   已跳过：  ${skippedCount} 个`);
  console.log('═══════════════════════════════════════\n');

  // 显示每个分类的市场数量
  console.log('📋 各分类市场统计：\n');
  
  const categories = [
    'automotive',
    'tech-ai',
    'entertainment',
    'smart-devices',
    'sports-gaming',
    'economy-social',
    'emerging'
  ];

  for (const category of categories) {
    const { count } = await supabase
      .from('markets')
      .select('*', { count: 'exact', head: true })
      .eq('main_category', category);

    console.log(`   ${category}: ${count || 0} 个市场`);
  }

  console.log('\n🎉 完成！\n');
}

createTestMarkets();






