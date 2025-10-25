const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('清理从旧数据库迁移的无参考价值数据...\n');

const db = new sqlite3.Database(dbPath);

// 删除从旧数据库迁移的数据（除了10月10-11日的真实闪崩事件）
// 保留：1. 历史闪崩事件（2018-2024） 2. 10月10-11日真实闪崩
db.run(`
  DELETE FROM alerts 
  WHERE 
    -- 删除2025年的数据，但保留10月10-11日的critical事件
    (strftime('%Y', timestamp) = '2025' 
     AND NOT (date(timestamp) BETWEEN '2025-10-10' AND '2025-10-11' AND severity = 'critical'))
`, function(err) {
  if (err) {
    console.error('❌ 清理失败:', err);
    db.close();
    process.exit(1);
  }

  console.log(`✅ 已删除 ${this.changes} 条无参考价值的数据\n`);

  // 显示保留的数据统计
  db.all(`
    SELECT 
      strftime('%Y', timestamp) as year,
      COUNT(*) as count,
      COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count
    FROM alerts
    GROUP BY strftime('%Y', timestamp)
    ORDER BY year DESC
  `, (err, rows) => {
    if (!err && rows.length > 0) {
      console.log('📊 清理后的数据分布：\n');
      rows.forEach(row => {
        console.log(`${row.year}年: ${row.count} 条记录 (其中 ${row.critical_count} 条critical)`);
      });
    }

    // 显示10月10-11日的事件
    console.log('\n✅ 保留的2025年10月10-11日真实闪崩事件：\n');
    db.all(`
      SELECT 
        datetime(timestamp) as time,
        symbol,
        message
      FROM alerts
      WHERE date(timestamp) BETWEEN '2025-10-10' AND '2025-10-11'
      ORDER BY timestamp
    `, (err, events) => {
      if (!err && events.length > 0) {
        events.forEach(e => {
          console.log(`[${e.time}] ${e.symbol} - ${e.message}`);
        });
      }

      // 总记录数
      db.get('SELECT COUNT(*) as total FROM alerts', (err, row) => {
        if (!err) {
          console.log(`\n📈 数据库总记录数: ${row.total}`);
        }
        db.close();
      });
    });
  });
});



