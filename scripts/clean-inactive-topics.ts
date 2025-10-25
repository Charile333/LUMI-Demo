/**
 * 🧹 清理低活跃度话题
 * 
 * 规则：
 * - 话题创建后超过3天
 * - 且投票数 < 3（低活跃度）
 * - 自动删除
 */

import { db } from '../lib/db';

// 配置
const INACTIVE_DAYS = 3;      // 超过3天视为不活跃
const MIN_VOTES = 3;          // 最低投票数阈值

async function cleanInactiveTopics() {
  console.log('🧹 开始清理低活跃度话题...\n');

  try {
    // 1. 查询符合清理条件的话题
    const result = await db.query(`
      SELECT 
        id, 
        title, 
        votes,
        created_at,
        EXTRACT(DAY FROM (NOW() - created_at)) as days_old
      FROM user_topics
      WHERE 
        created_at < NOW() - INTERVAL '${INACTIVE_DAYS} days'
        AND votes < ${MIN_VOTES}
      ORDER BY created_at ASC
    `);

    const inactiveTopics = result.rows;

    if (inactiveTopics.length === 0) {
      console.log('✅ 没有需要清理的低活跃度话题');
      return;
    }

    console.log(`📊 发现 ${inactiveTopics.length} 个低活跃度话题:\n`);

    // 2. 显示即将删除的话题
    inactiveTopics.forEach((topic, index) => {
      console.log(`${index + 1}. [ID:${topic.id}] ${topic.title}`);
      console.log(`   📅 创建于 ${Math.floor(topic.days_old)} 天前`);
      console.log(`   👍 投票数: ${topic.votes}`);
      console.log('');
    });

    // 3. 删除低活跃度话题（级联删除相关投票记录）
    const deleteResult = await db.query(`
      DELETE FROM user_topics
      WHERE 
        created_at < NOW() - INTERVAL '${INACTIVE_DAYS} days'
        AND votes < ${MIN_VOTES}
      RETURNING id, title
    `);

    console.log(`🗑️  已清理 ${deleteResult.rows.length} 个低活跃度话题\n`);

    // 4. 清理孤立的投票记录（虽然有外键级联删除，但再检查一次）
    const orphanVotes = await db.query(`
      DELETE FROM topic_votes
      WHERE topic_id NOT IN (SELECT id FROM user_topics)
      RETURNING id
    `);

    if (orphanVotes.rows.length > 0) {
      console.log(`🗑️  清理了 ${orphanVotes.rows.length} 条孤立投票记录\n`);
    }

    // 5. 显示清理后统计
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_topics,
        SUM(votes) as total_votes,
        AVG(votes) as avg_votes
      FROM user_topics
    `);

    console.log('📊 清理后统计:');
    console.log(`   总话题数: ${stats.rows[0].total_topics}`);
    console.log(`   总投票数: ${stats.rows[0].total_votes || 0}`);
    console.log(`   平均投票: ${parseFloat(stats.rows[0].avg_votes || 0).toFixed(2)}`);
    console.log('\n✅ 清理完成!\n');

  } catch (error) {
    console.error('❌ 清理失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanInactiveTopics()
    .then(() => {
      console.log('🎉 话题清理任务完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 话题清理任务失败:', error);
      process.exit(1);
    });
}

export { cleanInactiveTopics };

