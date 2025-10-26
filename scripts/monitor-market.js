/**
 * GitLab CI/CD 市场监控脚本
 * 每10-15分钟运行一次，检测 BTC 和 ETH 价格异常
 */

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// 监控的交易对
const SYMBOLS = ['BTCUSDT', 'ETHUSDT'];

// 价格变化阈值 (1%)
const THRESHOLD = 0.01;

// 存储上一次的价格
const priceCache = {};

/**
 * 获取 Binance 价格
 */
function getBinancePrice(symbol) {
  return new Promise((resolve, reject) => {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            symbol: json.symbol,
            price: parseFloat(json.lastPrice),
            change24h: parseFloat(json.priceChangePercent)
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 写入 Supabase
 */
function insertAlert(alert) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      symbol: alert.symbol,
      message: alert.message,
      severity: alert.severity,
      type: 'price_jump',
      details: alert.details
    });
    
    const options = {
      hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
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
        console.log(`✅ 警报已创建: ${alert.message}`);
        resolve();
      } else {
        console.error(`❌ 创建警报失败: ${res.statusCode}`);
        resolve(); // 不中断流程
      }
    });
    
    req.on('error', (e) => {
      console.error(`❌ 请求错误:`, e.message);
      resolve(); // 不中断流程
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * 检测价格异常
 */
async function checkPrice(symbol) {
  try {
    const ticker = await getBinancePrice(symbol);
    console.log(`📊 ${symbol}: $${ticker.price} (24h: ${ticker.change24h}%)`);
    
    // 检查是否有缓存的价格
    if (priceCache[symbol]) {
      const previousPrice = priceCache[symbol];
      const changePercent = ((ticker.price - previousPrice) / previousPrice) * 100;
      
      // 如果价格变化超过阈值
      if (Math.abs(changePercent) >= THRESHOLD * 100) {
        const direction = changePercent > 0 ? '上涨' : '下跌';
        const severity = Math.abs(changePercent) > 5 ? 'critical' : 
                        Math.abs(changePercent) > 2 ? 'high' : 'medium';
        
        const alert = {
          symbol: symbol,
          message: `${symbol.replace('USDT', '/USDT')} ${direction} ${Math.abs(changePercent).toFixed(2)}%`,
          severity: severity,
          details: {
            price_change: changePercent / 100,
            current_price: ticker.price,
            previous_price: previousPrice,
            change_24h: ticker.change24h / 100,
            alert_type: 'GitLab CI/CD Monitor',
            source: 'gitlab_ci'
          }
        };
        
        await insertAlert(alert);
      }
    }
    
    // 更新缓存
    priceCache[symbol] = ticker.price;
    
  } catch (error) {
    console.error(`❌ ${symbol} 检测失败:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n🔍 开始市场监控...');
  console.log(`⏰ 时间: ${new Date().toISOString()}`);
  console.log(`📊 监控: ${SYMBOLS.join(', ')}`);
  console.log('─'.repeat(60));
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ 缺少 Supabase 凭据！请在 GitLab CI/CD Variables 中设置');
    process.exit(1);
  }
  
  // 检查所有交易对
  for (const symbol of SYMBOLS) {
    await checkPrice(symbol);
    // 稍微延迟避免 API 限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('─'.repeat(60));
  console.log('✅ 监控完成\n');
}

main().catch(error => {
  console.error('❌ 运行失败:', error);
  process.exit(1);
});

