/**
 * 🔍 自动从币安API获取真实准确的崩盘时刻
 * 
 * 功能：
 * 1. 查询指定日期前后24小时的K线数据
 * 2. 找到最低价的精确时刻
 * 3. 计算崩盘开始和结束时间
 * 4. 输出准确的时间戳
 */

const https = require('https');

// 币安API查询K线数据
function getBinanceKlines(symbol, interval, startTime, endTime) {
  return new Promise((resolve, reject) => {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    
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

// 查找崩盘的精确时刻
async function findCrashMoments(symbol, estimatedDate, windowHours = 48) {
  console.log(`\n🔍 正在查询 ${symbol} 在 ${estimatedDate} 附近的真实数据...`);
  
  // 将日期转为时间戳
  const centerTime = new Date(estimatedDate + 'T00:00:00Z').getTime();
  const startTime = centerTime - (windowHours / 2) * 3600 * 1000;
  const endTime = centerTime + (windowHours / 2) * 3600 * 1000;
  
  try {
    // 获取5分钟K线数据
    const klines = await getBinanceKlines(symbol, '5m', startTime, endTime);
    
    if (klines.length === 0) {
      console.error(`❌ 无数据可用（可能是币安上市前或数据不存在）`);
      return null;
    }
    
    console.log(`✅ 获取到 ${klines.length} 根K线`);
    
    // 找到最高价和最低价
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
    
    // 计算崩盘开始时间（从最高点开始）
    let crashStartTime = highestTime;
    let crashStartIndex = highestIndex;
    
    // 如果最高点在最低点之前，说明是正常的崩盘流程
    if (highestIndex < lowestIndex) {
      crashStartTime = highestTime;
      crashStartIndex = highestIndex;
    } else {
      // 否则，寻找最低点之前的最高点
      for (let i = lowestIndex - 1; i >= 0; i--) {
        if (klines[i].high > klines[lowestIndex].close * 1.1) { // 找到比最低点高10%以上的点
          crashStartTime = klines[i].time;
          crashStartIndex = i;
          highestPrice = klines[i].high;
          break;
        }
      }
    }
    
    // 计算崩盘结束时间（从最低点开始恢复）
    let crashEndTime = lowestTime;
    let crashEndIndex = lowestIndex;
    
    // 寻找恢复点（价格回升5%以上且持续）
    for (let i = lowestIndex + 1; i < klines.length; i++) {
      if (klines[i].close > lowestPrice * 1.05) {
        crashEndTime = klines[i].time;
        crashEndIndex = i;
        break;
      }
    }
    
    // 如果没找到恢复点，使用最低点后6小时
    if (crashEndIndex === lowestIndex) {
      crashEndTime = lowestTime + 6 * 3600 * 1000;
    }
    
    // 计算崩盘幅度
    const crashPercentage = ((lowestPrice - highestPrice) / highestPrice * 100).toFixed(2);
    
    // 计算持续时间
    const durationMs = crashEndTime - crashStartTime;
    const durationHours = Math.round(durationMs / 3600 / 1000);
    
    // 格式化结果
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
        price: klines[crashEndIndex]?.close.toFixed(2) || lowestPrice.toFixed(2),
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
    console.log(`🟠 崩盘开始: ${result.crashStart.time} UTC`);
    console.log(`   价格: $${result.crashStart.price}`);
    console.log(`   ISO: ${result.crashStart.timestamp}`);
    console.log('');
    console.log(`🔴 最低点: ${result.lowestPoint.time} UTC`);
    console.log(`   价格: $${result.lowestPoint.price}`);
    console.log(`   ISO: ${result.lowestPoint.timestamp}`);
    console.log('');
    console.log(`🟢 崩盘结束: ${result.crashEnd.time} UTC`);
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

// 需要查询的事件列表
const eventsToQuery = [
  { symbol: 'BTCUSDT', date: '2020-03-12', name: 'BTC 312黑色星期四' },
  { symbol: 'BTCUSDT', date: '2022-11-09', name: 'BTC FTX崩盘' },
  { symbol: 'LUNAUSDT', date: '2022-05-09', name: 'LUNA崩盘', note: 'LUNA已退市，可能无数据' },
  { symbol: 'FTTUSDT', date: '2022-11-08', name: 'FTT崩盘', note: 'FTT已退市，可能无数据' },
  { symbol: 'BTCUSDT', date: '2017-12-17', name: 'BTC 2017牛市顶点' },
];

// 主函数
async function main() {
  console.log('🚀 开始查询真实崩盘数据...\n');
  console.log('⚠️  注意：');
  console.log('   - 币安交易所成立于2017年，之前的数据无法查询');
  console.log('   - 已退市的币种可能无法查询');
  console.log('   - 所有时间均为UTC时间\n');
  
  const results = [];
  
  for (const event of eventsToQuery) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 ${event.name}`);
    if (event.note) {
      console.log(`⚠️  ${event.note}`);
    }
    console.log('='.repeat(60));
    
    const result = await findCrashMoments(event.symbol, event.date, 48);
    
    if (result) {
      results.push({
        name: event.name,
        ...result
      });
    }
    
    // 避免请求过快
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
  
  console.log('✅ 成功查询的事件：\n');
  
  results.forEach((r, index) => {
    console.log(`${index + 1}. ${r.name}`);
    console.log(`   最低点时间: ${r.lowestPoint.timestamp}`);
    console.log(`   崩盘幅度: ${r.crashPercentage}%`);
    console.log(`   持续时间: ${r.duration}`);
    console.log('');
  });
  
  // 生成更新代码
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              📝 server.js 更新代码                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('// 将以下数据复制到 server.js 中的 realEvents 数组：\n');
  
  results.forEach(r => {
    const id = r.symbol.toLowerCase().replace('usdt', '') + '_' + r.lowestPoint.timestamp.split('T')[0];
    console.log(`{`);
    console.log(`  id: '${id}',`);
    console.log(`  date: '${r.lowestPoint.timestamp.split('T')[0]}',`);
    console.log(`  asset: '${r.symbol.replace('USDT', '/USDT')}',`);
    console.log(`  crashPercentage: '${r.crashPercentage}',`);
    console.log(`  duration: '${r.duration}',`);
    console.log(`  description: '${r.name}：价格从$${r.crashStart.price}跌至$${r.lowestPoint.price}',`);
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

// 运行
main().catch(console.error);

