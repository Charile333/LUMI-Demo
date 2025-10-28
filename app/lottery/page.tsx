'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LotteryPage() {
  const { t } = useTranslation();
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
      
      <div className="bg-[#121212] text-white font-sans antialiased -mt-56">
      {/* SOON Banner */}
      <div className="bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#b8860b] py-3 border-b border-[#d4af37]/50">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎰</span>
            <div className="text-center">
              <p className="text-[#121212] font-bold text-lg tracking-wider">SOON - 2026 Q1</p>
              <p className="text-[#121212]/80 text-xs font-medium">Blockchain Gaming Platform Coming Soon</p>
            </div>
            <span className="text-2xl">🎲</span>
          </div>
        </div>
      </div>
      
      {/* Responsible Gambling Notice */}
      <div className="bg-[#1a1a1a] border-b border-[#b8860b]/30 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-gray-300 flex items-center justify-center md:justify-start">
            <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
              {t('lottery.responsibleGambling')}
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.responsibleGamblingLink')}</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.helpCenter')}</a>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
              <div className="flex items-center h-6">
                <Image 
                  src="/image/LUMI-golden.png" 
                  alt="LUMI" 
                  width={180} 
                  height={30}
                  className="object-contain"
                />
              </div>
            <div className="hidden md:block h-4 w-px bg-gray-700 mx-2"></div>
            <nav className="hidden md:flex space-x-6 text-sm">
                <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">{t('lottery.games')}</a>
                <Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.sports')}</Link>
                <Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.liveCasino')}</Link>
                <Link href="/tournaments" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.tournaments')}</Link>
                <Link href="/promotions" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.promotions')}</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
                <Link href="/markets" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                  <i className="fa fa-arrow-left text-[#b8860b]"></i>
                  <span>{t('lottery.backToMarket')}</span>
                </Link>
                
              <div className="relative">
                <button className="text-gray-300 hover:text-white transition-colors relative">
                  <i className="fa fa-bell-o"></i>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-[#121212] text-xs rounded-full flex items-center justify-center">3</span>
                </button>
              </div>
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              {/* 语言切换器 */}
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
                <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div>
                  <div className="text-right">
                      <p className="text-xs text-gray-400">{t('lottery.balance')}</p>
                      <p className="text-sm font-medium">4.872 ETH</p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#b8860b]/30">
                    <img src="https://picsum.photos/id/1005/100/100" alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                </Link>
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
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 max-w-lg" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{t('lottery.banner.title')}</h1>
              <p className="text-gray-300 mb-4 max-w-md">{t('lottery.banner.description')}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/lottery-game" className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
                  <i className="fa fa-ticket"></i>
                  <span>Lottery</span>
                </Link>
                <Link href="/lottery-game" className="bg-transparent border-2 border-[#b8860b] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#b8860b]/10 transition-colors flex items-center space-x-2">
                  <i className="fa fa-gamepad"></i>
                  <span>Explore Games</span>
                </Link>
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
                  <h2 className="text-lg font-semibold">{t('lottery.gameCategories.title')}</h2>
                </div>
                
                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-[#b8860b]/30 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                      <i className="fa fa-dice text-[#121212]"></i>
                    </div>
                    <span className="text-sm font-medium">{t('lottery.gameCategories.slots')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('lottery.gameCategories.slotsCount')}</span>
                  </button>
                  
                  <Link href="/live-casino" className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-play-circle-o text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">{t('lottery.gameCategories.liveCasinoTitle')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('lottery.gameCategories.liveCasinoCount')}</span>
                  </Link>
                  
                  <Link href="/sports-betting" className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-trophy text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">{t('lottery.gameCategories.sportsbook')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('lottery.gameCategories.sportsbookCount')}</span>
                  </Link>
                  
                  <Link href="/tournaments" className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3">
                      <i className="fa fa-users text-[#b8860b]"></i>
                    </div>
                    <span className="text-sm font-medium">{t('lottery.gameCategories.tournamentsTitle')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('lottery.gameCategories.tournamentsCount')}</span>
                  </Link>
                  
                  <button className="flex flex-col items-center justify-center p-4 bg-[#121212] rounded-lg border border-[#b8860b]/50 transition-all duration-300 hover:border-[#b8860b] hover:shadow-lg hover:shadow-[#b8860b]/20 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-1 right-1 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] text-xs font-bold px-2 py-0.5 rounded">{t('lottery.featured.new')}</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                      <i className="fa fa-spade text-[#121212]"></i>
                    </div>
                    <span className="text-sm font-medium">{t('lottery.gameCategories.poker')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('lottery.gameCategories.pokerCount')}</span>
                  </button>
                </div>
              </div>
              
              {/* Featured Games */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('lottery.featured.title')}</h2>
                  <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('lottery.featured.viewAll')}</a>
        </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Featured Game 1 - Texas Hold'em Poker */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-[#b8860b]/40 overflow-hidden transition-all duration-300 hover:border-[#b8860b] hover:shadow-xl hover:shadow-[#b8860b]/20 hover:-translate-y-2 relative">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1054/600/300" alt="Texas Hold'em Poker" className="w-full h-40 object-cover brightness-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] text-xs font-bold px-2 py-1 rounded shadow-lg">{t('lottery.featured.new')}</div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center">
                          <i className="fa fa-spade text-[#121212]"></i>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center">
                          <i className="fa fa-heart text-[#121212]"></i>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center">
                          <i className="fa fa-diamond text-[#121212]"></i>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center">
                          <i className="fa fa-club text-[#121212]"></i>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-[#d4af37]">{t('lottery.featured.texasHoldem')}</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.9/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{t('lottery.featured.texasHoldemDesc')}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <i className="fa fa-circle text-[6px]"></i>
                          {t('lottery.featured.texasHoldemPlayers')}
                        </span>
                        <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#b8860b]/30">
                          {t('lottery.featured.playNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Featured Game 2 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1050/600/300" alt="Crypto Riches Slot" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-1 rounded">{t('lottery.featured.hot')}</div>
            </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{t('lottery.featured.cryptoRiches')}</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.8/5</span>
            </div>
            </div>
                      <p className="text-xs text-gray-400 mb-3">{t('lottery.featured.cryptoRichesDesc')}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{t('lottery.featured.cryptoRichesMaxWin')}</span>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          {t('lottery.featured.playNow')}
                        </button>
            </div>
          </div>
        </div>
                  
                  {/* Featured Game 3 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src="https://picsum.photos/id/1053/600/300" alt="Blockchain Blackjack" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 bg-[#121212] text-[#b8860b] text-xs font-bold px-2 py-1 rounded border border-[#b8860b]/30">{t('lottery.featured.live')}</div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{t('lottery.featured.blockchainBlackjack')}</h3>
                        <div className="flex items-center">
                          <i className="fa fa-star text-[#b8860b] text-xs"></i>
                          <span className="text-xs ml-1">4.9/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{t('lottery.featured.blockchainBlackjackDesc')}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{t('lottery.featured.blackjackMinBet')}</span>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          {t('lottery.featured.playNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

      {/* Live Sports Events */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('lottery.liveSports.title')}</h2>
                  <Link href="/sports-betting" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('lottery.liveSports.viewAll')}</Link>
                </div>
                
                <div className="space-y-4">
                  {/* Sport Category - Football */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-3 bg-[#121212] border-b border-gray-800 flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <i className="fa fa-futbol-o text-xs text-white"></i>
                      </div>
                      <span className="font-medium">{t('lottery.liveSports.football')}</span>
                      <span className="ml-2 text-xs text-gray-500">({t('lottery.liveSports.footballLive')})</span>
                    </div>
                    
                    <div className="divide-y divide-gray-800">
                      {/* Event 1 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">{t('lottery.liveSports.premierLeague')} • {t('lottery.liveSports.live')}</span>
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
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+42 {t('lottery.liveSports.moreMarkets')}</a>
                        </div>
                      </div>
                      
                      {/* Event 2 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">{t('lottery.liveSports.laLiga')} • {t('lottery.liveSports.live')}</span>
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
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+38 {t('lottery.liveSports.moreMarkets')}</a>
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
                      <span className="font-medium">{t('lottery.liveSports.basketball')}</span>
                      <span className="ml-2 text-xs text-gray-500">({t('lottery.liveSports.basketballLive')})</span>
                    </div>
                    
                    <div className="divide-y divide-gray-800">
                      {/* Event 1 */}
                      <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">{t('lottery.liveSports.nba')} • {t('lottery.liveSports.live')}</span>
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
                          <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+56 {t('lottery.liveSports.moreMarkets')}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

      {/* Provably Fair Section */}
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('lottery.provablyFair.title')}</h2>
                </div>
                
                <div className="p-5">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-4">
                        {t('lottery.provablyFair.description')}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{t('lottery.provablyFair.transparentTitle')}</h3>
                            <p className="text-xs text-gray-400">{t('lottery.provablyFair.transparentDesc')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{t('lottery.provablyFair.verifiableTitle')}</h3>
                            <p className="text-xs text-gray-400">{t('lottery.provablyFair.verifiableDesc')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <i className="fa fa-check text-[#121212] text-xs"></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{t('lottery.provablyFair.instantTitle')}</h3>
                            <p className="text-xs text-gray-400">{t('lottery.provablyFair.instantDesc')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <a href="#" className="text-[#b8860b] hover:text-[#d4af37] text-sm flex items-center">
                        <i className="fa fa-link mr-1"></i>
                        {t('lottery.provablyFair.learnMore')}
                      </a>
                    </div>
                    
                    <div className="w-full md:w-48 h-48 md:h-auto">
                      <div className="bg-[#121212] rounded-lg border border-gray-800 p-4 h-full flex flex-col justify-center items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                          <i className="fa fa-shield text-[#121212] text-2xl"></i>
                        </div>
                        <h3 className="font-medium mb-1 text-center">{t('lottery.provablyFair.licensed')}</h3>
                        <p className="text-xs text-gray-400 text-center mb-3">{t('lottery.provablyFair.licenseNumber')}</p>
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
                    <h2 className="text-lg font-semibold">{t('lottery.betSlip.title')}</h2>
                    <button onClick={clearBetslip} className="text-sm text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.betSlip.clearAll')}</button>
                  </div>
                  
                  {!showBetslip ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#121212] mx-auto flex items-center justify-center mb-3">
                        <i className="fa fa-ticket text-gray-600 text-2xl"></i>
                      </div>
                      <p className="text-gray-500 mb-2">{t('lottery.betSlip.empty')}</p>
                      <p className="text-xs text-gray-600">{t('lottery.betSlip.emptyDesc')}</p>
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
                            <label className="block text-xs text-gray-500 mb-1">{t('lottery.betSlip.stake')}</label>
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
                            <span className="text-gray-400">{t('lottery.betSlip.totalStake')}</span>
                            <span className="font-medium">{betStake.toFixed(2)} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{t('lottery.betSlip.potentialWin')}</span>
                            <span className="text-[#10b981] font-medium">{(betStake * (selectedBet?.odds || 0)).toFixed(2)} ETH</span>
                          </div>
                        </div>
                        
                        <button className="w-full py-2.5 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold rounded-lg hover:opacity-90 transition-opacity">
                          {t('lottery.betSlip.placeBet')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Account Balance */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('lottery.account.title')}</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400">{t('lottery.account.availableBalance')}</span>
                      <span className="text-xl font-bold">4.872 ETH</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-plus text-[#b8860b]"></i>
                        <span>{t('lottery.account.deposit')}</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-minus text-gray-400"></i>
                        <span>{t('lottery.account.withdraw')}</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-4">
                      <h3 className="text-sm font-medium mb-3">{t('lottery.account.recentTransactions')}</h3>
                      
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {/* Transaction 1 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center mr-3">
                              <i className="fa fa-arrow-down text-[#10b981]"></i>
                            </div>
                            <div>
                              <p className="text-sm">{t('lottery.account.transactionDeposit')}</p>
                              <p className="text-xs text-gray-500">{t('lottery.account.today')}, 14:32</p>
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
                              <p className="text-sm">{t('lottery.account.transactionBet')}</p>
                              <p className="text-xs text-gray-500">{t('lottery.account.yesterday')}, 20:15</p>
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
                              <p className="text-sm">{t('lottery.account.transactionWinnings')}</p>
                              <p className="text-xs text-gray-500">{t('lottery.account.yesterday')}, 18:47</p>
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
                              <p className="text-sm">{t('lottery.account.transactionWithdrawal')}</p>
                              <p className="text-xs text-gray-500">Jun 10, 11:23</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#ef4444]">-1.50 ETH</span>
                        </div>
                      </div>
                      
                      <a href="#" className="text-center block text-sm text-[#b8860b] hover:text-[#d4af37] mt-3">
                        {t('lottery.account.viewAll')}
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Promotions */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('lottery.promotionsCard.title')}</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="relative rounded-lg overflow-hidden mb-3">
                        <img src="https://picsum.photos/id/1060/400/200" alt="Welcome Bonus" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="font-medium text-white">{t('lottery.promotionsCard.welcomeBonus')}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{t('lottery.promotionsCard.welcomeBonusDesc')}</p>
                      <button className="w-full py-1.5 bg-[#121212] rounded-lg border border-[#b8860b]/30 text-[#b8860b] text-xs font-medium hover:bg-[#b8860b]/10 transition-colors">
                        {t('lottery.promotionsCard.claimNow')}
                      </button>
                    </div>
                    
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="relative rounded-lg overflow-hidden mb-3">
                        <img src="https://picsum.photos/id/1062/400/200" alt="Weekly Cashback" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="font-medium text-white">{t('lottery.promotionsCard.weeklyCashback')}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{t('lottery.promotionsCard.weeklyCashbackDesc')}</p>
                      <button className="w-full py-1.5 bg-[#121212] rounded-lg border border-gray-700 text-gray-300 text-xs font-medium hover:border-[#b8860b]/30 hover:text-[#b8860b] transition-colors">
                        {t('lottery.promotionsCard.learnMore')}
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
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.responsibleBar.title')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.responsibleBar.helpLink')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.responsibleBar.selfExclusion')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.responsibleBar.ageVerification')}</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{t('lottery.responsibleBar.ageLimit')}</span>
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
                <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('lottery.footer.brandName')}</div>
                <p className="text-gray-400 text-sm mb-4 max-w-md">
                  {t('lottery.footer.brandDescription')}
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
                </div>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.footer.gamesTitle')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.slotsLink')}</a></li>
                  <li><Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.liveCasinoLink')}</Link></li>
                  <li><Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.sportsBettingLink')}</Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.esportsLink')}</a></li>
                  <li><Link href="/tournaments" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.tournamentsLink')}</Link></li>
              </ul>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.footer.supportTitle')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.helpCenterLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.faqLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.contactLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.responsibleGamblingLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.termsConditionsLink')}</a></li>
              </ul>
            </div>
              
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.footer.legalTitle')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.licenseInfoLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.privacyPolicyLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.termsServiceLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.cookiePolicyLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.footer.jurisdictionLink')}</a></li>
                </ul>
            </div>
          </div>
          
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">{t('lottery.footer.copyrightText')}</p>
              <p className="text-gray-500 text-xs mt-2 md:mt-0">
                {t('lottery.footer.disclaimer')}
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

