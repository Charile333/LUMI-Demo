const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');
console.log('📍 Database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Connection error:', err);
    return;
  }
  
  console.log('✅ Connected\n');
  
  // 运行和API相同的查询
  db.all(`
    SELECT 
      symbol,
      timestamp,
      message,
      details,
      severity,
      DATE(timestamp) as event_date
    FROM alerts 
    WHERE severity = 'critical'
    ORDER BY timestamp DESC 
    LIMIT 100
  `, (err, rows) => {
    if (err) {
      console.error('❌ Query error:', err);
      db.close();
      return;
    }
    
    console.log(`📊 Query returned ${rows ? rows.length : 0} rows\n`);
    
    if (rows && rows.length > 0) {
      console.log('First 3 rows:');
      rows.slice(0, 3).forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.event_date} | ${row.symbol}`);
        console.log(`   Message: ${row.message.substring(0, 50)}...`);
        console.log(`   Severity: ${row.severity}`);
        console.log(`   Timestamp: ${row.timestamp}`);
      });
    } else {
      console.log('❌ No rows returned!');
    }
    
    db.close();
  });
});







