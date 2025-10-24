'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import ArrowScrollSelector from '../../components/ArrowScrollSelector';

interface MarketData {
  id: string;
  title: string;
  category: string;
  expiryDate: string;
  volume: string;
  timeFrame: string;
  change: string;
  countries: string[];
  outcomes: Array<{name: string; probability: number}>;
}

const GeopoliticsPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [geopoliticsMarkets, setGeopoliticsMarkets] = useState<MarketData[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<MarketData[]>([]);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  // 完整的国家和地区列表
  const countryCategories = [
    'all', 'USA', 'China', 'Russia', 'EU', 'UK', 'France', 'Germany',
    'Japan', 'India', 'Brazil', 'Canada', 'Australia', 'South Korea',
    'Gaza', 'Israel', 'Ukraine', 'Iran', 'Turkey', 'Mexico', 'South Africa',
    'Saudi Arabia', 'Gaza Flotilla', 'Venezuela', 'Middle East', 'Ukraine Map',
    'Foreign Policy', 'India-Pakistan'
  ];

  const mockGeopoliticsMarkets: MarketData[] = [
    {
      id: 'us-china-tensions',
      title: 'Will there be a military conflict between the US and China in Taiwan by 2025?',
      category: 'Geopolitics',
      expiryDate: 'Dec 31, 2025',
      volume: '$2.4M',
      timeFrame: 'Medium',
      change: '+2.3',
      countries: ['Foreign Policy'],
      outcomes: [
        { name: 'Yes', probability: 18.5 },
        { name: 'No', probability: 81.5 }
      ]
    },
    {
      id: 'ukraine-conflict',
      title: 'Will Ukraine retake Crimea by the end of 2024?',
      category: 'Geopolitics',
      expiryDate: 'Dec 31, 2024',
      volume: '$1.8M',
      timeFrame: 'Short',
      change: '-1.7',
      countries: ['Ukraine', 'Russia'],
      outcomes: [
        { name: 'Yes', probability: 23.2 },
        { name: 'No', probability: 76.8 }
      ]
    },
    {
      id: 'middle-east-peace',
      title: 'Will there be a comprehensive peace agreement between Israel and Palestine by 2026?',
      category: 'Geopolitics',
      expiryDate: 'Dec 31, 2026',
      volume: '$1.2M',
      timeFrame: 'Long',
      change: '+0.5',
      countries: ['Israel', 'Gaza', 'Middle East'],
      outcomes: [
        { name: 'Yes', probability: 15.8 },
        { name: 'No', probability: 84.2 }
      ]
    },
    {
      id: 'iran-nuclear-deal',
      title: 'Will the US rejoin the Iran nuclear deal in 2024?',
      category: 'Geopolitics',
      expiryDate: 'Dec 31, 2024',
      volume: '$980K',
      timeFrame: 'Short',
      change: '-2.1',
      countries: ['USA', 'Iran'],
      outcomes: [
        { name: 'Yes', probability: 28.4 },
        { name: 'No', probability: 71.6 }
      ]
    }
  ];

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setGeopoliticsMarkets(mockGeopoliticsMarkets);
      setFilteredMarkets(mockGeopoliticsMarkets);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = geopoliticsMarkets;
    
    // 按国家筛选
    if (selectedCountry !== 'all') {
      result = result.filter(market => 
        market.countries.some(country => country.toLowerCase().includes(selectedCountry.toLowerCase()))
      );
    }

    // 按时间范围筛选
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(now.getFullYear() + 2);

      if (selectedTimeRange === 'short') {
        result = result.filter(market => market.timeFrame === 'Short');
      } else if (selectedTimeRange === 'medium') {
        result = result.filter(market => market.timeFrame === 'Medium');
      } else if (selectedTimeRange === 'long') {
        result = result.filter(market => market.timeFrame === 'Long');
      }
    }

    setFilteredMarkets(result);
  }, [selectedCountry, selectedTimeRange, geopoliticsMarkets]);

  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Geopolitics Markets</h1>
          <p className="text-gray-400">Trade on political events happening around the world</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search geopolitics markets..."
                className="w-full bg-[#1e1e2e] border border-gray-700 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:border-[#ffcc00] text-white"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                className="relative bg-[#1e1e2e] border border-gray-700 rounded-lg py-2 px-4 flex items-center gap-2 hover:border-[#ffcc00] transition-colors text-white"
              >
                <span>Time Range</span>
                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ transform: isTimeFilterOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <ArrowScrollSelector 
                items={countryCategories.slice(0, 5)} 
                selectedItem={selectedCountry} 
                onItemSelect={setSelectedCountry} 
                containerClass="bg-[#1e1e2e] border border-gray-700 text-white"
              />
            </div>
          </div>
          
          {/* 时间范围下拉菜单 */}
          {isTimeFilterOpen && (
            <div className="absolute z-10 mt-2 bg-[#1e1e2e] border border-gray-700 rounded-lg shadow-lg w-48">
              {['all', 'short', 'medium', 'long'].map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedTimeRange(option);
                    setIsTimeFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#2a2a40] ${selectedTimeRange === option ? 'text-[#ffcc00]' : 'text-gray-300'}`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          )}
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
          // 网格布局的预测市场卡片
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMarkets.map((market) => (
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
                    {market.outcomes.map((outcome, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm flex-grow pr-2">{outcome.name}</span>
                        <span className="font-bold min-w-[40px] text-right text-[#4ade80]">{outcome.probability}%</span>
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
                      ${market.volume} Vol
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
              onClick={() => {
                setSelectedCountry('all');
                setSelectedTimeRange('all');
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

export default GeopoliticsPage;