'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GiftCenter from '@/components/GiftCenter';

export default function TournamentsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'results' | 'my'>('live');
  const [countdown, setCountdown] = useState({ days: 2, hours: 18, minutes: 45, seconds: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#121212] text-white font-sans antialiased">
      {/* SOON Banner */}
      <div className="bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#b8860b] py-3 border-b border-[#d4af37]/50">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div className="text-center">
              <p className="text-[#121212] font-bold text-lg tracking-wider">{t('tournaments.banner.soon')} - {t('tournaments.banner.date')}</p>
              <p className="text-[#121212]/80 text-xs font-medium">{t('tournaments.banner.title')}</p>
            </div>
            <span className="text-2xl">🎮</span>
          </div>
        </div>
      </div>

      {/* Responsible Gambling Notice */}
      <div className="bg-[#1a1a1a] border-b border-[#b8860b]/30 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-gray-300 flex items-center justify-center md:justify-start" suppressHydrationWarning>
            <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
            {t('tournaments.responsibleGambling')}
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.responsibleGamblingLink')}</a>
            <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.helpCenter')}</a>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center h-6">
              <Image 
                src="/image/LUMI-logo.png" 
                alt="LUMI" 
                width={180} 
                height={30}
                className="object-contain"
              />
            </div>
            <div className="hidden md:block h-4 w-px bg-gray-700 mx-2"></div>
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/lottery" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('tournaments.nav.games')}</Link>
              <Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('tournaments.nav.sports')}</Link>
              <Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('tournaments.nav.liveCasino')}</Link>
              <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">{t('tournaments.nav.tournaments')}</a>
              <Link href="/promotions" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('tournaments.nav.promotions')}</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/markets/automotive" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-arrow-left text-[#b8860b]"></i>
                <span>{t('tournaments.nav.backToMarkets')}</span>
              </Link>
              
              <GiftCenter />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="text-sm font-medium">8.752 ETH</p>
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
        {/* Tournaments Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{t('tournaments.title')}</h1>
              <p className="text-gray-400 mt-1">{t('tournaments.subtitle')}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="relative">
                <input type="text" placeholder={t('tournaments.searchTournaments')} className="bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:border-[#b8860b] w-full md:w-64" />
                <i className="fa fa-search absolute left-3 top-2 text-gray-500"></i>
              </div>
              
              <button className="bg-[#1a1a1a] border border-gray-700 rounded-md p-1.5 hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-filter text-gray-400"></i>
              </button>
            </div>
          </div>
          
          {/* Tournament Tabs */}
          <div className="flex border border-gray-800 rounded-lg overflow-hidden mb-6">
            {[
              { key: 'live', label: t('tournaments.tabs.live') },
              { key: 'upcoming', label: t('tournaments.tabs.upcoming') },
              { key: 'results', label: t('tournaments.tabs.results') },
              { key: 'my', label: t('tournaments.tabs.my') }
            ].map(tab => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 text-center font-medium ${
                  activeTab === tab.key 
                    ? 'bg-[#b8860b] text-[#121212]' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Featured Tournament */}
          <div className="relative rounded-xl overflow-hidden mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#121212]/70 to-transparent z-10"></div>
            <img src="https://picsum.photos/id/1060/1600/400" alt="Grand Championship" className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center mb-3">
                <span className="flex items-center bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                  <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                  {t('tournaments.featured.liveNow')}
                </span>
                <span className="text-gray-300 text-sm">{t('tournaments.featured.prizePool')}: 100 ETH • 245 {t('tournaments.featured.players')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{t('tournaments.featured.title')}</h2>
              <p className="text-gray-300 mb-4 max-w-2xl">{t('tournaments.featured.description')}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex space-x-2">
                  {[
                    { label: t('tournaments.featured.days'), value: countdown.days },
                    { label: t('tournaments.featured.hours'), value: countdown.hours },
                    { label: t('tournaments.featured.mins'), value: countdown.minutes },
                    { label: t('tournaments.featured.secs'), value: countdown.seconds }
                  ].map(item => (
                    <div key={item.label} className="bg-[#1a1a1a] rounded-lg w-12 h-12 flex flex-col items-center justify-center border border-gray-700">
                      <span className="text-lg font-bold">{item.value.toString().padStart(2, '0')}</span>
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-3 ml-auto">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                      <i className="fa fa-trophy text-[#b8860b] text-xs"></i>
                    </div>
                    <span className="text-sm">{t('tournaments.featured.yourRank')}: #37</span>
                  </div>
                  
                  <button className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    {t('tournaments.featured.joinTournament')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Tournament Categories & Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('tournaments.categories.title')}</h2>
                </div>
              
              <div className="p-2">
                <ul className="space-y-1">
                  {[
                    { icon: 'fa-trophy', name: t('tournaments.categories.all'), count: 38 },
                    { icon: 'fa-cards', name: t('tournaments.categories.blackjack'), count: 12 },
                    { icon: 'fa-diamond', name: t('tournaments.categories.roulette'), count: 8 },
                    { icon: 'fa-gamepad', name: t('tournaments.categories.slots'), count: 9 },
                    { icon: 'fa-users', name: t('tournaments.categories.multiGame'), count: 5 },
                    { icon: 'fa-star', name: t('tournaments.categories.vip'), count: 4 }
                  ].map((cat, i) => (
                    <li key={i}>
                      <a 
                        href="#"
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          i === 0 
                            ? 'bg-[#121212] border-l-4 border-[#b8860b] pl-3 -ml-4' 
                            : 'hover:bg-[#121212]'
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`fa ${cat.icon} ${i === 0 ? 'text-[#b8860b]' : 'text-gray-400'} mr-3`}></i>
                          <span>{cat.name}</span>
                        </div>
                        <span className="bg-[#121212] text-xs px-1.5 py-0.5 rounded-full">{cat.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Tournaments List */}
          <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
            {/* Live Tournaments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('tournaments.sections.live')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('tournaments.sections.viewAll')}</a>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: 'Blackjack Masters',
                    entry: '0.1 ETH',
                    prize: '15 ETH',
                    players: 87,
                    endsIn: '6h 24m',
                    progress: 68,
                    rank: '#12',
                    img: '1061'
                  },
                  {
                    title: 'Roulette Royale',
                    entry: '0.05 ETH',
                    prize: '10 ETH',
                    players: 124,
                    endsIn: '12h 15m',
                    progress: 42,
                    rank: '#45',
                    img: '1062'
                  },
                  {
                    title: 'Slot Masters Championship',
                    entry: 'Free',
                    prize: '25 ETH',
                    players: 342,
                    endsIn: '3h 40m',
                    progress: 85,
                    rank: '#28',
                    img: '1063'
                  }
                ].map((tournament, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3">
                        <img src={`https://picsum.photos/id/${tournament.img}/600/400`} alt={tournament.title} className="w-full h-40 md:h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                          {t('tournaments.tournamentDetails.live').toUpperCase()}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                          {tournament.prize}
                        </div>
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{tournament.title}</h3>
                          <span className="text-xs text-gray-400">{t('tournaments.tournamentDetails.entry')}: {tournament.entry}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <i className="fa fa-user text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">{tournament.players} Players</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa fa-clock-o text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">{t('tournaments.tournamentDetails.endsIn')} {tournament.endsIn}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa fa-trophy text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">Top 10 {t('tournaments.tournamentDetails.topPayout')}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{t('tournaments.tournamentDetails.progress')}</span>
                            <span className="text-gray-400">{tournament.progress}%</span>
                          </div>
                          <div className="w-full bg-[#121212] rounded-full h-1.5">
                            <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: `${tournament.progress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex -space-x-1 mr-2">
                              <img src="https://picsum.photos/id/1012/100/100" alt="Player" className="w-6 h-6 rounded-full border border-[#1a1a1a]" />
                              <img src="https://picsum.photos/id/1025/100/100" alt="Player" className="w-6 h-6 rounded-full border border-[#1a1a1a]" />
                              <img src="https://picsum.photos/id/1074/100/100" alt="Player" className="w-6 h-6 rounded-full border border-[#1a1a1a]" />
                            </div>
                            <span className="text-xs text-gray-400">{t('tournaments.tournamentDetails.yourRank')} {tournament.rank}</span>
                          </div>
                          
                          <button className="py-1.5 px-3 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                            {t('tournaments.tournamentDetails.joinNow')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Tournaments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('tournaments.sections.upcoming')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('tournaments.sections.viewAll')}</a>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: 'Baccarat High Rollers',
                    entry: '1 ETH',
                    prize: '50 ETH',
                    players: 24,
                    startsIn: '8h 30m',
                    progress: 48,
                    img: '1064'
                  },
                  {
                    title: 'Weekend Warrior Challenge',
                    entry: '0.2 ETH',
                    prize: '30 ETH',
                    players: 78,
                    startsIn: '2d 5h',
                    progress: 39,
                    img: '1065'
                  }
                ].map((tournament, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3">
                        <img src={`https://picsum.photos/id/${tournament.img}/600/400`} alt={tournament.title} className="w-full h-40 md:h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center bg-[#121212]/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          <i className="fa fa-calendar-o mr-1"></i>
                          {i === 0 ? t('tournaments.tournamentDetails.startsSoon') : t('tournaments.tournamentDetails.upcoming')}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                          {tournament.prize}
                        </div>
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{tournament.title}</h3>
                          <span className="text-xs text-gray-400">{t('tournaments.tournamentDetails.entry')}: {tournament.entry}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <i className="fa fa-user text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">{tournament.players} {t('tournaments.tournamentDetails.registered')}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa fa-clock-o text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">{t('tournaments.tournamentDetails.startsIn')} {tournament.startsIn}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fa fa-trophy text-gray-400 text-xs mr-1"></i>
                            <span className="text-xs">Top {i === 0 ? '5' : '15'} {t('tournaments.tournamentDetails.topPayout')}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{t('tournaments.tournamentDetails.regProgress')}</span>
                            <span className="text-gray-400">{tournament.progress}%</span>
                          </div>
                          <div className="w-full bg-[#121212] rounded-full h-1.5">
                            <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: `${tournament.progress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="py-1.5 px-3 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                            {t('tournaments.tournamentDetails.registerNow')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Tournament Stats & Leaderboards */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* My Tournament Stats */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('tournaments.myStats.title')}</h2>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-[#121212] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('tournaments.myStats.active')}</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('tournaments.myStats.won')}</p>
                      <p className="text-2xl font-bold text-[#b8860b]">7</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('tournaments.myStats.totalWinnings')}</p>
                      <p className="text-lg font-bold text-[#10b981]">34.85 ETH</p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('tournaments.myStats.globalRank')}</p>
                      <p className="text-2xl font-bold">#128</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Global Leaderboard */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{t('tournaments.leaderboard.title')}</h2>
                  <select className="bg-[#121212] border border-gray-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#b8860b]">
                    <option>{t('tournaments.leaderboard.thisMonth')}</option>
                    <option>{t('tournaments.leaderboard.thisWeek')}</option>
                    <option>{t('tournaments.leaderboard.allTime')}</option>
                  </select>
                </div>
                
                <div className="divide-y divide-gray-800">
                  {[
                    { rank: 1, name: '@blockchain_bet', tournaments: 42, winnings: '128.5 ETH', change: '+12 ' + t('tournaments.leaderboard.thisWeekChange'), changeColor: 'text-[#b8860b]', borderColor: 'border-[#b8860b]', bg: 'bg-[#121212]/50', rankBg: 'bg-gradient-to-r from-[#b8860b] to-[#d4af37]', rankText: 'text-[#121212]' },
                    { rank: 2, name: '@crypto_wiz', tournaments: 37, winnings: '97.2 ETH', change: '+8 ' + t('tournaments.leaderboard.thisWeekChange'), changeColor: 'text-[#10b981]', rankBg: 'bg-gray-300', rankText: 'text-[#121212]' },
                    { rank: 3, name: '@betmaster', tournaments: 31, winnings: '84.7 ETH', change: '-2 ' + t('tournaments.leaderboard.thisWeekChange'), changeColor: 'text-[#ef4444]', rankBg: 'bg-gray-600', rankText: 'text-white' },
                    { rank: 4, name: '@lucky_streak', tournaments: 28, winnings: '76.3 ETH', change: '+5 ' + t('tournaments.leaderboard.thisWeekChange'), changeColor: 'text-[#10b981]', rankBg: 'bg-[#121212] border border-gray-700', rankText: 'text-gray-400' },
                    { rank: 5, name: '@high_roller', tournaments: 24, winnings: '68.9 ETH', change: '+3 ' + t('tournaments.leaderboard.thisWeekChange'), changeColor: 'text-[#10b981]', rankBg: 'bg-[#121212] border border-gray-700', rankText: 'text-gray-400' }
                  ].map((player, i) => (
                    <div key={i} className={`p-3 flex items-center ${player.bg || 'hover:bg-[#121212]/30 transition-colors'} ${player.borderColor ? `border-l-4 ${player.borderColor}` : ''}`}>
                      <div className={`w-6 h-6 rounded-full ${player.rankBg} flex items-center justify-center ${player.rankText} text-xs font-bold mr-3`}>{player.rank}</div>
                      <img src={`https://picsum.photos/id/${1074 - i * 10}/100/100`} alt="Top Player" className="w-8 h-8 rounded-full mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.tournaments} {t('tournaments.leaderboard.tournamentsWon')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{player.winnings}</p>
                        <p className={`text-xs ${player.changeColor}`}>{player.change}</p>
                      </div>
                    </div>
                  ))}
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
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.responsibleBar.title')}</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.responsibleBar.helpLink')}</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.responsibleBar.selfExclusion')}</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('lottery.responsibleBar.ageVerification')}</a>
            </div>
            
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500" suppressHydrationWarning>{t('lottery.responsibleBar.ageLimit')}</span>
              </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 py-10 mt-8" suppressHydrationWarning>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('tournaments.footer.brandName')}</div>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                {t('tournaments.footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('tournaments.footer.tournamentsSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.liveNow')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.upcoming')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.pastResults')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.rulesInfo')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.prizesRewards')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('tournaments.footer.supportSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.helpCenter')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.faqs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.contactUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.responsibleGambling')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.termsConditions')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('tournaments.footer.legalSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.licenseInfo')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.termsOfService')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.cookiePolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('tournaments.footer.jurisdictionRestrictions')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs">{t('tournaments.footer.copyright')}</p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              {t('tournaments.footer.disclaimer')}
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

