#!/usr/bin/env node

// ⏰ 市场激活定时任务
// 每小时扫描一次，激活高活跃度市场

import { db } from '../lib/db';
import { activateMarketOnChain } from '../lib/market-activation/blockchain-activator';
import { shouldActivateMarket } from '../lib/market-activation/scoring';

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 开始扫描待激活市场...');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60) + '\n');
  
  try {
    // 1. 查找需要激活的市场
    const marketsResult = await db.query(`
      SELECT 
        id, title, activity_score, views, interested_users,
        priority_level, created_at
      FROM markets
      WHERE blockchain_status = 'not_created'
        AND status = 'draft'
        AND (
          activity_score >= 60
          OR priority_level = 'hot'
          OR interested_users >= 10
          OR views >= 100
        )
      ORDER BY activity_score DESC, priority_level DESC
      LIMIT 5
    `);
    
    const markets = marketsResult.rows;
    
    console.log(`📊 找到 ${markets.length} 个待激活市场\n`);
    
    if (markets.length === 0) {
      console.log('✅ 当前没有需要激活的市场');
      return;
    }
    
    // 2. 显示市场列表
    console.log('待激活市场列表:');
    console.log('-'.repeat(60));
    markets.forEach((market, index) => {
      console.log(`${index + 1}. ${market.title}`);
      console.log(`   活跃度: ${market.activity_score} | 浏览: ${market.views} | 感兴趣: ${market.interested_users}`);
      console.log(`   优先级: ${market.priority_level} | 创建: ${new Date(market.created_at).toLocaleDateString()}`);
      console.log('');
    });
    console.log('-'.repeat(60) + '\n');
    
    // 3. 逐个激活市场
    let succeeded = 0;
    let failed = 0;
    
    for (const market of markets) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`激活市场: ${market.title}`);
      console.log('='.repeat(60));
      
      const result = await activateMarketOnChain(market.id);
      
      if (result.success) {
        succeeded++;
        console.log(`✅ 激活成功!`);
        console.log(`   Condition ID: ${result.conditionId}`);
        console.log(`   交易哈希: ${result.txHash}`);
      } else {
        failed++;
        console.log(`❌ 激活失败: ${result.error}`);
      }
      
      // 等待一段时间，避免 RPC 限流
      if (markets.indexOf(market) < markets.length - 1) {
        console.log('\n⏳ 等待 3 秒...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // 4. 总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 激活任务完成');
    console.log('='.repeat(60));
    console.log(`总数: ${markets.length}`);
    console.log(`成功: ${succeeded} ✅`);
    console.log(`失败: ${failed} ❌`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error: any) {
    console.error('\n❌ 任务执行失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行任务
main()
  .then(() => {
    console.log('✅ 任务执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 任务执行失败:', error);
    process.exit(1);
  });

