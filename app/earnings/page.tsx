'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faChartLine, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons'

// 定义市场数据类型接口
export interface MarketData {
  id: string
  title: string
  category: string
  expiryDate: string
  volume: string
  timeFrame: string
  change: string
  outcomes: {
    name: string
    probability: number
  }[]
}

const EarningsPage = () => {
  // 状态管理
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [earningsMarkets, setEarningsMarkets] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 模拟的收益市场数据
  const mockEarningsMarkets: MarketData[] = [
    {
      id: 'apple-q3-2023',
      title: 'Will Apple report revenue above $90B in Q3 2023?',
      category: 'Earnings',
      expiryDate: 'July 31, 2023',
      volume: '$3.2M',
      timeFrame: 'Short',
      change: '+3.4',
      outcomes: [
        { name: 'Yes', probability: 58.2 },
        { name: 'No', probability: 41.8 }
      ]
    },
    {
      id: 'google-ai-revenue',
      title: 'Will Google\'s AI-related revenue exceed $5B by end of 2023?',
      category: 'Earnings',
      expiryDate: 'Dec 31, 2023',
      volume: '$1.5M',
      timeFrame: 'Medium',
      change: '+5.7',
      outcomes: [
        { name: 'Yes', probability: 63.4 },
        { name: 'No', probability: 36.6 }
      ]
    },
    {
      id: 'tesla-delivery-numbers',
      title: 'Will Tesla deliver more than 1.8M vehicles in 2023?',
      category: 'Earnings',
      expiryDate: 'Dec 31, 2023',
      volume: '$2.1M',
      timeFrame: 'Medium',
      change: '-2.1',
      outcomes: [
        { name: 'Yes', probability: 45.8 },
        { name: 'No', probability: 54.2 }
      ]
    }
  ]

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      setEarningsMarkets(mockEarningsMarkets)
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  // 时间范围过滤选项
  const timeRanges = [
    { id: '24h', name: '24h' },
    { id: '7d', name: '7d' },
    { id: '30d', name: '30d' },
    { id: 'all', name: 'All Time' }
  ]

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        
        {/* 过滤器和排序选项 */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time:</span>
            <div className="flex bg-dark-light rounded-lg p-0.5">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${selectedTimeRange === range.id ? 'bg-gold text-dark' : 'text-gray-400 hover:text-white'}`}
                >
                  {range.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 分类标签导航 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link 
            href="/trending" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-dark-light hover:bg-dark-light/80 text-white`}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Trending
          </Link>
          <Link 
            href="/geopolitics" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-dark-light hover:bg-dark-light/80 text-white`}
          >
            <FontAwesomeIcon icon={faGlobe} className="mr-2" /> Geopolitics
          </Link>
          <Link 
            href="/earnings" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gold text-dark`}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Earnings
          </Link>
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(index => (
              <div key={index} className="bg-dark-light border border-gray-800 rounded-xl overflow-hidden p-5 animate-pulse">
                <div className="h-4 bg-gray-700 rounded-full w-1/4 mb-3"></div>
                <div className="h-10 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2].map(item => (
                    <div key={item}>
                      <div className="flex justify-between mb-1">
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 市场卡片网格
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earningsMarkets.map((market) => (
              <Link 
                key={market.id} 
                href={`/event/${market.id}`}
                className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a40] border border-transparent rounded-xl p-6 hover:border-[#ffcc00]/40 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ffcc00]/10 h-full flex flex-col"
              >
                <div className="flex flex-col h-full">
                  {/* 顶部标题区域 - 标题旁边显示YES概率 */}
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-medium group-hover:text-[#ffcc00] transition-colors duration-200 line-clamp-2 flex-grow pr-2">
                      {market.title}
                    </h3>
                    {market.outcomes[0] && (
                      <span className="font-bold min-w-[40px] text-right text-[#4ade80]">{market.outcomes[0].probability}%</span>
                    )}
                  </div>

                  {/* 底部YES/NO按钮区域 - 居中显示 */}
                  <div className="flex justify-center my-4">
                    <div className="flex gap-2">
                      <button className="w-16 h-9 bg-[#4ade80]/20 rounded flex items-center justify-center text-[#4ade80] hover:bg-[#4ade80]/40 transition-colors">YES</button>
                      <button className="w-16 h-9 bg-[#f87171]/20 rounded flex items-center justify-center text-[#f87171] hover:bg-[#f87171]/40 transition-colors">NO</button>
                    </div>
                  </div>

                  {/* 底部信息 - 成交量在左下角 */}
                  <div className="mt-auto pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60">
                      ${market.volume} Vol
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default EarningsPage