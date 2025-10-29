'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [showGiftCenter, setShowGiftCenter] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#giftIconContainer') && !target.closest('#giftCenterPopup')) {
        setShowGiftCenter(false);
      }
      if (!target.closest('#profileContainer') && !target.closest('#profileDropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#121212] text-white font-sans antialiased min-h-screen">
      {/* Overlay */}
      {(showGiftCenter || showProfileMenu) && (
        <div className="fixed inset-0 bg-black/50 z-[110]" style={{ backdropFilter: 'blur(1px)' }}></div>
      )}

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
              <Link href="/lottery" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.games')}</Link>
              <Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.sports')}</Link>
              <Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.liveCasino')}</Link>
              <Link href="/promotions" className="text-gray-400 hover:text-[#b8860b] transition-colors border-b-2 border-transparent pb-1 hover:border-gray-700">{t('lottery.promotions')}</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Gift Icon */}
            <div className="relative" id="giftIconContainer">
              <button 
                onClick={() => setShowGiftCenter(!showGiftCenter)}
                className="text-gray-300 hover:text-[#b8860b] transition-colors relative p-1.5 rounded-full hover:bg-[#1a1a1a] focus:outline-none"
              >
                <i className="fa fa-gift text-[#b8860b] text-lg"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-[#121212] text-xs rounded-full flex items-center justify-center animate-pulse">5</span>
              </button>
            </div>
            
            {/* Profile Menu */}
            <div className="relative" id="profileContainer">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="hidden md:block text-right">
                  <p className="text-xs text-gray-400">{t('profile.menu.account')}</p>
                  <p className="text-sm font-medium">Alex_Wang</p>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#b8860b]/30 hover:border-[#b8860b] transition-colors">
                  <img src="https://picsum.photos/id/1005/100/100" alt="User Avatar" className="w-full h-full object-cover" />
                </div>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div id="profileDropdown" className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden z-[120] animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#b8860b]/30">
                        <img src="https://picsum.photos/id/1005/100/100" alt="User Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium">Alex_Wang</h4>
                        <div className="flex items-center mt-0.5">
                          <span className="bg-[#b8860b]/20 text-[#b8860b] text-xs px-2 py-0.5 rounded-full flex items-center">
                            <i className="fa fa-diamond text-[8px] mr-1"></i>
                            {t('profile.menu.vipGold')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="py-1">
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm hover:bg-[#121212] transition-colors">
                      <i className="fa fa-user-circle w-5 text-[#b8860b] mr-3"></i>
                      {t('profile.menu.profile')}
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm hover:bg-[#121212] transition-colors">
                      <i className="fa fa-wallet w-5 text-[#b8860b] mr-3"></i>
                      {t('profile.menu.balance')}
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm hover:bg-[#121212] transition-colors">
                      <i className="fa fa-history w-5 text-[#b8860b] mr-3"></i>
                      {t('profile.menu.history')}
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm hover:bg-[#121212] transition-colors">
                      <i className="fa fa-trophy w-5 text-[#b8860b] mr-3"></i>
                      {t('profile.menu.rewards')}
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm hover:bg-[#121212] transition-colors">
                      <i className="fa fa-cog w-5 text-[#b8860b] mr-3"></i>
                      {t('profile.menu.settings')}
                    </a>
                    <div className="border-t border-gray-800 my-1"></div>
                    <a href="#" className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:bg-[#121212] hover:text-white transition-colors">
                      <i className="fa fa-sign-out w-5 mr-3"></i>
                      {t('profile.menu.logout')}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <button className="md:hidden text-gray-300 hover:text-white">
              <i className="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#121212]/80 to-[#0a0a0a] z-10"></div>
          <img src="https://picsum.photos/id/1047/1920/600" alt="Casino Background" className="absolute w-full h-full object-cover object-center" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('profile.hero.title')}<br /><span className="text-[#b8860b]">{t('profile.hero.subtitle')}</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                {t('profile.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#b8860b] text-[#121212] font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center">
                  <i className="fa fa-play-circle mr-2"></i>
                  {t('profile.hero.startPlaying')}
                </button>
                <button className="bg-transparent border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:border-[#b8860b]/50 transition-colors flex items-center">
                  <i className="fa fa-info-circle mr-2"></i>
                  {t('profile.hero.learnMore')}
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Profile Overview Section */}
        <section className="py-10 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Left: Personal Info */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-800">
                  <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.personal.title')}</h2>
                  
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#b8860b]/30 mb-4">
                      <img src="https://picsum.photos/id/1005/200/200" alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-medium">Alex Wang</h3>
                    <div className="bg-[#b8860b]/20 text-[#b8860b] text-xs px-3 py-1 rounded-full mt-2">
                      {t('profile.personal.vipMember')}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs text-gray-400 mb-1">{t('profile.personal.registrationDate')}</h4>
                      <p className="text-sm">June 15, 2023</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-400 mb-1">{t('profile.personal.email')}</h4>
                      <p className="text-sm">alex.wang@example.com</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-400 mb-1">{t('profile.personal.phone')}</h4>
                      <p className="text-sm">+86 **** 5678</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-400 mb-1">{t('profile.personal.lastLogin')}</h4>
                      <p className="text-sm">{t('profile.personal.today')} 14:35</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm hover:border-[#b8860b]/50 transition-colors">
                    {t('profile.personal.editProfile')}
                  </button>
                </div>
                
                {/* Middle: Account Balance & Stats */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gray-800">
                  <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.accountOverview.title')}</h2>
                  
                  <div className="space-y-6">
                    {/* Balance Info */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                      <h3 className="text-sm text-gray-400 mb-3">{t('profile.accountOverview.availableBalance')}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-semibold">15.328 ETH</p>
                          <p className="text-xs text-gray-400 mt-1">≈ $31,234.56</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-[#b8860b] text-[#121212] text-xs font-medium px-3 py-1.5 rounded hover:opacity-90 transition-opacity">
                            {t('profile.accountOverview.deposit')}
                          </button>
                          <button className="bg-[#121212] border border-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded hover:border-[#b8860b]/50 transition-colors">
                            {t('profile.accountOverview.withdraw')}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Data */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                        <h3 className="text-xs text-gray-400 mb-1">{t('profile.accountOverview.totalDeposits')}</h3>
                        <p className="text-lg font-medium">48.50 ETH</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                        <h3 className="text-xs text-gray-400 mb-1">{t('profile.accountOverview.totalWithdrawals')}</h3>
                        <p className="text-lg font-medium">32.17 ETH</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                        <h3 className="text-xs text-gray-400 mb-1">{t('profile.accountOverview.totalWinnings')}</h3>
                        <p className="text-lg font-medium text-[#10b981]">12.85 ETH</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                        <h3 className="text-xs text-gray-400 mb-1">{t('profile.accountOverview.totalBets')}</h3>
                        <p className="text-lg font-medium">1,247</p>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">{t('profile.accountOverview.recentActivity')}</h3>
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {[
                          { icon: 'fa-arrow-down', color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/20', title: 'Deposit 2.5 ETH', time: 'Today 10:23' },
                          { icon: 'fa-trophy', color: 'text-[#10b981]', bg: 'bg-[#10b981]/20', title: 'Won 0.85 ETH (Slots)', time: 'Yesterday 21:45' },
                          { icon: 'fa-arrow-up', color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/20', title: 'Withdrawal 1.2 ETH', time: '05-18 16:30' }
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center text-sm">
                            <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center ${activity.color} mr-3`}>
                              <i className={`fa ${activity.icon}`}></i>
                            </div>
                            <div className="flex-1">
                              <p>{activity.title}</p>
                              <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Membership Level & Charts */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.membership.title')}</h2>
                  
                  {/* Membership Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">{t('profile.membership.levelProgress')}</h3>
                      <span className="text-xs text-[#b8860b]">2,550 / 5,000 {t('profile.membership.points')}</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-4">
                      <div className="bg-[#b8860b] h-2 rounded-full" style={{ width: '51%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{t('profile.membership.currentLevel')}</span>
                      <span>{t('profile.membership.nextLevel')}</span>
                    </div>
                  </div>
                  
                  {/* Member Benefits */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">{t('profile.membership.exclusiveBenefits')}</h3>
                    <ul className="space-y-2 text-sm">
                      {[
                        t('profile.membership.benefit1'),
                        t('profile.membership.benefit2'),
                        t('profile.membership.benefit3'),
                        t('profile.membership.benefit4')
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <i className="fa fa-check text-[#b8860b] mt-1 mr-2"></i>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recommended Games Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.recommended.title')}</h2>
              <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37] flex items-center">
                {t('profile.recommended.viewAll')} <i className="fa fa-arrow-right ml-1"></i>
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: t('profile.recommended.games.goldenFortune'), category: t('profile.recommended.categories.slots'), rating: 4.5, rtp: '96.8%', img: '1040' },
                { name: t('profile.recommended.games.premiumBlackjack'), category: t('profile.recommended.categories.table'), rating: 4.0, info: t('profile.recommended.lowRisk'), img: '1039' },
                { name: t('profile.recommended.games.liveRoulette'), category: t('profile.recommended.categories.live'), rating: 5.0, info: '12 ' + t('profile.recommended.tables'), img: '1041', hot: true },
                { name: t('profile.recommended.games.texasHoldem'), category: t('profile.recommended.categories.poker'), rating: 4.7, info: '1,248 ' + t('tournaments.featured.players'), img: '1042' }
              ].map((game, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                  <div className="relative">
                    <img src={`https://picsum.photos/id/${game.img}/400/250`} alt={game.name} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                              <div className="p-4 w-full">
                                <button className="w-full bg-[#b8860b] text-[#121212] font-medium py-2 rounded-lg hover:opacity-90 transition-opacity">
                                  {t('profile.recommended.startPlaying')}
                                </button>
                              </div>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#121212]/70 text-white text-xs px-2 py-1 rounded">{game.category}</span>
                    {game.hot && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                        <i className="fa fa-circle text-[6px] mr-1 animate-pulse"></i>
                        {t('profile.recommended.hot')}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{game.name}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, j) => (
                          <i key={j} className={`fa fa-star${j < Math.floor(game.rating) ? '' : (j < game.rating ? '-half-o' : '-o')} text-[#b8860b] text-xs`}></i>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{game.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">{game.rtp || game.info}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Promotions Section */}
        <section className="py-12 bg-[#1a1a1a]">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.exclusivePromotions.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotion 1 */}
              <div className="relative rounded-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#121212]/60 to-transparent z-10"></div>
                <img src="https://picsum.photos/id/1043/800/300" alt="Promotion" className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6">
                  <span className="bg-[#b8860b] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 w-max">{t('profile.exclusivePromotions.limitedTime')}</span>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.exclusivePromotions.weekendDouble.title')}</h3>
                  <p className="text-gray-300 text-sm mb-4 max-w-xs">{t('profile.exclusivePromotions.weekendDouble.desc')}</p>
                  <Link href="/promotions" className="bg-transparent border border-[#b8860b] text-[#b8860b] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#b8860b] hover:text-[#121212] transition-colors w-max">
                    {t('profile.exclusivePromotions.joinNow')}
                  </Link>
                </div>
              </div>
              
              {/* Promotion 2 */}
              <div className="relative rounded-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#121212]/60 to-transparent z-10"></div>
                <img src="https://picsum.photos/id/1044/800/300" alt="Tournament" className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-6">
                  <span className="bg-[#3b82f6] text-white text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 w-max">{t('profile.exclusivePromotions.vipExclusive')}</span>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.exclusivePromotions.goldLeague.title')}</h3>
                  <p className="text-gray-300 text-sm mb-4 max-w-xs">{t('profile.exclusivePromotions.goldLeague.desc')}</p>
                  <Link href="/tournaments" className="bg-transparent border border-[#b8860b] text-[#b8860b] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#b8860b] hover:text-[#121212] transition-colors w-max">
                    {t('profile.exclusivePromotions.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Gift Center Popup */}
      {showGiftCenter && (
        <div id="giftCenterPopup" className="fixed right-6 top-20 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden z-[120] w-80 md:w-96 animate-in fade-in slide-in-from-right-2 duration-300">
          {/* Popup Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              <i className="fa fa-gift text-[#b8860b] mr-2"></i>
              {t('profile.giftCenter.title')}
            </h3>
            <span className="bg-[#b8860b]/20 text-[#b8860b] text-xs px-2 py-0.5 rounded-full flex items-center relative">
              5 {t('profile.giftCenter.unclaimed')}
            </span>
          </div>
          
          {/* Popup Content */}
          <div className="max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* New Player Gifts */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-white flex items-center">
                  <i className="fa fa-rocket text-[#f59e0b] mr-2"></i>
                  {t('profile.giftCenter.newPlayerExclusive')}
                </h4>
                <Link href="/promotions" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">{t('profile.giftCenter.viewAll')}</Link>
              </div>
              
              <div className="space-y-3">
                {/* Gift Package */}
                <div className="bg-[#121212] rounded-lg border border-gray-700 p-3 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium">{t('profile.giftCenter.registrationGift.title')}</h5>
                      <p className="text-xs text-gray-400 mt-1">{t('profile.giftCenter.registrationGift.desc')}</p>
                      <div className="flex items-center mt-2 text-xs">
                        <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded mr-2">{t('profile.giftCenter.noDeposit')}</span>
                        <span className="text-gray-500">{t('profile.giftCenter.remaining')}: 3d 2h</span>
                      </div>
                    </div>
                    <button className="bg-[#b8860b] text-[#121212] text-xs font-medium px-3 py-1 rounded hover:opacity-90 transition-opacity">
                      {t('profile.giftCenter.claim')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Deposit Gifts */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-white flex items-center">
                  <i className="fa fa-money text-[#3b82f6] mr-2"></i>
                  {t('profile.giftCenter.depositRewards')}
                </h4>
                <Link href="/promotions" className="text-xs text-[#b8860b] hover:text-[#d4af37] transition-colors">{t('profile.giftCenter.viewAll')}</Link>
              </div>
              
              <div className="space-y-3">
                {/* First Deposit Double */}
                <div className="bg-[#121212] rounded-lg border border-gray-700 p-3 transition-all duration-300 hover:border-[#b8860b]/50 hover:shadow-lg hover:shadow-[#b8860b]/5 hover:-translate-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium">{t('profile.giftCenter.firstDepositDouble.title')}</h5>
                      <p className="text-xs text-gray-400 mt-1">{t('profile.giftCenter.firstDepositDouble.desc')}</p>
                      <div className="flex items-center mt-2 text-xs">
                        <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded mr-2">{t('profile.giftCenter.firstDeposit')}</span>
                        <span className="text-gray-500">{t('profile.giftCenter.remaining')}: 7d 5h</span>
                      </div>
                    </div>
                    <button className="bg-[#121212] border border-[#b8860b]/30 text-[#b8860b] text-xs font-medium px-3 py-1 rounded hover:bg-[#b8860b]/10 transition-colors">
                      {t('profile.giftCenter.deposit')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Popup Footer */}
          <div className="p-4 border-t border-gray-800 bg-[#121212]/50">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                <i className="fa fa-info-circle text-[#b8860b] mr-1"></i>
                {t('profile.giftCenter.wageringNote')}
              </p>
              <button 
                onClick={() => setShowGiftCenter(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {t('profile.giftCenter.close')} <i className="fa fa-times ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{t('profile.footer.brandName')}</div>
              <p className="text-gray-400 text-sm mb-4">
                {t('profile.footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('profile.footer.gamesSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.slots')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.tableGames')}</a></li>
                <li><Link href="/live-casino" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.liveCasino')}</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.poker')}</a></li>
                <li><Link href="/sports-betting" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.sportsBetting')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('profile.footer.supportSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.helpCenter')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.faqs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.contactUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.depositMethods')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.withdrawalInstructions')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('profile.footer.legalSection')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.termsOfService')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.responsibleGaming')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.ageVerification')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('profile.footer.licenseInfo')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs mb-4 md:mb-0">{t('profile.footer.copyright')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <img src="https://picsum.photos/id/103/60/30" alt="Payment Method" className="h-6 opacity-70" />
              <img src="https://picsum.photos/id/104/60/30" alt="Payment Method" className="h-6 opacity-70" />
              <img src="https://picsum.photos/id/105/60/30" alt="Payment Method" className="h-6 opacity-70" />
              <img src="https://picsum.photos/id/106/60/30" alt="Payment Method" className="h-6 opacity-70" />
              <img src="https://picsum.photos/id/107/60/30" alt="Regulatory Body" className="h-6 opacity-70" />
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-xs mt-6">
            {t('profile.footer.disclaimer')}
          </div>
        </div>
      </footer>
    </div>
  );
}

