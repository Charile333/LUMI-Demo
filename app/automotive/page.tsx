'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QuickTradeModal from '@/components/trading/QuickTradeModal';
import { useMarketsByCategory } from '@/lib/hooks/useMarketsByCategory';
import { useMarketListWebSocket } from '@/hooks/useWebSocket';
import { 
  faCar, 
  faBolt, 
  faChartLine, 
  faCalendar, 
  faArrowUp,
  faBatteryFull,
  faRoad,
  faCog,
  faUsers,
  faFire,
  faGlobe,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';

const AutomotivePage = () => {
  const { t } = useTranslation();
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  
  // 🎯 快速交易弹窗状态
  const [quickTradeModal, setQuickTradeModal] = useState<{
    isOpen: boolean;
    market: any | null;
    side: 'YES' | 'NO' | null;
  }>({
    isOpen: false,
    market: null,
    side: null
  });
  
  // 📊 使用 hook 从 Supabase 加载市场数据（自动按分类过滤）
  const { markets: automotiveMarkets, loading, error } = useMarketsByCategory('automotive');

  // 🔥 使用 WebSocket 获取实时价格
  const marketIds = automotiveMarkets.map(m => m.id);
  const { pricesMap, connected: wsConnected } = useMarketListWebSocket(marketIds);

  const categories = [
    { id: 'all', name: t('categories.all') },
    { id: 'brand-sales', name: t('categories.brandSales') },
    { id: 'new-models', name: t('categories.newModels') },
    { id: 'market-share', name: t('categories.marketShare') },
    { id: 'regional-export', name: t('categories.regionalExport') },
    { id: 'fuel-vs-ev', name: t('categories.fuelVsEv') },
    { id: 'tech-innovation', name: t('categories.techInnovation') }
  ];

  // 滚动分类列表
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = categoryScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      categoryScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // 检查滚动位置并更新箭头显示状态
  const checkScrollPosition = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = categoryScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // 初始检查
      return () => scrollContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // 时间筛选辅助函数
  const filterByTimeRange = (markets: any[]) => {
    if (selectedTimeRange === 'ALL') return markets;
    
    const now = new Date();
    const timeRanges: { [key: string]: number } = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90
    };
    
    const daysLimit = timeRanges[selectedTimeRange];
    if (!daysLimit) return markets;
    
    return markets.filter(market => {
      try {
        const endDate = new Date(market.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= daysLimit && diffDays >= 0;
      } catch {
        return true;
      }
    });
  };

  // 先按分类筛选
  let filteredMarkets = selectedCategory === 'all' 
    ? automotiveMarkets 
    : automotiveMarkets.filter(market => 
        (selectedCategory === 'brand-sales' && market.category === '品牌月度销量') ||
        (selectedCategory === 'new-models' && market.category === '新车型表现') ||
        (selectedCategory === 'market-share' && market.category === '市场份额') ||
        (selectedCategory === 'regional-export' && market.category === '区域出口') ||
        (selectedCategory === 'fuel-vs-ev' && market.category === '燃油车vs新能源') ||
        (selectedCategory === 'tech-innovation' && market.category === '技术创新')
      );
  
  // 再按搜索筛选
  if (searchQuery) {
    filteredMarkets = filteredMarkets.filter(market =>
      market.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // 最后应用时间筛选
  filteredMarkets = filterByTimeRange(filteredMarkets);

  // 🔥 合并 WebSocket 实时价格到市场数据
  const marketsWithRealtimePrices = filteredMarkets.map(market => {
    const wsPrice = pricesMap.get(market.id);
    if (wsPrice) {
      const midPrice = (wsPrice.bestBid + wsPrice.bestAsk) / 2;
      return {
        ...market,
        probability: Math.round(midPrice * 100),
        trend: midPrice > 0.5 ? 'up' as const : 'down' as const,
        change: `${midPrice > 0.5 ? '+' : ''}${((midPrice - 0.5) * 200).toFixed(1)}%`
      };
    }
    return market;
  });

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faCar} className="text-6xl text-purple-600 mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">{t('common.loading')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('common.loadingData')}</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faCar} className="text-6xl text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('common.loadFailed')}</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('common.reload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        {/* Filters - 固定在顶部 */}
        <div className="sticky top-[14rem] z-40 bg-gray-50 pt-4 pb-4 -mx-4 px-4 mb-2 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder={t('common.searchMarkets')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Filter + Time Range Filter Row */}
          <div className="flex gap-4 items-center">
            {/* Category Filter - Horizontal Scroll with Arrows */}
            <div className="flex-1 relative min-w-0">
            {showLeftArrow && (
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div 
              ref={categoryScrollRef}
              className="overflow-x-auto scrollbar-hide px-8"
            >
              <div className="flex gap-2 min-w-max pb-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            {showRightArrow && (
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            </div>
            
            {/* Time Range Filter */}
            <div className="flex gap-2 flex-shrink-0">
              {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`w-14 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center flex-shrink-0 ${
                    selectedTimeRange === range
                      ? 'bg-purple-100 text-purple-600 border border-purple-300'
                      : 'bg-white border border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Markets Grid */}
        {wsConnected && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg w-fit">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700">实时价格已连接</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {marketsWithRealtimePrices.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Card Header - Title with Trend */}
              <Link href={`/market/${market.id}`} className="block p-6 pb-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors flex-1">
                    {market.title}
                  </h3>
                  <div className={`flex items-center text-sm font-medium whitespace-nowrap ${
                    market.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <FontAwesomeIcon 
                      icon={faArrowUp} 
                      className={`mr-1 text-xs ${market.trend === 'down' ? 'rotate-180' : ''}`} 
                    />
                    {market.change}
                  </div>
                </div>
                
                {/* 标签区域：优先级 + 数据来源 + 分类 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 优先级标签 */}
                  {market.priorityLevel === 'pinned' && (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 font-medium">
                      📌 置顶
                    </span>
                  )}
                  {market.priorityLevel === 'featured' && (
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 font-medium">
                      ⭐ 精选
                    </span>
                  )}
                  {market.priorityLevel === 'recommended' && (
                    <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800 font-medium">
                      🔥 推荐
                    </span>
                  )}
                  
                  {/* 数据来源标签 */}
                  {market.source === 'polymarket' && (
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      🔴 Polymarket
                    </span>
                  )}
                  {market.source === 'custom' && (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      📝 自定义
                    </span>
                  )}
                  
                  {/* 分类标签 */}
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                    {market.category}
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="px-6 pb-4">
                {/* Probability and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">当前概率</div>
                    <div className="text-3xl font-bold text-purple-600">{market.probability}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">截止日期</div>
                    <div className="text-sm text-gray-900">{market.endDate}</div>
                  </div>
                </div>

                {/* YES/NO Buttons - 快速交易 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuickTradeModal({
                        isOpen: true,
                        market: {
                          id: market.id,
                          title: market.title,
                          questionId: market.questionId || 'unknown'
                        },
                        side: 'YES'
                      });
                    }}
                    className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg py-3 px-4 transition-all group/btn"
                  >
                    <div className="text-green-400 font-bold text-lg mb-1">YES</div>
                    <div className="text-green-400/70 text-xs">{market.probability}¢</div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuickTradeModal({
                        isOpen: true,
                        market: {
                          id: market.id,
                          title: market.title,
                          questionId: market.questionId || 'unknown'
                        },
                        side: 'NO'
                      });
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg py-3 px-4 transition-all group/btn"
                  >
                    <div className="text-red-400 font-bold text-lg mb-1">NO</div>
                    <div className="text-red-400/70 text-xs">{100 - market.probability}¢</div>
                  </button>
                </div>

                {/* Market Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-1.5 text-purple-600" />
                    <span>{market.volume}</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCalendar} className="mr-1.5" />
                    <span>{market.participants}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faCar} className="text-6xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">暂无市场</h3>
            <p className="text-gray-500">请尝试调整筛选条件查看更多结果</p>
          </div>
        )}
      </div>
      
      {/* 快速交易弹窗 - 自动从订单簿获取价格 */}
      {quickTradeModal.isOpen && quickTradeModal.market && quickTradeModal.side && (
        <QuickTradeModal
          isOpen={quickTradeModal.isOpen}
          onClose={() => setQuickTradeModal({ isOpen: false, market: null, side: null })}
          market={quickTradeModal.market}
          side={quickTradeModal.side}
        />
      )}
    </div>
  );
};

export default AutomotivePage;
