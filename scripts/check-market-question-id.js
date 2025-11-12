// 🔍 检查市场是否有 question_id
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkMarketQuestionId() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 检查市场 question_id');
  console.log('='.repeat(60) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase 配置缺失！');
    console.log('   请确保 .env.local 文件中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 查询所有市场
    console.log('📊 查询所有市场...\n');
    const { data: markets, error } = await supabase
      .from('markets')
      .select('id, title, question_id, condition_id, blockchain_status, main_category, status')
      .order('id');

    if (error) {
      console.log('❌ 查询失败:', error.message);
      console.log('   错误详情:', error);
      return;
    }

    if (!markets || markets.length === 0) {
      console.log('⚠️  没有找到市场！');
      console.log('   请先在数据库中创建市场。\n');
      return;
    }

    console.log(`✅ 找到 ${markets.length} 个市场\n`);

    // 分类统计
    const hasQuestionId = markets.filter(m => m.question_id);
    const noQuestionId = markets.filter(m => !m.question_id);
    const hasConditionId = markets.filter(m => m.condition_id);
    const noConditionId = markets.filter(m => !m.condition_id);
    const isOnChain = markets.filter(m => m.blockchain_status === 'created' && m.condition_id);

    console.log('📈 统计信息：');
    console.log(`   ✅ 有 question_id: ${hasQuestionId.length} 个`);
    console.log(`   ❌ 无 question_id: ${noQuestionId.length} 个`);
    console.log(`   ✅ 有 condition_id: ${hasConditionId.length} 个`);
    console.log(`   ❌ 无 condition_id: ${noConditionId.length} 个`);
    console.log(`   🟢 已上链: ${isOnChain.length} 个`);
    console.log(`   📊 总计: ${markets.length} 个\n`);

    // 显示有 question_id 的市场
    if (hasQuestionId.length > 0) {
      console.log('✅ 有 question_id 的市场：');
      console.log('='.repeat(60));
      hasQuestionId.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category || 'N/A'}`);
        console.log(`       状态: ${m.status || 'N/A'}`);
        console.log(`       区块链状态: ${m.blockchain_status || 'not_created'}`);
        console.log(`       Question ID: ${m.question_id}`);
        console.log(`       Condition ID: ${m.condition_id || '❌ 未设置'}`);
        console.log();
      });
    }

    // 显示无 question_id 的市场
    if (noQuestionId.length > 0) {
      console.log('❌ 无 question_id 的市场：');
      console.log('='.repeat(60));
      noQuestionId.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category || 'N/A'}`);
        console.log(`       状态: ${m.status || 'N/A'}`);
        console.log(`       区块链状态: ${m.blockchain_status || 'not_created'}`);
        console.log(`       Question ID: ❌ 未设置`);
        console.log(`       Condition ID: ${m.condition_id || '❌ 未设置'}`);
        console.log();
      });
    }

    // 显示已上链的市场
    if (isOnChain.length > 0) {
      console.log('🟢 已上链的市场（可以链上交易）：');
      console.log('='.repeat(60));
      isOnChain.forEach(m => {
        console.log(`   [${m.id}] ${m.title}`);
        console.log(`       分类: ${m.main_category || 'N/A'}`);
        console.log(`       状态: ${m.status || 'N/A'}`);
        console.log(`       区块链状态: ${m.blockchain_status}`);
        console.log(`       Question ID: ${m.question_id || 'N/A'}`);
        console.log(`       Condition ID: ${m.condition_id?.substring(0, 30)}...`);
        console.log();
      });
    }

    // 修复建议
    console.log('\n' + '='.repeat(60));
    console.log('💡 修复建议：');
    console.log('='.repeat(60));
    
    if (noQuestionId.length > 0) {
      console.log(`\n⚠️  发现 ${noQuestionId.length} 个市场没有 question_id！`);
      console.log(`\n   修复步骤：`);
      console.log(`   1. 在 Supabase Dashboard 中打开 SQL Editor`);
      console.log(`   2. 运行以下 SQL 为市场生成 question_id：`);
      console.log(`\n   -- 为没有 question_id 的市场生成 question_id`);
      console.log(`   UPDATE markets`);
      console.log(`   SET question_id = 'market-' || id::text || '-' || extract(epoch from created_at)::bigint::text`);
      console.log(`   WHERE question_id IS NULL OR question_id = '';`);
      console.log(`\n   或者为特定市场设置：`);
      noQuestionId.slice(0, 5).forEach(m => {
        console.log(`   UPDATE markets SET question_id = 'market-${m.id}' WHERE id = ${m.id};`);
      });
      if (noQuestionId.length > 5) {
        console.log(`   ... (还有 ${noQuestionId.length - 5} 个市场)`);
      }
    }

    if (noConditionId.length > 0 && hasQuestionId.length > 0) {
      console.log(`\n⚠️  发现 ${noConditionId.length} 个市场没有 condition_id！`);
      console.log(`\n   上链步骤：`);
      console.log(`   1. 确保市场有 question_id（已完成：${hasQuestionId.length} 个）`);
      console.log(`   2. 调用激活 API 上链：`);
      console.log(`      curl -X POST http://localhost:3000/api/admin/markets/[marketId]/activate`);
      console.log(`   3. 或者手动上链（使用智能合约）`);
    }

    if (isOnChain.length > 0) {
      console.log(`\n✅ 有 ${isOnChain.length} 个市场已上链，可以进行链上交易！`);
      console.log(`\n   测试步骤：`);
      const testMarket = isOnChain[0];
      console.log(`   1. 访问: http://localhost:3000/markets/${testMarket.main_category || 'automotive'}`);
      console.log(`   2. 找到市场ID为 ${testMarket.id} 的市场卡片`);
      console.log(`   3. 点击"快速交易"按钮`);
      console.log(`   4. 连接钱包并下单测试`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 检查完成');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 检查失败:', error);
    console.error('   错误堆栈:', error.stack);
  }
}

checkMarketQuestionId();

