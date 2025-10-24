'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

// 定义选项数据类型接口
export interface OptionData {
  name: string
  probability: number
  color: string
}

// 定义市场数据类型接口
export interface MarketData {
  id: number
  title: string
  flag: string
  options: OptionData[]
  volume: string
  category: string
  endDate: string
  frequency: string
}

// 定义分类选项接口
export interface CategoryOption {
  id: string
  name: string
}

const GridMarketPage = () => {
  // 分类数据
  const categories: CategoryOption[] = [
    { id: 'all', name: 'All' },
    { id: 'politics', name: 'Politics' },
    { id: 'sports', name: 'Sports' },
    { id: 'economy', name: 'Economy' },
    { id: 'tech', name: 'Tech' },
    { id: 'world', name: 'World' },
    { id: 'crypto', name: 'Crypto' },
  ]

  // 状态管理 - 添加明确的类型注解
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [predictionMarkets, setPredictionMarkets] = useState<MarketData[]>([])

  // 模拟的预测市场数据 - 基于Polymarket风格
  const mockPredictionMarkets: MarketData[] = [
    {
      id: 1,
      title: 'New York City Mayoral Election',
      flag: '🇺🇸',
      options: [
        { name: 'Zohran Mamdani', probability: 88, color: '#4ade80' },
        { name: 'Andrew Cuomo', probability: 11, color: '#f87171' }
      ],
      volume: '$172m Vol.',
      category: 'politics',
      endDate: 'October 15',
      frequency: 'Daily'
    },
    {
      id: 2,
      title: 'Fed decision in October?',
      flag: '🇺🇸',
      options: [
        { name: '50+ bps decrease', probability: 2, color: '#4ade80' },
        { name: 'No change', probability: 94, color: '#f87171' }
      ],
      volume: '$7.7m Vol.',
      category: 'economy',
      endDate: 'October 31',
      frequency: 'Monthly'
    },
    {
      id: 3,
      title: '100% tariff on China in 1?',
      flag: '🇺🇸',
      options: [
        { name: 'Yes', probability: 15, color: '#4ade80' },
        { name: 'No', probability: 85, color: '#f87171' }
      ],
      volume: '$203k Vol.',
      category: 'economy',
      endDate: 'November 30',
      frequency: 'Monthly'
    },
    {
      id: 4,
      title: 'World Series Champion 2025',
      flag: '⚾',
      options: [
        { name: 'Los Angeles Dodgers', probability: 59, color: '#4ade80' },
        { name: 'Seattle Mariners', probability: 32, color: '#f87171' }
      ],
      volume: '$69k Vol.',
      category: 'sports',
      endDate: 'November 30',
      frequency: 'Monthly'
    },
    {
      id: 5,
      title: 'Will Congress pass a funding bill by ?',
      flag: '🇺🇸',
      options: [
        { name: 'Yes', probability: 1, color: '#4ade80' },
        { name: 'No', probability: 99, color: '#f87171' }
      ],
      volume: '$35k Vol.',
      category: 'politics',
      endDate: 'October 31',
      frequency: 'Daily'
    },
    {
      id: 6,
      title: 'NVIDIA (NVDA) up or down October 15',
      flag: '📈',
      options: [
        { name: 'Up', probability: 70, color: '#4ade80' },
        { name: 'Down', probability: 30, color: '#f87171' }
      ],
      volume: '$62k Vol.',
      category: 'tech',
      endDate: 'October 15',
      frequency: 'Daily'
    },
    {
      id: 7,
      title: 'US-Venezuela military engagement by ?',
      flag: '🌎',
      options: [
        { name: 'Yes', probability: 12, color: '#4ade80' },
        { name: 'No', probability: 88, color: '#f87171' }
      ],
      volume: '$31k Vol.',
      category: 'world',
      endDate: 'November 30',
      frequency: 'Monthly'
    },
    {
      id: 8,
      title: 'When will the Government shutdown end?',
      flag: '🇺🇸',
      options: [
        { name: 'October 23-28', probability: 11, color: '#4ade80' },
        { name: 'After October 28', probability: 89, color: '#f87171' }
      ],
      volume: '$29k Vol.',
      category: 'politics',
      endDate: 'October 28',
      frequency: 'Daily'
    }]

  // 模拟数据加载
  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoading(true)
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      setPredictionMarkets(mockPredictionMarkets)
      setIsLoading(false)
    }

    loadMarkets()
  }, [])

  // 处理分类选择
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  // 过滤市场数据
  const filteredMarkets = predictionMarkets.filter(market => 
    selectedCategory === 'all' || market.category === selectedCategory
  )

  // 渲染进度条
  const renderProgressBar = (probability: number, color: string) => {
    return (
      <div className="w-full bg-[#1e1e2e] rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${probability}%`, backgroundColor: color }}
        ></div>
      </div>
    )
  }

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      politics: '🏛️',
      sports: '⚽',
      economy: '📈',
      tech: '💻',
      world: '🌎',
      crypto: '💰'
    }
    return icons[category] || '📊'
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-6">
        {/* 分类筛选器 */}
        <div className="mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${selectedCategory === category.id ? 'bg-[#ffcc00] text-[#121212] font-medium shadow-lg shadow-[#ffcc00]/20' : 'bg-[#2a2a40] text-white hover:bg-[#333355]'}`}
                onClick={() => handleCategorySelect(category.id)}
                aria-pressed={selectedCategory === category.id}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 网格布局市场卡片 */}
        {isLoading ? (
          // 加载状态骨架屏
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8).fill(null).map((_, index) => (
              <div key={index} className="bg-[#1e1e2e] border border-[#ffcc00]/10 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-[#2a2a40] rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-[#2a2a40] rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-[#2a2a40] rounded w-full mb-3"></div>
                <div className="h-2 bg-[#2a2a40] rounded w-full mb-3"></div>
                <div className="h-4 bg-[#2a2a40] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          // 网格布局的预测市场卡片
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMarkets.map(market => (
              <Link 
                  key={market.id}
                  href={`/event/${market.id}`}
                  className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a40] border border-transparent rounded-xl p-6 hover:border-[#ffcc00]/40 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ffcc00]/10 h-full flex flex-col"
                >
                {/* 卡片内容 */}
                <div className="flex flex-col h-full">
                  {/* 顶部标题区域 */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium group-hover:text-[#ffcc00] transition-colors duration-200 line-clamp-2">
                      {market.title}
                    </h3>
                  </div>

                  {/* 选项区域 - 根据选项数量显示不同布局 */}
                  <div className="space-y-3 flex-grow">
                    {market.options.map((option, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm flex-grow pr-2">{option.name}</span>
                        <span className="font-bold min-w-[40px] text-right" style={{ color: option.color }}>{option.probability}%</span>
                        <div className="flex gap-1 ml-2">
                          <button className="w-10 h-7 bg-[#4ade80]/20 rounded flex items-center justify-center text-[#4ade80] text-xs hover:bg-[#4ade80]/40 transition-colors">YES</button>
                          <button className="w-10 h-7 bg-[#f87171]/20 rounded flex items-center justify-center text-[#f87171] text-xs hover:bg-[#f87171]/40 transition-colors">NO</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 底部信息 - 成交量在左下角 */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60">
                      {market.volume}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // 空状态
          <div className="bg-[#1e1e2e] border border-[#ffcc00]/30 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-white mb-2">No markets found</h3>
            <p className="text-white/70 mb-6">Try adjusting your filters to find more markets</p>
            <button 
              className="bg-[#ffcc00] text-[#121212] hover:bg-[#ffdb4d] font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-lg shadow-[#ffcc00]/20 hover:shadow-[#ffcc00]/40"
              onClick={() => setSelectedCategory('all')}
            >
              View All Markets
            </button>
          </div>
        )}

        {/* 加载更多按钮 */}
        {!isLoading && filteredMarkets.length > 0 && (
          <div className="mt-8 text-center">
            <button className="border border-[#ffcc00]/30 text-[#ffcc00] hover:bg-[#ffcc00]/10 font-medium px-6 py-2 rounded-md transition-all duration-200">
              Load More Markets
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default GridMarketPage