'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GiftCenter from '@/components/GiftCenter';

export default function PromotionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'deposit' | 'loyalty'>('all');
  const [countdown, setCountdown] = useState({ days: 7, hours: 12, minutes: 30, seconds: 45 });

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
            <span className="text-2xl">🎁</span>
            <div className="text-center">
              <p className="text-[#121212] font-bold text-lg tracking-wider">{t('promotions.banner.soon')} - {t('promotions.banner.date')}</p>
              <p className="text-[#121212]/80 text-xs font-medium">{t('promotions.banner.title')}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Responsible Gambling Notice */}
      <div className="bg-[#1a1a1a] border-b border-[#b8860b]/30 py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-gray-300 flex items-center justify-center md:justify-start" suppressHydrationWarning>
            <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
            {t('promotions.responsibleGambling')}
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
              <Link href="/lottery" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('promotions.nav.games')}</Link>
              <Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('promotions.nav.sports')}</Link>
              <Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('promotions.nav.liveCasino')}</Link>
              <Link href="/tournaments" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('promotions.nav.tournaments')}</Link>
              <a href="#" className="text-white hover:text-[#b8860b] transition-colors border-b-2 border-[#b8860b] pb-1">{t('promotions.nav.promotions')}</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/markets/hot" className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-arrow-left text-[#b8860b]"></i>
                <span>{t('promotions.nav.backToMarkets')}</span>
              </Link>
              
              <GiftCenter />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-700"></div>
              
              <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('promotions.balance')}</p>
                    <p className="text-sm font-medium">15.328 ETH</p>
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
        {/* Promotions Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{t('promotions.title')}</h1>
              <p className="text-gray-400 mt-1">{t('promotions.subtitle')}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="relative">
                <input type="text" placeholder={t('promotions.searchPromotions')} className="bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:border-[#b8860b] w-full md:w-64" />
                <i className="fa fa-search absolute left-3 top-2 text-gray-500"></i>
              </div>
              
              <button className="bg-[#1a1a1a] border border-gray-700 rounded-md p-1.5 hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-filter text-gray-400"></i>
              </button>
            </div>
          </div>
          
          {/* Promotion Tabs */}
          <div className="flex border border-gray-800 rounded-lg overflow-hidden mb-6">
            {[
              { key: 'all', label: t('promotions.tabs.all') },
              { key: 'new', label: t('promotions.tabs.newPlayer') },
              { key: 'deposit', label: t('promotions.tabs.deposit') },
              { key: 'loyalty', label: t('promotions.tabs.loyalty') }
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
          
          {/* Featured Promotion */}
          <div className="relative rounded-xl overflow-hidden mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#121212]/70 to-transparent z-10"></div>
            <img src="https://picsum.photos/id/1069/1600/400" alt="Welcome Bonus" className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center mb-3">
                <span className="flex items-center bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                  <i className="fa fa-star mr-1"></i>
                  {t('promotions.featured.popular')}
                </span>
                <span className="text-gray-300 text-sm">Up to 5 ETH • {t('promotions.featured.newPlayers')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{t('promotions.featured.title')}</h2>
              <p className="text-gray-300 mb-4 max-w-2xl">{t('promotions.featured.description')}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex space-x-2">
                  {[
                    { label: t('promotions.featured.days'), value: countdown.days },
                    { label: t('promotions.featured.hours'), value: countdown.hours },
                    { label: t('promotions.featured.mins'), value: countdown.minutes },
                    { label: t('promotions.featured.secs'), value: countdown.seconds }
                  ].map(item => (
                    <div key={item.label} className="bg-[#1a1a1a] rounded-lg w-12 h-12 flex flex-col items-center justify-center border border-gray-700">
                      <span className="text-lg font-bold">{item.value.toString().padStart(2, '0')}</span>
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
                
                <div className="ml-auto">
                  <button className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    {t('promotions.featured.claimOffer')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Promotion Categories & Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('promotions.categories.title')}</h2>
                </div>
              
              <div className="p-2">
                <ul className="space-y-1">
                  {[
                    { id: 'all', icon: 'fa-gift', name: t('promotions.categories.all'), count: 24 },
                    { id: 'new', icon: 'fa-user-plus', name: t('promotions.categories.newPlayer'), count: 5 },
                    { id: 'deposit', icon: 'fa-arrow-down', name: t('promotions.categories.deposit'), count: 8 },
                    { id: 'loyalty', icon: 'fa-trophy', name: t('promotions.categories.loyalty'), count: 6 },
                    { id: 'seasonal', icon: 'fa-calendar', name: t('promotions.categories.seasonal'), count: 3 },
                    { id: 'free', icon: 'fa-random', name: t('promotions.categories.free'), count: 7 }
                  ].map(promo => (
                    <li key={promo.id}>
                      <a 
                        href="#"
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          promo.id === 'all' 
                            ? 'bg-[#121212] border-l-4 border-[#b8860b] pl-3 -ml-4' 
                            : 'hover:bg-[#121212]'
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`fa ${promo.icon} ${promo.id === 'all' ? 'text-[#b8860b]' : 'text-gray-400'} mr-3`}></i>
                          <span>{promo.name}</span>
                        </div>
                        <span className="bg-[#121212] text-xs px-1.5 py-0.5 rounded-full">{promo.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Promotions List */}
          <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
            {/* New Player Offers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('promotions.sections.newPlayer')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('promotions.sections.viewAll')}</a>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: t('promotions.bonuses.firstDeposit.title'),
                    desc: t('promotions.bonuses.firstDeposit.desc'),
                    badge: t('promotions.bonuses.hot'),
                    badgeBg: 'bg-[#f97316]',
                    label: t('promotions.bonuses.match100'),
                    img: '1070',
                    playerType: t('promotions.bonuses.newPlayers'),
                    details: [
                      { icon: 'fa-clock-o', text: t('promotions.bonuses.validFor30Days') },
                      { icon: 'fa-exclamation-circle', text: t('promotions.bonuses.wagering35x') },
                      { icon: 'fa-minus-circle', text: t('promotions.bonuses.minDeposit') + ': 0.05 ETH' }
                    ]
                  },
                  {
                    title: t('promotions.bonuses.welcomePackage.title'),
                    desc: t('promotions.bonuses.welcomePackage.desc'),
                    label: t('promotions.bonuses.upTo5ETH'),
                    img: '1071',
                    playerType: t('promotions.bonuses.newPlayers'),
                    details: [
                      { icon: 'fa-clock-o', text: t('promotions.bonuses.validFor30Days') },
                      { icon: 'fa-exclamation-circle', text: t('promotions.bonuses.wagering35x') },
                      { icon: 'fa-minus-circle', text: t('promotions.bonuses.minDeposit') + ': 0.05 ETH' }
                    ]
                  }
                ].map((promo, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3">
                        <img src={`https://picsum.photos/id/${promo.img}/600/400`} alt={promo.title} className="w-full h-40 md:h-full object-cover" />
                        {promo.badge && (
                          <div className={`absolute top-2 left-2 flex items-center ${promo.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                            <i className="fa fa-fire mr-1"></i>
                            {promo.badge}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                          {promo.label}
                        </div>
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{promo.title}</h3>
                          <span className="text-xs text-gray-400">{promo.playerType}</span>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-3">{promo.desc}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-xs">
                          {promo.details.map((detail, j) => (
                            <div key={j} className="flex items-center">
                              <i className={`fa ${detail.icon} text-[#b8860b] mr-1`}></i>
                              <span>{detail.text}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="py-1.5 px-3 bg-[#121212] rounded-lg border border-[#b8860b]/30 text-[#b8860b] text-sm font-medium hover:bg-[#b8860b]/10 transition-colors">
                            {t('promotions.details.claimBonus')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Deposit Bonuses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('promotions.sections.depositBonuses')}</h2>
                <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('promotions.sections.viewAll')}</a>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: t('promotions.bonuses.weeklyReload.title'),
                    desc: t('promotions.bonuses.weeklyReload.desc'),
                    badge: t('promotions.bonuses.weekly'),
                    badgeBg: 'bg-[#3b82f6]/80',
                    label: t('promotions.bonuses.match50'),
                    img: '1072',
                    playerType: t('promotions.bonuses.allPlayers'),
                    details: [
                      { icon: 'fa-clock-o', text: t('promotions.bonuses.validFriSun') },
                      { icon: 'fa-exclamation-circle', text: t('promotions.bonuses.wagering40x') },
                      { icon: 'fa-minus-circle', text: t('promotions.bonuses.minDeposit') + ': 0.1 ETH' }
                    ]
                  }
                ].map((promo, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3">
                        <img src={`https://picsum.photos/id/${promo.img}/600/400`} alt={promo.title} className="w-full h-40 md:h-full object-cover" />
                        <div className={`absolute top-2 left-2 flex items-center ${promo.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                          <i className="fa fa-refresh mr-1"></i>
                          {promo.badge}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                          {promo.label}
                        </div>
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{promo.title}</h3>
                          <span className="text-xs text-gray-400">{promo.playerType}</span>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-3">{promo.desc}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-xs">
                          {promo.details.map((detail, j) => (
                            <div key={j} className="flex items-center">
                              <i className={`fa ${detail.icon} text-[#b8860b] mr-1`}></i>
                              <span>{detail.text}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="py-1.5 px-3 bg-[#121212] rounded-lg border border-[#b8860b]/30 text-[#b8860b] text-sm font-medium hover:bg-[#b8860b]/10 transition-colors">
                            {t('promotions.details.claimBonus')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - My Bonuses & Loyalty */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* My Active Bonuses */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('promotions.myBonuses.title')}</h2>
                </div>
                
                <div className="p-4">
                  {/* Bonus 1 */}
                  <div className="bg-[#121212] rounded-lg p-3 mb-3 border border-[#b8860b]/20">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-[#b8860b]">{t('promotions.bonuses.firstDeposit.title')}</h3>
                      <span className="text-xs text-gray-400">{t('promotions.myBonuses.expiresIn')} 24d</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">{t('promotions.myBonuses.bonusRemaining')}</span>
                      <span className="text-xs font-medium">1.25 ETH</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{t('promotions.myBonuses.wageringProgress')}</span>
                        <span className="text-gray-400">28/175 ETH (16%)</span>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                        <div className="bg-[#b8860b] h-1.5 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>
                    
                    <button className="w-full py-1 bg-transparent border border-gray-700 rounded text-xs hover:border-[#b8860b]/50 transition-colors">
                      {t('promotions.myBonuses.viewDetails')}
                    </button>
                  </div>
                  
                  <a href="#" className="text-center block text-sm text-[#b8860b] hover:text-[#d4af37] mt-4">
                    {t('promotions.myBonuses.viewAll')}
                  </a>
                </div>
              </div>
              
              {/* Loyalty Program */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('promotions.loyaltyProgram.title')}</h2>
                </div>
                
                <div className="p-5">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mb-3">
                      <i className="fa fa-diamond text-[#121212] text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium">{t('promotions.loyaltyProgram.goldLevel')}</h3>
                    <p className="text-xs text-gray-400 mt-1">2,450 / 5,000 {t('promotions.loyaltyProgram.pointsToNext')}</p>
                    
                    <div className="w-full mt-3">
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-[#b8860b] h-2 rounded-full" style={{ width: '49%' }}></div>
                      </div>
                    </div>
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
              <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('promotions.footer.brandName')}</div>
              <p className="text-gray-400 text-sm mb-4 max-w-md">
                {t('promotions.footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('promotions.footer.promotionsSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.newPlayerOffers')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.depositBonuses')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.freeSpins')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.loyaltyProgram')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.bonusCodes')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('promotions.footer.supportSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.helpCenter')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.faqs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.contactUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.responsibleGambling')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.termsConditions')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('promotions.footer.legalSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.licenseInfo')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.termsOfService')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.cookiePolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('promotions.footer.jurisdictionRestrictions')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs">{t('promotions.footer.copyright')}</p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              {t('promotions.footer.disclaimer')}
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

