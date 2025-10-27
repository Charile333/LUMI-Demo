const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('添加 2025年10月10-11日 BTC真实闪崩事件...\n');

const db = new sqlite3.Database(dbPath);

// 真实的闪崩事件数据
const crashEvents = [
  {
    timestamp: '2025-10-10T14:00:00Z',
    type: 'price_jump',
    symbol: 'BTCUSDT',
    severity: 'critical',
    message: 'BTC价格在数小时内暴跌25%，从$115,000跌至$86,000',
    details: JSON.stringify({
      peak_price: 115000,
      bottom_price: 86000,
      price_change: -25.22,
      duration_hours: 8,
      liquidation_usd: 19100000000,
      liquidated_accounts: 1620000,
      trigger: '特朗普宣布重启对华100%关税',
      impact: '全网24小时清算191亿美元，创历史纪录',
      source: 'real_event',
      verified: true
    })
  },
  {
    timestamp: '2025-10-10T14:30:00Z',
    type: 'price_jump',
    symbol: 'ETHUSDT',
    severity: 'critical',
    message: 'ETH跟随BTC暴跌，跌幅达40-50%',
    details: JSON.stringify({
      price_change: -45,
      duration_hours: 8,
      trigger: 'BTC闪崩引发连锁反应',
      source: 'real_event',
      verified: true
    })
  },
  {
    timestamp: '2025-10-11T02:00:00Z',
    type: 'whale_transfer',
    symbol: 'BTCUSDT',
    severity: 'critical',
    message: '闪崩期间触发大规模杠杆清算，162万账户被强制平仓',
    details: JSON.stringify({
      liquidation_usd: 19100000000,
      liquidated_accounts: 1620000,
      market_impact: 'extreme',
      leverage_cascade: true,
      source: 'real_event',
      verified: true
    })
  }
];

let successCount = 0;
let errorCount = 0;

const insertPromises = crashEvents.map((event) => {
  return new Promise((resolve) => {
    db.run(`
      INSERT INTO alerts (timestamp, type, symbol, message, details, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [event.timestamp, event.type, event.symbol, event.message, event.details, event.severity], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          console.log(`⚠️  跳过重复记录: ${event.timestamp} - ${event.symbol}`);
        } else {
          console.error(`❌ 插入失败:`, err.message);
          errorCount++;
        }
      } else {
        successCount++;
        console.log(`✅ [${successCount}/${crashEvents.length}] ${event.timestamp} - ${event.message.substring(0, 50)}...`);
      }
      resolve();
    });
  });
});

Promise.all(insertPromises).then(() => {
  console.log('\n════════════════════════════════════════');
  console.log('✅ 真实闪崩事件添加完成！');
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${errorCount} 条`);
  console.log('════════════════════════════════════════\n');

  // 验证数据
  db.all(`
    SELECT 
      datetime(timestamp) as time,
      symbol,
      severity,
      message
    FROM alerts
    WHERE date(timestamp) BETWEEN '2025-10-10' AND '2025-10-11'
      AND severity = 'critical'
    ORDER BY timestamp
  `, (err, rows) => {
    if (!err && rows.length > 0) {
      console.log('📊 2025年10月10-11日的critical事件：\n');
      rows.forEach(row => {
        console.log(`[${row.time}] ${row.symbol}`);
        console.log(`${row.message}\n`);
      });
    }

    // 显示总记录数
    db.get('SELECT COUNT(*) as total FROM alerts', (err, row) => {
      if (!err) {
        console.log(`📈 LUMI数据库现有记录总数: ${row.total}`);
      }
      db.close();
    });
  });
});









