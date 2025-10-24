'use client';
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

// 定义市场数据类型
interface MarketItem {
  id: number;
  title: string;
  icon: string; // 存储图标名称
  prices: Array<{ price: string; yes: string; no: string; live?: boolean }>;
  volume: string;
  timeRange?: string;
  change?: string;
}

const CryptoPage = () => {
  // 状态管理
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('Bitcoin');

  // 时间范围选项
  const timeRanges = [
    { label: 'All', count: 148 },
    { label: '15 Min', count: 2 },
    { label: 'Hourly', count: 4 },
    { label: '4 Hour', count: 2 },
    { label: 'Daily', count: 4 },
    { label: 'Weekly', count: 20 },
    { label: 'Monthly', count: 15 },
    { label: 'Pre-Market', count: 32 },
  ];

  // 加密货币分类
  const cryptoCategories = [
    { name: 'Bitcoin', count: 20 },
    { name: 'Ethereum', count: 13 },
    { name: 'Solana', count: 10 },
    { name: 'XRP', count: 8 },
    { name: 'Dogecoin', count: 3 },
    { name: 'Microstrategy', count: 3 },
  ];

  // 模拟市场数据
  const marketData: MarketItem[] = [
    {
      id: 1,
      title: 'Monad airdrop by ?',
      icon: 'circleDollarBlue',
      prices: [
        { price: '91%', yes: '91%', no: '9%' },
        { price: '9%', yes: '9%', no: '91%' },
      ],
      volume: '$1.2M',
      timeRange: 'Daily',
      change: '+2.3%',
    },
    {
      id: 2,
      title: 'Bitcoin ETF approval by ?',
      icon: 'bitcoin',
      prices: [
        { price: '85%', yes: '85%', no: '15%' },
        { price: '15%', yes: '15%', no: '85%' },
      ],
      volume: '$3.5M',
      timeRange: 'Monthly',
      change: '-1.2%',
    },
    {
      id: 3,
      title: 'Ethereum price to reach $5000 by end of year?',
      icon: 'ethereum',
      prices: [
        { price: '76%', yes: '76%', no: '24%' },
        { price: '24%', yes: '24%', no: '76%' },
      ],
      volume: '$2.8M',
      timeRange: 'Monthly',
      change: '+5.4%',
    },
    {
      id: 4,
      title: 'Solana to outperform Ethereum in Q4?',
      icon: 'solana',
      prices: [
        { price: '43%', yes: '43%', no: '57%' },
        { price: '57%', yes: '57%', no: '43%' },
      ],
      volume: '$1.9M',
      timeRange: 'Weekly',
      change: '+7.8%',
    },
    {
      id: 5,
      title: 'Dogecoin to hit $0.50 this year?',
      icon: 'dogecoin',
      prices: [
        { price: '21%', yes: '21%', no: '79%' },
        { price: '79%', yes: '79%', no: '21%' },
      ],
      volume: '$1.5M',
      timeRange: 'Monthly',
      change: '-3.1%',
    },
    {
      id: 6,
      title: 'MicroStrategy to add more Bitcoin in Q4?',
      icon: 'microstrategy',
      prices: [
        { price: '68%', yes: '68%', no: '32%' },
        { price: '32%', yes: '32%', no: '68%' },
      ],
      volume: '$0.9M',
      timeRange: 'Weekly',
      change: '+1.5%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边过滤器 */}
          <div className="lg:w-1/4">
            <div className="bg-[#1e1e2e] rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4 text-[#ffcc00]">Time Ranges</h3>
              <div className="space-y-1">
                {timeRanges.map((range) => (
                  <button
                    key={range.label}
                    className={`flex justify-between items-center w-full px-3 py-2 rounded-md transition-colors ${selectedTimeRange === range.label 
                      ? 'bg-[#2a2a40] text-white' 
                      : 'hover:bg-[#1e1e2e] text-white/70'}`}
                    onClick={() => setSelectedTimeRange(range.label)}
                  >
                    <span>{range.label}</span>
                    <span className="text-xs bg-[#1e1e2e] px-2 py-0.5 rounded-full">{range.count}</span>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-bold mb-4 text-[#ffcc00]">Categories</h3>
              <div className="space-y-1">
                {cryptoCategories.map((category) => (
                  <button
                    key={category.name}
                    className={`flex justify-between items-center w-full px-3 py-2 rounded-md transition-colors ${activeCategory === category.name 
                      ? 'bg-[#2a2a40] text-white' 
                      : 'hover:bg-[#1e1e2e] text-white/70'}`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-[#1e1e2e] px-2 py-0.5 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 主要内容区域 - 市场卡片 */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.map((market) => (
                <Link 
                  key={market.id}
                  href={`/event/${market.id}`}
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
                      {market.prices.map((option, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm flex-grow pr-2">
                            {idx === 0 ? 'Yes' : 'No'}
                          </span>
                          <span className="font-bold min-w-[40px] text-right text-[#4ade80]">{option.price}</span>
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
        </div>
      </div>
    </div>
  );
};

export default CryptoPage;