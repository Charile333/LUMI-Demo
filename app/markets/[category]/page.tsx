'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '@/components/Navbar';
import QuickTradeModal from '@/components/trading/QuickTradeModal';
import { useMarketsByCategory } from '@/lib/hooks/useMarketsByCategory';
import { useMarketListWebSocket } from '@/hooks/useWebSocket';
import { MarketCard } from '@/components/MarketCard';
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

  // 🔥 合并 WebSocket 实时价格到市场数据，并转换为MarketCard格式
  const marketsWithRealtimePrices = filteredMarkets.map(market => {
    const wsPrice = pricesMap.get(market.id);
    let probability = market.probability || 50; // 默认50%
    
    if (wsPrice) {
      const midPrice = (wsPrice.bestBid + wsPrice.bestAsk) / 2;
      probability = Math.round(midPrice * 100);
    }
    
    // 转换为MarketCard组件需要的格式
    return {
      id: market.id,
      title: market.title,
      description: market.description || '暂无描述',
      blockchain_status: market.blockchain_status || 'not_created', // 从数据库获取状态
      interested_users: market.interested_users || 0,
      views: market.views || 0,
      activity_score: market.activity_score || 0,
      condition_id: market.condition_id,
      main_category: market.main_category || category,
      priority_level: market.priorityLevel || market.priority_level,
      // 保留原始数据用于其他用途
      _original: {
        ...market,
        probability,
        trend: probability > 50 ? 'up' as const : 'down' as const,
        change: `${probability > 50 ? '+' : ''}${((probability - 50) * 2).toFixed(1)}%`
      }
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar - 传递筛选栏相关props */}
      <Navbar 
        activeCategory={category}
        showFilters={true}
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-12 max-w-[1600px]">
        {/* Markets Grid */}
        {wsConnected && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg w-fit">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {marketsWithRealtimePrices.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              showPrice={true}
            />
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

