const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const oldDbPath = path.join(__dirname, '..', '..', 'duolume-master', 'utils', 'database', 'app.db');
const newDbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('迁移 2025年10月12-14日 的BTC相关数据...\n');

const oldDb = new sqlite3.Database(oldDbPath);
const newDb = new sqlite3.Database(newDbPath);

// 查询10月12-14日的所有whale_transfer和重要price_jump数据
oldDb.all(`
  SELECT 
    type,
    symbol,
    timestamp,
    message,
    details
  FROM alerts
  WHERE date(timestamp) BETWEEN '2025-10-12' AND '2025-10-14'
    AND (
      type = 'whale_transfer' 
      OR (symbol = 'BTCUSDT' AND message LIKE '%3.16%')
    )
  ORDER BY timestamp
`, (err, rows) => {
  if (err) {
    console.error('❌ 查询旧数据失败:', err);
    oldDb.close();
    newDb.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('❌ 没有找到符合条件的数据');
    oldDb.close();
    newDb.close();
    return;
  }

  console.log(`✅ 找到 ${rows.length} 条记录，开始迁移...\n`);

  let successCount = 0;
  let errorCount = 0;

  const insertPromises = rows.map((row, index) => {
    return new Promise((resolve) => {
      // 根据类型确定severity
      let severity = 'medium';
      if (row.type === 'whale_transfer') {
        try {
          const details = JSON.parse(row.details);
          if (details.transfer_value_usd > 1000000) {
            severity = 'high';
          }
        } catch (e) {
          // ignore parse errors
        }
      } else if (row.message.includes('3.16%')) {
        severity = 'critical';  // 3.16%的价格跳动是严重的
      }

      newDb.run(`
        INSERT INTO alerts (timestamp, type, symbol, message, details, severity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [row.timestamp, row.type, row.symbol, row.message, row.details, severity], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            console.log(`⚠️  跳过重复记录: ${row.timestamp} - ${row.symbol}`);
          } else {
            console.error(`❌ 插入失败:`, err.message);
            errorCount++;
          }
        } else {
          successCount++;
          console.log(`✅ [${successCount}/${rows.length}] ${row.timestamp} - ${row.symbol} - ${row.type}`);
        }
        resolve();
      });
    });
  });

  Promise.all(insertPromises).then(() => {
    console.log('\n════════════════════════════════════════');
    console.log('✅ 迁移完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    console.log('════════════════════════════════════════\n');

    // 显示新数据库的总记录数
    newDb.get('SELECT COUNT(*) as total FROM alerts', (err, row) => {
      if (!err) {
        console.log(`📊 LUMI数据库现有记录总数: ${row.total}`);
      }
      oldDb.close();
      newDb.close();
    });
  });
});



