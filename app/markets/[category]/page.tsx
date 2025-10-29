'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '@/components/Navbar';
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
  faTrophy,
  faRobot,
  faBrain,
  faMicrochip,
  faCloud,
  faRocket,
  faCode,
  faLightbulb,
  faNetworkWired,
  faShieldAlt,
  faDatabase,
  faMobile,
  faLaptop,
  faTablet,
  faHeadphones,
  faClock,
  faWifi,
  faCamera,
  faGamepad,
  faStar,
  faFilm,
  faMusic,
  faTv,
  faFutbol,
  faBasketballBall,
  faDollarSign,
  faStore,
  faGraduationCap,
  faHeart,
  faSeedling
} from '@fortawesome/free-solid-svg-icons';

// 分类配置
const getCategoryConfig = (category: string, t: any) => {
  const configs: Record<string, any> = {
    'automotive': {
      icon: faCar,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'brand-sales', name: t('categories.brandSales') },
        { id: 'new-models', name: t('categories.newModels') },
        { id: 'market-share', name: t('categories.marketShare') },
        { id: 'regional-export', name: t('categories.regionalExport') },
        { id: 'fuel-vs-ev', name: t('categories.fuelVsEv') },
        { id: 'tech-innovation', name: t('categories.techInnovation') }
      ],
      categoryMapping: {
        'brand-sales': '品牌月度销量',
        'new-models': '新车型表现',
        'market-share': '市场份额',
        'regional-export': '区域出口',
        'fuel-vs-ev': '燃油车vs新能源',
        'tech-innovation': '技术创新'
      }
    },
    'tech-ai': {
      icon: faRobot,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'llm-competition', name: t('categories.llmCompetition') },
        { id: 'chip-industry', name: t('categories.chipIndustry') },
        { id: 'ai-phone', name: t('categories.aiPhone') }
      ],
      categoryMapping: {
        'llm-competition': '大模型竞争',
        'chip-industry': '芯片产业',
        'ai-phone': 'AI手机趋势'
      }
    },
    'smart-devices': {
      icon: faMobile,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'new-sales', name: t('categories.newSales') },
        { id: 'system-eco', name: t('categories.systemEco') },
        { id: 'regional', name: t('categories.regional') }
      ],
      categoryMapping: {
        'new-sales': '新机销量',
        'system-eco': '系统生态',
        'regional': '区域市场'
      }
    },
    'entertainment': {
      icon: faFilm,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'movie-box-office', name: t('categories.movieBoxOffice') },
        { id: 'music-chart', name: t('categories.musicChart') },
        { id: 'variety-show', name: t('categories.varietyShow') },
        { id: 'pop-culture', name: t('categories.popCulture') },
        { id: 'influencer-trend', name: t('categories.influencerTrend') },
        { id: 'social-heat', name: t('categories.socialHeat') }
      ],
      categoryMapping: {
        'movie-box-office': '电影票房',
        'music-chart': '音乐榜单',
        'variety-show': '综艺节目',
        'pop-culture': '流行文化',
        'influencer-trend': '网红趋势',
        'social-heat': '社交热度'
      }
    },
    'sports-gaming': {
      icon: faFutbol,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'basketball', name: t('categories.basketball') },
        { id: 'football', name: t('categories.football') },
        { id: 'esports', name: t('categories.esports') },
        { id: 'international-esports', name: t('categories.internationalEsports') },
        { id: 'sea-esports', name: t('categories.seaEsports') },
        { id: 'volleyball', name: t('categories.volleyball') },
        { id: 'athletics', name: t('categories.athletics') },
        { id: 'multi-sports', name: t('categories.multiSports') }
      ],
      categoryMapping: {
        'basketball': '篮球',
        'football': '足球',
        'esports': '电竞',
        'international-esports': '国际电竞',
        'sea-esports': '东南亚电竞',
        'volleyball': '排球',
        'athletics': '田径',
        'multi-sports': '综合赛事'
      }
    },
    'economy-social': {
      icon: faDollarSign,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'a-share', name: t('categories.aShare') },
        { id: 'policy-investment', name: t('categories.policyInvestment') },
        { id: 'ecommerce', name: t('categories.ecommerce') },
        { id: 'overseas-platform', name: t('categories.overseasPlatform') },
        { id: 'housing', name: t('categories.housing') },
        { id: 'forex', name: t('categories.forex') },
        { id: 'short-video', name: t('categories.shortVideo') },
        { id: 'macro-economy', name: t('categories.macroEconomy') }
      ],
      categoryMapping: {
        'a-share': 'A股板块表现',
        'policy-investment': '政策与投资',
        'ecommerce': '电商',
        'overseas-platform': '出海平台',
        'housing': '房价',
        'forex': '汇率',
        'short-video': '短视频',
        'macro-economy': '宏观经济'
      }
    },
    'emerging': {
      icon: faRocket,
      subCategories: [
        { id: 'all', name: t('categories.all') },
        { id: 'industry-trend', name: t('categories.industryTrend') },
        { id: 'local-life', name: t('categories.localLife') },
        { id: 'population', name: t('categories.population') },
        { id: 'education', name: t('categories.education') },
        { id: 'health', name: t('categories.health') },
        { id: 'food', name: t('categories.food') },
        { id: 'travel', name: t('categories.travel') },
        { id: 'transportation', name: t('categories.transportation') },
        { id: 'lifestyle', name: t('categories.lifestyle') },
        { id: 'fitness', name: t('categories.fitness') },
        { id: 'beauty', name: t('categories.beauty') },
        { id: 'pet', name: t('categories.pet') },
        { id: 'environmental', name: t('categories.environmental') }
      ],
      categoryMapping: {
        'industry-trend': '产业趋势',
        'local-life': '本地生活',
        'population': '人口趋势',
        'education': '教育',
        'health': '健康',
        'food': '饮食',
        'travel': '旅游',
        'transportation': '出行',
        'lifestyle': '生活方式',
        'fitness': '健身',
        'beauty': '美妆',
        'pet': '宠物经济',
        'environmental': '环保'
      }
    }
  };

  return configs[category] || configs['automotive'];
};

