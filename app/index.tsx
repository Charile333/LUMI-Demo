'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const HomePage = () => {
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
    <div className="min-h-screen bg-primary text-accent">
      {/* 导航栏 */}
      <Navbar />

      {/* 主要内容区域 */}
      <main>
        {/* Hero Section */}
        <section className="hero-section bg-primary relative overflow-hidden">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-secondary">Trade the Future</span> of Everything
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-accent/80">
                Buy and sell shares in the outcome of real-world events with up to 80% liquidity
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/trending" className="btn bg-secondary text-primary hover:bg-accent transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold">
                  Explore Markets
                </Link>
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
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 top-20 w-64 h-64 bg-secondary/5 rounded-full blur-2xl"></div>
        </section>

        {/* Featured Markets Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-accent">Featured Markets</h2>
              <Link href="/market" className="text-secondary hover:text-accent transition-colors duration-200 flex items-center">
                View All Markets
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Market Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMarkets.map((market, index) => (
                <div 
                  key={index}
                  className="card bg-primary-800 border border-secondary rounded-lg p-6 hover:shadow-lg hover:shadow-secondary/20 transition-all duration-200 transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold mb-4 text-accent">{market.title}</h3>
                  
                  {market.options.map((option, optIndex) => (
                    <div key={optIndex} className="prediction-option flex justify-between items-center mb-3">
                      <span className="option-name text-accent">{option.name}</span>
                      <span className="option-probability text-secondary font-bold">{option.probability}</span>
                    </div>
                  ))}
                  
                  <div className="card-meta pt-4 border-t border-secondary/20">
                    <span className="volume text-sm text-accent/70">{market.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Categories Section */}
        <section className="py-16 bg-primary-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-accent">Trending Categories</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link 
                  key={category.id} 
                  href={`/${category.id}`}
                  className="category-card bg-primary border border-secondary rounded-lg p-4 text-center hover:bg-secondary hover:text-primary transition-colors duration-200"
                >
                  <div className="mb-3 text-3xl">
                    {category.id === 'market_d' && '🔥'}
                    {category.id === 'breaking' && '📰'}
                    {category.id === 'politics' && '🏛️'}
                    {category.id === 'sports' && '⚽'}
                    {category.id === 'tech' && '💻'}
                    {category.id === 'economy' && '💰'}
                  </div>
                  <h3 className="font-bold text-accent hover:text-primary transition-colors duration-200">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Ready to Start Trading?</h2>
            <p className="text-xl mb-8 text-primary/80 max-w-2xl mx-auto">
              Join thousands of traders predicting the outcomes of global events and potentially earn profits based on your insights.
            </p>
            <Link href="/market" className="btn bg-primary text-secondary hover:bg-primary-800 transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold inline-block">
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage