'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '@/components/Navbar';
import QuickTradeModal from '@/components/trading/QuickTradeModal';
import { useMarketsByCategory } from '@/lib/hooks/useMarketsByCategory';
import { MarketDataProvider, useMarketDataContext } from '@/lib/contexts/MarketDataContext';
import { MarketCardOptimized } from '@/components/MarketCardOptimized';
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

// 内部组件：使用 MarketDataContext
function MarketsListContent({ 
  markets, 
  loading, 
  error, 
  category, 
  config, 
  filteredMarkets,
  marketsForDisplay,
  quickTradeModal,
  setQuickTradeModal,
  t
}: {
  markets: any[];
  loading: boolean;
  error: string | null;
  category: string;
  config: any;
  filteredMarkets: any[];
  marketsForDisplay: any[];
  quickTradeModal: any;
  setQuickTradeModal: any;
  t: any;
}) {
  const { connected } = useMarketDataContext();

  return (
    <>
      {/* 实时连接状态 - 已隐藏 */}
      {/* {connected && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg w-fit">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">实时数据已连接（优化版）</span>
        </div>
      )} */}
      
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

      {/* 卡片网格 - 使用优化后的组件 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {marketsForDisplay.map((market) => (
            <MarketCardOptimized
              key={market.id}
              market={market}
            />
          ))}
          
          {/* Empty State - 只在无筛选结果时显示 */}
          {marketsForDisplay.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FontAwesomeIcon icon={config.icon} className="text-6xl text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无市场</h3>
              <p className="text-gray-400">请尝试调整筛选条件查看更多结果</p>
            </div>
          )}
        </div>
      )}

      {/* 快速交易弹窗 */}
      {quickTradeModal.isOpen && quickTradeModal.market && quickTradeModal.side && (
        <QuickTradeModal
          isOpen={quickTradeModal.isOpen}
          onClose={() => setQuickTradeModal({ isOpen: false, market: null, side: null })}
          market={quickTradeModal.market}
          side={quickTradeModal.side}
        />
      )}
    </>
  );
}

const MarketCategoryPage = ({ params }: { params: { category: string } }) => {
  const { t } = useTranslation();
  const { category } = params;
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // 🔥 Polymarket 风格：状态筛选器
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
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

  // 第一步：按子分类筛选
  let filteredMarkets = selectedSubCategory === 'all' 
    ? markets 
    : markets.filter(market => {
        const targetCategory = config.categoryMapping[selectedSubCategory];
        return targetCategory && market.category === targetCategory;
      });
  
  // 第二步：🔥 按状态筛选（Polymarket 风格）
  if (selectedStatus !== 'all') {
    filteredMarkets = filteredMarkets.filter(market => {
      const status = market.blockchain_status || 'not_created';
      return status === selectedStatus;
    });
  }
  
  // 第三步：按搜索筛选
  if (searchQuery) {
    filteredMarkets = filteredMarkets.filter(market =>
      market.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // 第四步：应用时间筛选
  filteredMarkets = filterByTimeRange(filteredMarkets);

  // 🔥 转换为MarketCardOptimized组件需要的格式（简化版，实时数据从Context获取）
  const marketsForDisplay = filteredMarkets.map(market => ({
    id: market.id,
    title: market.title,
    description: market.description || '暂无描述',
    blockchain_status: market.blockchain_status || 'not_created',
    main_category: market.main_category || category,
    priority_level: market.priorityLevel || (market as any).priority_level,
    question_id: market.question_id,
    condition_id: market.condition_id,
    conditionId: market.condition_id
  }));

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
      
      {/* Navbar - 传递筛选栏相关props */}
      <Navbar 
        activeCategory={category}
        showFilters={true}
        showSmartSearch={true}
        subCategories={config.subCategories}
        activeSubCategory={selectedSubCategory}
        onSubCategoryChange={setSelectedSubCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
      />
      
      {/* 占位符 - 为固定的导航栏留出空间（含筛选栏） */}
      <div className="h-[265px]"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-20 max-w-[1600px] relative z-10">
        
        {/* 🔥 Polymarket 风格：状态筛选器 - 已隐藏 */}
        {/* <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
            {t('filters.status') || '状态'}:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedStatus === 'all'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('filters.all') || '全部'}
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatus === 'active'
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🟢</span>
              <span>{t('market.status.active') || '交易中'}</span>
            </button>
            <button
              onClick={() => setSelectedStatus('pending_settlement')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatus === 'pending_settlement'
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⏳</span>
              <span>{t('market.status.pending') || '待结算'}</span>
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatus === 'resolved'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>✅</span>
              <span>{t('market.status.resolved') || '已结算'}</span>
            </button>
          </div>
        </div> */}

        {/* 🔥 使用 MarketDataProvider 包裹，提供全局数据管理 */}
        {markets.length > 0 && (
          <MarketDataProvider marketIds={markets.map(m => m.id)}>
            <MarketsListContent
              markets={markets}
              loading={loading}
              error={error}
              category={category}
              config={config}
              filteredMarkets={filteredMarkets}
              marketsForDisplay={marketsForDisplay}
              quickTradeModal={quickTradeModal}
              setQuickTradeModal={setQuickTradeModal}
              t={t}
            />
          </MarketDataProvider>
        )}
        
        {/* 如果没有市场数据，显示加载或错误状态 */}
        {markets.length === 0 && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <FontAwesomeIcon icon={config.icon} className="text-6xl text-amber-400 mb-4 animate-pulse" />
                  <p className="text-xl text-white font-semibold">{t('common.loading')}</p>
                  <p className="text-sm text-gray-500 mt-2">{t('common.loadingData')}</p>
                </div>
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
};

export default MarketCategoryPage;

