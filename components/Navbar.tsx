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
}

const Navbar = ({ 
  activeCategory = 'automotive', 
  onCategoryChange,
  subCategories = [],
  activeSubCategory = 'all',
  onSubCategoryChange
}: NavbarProps) => {
  const { t } = useTranslation()
  const router = useRouter()

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
        <div className="py-3 border-b border-white/5">
          <div className="flex items-center justify-center gap-6 overflow-x-auto">
            {/* 预测市场 */}
            <Link 
              href="/markets" 
              className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-amber-400/30 rounded-lg hover:border-amber-400 transition-all group min-w-[240px]"
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
                <span className="text-sm font-semibold text-amber-400">
                  {t('nav.predictionMarket')}
                </span>
                <span className="text-xs text-gray-500">{t('nav.launched')}</span>
              </div>
            </Link>

            {/* 黑天鹅预警 */}
            <Link 
              href="/black-swan" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#ff4444]/10 to-[#ff6644]/10 border border-[#ff4444]/30 rounded-lg hover:border-[#ff4444]/60 hover:shadow-lg hover:shadow-[#ff4444]/20 transition-all group min-w-[240px]"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/image/black-swan.png" alt="Black Swan" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-[#ff4444] group-hover:text-[#ff6666] transition-colors">
                  {t('nav.blackSwanAlert')}
                </span>
                <span className="text-xs text-gray-400">2025 Q4 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-[#ff4444] text-white rounded-full font-semibold whitespace-nowrap">
                {t('nav.new')}
              </span>
            </Link>

            {/* 彩票 - 一站式链上博彩平台 */}
            <Link 
              href="/lottery" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#ffcc00]/10 to-[#ffd700]/10 border border-[#ffcc00]/30 rounded-lg hover:border-[#ffcc00]/60 hover:shadow-lg hover:shadow-[#ffcc00]/20 transition-all group min-w-[240px]"
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
                <span className="text-sm font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                  {t('nav.lotteryPlatform')}
                </span>
                <span className="text-xs text-gray-400">2026-Q1 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded-full font-semibold whitespace-nowrap">
                {t('nav.soon')}
              </span>
            </Link>

            {/* 市场趋势预测 */}
            <Link 
              href="/market-trends" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-lg hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-400/20 transition-all group min-w-[240px]"
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
                <span className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {t('nav.marketTrends')}
                </span>
                <span className="text-xs text-gray-400">2026-Q2 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500 text-black rounded-full font-semibold whitespace-nowrap">
                {t('nav.soon')}
              </span>
            </Link>

            {/* 量化 */}
            <Link 
              href="/quant" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-400/20 transition-all group min-w-[240px]"
            >
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                  {t('nav.aiQuant')}
                </span>
                <span className="text-xs text-gray-400">2026-Q3 {t('nav.soon')}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500 text-black rounded-full font-semibold whitespace-nowrap">
                {t('nav.soon')}
              </span>
            </Link>
          </div>
        </div>

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

        {/* Sub-Categories Navigation - 如果有子分类则显示 */}
        {subCategories.length > 0 && (
          <div className="py-2 overflow-x-auto whitespace-nowrap scrollbar-hide bg-zinc-950 border-t border-white/5">
            <div className="flex space-x-3 min-w-max">
              {subCategories.map((subCat) => (
                <button
                  key={subCat.id}
                  onClick={() => onSubCategoryChange?.(subCat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
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
        )}
      </div>
    </nav>
  )
}

export default Navbar