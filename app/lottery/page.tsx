'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function LotteryPage() {
  const [showBetslip, setShowBetslip] = useState(false);
  const [betStake, setBetStake] = useState(0.1);
  const [selectedBet, setSelectedBet] = useState<any>(null);

  useEffect(() => {
    // 不再需要修改body样式，通过CSS处理
  }, []);

  const clearBetslip = () => {
    setShowBetslip(false);
    setSelectedBet(null);
  };

  const addToBetslip = (bet: any) => {
    setSelectedBet(bet);
    setShowBetslip(true);
  };

  return (
    <>
      <Head>
        <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="bg-[#121212] text-white font-sans antialiased">
      {/* Responsible Gambling Notice */}
      <div className="bg-[#1a1a1a] border-b border-[#b8860b]/30 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-gray-300 flex items-center justify-center md:justify-start">
            <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
              18+ Gamble Responsibly. This platform operates under license number GL-2023-004. Terms apply.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Responsible Gambling</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Help Center</a>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
              <div className="text-[#b8860b] text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>LegitChain</div>
            <div className="hidden md:block h-4 w-px bg-gray-700 mx-2"></div>
            <nav className="hidden md:flex space-x-6 text-sm">
                <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">Games</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">Sports</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">Live Casino</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">Tournaments</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">Promotions</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                  <i className="fa fa-arrow-left text-[#b8860b]"></i>
                  <span>返回市场</span>
                </Link>
                
                <Link href="/lottery-game" className="flex items-center space-x-2 bg-[#1a1a1a] border border-[#b8860b]/30 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                  <i className="fa fa-ticket text-[#b8860b]"></i>
                  <span>彩票游戏</span>
                </Link>
                
              <div className="relative">
                <button className="text-gray-300 hover:text-white transition-colors relative">
                  <i className="fa fa-bell-o"></i>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-[#121212] text-xs rounded-full flex items-center justify-center">3</span>
                </button>
              </div>
              
              <div className="h-6 w-px bg-gray-700"></div>
              
                <div className="flex items-center space-x-3">
                  <div>
                  <div className="text-right">
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-sm font-medium">4.872 ETH</p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#b8860b]/30">
                    <img src="https://picsum.photos/id/1005/100/100" alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
            </div>
            
            <button className="md:hidden text-gray-300 hover:text-white">
              <i className="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Welcome Banner */}
          <div className="relative rounded-xl overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#121212]/70 to-transparent z-10"></div>
            <img src="https://picsum.photos/id/1048/1600/400" alt="Premium Gaming Experience" className="w-full h-48 md:h-64 object-cover" />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-10">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 max-w-lg" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Premium Blockchain Gaming Experience</h1>
              <p className="text-gray-300 mb-4 max-w-md">Provably fair games with instant payouts and transparent operations on the blockchain</p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Explore Games
                </button>
                <button className="bg-transparent border border-gray-600 text-white font-medium px-5 py-2 rounded-lg hover:border-[#b8860b]/50 transition-colors">
                  Deposit Funds
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Game Categories & Games */}
            <div className="lg:col-span-3 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
              {/* Game Categories */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">Game Categories</h2>
                </div>
                
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-[#b8860b]/30 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                      <i className="fa fa-dice text-[#121212]"></i>
                    </div>
                    <span className="text-sm font-medium">Slots</span>
                    <span className="text-xs text-gray-500 mt-1">48 Games</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-play-circle-o text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">Live Casino</span>
                    <span className="text-xs text-gray-500 mt-1">12 Tables</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-trophy text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">Sportsbook</span>
                    <span className="text-xs text-gray-500 mt-1">24 Sports</span>
                  </button>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-users text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">Tournaments</span>
                    <span className="text-xs text-gray-500 mt-1">7 Active</span>
                  </button>
                </div>
              </div>
              
              {/* Featured Games */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Games</h2>
                  <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">View All</a>
        </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Featured Game 1 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1050/600/300" alt="Crypto Riches Slot" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-1 rounded">HOT</div>
            </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Crypto Riches</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.8/5</span>
            </div>
            </div>
                      <p className="text-xs text-gray-400 mb-3">Slot • 243 Ways • 96.5% RTP</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Max Win: 10,000x</span>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          Play Now
                        </button>
            </div>
          </div>
        </div>
                  
                  {/* Featured Game 2 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1053/600/300" alt="Blockchain Blackjack" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 bg-[#121212] text-[#b8860b] text-xs font-bold px-2 py-1 rounded border border-[#b8860b]/30">LIVE</div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Blockchain Blackjack</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.9/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Table • Live Dealer • 99.5% RTP</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Min Bet: 0.001 ETH</span>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          Play Now
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Featured Game 3 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1054/600/300" alt="Esports Betting" className="w-full h-40 object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Esports Arena</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.7/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Sportsbook • 12 Leagues • Live Bets</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">148 Events Today</span>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          Bet Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

      {/* Live Sports Events */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Live Sports Events</h2>
                  <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">View All</a>
                </div>
                
                <div className="space-y-4">
                  {/* Sport Category - Football */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-3 bg-[#121212] border-b border-gray-800 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <i className="fa fa-futbol-o text-xs text-white"></i>
                      </div>
                      <span className="font-medium">Football</span>
                      <span className="ml-2 text-xs text-gray-500">(24 Live Events)</span>
                    </div>
                    
                    <div className="divide-y divide-gray-800">
                      {/* Event 1 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">Premier League • Live</span>
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">1-1</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                              <span className="text-xs">MU</span>
                            </div>
                            <span className="text-sm font-medium">Manchester United</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">63&apos;</div>
                          
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-right">Liverpool</span>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                              <span className="text-xs">LIV</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => addToBetslip({ match: 'Manchester United vs Liverpool', selection: 'MU Win', odds: 2.45 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            2.45
                          </button>
                          <button 
                            onClick={() => addToBetslip({ match: 'Manchester United vs Liverpool', selection: 'Draw', odds: 3.20 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            3.20
                          </button>
                          <button 
                            onClick={() => addToBetslip({ match: 'Manchester United vs Liverpool', selection: 'LIV Win', odds: 2.85 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            2.85
                          </button>
                        </div>
                        
                        <div className="mt-3 text-center">
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+42 More Markets</a>
                        </div>
                      </div>
                      
                      {/* Event 2 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">La Liga • Live</span>
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">0-2</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                              <span className="text-xs">BAR</span>
                            </div>
                            <span className="text-sm font-medium">Barcelona</span>
                    </div>
                    
                          <div className="text-xs text-gray-500">37&apos;</div>
                          
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-right">Real Madrid</span>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                              <span className="text-xs">RM</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => addToBetslip({ match: 'Barcelona vs Real Madrid', selection: 'BAR Win', odds: 3.75 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            3.75
                          </button>
                          <button 
                            onClick={() => addToBetslip({ match: 'Barcelona vs Real Madrid', selection: 'Draw', odds: 3.50 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            3.50
                          </button>
                          <button 
                            onClick={() => addToBetslip({ match: 'Barcelona vs Real Madrid', selection: 'RM Win', odds: 1.90 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            1.90
                          </button>
                        </div>
                        
                        <div className="mt-3 text-center">
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+38 More Markets</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sport Category - Basketball */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-3 bg-[#121212] border-b border-gray-800 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <i className="fa fa-basketball-ball text-xs text-white"></i>
                      </div>
                      <span className="font-medium">Basketball</span>
                      <span className="ml-2 text-xs text-gray-500">(18 Live Events)</span>
                    </div>
                    
                    <div className="divide-y divide-gray-800">
                      {/* Event 1 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">NBA • Live</span>
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">87-93</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                              <span className="text-xs">LAL</span>
                            </div>
                            <span className="text-sm font-medium">Lakers</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">Q3 04:25</div>
                          
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-right">Warriors</span>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                              <span className="text-xs">GSW</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => addToBetslip({ match: 'Lakers vs Warriors', selection: 'LAL Win', odds: 2.10 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            2.10
                    </button>
                          <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                            -
                    </button>
                          <button 
                            onClick={() => addToBetslip({ match: 'Lakers vs Warriors', selection: 'GSW Win', odds: 1.75 })}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                          >
                            1.75
                    </button>
                  </div>
                  
                        <div className="mt-3 text-center">
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+56 More Markets</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

      {/* Provably Fair Section */}
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">Provably Fair Gaming</h2>
                </div>
                
                <div className="p-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-4">
                        All our games operate on a provably fair system utilizing blockchain technology. This ensures every outcome is random, transparent, and verifiable by anyone.
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Transparent Outcomes</h3>
                            <p className="text-xs text-gray-400">Every game result is recorded on the blockchain for full transparency.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Verifiable Results</h3>
                            <p className="text-xs text-gray-400">Players can independently verify the fairness of each game outcome.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Instant Payouts</h3>
                            <p className="text-xs text-gray-400">Winnings are automatically sent to your wallet without delays.</p>
                          </div>
                        </div>
                      </div>
                      
                      <a href="#" className="text-[#b8860b] hover:text-[#d4af37] text-sm flex items-center">
                        <i className="fa fa-link mr-1"></i>
                        Learn More About Our Fairness
                      </a>
                    </div>
                    
                    <div className="w-full md:w-48 h-48 md:h-auto">
                      <div className="bg-[#121212] rounded-lg border border-gray-800 p-4 h-full flex flex-col justify-center items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                          <i className="fa fa-shield text-[#121212] text-2xl"></i>
                        </div>
                        <h3 className="font-medium mb-1 text-center">Licensed & Regulated</h3>
                        <p className="text-xs text-gray-400 text-center mb-3">Operating under gaming license GL-2023-004</p>
                        <div className="flex space-x-2">
                          <img src="https://picsum.photos/id/101/60/30" alt="Regulatory Body" className="h-6 opacity-70" />
                          <img src="https://picsum.photos/id/102/60/30" alt="Regulatory Body" className="h-6 opacity-70" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Bet Slip & Account */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Bet Slip */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Bet Slip</h2>
                    <button onClick={clearBetslip} className="text-sm text-gray-400 hover:text-[#b8860b] transition-colors">Clear All</button>
                  </div>
                  
                  {!showBetslip ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#121212] mx-auto flex items-center justify-center mb-3">
                        <i className="fa fa-ticket text-gray-600 text-2xl"></i>
                      </div>
                      <p className="text-gray-500 mb-2">Your bet slip is empty</p>
                      <p className="text-xs text-gray-600">Add selections to get started</p>
                    </div>
                  ) : (
                    <div>
                      <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto scrollbar-hide">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs text-gray-400">Premier League</p>
                              <p className="text-sm font-medium">{selectedBet?.match}</p>
                            </div>
                            <button onClick={clearBetslip} className="text-gray-600 hover:text-gray-400">
                              <i className="fa fa-times"></i>
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm bg-[#121212] px-2 py-1 rounded border border-gray-700">{selectedBet?.selection}</span>
                            <span className="text-sm font-medium">{selectedBet?.odds}</span>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-xs text-gray-500 mb-1">Stake (ETH)</label>
                            <div className="flex items-center">
                              <button 
                                onClick={() => setBetStake(Math.max(0.01, betStake - 0.05))}
                                className="w-8 h-8 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-l-md hover:border-[#b8860b]/50 transition-colors"
                              >
                                <i className="fa fa-minus text-xs"></i>
                              </button>
                              <input 
                                type="text" 
                                value={betStake.toFixed(2)}
                                onChange={(e) => setBetStake(parseFloat(e.target.value) || 0)}
                                className="flex-1 bg-[#121212] border-y border-gray-700 py-2 px-3 text-center text-sm focus:outline-none focus:border-[#b8860b]" 
                              />
                              <button 
                                onClick={() => setBetStake(betStake + 0.05)}
                                className="w-8 h-8 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-r-md hover:border-[#b8860b]/50 transition-colors"
                              >
                                <i className="fa fa-plus text-xs"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border-t border-gray-800">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Stake</span>
                            <span className="font-medium">{betStake.toFixed(2)} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Potential Win</span>
                            <span className="text-[#10b981] font-medium">{(betStake * (selectedBet?.odds || 0)).toFixed(2)} ETH</span>
                          </div>
                        </div>
                        
                        <button className="w-full py-2.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold rounded-lg hover:opacity-90 transition-opacity">
                          Place Bet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Account Balance */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">My Account</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400">Available Balance</span>
                      <span className="text-xl font-bold">4.872 ETH</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-plus text-[#b8860b]"></i>
                        <span>Deposit</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-minus text-gray-400"></i>
                        <span>Withdraw</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-4">
                      <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
                      
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {/* Transaction 1 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center mr-3">
                              <i className="fa fa-arrow-down text-[#10b981]"></i>
                            </div>
                            <div>
                              <p className="text-sm">Deposit</p>
                              <p className="text-xs text-gray-500">Today, 14:32</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#10b981]">+2.50 ETH</span>
                        </div>
                        
                        {/* Transaction 2 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center mr-3">
                              <i className="fa fa-arrow-up text-[#ef4444]"></i>
                            </div>
                            <div>
                              <p className="text-sm">Bet Placement</p>
                              <p className="text-xs text-gray-500">Yesterday, 20:15</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#ef4444]">-0.25 ETH</span>
                        </div>
                        
                        {/* Transaction 3 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center mr-3">
                              <i className="fa fa-trophy text-[#10b981]"></i>
                            </div>
                            <div>
                              <p className="text-sm">Winnings</p>
                              <p className="text-xs text-gray-500">Yesterday, 18:47</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#10b981]">+0.87 ETH</span>
                        </div>
                        
                        {/* Transaction 4 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center mr-3">
                              <i className="fa fa-arrow-up text-[#ef4444]"></i>
                            </div>
                            <div>
                              <p className="text-sm">Withdrawal</p>
                              <p className="text-xs text-gray-500">Jun 10, 11:23</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#ef4444]">-1.50 ETH</span>
                        </div>
                      </div>
                      
                      <a href="#" className="text-center block text-sm text-[#b8860b] hover:text-[#d4af37] mt-3">
                        View All Transactions
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Promotions */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">Current Promotions</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="relative rounded-lg overflow-hidden mb-3">
                        <img src="https://picsum.photos/id/1060/400/200" alt="Welcome Bonus" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="font-medium text-white">Welcome Bonus</h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">100% up to 5 ETH on your first deposit</p>
                      <button className="w-full py-1.5 bg-[#121212] rounded-lg border border-[#b8860b]/30 text-[#b8860b] text-xs font-medium hover:bg-[#b8860b]/10 transition-colors">
                        Claim Now
                      </button>
                    </div>
                    
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="relative rounded-lg overflow-hidden mb-3">
                        <img src="https://picsum.photos/id/1062/400/200" alt="Weekly Cashback" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="font-medium text-white">Weekly Cashback</h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Get 10% cashback on net losses every week</p>
                      <button className="w-full py-1.5 bg-[#121212] rounded-lg border border-gray-700 text-gray-300 text-xs font-medium hover:border-[#b8860b]/30 hover:text-[#b8860b] transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Responsible Gambling Footer Bar */}
        <div className="bg-[#1a1a1a] border-t border-gray-800 py-4 mt-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0">
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Responsible Gambling</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Gambling Addiction Help</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Self-Exclusion</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">Age Verification</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">18+ Only</span>
                <div className="flex space-x-3">
                  <img src="https://picsum.photos/id/103/40/20" alt="Age Verification" className="h-5 opacity-70" />
                  <img src="https://picsum.photos/id/104/40/20" alt="Secure Gaming" className="h-5 opacity-70" />
                  <img src="https://picsum.photos/id/105/40/20" alt="Fair Gaming" className="h-5 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Footer */}
        <footer className="bg-[#1a1a1a] border-t border-gray-800 py-10">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>LegitChain</div>
                <p className="text-gray-400 text-sm mb-4 max-w-md">
                  A licensed blockchain gambling platform offering provably fair games, transparent operations, and instant payouts. Gamble responsibly.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
                </div>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Games</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Slots</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Live Casino</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Sports Betting</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Esports</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Tournaments</a></li>
              </ul>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">FAQs</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Responsible Gambling</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">License Information</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">Jurisdiction Restrictions</a></li>
                </ul>
            </div>
          </div>
          
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">&copy; 2023 LegitChain. All rights reserved.</p>
              <p className="text-gray-500 text-xs mt-2 md:mt-0">
                Gambling can be addictive. Play responsibly. Licensed and regulated by the Gaming Authority under license number GL-2023-004.
              </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
    </>
  );
}

