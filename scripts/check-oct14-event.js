const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('检查 2025年10月14日 的BTC闪崩事件...\n');

const db = new sqlite3.Database(dbPath);

// 查询10月14日的critical事件
db.all(`
  SELECT 
    id,
    symbol,
    datetime(timestamp) as time,
    severity,
    message,
    details
  FROM alerts
  WHERE severity = 'critical'
    AND date(timestamp) = '2025-10-14'
  ORDER BY timestamp
`, (err, rows) => {
  if (err) {
    console.error('❌ 查询失败:', err);
    db.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('❌ 没有找到10月14日的critical事件');
  } else {
    console.log(`✅ 找到 ${rows.length} 条critical事件：\n`);
    rows.forEach(row => {
      console.log(`[${row.time}] ${row.symbol}`);
      console.log(`严重级别: ${row.severity}`);
      console.log(`消息: ${row.message}`);
      if (row.details) {
        console.log(`详情: ${row.details}`);
      }
      console.log('---');
    });
  }

  // 显示所有critical事件的日期分布
  console.log('\n📊 所有critical事件的日期分布：');
  db.all(`
    SELECT 
      DATE(timestamp) as event_date,
      COUNT(*) as count,
      GROUP_CONCAT(symbol, ', ') as symbols
    FROM alerts
    WHERE severity = 'critical'
    GROUP BY DATE(timestamp)
    ORDER BY event_date DESC
    LIMIT 10
  `, (err, dateRows) => {
    if (!err && dateRows.length > 0) {
      dateRows.forEach(row => {
        console.log(`${row.event_date}: ${row.count} 条 (${row.symbols})`);
      });
    }
    db.close();
  });
});