const MarketCategoryPage = ({ params }: { params: { category: string } }) => {
  const { t } = useTranslation();
  const { category } = params;
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const subCategoryScrollRef = useRef<HTMLDivElement>(null);
  
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
  
  // 获取分类配置
  const config = getCategoryConfig(category, t);
  
  // 📊 使用 hook 从 Supabase 加载市场数据（自动按分类过滤）
  const { markets, loading, error } = useMarketsByCategory(category);

  // 🔥 使用 WebSocket 获取实时价格
  const marketIds = markets.map(m => m.id);
  const { pricesMap, connected: wsConnected } = useMarketListWebSocket(marketIds);

  // 滚动子分类列表
  const scrollSubCategories = (direction: 'left' | 'right') => {
    if (subCategoryScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = subCategoryScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      subCategoryScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // 检查滚动位置并更新箭头显示状态
  const checkScrollPosition = () => {
    if (subCategoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subCategoryScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = subCategoryScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      // 监听窗口大小变化
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [config.subCategories]);

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

  // 先按子分类筛选
  let filteredMarkets = selectedSubCategory === 'all' 
    ? markets 
    : markets.filter(market => {
        const targetCategory = config.categoryMapping[selectedSubCategory];
        return targetCategory && market.category === targetCategory;
      });
  
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar - 不传递子分类，子分类移到搜索区域 */}
      <Navbar 
        activeCategory={category}
      />
      
      {/* 占位符 - 为固定的导航栏留出空间（不包括子分类） */}
      <div style={{ height: 'calc(80px + 60px + 57px - 40px)' }}></div>
      
      {/* Filters - 固定在导航栏下方，包含子分类 */}
      <div className="fixed top-[calc(80px+60px+57px)] left-0 right-0 z-[95] bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 pt-4">
        <div className="container mx-auto px-4 pb-2">
          <div className="flex gap-4 items-center flex-nowrap">
            {/* Search Box */}
            <div className="relative w-80 flex-shrink-0 min-w-[320px]">
              <input
                type="text"
                placeholder={t('common.searchMarkets')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sub-Categories with Scroll Arrows */}
            <div className="flex-1 relative min-w-0 overflow-hidden">
              {showLeftArrow && (
                <button
                  onClick={() => scrollSubCategories('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 hover:bg-zinc-800 rounded-full p-1.5 transition-colors border border-white/10"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div 
                ref={subCategoryScrollRef}
                className="overflow-x-auto scrollbar-hide px-6 py-1"
                style={{ maxWidth: '100%' }}
              >
                <div className="flex gap-2 min-w-max items-center">
                  {config.subCategories.map((subCat: any) => (
                    <button
                      key={subCat.id}
                      onClick={() => setSelectedSubCategory(subCat.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedSubCategory === subCat.id
                          ? 'bg-amber-400 text-black'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {subCat.name}
                    </button>
                  ))}
                </div>
              </div>
              {showRightArrow && (
                <button
                  onClick={() => scrollSubCategories('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900 hover:bg-zinc-800 rounded-full p-1.5 transition-colors border border-white/10"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2 flex-shrink-0 ml-auto">
              {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`w-14 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center flex-shrink-0 ${
                    selectedTimeRange === range
                      ? 'bg-white/10 text-amber-400 border border-amber-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 占位符 - 为固定的搜索筛选区域留出空间 */}
      <div style={{ height: '56px' }}></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6 -mt-32">
        {/* Markets Grid */}
        {wsConnected && (
          <div className="mb-2 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg w-fit">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">实时价格已连接</span>
          </div>
        )}
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FontAwesomeIcon icon={config.icon} className="text-6xl text-amber-400 mb-4 animate-pulse" />
              <p className="text-xl text-white font-semibold">{t('common.loading')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('common.loadingData')}</p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FontAwesomeIcon icon={config.icon} className="text-6xl text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('common.loadFailed')}</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg transition-colors font-semibold"
              >
                {t('common.reload')}
              </button>
            </div>
          </div>
        )}

        {/* 卡片网格 */}
        {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
          {marketsWithRealtimePrices.map((market) => (
            <div
              key={market.id}
              className="bg-zinc-900 rounded-xl border border-white/10 hover:border-amber-400/50 transition-all duration-300 group overflow-hidden min-h-[350px] flex flex-col"
            >
              {/* Card Header - Title with Trend */}
              <Link href={`/market/${market.id}`} className="block p-6 pb-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors flex-1">
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
                    <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 font-medium border border-red-500/30">
                      📌 置顶
                    </span>
                  )}
                  {market.priorityLevel === 'featured' && (
                    <span className="px-2 py-1 text-xs rounded bg-amber-400/10 text-amber-400 font-medium border border-amber-400/30">
                      ⭐ 精选
                    </span>
                  )}
                  {market.priorityLevel === 'recommended' && (
                    <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400 font-medium border border-orange-500/30">
                      🔥 推荐
                    </span>
                  )}
                  
                  {/* 数据来源标签 */}
                  {market.source === 'polymarket' && (
                    <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      🔴 Polymarket
                    </span>
                  )}
                  {market.source === 'custom' && (
                    <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      📝 自定义
                    </span>
                  )}
                  
                  {/* 分类标签 */}
                  <span className="px-2 py-1 text-xs rounded bg-white/5 text-gray-400 border border-white/10">
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
                    <div className="text-3xl font-bold text-amber-400">{market.probability}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">截止日期</div>
                    <div className="text-sm text-white">{market.endDate}</div>
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
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-1.5 text-amber-400" />
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
          
          {/* Empty State - 只在无筛选结果时显示 */}
          {marketsWithRealtimePrices.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FontAwesomeIcon icon={config.icon} className="text-6xl text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无市场</h3>
              <p className="text-gray-400">请尝试调整筛选条件查看更多结果</p>
            </div>
          )}
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

export default MarketCategoryPage;

