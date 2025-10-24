#!/usr/bin/env node

// 🧹 清理过期订单定时任务
// 每 30 分钟扫描一次，标记过期订单

import { db } from '../lib/db';

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧹 开始清理过期订单...');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60) + '\n');
  
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // 1. 查找过期订单
    const expiredResult = await db.query(`
      SELECT id, order_id, expiration
      FROM orders
      WHERE status IN ('open', 'partial')
        AND expiration < $1
    `, [now]);
    
    const expiredOrders = expiredResult.rows;
    
    if (expiredOrders.length === 0) {
      console.log('✅ 当前没有过期订单');
      return;
    }
    
    console.log(`📊 找到 ${expiredOrders.length} 个过期订单\n`);
    
    // 2. 标记为过期
    const result = await db.query(`
      UPDATE orders
      SET status = 'expired', updated_at = NOW()
      WHERE status IN ('open', 'partial')
        AND expiration < $1
      RETURNING id, order_id
    `, [now]);
    
    console.log(`✅ 已标记 ${result.rows.length} 个订单为过期`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error: any) {
    console.error('\n❌ 清理失败:', error.message);
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

