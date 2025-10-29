/**
 * 🔍 重新获取所有历史崩盘事件的准确数据
 * 使用1小时K线从币安API查询
 */

const https = require('https');

function getBinanceKlines(symbol, interval, startTime, endTime) {
  return new Promise((resolve, reject) => {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    
    console.log(`正在查询: ${symbol} (${new Date(startTime).toISOString()} ~ ${new Date(endTime).toISOString()})`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const klines = JSON.parse(data);
          if (Array.isArray(klines)) {
            const formatted = klines.map(k => ({
              time: k[0],
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5])
            }));
            resolve(formatted);
          } else {
            reject(new Error('Invalid response from Binance API'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

async function analyzeCrashPeriod(symbol, startDate, endDate, eventName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 分析 ${eventName}: ${symbol} (${startDate} ~ ${endDate})`);
  console.log('='.repeat(60));
  
  const startTime = new Date(startDate + 'T00:00:00Z').getTime();
  const endTime = new Date(endDate + 'T23:59:59Z').getTime();
  
  try {
    // 使用1小时K线数据
    const klines = await getBinanceKlines(symbol, '1h', startTime, endTime);
    
    if (klines.length === 0) {
      console.error(`❌ 无数据可用`);
      return null;
    }
    
    console.log(`✅ 获取到 ${klines.length} 根K线`);
    
    // 分析数据
    let highestPrice = 0;
    let lowestPrice = Infinity;
    let highestTime = null;
    let lowestTime = null;
    let highestIndex = 0;
    let lowestIndex = 0;
    
    klines.forEach((k, index) => {
      if (k.high > highestPrice) {
        highestPrice = k.high;
        highestTime = k.time;
        highestIndex = index;
      }
      if (k.low < lowestPrice) {
        lowestPrice = k.low;
        lowestTime = k.time;
        lowestIndex = index;
      }
    });
    
    // 计算崩盘幅度
    const crashPercentage = ((lowestPrice - highestPrice) / highestPrice * 100).toFixed(2);
    
    // 计算持续时间
    const durationMs = Math.abs(lowestTime - highestTime);
    const durationHours = Math.round(durationMs / 3600 / 1000);
    
    // 确定崩盘开始和结束
    let crashStartTime, crashEndTime;
    
    if (highestIndex < lowestIndex) {
      // 正常顺序：最高点 → 最低点
      crashStartTime = highestTime;
      crashEndTime = lowestTime;
    } else {
      // 反序：需要调整
      crashStartTime = lowestTime;
      crashEndTime = highestTime;
    }
    
    // 寻找恢复点（价格回升2%以上）
    for (let i = lowestIndex + 1; i < klines.length; i++) {
      if (klines[i].close > lowestPrice * 1.02) {
        crashEndTime = klines[i].time;
        break;
      }
    }
    
    const result = {
      eventName: eventName,
      symbol: symbol,
      crashStart: {
        timestamp: new Date(crashStartTime).toISOString(),
        price: highestPrice.toFixed(2),
        time: new Date(crashStartTime).toLocaleString('zh-CN', { timeZone: 'UTC' })
      },
      lowestPoint: {
        timestamp: new Date(lowestTime).toISOString(),
        price: lowestPrice.toFixed(2),
        time: new Date(lowestTime).toLocaleString('zh-CN', { timeZone: 'UTC' })
      },
      crashEnd: {
        timestamp: new Date(crashEndTime).toISOString(),
        price: klines.find(k => k.time === crashEndTime)?.close.toFixed(2) || lowestPrice.toFixed(2),
        time: new Date(crashEndTime).toLocaleString('zh-CN', { timeZone: 'UTC' })
      },
      crashPercentage: crashPercentage,
      duration: `${durationHours}h`,
      priceChange: {
        from: highestPrice.toFixed(2),
        to: lowestPrice.toFixed(2),
        percentage: crashPercentage
      }
    };
    
    console.log('\n📊 崩盘数据分析结果：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🟠 最高点: ${result.crashStart.time} UTC`);
    console.log(`   价格: $${result.crashStart.price}`);
    console.log('');
    console.log(`🔴 最低点: ${result.lowestPoint.time} UTC`);
    console.log(`   价格: $${result.lowestPoint.price}`);
    console.log('');
    console.log(`🟢 恢复点: ${result.crashEnd.time} UTC`);
    console.log(`   价格: $${result.crashEnd.price}`);
    console.log('');
    console.log(`📉 崩盘幅度: ${crashPercentage}%`);
    console.log(`⏱️  持续时间: ${durationHours}小时`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return result;
    
  } catch (error) {
    console.error(`❌ 查询失败:`, error.message);
    return null;
  }
}

// 定义所有需要查询的事件
const EVENTS = [
  // 2025年1011事件
  { name: 'BTC 1011事件', symbol: 'BTCUSDT', startDate: '2025-10-10', endDate: '2025-10-11', id: 'btc_2025-10-10' },
  { name: 'ETH 1011事件', symbol: 'ETHUSDT', startDate: '2025-10-10', endDate: '2025-10-11', id: 'eth_2025-10-10' },
  
  // 2022年FTX崩盘
  { name: 'FTT崩盘', symbol: 'FTTUSDT', startDate: '2022-11-07', endDate: '2022-11-09', id: 'ftt_2022-11-08' },
  { name: 'BTC FTX崩盘', symbol: 'BTCUSDT', startDate: '2022-11-08', endDate: '2022-11-10', id: 'btc_2022-11-09' },
  
  // 2022年LUNA崩盘
  { name: 'LUNA崩盘', symbol: 'LUNAUSDT', startDate: '2022-05-08', endDate: '2022-05-11', id: 'luna_2022-05-10' },
  
  // 2020年COVID黑色星期四
  { name: 'BTC COVID黑色星期四', symbol: 'BTCUSDT', startDate: '2020-03-11', endDate: '2020-03-13', id: 'btc_2020-03-12' },
];

async function main() {
  console.log('🚀 开始重新获取所有历史崩盘事件数据（使用1小时K线）...\n');
  
  const results = [];
  
  for (const event of EVENTS) {
    const result = await analyzeCrashPeriod(event.symbol, event.startDate, event.endDate, event.name);
    if (result) {
      results.push({ ...result, id: event.id });
    }
    
    // 避免API限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 输出汇总
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                  📋 查询结果汇总                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  if (results.length === 0) {
    console.log('❌ 没有成功查询到任何数据\n');
    return;
  }
  
  results.forEach((r, index) => {
    console.log(`${index + 1}. ${r.eventName}`);
    console.log(`   最高点: $${r.crashStart.price} (${r.crashStart.timestamp})`);
    console.log(`   最低点: $${r.lowestPoint.price} (${r.lowestPoint.timestamp})`);
    console.log(`   崩盘幅度: ${r.crashPercentage}%`);
    console.log(`   持续时间: ${r.duration}`);
    console.log('');
  });
  
  // 生成代码
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              📝 route.ts 更新代码                          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  results.forEach(r => {
    const assetName = r.symbol.replace('USDT', '');
    console.log(`{`);
    console.log(`  id: '${r.id}',`);
    console.log(`  date: '${r.id.split('_')[1]}',`);
    console.log(`  asset: '${assetName}/USDT',`);
    console.log(`  crashPercentage: '${r.crashPercentage}',`);
    console.log(`  duration: '${r.duration}',`);
    console.log(`  description: '${r.eventName}：价格从$${r.crashStart.price}跌至$${r.lowestPoint.price}',`);
    console.log(`  timestamp: '${r.lowestPoint.timestamp}',  // ✅ 真实最低点时刻`);
    console.log(`  crashStart: '${r.crashStart.timestamp}',  // 🟠 崩盘开始时刻`);
    console.log(`  crashEnd: '${r.crashEnd.timestamp}',      // 🟢 崩盘结束时刻`);
    console.log(`  details: {`);
    console.log(`    previous_price: ${r.crashStart.price},`);
    console.log(`    current_price: ${r.lowestPoint.price},`);
    console.log(`    price_change: ${r.crashPercentage}`);
    console.log(`  }`);
    console.log(`},\n`);
  });
}

main().catch(console.error);





