'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GiftCenter from '@/components/GiftCenter';

// Types
interface Bet {
  match: string;
  league: string;
  selection: string;
  odds: number;
}

export default function SportsBettingPage() {
  const { t } = useTranslation();
  const [selectedBets, setSelectedBets] = useState<Bet[]>([]);
  const [betStakes, setBetStakes] = useState<{ [key: number]: number }>({});
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'outrights'>('live');
  const [activeCategory, setActiveCategory] = useState('football');

  useEffect(() => {
    // Initialize default bet stakes
    const stakes: { [key: number]: number } = {};
    selectedBets.forEach((_, index) => {
      if (!betStakes[index]) {
        stakes[index] = 0.5;
      }
    });
    if (Object.keys(stakes).length > 0) {
      setBetStakes({ ...betStakes, ...stakes });
    }
  }, [selectedBets]);

  const addToBetslip = (bet: Bet) => {
    // Check if bet already exists
    const exists = selectedBets.some(
      b => b.match === bet.match && b.selection === bet.selection
    );
    if (!exists) {
      setSelectedBets([...selectedBets, bet]);
    }
  };

  const removeFromBetslip = (index: number) => {
    setSelectedBets(selectedBets.filter((_, i) => i !== index));
    const newStakes = { ...betStakes };
    delete newStakes[index];
    setBetStakes(newStakes);
  };

  const clearBetslip = () => {
    setSelectedBets([]);
    setBetStakes({});
  };

  const updateStake = (index: number, value: number) => {
    setBetStakes({ ...betStakes, [index]: value });
  };

  const getTotalStake = () => {
    return Object.values(betStakes).reduce((sum, stake) => sum + stake, 0);
  };

  const getTotalPotentialWin = () => {
    return selectedBets.reduce((sum, bet, index) => {
      const stake = betStakes[index] || 0;
      return sum + (stake * bet.odds);
    }, 0);
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
        {/* SOON Banner */}
        <div className="bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#b8860b] py-3 border-b border-[#d4af37]/50">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚽</span>
              <div className="text-center">
                <p className="text-[#121212] font-bold text-lg tracking-wider">{t('sportsBetting.banner.soon')} - {t('sportsBetting.banner.date')}</p>
                <p className="text-[#121212]/80 text-xs font-medium">{t('sportsBetting.banner.title')}</p>
              </div>
              <span className="text-2xl">🏀</span>
            </div>
          </div>
        </div>

        {/* Responsible Gambling Notice */}
        <div className="bg-[#1a1a1a] border-b border-[#b8860b]/30 py-2">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <p className="text-xs text-gray-300 flex items-center justify-center md:justify-start" suppressHydrationWarning>
              <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
              {t('sportsBetting.responsibleGambling')}
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingLink')}</a>
              <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.helpCenter')}</a>
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
                <Link href="/lottery" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('sportsBetting.nav.games')}</Link>
                <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">{t('sportsBetting.nav.sports')}</a>
                <Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('liveCasino.nav.liveCasino')}</Link>
                <Link href="/tournaments" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('tournaments.nav.tournaments')}</Link>
                <Link href="/promotions" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('promotions.nav.promotions')}</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/markets/automotive" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                  <i className="fa fa-arrow-left text-[#b8860b]"></i>
                  <span>{t('sportsBetting.nav.backToMarkets')}</span>
                </Link>
                
                <GiftCenter />
                
                <div className="h-6 w-px bg-gray-700"></div>
                
                {/* Language Switcher */}
                <LanguageSwitcher />
                
                <div className="h-6 w-px bg-gray-700"></div>
                
                <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-sm font-medium">7.245 ETH</p>
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
          {/* Sports Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{t('sportsBetting.title')}</h1>
                <p className="text-gray-400 mt-1">{t('sportsBetting.subtitle')}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={t('sportsBetting.searchEvents')}
                    className="bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:border-[#b8860b] w-full md:w-64"
                  />
                  <i className="fa fa-search absolute left-3 top-2 text-gray-500"></i>
                </div>
                
                <button className="bg-[#1a1a1a] border border-gray-700 rounded-md p-1.5 hover:border-[#b8860b]/50 transition-colors">
                  <i className="fa fa-filter text-gray-400"></i>
                </button>
              </div>
            </div>
            
            {/* Live & Upcoming Tabs */}
            <div className="flex border border-gray-800 rounded-lg overflow-hidden mb-6">
              <button 
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2.5 text-center font-medium ${
                  activeTab === 'live' 
                    ? 'bg-[#b8860b] text-[#121212]' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors'
                }`}
              >
                {t('sportsBetting.liveNow')}
              </button>
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-2.5 text-center font-medium ${
                  activeTab === 'upcoming' 
                    ? 'bg-[#b8860b] text-[#121212]' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors'
                }`}
              >
                {t('sportsBetting.upcoming')}
              </button>
              <button 
                onClick={() => setActiveTab('outrights')}
                className={`flex-1 py-2.5 text-center font-medium ${
                  activeTab === 'outrights' 
                    ? 'bg-[#b8860b] text-[#121212]' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors'
                }`}
              >
                {t('sportsBetting.outrights')}
              </button>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Sport Categories */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('sportsBetting.categories.title')}</h2>
                </div>
                
                <div className="p-2">
                  <ul className="space-y-1">
                    {[
                      { id: 'football', icon: 'fa-futbol-o', nameKey: 'football', count: 148 },
                      { id: 'basketball', icon: 'fa-basketball-ball', nameKey: 'basketball', count: 86 },
                      { id: 'tennis', icon: 'fa-table-tennis', nameKey: 'tennis', count: 54 },
                      { id: 'ice-hockey', icon: 'fa-hockey-puck', nameKey: 'iceHockey', count: 32 },
                      { id: 'baseball', icon: 'fa-baseball-ball', nameKey: 'baseball', count: 28 },
                      { id: 'rugby', icon: 'fa-running', nameKey: 'rugby', count: 19 },
                      { id: 'mma', icon: 'fa-motorcycle', nameKey: 'mma', count: 12 },
                      { id: 'horse-racing', icon: 'fa-horse', nameKey: 'horseRacing', count: 36 },
                      { id: 'esports', icon: 'fa-gamepad', nameKey: 'esports', count: 42 }
                    ].map(sport => (
                      <li key={sport.id}>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setActiveCategory(sport.id); }}
                          className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                            activeCategory === sport.id 
                              ? 'bg-[#121212] border-l-4 border-[#b8860b] pl-3 -ml-4' 
                              : 'hover:bg-[#121212]'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                              <i className={`fa ${sport.icon} text-xs text-white`}></i>
                            </div>
                            <span>{String(t(`sportsBetting.sports.${sport.nameKey}`))}</span>
                          </div>
                          <span className="bg-[#121212] text-xs px-1.5 py-0.5 rounded-full">{sport.count}</span>
                        </a>
                      </li>
                    ))}
                    
                    <li>
                      <a href="#" className="flex items-center p-2 rounded-md hover:bg-[#121212] transition-colors text-[#b8860b]">
                        <i className="fa fa-plus-circle mr-3 text-xs"></i>
                        <span>{t('sportsBetting.categories.viewAll')}</span>
                      </a>
                    </li>
                  </ul>
                </div>
                
                {/* Popular Leagues */}
                <div className="p-5 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">{t('sportsBetting.popularLeagues.title')}</h3>
                  <ul className="space-y-2">
                    {[
                      t('sportsBetting.popularLeagues.epl'),
                      t('sportsBetting.popularLeagues.ucl'),
                      t('sportsBetting.popularLeagues.nba'),
                      t('sportsBetting.popularLeagues.laLiga'),
                      t('sportsBetting.popularLeagues.serieA')
                    ].map(league => (
                      <li key={league}>
                        <a href="#" className="flex items-center justify-between text-sm hover:text-[#b8860b] transition-colors">
                          <span>{league}</span>
                          <i className="fa fa-angle-right text-gray-500"></i>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Middle Column - Sports Events */}
            <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
              {/* Featured Event */}
              <div className="relative rounded-xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#121212]/80 to-transparent z-10"></div>
                <img src="https://picsum.photos/id/1058/1600/400" alt="Featured Match" className="w-full h-48 md:h-64 object-cover" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 md:p-10">
                  <div className="flex items-center mb-3">
                    <span className="bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">{t('sportsBetting.matches.live').toUpperCase()}</span>
                    <span className="text-gray-300 text-sm">{t('sportsBetting.leagues.championsLeague')} • {t('sportsBetting.leagues.semifinal')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{t('sportsBetting.teams.realMadrid')} {t('sportsBetting.matches.vs')} {t('sportsBetting.teams.manchesterCity')}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                        <span className="text-xs">RM</span>
                      </div>
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <div className="text-xl font-bold">-</div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold">1</span>
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                        <span className="text-xs">MC</span>
                      </div>
                    </div>
                    <div className="bg-[#121212]/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      <span>67&apos;</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => addToBetslip({
                        match: t('sportsBetting.teams.realMadrid') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.manchesterCity'),
                        league: t('sportsBetting.leagues.championsLeague'),
                        selection: t('sportsBetting.teams.realMadrid') + ' ' + t('sportsBetting.matches.win'),
                        odds: 3.25
                      })}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                    >
                      3.25
                    </button>
                    <button 
                      onClick={() => addToBetslip({
                        match: t('sportsBetting.teams.realMadrid') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.manchesterCity'),
                        league: t('sportsBetting.leagues.championsLeague'),
                        selection: t('sportsBetting.betOptions.draw'),
                        odds: 3.50
                      })}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                    >
                      3.50
                    </button>
                    <button 
                      onClick={() => addToBetslip({
                        match: t('sportsBetting.teams.realMadrid') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.manchesterCity'),
                        league: t('sportsBetting.leagues.championsLeague'),
                        selection: t('sportsBetting.teams.manchesterCity') + ' ' + t('sportsBetting.matches.win'),
                        odds: 2.10
                      })}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                    >
                      2.10
                    </button>
                    <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#1a1a1a] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                      +124 {t('sportsBetting.matches.markets')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Live Events by League */}
              <div className="space-y-6">
                {/* Premier League */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 bg-[#121212] border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src="https://picsum.photos/id/201/30/30" alt="Premier League" className="w-6 h-6 mr-2" />
                      <span className="font-medium">{t('sportsBetting.leagues.premierLeague')}</span>
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded-full">6 {t('sportsBetting.leagues.liveSuffix')}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <i className="fa fa-chevron-down text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {/* Event 1 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.matches.matchday')} 34</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">2-1</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">ARS</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.arsenal')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">78&apos;</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.tottenham')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">TOT</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.arsenal') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.tottenham'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.arsenal') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.85
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.85
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.arsenal') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.tottenham'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.betOptions.draw'),
                            odds: 3.75
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          3.75
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.arsenal') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.tottenham'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.tottenham') + ' ' + t('sportsBetting.matches.win'),
                            odds: 4.50
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          4.50
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+87 More Markets</a>
                      </div>
                    </div>
                    
                    {/* Event 2 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.matches.matchday')} 34</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">0-0</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">CHE</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.chelsea')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">34&apos;</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.liverpool')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">LIV</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.chelsea') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.liverpool'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.chelsea') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.60
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.60
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.chelsea') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.liverpool'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.betOptions.draw'),
                            odds: 3.20
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          3.20
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.chelsea') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.liverpool'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.liverpool') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.75
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.75
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+92 More Markets</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* La Liga */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 bg-[#121212] border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src="https://picsum.photos/id/202/30/30" alt="La Liga" className="w-6 h-6 mr-2" />
                      <span className="font-medium">{t('sportsBetting.leagues.laLiga')}</span>
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded-full">4 {t('sportsBetting.leagues.liveSuffix')}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <i className="fa fa-chevron-down text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {/* Event 1 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.matches.matchday')} 32</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">3-0</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">BAR</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.barcelona')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">82&apos;</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.sevilla')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">SEV</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.barcelona') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.sevilla'),
                            league: t('sportsBetting.leagues.laLiga'),
                            selection: t('sportsBetting.teams.barcelona') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.35
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.35
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.barcelona') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.sevilla'),
                            league: t('sportsBetting.leagues.laLiga'),
                            selection: t('sportsBetting.betOptions.draw'),
                            odds: 5.50
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          5.50
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.barcelona') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.sevilla'),
                            league: t('sportsBetting.leagues.laLiga'),
                            selection: t('sportsBetting.teams.sevilla') + ' ' + t('sportsBetting.matches.win'),
                            odds: 9.00
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          9.00
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+78 More Markets</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* NBA */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 bg-[#121212] border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src="https://picsum.photos/id/203/30/30" alt="NBA" className="w-6 h-6 mr-2" />
                      <span className="font-medium">{t('sportsBetting.leagues.nba')}</span>
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded-full">8 {t('sportsBetting.leagues.liveSuffix')}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <i className="fa fa-chevron-down text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {/* Event 1 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.matches.playoffs')}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">108-102</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">BOS</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.celtics')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">Q4 05:42</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.heat')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">MIA</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.celtics') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.heat'),
                            league: t('sportsBetting.leagues.nbaPlayoffs'),
                            selection: t('sportsBetting.teams.celtics') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.65
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.65
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          -
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.celtics') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.heat'),
                            league: t('sportsBetting.leagues.nbaPlayoffs'),
                            selection: t('sportsBetting.teams.heat') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.25
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.25
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+124 {t('sportsBetting.matches.moreMarkets')}</a>
                      </div>
                    </div>
                    
                    {/* Event 2 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.matches.playoffs')}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">87-95</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">DAL</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.mavericks')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">Q3 02:18</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.warriors')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">GSW</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.mavericks') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.warriors'),
                            league: t('sportsBetting.leagues.nbaPlayoffs'),
                            selection: t('sportsBetting.teams.mavericks') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.40
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.40
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          -
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.mavericks') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.warriors'),
                            league: t('sportsBetting.leagues.nbaPlayoffs'),
                            selection: t('sportsBetting.teams.warriors') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.60
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.60
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+118 More Markets</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Esports */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-4 bg-[#121212] border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src="https://picsum.photos/id/204/30/30" alt="Esports" className="w-6 h-6 mr-2" />
                      <span className="font-medium">{t('sportsBetting.matches.esports')}</span>
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded-full">5 {t('sportsBetting.leagues.liveSuffix')}</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <i className="fa fa-chevron-down text-xs"></i>
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {/* Event 1 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{t('sportsBetting.matches.live')} • {t('sportsBetting.leagues.lolWorlds')}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full">1-1</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">T1</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.t1')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">Game 3</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.geng')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">GG</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.t1') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.geng'),
                            league: t('sportsBetting.leagues.lolWorlds'),
                            selection: t('sportsBetting.teams.t1') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.75
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.75
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          -
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.t1') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.geng'),
                            league: t('sportsBetting.leagues.lolWorlds'),
                            selection: t('sportsBetting.teams.geng') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.05
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.05
                        </button>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <a href="#" className="text-xs text-[#b8860b] hover:text-[#d4af37]">+64 More Markets</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Events Preview */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('sportsBetting.upcomingEvents')}</h2>
                  <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('sportsBetting.viewAllEvents')}</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upcoming Event 1 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <img src="https://picsum.photos/id/201/24/24" alt="Premier League" className="w-5 h-5 mr-2" />
                          <span className="text-xs text-gray-400">Premier League • Today, 20:45</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between my-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">MUN</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.manUnited')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">VS</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.newcastle')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">NEW</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.manUnited') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.newcastle'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.manUnited') + ' ' + t('sportsBetting.matches.win'),
                            odds: 2.10
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          2.10
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.manUnited') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.newcastle'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.betOptions.draw'),
                            odds: 3.40
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          3.40
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.manUnited') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.newcastle'),
                            league: t('sportsBetting.leagues.premierLeague'),
                            selection: t('sportsBetting.teams.newcastle') + ' ' + t('sportsBetting.matches.win'),
                            odds: 3.25
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          3.25
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upcoming Event 2 */}
                  <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <img src="https://picsum.photos/id/203/24/24" alt="NBA" className="w-5 h-5 mr-2" />
                          <span className="text-xs text-gray-400">{t('sportsBetting.leagues.nba')} • {t('sportsBetting.matches.tomorrow')}, 02:30</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between my-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-xs">LAL</span>
                          </div>
                          <span className="text-sm font-medium">{t('sportsBetting.teams.lakers')}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500">VS</div>
                        
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-right">{t('sportsBetting.teams.bulls')}</span>
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-2">
                            <span className="text-xs">CHI</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.lakers') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.bulls'),
                            league: t('sportsBetting.leagues.nba'),
                            selection: t('sportsBetting.teams.lakers') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.85
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.85
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200">
                          -
                        </button>
                        <button 
                          onClick={() => addToBetslip({
                            match: t('sportsBetting.teams.lakers') + ' ' + t('sportsBetting.matches.vs') + ' ' + t('sportsBetting.teams.bulls'),
                            league: t('sportsBetting.leagues.nba'),
                            selection: t('sportsBetting.teams.bulls') + ' ' + t('sportsBetting.matches.win'),
                            odds: 1.95
                          })}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#121212] border border-gray-700 hover:border-[#b8860b]/50 transition-all duration-200"
                        >
                          1.95
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Bet Slip & Odds */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Bet Slip */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                      {t('sportsBetting.betSlip.title')}
                      {selectedBets.length > 0 && (
                        <span className="text-gray-400 text-base font-normal ml-1">
                          ({selectedBets.length} {t(selectedBets.length === 1 ? 'sportsBetting.betSlip.selection' : 'sportsBetting.betSlip.selections')})
                        </span>
                      )}
                    </h2>
                    {selectedBets.length > 0 && (
                      <button 
                        onClick={clearBetslip}
                        className="text-sm text-gray-400 hover:text-[#b8860b] transition-colors"
                      >
                        {t('sportsBetting.betSlip.clearAll')}
                      </button>
                    )}
                  </div>
                  
                  {selectedBets.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#121212] mx-auto flex items-center justify-center mb-3">
                        <i className="fa fa-ticket text-gray-600 text-2xl"></i>
                      </div>
                      <p className="text-gray-500 mb-2">{t('sportsBetting.betSlip.empty')}</p>
                      <p className="text-xs text-gray-600">{t('sportsBetting.betSlip.emptyDesc')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto scrollbar-hide">
                        {selectedBets.map((bet, index) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-xs text-gray-400">{bet.league}</p>
                                <p className="text-sm font-medium">{bet.match}</p>
                              </div>
                              <button 
                                onClick={() => removeFromBetslip(index)}
                                className="text-gray-600 hover:text-gray-400"
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm bg-[#121212] px-2 py-1 rounded border border-gray-700">{bet.selection}</span>
                              <span className="text-sm font-medium">{bet.odds}</span>
                            </div>
                            
                            <div className="mt-3">
                              <label className="block text-xs text-gray-500 mb-1">{t('sportsBetting.betSlip.stake')} (ETH)</label>
                              <div className="flex items-center">
                                <button 
                                  onClick={() => updateStake(index, Math.max(0.01, (betStakes[index] || 0.5) - 0.05))}
                                  className="w-8 h-8 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-l-md hover:border-[#b8860b]/50 transition-colors"
                                >
                                  <i className="fa fa-minus text-xs"></i>
                                </button>
                                <input 
                                  type="text" 
                                  value={(betStakes[index] || 0.5).toFixed(2)} 
                                  onChange={(e) => updateStake(index, parseFloat(e.target.value) || 0)}
                                  className="flex-1 bg-[#121212] border-y border-gray-700 py-2 px-3 text-center text-sm focus:outline-none focus:border-[#b8860b]"
                                />
                                <button 
                                  onClick={() => updateStake(index, (betStakes[index] || 0.5) + 0.05)}
                                  className="w-8 h-8 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-r-md hover:border-[#b8860b]/50 transition-colors"
                                >
                                  <i className="fa fa-plus text-xs"></i>
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-right">
                              <span className="text-[#10b981] text-sm font-medium">
                                {t('sportsBetting.betSlip.potentialWinLabel')}: {((betStakes[index] || 0.5) * bet.odds).toFixed(2)} ETH
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bet Type Selection */}
                      <div className="p-4 border-t border-gray-800">
                        <label className="block text-xs text-gray-500 mb-2">{t('sportsBetting.betSlip.betType')}</label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <button className="py-1.5 bg-[#b8860b]/10 text-[#b8860b] text-sm rounded border border-[#b8860b]/30 font-medium">{t('sportsBetting.betSlip.single')}</button>
                          <button className="py-1.5 bg-[#121212] text-gray-300 text-sm rounded border border-gray-700 hover:border-gray-500 transition-colors">{t('sportsBetting.betSlip.accumulator')}</button>
                          <button className="py-1.5 bg-[#121212] text-gray-300 text-sm rounded border border-gray-700 hover:border-gray-500 transition-colors">{t('sportsBetting.betSlip.system')}</button>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{t('sportsBetting.betSlip.totalStake')}</span>
                            <span className="font-medium">{getTotalStake().toFixed(2)} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{t('sportsBetting.betSlip.potentialWin')}</span>
                            <span className="text-[#10b981] font-medium">{getTotalPotentialWin().toFixed(2)} ETH</span>
                          </div>
                        </div>
                        
                        <button className="w-full py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold rounded-lg hover:opacity-90 transition-opacity transform hover:-translate-y-0.5 transition-transform">
                          {t('sportsBetting.betSlip.placeBet')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Account Balance */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('sportsBetting.balance.title')}</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400">{t('sportsBetting.balance.available')}</span>
                      <span className="text-xl font-bold">7.245 ETH</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-plus text-[#b8860b]"></i>
                        <span>{t('sportsBetting.balance.deposit')}</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors">
                        <i className="fa fa-minus text-gray-400"></i>
                        <span>{t('sportsBetting.balance.withdraw')}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">{t('sportsBetting.balance.depositMethods')}</span>
                      <span className="text-[#b8860b]">+3 {t('sportsBetting.balance.options')}</span>
                    </div>
                    <div className="flex space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fa fa-ethereum text-xs text-white"></i>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fa fa-btc text-xs text-white"></i>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fa fa-usd text-xs text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Live Stats */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('sportsBetting.liveStats.title')}</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm">{t('sportsBetting.teams.realMadrid')} {t('sportsBetting.matches.vs')} {t('sportsBetting.teams.manchesterCity')}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-[#f97316]/20 text-[#f97316] rounded-full">67&apos;</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-1">
                          <span className="text-xs">RM</span>
                        </div>
                        <div className="text-lg font-bold">1</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-1">
                          <span className="text-xs">MC</span>
                        </div>
                        <div className="text-lg font-bold">1</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{t('sportsBetting.liveStats.shots')}</span>
                          <span>8 - 12</span>
                        </div>
                        <div className="w-full bg-[#121212] rounded-full h-1.5">
                          <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{t('sportsBetting.liveStats.shotsOnTarget')}</span>
                          <span>3 - 5</span>
                        </div>
                        <div className="w-full bg-[#121212] rounded-full h-1.5">
                          <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: '37.5%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{t('sportsBetting.liveStats.possession')}</span>
                          <span>58% - 42%</span>
                        </div>
                        <div className="w-full bg-[#121212] rounded-full h-1.5">
                          <div className="bg-[#b8860b] h-1.5 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{t('sportsBetting.liveStats.corners')}</span>
                          <span>4 - 6</span>
                        </div>
                        <div className="w-full bg-[#121212] rounded-full h-1.5">
                          <div className="bg-gray-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <a href="#" className="text-center block text-sm text-[#b8860b] hover:text-[#d4af37] mt-4">
                      {t('sportsBetting.liveStats.viewFull')}
                    </a>
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
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingBar.title')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingBar.helpLink')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingBar.selfExclusion')}</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingBar.ageVerification')}</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500" suppressHydrationWarning>{t('sportsBetting.responsibleGamblingBar.ageLimit')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-[#1a1a1a] border-t border-gray-800 py-10" suppressHydrationWarning>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('sportsBetting.footer.brandName')}</div>
                <p className="text-gray-400 text-sm mb-4 max-w-md">
                  {t('sportsBetting.footer.description')}
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('sportsBetting.footer.sportsSection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.football')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.basketball')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.tennis')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.esports')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.allSports')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('sportsBetting.footer.supportSection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.helpCenter')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.faqs')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.contactUs')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.responsibleGambling')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.termsConditions')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('sportsBetting.footer.legalSection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.licenseInfo')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.privacyPolicy')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.termsOfService')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.cookiePolicy')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('sportsBetting.footer.jurisdictionRestrictions')}</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">{t('sportsBetting.footer.copyright')}</p>
              <p className="text-gray-500 text-xs mt-2 md:mt-0">
                {t('sportsBetting.footer.disclaimer')}
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

