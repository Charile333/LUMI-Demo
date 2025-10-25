const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');
const db = new sqlite3.Database(dbPath);

console.log('\n=== 检查LUMI数据库 ===\n');
console.log('📍 数据库:', dbPath);

// 检查总记录数
db.get('SELECT COUNT(*) as count FROM alerts', (err, row) => {
  if (err) {
    console.error('❌ 错误:', err);
    db.close();
    return;
  }
  
  console.log(`📊 总记录数: ${row.count}`);
  
  // 查看最新5条
  db.all(`SELECT 
    date(timestamp) as date,
    symbol,
    severity,
    message
  FROM alerts 
  ORDER BY timestamp DESC 
  LIMIT 5`, (err, rows) => {
    if (err) {
      console.error('❌ 错误:', err);
    } else {
      console.log('\n📋 最新5条记录:\n');
      rows.forEach((r, i) => {
        console.log(`${i+1}. ${r.date} | ${r.symbol.padEnd(10)} | ${r.severity.padEnd(10)} | ${r.message.substring(0, 40)}...`);
      });
    }
    
    // 检查严重程度分布
    db.all('SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity', (err, rows) => {
      if (err) {
        console.error('❌ 错误:', err);
      } else {
        console.log('\n📈 严重程度分布:\n');
        rows.forEach(r => {
          console.log(`   ${r.severity.padEnd(10)}: ${r.count} 条`);
        });
      }
      
      console.log('\n');
      db.close();
    });
  });
});




