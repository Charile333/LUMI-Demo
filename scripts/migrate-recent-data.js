/**
 * 迁移最近的实时数据（2025年）
 * 从duolume-master迁移到LUMI数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const oldDbPath = path.join(__dirname, '../../duolume-master/utils/database/app.db');
const newDbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     迁移2025年实时数据                                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📍 源数据库:', oldDbPath);
console.log('📍 目标数据库:', newDbPath);
console.log('');

const fs = require('fs');
if (!fs.existsSync(oldDbPath)) {
  console.log('⚠️  源数据库不存在，跳过迁移');
  process.exit(0);
}

// 读取旧数据
const oldDb = new sqlite3.Database(oldDbPath, sqlite3.OPEN_READONLY);

oldDb.all(`
  SELECT * FROM alerts 
  WHERE date(timestamp) >= '2025-01-01'
  ORDER BY timestamp DESC
`, (err, rows) => {
  if (err) {
    console.error('❌ 读取错误:', err.message);
    oldDb.close();
    return;
  }
  
  console.log(`📊 找到 ${rows.length} 条2025年的记录`);
  
  if (rows.length === 0) {
    console.log('✅ 没有需要迁移的数据');
    oldDb.close();
    return;
  }
  
  oldDb.close();
  
  // 写入新数据库
  const newDb = new sqlite3.Database(newDbPath);
  
  const insertSQL = `
    INSERT INTO alerts (timestamp, symbol, message, severity, details, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const stmt = newDb.prepare(insertSQL);
  let migrated = 0;
  let skipped = 0;
  
  console.log('🔄 开始迁移...\n');
  
  rows.forEach((row, index) => {
    stmt.run(
      row.timestamp,
      row.symbol,
      row.message,
      row.severity || 'medium',
      row.details,
      row.type || 'realtime',
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            skipped++;
          } else {
            console.error(`❌ 错误 (记录 ${index + 1}):`, err.message);
          }
        } else {
          migrated++;
          if (migrated <= 5 || migrated === rows.length) {
            const date = new Date(row.timestamp);
            console.log(`✅ ${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]} | ${row.symbol} | ${row.message.substring(0, 40)}...`);
          }
        }
        
        if (index === rows.length - 1) {
          stmt.finalize();
          
          console.log('\n════════════════════════════════════════════════════════════');
          console.log(`✅ 迁移完成!`);
          console.log(`   • 成功迁移: ${migrated} 条`);
          if (skipped > 0) {
            console.log(`   • 已存在跳过: ${skipped} 条`);
          }
          console.log('════════════════════════════════════════════════════════════\n');
          
          console.log('💡 现在你有:');
          console.log('   • 21个历史闪崩事件 (2018-2024)');
          console.log(`   • ${migrated}条2025年实时数据`);
          console.log('');
          console.log('🔄 刷新浏览器查看最新数据！\n');
          
          newDb.close();
        }
      }
    );
  });
});



