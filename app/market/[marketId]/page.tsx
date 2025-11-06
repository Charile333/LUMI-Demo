'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import MyOrders from '@/components/trading/MyOrders';
import { useOrderBookRealtime } from '@/hooks/useOrderBookRealtime';
import { useTranslation } from '@/hooks/useTranslation';
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faChartLine,
  faUsers,
  faShareAlt,
  faBookmark,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Market {
  id: number;
  title: string;
  description: string;
  main_category: string;
  sub_category: string;
  image_url: string;
  end_time: string;
  volume: number;
  participants: number;
  status: string;
  question_id: string;
}

interface PriceData {
  yes: number;
  no: number;
  probability: number;
  bestBid: number;  // 最佳买价（用户可以卖出的价格）
  bestAsk: number;  // 最佳卖价（用户需要买入的价格）
}

export default function MarketDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const marketId = params.marketId as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [prices, setPrices] = useState<PriceData>({ 
    yes: 0.5, 
    no: 0.5, 
    probability: 50,
    bestBid: 0.49,
    bestAsk: 0.51
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [chartData, setChartData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 使用 Supabase Realtime 实时更新价格（Vercel 兼容）
  const { orderBook: wsOrderBook, connected: wsConnected } = useOrderBookRealtime(marketId);
  
  // 🎯 LUMI Polymarket 集成
  const polymarket = useLUMIPolymarket();

  // 加载市场数据函数
  const fetchMarket = async () => {
    try {
      setLoading(true);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('id', marketId)
        .single();

      if (error) {
        console.error(t('common.loadFailed'), error);
        return;
      }

      if (data) {
        setMarket(data);
      }
    } catch (err) {
      console.error(t('common.loadFailed'), err);
    } finally {
      setLoading(false);
    }
  };

  // 1. 加载市场基础信息（从 Supabase）
  useEffect(() => {
    if (marketId) {
      fetchMarket();
      
      // 每15秒刷新一次市场数据
      const interval = setInterval(fetchMarket, 15000);
      return () => clearInterval(interval);
    }
  }, [marketId]);

  // 2. 加载初始价格（HTTP）- 作为后备
  const fetchPrices = async () => {
    if (!marketId) return;

    try {
      // 添加时间戳避免缓存
      const response = await fetch(`/api/orders/book?marketId=${marketId}&outcome=1&t=${Date.now()}`);
      const data = await response.json();

      if (data.success && data.orderBook) {
        let bestBid = data.orderBook.bids?.[0]?.price
          ? parseFloat(data.orderBook.bids[0].price)
          : 0;

        let bestAsk = data.orderBook.asks?.[0]?.price
          ? parseFloat(data.orderBook.asks[0].price)
          : 0;

        // 处理单边订单情况
        if (bestBid === 0 && bestAsk > 0) {
          bestBid = Math.max(0.01, bestAsk - 0.05);
        } else if (bestAsk === 0 && bestBid > 0) {
          bestAsk = Math.min(0.99, bestBid + 0.05);
        } else if (bestBid === 0 && bestAsk === 0) {
          bestBid = 0.49;
          bestAsk = 0.51;
        }

        const midPrice = (bestBid + bestAsk) / 2;

        setPrices({
          yes: midPrice,
          no: 1 - midPrice,
          probability: midPrice * 100,
          bestBid,
          bestAsk
        });
        
        console.log('📊 Price updated (HTTP):', { 
          marketId, 
          bestBid, 
          bestAsk, 
          midPrice: midPrice.toFixed(4),
          probability: (midPrice * 100).toFixed(1) + '%'
        });
      }
    } catch (err) {
      console.error(t('common.loadFailed'), err);
    }
  };

  useEffect(() => {
    // 初始加载价格
    fetchPrices();
    
    // 每10秒刷新一次价格（更频繁，确保交易后快速更新）
    const interval = setInterval(fetchPrices, 10000);
    
    return () => clearInterval(interval);
  }, [marketId]);

  // 3. 🔥 WebSocket 实时价格更新
  useEffect(() => {
    if (wsOrderBook) {
      // 从订单簿数组中提取最佳买价和卖价
      let bestBid = wsOrderBook.bids?.[0]?.price ?? 0;
      let bestAsk = wsOrderBook.asks?.[0]?.price ?? 0;
      
      // 处理单边订单情况
      if (bestBid === 0 && bestAsk > 0) {
        // 只有卖单，估算买价
        bestBid = Math.max(0.01, bestAsk - 0.05);
      } else if (bestAsk === 0 && bestBid > 0) {
        // 只有买单，估算卖价
        bestAsk = Math.min(0.99, bestBid + 0.05);
      } else if (bestBid === 0 && bestAsk === 0) {
        // 订单簿为空，使用默认值
        bestBid = 0.49;
        bestAsk = 0.51;
      }
      
      const midPrice = (bestBid + bestAsk) / 2;

      setPrices({
        yes: midPrice,
        no: 1 - midPrice,
        probability: midPrice * 100,
        bestBid,
        bestAsk
      });

      console.log('🔥 Real-time price update:', { bestBid, bestAsk, midPrice, probability: (midPrice * 100).toFixed(1) + '%' });
    }
  }, [wsOrderBook]);

  // 生成模拟图表数据（基于当前概率）
  const generateChartData = (currentProbability: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    }

    const generateTrend = (start: number, end: number, volatility: number, points: number) => {
      const data = [start];
      for (let i = 1; i < points - 1; i++) {
        const progress = i / (points - 1);
        const target = start + (end - start) * progress;
        const change = (Math.random() - 0.5) * 2 * volatility;
        let next = target + change;
        next = Math.max(0, Math.min(100, next));
        data.push(next);
      }
      data.push(end); // 最后一个点是当前概率
      return data;
    };

    const startProbability = Math.max(10, Math.min(90, currentProbability + (Math.random() - 0.5) * 20));

    return {
      labels: dates,
      datasets: [
        {
          label: 'YES',
          data: generateTrend(startProbability, currentProbability, 2.0, 31),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#10B981'
        },
        {
          label: 'NO',
          data: generateTrend(100 - startProbability, 100 - currentProbability, 2.0, 31),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#EF4444'
        }
      ]
    };
  };

  // 初始化图表数据
  useEffect(() => {
    const initialChartData = generateChartData(50);
    setChartData(initialChartData);
  }, []);

  // 当价格变化时更新图表
  useEffect(() => {
    if (prices.probability) {
      const newChartData = generateChartData(prices.probability);
      setChartData(newChartData);
      console.log('📊 Chart updated, current probability:', prices.probability.toFixed(1) + '%');
    }
  }, [prices.probability]);

  // 手动刷新数据（不刷新页面）
  const handleRefresh = async () => {
    if (refreshing) return; // 防止重复点击
    
    setRefreshing(true);
    console.log('🔄 Manually refreshing data...');
    
    try {
      await Promise.all([
        fetchMarket(),
        fetchPrices()
      ]);
      console.log('✅ Data refresh complete');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500); // 至少显示500ms的加载状态
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#D1D5DB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#18181B',
        borderColor: 'rgba(251, 191, 36, 0.3)',
        borderWidth: 1,
        padding: 12,
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          maxRotation: 0,
          maxTicksLimit: 6
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          callback: function (value: any) {
            return value + '%';
          }
        },
        min: 0,
        max: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('marketDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{t('marketDetail.notFound')}</h2>
          <button
            onClick={() => router.back()}
            className="text-amber-400 hover:text-amber-300"
          >
            {t('marketDetail.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar activeCategory={market.main_category} showProductBanner={false} />
      
      {/* 占位符 - 为固定的导航栏留出空间 */}
      <div className="h-[200px]"></div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-6 max-w-[1600px]">
        {/* 面包屑导航 */}
        <div className="mb-4 flex items-center text-sm text-gray-400">
          <button
            onClick={() => router.back()}
            className="hover:text-amber-400 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('marketDetail.back')}
          </button>
          <span className="mx-2">/</span>
          <span className="text-amber-400">{String(t(`categories.${market.main_category}`))}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-500 truncate max-w-md">{market.title}</span>
        </div>

        {/* 市场标题区域 */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
            <div className="flex-1">
              {/* 分类标签 */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full text-sm font-medium">
                  {market.sub_category || market.main_category}
                </span>
              </div>

              {/* 标题 */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {market.title}
              </h1>

              {/* 统计信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2 text-amber-400" />
                  {market.end_time
                    ? new Date(market.end_time).toLocaleDateString('zh-CN')
                    : '待定'}
                </span>
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faChartLine} className="mr-2 text-amber-400" />
                  ${market.volume || 0} {t('marketDetail.volume')}
                </span>
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-amber-400" />
                  {market.participants || 0}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  market.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}>
                  {market.status === 'active' ? t('market.active') : t('market.ended', market.status)}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-amber-400/50 transition-colors bg-white/5 hover:bg-white/10 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={t('marketDetail.refreshData')}
              >
                <svg className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm text-gray-300">{refreshing ? t('marketDetail.refreshing') : t('marketDetail.refresh')}</span>
              </button>
              {/* Realtime连接状态 */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-400">{wsConnected ? t('marketDetail.realtime') : t('marketDetail.offline')}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-amber-400/50 transition-colors bg-white/5">
                <FontAwesomeIcon icon={faShareAlt} className="text-gray-400" />
                <span className="text-sm text-gray-300">{t('market.share')}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:border-amber-400/50 transition-colors bg-white/5">
                <FontAwesomeIcon icon={faBookmark} className="text-gray-400" />
                <span className="text-sm text-gray-300">{t('market.bookmark')}</span>
              </button>
            </div>
          </div>

          {/* YES/NO 概率显示 */}
          <div className="space-y-3">
            {/* 主要价格显示 */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center px-6 py-3 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <span className="text-sm font-medium text-gray-300 mr-2">YES</span>
                  <span className="text-2xl font-bold text-green-400">
                    {prices.probability.toFixed(1)}%
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    ${prices.yes.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center px-6 py-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <span className="text-sm font-medium text-gray-300 mr-2">NO</span>
                  <span className="text-2xl font-bold text-red-400">
                    {(100 - prices.probability).toFixed(1)}%
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    ${prices.no.toFixed(2)}
                  </div>
                </div>
              </div>
              {/* WebSocket 连接状态 */}
              <div className={`flex items-center px-3 py-2 rounded-lg text-xs ${
                wsConnected ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  wsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                {wsConnected ? t('orderbook.realtimeConnection') : t('common.loading')}
              </div>
            </div>
            
            {/* 价格详情 - 买价/卖价/价差 */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 mr-2">{t('marketDetail.bidPrice')}:</span>
                <span className="text-green-400 font-semibold">${prices?.bestBid?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 mr-2">{t('marketDetail.askPrice')}:</span>
                <span className="text-red-400 font-semibold">${prices?.bestAsk?.toFixed(2) || '0.00'}</span>
              </div>
              {prices?.bestBid && prices?.bestAsk && (
                <div className={`px-3 py-1.5 rounded-lg border ${
                  (prices.bestAsk - prices.bestBid) < 0.02
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : (prices.bestAsk - prices.bestBid) < 0.10
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <span className="text-gray-400 mr-2">{t('marketDetail.spread')}:</span>
                  <span className="font-semibold">
                    ${(prices.bestAsk - prices.bestBid).toFixed(3)} ({((prices.bestAsk - prices.bestBid) * 100).toFixed(1)}%)
                  </span>
                  {(prices.bestAsk - prices.bestBid) < 0.02 && <span className="ml-1">🟢</span>}
                  {(prices.bestAsk - prices.bestBid) >= 0.02 && (prices.bestAsk - prices.bestBid) < 0.10 && <span className="ml-1">🟡</span>}
                  {(prices.bestAsk - prices.bestBid) >= 0.10 && <span className="ml-1">🔴</span>}
                </div>
              )}
            </div>
            
            {/* 价差警告 */}
            {prices?.bestBid && prices?.bestAsk && (prices.bestAsk - prices.bestBid) >= 0.10 && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                <span className="text-amber-400 text-sm">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm text-amber-400 font-medium">{t('marketDetail.largeSpread')}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {t('marketDetail.largeSpreadWarning', {
                      spread: ((prices.bestAsk - prices.bestBid) * 100).toFixed(1),
                      askPrice: prices.bestAsk.toFixed(2),
                      bidPrice: prices.bestBid.toFixed(2)
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：图表和信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 价格图表 */}
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{t('marketDetail.priceChart')}</h2>
                <div className="flex gap-2">
                  {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        selectedTimeRange === range
                          ? 'bg-amber-400 text-black font-medium'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:border-amber-400/50'
                      }`}
                    >
                      {String(t(`marketDetail.timeRange.${range}`))}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {t('marketDetail.loadingChart')}
                  </div>
                )}
              </div>
            </div>

            {/* 市场描述 */}
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">{t('marketDetail.about')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {market.description || t('marketDetail.noActivity')}
              </p>
            </div>

            {/* 订单簿 */}
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('marketDetail.orderBook')}</h2>
              <OrderBook marketId={parseInt(marketId)} outcome={1} />
            </div>

            {/* 我的订单 */}
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('marketDetail.myOrders')}</h2>
              <MyOrders />
            </div>
          </div>

          {/* 右侧：交易面板 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-zinc-900 rounded-xl shadow-lg border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('marketDetail.placeOrder')}</h2>
              <OrderForm
                marketId={parseInt(marketId)}
                questionId={market.question_id}
                currentPriceYes={prices.yes}
                currentPriceNo={prices.no}
                bestBid={prices.bestBid}
                bestAsk={prices.bestAsk}
                polymarket={polymarket}
                onSuccess={async () => {
                  // 订单成功后立即刷新市场数据和价格
                  await fetchMarket();
                  await fetchPrices();
                  console.log('✅ Order success, refreshed market data and prices');
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



