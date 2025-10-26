'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

// 导入分类页面组件
import AutomotivePage from '../automotive/page'
import TechAiPage from '../tech-ai/page'
import EntertainmentPage from '../entertainment/page'
import SmartDevicesPage from '../smart-devices/page'
import SportsGamingPage from '../sports-gaming/page'
import EconomySocialPage from '../economy-social/page'
import EmergingPage from '../emerging/page'

// 处理 URL 参数的组件
function CategoryFromURL({ onCategoryChange }: { onCategoryChange: (category: string) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      onCategoryChange(category)
    }
  }, [searchParams, onCategoryChange])

  return null
}

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('automotive')

  // 清理cascading waves背景
  useEffect(() => {
    const canvas = document.getElementById('cascading-waves-canvas')
    if (canvas) {
      canvas.remove()
    }
  }, [])

  // 处理分类切换
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  // 根据选中的分类渲染内容
  const renderContent = () => {
    switch (activeCategory) {
      case 'automotive':
        return <AutomotivePage />
      case 'tech-ai':
        return <TechAiPage />
      case 'entertainment':
        return <EntertainmentPage />
      case 'smart-devices':
        return <SmartDevicesPage />
      case 'sports-gaming':
        return <SportsGamingPage />
      case 'economy-social':
        return <EconomySocialPage />
      case 'emerging':
        return <EmergingPage />
      default:
        return renderHomePage()
    }
  }

  // 首页内容
  const renderHomePage = () => {
    // 分类数据
    const categories = [
      { id: 'market_d', name: 'Trending' },
      { id: 'breaking', name: 'Breaking' },
      { id: 'politics', name: 'Politics' },
      { id: 'sports', name: 'Sports' },
      { id: 'tech', name: 'Tech' },
      { id: 'economy', name: 'Economy' },
      {
        id: 'more', 
        name: 'More ▾', 
        isDropdown: true,
        subItems: [
          { id: 'entertainment', name: 'Entertainment', url: 'entertainment' },
          { id: 'science', name: 'Science', url: 'science' },
          { id: 'health', name: 'Health', url: 'health' },
          { id: 'environment', name: 'Environment', url: 'environment' }
        ]
      }
    ]

    // 预测市场数据 - 显示精选的几个市场
    const featuredMarkets = [
      {
        title: 'Presidential Election 2028',
        options: [
          { name: 'Alex Johnson', probability: '65%' },
          { name: 'Samantha Lee', probability: '35%' }
        ],
        volume: '$245m Vol.'
      },
      {
        title: 'Fed Rate Hike in December?',
        options: [
          { name: '25 bps increase', probability: '72%' },
          { name: 'No change', probability: '28%' }
        ],
        volume: '$187m Vol.'
      },
      {
        title: 'World Cup 2026 Winner',
        options: [
          { name: 'Brazil', probability: '22%' },
          { name: 'France', probability: '18%' },
          { name: 'Argentina', probability: '15%' }
        ],
        volume: '$312m Vol.'
      }
    ]

    return (
      <main>
        {/* Hero Section */}
        <section className="hero-section bg-primary relative overflow-hidden">
          <div className="container mx-auto px-4 pt-8 pb-20 md:pt-12 md:pb-32">
            <div className="max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => setActiveCategory('automotive')} 
                  className="btn bg-secondary text-primary hover:bg-accent transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold"
                >
                  Explore Markets
                </button>
                <button className="border border-secondary text-secondary hover:bg-secondary/10 transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold">
                  Create Market
                </button>
              </div>
              
              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-item text-center">
                  <div className="stat-value text-2xl font-bold text-secondary">$40B+</div>
                  <div className="stat-label text-sm text-accent/70">Total Volume</div>
                </div>
                <div className="stat-item text-center">
                  <div className="stat-value text-2xl font-bold text-secondary">220K+</div>
                  <div className="stat-label text-sm text-accent/70">Active Traders</div>
                </div>
                <div className="stat-item text-center">
                  <div className="stat-value text-2xl font-bold text-secondary">99.9%</div>
                  <div className="stat-label text-sm text-accent/70">Resolution Rate</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-secondary/5 -skew-x-12 transform -translate-x-20"></div>
        </section>

        {/* Featured Markets Section */}
        <section className="featured-markets-section py-16 bg-primary-900">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-accent">Featured Markets</h2>
              <button 
                onClick={() => setActiveCategory('automotive')}
                className="text-secondary hover:text-accent flex items-center font-medium"
              >
                View all markets
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMarkets.map((market, index) => (
                <Link 
                  key={index}
                  href={`/event/${index + 1}`} 
                  className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a40] border border-transparent rounded-xl p-6 hover:border-[#ffcc00]/40 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ffcc00]/10 h-full flex flex-col"
                >
                  <div className="flex flex-col h-full">
                    {/* 顶部标题区域 */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium group-hover:text-[#ffcc00] transition-colors duration-200 line-clamp-2">
                        {market.title}
                      </h3>
                    </div>

                    {/* 选项区域 */}
                    <div className="space-y-3 flex-grow">
                      {market.options.map((option, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm flex-grow pr-2">{option.name}</span>
                          <span className="font-bold min-w-[40px] text-right text-[#4ade80]">{option.probability}</span>
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
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section py-16 bg-primary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-accent">How It Works</h2>
              <p className="text-lg text-accent/70 max-w-2xl mx-auto">
                Trading on ForecastLux is simple and secure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="step-card text-center">
                <div className="step-number bg-secondary text-primary w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-bold mb-3 text-accent">Sign Up</h3>
                <p className="text-accent/70">
                  Create your account and complete verification in minutes
                </p>
              </div>
              
              <div className="step-card text-center">
                <div className="step-number bg-secondary text-primary w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-bold mb-3 text-accent">Deposit Funds</h3>
                <p className="text-accent/70">
                  Add funds to your account with multiple payment methods
                </p>
              </div>
              
              <div className="step-card text-center">
                <div className="step-number bg-secondary text-primary w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-bold mb-3 text-accent">Start Trading</h3>
                <p className="text-accent/70">
                  Buy and sell shares in predictions with up to 80% liquidity
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-20 bg-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-accent">Ready to Start Trading?</h2>
            <p className="text-xl mb-8 text-accent/80 max-w-2xl mx-auto">
              Join thousands of traders already using ForecastLux to predict and profit from real-world events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-secondary text-primary hover:bg-accent transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold">
                Sign Up Now
              </button>
              <button className="border border-secondary text-secondary hover:bg-secondary/10 transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* URL 参数处理（包裹在 Suspense 中） */}
      <Suspense fallback={null}>
        <CategoryFromURL onCategoryChange={setActiveCategory} />
      </Suspense>

      {/* 导航栏 */}
      <Navbar 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* 主要内容区域 - 根据选中的分类动态显示 */}
      <div>
        {renderContent()}
      </div>
    </div>
  )
}

export default HomePage