'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import MyOrders from '@/components/trading/MyOrders';
import { useOrderBookWebSocket } from '@/hooks/useWebSocket';
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

  // 🔥 使用 WebSocket 实时更新价格
  const { orderBook: wsOrderBook, connected: wsConnected } = useOrderBookWebSocket(marketId);

  // 1. 加载市场基础信息（从 Supabase）
  useEffect(() => {
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
          console.error('查询市场失败:', error);
          return;
        }

        if (data) {
          setMarket(data);
        }
      } catch (err) {
        console.error('加载市场失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (marketId) {
      fetchMarket();
    }
  }, [marketId]);

  // 2. 加载初始价格（HTTP）- 作为后备
  useEffect(() => {
    if (!marketId) return;

    const fetchPrices = async () => {
      try {
        const response = await fetch(`/api/orders/book?marketId=${marketId}&outcome=1`);
        const data = await response.json();

        if (data.success && data.orderBook) {
          const bestBid = data.orderBook.buy?.[0]?.price
            ? parseFloat(data.orderBook.buy[0].price)
            : 0.49;

          const bestAsk = data.orderBook.sell?.[0]?.price
            ? parseFloat(data.orderBook.sell[0].price)
            : 0.51;

          const midPrice = (bestBid + bestAsk) / 2;

          setPrices({
            yes: midPrice,
            no: 1 - midPrice,
            probability: midPrice * 100,
            bestBid,
            bestAsk
          });
        }
      } catch (err) {
        console.error('获取价格失败:', err);
      }
    };

    // 只在初始加载时获取一次
    fetchPrices();
  }, [marketId]);

  // 3. 🔥 WebSocket 实时价格更新
  useEffect(() => {
    if (wsOrderBook) {
      const { bestBid, bestAsk } = wsOrderBook;
      const midPrice = (bestBid + bestAsk) / 2;

      setPrices({
        yes: midPrice,
        no: 1 - midPrice,
        probability: midPrice * 100,
        bestBid,
        bestAsk
      });

      console.log('🔥 实时价格更新:', { bestBid, bestAsk, midPrice });
    }
  }, [wsOrderBook]);

  // 生成模拟图表数据
  const generateChartData = () => {
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    }

    const generateTrend = (start: number, volatility: number, points: number) => {
      const data = [start];
      for (let i = 1; i < points; i++) {
        const change = (Math.random() - 0.5) * 2 * volatility;
        let next = data[i - 1] + change;
        next = Math.max(0, Math.min(100, next));
        data.push(next);
      }
      return data;
    };

    return {
      labels: dates,
      datasets: [
        {
          label: 'YES',
          data: generateTrend(prices.probability || 50, 2.0, 31),
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
          data: generateTrend(100 - (prices.probability || 50), 2.0, 31),
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
      },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
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
          color: 'rgba(156, 163, 175, 0.1)',
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">市场不存在</h2>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar activeCategory={market.main_category} />

      <main className="container mx-auto px-4 py-6">
        {/* 面包屑导航 */}
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <button
            onClick={() => router.back()}
            className="hover:text-purple-600 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回
          </button>
          <span className="mx-2">/</span>
          <span className="text-purple-600">{market.main_category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-500 truncate max-w-md">{market.title}</span>
        </div>

        {/* 市场标题区域 */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
            <div className="flex-1">
              {/* 分类标签 */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                  {market.sub_category || market.main_category}
                </span>
              </div>

              {/* 标题 */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {market.title}
              </h1>

              {/* 统计信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2 text-purple-600" />
                  {market.end_time
                    ? new Date(market.end_time).toLocaleDateString('zh-CN')
                    : '待定'}
                </span>
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faChartLine} className="mr-2 text-purple-600" />
                  ${market.volume || 0} 交易量
                </span>
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-purple-600" />
                  {market.participants || 0} 参与者
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  market.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {market.status === 'active' ? '进行中' : '已结束'}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <FontAwesomeIcon icon={faShareAlt} className="text-gray-600" />
                <span className="text-sm text-gray-700">分享</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <FontAwesomeIcon icon={faBookmark} className="text-gray-600" />
                <span className="text-sm text-gray-700">收藏</span>
              </button>
            </div>
          </div>

          {/* YES/NO 概率显示 */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center px-6 py-3 bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <div>
                <span className="text-sm font-medium text-gray-700 mr-2">YES</span>
                <span className="text-2xl font-bold text-green-600">
                  {prices.probability.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center px-6 py-3 bg-red-50 border-2 border-red-500 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              <div>
                <span className="text-sm font-medium text-gray-700 mr-2">NO</span>
                <span className="text-2xl font-bold text-red-600">
                  {(100 - prices.probability).toFixed(1)}%
                </span>
              </div>
            </div>
            {/* WebSocket 连接状态 */}
            <div className={`flex items-center px-3 py-2 rounded-lg text-xs ${
              wsConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                wsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              {wsConnected ? '实时更新' : '连接中...'}
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：图表和信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 价格图表 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">概率趋势</h2>
                <div className="flex gap-2">
                  {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        selectedTimeRange === range
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <Line data={generateChartData()} options={chartOptions} />
              </div>
            </div>

            {/* 市场描述 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">市场描述</h2>
              <p className="text-gray-700 leading-relaxed">
                {market.description || '暂无描述'}
              </p>
            </div>

            {/* 订单簿 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">订单簿</h2>
              <OrderBook marketId={parseInt(marketId)} outcome={1} />
            </div>

            {/* 我的订单 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">我的订单</h2>
              <MyOrders />
            </div>
          </div>

          {/* 右侧：交易面板 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">交易</h2>
              <OrderForm
                marketId={parseInt(marketId)}
                questionId={market.question_id}
                currentPriceYes={prices.yes}
                currentPriceNo={prices.no}
                bestBid={prices.bestBid}
                bestAsk={prices.bestAsk}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



