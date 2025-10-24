'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMarketById } from '../../../lib/marketData';
import { getSmartDeviceMarketById } from '../../../lib/smartDevicesData';
import { getTechAiMarketById } from '../../../lib/techAiData';
import { getEntertainmentMarketById } from '../../../lib/entertainmentData';
import { getSportsGamingMarketById } from '../../../lib/sportsGamingData';
import { getEconomySocialMarketById } from '../../../lib/economySocialData';
import { getEmergingMarketById } from '../../../lib/emergingData';
import Navbar from '../../../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBell, 
  faCalendar, 
  faLineChart, 
  faShareAlt, 
  faBookmark, 
  faUsers, 
  faUsd, 
  faAngleRight, 
  faThumbsUp, 
  faReply, 
  faLightbulb, 
  faMinus, 
  faPlus,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { 
  faBell as faBellRegular, 
  faBookmark as faBookmarkRegular, 
  faThumbsUp as faThumbsUpRegular 
} from '@fortawesome/free-regular-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const EventDetailPage = ({ params }: { params: { eventId: string } }) => {
  const { eventId } = params;
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [expirationToggle, setExpirationToggle] = useState(false);
  const [limitPrice, setLimitPrice] = useState('67.3');
  const [shares, setShares] = useState('0');

  // 尝试从不同市场数据中获取
  const automotiveData = getMarketById(parseInt(eventId));
  const smartDeviceData = getSmartDeviceMarketById(parseInt(eventId));
  const techAiData = getTechAiMarketById(parseInt(eventId));
  const entertainmentData = getEntertainmentMarketById(parseInt(eventId));
  const sportsGamingData = getSportsGamingMarketById(parseInt(eventId));
  const economySocialData = getEconomySocialMarketById(parseInt(eventId));
  const emergingData = getEmergingMarketById(parseInt(eventId));
  
  // 优先使用找到的数据
  const foundData = automotiveData || smartDeviceData || techAiData || entertainmentData || sportsGamingData || economySocialData || emergingData;
  
  // 确定当前市场所属的分类
  let currentCategory = 'automotive'; // 默认值
  if (automotiveData) currentCategory = 'automotive';
  else if (smartDeviceData) currentCategory = 'smart-devices';
  else if (techAiData) currentCategory = 'tech-ai';
  else if (entertainmentData) currentCategory = 'entertainment';
  else if (sportsGamingData) currentCategory = 'sports-gaming';
  else if (economySocialData) currentCategory = 'economy-social';
  else if (emergingData) currentCategory = 'emerging';
  
  // 如果找到市场数据，使用它；否则使用默认数据
  const marketData = foundData ? {
    title: foundData.title,
    date: foundData.endDate,
    volume: foundData.volume,
    probability: foundData.probability,
    category: foundData.category,
    participants: foundData.participants,
    description: foundData.description,
    resolutionCriteria: foundData.resolutionCriteria,
    relatedMarkets: foundData.relatedMarkets,
    trend: foundData.trend,
    change: foundData.change
  } : {
    title: "2024 Presidential Election",
    date: "Nov 5, 2024",
    volume: "$248,731,952",
    candidates: [
      {
        name: "Alexandra Reynolds",
        party: "Democratic",
        probability: 67.3,
        color: "blue",
        volume: "$89,421,376",
        image: "https://picsum.photos/id/1027/200/200"
      },
      {
        name: "Michael Thornton", 
        party: "Republican",
        probability: 28.1,
        color: "red",
        volume: "$76,329,418",
        image: "https://picsum.photos/id/1012/200/200"
      },
      {
        name: "Sarah Collins",
        party: "Independent", 
        probability: 3.8,
        color: "green",
        volume: "$12,847,291",
        image: "https://picsum.photos/id/1000/200/200"
      },
      {
        name: "Other Candidates",
        party: "Others",
        probability: 0.8,
        color: "purple",
        volume: "$31,284,719",
        image: null
      }
    ],
    description: "This market forecasts the probability that each candidate will win the 2024 United States Presidential Election, scheduled for November 5, 2024. The market will resolve based on the official election results.",
    resolutionCriteria: [
      "The winner is determined by the official electoral college results",
      "In case of an electoral college tie, the market resolves based on the House of Representatives vote", 
      "Market closes at 11:59 PM ET on November 4, 2024"
    ],
    relatedMarkets: [
      "Democratic Primary Winner",
      "Republican Primary Winner", 
      "Popular Vote Margin",
      "Senate Control 2024"
    ],
    comments: [
      {
        id: 1,
        author: "PoliticalAnalyst22",
        avatar: "https://picsum.photos/id/1005/100/100",
        role: "Dem Supporter",
        roleColor: "blue",
        time: "2h ago",
        content: "Reynolds' lead continues to稳固 after the latest debate performance. National polling shows consistent 5-7 point advantage over Thornton.",
        likes: 42
      },
      {
        id: 2,
        author: "ElectionWatcher", 
        avatar: "https://picsum.photos/id/1010/100/100",
        role: "Independent",
        roleColor: "gray",
        time: "5h ago",
        content: "Don't overlook the electoral college map. Thornton has path to victory through swing states despite national polling deficit.",
        likes: 28,
        replies: [
          {
            id: 3,
            author: "DataDriven",
            avatar: "https://picsum.photos/id/1006/100/100", 
            time: "3h ago",
            content: "Swing state polling actually shows Reynolds leading in 5 of 6 critical states. The path is narrow for Thornton.",
            likes: 15
          }
        ]
      }
    ]
  };

  // 判断市场类型
  const isAutomotiveMarket = automotiveData !== undefined;
  const isSmartDeviceMarket = smartDeviceData !== undefined;
  const isTechAiMarket = techAiData !== undefined;
  const isEntertainmentMarket = entertainmentData !== undefined;
  const isSportsGamingMarket = sportsGamingData !== undefined;
  const isEconomySocialMarket = economySocialData !== undefined;
  const isEmergingMarket = emergingData !== undefined;
  const isCustomMarket = isAutomotiveMarket || isSmartDeviceMarket || isTechAiMarket || isEntertainmentMarket || isSportsGamingMarket || isEconomySocialMarket || isEmergingMarket;
  const leadingCandidate = isCustomMarket ? null : marketData.candidates?.[0];

  // Generate dates for the last 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  // Generate random but realistic trend data
  const generateTrendData = (start: number, volatility: number, points: number) => {
    const data = [start];
    for (let i = 1; i < points; i++) {
      const change = (Math.random() - 0.5) * 2 * volatility;
      let next = data[i-1] + change;
      next = Math.max(0, Math.min(100, next)); // Keep between 0 and 100
      data.push(next);
    }
    return data;
  };

  const chartData = isCustomMarket ? {
    labels: generateDates(),
    datasets: [
      {
        label: 'YES',
        data: generateTrendData(marketData.probability || 50, 2.0, 31),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#10B981'
      },
      {
        label: 'NO',
        data: generateTrendData(100 - (marketData.probability || 50), 2.0, 31),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#EF4444'
      }
    ]
  } : {
    labels: generateDates(),
    datasets: [
      {
        label: 'Alexandra Reynolds',
        data: generateTrendData(62, 1.2, 31),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#3B82F6'
      },
      {
        label: 'Michael Thornton',
        data: generateTrendData(32, 1.0, 31),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#EF4444'
      },
      {
        label: 'Sarah Collins',
        data: generateTrendData(5, 0.5, 31),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#10B981'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#121212',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
        titleColor: '#fff',
        bodyColor: '#ccc',
        titleFont: {
          size: 12,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#888',
          maxRotation: 0,
          maxTicksLimit: 6
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#888',
          callback: function(value: any) {
            return value + '%';
          }
        },
        min: 0,
        max: 100
      }
    }
  };
  
  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen">
      {/* 使用统一的导航栏，传递当前分类 */}
      <Navbar activeCategory={currentCategory} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <button 
            onClick={() => router.back()}
            className="hover:text-purple-600 transition-colors"
          >
            {isAutomotiveMarket ? '返回' : 'Back'}
          </button>
          <span className="mx-2">/</span>
          {isAutomotiveMarket && marketData.category && (
            <>
              <span className="text-purple-600">{marketData.category}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-500 truncate">{marketData.title.substring(0, 30)}...</span>
        </div>

        {/* Market Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              {isAutomotiveMarket && marketData.category && (
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {marketData.category}
                  </span>
                </div>
              )}
              <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-display font-bold text-gray-900">{marketData.title}</h1>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="flex items-center"><FontAwesomeIcon icon={faCalendar} className="mr-1" /> {marketData.date}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center"><FontAwesomeIcon icon={faLineChart} className="mr-1" /> {marketData.volume} Volume</span>
                {isAutomotiveMarket && marketData.participants && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center"><FontAwesomeIcon icon={faUsers} className="mr-1" /> {marketData.participants} 参与者</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button className="flex items-center space-x-1 text-sm text-gray-700 hover:text-purple-600 px-3 py-1.5 border border-gray-300 rounded-md hover:border-gray-500 transition-colors">
                <FontAwesomeIcon icon={faShareAlt} />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 text-sm text-gray-700 hover:text-purple-600 px-3 py-1.5 border border-gray-300 rounded-md hover:border-gray-500 transition-colors">
                <FontAwesomeIcon icon={faBookmarkRegular} />
                <span>Save</span>
              </button>
            </div>
          </div>
          
          {/* Candidate Tabs或Yes/No选项 */}
          {isAutomotiveMarket ? (
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/40">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                <span className="text-sm font-medium">YES</span>
                <span className="ml-2 text-green-400 font-bold">{marketData.probability}%</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/40">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                <span className="text-sm font-medium">NO</span>
                <span className="ml-2 text-red-400 font-bold">{(100 - marketData.probability).toFixed(1)}%</span>
              </div>
              {marketData.trend && (
                <div className={`flex items-center px-3 py-1.5 bg-white rounded-lg border border-gray-300 text-sm ${
                  marketData.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span className="mr-1">{marketData.trend === 'up' ? '↗' : '↘'}</span>
                  <span>{marketData.change}</span>
                </div>
              )}
            </div>
          ) : (
          <div className="flex flex-wrap gap-2 mb-6">
              {marketData.candidates?.map((candidate: any, index: number) => (
                <div key={index} className={`flex items-center px-3 py-1.5 bg-white rounded-full border ${index === 0 ? 'border-purple-600' : 'border-gray-300 hover:border-gray-500 transition-colors'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  candidate.color === 'blue' ? 'bg-blue-500' :
                  candidate.color === 'red' ? 'bg-red-500' :
                  candidate.color === 'green' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}></div>
                <span className={`text-sm ${index === 0 ? 'font-medium' : ''}`}>{candidate.name}</span>
                  <span className={`ml-2 ${index === 0 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>{candidate.probability}%</span>
              </div>
            ))}
          </div>
          )}
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Data */}
          <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
            {/* Trend Chart */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {isAutomotiveMarket ? '概率趋势' : 'Win Probability Trend'}
                </h2>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  {['1D', '1W', '1M', '3M', 'ALL'].map((range) => (
                    <button 
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        selectedTimeRange === range 
                          ? 'bg-purple-100 text-purple-600 border-purple-300' 
                          : 'bg-gray-100 border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
          </div>
        </div>
        
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            
            {/* Candidates List - 只在有candidates时显示 */}
            {!isAutomotiveMarket && marketData.candidates && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Candidate Odds</h2>
          </div>
          
              <div className="divide-y divide-gray-800">
                {marketData.candidates.map((candidate, index) => (
                  <div key={index} className="p-5 hover:bg-gray-100/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          {candidate.image ? (
                            <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <FontAwesomeIcon icon={faUsers} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{candidate.name}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <span className={`px-2 py-0.5 rounded text-xs mr-2 ${
                              candidate.party === 'Democratic' ? 'bg-blue-500/10 text-blue-400' :
                              candidate.party === 'Republican' ? 'bg-red-500/10 text-red-400' :
                              candidate.party === 'Independent' ? 'bg-green-500/10 text-green-400' :
                              'bg-gray-700 text-gray-700'
                            }`}>{candidate.party}</span>
                            <span className="flex items-center"><FontAwesomeIcon icon={faUsd} className="mr-1" /> {candidate.volume} Vol</span>
              </div>
              </div>
            </div>
            
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold ${index === 0 ? 'text-purple-600' : ''}`}>{candidate.probability}%</div>
                        <div className="flex space-x-2">
                          <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded text-sm transition-colors">Buy Yes</button>
                          <button className="bg-gray-100 rounded border border-gray-300 px-3 py-1.5 text-sm hover:border-gray-500 transition-colors">Buy No</button>
                        </div>
                      </div>
              </div>
              </div>
                ))}
            </div>
          </div>
            )}
          
            {/* Market Info */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  {isAutomotiveMarket ? '市场信息' : 'Market Information'}
                </h2>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    {isAutomotiveMarket ? '描述' : 'Description'}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {marketData.description}
            </p>
          </div>
          
                <div className="mb-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    {isAutomotiveMarket ? '结算标准' : 'Resolution Criteria'}
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1.5 list-disc pl-5">
                    {marketData.resolutionCriteria && marketData.resolutionCriteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    {isAutomotiveMarket ? '相关市场' : 'Related Markets'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {marketData.relatedMarkets && marketData.relatedMarkets.map((market, index) => (
                      <a key={index} href="#" className="text-purple-600 hover:text-purple-700 text-sm flex items-center">
                        <FontAwesomeIcon icon={faAngleRight} className="mr-1" />
                        <span>{market}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {isAutomotiveMarket ? '讨论区' : 'Discussion'} ({marketData.participants || '2,481'})
                </h2>
                <button className="text-sm text-purple-600 hover:text-purple-700">
                  {isAutomotiveMarket ? '查看全部' : 'View All'}
                </button>
              </div>
              
              <div className="p-5 divide-y divide-gray-800">
                {/* Comment Input */}
                <div className="mb-5">
                  <textarea 
                    placeholder={isAutomotiveMarket ? "添加评论..." : "Add a comment..."} 
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600 resize-none h-20"
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
                      {isAutomotiveMarket ? '发表评论' : 'Post Comment'}
                    </button>
                  </div>
                </div>
                
                {/* Comments */}
                <div className="space-y-5">
                  {!marketData.comments || marketData.comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {isAutomotiveMarket ? '暂无评论，来发表第一条评论吧！' : 'No comments yet. Be the first to comment!'}
                    </div>
                  ) : marketData.comments.map((comment: any) => (
                    <div key={comment.id} className="pt-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                          <img src={comment.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium">{comment.author}</h4>
                              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                comment.roleColor === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-gray-700 text-gray-700'
                              }`}>{comment.role}</span>
                            </div>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <button className="text-xs text-gray-500 hover:text-purple-600 flex items-center">
                              <FontAwesomeIcon icon={faThumbsUpRegular} className="mr-1" /> {comment.likes}
                            </button>
                            <button className="text-xs text-gray-500 hover:text-purple-600 flex items-center">
                              <FontAwesomeIcon icon={faReply} className="mr-1" /> Reply
                            </button>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.map((reply) => (
                            <div key={reply.id} className="mt-3 ml-6 pl-3 border-l-2 border-gray-200">
                              <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                  <img src={reply.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-xs font-medium">{reply.author}</h4>
                                    <span className="text-xs text-gray-500">{reply.time}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{reply.content}</p>
                                  <div className="flex items-center mt-1 space-x-4">
                                    <button className="text-xs text-gray-500 hover:text-purple-600 flex items-center">
                                      <FontAwesomeIcon icon={faThumbsUpRegular} className="mr-1" /> {reply.likes}
                                    </button>
                                    <button className="text-xs text-gray-500 hover:text-purple-600 flex items-center">
                                      <FontAwesomeIcon icon={faReply} className="mr-1" /> Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-xl border border-gray-200 overflow-hidden">
              {isAutomotiveMarket ? (
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">市场概率</h2>
                    {marketData.category && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                        {marketData.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-purple-600">{marketData.probability}%</div>
                    {marketData.trend && (
                      <div className={`text-sm ${marketData.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {marketData.change}
                      </div>
                    )}
                  </div>
                </div>
              ) : leadingCandidate ? (
                <div className="p-5 border-b border-gray-200 flex items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden mr-4">
                  <img src={leadingCandidate.image || ''} alt={leadingCandidate.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-semibold">{leadingCandidate.name}</h2>
                  <div className="flex items-center mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      leadingCandidate.party === 'Democratic' ? 'bg-blue-500/10 text-blue-400' :
                      leadingCandidate.party === 'Republican' ? 'bg-red-500/10 text-red-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>{leadingCandidate.party}</span>
                    <span className="ml-2 text-sm text-gold font-medium">{leadingCandidate.probability}%</span>
                  </div>
                </div>
              </div>
              ) : null}
              
              <div className="p-5 border-b border-gray-200">
                <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-5">
                  <button className="flex-1 py-2.5 text-center bg-gold text-dark font-medium">Buy</button>
                  <button className="flex-1 py-2.5 text-center bg-gray-100 text-gray-600 hover:text-purple-600 transition-colors">Sell</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <button className="py-3 bg-green-500/20 text-green-400 rounded-lg font-medium border border-green-500/30">
                    Yes ({isAutomotiveMarket ? marketData.probability : leadingCandidate?.probability}¢)
                  </button>
                  <button className="py-3 bg-gray-100 rounded-lg font-medium border border-gray-300 hover:border-gray-500 transition-colors">
                    No ({isAutomotiveMarket ? (100 - marketData.probability).toFixed(1) : (100 - (leadingCandidate?.probability || 0)).toFixed(1)}¢)
                  </button>
                </div>
                
                {/* Limit Price */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-600 mb-2">Limit Price</label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setLimitPrice((parseFloat(limitPrice) - 0.1).toFixed(1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-l-md hover:border-gray-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input 
                      type="text" 
                      value={`${limitPrice}¢`} 
                      onChange={(e) => setLimitPrice(e.target.value.replace('¢', ''))}
                      className="flex-1 bg-gray-100 border-y border-gray-300 py-3 px-4 text-center focus:outline-none focus:border-purple-600"
                    />
                    <button 
                      onClick={() => setLimitPrice((parseFloat(limitPrice) + 0.1).toFixed(1))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-r-md hover:border-gray-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                
                {/* Shares */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-600 mb-2">Shares</label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setShares(Math.max(0, parseInt(shares) - 1).toString())}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-l-md hover:border-gray-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input 
                      type="text" 
                      value={shares} 
                      onChange={(e) => setShares(e.target.value)}
                      className="flex-1 bg-gray-100 border-y border-gray-300 py-3 px-4 text-center focus:outline-none focus:border-purple-600"
                    />
                    <button 
                      onClick={() => setShares((parseInt(shares) + 1).toString())}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-r-md hover:border-gray-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  
                  <div className="flex justify-center space-x-2 mt-2">
                    {[5, 10, 50, 100].map((amount) => (
                      <button 
                        key={amount}
                        onClick={() => setShares((parseInt(shares) + amount).toString())}
                        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:border-gray-500 transition-colors"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Expiration */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm text-gray-600">Set Expiration</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="expiration-toggle" 
                        className="sr-only"
                        checked={expirationToggle}
                        onChange={(e) => setExpirationToggle(e.target.checked)}
                      />
                      <label htmlFor="expiration-toggle" className="block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer">
                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform transform ${expirationToggle ? 'translate-x-5' : ''}`}></div>
                      </label>
                    </div>
                  </div>
                  
                  {expirationToggle && (
                    <select className="w-full bg-gray-100 border border-gray-300 rounded-md py-2.5 px-3 text-sm mt-2 focus:outline-none focus:border-purple-600">
                      <option>24 hours</option>
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>Custom date</option>
                    </select>
                  )}
                </div>
                
                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Potential Payout</span>
                    <span className="font-medium text-green-400">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fees (2%)</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
                
                {/* Action Button */}
                <button className="w-full bg-gradient-gold text-dark font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity transform hover:-translate-y-0.5 transition-transform">
                  Place Order
                </button>
              </div>
              
              {/* Trading Tips */}
              <div className="p-5 bg-gray-100/50">
                <h3 className="text-sm font-medium mb-3">交易提示</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  {isAutomotiveMarket ? (
                    <>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                        <span>如果你认为该事件会发生，请购买"Yes"</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                        <span>价格反映事件发生的概率 ({marketData.probability}¢ = {marketData.probability}% 可能性)</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                        <span>市场将在 {marketData.date} 截止并结算</span>
                      </li>
                    </>
                  ) : leadingCandidate ? (
                    <>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                    <span>Buy "Yes" if you think {leadingCandidate.name} will win the 2024 Presidential Election</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                    <span>Prices reflect the probability of the outcome ({leadingCandidate.probability}¢ = {leadingCandidate.probability}% chance)</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faLightbulb} className="text-gold mt-0.5 mr-2" />
                    <span>Market closes at 11:59 PM ET on November 4, 2024</span>
                  </li>
                    </>
                  ) : null}
                </ul>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;