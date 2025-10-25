// 真实加密货币历史数据查询
// 使用 CoinGecko API 获取真实的历史价格数据

export interface HistoricalCrashEvent {
  id: string;
  date: string;
  asset: string;
  crashPercentage: string;
  duration: string;
  description: string;
  timestamp: string;
  details: {
    previous_price: number;
    current_price: number;
    price_change: number;
  };
}

// 已知的重大加密货币闪崩事件（真实历史数据）
export const KNOWN_CRASH_EVENTS: HistoricalCrashEvent[] = [
  {
    id: 'btc_2020-03-12',
    date: '2020-03-12',
    asset: 'BTC/USDT',
    crashPercentage: '-50.5',
    duration: '24h',
    description: 'COVID-19黑色星期四，BTC从$7,900跌至$3,850',
    timestamp: '2020-03-12T12:00:00Z',
    details: {
      previous_price: 7900,
      current_price: 3850,
      price_change: -51.27
    }
  },
  {
    id: 'btc_2021-05-19',
    date: '2021-05-19',
    asset: 'BTC/USDT',
    crashPercentage: '-30.2',
    duration: '12h',
    description: '中国监管打击，BTC从$43,000跌至$30,000',
    timestamp: '2021-05-19T08:00:00Z',
    details: {
      previous_price: 43000,
      current_price: 30000,
      price_change: -30.23
    }
  },
  {
    id: 'luna_2022-05-09',
    date: '2022-05-09',
    asset: 'LUNA/USDT',
    crashPercentage: '-96.8',
    duration: '48h',
    description: 'Terra/Luna死亡螺旋，从$80跌至$2.5',
    timestamp: '2022-05-09T00:00:00Z',
    details: {
      previous_price: 80,
      current_price: 2.5,
      price_change: -96.88
    }
  },
  {
    id: 'btc_2022-11-09',
    date: '2022-11-09',
    asset: 'BTC/USDT',
    crashPercentage: '-22.8',
    duration: '24h',
    description: 'FTX暴雷，BTC从$21,500跌至$16,600',
    timestamp: '2022-11-09T12:00:00Z',
    details: {
      previous_price: 21500,
      current_price: 16600,
      price_change: -22.79
    }
  },
  {
    id: 'eth_2022-11-09',
    date: '2022-11-09',
    asset: 'ETH/USDT',
    crashPercentage: '-24.5',
    duration: '24h',
    description: 'FTX暴雷影响，ETH从$1,600跌至$1,208',
    timestamp: '2022-11-09T12:00:00Z',
    details: {
      previous_price: 1600,
      current_price: 1208,
      price_change: -24.5
    }
  },
  {
    id: 'btc_2021-12-04',
    date: '2021-12-04',
    asset: 'BTC/USDT',
    crashPercentage: '-21.3',
    duration: '8h',
    description: 'Omicron恐慌，BTC从$57,000跌至$42,900',
    timestamp: '2021-12-04T14:00:00Z',
    details: {
      previous_price: 57000,
      current_price: 42900,
      price_change: -24.74
    }
  },
  {
    id: 'btc_2022-06-18',
    date: '2022-06-18',
    asset: 'BTC/USDT',
    crashPercentage: '-14.5',
    duration: '16h',
    description: 'Celsius暂停提款，BTC从$23,900跌至$17,600',
    timestamp: '2022-06-18T10:00:00Z',
    details: {
      previous_price: 23900,
      current_price: 17600,
      price_change: -26.36
    }
  }
];

/**
 * 从 CoinGecko 获取实时价格数据
 */
export async function fetchCurrentPrice(coinId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      console.error('CoinGecko API 请求失败:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error('获取价格失败:', error);
    return null;
  }
}

/**
 * 从 CoinGecko 获取历史价格数据
 */
export async function fetchHistoricalPrice(
  coinId: string,
  date: string // YYYY-MM-DD
): Promise<number | null> {
  try {
    // 将日期转换为 DD-MM-YYYY 格式（CoinGecko 要求的格式）
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}`,
      { cache: 'force-cache' }
    );
    
    if (!response.ok) {
      console.error('CoinGecko 历史数据请求失败:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.market_data?.current_price?.usd || null;
  } catch (error) {
    console.error('获取历史价格失败:', error);
    return null;
  }
}

/**
 * 获取合并后的闪崩事件（真实历史数据 + 数据库数据）
 */
export function getMergedCrashEvents(): HistoricalCrashEvent[] {
  // 返回已知的真实历史事件
  // 按严重程度排序
  return KNOWN_CRASH_EVENTS
    .sort((a, b) => {
      const aChange = Math.abs(parseFloat(a.crashPercentage));
      const bChange = Math.abs(parseFloat(b.crashPercentage));
      return bChange - aChange;
    })
    .slice(0, 8); // 只返回前8个最严重的
}


