// 快速测试实时预警系统
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'database', 'alerts.db');
const db = new sqlite3.Database(dbFile);

function insertTestAlert() {
  const timestamp = new Date().toISOString();
  
  const alerts = [
    {
      symbol: 'BTCUSDT',
      message: '🚨 BTC价格剧烈波动 -8.5%',
      severity: 'critical',
      details: JSON.stringify({
        price_change: -8.5,
        current_price: 87200,
        trigger: 'Large sell-off detected',
        volume_spike: true,
        alert_type: 'Real-time Test',
        source: 'test_script'
      }),
      type: 'price_jump'
    },
    {
      symbol: 'ETHUSDT',
      message: '⚠️ ETH跟随BTC下跌 -6.2%',
      severity: 'high',
      details: JSON.stringify({
        price_change: -6.2,
        current_price: 3450,
        correlation_btc: true,
        alert_type: 'Real-time Test',
        source: 'test_script'
      }),
      type: 'price_jump'
    }
  ];

  console.log('\n🚀 开始插入测试预警...\n');

  let completed = 0;
  alerts.forEach((alert, index) => {
    db.run(
      'INSERT INTO alerts (timestamp, symbol, message, severity, details, type) VALUES (?, ?, ?, ?, ?, ?)',
      [timestamp, alert.symbol, alert.message, alert.severity, alert.details, alert.type],
      function(err) {
        if (err) {
          console.error(`❌ 插入 ${alert.symbol} 失败:`, err.message);
        } else {
          console.log(`✅ 成功插入 ${alert.symbol} 预警`);
          console.log(`   ID: ${this.lastID}`);
          console.log(`   消息: ${alert.message}`);
          console.log(`   严重程度: ${alert.severity}`);
          console.log('');
        }
        
        completed++;
        if (completed === alerts.length) {
          console.log('🎉 所有测试预警已插入！');
          console.log('💡 打开黑天鹅页面查看实时预警：http://localhost:3000/black-swan');
          console.log('');
          db.close();
        }
      }
    );
  });
}

// 验证数据库连接
db.get('SELECT COUNT(*) as count FROM alerts', (err, row) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  
  console.log('\n════════════════════════════════════════');
  console.log('   实时预警系统 - 测试脚本');
  console.log('════════════════════════════════════════');
  console.log(`数据库: ${dbFile}`);
  console.log(`现有预警数量: ${row.count}`);
  console.log('════════════════════════════════════════\n');
  
  insertTestAlert();
});


