'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase-client';

// #vercel环境禁用 - 使用单例 Supabase 客户端，避免多实例警告
const supabase = getSupabase();
import Navbar from '@/components/Navbar';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import MyOrders from '@/components/trading/MyOrders';
import { useTranslation } from '@/hooks/useTranslation';
import { useLUMIPolymarket } from '@/hooks/useLUMIPolymarket';
import { useMarketPrice } from '@/hooks/useMarketPrice';
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

export default function MarketDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const marketId = params.marketId as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 仅用于首次加载
  const [updating, setUpdating] = useState(false); // 用于后台更新，不触发全屏加载
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🐛 调试：输出market ID
  useEffect(() => {
    console.log('🔍 详细页加载 Market ID:', marketId);
    console.log('🔍 URL路径:', window.location.pathname);
    
    // 检查市场是否存在
    if (market && market.id.toString() !== marketId) {
      console.warn('⚠️ 警告：URL中的market ID与加载的市场数据不匹配！');
      console.warn('URL market ID:', marketId);
      console.warn('加载的market数据:', market);
    }
  }, [marketId, market]);

  // 🔥 使用统一的 useMarketPrice hook 获取实时价格（和卡片页面一致）
  const price = useMarketPrice(marketId, true);
  
  // 🐛 调试：输出价格数据
  useEffect(() => {
    if (!price.loading) {
      console.log('🔍 详细页价格数据:', {
        marketId,
        probability: price.probability,
        yes: price.yes,
        no: price.no,
        bestBid: price.bestBid,
        bestAsk: price.bestAsk
      });
    }
  }, [price, marketId]);
  
  // 🎯 LUMI Polymarket 集成
  const polymarket = useLUMIPolymarket();

  // 确保只在客户端挂载后才渲染翻译文本，避免 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 加载市场数据函数
  // 🚀 性能优化：添加超时控制，避免长时间等待
  const fetchMarket = async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setUpdating(true);
      }

      // 🔧 添加3秒超时，如果超时则使用默认值
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        // #vercel环境禁用 - 使用顶层的单例 supabase 客户端
        const { data, error } = await supabase
          .from('markets')
          .select('*')
          .eq('id', marketId)
          .abortSignal(controller.signal)
          .single();

        clearTimeout(timeoutId);

        if (error) {
          console.error(t('common.loadFailed'), error);
          return;
        }

        if (data) {
          setMarket(data);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn('⚠️ 市场数据加载超时，使用默认值');
          // 超时时设置默认值，让页面可以显示
          setMarket({
            id: parseInt(marketId),
            title: '加载中...',
            description: '',
            main_category: '',
            sub_category: '',
            image_url: '',
            end_time: '',
            volume: 0,
            participants: 0,
            status: 'active',
            question_id: `market-${marketId}`
          });
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      console.error(t('common.loadFailed'), err);
      // 错误时也设置默认值
      setMarket({
        id: parseInt(marketId),
        title: '加载失败',
        description: '',
        main_category: '',
        sub_category: '',
        image_url: '',
        end_time: '',
        volume: 0,
        participants: 0,
        status: 'active',
        question_id: `market-${marketId}`
      });
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setUpdating(false);
      }
    }
  };

  // 1. 加载市场基础信息（从 Supabase）+ 实时订阅更新
  useEffect(() => {
    if (!marketId) return;

    // 首次加载（显示全屏加载状态）
    fetchMarket(true);

    // 🔥 订阅 markets 表的实时更新（交易量、参与人数等）
    const channel = supabase
      .channel(`market:${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${marketId}`
        },
        (payload) => {
          console.log('🔥 市场数据实时更新:', payload.new);
          // 实时更新市场数据（包括交易量、参与人数等）
          if (payload.new) {
            setMarket(prev => prev ? {
              ...prev,
              ...payload.new,
              // 确保保留所有字段
              volume: (payload.new as any).volume ?? prev.volume,
              participants: (payload.new as any).participants ?? prev.participants,
            } : null);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ 已订阅市场实时更新（交易量、参与人数）');
        }
      });

    // 每15秒后台刷新一次市场数据（作为后备，确保数据同步）
    // 注意：这里传 false，表示后台更新，不会触发全屏加载状态
    const interval = setInterval(() => fetchMarket(false), 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  // 价格数据现在由 useMarketPrice hook 统一管理，无需手动获取
  // 已移除旧的 fetchPrices 和 wsOrderBook 逻辑，统一使用 useMarketPrice

  // 🔥 从 API 获取真实历史价格数据（使用 useCallback 避免闭包问题）
  const fetchPriceHistory = useCallback(async (range: string) => {
    if (!marketId) return [];
    
    try {
      console.log('📡 请求价格历史 API:', `/api/markets/${marketId}/price-history?range=${range}`);
      const response = await fetch(`/api/markets/${marketId}/price-history?range=${range}`);
      
      // 🔥 检查响应状态
      if (!response.ok) {
        console.error('❌ API 响应错误:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('错误详情:', errorData);
        return [];
      }
      
      const result = await response.json();
      
      console.log('📡 API 响应:', {
        success: result.success,
        dataLength: result.data?.length || 0,
        timeRange: result.timeRange,
        requestedRange: range,
        warning: result.warning,
        message: result.message
      });
      
      if (result.success) {
        // 如果返回了警告信息（例如表不存在），也返回空数组
        if (result.warning) {
          console.warn('⚠️ 价格历史API警告:', result.message);
        }
        if (result.data && result.data.length > 0) {
          return result.data;
        }
      }
      return [];
    } catch (error: any) {
      console.error('❌ 获取价格历史失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      });
      return [];
    }
  }, [marketId]);

  // 🔥 使用真实历史数据生成图表
  const generateChartDataFromHistory = (
    historyData: Array<{ price: number; recordedAt: string }>,
    currentProbability: number
  ) => {
    if (historyData.length === 0) {
      // 如果没有历史数据，返回空图表结构
      return {
        labels: [],
        datasets: []
      };
    }

    // 🔥 格式化日期标签，根据数据密度智能显示
    const labels: string[] = [];
    const yesData: number[] = [];
    const noData: number[] = [];

    // 🔥 使用 Map 来跟踪每个日期对应的数据，确保同一天的不同时间点显示不同标签
    const dateTimeMap = new Map<string, number>();
    
    // 🔍 统计唯一日期数量（用于决定标签格式）
    const uniqueDates = new Set(
      historyData.map(d => new Date(d.recordedAt).toLocaleDateString('zh-CN'))
    );
    const uniqueDatesCount = uniqueDates.size;
    
    historyData.forEach((item, index) => {
      const date = new Date(item.recordedAt);
      
      let label: string;
      
      // 🔥 根据唯一日期数和数据点总数智能显示标签
      // 如果只有少数几个数据点，显示详细时间；如果数据点很多，简化标签
      if (historyData.length <= 10 || uniqueDatesCount <= 2) {
        // 数据点很少（<=10个）或只有1-2天：显示完整日期和时间（包含分钟）
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        label = `${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${hours}:${minutes}`;
      } else if (uniqueDatesCount <= 3) {
        // 只有3天：显示日期和时间（包含小时和分钟）
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        label = `${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${hours}:${minutes}`;
      } else if (uniqueDatesCount <= 7 || historyData.length <= 24) {
        // 4-7天或少于24个点：显示日期和小时
        const hours = date.getHours().toString().padStart(2, '0');
        label = `${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${hours}时`;
      } else if (uniqueDatesCount <= 31) {
        // 8-31天：显示日期，但如果有同一天的不同时间点，添加序号区分
        const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        const count = dateTimeMap.get(dateStr) || 0;
        dateTimeMap.set(dateStr, count + 1);
        label = count > 0 ? `${dateStr} (${count + 1})` : dateStr;
      } else {
        // 超过31天：只显示日期
        label = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      }

      labels.push(label);
      yesData.push(item.price * 100);
      noData.push((1 - item.price) * 100);
    });
    
    // 重置 Map 以供后续使用
    dateTimeMap.clear();

    // 如果历史数据最后一点不是当前价格，添加当前价格作为最后一点
    const lastHistoryPrice = historyData.length > 0 
      ? historyData[historyData.length - 1].price * 100 
      : null;
    
    const lastRecordedTime = historyData.length > 0 
      ? new Date(historyData[historyData.length - 1].recordedAt).getTime()
      : 0;
    const now = Date.now();
    const timeDiff = now - lastRecordedTime;
    
    // 如果最后一个记录超过10分钟，或者价格差异较大，添加当前价格
    if (lastHistoryPrice === null || timeDiff > 10 * 60 * 1000 || Math.abs(lastHistoryPrice - currentProbability) > 0.5) {
      const nowDate = new Date();
      let nowLabel: string;
      if (historyData.length <= 7) {
        nowLabel = nowDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } else if (historyData.length <= 31) {
        nowLabel = nowDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit' });
      } else {
        nowLabel = nowDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      }
      
      labels.push(nowLabel);
      yesData.push(currentProbability);
      noData.push(100 - currentProbability);
    }

    return {
      labels,
      datasets: [
        {
          label: 'YES',
          data: yesData,
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
          data: noData,
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

  // 🔥 加载图表数据（基于真实历史数据）
  useEffect(() => {
    const loadChartData = async () => {
      if (!marketId || price.loading) return;

      setChartLoading(true);
      try {
        console.log('📊 开始加载图表数据，时间范围:', selectedTimeRange);
        
        // 获取历史数据（显式传递时间范围，避免闭包问题）
        const historyData = await fetchPriceHistory(selectedTimeRange);
        
        console.log('📊 获取到的历史数据点数:', historyData.length, '时间范围:', selectedTimeRange);
        
        // 🔍 调试：显示数据日期范围
        if (historyData.length > 0) {
          const uniqueDates = new Set(
            historyData.map(item => new Date(item.recordedAt).toLocaleDateString('zh-CN'))
          );
          const firstDate = new Date(historyData[0].recordedAt).toLocaleDateString('zh-CN');
          const lastDate = new Date(historyData[historyData.length - 1].recordedAt).toLocaleDateString('zh-CN');
          
          console.log('📊 前端接收到的数据详情:', {
            数据点数: historyData.length,
            唯一日期数: uniqueDates.size,
            日期范围: `${firstDate} 至 ${lastDate}`,
            唯一日期列表: Array.from(uniqueDates).sort().join(', ')
          });
        }
        
        if (historyData.length > 0) {
          // 使用真实历史数据生成图表
          const chartData = generateChartDataFromHistory(
            historyData,
            price.probability || 50
          );
          setChartData(chartData);
          console.log('📊 图表已更新（使用真实历史数据）:', {
            dataPoints: historyData.length,
            currentProbability: price.probability.toFixed(1) + '%',
            timeRange: selectedTimeRange,
            labels: chartData.labels?.length || 0
          });
        } else {
          // 如果没有历史数据，创建一个只有当前价格的简单图表
          const now = new Date();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          setChartData({
            labels: [
              yesterday.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
              now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            ],
            datasets: [
              {
                label: 'YES',
                data: [price.probability || 50, price.probability || 50],
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
                data: [100 - (price.probability || 50), 100 - (price.probability || 50)],
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
          });
          console.log('📊 图表已更新（暂无历史数据，使用当前价格）:', price.probability?.toFixed(1) + '%');
        }
      } catch (error) {
        console.error('加载图表数据失败:', error);
      } finally {
        setChartLoading(false);
      }
    };

    loadChartData();
  }, [marketId, price.probability, price.loading, selectedTimeRange, fetchPriceHistory]);

  // 手动刷新数据（不刷新页面）
  const handleRefresh = async () => {
    if (refreshing) return; // 防止重复点击
    
    setRefreshing(true);
    console.log('🔄 Manually refreshing data...');
    
    try {
      await Promise.all([
        fetchMarket(false), // 后台更新，不显示全屏加载
        price.refresh ? price.refresh() : Promise.resolve()
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

  // 🚀 性能优化：最多等待3秒，超时也显示页面
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-400" suppressHydrationWarning>
            {mounted ? t('marketDetail.loading') : 'Loading market data...'}
          </p>
          <p className="text-gray-500 text-sm mt-2">最多等待 3 秒...</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2" suppressHydrationWarning>
            {mounted ? t('marketDetail.notFound') : 'Market not found'}
          </h2>
          <button
            onClick={() => router.back()}
            className="text-amber-400 hover:text-amber-300"
            suppressHydrationWarning
          >
            {mounted ? t('marketDetail.back') : 'Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      {/* 背景Logo - 居中，低透明度 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src="/image/LUMI-logo.png" 
          alt="LUMI Logo" 
          className="w-[600px] h-[600px] opacity-25 object-contain"
        />
      </div>
      
      <Navbar activeCategory={market?.main_category || ''} showProductBanner={false} />
      
      {/* 占位符 - 为固定的导航栏留出空间 */}
      <div className="h-[200px]"></div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-6 max-w-[1600px] relative z-10">
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
              {/* 后台更新指示器 */}
              {updating && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs text-blue-400">{t('marketDetail.syncing')}</span>
                </div>
              )}
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
                  {price.loading ? (
                    <span className="text-2xl font-bold text-green-400 animate-pulse">---%</span>
                  ) : (
                    <span className="text-2xl font-bold text-green-400">
                      {price.probability.toFixed(0)}%
                    </span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    ${price.loading ? '--' : price.yes.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center px-6 py-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <div>
                  <span className="text-sm font-medium text-gray-300 mr-2">NO</span>
                  {price.loading ? (
                    <span className="text-2xl font-bold text-red-400 animate-pulse">---%</span>
                  ) : (
                    <span className="text-2xl font-bold text-red-400">
                      {(100 - price.probability).toFixed(0)}%
                    </span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    ${price.loading ? '--' : price.no.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 价格详情 - 买价/卖价/价差 */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 mr-2">{t('marketDetail.bidPrice')}:</span>
                <span className="text-green-400 font-semibold">${price.loading ? '--' : price.bestBid.toFixed(2)}</span>
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className="text-gray-400 mr-2">{t('marketDetail.askPrice')}:</span>
                <span className="text-red-400 font-semibold">${price.loading ? '--' : price.bestAsk.toFixed(2)}</span>
              </div>
              {!price.loading && price.bestBid > 0 && price.bestAsk > 0 && (
                <div className={`px-3 py-1.5 rounded-lg border ${
                  price.spread < 0.02
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : price.spread < 0.10
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <span className="text-gray-400 mr-2">{t('marketDetail.spread')}:</span>
                  <span className="font-semibold">
                    ${price.spread.toFixed(3)} ({(price.spread * 100).toFixed(1)}%)
                  </span>
                  {price.spread < 0.02 && <span className="ml-1">🟢</span>}
                  {price.spread >= 0.02 && price.spread < 0.10 && <span className="ml-1">🟡</span>}
                  {price.spread >= 0.10 && <span className="ml-1">🔴</span>}
                </div>
              )}
            </div>
            
            {/* 价差警告 */}
            {!price.loading && price.spread >= 0.10 && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                <span className="text-amber-400 text-sm">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm text-amber-400 font-medium">{t('marketDetail.largeSpread')}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {t('marketDetail.largeSpreadWarning', {
                      spread: (price.spread * 100).toFixed(1),
                      askPrice: price.bestAsk.toFixed(2),
                      bidPrice: price.bestBid.toFixed(2)
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
              <div className="h-64 relative">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                      <span>{t('marketDetail.loadingChart')}</span>
                    </div>
                  </div>
                ) : chartData ? (
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
                currentPriceYes={price.yes}
                currentPriceNo={price.no}
                bestBid={price.bestBid}
                bestAsk={price.bestAsk}
                polymarket={polymarket}
                onSuccess={async () => {
                  // 订单成功后立即后台刷新市场数据和价格
                  await fetchMarket(false);
                  if (price.refresh) {
                    await price.refresh();
                  }
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



