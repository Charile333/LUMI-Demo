/**
 * 🔍 查询2025年10月10-11日的BTC和ETH崩盘数据
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

async function analyzeCrashPeriod(symbol, startDate, endDate) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 分析 ${symbol} (${startDate} ~ ${endDate})`);
  console.log('='.repeat(60));
  
  const startTime = new Date(startDate + 'T00:00:00Z').getTime();
  const endTime = new Date(endDate + 'T23:59:59Z').getTime();
  
  try {
    // 获取5分钟K线数据
    const klines = await getBinanceKlines(symbol, '5m', startTime, endTime);
    
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
    
    // 寻找恢复点
    for (let i = lowestIndex + 1; i < klines.length; i++) {
      if (klines[i].close > lowestPrice * 1.02) {
        crashEndTime = klines[i].time;
        break;
      }
    }
    
    const result = {
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
      },
      period: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString()
      }
    };
    
    console.log('\n📊 崩盘数据分析结果：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🟠 最高点: ${result.crashStart.time} UTC`);
    console.log(`   价格: $${result.crashStart.price}`);
    console.log(`   ISO: ${result.crashStart.timestamp}`);
    console.log('');
    console.log(`🔴 最低点: ${result.lowestPoint.time} UTC`);
    console.log(`   价格: $${result.lowestPoint.price}`);
    console.log(`   ISO: ${result.lowestPoint.timestamp}`);
    console.log('');
    console.log(`🟢 恢复点: ${result.crashEnd.time} UTC`);
    console.log(`   价格: $${result.crashEnd.price}`);
    console.log(`   ISO: ${result.crashEnd.timestamp}`);
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

async function main() {
  console.log('🚀 开始查询 2025-10-10 至 2025-10-11 的崩盘数据...\n');
  
  const results = [];
  
  // 查询BTC
  const btcResult = await analyzeCrashPeriod('BTCUSDT', '2025-10-10', '2025-10-11');
  if (btcResult) results.push({ name: 'BTC', ...btcResult });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 查询ETH
  const ethResult = await analyzeCrashPeriod('ETHUSDT', '2025-10-10', '2025-10-11');
  if (ethResult) results.push({ name: 'ETH', ...ethResult });
  
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
    console.log(`${index + 1}. ${r.name}/USDT`);
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
    const id = `${assetName.toLowerCase()}_2025-10-10`;
    console.log(`{`);
    console.log(`  id: '${id}',`);
    console.log(`  date: '2025-10-10',`);
    console.log(`  asset: '${assetName}/USDT',`);
    console.log(`  crashPercentage: '${r.crashPercentage}',`);
    console.log(`  duration: '${r.duration}',`);
    console.log(`  description: '${assetName} 2025年10月崩盘：价格从$${r.crashStart.price}跌至$${r.lowestPoint.price}',`);
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











