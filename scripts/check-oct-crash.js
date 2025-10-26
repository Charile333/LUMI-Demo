const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('检查 2025年10月10-11日 的BTC数据...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }

  // 查询10月10-11日的所有BTC数据
  db.all(`
    SELECT 
      id,
      symbol,
      datetime(timestamp) as time,
      severity,
      message,
      details
    FROM alerts
    WHERE symbol LIKE '%BTC%'
      AND date(timestamp) BETWEEN '2025-10-10' AND '2025-10-11'
    ORDER BY timestamp
  `, (err, rows) => {
    if (err) {
      console.error('❌ 查询失败:', err);
      db.close();
      process.exit(1);
    }

    if (rows.length === 0) {
      console.log('❌ 没有找到10月10-11日的BTC数据');
      console.log('\n检查旧数据库...');
      
      // 检查旧数据库
      const oldDbPath = path.join(__dirname, '..', '..', 'duolume-master', 'utils', 'database', 'app.db');
      const oldDb = new sqlite3.Database(oldDbPath, (err) => {
        if (err) {
          console.error('❌ 旧数据库连接失败:', err);
          db.close();
          process.exit(1);
        }

        oldDb.all(`
          SELECT 
            id,
            symbol,
            datetime(timestamp) as time,
            severity,
            message,
            details
          FROM alerts
          WHERE symbol LIKE '%BTC%'
            AND date(timestamp) BETWEEN '2025-10-10' AND '2025-10-11'
          ORDER BY timestamp
        `, (err, oldRows) => {
          if (err) {
            console.error('❌ 旧数据库查询失败:', err);
          } else if (oldRows.length > 0) {
            console.log(`\n✅ 在旧数据库找到 ${oldRows.length} 条记录：`);
            oldRows.forEach(row => {
              console.log(`\n[${row.time}] ${row.symbol}`);
              console.log(`严重级别: ${row.severity}`);
              console.log(`消息: ${row.message}`);
              if (row.details) {
                console.log(`详情: ${row.details}`);
              }
            });
          } else {
            console.log('\n❌ 旧数据库也没有找到10月10-11日的数据');
          }
          
          oldDb.close();
          db.close();
        });
      });
    } else {
      console.log(`✅ 找到 ${rows.length} 条BTC记录：\n`);
      rows.forEach(row => {
        console.log(`[${row.time}] ${row.symbol}`);
        console.log(`严重级别: ${row.severity}`);
        console.log(`消息: ${row.message}`);
        if (row.details) {
          console.log(`详情: ${row.details}`);
        }
        console.log('---');
      });
      db.close();
    }
  });
});








