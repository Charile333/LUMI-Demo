const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const oldDbPath = path.join(__dirname, '..', '..', 'duolume-master', 'utils', 'database', 'app.db');

console.log('检查旧数据库结构和内容...\n');

const db = new sqlite3.Database(oldDbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }

  // 先查看表结构
  db.all(`
    SELECT sql FROM sqlite_master WHERE type='table' AND name='alerts'
  `, (err, rows) => {
    if (err) {
      console.error('❌ 查询表结构失败:', err);
      db.close();
      process.exit(1);
    }

    console.log('📋 表结构:');
    console.log(rows[0]?.sql || '未找到alerts表');
    console.log('\n');

    // 查询10月份的所有数据
    db.all(`
      SELECT 
        id,
        type,
        symbol,
        datetime(timestamp) as time,
        message,
        details
      FROM alerts
      WHERE date(timestamp) >= '2025-10-01'
      ORDER BY timestamp
      LIMIT 100
    `, (err, alerts) => {
      if (err) {
        console.error('❌ 查询失败:', err);
        db.close();
        process.exit(1);
      }

      if (alerts.length === 0) {
        console.log('❌ 没有找到2025年10月的数据');
      } else {
        console.log(`✅ 找到 ${alerts.length} 条10月份的记录：\n`);
        alerts.forEach(row => {
          console.log(`[${row.time}] ${row.symbol || 'N/A'}`);
          console.log(`类型: ${row.type}`);
          console.log(`消息: ${row.message}`);
          if (row.details) console.log(`详情: ${row.details}`);
          console.log('---');
        });
      }
      
      db.close();
    });
  });
});

