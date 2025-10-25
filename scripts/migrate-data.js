/**
 * 迁移数据从旧数据库到LUMI独立数据库
 * 将 duolume-master 的数据复制到 LUMI/database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 旧数据库路径
const oldDbPath = path.join(__dirname, '../../duolume-master/utils/database/app.db');
// 新数据库路径
const newDbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║     Data Migration Tool                                    ║');
console.log('║     数据迁移工具                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📍 Source (旧数据库):', oldDbPath);
console.log('📍 Target (新数据库):', newDbPath);
console.log('');

// 检查旧数据库是否存在
if (!fs.existsSync(oldDbPath)) {
  console.log('⚠️  Source database not found.');
  console.log('   This is OK if you are setting up a fresh LUMI installation.');
  console.log('');
  console.log('💡 To setup new database, run:');
  console.log('   node scripts/setup-database.js');
  console.log('');
  process.exit(0);
}

// 确保新数据库目录存在
const newDbDir = path.dirname(newDbPath);
if (!fs.existsSync(newDbDir)) {
  fs.mkdirSync(newDbDir, { recursive: true });
  console.log('✅ Created target directory');
}

// 打开旧数据库（只读）
const oldDb = new sqlite3.Database(oldDbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening source database:', err.message);
    return;
  }
  
  console.log('✅ Connected to source database');
  
  // 查询所有警报数据
  oldDb.all('SELECT * FROM alerts', (err, rows) => {
    if (err) {
      console.error('❌ Error reading source data:', err.message);
      oldDb.close();
      return;
    }
    
    console.log(`📊 Found ${rows.length} records to migrate`);
    console.log('');
    
    oldDb.close();
    
    // 打开新数据库（创建或打开）
    const newDb = new sqlite3.Database(newDbPath, (err) => {
      if (err) {
        console.error('❌ Error opening target database:', err.message);
        return;
      }
      
      console.log('✅ Connected to target database');
      
      // 创建表（如果不存在）
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
      
      newDb.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Error creating table:', err.message);
          newDb.close();
          return;
        }
        
        console.log('✅ Table structure ready');
        console.log('');
        console.log('🔄 Migrating data...');
        console.log('');
        
        // 批量插入数据
        const insertSQL = `
          INSERT INTO alerts (timestamp, symbol, message, severity, details, type)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const stmt = newDb.prepare(insertSQL);
        let migrated = 0;
        let errors = 0;
        
        rows.forEach((row, index) => {
          stmt.run(
            row.timestamp,
            row.symbol,
            row.message,
            row.severity,
            row.details,
            row.type || null,
            (err) => {
              if (err) {
                console.error(`❌ Error migrating record ${index + 1}:`, err.message);
                errors++;
              } else {
                migrated++;
              }
              
              // 最后一条记录
              if (index === rows.length - 1) {
                stmt.finalize();
                
                console.log('════════════════════════════════════════════════════════════');
                console.log(`✅ Migration complete!`);
                console.log(`   • Successfully migrated: ${migrated} records`);
                if (errors > 0) {
                  console.log(`   • Errors: ${errors} records`);
                }
                console.log('════════════════════════════════════════════════════════════');
                console.log('');
                console.log('💡 Next steps:');
                console.log('   1. Verify data:');
                console.log('      sqlite3 database/alerts.db "SELECT COUNT(*) FROM alerts;"');
                console.log('   2. Restart LUMI server:');
                console.log('      npm run dev');
                console.log('   3. Check the application to ensure data is displayed correctly');
                console.log('');
                console.log('⚠️  Note: The old database is NOT deleted.');
                console.log('   You can keep it as a backup or delete it manually.');
                console.log('');
                
                newDb.close();
              }
            }
          );
        });
      });
    });
  });
});



