'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LiveCasinoPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="bg-[#121212] text-white font-sans antialiased -mt-56">
      {/* SOON Banner */}
      <div className="bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#b8860b] py-3 border-b border-[#d4af37]/50">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎰</span>
            <div className="text-center">
              <p className="text-[#121212] font-bold text-lg tracking-wider">{t('liveCasino.banner.soon')} - {t('liveCasino.banner.date')}</p>
              <p className="text-[#121212]/80 text-xs font-medium">{t('liveCasino.banner.title')}</p>
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
            {t('liveCasino.responsibleGambling')}
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.responsibleGamblingLink')}</a>
            <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.helpCenter')}</a>
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
              <Link href="/lottery" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('liveCasino.nav.games')}</Link>
              <Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('liveCasino.nav.sports')}</Link>
              <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">{t('liveCasino.nav.liveCasino')}</a>
              <Link href="/tournaments" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('liveCasino.nav.tournaments')}</Link>
              <Link href="/promotions" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('liveCasino.nav.promotions')}</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/markets" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-arrow-left text-[#b8860b]"></i>
                <span>{t('liveCasino.nav.backToMarkets')}</span>
              </Link>
              
              <div className="relative">
                <button className="text-gray-300 hover:text-white transition-colors relative">
                  <i className="fa fa-bell-o"></i>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-[#121212] text-xs rounded-full flex items-center justify-center">1</span>
                </button>
              </div>
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('liveCasino.balance')}</p>
                    <p className="text-sm font-medium">12.547 ETH</p>
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
        {/* Live Casino Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{t('liveCasino.title')}</h1>
                <p className="text-gray-400 mt-1">{t('liveCasino.subtitle')}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <div className="relative">
                  <input type="text" placeholder={t('liveCasino.searchTables')} className="bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:border-[#b8860b] w-full md:w-64" />
                  <i className="fa fa-search absolute left-3 top-2 text-gray-500"></i>
                </div>
              
              <button className="bg-[#1a1a1a] border border-gray-700 rounded-md p-1.5 hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-filter text-gray-400"></i>
              </button>
            </div>
          </div>
          
          {/* Featured Live Table */}
          <div className="relative rounded-xl overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#121212]/60 to-transparent z-10"></div>
            <img src="https://picsum.photos/id/1059/1600/400" alt="Premium Blackjack Table" className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center mb-3">
                <span className="flex items-center bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                  {t('liveCasino.featured.live').toUpperCase()}
                </span>
                <span className="text-gray-300 text-sm">{t('liveCasino.featured.premiumBlackjack')} • {t('liveCasino.featured.table')} #128</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{t('liveCasino.featured.vipBlackjackLounge')}</h2>
              <p className="text-gray-300 mb-4 max-w-2xl">{t('liveCasino.featured.description')}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <img src="https://picsum.photos/id/1012/100/100" alt="Player" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" />
                    <img src="https://picsum.photos/id/1025/100/100" alt="Player" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" />
                    <img src="https://picsum.photos/id/1074/100/100" alt="Player" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" />
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-medium">+5</div>
                  </div>
                  <span className="text-sm">8 {t('liveCasino.featured.players')}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">{t('liveCasino.featured.minBet')}:</span>
                  <span className="text-sm font-medium">0.1 ETH</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">{t('liveCasino.featured.maxBet')}:</span>
                  <span className="text-sm font-medium">5 ETH</span>
                </div>
                
                <button className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ml-auto">
                  {t('liveCasino.featured.joinTable')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Casino Categories & Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('liveCasino.categories.title')}</h2>
                </div>
              
              <div className="p-2">
                <ul className="space-y-1">
                  {[
                    { id: 'all', icon: 'fa-play-circle-o', name: t('liveCasino.categories.allLive'), count: 42 },
                    { id: 'blackjack', icon: 'fa-cards', name: t('liveCasino.categories.blackjack'), count: 12 },
                    { id: 'roulette', icon: 'fa-diamond', name: t('liveCasino.categories.roulette'), count: 8 },
                    { id: 'baccarat', icon: 'fa-th', name: t('liveCasino.categories.baccarat'), count: 6 },
                    { id: 'gameshows', icon: 'fa-sort-numeric-asc', name: t('liveCasino.categories.gameShows'), count: 5 },
                    { id: 'poker', icon: 'fa-puzzle-piece', name: t('liveCasino.categories.poker'), count: 4 },
                    { id: 'other', icon: 'fa-child', name: t('liveCasino.categories.other'), count: 7 }
                  ].map(cat => (
                    <li key={cat.id}>
                      <a 
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveCategory(cat.id); }}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          activeCategory === cat.id 
                            ? 'bg-[#121212] border-l-4 border-[#b8860b] pl-3 -ml-4' 
                            : 'hover:bg-[#121212]'
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`fa ${cat.icon} ${activeCategory === cat.id ? 'text-[#b8860b]' : 'text-gray-400'} mr-3`}></i>
                          <span>{cat.name}</span>
                        </div>
                        <span className="bg-[#121212] text-xs px-1.5 py-0.5 rounded-full">{cat.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
                {/* Filters */}
                <div className="p-5 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">{t('liveCasino.filters.title')}</h3>
                  
                  {/* Bet Limits */}
                  <div className="mb-5">
                    <h4 className="text-xs text-gray-400 mb-2">{t('liveCasino.filters.betLimits')}</h4>
                    <div className="space-y-2">
                      {[t('liveCasino.filters.low'), t('liveCasino.filters.medium'), t('liveCasino.filters.high'), t('liveCasino.filters.vip')].map((limit, i) => (
                      <label key={i} className="flex items-center">
                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-[#121212] border-gray-700 rounded text-[#b8860b] focus:ring-0" defaultChecked={i === 1 || i === 2} />
                        <span className="ml-2 text-sm">{limit}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                  <button className="w-full mt-5 py-2 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                    {t('liveCasino.filters.apply')}
                  </button>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Live Casino Tables */}
          <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
            {/* Blackjack Tables */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('liveCasino.games.blackjack')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('liveCasino.games.viewAll')}</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 1, name: 'Classic Blackjack', table: '#304', dealer: 'Sarah', players: 6, minBet: '0.01', maxBet: '0.5', img: '1063' },
                  { id: 2, name: 'VIP Blackjack', table: '#108', dealer: 'Michael', players: 3, minBet: '0.2', maxBet: '2', img: '1068' },
                  { id: 3, name: 'Speed Blackjack', table: '#512', dealer: 'Emma', players: 8, minBet: '0.005', maxBet: '0.1', img: '1071' }
                ].map(table => (
                  <div key={table.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src={`https://picsum.photos/id/${table.img}/600/300`} alt={table.name} className="w-full h-40 object-cover" />
                      <div className="absolute top-2 left-2 flex items-center bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                        LIVE
                      </div>
                      <div className="absolute top-2 right-2 bg-[#121212]/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Table {table.table}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{table.name}</h3>
                        <div className="flex items-center">
                          <i className="fa fa-user text-gray-400 text-xs mr-1"></i>
                          <span className="text-xs">{table.players} {t('liveCasino.table.players')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <img src={`https://picsum.photos/id/${parseInt(table.img) + 1}/100/100`} alt="Dealer" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] mr-2" />
                        <span className="text-sm">{t('liveCasino.table.dealer')}: {table.dealer}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div>
                          <span className="text-gray-400">{t('liveCasino.table.minBet')}:</span>
                          <span className="ml-1">{table.minBet} ETH</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t('liveCasino.table.maxBet')}:</span>
                          <span className="ml-1">{table.maxBet} ETH</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-2 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        {t('liveCasino.table.joinTable')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Roulette Tables */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('liveCasino.games.roulette')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('liveCasino.games.viewAll')}</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'European Roulette', table: '#215', dealer: 'James', players: 11, minBet: '0.01', maxBet: '1', img: '1065' },
                  { name: 'French Roulette', table: '#422', dealer: 'Sophie', players: 5, minBet: '0.05', maxBet: '3', img: '1070' }
                ].map((table, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="relative">
                      <img src={`https://picsum.photos/id/${table.img}/600/300`} alt={table.name} className="w-full h-40 object-cover" />
                      <div className="absolute top-2 left-2 flex items-center bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                        LIVE
                      </div>
                      <div className="absolute top-2 right-2 bg-[#121212]/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Table {table.table}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{table.name}</h3>
                        <div className="flex items-center">
                          <i className="fa fa-user text-gray-400 text-xs mr-1"></i>
                          <span className="text-xs">{table.players} Players</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <img src={`https://picsum.photos/id/106${6 + i}/100/100`} alt="Dealer" className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] mr-2" />
                        <span className="text-sm">Dealer: {table.dealer}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Min Bet:</span>
                          <span className="ml-1">{table.minBet} ETH</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Max Bet:</span>
                          <span className="ml-1">{table.maxBet} ETH</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-2 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        Join Table
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Live Casino Info & Account */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Currently Playing */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('liveCasino.currentlyPlaying.title')}</h2>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-3">
                        <img src="https://picsum.photos/id/1063/100/100" alt="Blackjack Table" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#f97316] rounded-full border-2 border-[#1a1a1a]"></div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Classic Blackjack</h3>
                        <p className="text-xs text-gray-400">Table #304</p>
                      </div>
                    </div>
                    <button className="text-xs text-[#b8860b] hover:text-[#d4af37]">
                      <i className="fa fa-sign-out mr-1"></i> {t('liveCasino.currentlyPlaying.leave')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('liveCasino.currentlyPlaying.yourBet')}</span>
                      <span className="text-sm font-medium">0.1 ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('liveCasino.currentlyPlaying.tableBalance')}</span>
                      <span className="text-sm font-medium">0.85 ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('liveCasino.currentlyPlaying.gameStatus')}</span>
                      <span className="text-sm text-[#f97316]">{t('liveCasino.currentlyPlaying.dealingCards')}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-2 bg-[#121212] rounded-lg border border-[#b8860b]/30 text-[#b8860b] text-sm font-medium hover:bg-[#b8860b]/10 transition-colors">
                    {t('liveCasino.currentlyPlaying.returnToTable')}
                  </button>
                </div>
              </div>
              
              {/* Account Balance */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('liveCasino.myBalance.title')}</h2>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">{t('liveCasino.myBalance.available')}</span>
                    <span className="text-xl font-bold">12.547 ETH</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                      <i className="fa fa-plus text-[#b8860b]"></i>
                      <span>{t('liveCasino.myBalance.deposit')}</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                      <i className="fa fa-minus text-gray-400"></i>
                      <span>{t('liveCasino.myBalance.withdraw')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 py-10 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('liveCasino.footer.brandName')}</div>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                {t('liveCasino.footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('liveCasino.footer.liveCasinoSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.blackjack')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.roulette')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.baccarat')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.gameShows')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.poker')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('liveCasino.footer.supportSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.helpCenter')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.faqs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.contactUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.responsibleGambling')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.termsConditions')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('liveCasino.footer.legalSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.licenseInfo')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.termsOfService')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.cookiePolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('liveCasino.footer.jurisdictionRestrictions')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs">{t('liveCasino.footer.copyright')}</p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              {t('liveCasino.footer.disclaimer')}
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
  );
}

