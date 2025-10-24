'use client'

import React from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

// 定义新闻数据类型接口
export interface BreakingNewsItem {
  id: number
  title: string
  image: string
  currentProbability: number
  previousProbability: number
  changeType: 'up' | 'down'
  date: string
}

export interface LiveNewsItem {
  id: number
  title: string
  time: string
  type: 'breaking' | 'update'
}

const BreakingPage = () => {
  // 模拟的突发新闻数据 - 基于参考图片样式
  const breakingNews: BreakingNewsItem[] = [
    {
      id: 1,
      title: 'Park Sung-jae in jail by October 31?',
      image: '/park-sung-jae.jpg',
      currentProbability: 65,
      previousProbability: 20,
      changeType: 'up',
      date: 'Oct 15, 2025'
    },
    {
      id: 2,
      title: 'Will Gemini 3.0 be released by October 31?',
      image: '/gemini.png',
      currentProbability: 51,
      previousProbability: 24,
      changeType: 'up',
      date: 'Oct 15, 2025'
    },
    {
      id: 3,
      title: 'Will The Life of a Showgirl\'s second-week album sales be 600k or more?',
      image: '/showgirl.png',
      currentProbability: 21,
      previousProbability: 2,
      changeType: 'up',
      date: 'Oct 15, 2025'
    },
    {
      id: 4,
      title: 'Lecornu out as French PM by October 31?',
      image: '/lecornu.jpg',
      currentProbability: 20,
      previousProbability: 14,
      changeType: 'down',
      date: 'Oct 15, 2025'
    },
    {
      id: 5,
      title: 'French election called by October 31?',
      image: '/french-election.png',
      currentProbability: 19,
      previousProbability: 14,
      changeType: 'down',
      date: 'Oct 15, 2025'
    },
    {
      id: 6,
      title: 'Will Eric Adams endorse Cuomo?',
      image: '/eric-adams.jpg',
      currentProbability: 71,
      previousProbability: 17,
      changeType: 'up',
      date: 'Oct 15, 2025'
    }
  ]

  // 侧边栏实时新闻数据
  const liveNews: LiveNewsItem[] = [
    {
      id: 1,
      title: 'Hyperliquid deposits & withdrawals are now live on Polymarket.',
      time: '10月15日 5:50',
      type: 'breaking'
    },
    {
      id: 2,
      title: 'Binance to distribute over 100 million McNuggets worth of rewards to those who got liquidated last week.',
      time: '10月15日 5:11',
      type: 'breaking'
    },
    {
      id: 3,
      title: 'The odds of Ukraine using Tomahawk missiles this year',
      time: '10月15日 2:04',
      type: 'breaking'
    }
  ]

  // 获取图标或占位符
  const getImagePlaceholder = (id: number) => {
    // 为每个新闻项提供不同的占位符图像或图标
    const placeholders = [
      '👨‍⚖️', // 法官/法律相关
      '🔮', // 科技相关
      '🎵', // 音乐/专辑相关
      '👨‍💼', // 政治人物
      '🏛️', // 选举/政府相关
      '👨‍💼'  // 政治相关
    ]
    return placeholders[id - 1] || '📰'
  }

  // 渲染变化图表线
  const renderTrendLine = (changeType: 'up' | 'down') => {
    if (changeType === 'up') {
      return (
        <svg className="w-10 h-4 text-[#4ade80]" viewBox="0 0 40 16">
          <path 
            d="M0 8 L8 8 L12 2 L16 10 L20 6 L24 12 L28 8 L32 14 L40 14"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )
    } else {
      return (
        <svg className="w-10 h-4 text-[#f87171]" viewBox="0 0 40 16">
          <path 
            d="M0 8 L8 8 L12 14 L16 6 L20 10 L24 4 L28 8 L32 2 L40 2"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-6">
        {/* 页面标题区域 */}
        <div className="mb-8 bg-gradient-to-r from-[#1e1e2e] to-[#121212] rounded-xl p-6 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute right-10 top-0 h-full w-32 bg-[#ffcc00]/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 bottom-0 h-24 w-24 bg-[#ffcc00]/20 rounded-full blur-2xl"></div>
          
          {/* 标题内容 */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 font-medium">{breakingNews[0].date}</span>
              <div className="flex items-center gap-3">
                <button className="bg-white/10 hover:bg-[#ffcc00]/20 rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="bg-white/10 hover:bg-[#ffcc00]/20 rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#ffcc00]">Breaking News</h1>
            <p className="text-white/70">See the markets that moved the most in the last 24 hours</p>
          </div>
        </div>

        {/* 主内容和侧边栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧主内容 - 新闻列表 */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {breakingNews.map((news, index) => (
                <Link 
                  key={news.id}
                  href={`/event/breaking-${news.id}`}
                  className="bg-[#1e1e2e] border border-[#ffcc00]/10 rounded-xl p-4 flex items-center hover:border-[#ffcc00]/30 hover:bg-[#25253d] transition-all duration-200 cursor-pointer group block w-full"
                >
                  {/* 排名序号 */}
                  <div className="w-8 h-8 rounded-lg bg-[#25253d] flex items-center justify-center text-white/70 font-medium text-sm mr-4">
                    {index + 1}
                  </div>
                  
                  {/* 头像/图标 */}
                  <div className="w-10 h-10 rounded-lg bg-[#25253d] flex items-center justify-center text-xl mr-4">
                    {getImagePlaceholder(news.id)}
                  </div>
                  
                  {/* 标题和概率变化 */}
                  <div className="flex-grow">
                    <h3 className="text-base font-medium text-white mb-1 group-hover:text-[#ffcc00] transition-colors">
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/70">{news.previousProbability}%</span>
                      <span className="text-sm font-bold text-white">→</span>
                      <span className={`text-sm font-bold ${news.changeType === 'up' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                        {news.currentProbability}%
                      </span>
                    </div>
                  </div>
                  
                  {/* 趋势图表线 */}
                  <div className="flex-shrink-0 ml-4">
                    {renderTrendLine(news.changeType)}
                  </div>
                  
                  {/* 箭头图标 */}
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-[#ffcc00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="lg:col-span-1">
            {/* 订阅更新表单 */}
            <div className="bg-[#1e1e2e] border border-[#ffcc00]/10 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#ffcc00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-lg font-medium text-[#ffcc00]">Get daily updates</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">
                We'll send you an email every day with what's moving on Polymarket
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#25253d] border border-[#ffcc00]/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                />
                <button className="w-full bg-[#ffcc00] hover:bg-[#ffaa00] text-[#121212] font-medium py-2 rounded-lg transition-colors duration-200">
                  Get updates
                </button>
              </div>
            </div>
            
            {/* 实时新闻动态 */}
            <div className="bg-[#1e1e2e] border border-[#ffcc00]/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Live from @polymarket</h3>
                <button className="bg-[#25253d] hover:bg-[#333355] text-[#ffcc00] text-xs px-3 py-1 rounded-full transition-colors">
                  Follow on X
                </button>
              </div>
              
              <div className="space-y-5">
                {liveNews.map((item) => (
                  <div key={item.id} className="border-b border-[#ffcc00]/10 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#ffcc00] text-xs font-medium">{item.type === 'breaking' ? 'Breaking news' : 'Update'}</span>
                      <span className="text-white/50 text-xs">{item.time}</span>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2">{item.title}</p>
                  </div>
                ))}
              </div>
              
              {/* 底部品牌标识 */}
              <div className="mt-5 flex items-center justify-center">
                <div className="w-24 h-12 bg-[#25253d] rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-8 text-[#ffcc00]" viewBox="0 0 64 32">
                    <path d="M16 0 C24 8 32 8 40 0 L64 0 L64 32 L40 32 C32 24 24 24 16 32 L0 32 L0 0 Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BreakingPage