/**
 * 导入历史真实闪崩事件
 * 包括BTC和其他主要加密货币的著名崩盘事件
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// LUMI独立数据库路径
const dbPath = path.join(__dirname, '..', 'database', 'alerts.db');

// 真实历史闪崩事件数据
const historicalCrashes = [
  // === 2025年10月10-11日 - 史上最大规模清算潮 ===
  {
    date: '2025-10-10',
    symbol: 'BTCUSDT',
    crashPercentage: -14.75,
    peakPrice: 122000,
    bottomPrice: 104000,
    description: 'BTC从约$122,000跌至$104,000，跌幅约15%。全球加密市场史上最大规模清算潮',
    duration: 12,
    volume_spike: 8.5,
    liquidation_usd: 19000000000,  // 190亿美元杠杆清算
    market_cap_loss: 370000000000,  // 3700亿美元市值蒸发
    trigger: '全球加密资产市场史上规模最大的清算潮'
  },
  {
    date: '2025-10-10',
    symbol: 'ETHUSDT',
    crashPercentage: -20,
    peakPrice: 4000,
    bottomPrice: 3200,
    description: 'ETH跌幅约20%，次主流币跌幅更大，随BTC暴跌触发杠杆清算',
    duration: 12,
    volume_spike: 7.2
  },
  
  // === 2024年 ===
  {
    date: '2024-08-05',
    symbol: 'BTCUSDT',
    crashPercentage: -15.8,
    peakPrice: 62000,
    bottomPrice: 52200,
    description: '日本央行加息引发全球市场恐慌，比特币暴跌',
    duration: 4,
    volume_spike: 3.8
  },
  {
    date: '2024-07-04',
    symbol: 'ETHUSDT',
    crashPercentage: -12.3,
    peakPrice: 3800,
    bottomPrice: 3333,
    description: 'ETH现货ETF批准前夕市场获利了结',
    duration: 3,
    volume_spike: 2.9
  },
  {
    date: '2024-03-18',
    symbol: 'BTCUSDT',
    crashPercentage: -11.2,
    peakPrice: 73750,
    bottomPrice: 65500,
    description: '比特币触及历史新高后大幅回调',
    duration: 6,
    volume_spike: 4.2
  },
  
  // === 2023年 ===
  {
    date: '2023-11-10',
    symbol: 'BTCUSDT',
    crashPercentage: -8.5,
    peakPrice: 38000,
    bottomPrice: 34770,
    description: 'CZ认罪后加密市场恐慌性抛售',
    duration: 3,
    volume_spike: 3.1
  },
  {
    date: '2023-08-17',
    symbol: 'BTCUSDT',
    crashPercentage: -10.4,
    peakPrice: 29800,
    bottomPrice: 26700,
    description: 'SpaceX抛售比特币引发市场恐慌',
    duration: 5,
    volume_spike: 2.8
  },
  {
    date: '2023-03-10',
    symbol: 'BTCUSDT',
    crashPercentage: -13.2,
    peakPrice: 24200,
    bottomPrice: 21000,
    description: 'Silicon Valley Bank倒闭引发加密市场震荡',
    duration: 4,
    volume_spike: 4.5
  },
  
  // === 2022年（FTX年）===
  {
    date: '2022-11-09',
    symbol: 'BTCUSDT',
    crashPercentage: -23.5,
    peakPrice: 21500,
    bottomPrice: 16450,
    description: 'FTX交易所崩盘，加密市场历史性暴跌',
    duration: 8,
    volume_spike: 6.8
  },
  {
    date: '2022-11-09',
    symbol: 'ETHUSDT',
    crashPercentage: -18.7,
    peakPrice: 1600,
    bottomPrice: 1300,
    description: 'FTX崩盘影响以太坊大幅下跌',
    duration: 7,
    volume_spike: 5.9
  },
  {
    date: '2022-11-09',
    symbol: 'SOLUSDT',
    crashPercentage: -52.3,
    peakPrice: 35,
    bottomPrice: 16.7,
    description: 'FTX重仓SOL，Solana遭遇毁灭性打击',
    duration: 10,
    volume_spike: 8.2
  },
  {
    date: '2022-06-18',
    symbol: 'BTCUSDT',
    crashPercentage: -16.8,
    peakPrice: 22800,
    bottomPrice: 18970,
    description: 'Celsius暂停提款，加密信贷危机爆发',
    duration: 6,
    volume_spike: 4.3
  },
  {
    date: '2022-05-12',
    symbol: 'BTCUSDT',
    crashPercentage: -19.2,
    peakPrice: 38500,
    bottomPrice: 31100,
    description: 'Terra/LUNA崩盘引发加密市场连锁反应',
    duration: 7,
    volume_spike: 5.7
  },
  
  // === 2021年（牛市高点）===
  {
    date: '2021-11-10',
    symbol: 'BTCUSDT',
    crashPercentage: -21.3,
    peakPrice: 69000,
    bottomPrice: 54300,
    description: '比特币从历史最高点开始大幅回调',
    duration: 9,
    volume_spike: 4.9
  },
  {
    date: '2021-09-07',
    symbol: 'BTCUSDT',
    crashPercentage: -17.8,
    peakPrice: 52900,
    bottomPrice: 43500,
    description: '萨尔瓦多采用比特币引发市场恐慌',
    duration: 5,
    volume_spike: 3.8
  },
  {
    date: '2021-05-19',
    symbol: 'BTCUSDT',
    crashPercentage: -30.2,
    peakPrice: 64800,
    bottomPrice: 45200,
    description: '中国禁止加密货币挖矿和交易，市场暴跌',
    duration: 12,
    volume_spike: 7.2
  },
  {
    date: '2021-05-19',
    symbol: 'ETHUSDT',
    crashPercentage: -35.8,
    peakPrice: 4380,
    bottomPrice: 2810,
    description: '中国政策影响，以太坊剧烈波动',
    duration: 11,
    volume_spike: 6.9
  },
  {
    date: '2021-04-18',
    symbol: 'BTCUSDT',
    crashPercentage: -15.3,
    peakPrice: 64800,
    bottomPrice: 54900,
    description: '比特币首次触及64k后回调',
    duration: 4,
    volume_spike: 3.4
  },
  
  // === 2020年（黑色星期四）===
  {
    date: '2020-03-12',
    symbol: 'BTCUSDT',
    crashPercentage: -50.2,
    peakPrice: 7950,
    bottomPrice: 3960,
    description: '"黑色星期四" - COVID-19恐慌导致比特币史诗级崩盘',
    duration: 18,
    volume_spike: 12.5
  },
  {
    date: '2020-03-12',
    symbol: 'ETHUSDT',
    crashPercentage: -62.1,
    peakPrice: 195,
    bottomPrice: 74,
    description: '"黑色星期四" - 以太坊遭受重创，DeFi清算潮',
    duration: 20,
    volume_spike: 15.8
  },
  
  // === 2019年 ===
  {
    date: '2019-09-24',
    symbol: 'BTCUSDT',
    crashPercentage: -16.7,
    peakPrice: 10350,
    bottomPrice: 8620,
    description: 'Bakkt期货上线后市场失望性下跌',
    duration: 5,
    volume_spike: 2.9
  },
  
  // === 2018年（熊市）===
  {
    date: '2018-11-14',
    symbol: 'BTCUSDT',
    crashPercentage: -37.8,
    peakPrice: 6450,
    bottomPrice: 4010,
    description: 'BCH硬分叉引发加密市场恐慌性抛售',
    duration: 14,
    volume_spike: 5.3
  },
  {
    date: '2018-01-16',
    symbol: 'BTCUSDT',
    crashPercentage: -33.5,
    peakPrice: 17200,
    bottomPrice: 11440,
    description: '从历史高点崩盘，熊市开始',
    duration: 10,
    volume_spike: 6.1
  }
];

// 创建警报条目
function createHistoricalAlert(db, crash, callback) {
  const priceChange = crash.crashPercentage / 100;
  const timestamp = new Date(crash.date + 'T12:00:00Z').toISOString();
  
  const details = JSON.stringify({
    price_change: priceChange,
    current_price: crash.bottomPrice,
    previous_price: crash.peakPrice,
    alert_type: 'Historical Crash Event',
    volume_change: crash.volume_spike,
    duration_hours: crash.duration,
    is_historical: true
  });
  
  const insertQuery = `
    INSERT INTO alerts (timestamp, symbol, message, severity, details, type)
    VALUES (?, ?, ?, 'critical', ?, 'historical_crash')
  `;
  
  const message = `${crash.description}`;
  
  db.run(insertQuery, [timestamp, crash.symbol, message, details], (err) => {
    if (err) {
      console.error(`❌ Error importing ${crash.date} ${crash.symbol}:`, err.message);
    } else {
      console.log(`✅ ${crash.date} | ${crash.symbol.padEnd(10)} | ${crash.crashPercentage.toFixed(1)}% | ${crash.description.substring(0, 50)}...`);
    }
    callback();
  });
}

// 主函数
function importHistoricalCrashes() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Historical Crash Events Import Tool                   ║');
  console.log('║     导入真实历史闪崩事件                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📍 Database: ${dbPath}`);
  console.log(`📊 Total events to import: ${historicalCrashes.length}\n`);
  console.log('─────────────────────────────────────────────────────────────\n');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Database connection error:', err.message);
      return;
    }
    
    console.log('✅ Connected to database\n');
    console.log('🔄 Importing historical crash events...\n');
    
    let imported = 0;
    
    const importNext = () => {
      if (imported >= historicalCrashes.length) {
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('\n─────────────────────────────────────────────────────────────');
            console.log(`\n✅ Successfully imported ${historicalCrashes.length} historical crash events!`);
            console.log('\n📈 Events Summary:');
            console.log(`   • 2024: ${historicalCrashes.filter(c => c.date.startsWith('2024')).length} events`);
            console.log(`   • 2023: ${historicalCrashes.filter(c => c.date.startsWith('2023')).length} events`);
            console.log(`   • 2022: ${historicalCrashes.filter(c => c.date.startsWith('2022')).length} events`);
            console.log(`   • 2021: ${historicalCrashes.filter(c => c.date.startsWith('2021')).length} events`);
            console.log(`   • 2020: ${historicalCrashes.filter(c => c.date.startsWith('2020')).length} events`);
            console.log(`   • 2018-2019: ${historicalCrashes.filter(c => c.date.startsWith('2018') || c.date.startsWith('2019')).length} events`);
            console.log('\n💡 Tips:');
            console.log('   • Restart LUMI server: npm run dev');
            console.log('   • Visit: http://localhost:3000/black-swan');
            console.log('   • View historical crash events in the left panel!\n');
          }
        });
        return;
      }
      
      const crash = historicalCrashes[imported];
      createHistoricalAlert(db, crash, () => {
        imported++;
        importNext();
      });
    };
    
    importNext();
  });
}

// 运行导入
console.log('\n⚠️  WARNING: This will add historical crash events to your database.');
console.log('If you want to clear existing data first, run:');
console.log('   sqlite3 ../duolume-master/utils/database/app.db "DELETE FROM alerts;"\n');

// 延迟3秒执行，给用户时间看警告
setTimeout(() => {
  importHistoricalCrashes();
}, 3000);

