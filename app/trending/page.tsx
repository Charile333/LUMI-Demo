'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface MarketData {
  id: string;
  title: string;
  category: string;
  volume: string;
  change: string;
  probability: number;
  endDate: string;
}

const TrendingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<MarketData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模拟市场数据
  const mockMarkets: MarketData[] = [
    {
      id: 'trend-1',
      title: 'Will Bitcoin reach $100,000 by the end of 2024?',
      category: 'Crypto',
      volume: '$12.5M',
      change: '+24%',
      probability: 65,
      endDate: 'Dec 31, 2024'
    },
    {
      id: 'trend-2',
      title: 'Which team will win the 2024 NBA Championship?',
      category: 'Sports',
      volume: '$8.7M',
      change: '+12%',
      probability: 38,
      endDate: 'Jun 30, 2024'
    },
    {
      id: 'trend-3',
      title: 'Will Elon Musk remain CEO of Twitter by 2025?',
      category: 'Tech',
      volume: '$6.3M',
      change: '-8%',
      probability: 42,
      endDate: 'Jan 1, 2025'
    },
    {
      id: 'trend-4',
      title: 'Will the US Federal Reserve cut interest rates in Q2 2024?',
      category: 'Economy',
      volume: '$9.2M',
      change: '+15%',
      probability: 70,
      endDate: 'Jun 30, 2024'
    },
    {
      id: 'trend-5',
      title: 'Will a major AI breakthrough occur in 2024?',
      category: 'Tech',
      volume: '$7.8M',
      change: '+22%',
      probability: 85,
      endDate: 'Dec 31, 2024'
    },
    {
      id: 'trend-6',
      title: 'Who will win the 2024 US Presidential Election?',
      category: 'Politics',
      volume: '$15.4M',
      change: '+5%',
      probability: 48,
      endDate: 'Nov 5, 2024'
    },
    {
      id: 'trend-7',
      title: 'Will Ethereum surpass Bitcoin in market cap in 2024?',
      category: 'Crypto',
      volume: '$5.9M',
      change: '-10%',
      probability: 15,
      endDate: 'Dec 31, 2024'
    },
    {
      id: 'trend-8',
      title: 'Will global temperature increase by 1.5°C in 2024?',
      category: 'Climate',
      volume: '$4.2M',
      change: '+18%',
      probability: 60,
      endDate: 'Dec 31, 2024'
    }
  ];

  // 时间范围选项
  const timeRangeOptions = ['24h', '7d', '30d', 'all'];
  
  // 分类选项
  const categoryOptions = ['all', 'Crypto', 'Sports', 'Tech', 'Economy', 'Politics', 'Climate'];

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setMarkets(mockMarkets);
      setFilteredMarkets(mockMarkets);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 筛选逻辑
    let results = [...markets];
    
    // 按分类筛选
    if (selectedCategory !== 'all') {
      results = results.filter(market => market.category === selectedCategory);
    }
    
    // 按变化幅度排序（模拟不同时间范围的数据）
    if (selectedTimeRange === '24h') {
      results.sort((a, b) => Math.abs(parseInt(b.change)) - Math.abs(parseInt(a.change)));
    } else if (selectedTimeRange === '7d') {
      results.sort((a, b) => Math.abs(parseInt(b.change) * 0.8) - Math.abs(parseInt(a.change) * 0.8));
    } else if (selectedTimeRange === '30d') {
      results.sort((a, b) => Math.abs(parseInt(b.change) * 0.5) - Math.abs(parseInt(a.change) * 0.5));
    }
    
    setFilteredMarkets(results);
  }, [selectedTimeRange, selectedCategory, markets]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Crypto: '💰',
      Sports: '⚽',
      Tech: '💻',
      Economy: '📈',
      Politics: '🏛️',
      Climate: '🌎'
    };
    return icons[category] || '';
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* 导航栏 */}
      <Navbar />
      
      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trending Markets</h1>
          <p className="text-gray-400">See what's popular right now</p>
        </div>

        {/* 筛选器 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 时间范围选择器 */}
            <div className="flex gap-2">
              {timeRangeOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedTimeRange(option)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${selectedTimeRange === option ? 'bg-[#ffcc00] text-[#121212] font-medium shadow-lg shadow-[#ffcc00]/20' : 'bg-[#1e1e2e] text-white/70 hover:bg-[#2a2a40]'}`}
                >
                  {option === 'all' ? 'All Time' : option}
                </button>
              ))}
            </div>
            
            {/* 分类选择器 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${selectedCategory === category ? 'bg-[#ffcc00] text-[#121212] font-medium shadow-lg shadow-[#ffcc00]/20' : 'bg-[#1e1e2e] text-white/70 hover:bg-[#2a2a40]'}`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 市场卡片网格 */}
        {isLoading ? (
          // 加载状态 - 骨架屏
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-[#1e1e2e] rounded-xl p-6 animate-pulse">
                <div className="h-10 bg-[#2a2a40] rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-[#2a2a40] rounded w-3/4"></div>
                  <div className="h-6 bg-[#2a2a40] rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-[#2a2a40] rounded flex-1 mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          // 市场卡片网格
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMarkets.map((market) => (
              <Link 
                key={market.id}
                href={`/event/${market.id}`}
                className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a40] border border-transparent rounded-xl p-6 hover:border-[#ffcc00]/40 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ffcc00]/10 h-full flex flex-col"
              >
                <div className="flex flex-col h-full">
                  {/* 顶部标题区域 - 标题旁边显示概率 */}
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-medium group-hover:text-[#ffcc00] transition-colors duration-200 line-clamp-2 flex-grow pr-2">
                      {market.title}
                    </h3>
                    <span className="font-bold min-w-[40px] text-right" style={{ color: market.probability > 50 ? '#4ade80' : '#f87171' }}>{market.probability}%</span>
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
            <h3 className="text-xl font-medium mb-2">No markets found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters to find more markets</p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTimeRange('24h');
              }}
              className="bg-[#ffcc00] text-[#121212] hover:bg-[#ffdb4d] font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-lg shadow-[#ffcc00]/20 hover:shadow-[#ffcc00]/40"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrendingPage;