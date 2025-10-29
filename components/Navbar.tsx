'use client';
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import WalletConnect from './WalletConnect'
import LanguageSwitcher from './LanguageSwitcher'

// Navigation Link Component - 修改为按钮式点击
const NavLink = ({ 
  categoryId, 
  label, 
  isActive, 
  onClick 
}: { 
  categoryId: string; 
  label: string; 
  isActive: boolean;
  onClick: (categoryId: string) => void;
}) => {
  return (
    <button 
      onClick={() => onClick(categoryId)}
      className={`font-medium transition-colors whitespace-nowrap relative pb-1 ${
        isActive 
        ? 'text-amber-400' 
        : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"></div>
      )}
    </button>
  )
}

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  subCategories?: Array<{ id: string; name: string }>;
  activeSubCategory?: string;
  onSubCategoryChange?: (subCategoryId: string) => void;
  // 筛选栏相关
  showFilters?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  // 显示控制
  showProductBanner?: boolean;
}

const Navbar = ({ 
  activeCategory = 'automotive', 
  onCategoryChange,
  subCategories = [],
  activeSubCategory = 'all',
  onSubCategoryChange,
  showFilters = false,
  searchQuery = '',
  onSearchChange,
  selectedTimeRange = 'ALL',
  onTimeRangeChange,
  showProductBanner = true
}: NavbarProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(false)
  const subCategoryScrollRef = React.useRef<HTMLDivElement>(null)

  // 六大赛道分类数据
  const categories = [
    { id: 'automotive', name: t('categories.automotive') },
    { id: 'smart-devices', name: t('categories.smartDevices') },
    { id: 'tech-ai', name: t('categories.techAi') },
    { id: 'entertainment', name: t('categories.entertainment') },
    { id: 'sports-gaming', name: t('categories.sportsGaming') },
    { id: 'economy-social', name: t('categories.economySocial') },
    { id: 'emerging', name: t('categories.emerging') },
  ]

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      // 如果提供了回调函数，使用回调（主页模式）
      onCategoryChange(categoryId);
    } else {
      // 如果没有提供回调函数，使用路由跳转到市场分类页面
      router.push(`/markets/${categoryId}`);
    }
  }

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

  React.useEffect(() => {
    const scrollContainer = subCategoryScrollRef.current;
    if (scrollContainer && showFilters) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [showFilters, subCategories]);

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-[100] bg-zinc-950/95 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        {/* Top Row with Logo, Search, and Actions */}
        <div className="flex items-center justify-between py-[0.375rem] border-b border-white/5 gap-4" style={{height: '80px'}}>
          {/* Left Side: Logo - 固定在左上角 */}
          <div className="flex items-center">
            {/* Logo with Image */}
            <button 
              onClick={() => handleCategoryClick('automotive')}
              className="w-[250px] h-[70px] hover:opacity-80 transition-opacity"
              style={{overflow: 'hidden', display: 'block', position: 'relative'}}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src="/image/LUMI-golden.png" 
                  alt="LUMI Logo" 
                  width={250} 
                  height={70}
                  className="object-contain rounded-lg"
                />
              </div>
            </button>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* 余额显示 - 使用suppressHydrationWarning避免服务端渲染不匹配 */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-sm text-gray-400" suppressHydrationWarning>{t('nav.balance')}:</span>
              <span className="text-sm font-semibold text-amber-400">$0.00</span>
            </div>
            
            {/* 语言切换器 */}
            <LanguageSwitcher theme="dark" />
            
            {/* 钱包连接组件 */}
            <WalletConnect />
            
            {/* 用户菜单下拉 */}
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </button>
              {/* 下拉菜单 */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors" suppressHydrationWarning>
                    {t('profile.title')}
                  </a>
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors" suppressHydrationWarning>
                    {t('nav.balance')}
                  </a>
                  <div className="border-t border-white/10 my-1"></div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">
                    {t('wallet.disconnect')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 即将推出的产品横幅 */}
        {showProductBanner && (
        <div className="py-3 border-b border-white/5">
          <div className="flex items-center justify-center gap-6 overflow-x-auto">
            {/* 预测市场 */}
            <Link 
              href="/markets" 
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-500/8 to-yellow-500/8 border border-amber-500/25 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/12 transition-all duration-200 group min-w-[240px]"
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/image/LUMI-golden-sm.png" 
                  alt="LUMI" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                  {t('nav.predictionMarket')}
                </span>
                <span className="text-xs text-gray-500">{t('nav.launched')}</span>
              </div>
            </Link>

            {/* 黑天鹅预警 */}
            <Link 
              href="/black-swan" 
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-rose-500/8 to-red-500/8 border border-rose-500/25 rounded-xl hover:border-rose-500/50 hover:bg-rose-500/12 transition-all duration-200 group min-w-[240px]"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/image/black-swan.png" alt="Black Swan" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-rose-400 group-hover:text-rose-300 transition-colors">
                  {t('nav.blackSwanAlert')}
                </span>
                <span className="text-xs text-gray-500">2025 Q4 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-rose-500 text-white rounded-full font-semibold whitespace-nowrap">
                {t('nav.new')}
              </span>
            </Link>

            {/* 彩票 - 一站式链上博彩平台 */}
            <Link 
              href="/lottery" 
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 border border-yellow-500/25 rounded-xl hover:border-yellow-500/50 hover:bg-yellow-500/12 transition-all duration-200 group min-w-[240px]"
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/image/Lottery Platform.png" 
                  alt="Lottery" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                  {t('nav.lotteryPlatform')}
                </span>
                <span className="text-xs text-gray-500">2026-Q1 Building</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-yellow-500 text-black rounded-full font-semibold whitespace-nowrap">
                Building
              </span>
            </Link>

            {/* 市场趋势预测 */}
            <Link 
              href="/market-trends" 
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500/8 to-teal-500/8 border border-emerald-500/25 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/12 transition-all duration-200 group min-w-[240px]"
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/image/Market Trend Prediction.png" 
                  alt="Market Trends" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {t('nav.marketTrends')}
                </span>
                <span className="text-xs text-gray-500">2026-Q2 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500 text-white rounded-full font-semibold whitespace-nowrap">
                {t('nav.soon')}
              </span>
            </Link>

            {/* 量化 */}
            <Link 
              href="/quant" 
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500/8 to-indigo-500/8 border border-blue-500/25 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/12 transition-all duration-200 group min-w-[240px]"
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/image/AIQuantitativeTrading.png" 
                  alt="AI Quantitative Trading" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  {t('nav.aiQuant')}
                </span>
                <span className="text-xs text-gray-500">2026-Q3 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-blue-500 text-white rounded-full font-semibold whitespace-nowrap">
                {t('nav.soon')}
              </span>
            </Link>
          </div>
        </div>
        )}

        {/* Categories Navigation - 垂直拉伸5% */}
        <div className="py-[0.656rem] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-white/5">
          <div className="flex space-x-6 min-w-max">
            {categories.map((category) => (
              <NavLink
                key={category.id}
                categoryId={category.id}
                label={category.name}
                isActive={activeCategory === category.id}
                onClick={handleCategoryClick}
              />
            ))}
          <button className="text-gray-400 hover:text-gray-200 flex items-center whitespace-nowrap transition-colors">
            {t('nav.more')} <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 第4层：筛选栏 - 搜索 + 子分类 + 时间筛选 */}
        {showFilters && (
          <div className="py-3.5 border-t border-white/5">
            <div className="flex gap-3 items-center flex-nowrap">
              {/* Search Box */}
              <div className="relative w-72 flex-shrink-0">
                <input
                  type="text"
                  placeholder={t('common.searchMarkets')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sub-Categories with Scroll Arrows */}
              {subCategories.length > 0 && (
                <div className="flex-1 relative min-w-0 overflow-hidden mr-2">
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
                      {subCategories.map((subCat: any) => (
                        <button
                          key={subCat.id}
                          onClick={() => onSubCategoryChange?.(subCat.id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                            activeSubCategory === subCat.id
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
              )}

              {/* Time Range Filter */}
              <div className="flex gap-1.5 flex-shrink-0">
                {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                  <button
                    key={range}
                    onClick={() => onTimeRangeChange?.(range)}
                    className={`min-w-[52px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      selectedTimeRange === range
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-amber-400/50 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar