const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

console.log('添加 2025年10月10-11日 BTC真实闪崩事件...\n');

const db = new sqlite3.Database(dbPath);

// 真实的闪崩事件数据（基于 Reuters、IG、纳斯达克等权威来源）
const crashEvents = [
  {
    timestamp: '2025-10-10T14:00:00Z',
    type: 'price_jump',
    symbol: 'BTCUSDT',
    severity: 'critical',
    message: 'BTC价格从约$122,000跌至约$104,000，跌幅约14.75%。全球加密市场史上最大规模清算潮',
    details: JSON.stringify({
      peak_price: 122000,
      bottom_price: 104000,
      price_change: -14.75,
      duration_hours: 12,
      liquidation_usd: 19000000000,  // 约190亿美元杠杆头寸清算
      liquidated_accounts: 1620000,
      market_cap_loss: 370000000000,  // 超过3700亿美元市值蒸发
      trigger: '全球加密资产市场史上规模最大的清算潮',
      impact: '仅杠杆头寸就被清算约190亿美元，市值蒸发超3700亿美元',
      source: 'Reuters, IG, 纳斯达克等权威报道',
      verified: true
    })
  },
  {
    timestamp: '2025-10-10T14:30:00Z',
    type: 'price_jump',
    symbol: 'ETHUSDT',
    severity: 'critical',
    message: 'ETH跟随BTC下跌，跌幅约20%，次主流币跌幅更大',
    details: JSON.stringify({
      price_change: -20,
      duration_hours: 12,
      trigger: 'BTC闪崩引发加密市场连锁反应',
      impact: '次主流币如Ethereum跌幅大约20%左右',
      source: 'Reuters等权威报道',
      verified: true
    })
  },
  {
    timestamp: '2025-10-11T02:00:00Z',
    type: 'whale_transfer',
    symbol: 'BTCUSDT',
    severity: 'critical',
    message: '闪崩期间触发大规模杠杆清算，约162万账户被强制平仓，清算规模约190亿美元',
    details: JSON.stringify({
      liquidation_usd: 19000000000,  // 约190亿美元
      liquidated_accounts: 1620000,
      market_cap_loss: 370000000000,  // 市值蒸发超3700亿美元
      market_impact: 'extreme',
      leverage_cascade: true,
      source: 'Reuters等权威报道',
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









