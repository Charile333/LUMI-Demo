/**
 * 设置LUMI独立数据库
 * 创建数据库并初始化表结构
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// LUMI数据库路径
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'alerts.db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     LUMI Database Setup                                    ║');
console.log('║     设置LUMI独立数据库                                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 创建database目录
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Created database directory:', dbDir);
}

console.log('📍 Database location:', dbPath);
console.log('');

// 创建或打开数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error creating database:', err.message);
    return;
  }
  
  console.log('✅ Database connection established');
  console.log('');
  
  // 创建alerts表
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      symbol TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL,
      details TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err.message);
      db.close();
      return;
    }
    
    console.log('✅ Table "alerts" created/verified');
    
    // 创建索引以提高查询性能
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_timestamp ON alerts(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_severity ON alerts(severity)',
      'CREATE INDEX IF NOT EXISTS idx_symbol ON alerts(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_type ON alerts(type)'
    ];
    
    let indexCount = 0;
    createIndexes.forEach((indexSQL, i) => {
      db.run(indexSQL, (err) => {
        if (err) {
          console.error(`❌ Error creating index ${i + 1}:`, err.message);
        } else {
          indexCount++;
          if (indexCount === createIndexes.length) {
            console.log(`✅ Created ${indexCount} indexes for better performance`);
            
            // 检查表结构
            db.all("PRAGMA table_info(alerts)", (err, columns) => {
              if (!err) {
                console.log('\n📊 Table structure:');
                columns.forEach(col => {
                  console.log(`   • ${col.name.padEnd(12)} : ${col.type}`);
                });
              }
              
              // 检查数据
              db.get("SELECT COUNT(*) as count FROM alerts", (err, row) => {
                if (!err) {
                  console.log(`\n📈 Current records: ${row.count}`);
                }
                
                console.log('\n════════════════════════════════════════════════════════════');
                console.log('✅ Database setup complete!');
                console.log('════════════════════════════════════════════════════════════');
                console.log('\n💡 Next steps:');
                console.log('   1. Import historical crashes:');
                console.log('      node scripts/import-historical-crashes.js');
                console.log('   2. Start LUMI server:');
                console.log('      npm run dev');
                console.log('   3. Start alert monitoring (optional):');
                console.log('      cd ../duolume-master && python main.py\n');
                
                db.close();
              });
            });
          }
        }
      });
    });
  });
});
