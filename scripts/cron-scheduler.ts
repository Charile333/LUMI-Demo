#!/usr/bin/env node

// 🕐 Cron 调度器
// 启动定时任务

import cron from 'node-cron';
import { execSync } from 'child_process';

console.log('\n🚀 启动 Cron 调度器...\n');

// 1. 市场激活任务 - 每小时运行一次
cron.schedule('0 * * * *', () => {
  console.log('\n⏰ 触发：市场激活任务');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    execSync('npx ts-node scripts/activate-markets-cron.ts', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ 市场激活任务失败:', error);
  }
}, {
  timezone: 'Asia/Shanghai'
});

// 2. 清理过期订单任务 - 每 30 分钟运行一次
cron.schedule('*/30 * * * *', () => {
  console.log('\n⏰ 触发：清理过期订单任务');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    execSync('npx ts-node scripts/clean-expired-orders.ts', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ 清理订单任务失败:', error);
  }
}, {
  timezone: 'Asia/Shanghai'
});

// 3. 批量结算任务 - 每 5 分钟运行一次
cron.schedule('*/5 * * * *', () => {
  console.log('\n⏰ 触发：批量结算任务');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    execSync('npx ts-node scripts/settle-trades-cron.ts', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ 批量结算任务失败:', error);
  }
}, {
  timezone: 'Asia/Shanghai'
});

// 4. 价格历史记录任务 - 每分钟运行一次
cron.schedule('* * * * *', () => {
  console.log('\n⏰ 触发：价格历史记录任务');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    execSync('npx ts-node scripts/record-price-history-cron.ts', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ 价格历史记录任务失败:', error);
  }
}, {
  timezone: 'Asia/Shanghai'
});

console.log('✅ Cron 调度器已启动\n');
console.log('任务列表:');
console.log('  1. 市场激活 - 每小时 (0 * * * *)');
console.log('  2. 清理订单 - 每 30 分钟 (*/30 * * * *)');
console.log('  3. 批量结算 - 每 5 分钟 (*/5 * * * *)');
console.log('  4. 价格历史记录 - 每分钟 (* * * * *)');
console.log('\n按 Ctrl+C 停止调度器\n');

// 保持进程运行
process.on('SIGINT', () => {
  console.log('\n👋 停止 Cron 调度器...');
  process.exit(0);
});

