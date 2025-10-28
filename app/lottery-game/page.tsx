'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LotteryGamePage() {
  const { t } = useTranslation();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  useEffect(() => {
    // 不再需要修改body样式，通过CSS处理
  }, []);

  const handleNumberClick = (number: number) => {
    const index = selectedNumbers.indexOf(number);
    if (index === -1) {
      if (selectedNumbers.length < 5) {
        setSelectedNumbers([...selectedNumbers, number].sort((a, b) => a - b));
      }
    } else {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    }
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const quickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const randomNum = Math.floor(Math.random() * 50) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
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
                <p className="text-[#121212]/80 text-xs font-medium">Blockchain Lottery Game Coming Soon</p>
              </div>
              <span className="text-2xl">🎲</span>
            </div>
          </div>
        </div>
        
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-gray-800">
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
                <a href="#" className="text-white hover:text-[#b8860b] transition-colors">{t('lottery.game.nav.lottery')}</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.nav.jackpots')}</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.nav.winners')}</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.nav.howItWorks')}</a>
                <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.nav.support')}</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/lottery" className="hidden md:flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-arrow-left text-[#b8860b]"></i>
                <span>{t('lottery.game.backToLottery')}</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-700 hidden md:block"></div>
              
              {/* 语言切换器 */}
              <LanguageSwitcher />
              
              <div className="h-6 w-px bg-gray-700 hidden md:block"></div>
              
              <button className="hidden md:flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm hover:border-[#b8860b]/50 transition-colors">
                <i className="fa fa-wallet text-[#b8860b]"></i>
                <span>{t('lottery.game.connectWallet')}</span>
              </button>
              
              <button className="md:hidden text-gray-300 hover:text-white">
                <i className="fa fa-bars"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Lottery Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t('lottery.game.title')}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('lottery.game.subtitle')}</p>
            
            {/* Countdown Timer */}
            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800 inline-block">
              <p className="text-sm text-gray-400 mb-2">{t('lottery.game.nextDrawIn')}</p>
              <div className="flex space-x-3">
                <div className="flex flex-col items-center">
                  <div className="bg-[#121212] rounded-lg w-14 h-14 flex items-center justify-center text-xl font-bold border border-gray-700">12</div>
                  <span className="text-xs text-gray-500 mt-1">{t('lottery.game.hours')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-[#121212] rounded-lg w-14 h-14 flex items-center justify-center text-xl font-bold border border-gray-700">45</div>
                  <span className="text-xs text-gray-500 mt-1">{t('lottery.game.minutes')}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-[#121212] rounded-lg w-14 h-14 flex items-center justify-center text-xl font-bold border border-gray-700">33</div>
                  <span className="text-xs text-gray-500 mt-1">{t('lottery.game.seconds')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ticket Purchase */}
            <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide pr-2">
              {/* Jackpot Display */}
              <div className="relative overflow-hidden rounded-xl border border-[#b8860b]/30">
                <div className="absolute inset-0 bg-gradient-to-r from-[#b8860b]/20 to-transparent"></div>
                <div className="relative p-6 text-center">
                  <h2 className="text-gray-400 text-sm mb-1">{t('lottery.game.currentJackpot')}</h2>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>23.8</span>
                    <span className="text-2xl md:text-3xl font-bold text-[#b8860b] ml-1" style={{ fontFamily: "'Playfair Display', serif" }}> ETH</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">≈ $48,725.43 USD</p>
                  
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">{t('lottery.game.totalTickets')}</p>
                      <p className="text-white font-medium">14,872</p>
                    </div>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">{t('lottery.game.players')}</p>
                      <p className="text-white font-medium">3,241</p>
                    </div>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">{t('lottery.game.drawNumber')}</p>
                      <p className="text-white font-medium">#1,287</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ticket Selection */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">{t('lottery.game.selectNumbers')}</h2>
                  <p className="text-sm text-gray-400 mt-1">{t('lottery.game.chooseNumbers')}</p>
                </div>
                
                <div className="p-5">
                  {/* Number Selection Grid */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map(number => (
                      <div
                        key={number}
                        onClick={() => handleNumberClick(number)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer ${
                          selectedNumbers.includes(number)
                            ? 'bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] scale-110 shadow-lg shadow-[#b8860b]/20'
                            : 'bg-[#1a1a1a] border border-gray-700 hover:border-[#b8860b]/50 text-white'
                        }`}
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                  
                  {/* Selected Numbers */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">{t('lottery.game.yourNumbers')}</h3>
                      <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.clearSelection')}</button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[5rem] items-center justify-center bg-[#121212] rounded-lg p-3 border border-gray-800">
                      {selectedNumbers.length === 0 ? (
                        <p className="text-gray-500 text-sm">{t('lottery.game.selectToStart')}</p>
                      ) : (
                        selectedNumbers.map(number => (
                          <div key={number} className="w-12 h-12 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] flex items-center justify-center font-bold">
                            {number}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Pick Option */}
                  <button onClick={quickPick} className="w-full py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm font-medium hover:border-[#b8860b]/50 transition-colors mb-6">
                    <i className="fa fa-random mr-2 text-[#b8860b]"></i> {t('lottery.game.quickPick')}
                  </button>
                  
                  {/* Ticket Quantity & Price */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('lottery.game.ticketQuantity')}</label>
                      <div className="flex items-center">
                        <button 
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-l-md hover:border-[#b8860b]/50 transition-colors"
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                        <input 
                          type="text" 
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                          className="flex-1 bg-[#121212] border-y border-gray-700 py-3 px-4 text-center focus:outline-none focus:border-[#b8860b]" 
                        />
                        <button 
                          onClick={() => setTicketQuantity(ticketQuantity + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-[#121212] border border-gray-700 rounded-r-md hover:border-[#b8860b]/50 transition-colors"
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </div>
                      
                      <div className="flex justify-center space-x-2 mt-2">
                        {[5, 10, 20, 50].map(qty => (
                          <button 
                            key={qty}
                            onClick={() => setTicketQuantity(qty)}
                            className="px-2 py-1 bg-[#121212] border border-gray-700 rounded text-xs hover:border-[#b8860b]/50 transition-colors"
                          >
                            {qty}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('lottery.game.pricePerTicket')}</label>
                      <div className="bg-[#121212] rounded-lg border border-gray-700 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{t('lottery.game.standard')}</span>
                          <span className="text-sm font-medium">0.05 ETH</span>
                        </div>
                        <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 mb-1">
                          <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500">{t('lottery.game.atCurrentRates')} $102.35 USD</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total & Purchase Button */}
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">{t('lottery.game.totalAmount')}</span>
                      <span className="text-xl font-bold">{(0.05 * ticketQuantity).toFixed(2)} ETH</span>
                    </div>
                    
                    <button 
                      disabled={selectedNumbers.length !== 5}
                      className="w-full py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#121212] font-semibold rounded-lg hover:opacity-90 transition-opacity transform hover:-translate-y-0.5 transition-transform mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('lottery.game.purchaseTickets')}
                    </button>
                    
                    <button className="w-full py-2.5 bg-[#121212] rounded-lg border border-gray-700 text-sm hover:border-[#b8860b]/50 transition-colors">
                      <i className="fa fa-wallet mr-2 text-[#b8860b]"></i> {t('lottery.game.connectToContinue')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* How to Play */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold">How It Works</h2>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mx-auto mb-3">
                        <i className="fa fa-ticket text-[#121212] text-xl"></i>
                      </div>
                      <h3 className="font-medium mb-2">1. Buy Tickets</h3>
                      <p className="text-sm text-gray-400">Select 5 numbers or use Quick Pick. Each ticket costs 0.05 ETH.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mx-auto mb-3">
                        <i className="fa fa-random text-[#121212] text-xl"></i>
                      </div>
                      <h3 className="font-medium mb-2">2. Provably Fair Draw</h3>
                      <p className="text-sm text-gray-400">Smart contract automatically selects winning numbers at scheduled times.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] flex items-center justify-center mx-auto mb-3">
                        <i className="fa fa-money text-[#121212] text-xl"></i>
                      </div>
                      <h3 className="font-medium mb-2">3. Instant Payouts</h3>
                      <p className="text-sm text-gray-400">Winnings are automatically distributed to your wallet after each draw.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-[#121212] rounded-lg border border-gray-800">
                    <h3 className="font-medium mb-3 flex items-center">
                      <i className="fa fa-info-circle text-[#b8860b] mr-2"></i>
                      Provably Fair
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Our lottery uses verifiable random number generation (VRNG) on the Ethereum blockchain. Every draw is transparent and can be independently verified through the smart contract.
                    </p>
                    <a href="#" className="text-[#b8860b] hover:text-[#d4af37] text-sm flex items-center">
                      <i className="fa fa-link mr-1"></i>
                      View Smart Contract
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Lottery Info & History */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Recent Winners */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('lottery.game.recentWinners')}</h2>
                    <a href="#" className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('lottery.game.viewAll')}</a>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {/* Winner 1 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{t('lottery.game.draw')} #1,286</h3>
                          <p className="text-sm text-gray-400">2 {t('lottery.game.daysAgo')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#b8860b] font-bold">8.45 ETH</p>
                          <p className="text-xs text-gray-500">≈ $17,241.35</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-medium">
                            0x7a...f92
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          {[5, 12, 22, 31, 47].map(num => (
                            <div key={num} className="w-7 h-7 rounded-full bg-[#b8860b] text-[#121212] text-xs font-bold flex items-center justify-center">{num}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner 2 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{t('lottery.game.draw')} #1,285</h3>
                          <p className="text-sm text-gray-400">4 {t('lottery.game.daysAgo')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#b8860b] font-bold">12.72 ETH</p>
                          <p className="text-xs text-gray-500">≈ $25,987.42</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-medium">
                            0x3f...e45
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          {[9, 15, 28, 33, 41].map(num => (
                            <div key={num} className="w-7 h-7 rounded-full bg-[#b8860b] text-[#121212] text-xs font-bold flex items-center justify-center">{num}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner 3 */}
                    <div className="p-4 hover:bg-[#121212]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{t('lottery.game.draw')} #1,284</h3>
                          <p className="text-sm text-gray-400">6 {t('lottery.game.daysAgo')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#b8860b] font-bold">5.31 ETH</p>
                          <p className="text-xs text-gray-500">≈ $10,842.19</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#1a1a1a] flex items-center justify-center text-xs font-medium">
                            0x9d...a17
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          {[2, 18, 25, 37, 49].map(num => (
                            <div key={num} className="w-7 h-7 rounded-full bg-[#b8860b] text-[#121212] text-xs font-bold flex items-center justify-center">{num}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lottery Statistics */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('lottery.game.lotteryStatistics')}</h2>
                  </div>
                  
                  <div className="p-5">
                    {/* Total Distributed */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{t('lottery.game.totalDistributed')}</span>
                        <span className="text-sm font-medium">1,287.45 ETH</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    {/* Total Players */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{t('lottery.game.totalPlayersLabel')}</span>
                        <span className="text-sm font-medium">24,871</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                    
                    {/* Average Jackpot */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{t('lottery.game.averageJackpot')}</span>
                        <span className="text-sm font-medium">14.28 ETH</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Next Draw Info */}
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">{t('lottery.game.nextDrawDetails')}</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">{t('lottery.game.drawDateTime')}</span>
                      <span className="text-sm font-medium">June 15, 2023 • 20:00 UTC</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">{t('lottery.game.ticketSalesClose')}</span>
                      <span className="text-sm font-medium">June 15, 2023 • 19:59 UTC</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">{t('lottery.game.minimumJackpot')}</span>
                      <span className="text-sm font-medium">5.00 ETH</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t('lottery.game.jackpotDistribution')}</span>
                      <button className="text-sm text-[#b8860b] hover:text-[#d4af37]">{t('lottery.game.viewBreakdown')}</button>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-800">
                      <h3 className="text-sm font-medium mb-3">{t('lottery.game.jackpotDistribution')}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[#b8860b] mr-2"></div>
                            <span className="text-xs text-gray-400">{t('lottery.game.fiveCorrect')}</span>
                          </div>
                          <span className="text-xs font-medium">70%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                            <span className="text-xs text-gray-400">{t('lottery.game.fourCorrect')}</span>
                          </div>
                          <span className="text-xs font-medium">20%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
                            <span className="text-xs text-gray-400">{t('lottery.game.threeCorrect')}</span>
                          </div>
                          <span className="text-xs font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-[#1a1a1a] border-t border-gray-800 mt-12" suppressHydrationWarning>
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-[#b8860b] text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>LUMI</div>
                <p className="text-gray-400 text-sm mb-4">{t('lottery.game.footerDescription')}</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-twitter"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-telegram"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-discord"></i></a>
                  <a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors"><i className="fa fa-github"></i></a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.game.lotterySection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.currentJackpot')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.pastResults')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.winnersGallery')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.howToPlayLink')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.oddsPrizes')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.game.resourcesSection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.helpCenter')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.smartContract')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.provablyFair')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.fees')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.api')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('lottery.game.companySection')}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.aboutUs')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.careers')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.termsOfService')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.privacyPolicy')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#b8860b] transition-colors">{t('lottery.game.contact')}</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs">{t('lottery.game.copyright')}</p>
              <p className="text-gray-500 text-xs mt-2 md:mt-0">{t('lottery.game.disclaimer')}</p>
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

