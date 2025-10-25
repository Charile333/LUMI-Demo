/**
 * ⏰ 话题清理定时任务
 * 
 * 每天凌晨 2:00 自动运行，清理低活跃度话题
 * 
 * 使用方法：
 * - 开发环境: npm run topic-cleanup
 * - 生产环境: 配置到 cron job 或使用 Vercel Cron
 */

import { cleanInactiveTopics } from './clean-inactive-topics';

async function runCleanupJob() {
  console.log('⏰ 话题清理定时任务启动');
  console.log(`📅 运行时间: ${new Date().toLocaleString('zh-CN')}\n`);

  try {
    await cleanInactiveTopics();
    console.log('\n✅ 定时任务执行成功');
  } catch (error) {
    console.error('\n❌ 定时任务执行失败:', error);
    throw error;
  }
}

// 运行任务
if (require.main === module) {
  runCleanupJob()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runCleanupJob };

