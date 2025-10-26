/**
 * 生成演示警报数据
 * 用于测试黑天鹅终端监控系统
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../../duolume-master/utils/database/app.db');

// 模拟资产列表
const assets = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'ADA/USDT',
  'DOT/USDT',
  'AVAX/USDT',
  'MATIC/USDT'
];

// 警报类型
const alertTypes = [
  'Price Jump',
  'Whale Transfer',
  'Funding Spike',
  'Volume Surge',
  'Volatility Spike'
];

// 生成随机价格变化
function generatePriceChange() {
  const isPositive = Math.random() > 0.5;
  const magnitude = Math.random();
  
  let change;
  if (magnitude < 0.4) {
    // 40% 概率：小波动 (0.5% - 1.5%)
    change = 0.005 + Math.random() * 0.01;
  } else if (magnitude < 0.7) {
    // 30% 概率：中等波动 (1.5% - 3%)
    change = 0.015 + Math.random() * 0.015;
  } else if (magnitude < 0.9) {
    // 20% 概率：大波动 (3% - 6%)
    change = 0.03 + Math.random() * 0.03;
  } else {
    // 10% 概率：极端波动 (6% - 12%)
    change = 0.06 + Math.random() * 0.06;
  }
  
  return isPositive ? change : -change;
}

// 生成随机价格
function generatePrice(asset) {
  const basePrices = {
    'BTC/USDT': 68000,
    'ETH/USDT': 3200,
    'SOL/USDT': 145,
    'BNB/USDT': 580,
    'ADA/USDT': 0.58,
    'DOT/USDT': 7.2,
    'AVAX/USDT': 38,
    'MATIC/USDT': 0.87
  };
  
  const basePrice = basePrices[asset] || 100;
  const variance = basePrice * 0.05; // 5% 价格变动范围
  return basePrice + (Math.random() - 0.5) * variance;
}

// 生成警报消息
function generateMessage(asset, alertType, priceChange) {
  const messages = {
    'Price Jump': `${asset} experienced sudden price movement`,
    'Whale Transfer': `Large transfer detected for ${asset}`,
    'Funding Spike': `Funding rate anomaly detected in ${asset}`,
    'Volume Surge': `Unusual trading volume spike in ${asset}`,
    'Volatility Spike': `High volatility detected in ${asset} markets`
  };
  
  return messages[alertType] || `Alert for ${asset}`;
}

// 创建警报
function createAlert(db, asset, callback) {
  const symbol = asset.replace('/', '');
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  const priceChange = generatePriceChange();
  const currentPrice = generatePrice(asset);
  const previousPrice = currentPrice / (1 + priceChange);
  const message = generateMessage(asset, alertType, priceChange);
  const timestamp = new Date().toISOString();
  
  const details = JSON.stringify({
    price_change: priceChange,
    current_price: currentPrice,
    previous_price: previousPrice,
    alert_type: alertType,
    volume_change: Math.random() * 2 - 0.5 // -50% to +150%
  });
  
  const insertQuery = `
    INSERT INTO alerts (timestamp, symbol, message, severity, details)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  // 确定严重程度
  let severity = 'medium';
  const absChange = Math.abs(priceChange);
  if (absChange > 0.05) {
    severity = 'critical';
  } else if (absChange > 0.02) {
    severity = 'high';
  }
  
  db.run(insertQuery, [timestamp, symbol, message, severity, details], (err) => {
    if (err) {
      console.error(`❌ Error creating alert for ${asset}:`, err.message);
    } else {
      const changeStr = (priceChange * 100).toFixed(2);
      const sign = priceChange > 0 ? '+' : '';
      console.log(`✅ ${timestamp} | ${asset.padEnd(12)} | ${severity.padEnd(10).toUpperCase()} | ${sign}${changeStr}% | ${message}`);
    }
    callback();
  });
}

// 主函数
function generateDemoAlerts(count = 20) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Black Swan Demo Alert Generator                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📍 Database: ${dbPath}`);
  console.log(`🎲 Generating ${count} demo alerts...\n`);
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Database connection error:', err.message);
      return;
    }
    
    console.log('✅ Connected to database\n');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    let generated = 0;
    
    const generateNext = () => {
      if (generated >= count) {
        db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err.message);
          } else {
            console.log('\n─────────────────────────────────────────────────────────────');
            console.log(`\n✅ Successfully generated ${count} demo alerts!`);
            console.log('\n💡 Tips:');
            console.log('   • Start the LUMI server: npm run dev');
            console.log('   • Visit: http://localhost:3000/black-swan-terminal');
            console.log('   • Watch the alerts appear in real-time!\n');
          }
        });
        return;
      }
      
      const asset = assets[Math.floor(Math.random() * assets.length)];
      
      // 添加延迟以模拟实时生成
      setTimeout(() => {
        createAlert(db, asset, () => {
          generated++;
          generateNext();
        });
      }, Math.random() * 500); // 随机延迟 0-500ms
    };
    
    generateNext();
  });
}

// 命令行参数
const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0]) : 20;

if (isNaN(count) || count < 1) {
  console.error('❌ Invalid count. Usage: node generate-demo-alerts.js [count]');
  process.exit(1);
}

// 运行
generateDemoAlerts(count);







