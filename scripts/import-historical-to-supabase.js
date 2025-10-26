/**
 * 导入历史闪崩事件到 Supabase
 * 运行前需要设置环境变量：
 * SUPABASE_URL=https://xxx.supabase.co
 * SUPABASE_KEY=eyJhbG...
 */

const https = require('https');

// 从环境变量读取
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 历史闪崩事件（与 import-historical-crashes.js 相同）
const historicalCrashes = [
  // 2025年
  {
    date: '2025-10-10',
    symbol: 'BTCUSDT',
    crashPercentage: -25.22,
    peakPrice: 115000,
    bottomPrice: 86000,
    description: 'BTC价格在数小时内暴跌25%，从$115,000跌至$86,000',
    duration: 8,
    trigger: '特朗普宣布重启对华100%关税'
  },
  {
    date: '2025-10-10',
    symbol: 'ETHUSDT',
    crashPercentage: -45,
    description: 'ETH跟随BTC暴跌，跌幅达40-50%',
    duration: 8
  },
  {
    date: '2025-10-11',
    symbol: 'BTCUSDT',
    crashPercentage: -25.22,
    peakPrice: 115000,
    bottomPrice: 86000,
    description: '闪崩期间触发大规模杠杆清算，162万账户被强制平仓',
    duration: 8
  },
  // 2024年
  {
    date: '2024-08-05',
    symbol: 'BTCUSDT',
    crashPercentage: -15.8,
    peakPrice: 62000,
    bottomPrice: 52200,
    description: '日本央行加息引发全球市场恐慌，比特币暴跌',
    duration: 4
  },
  {
    date: '2024-07-04',
    symbol: 'ETHUSDT',
    crashPercentage: -12.3,
    peakPrice: 3800,
    bottomPrice: 3333,
    description: 'ETH现货ETF批准前夕市场获利了结',
    duration: 3
  },
  {
    date: '2024-03-18',
    symbol: 'BTCUSDT',
    crashPercentage: -11.2,
    peakPrice: 73750,
    bottomPrice: 65500,
    description: '比特币触及历史新高后大幅回调',
    duration: 6
  },
  // 更多事件...根据需要添加
];

function insertToSupabase(event) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date(event.date + 'T12:00:00Z').toISOString();
    
    const data = JSON.stringify({
      timestamp: timestamp,
      symbol: event.symbol,
      message: event.description,
      severity: 'critical',
      type: 'historical_crash',
      details: {
        price_change: event.crashPercentage / 100,
        current_price: event.bottomPrice,
        previous_price: event.peakPrice,
        duration_hours: event.duration,
        trigger: event.trigger,
        is_historical: true
      }
    });
    
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: '/rest/v1/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log(`✅ ${event.date} | ${event.symbol} | ${event.crashPercentage}%`);
        resolve();
      } else {
        console.error(`❌ 失败 (${res.statusCode}): ${event.description.substring(0, 30)}...`);
        resolve(); // 继续处理其他事件
      }
    });
    
    req.on('error', (e) => {
      console.error(`❌ 错误:`, e.message);
      resolve();
    });
    
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     导入历史闪崩事件到 Supabase                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ 错误：未设置 Supabase 凭据！');
    console.log('\n请设置环境变量：');
    console.log('  SUPABASE_URL=https://xxx.supabase.co');
    console.log('  SUPABASE_KEY=eyJhbG...');
    console.log('\n或者：');
    console.log('  export SUPABASE_URL=...');
    console.log('  export SUPABASE_KEY=...');
    console.log('  node import-historical-to-supabase.js\n');
    process.exit(1);
  }
  
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📊 总事件数: ${historicalCrashes.length}\n`);
  console.log('开始导入...\n');
  
  for (const event of historicalCrashes) {
    await insertToSupabase(event);
    await new Promise(resolve => setTimeout(resolve, 500)); // 避免限流
  }
  
  console.log('\n✅ 导入完成！');
  console.log('\n💡 下一步：');
  console.log('  1. 访问 Supabase Dashboard 确认数据');
  console.log('  2. 重新部署 Vercel');
  console.log('  3. 访问你的网站查看历史事件\n');
}

main().catch(error => {
  console.error('❌ 运行失败:', error);
  process.exit(1);
});

