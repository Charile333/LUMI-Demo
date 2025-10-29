// 币安API工具 - 获取K线数据

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 从币安获取K线数据
 * @param symbol 交易对，如 'BTCUSDT'
 * @param interval K线周期：'1m', '5m', '15m', '30m', '1h', '4h', '1d'
 * @param startTime 开始时间戳（秒）
 * @param endTime 结束时间戳（秒）
 * @returns K线数据数组
 */
export async function getBinanceKlines(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d',
  startTime: number,
  endTime: number
): Promise<KlineData[]> {
  try {
    // 币安API使用毫秒时间戳
    const start = startTime * 1000;
    const end = endTime * 1000;
    
    const url = `https://api.binance.com/api/v3/klines?` +
      `symbol=${symbol}` +
      `&interval=${interval}` +
      `&startTime=${start}` +
      `&endTime=${end}` +
      `&limit=1000`;

    console.log('📊 Fetching Binance data:', {
      symbol,
      interval,
      startTime: startTime,
      endTime: endTime,
      from: new Date(start).toLocaleString('zh-CN'),
      to: new Date(end).toLocaleString('zh-CN'),
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from Binance API');
    }

    // 币安返回的数据格式：
    // [
    //   [
    //     1499040000000,      // 0: 开盘时间
    //     "0.01634000",       // 1: 开盘价
    //     "0.80000000",       // 2: 最高价
    //     "0.01575800",       // 3: 最低价
    //     "0.01577100",       // 4: 收盘价
    //     "148976.11427815",  // 5: 成交量
    //     1499644799999,      // 6: 收盘时间
    //     "2434.19055334",    // 7: 成交额
    //     308,                // 8: 成交笔数
    //     "1756.87402397",    // 9: 主动买入成交量
    //     "28.46694368",      // 10: 主动买入成交额
    //     "17928899.62484339" // 11: 请忽略该参数
    //   ]
    // ]

    const klines: KlineData[] = data.map((kline: any[]) => ({
      time: Math.floor(kline[0] / 1000), // 转换为秒（币安返回毫秒）
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));

    console.log('');
    console.log(`✅ Loaded ${klines.length} klines from Binance`);
    if (klines.length > 0) {
      console.log('   First kline:');
      console.log('      Timestamp:', klines[0].time);
      console.log('      Time (UTC):', new Date(klines[0].time * 1000).toUTCString());
      console.log('      Time (Local):', new Date(klines[0].time * 1000).toLocaleString('zh-CN'));
      console.log('      OHLC:', `O:${klines[0].open} H:${klines[0].high} L:${klines[0].low} C:${klines[0].close}`);
      console.log('');
      console.log('   Last kline:');
      console.log('      Timestamp:', klines[klines.length - 1].time);
      console.log('      Time (UTC):', new Date(klines[klines.length - 1].time * 1000).toUTCString());
      console.log('      Time (Local):', new Date(klines[klines.length - 1].time * 1000).toLocaleString('zh-CN'));
      console.log('      OHLC:', `O:${klines[klines.length - 1].open} H:${klines[klines.length - 1].high} L:${klines[klines.length - 1].low} C:${klines[klines.length - 1].close}`);
    }
    console.log('');

    return klines;
  } catch (error) {
    console.error('❌ Error fetching Binance data:', error);
    throw error;
  }
}

/**
 * 获取实时价格
 */
export async function getBinancePrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    throw error;
  }
}

/**
 * 获取24小时统计数据
 */
export async function getBinance24hStats(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching Binance 24h stats:', error);
    throw error;
  }
}

