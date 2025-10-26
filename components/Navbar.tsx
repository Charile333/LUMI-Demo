'use client';
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import WalletConnect from './WalletConnect'

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
      className={`font-medium transition duration-200 whitespace-nowrap ${
        isActive 
        ? 'text-purple-600 border-b-2 border-purple-600' 
        : 'text-gray-700 hover:text-purple-600'
      }`}
    >
      {label}
    </button>
  )
}

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const Navbar = ({ activeCategory = 'automotive', onCategoryChange }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // 六大赛道分类数据
  const categories = [
    { id: 'automotive', name: '汽车与新能源' },
    { id: 'smart-devices', name: '手机与智能硬件' },
    { id: 'tech-ai', name: '科技发布与AI创新' },
    { id: 'entertainment', name: '娱乐与文化' },
    { id: 'sports-gaming', name: '体育与电竞' },
    { id: 'economy-social', name: '经济与社会趋势' },
    { id: 'emerging', name: '新兴赛道' },
  ]

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      // 如果提供了回调函数，使用回调（主页模式）
      onCategoryChange(categoryId);
    } else {
      // 如果没有提供回调函数，使用路由跳转（详细页面模式）
      router.push(`/?category=${categoryId}`);
    }
  }

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-primary">
      <div className="container mx-auto px-4">
        {/* Top Row with Logo, Search, and Actions */}
        <div className="flex items-center justify-between py-[0.375rem] border-b border-secondary/20 gap-4" style={{height: '80px'}}>
          {/* Left Side: Logo and Search - 固定在左上角 */}
          <div className="flex items-center flex-grow gap-4">
            {/* Logo with Image */}
            <button 
              onClick={() => handleCategoryClick('automotive')}
              className="w-[250px] h-[70px] hover:opacity-80 transition-opacity"
              style={{overflow: 'hidden', display: 'block', position: 'relative'}}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src="/image/LUMI (1).png" 
                  alt="LUMI Logo" 
                  width={250} 
                  height={70}
                  className="object-contain rounded-lg"
                />
              </div>
            </button>

            {/* Search Bar */}
            <div className="relative flex-grow min-w-0 hidden lg:block">
              <input
                type="text"
                placeholder="搜索预测市场"
                className="w-full py-[0.55rem] px-[1.1rem] bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-[0.935rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-[1.1rem] w-[1.1rem] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* 余额显示 */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">余额:</span>
              <span className="text-sm font-bold text-gray-900">$0.00</span>
            </div>
            
            {/* 钱包连接组件 */}
            <WalletConnect />
            
            {/* 用户菜单 */}
            <button className="p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="py-2.5 lg:hidden border-b border-secondary/20">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索预测市场"
              className="w-full py-2 px-4 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* 即将推出的产品横幅 */}
        <div className="py-3 border-b border-secondary/20 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5">
          <div className="flex items-center justify-center gap-6 overflow-x-auto">
            {/* 预测市场 */}
            <Link 
              href="/markets" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-lg hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-400/20 transition-all group min-w-[240px]"
            >
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image 
                  src="/image/create.png" 
                  alt="LUMI" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-purple-600 group-hover:text-purple-500 transition-colors">
                  预测市场平台
                </span>
                <span className="text-xs text-gray-500">已上线</span>
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
                  黑天鹅预警
                </span>
                <span className="text-xs text-gray-500">2025 Q4 推出</span>
              </div>
              <span className="text-xs px-2 py-1 bg-[#ff4444] text-white rounded-full font-semibold whitespace-nowrap">
                NEW
              </span>
            </Link>

            {/* 彩票 - 一站式链上博彩平台 */}
            <Link 
              href="/lottery" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#ffcc00]/10 to-[#ffd700]/10 border border-[#ffcc00]/30 rounded-lg hover:border-[#ffcc00]/60 hover:shadow-lg hover:shadow-[#ffcc00]/20 transition-all group min-w-[240px]"
            >
              <div className="text-2xl">🎰</div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-[#d4a017] group-hover:text-[#ffcc00] transition-colors">
                  彩票博彩平台
                </span>
                <span className="text-xs text-gray-500">2026-Q1 推出</span>
              </div>
              <span className="text-xs px-2 py-1 bg-[#ffcc00] text-black rounded-full font-semibold whitespace-nowrap">
                SOON
              </span>
            </Link>

            {/* 市场趋势预测 */}
            <Link 
              href="/market-trends" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30 rounded-lg hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-400/20 transition-all group min-w-[240px]"
            >
              <div className="text-2xl">📊</div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors">
                  市场趋势预测
                </span>
                <span className="text-xs text-gray-500">2026-Q2 推出</span>
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-full font-semibold whitespace-nowrap">
                SOON
              </span>
            </Link>

            {/* 量化 */}
            <Link 
              href="/quant" 
              className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-400/20 transition-all group min-w-[240px]"
            >
              <div className="text-2xl">📈</div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold text-blue-600 group-hover:text-blue-500 transition-colors">
                  AI量化交易
                </span>
                <span className="text-xs text-gray-500">2026-Q3 推出</span>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full font-semibold whitespace-nowrap">
                SOON
              </span>
            </Link>
          </div>
        </div>

        {/* Categories Navigation - 垂直拉伸5% */}
        <div className="py-[0.656rem] overflow-x-auto whitespace-nowrap scrollbar-hide">
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
          <button className="text-gray-700 hover:text-purple-600 flex items-center whitespace-nowrap">
            更多 <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar