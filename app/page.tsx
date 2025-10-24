'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

export default function LumiSoonPage() {
  useEffect(() => {
    // 页面卸载时清理canvas
    return () => {
      const canvas = document.getElementById('cascading-waves-canvas')
      if (canvas) {
        canvas.remove()
      }
    }
  }, [])

  return (
    <>
      <Script src="/cascading-waves.js" strategy="afterInteractive" />
      <div className="font-sans relative min-h-screen bg-black" data-page="landing">
      {/* 左上角Logo */}
      <div className="absolute top-4 left-4 z-30">
        <Image 
          src="/image/lumi1 (1).png" 
          alt="LUMI Logo" 
          width={64} 
          height={64}
        />
      </div>

      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full">
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <h1 className="text-5xl md:text-6xl font-black text-white text-glow tracking-tight">
              LUMI
            </h1>
          </div>

          {/* 核心 "SOON" 区域 */}
          <div className="animate-breathe max-w-4xl mx-auto">
            <p className="text-6xl md:text-9xl font-black text-white mb-6 text-glow">SOON</p>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Crypto market tool—focuses on on-chain Black Swan risk signals,
              <br />
              quantitative uncertainty measurement, betting platform and
              <br />
              Prediction Market Platform.
            </p>
          </div>
              </div>
              
        {/* 专业黑白主题时间轴 */}
        <div className="mt-16 w-full">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-[-9999px] right-[-12000px] top-6 h-[0.5px] bg-white z-0 transform -translate-y-1/2"></div>
            <div className="flex justify-between relative z-10">
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-medium mt-8 mb-1">2025-Q4</div>
                <div className="text-gray-400 text-sm text-center max-w-[200px]">
                  Prediction&Black Swan Alert
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-medium mt-8 mb-1">2026-Q1</div>
                <div className="text-gray-400 text-sm text-center max-w-[180px]">
                  Prediction Market
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-medium mt-8 mb-1">2026-Q2</div>
                <div className="text-gray-400 text-sm text-center max-w-[180px]">
                  Market Trend Forecasting
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-medium mt-8 mb-1">2026-Q3</div>
                <div className="text-gray-400 text-sm text-center max-w-[120px]">Soon</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Our Apps 毛玻璃方框 */}
      <section className="relative z-20 flex justify-center px-4 mt-20 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Our Apps
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* 左侧应用卡片 */}
              <div className="flex flex-col gap-6 flex-1">
                <div className="bg-[#1a1a1a]/50 rounded-lg p-5 hover:bg-[#1a1a1a]/80 transition-colors">
                  <div className="text-3xl text-white mb-3">
                    <i className="fa fa-line-chart"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">DuoLume</h3>
                  <p className="text-gray-300/70 text-sm">
                    Advanced trading platform with real-time analytics
                  </p>
                </div>
                <div className="bg-[#1a1a1a]/50 rounded-lg p-5 hover:bg-[#1a1a1a]/80 transition-colors">
                  <div className="text-3xl text-white mb-3">
                    <i className="fa fa-bell"></i>
            </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    More Apps Coming Soon
                      </h3>
                  <p className="text-gray-300/70 text-sm">
                    Customizable alerts for price movements and trends
                  </p>
                </div>
                {/* 预测板块 - 金色毛玻璃效果 */}
                <div className="backdrop-blur-md bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 rounded-lg p-5 border border-[#d4af37]/30 hover:border-[#d4af37]/50 transition-all">
                  <div className="text-3xl text-[#d4af37] mb-3">
                    <i className="fa fa-bar-chart"></i>
                    </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    PREDICTION MARKET
                  </h3>
                  <p className="text-gray-300/70 text-sm mb-4">
                    Decentralized prediction platform for crypto events
                  </p>
                  <div className="space-y-3">
                    <div className="bg-[#1a1a1a]/60 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-sm font-medium">
                          BTC Price at $70K by End of Year?
                        </span>
                        <span className="text-xs px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] rounded-full">
                          82%
                        </span>
                          </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#d4af37] h-1.5 rounded-full"
                          style={{ width: '82%' }}
                        ></div>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a]/60 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-sm font-medium">
                          ETH to Surpass $4K in Q4?
                        </span>
                        <span className="text-xs px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] rounded-full">
                          65%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#d4af37] h-1.5 rounded-full"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/markets"
                    className="mt-4 w-full py-2 bg-[#d4af37] hover:bg-[#e6c553] text-black rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <i className="fa fa-external-link mr-2"></i> View All Markets
                  </Link>
            </div>
              </div>
              
              {/* 右侧警报信息显示区 - 命令行风格 */}
              <div className="flex-1">
                <div className="terminal-bg rounded-lg p-5 h-full overflow-y-auto border border-gray-500 w-full">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-500">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="text-lg font-semibold terminal-gold terminal-font ml-2">
                      crypto-alert@terminal
                    </h3>
                  </div>
                  <div className="terminal-font terminal-text">
                    <div className="space-y-2 mt-2">
                      <div className="terminal-font terminal-text text-center text-gray-300/60">
                        Alert system coming soon...
                      </div>
                    </div>
                  </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </section>

      {/* 底部信息 */}
      <footer className="relative z-20 text-center text-gray-300/40 text-sm p-8">
        <p>© 2025 LUMI. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="#" className="hover:text-white transition-colors">
            <i className="fa fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <i className="fa fa-telegram"></i>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <i className="fa fa-discord"></i>
          </a>
            </div>
      </footer>

      {/* 添加必要的样式 */}
      <style jsx global>{`
        body {
          background: #000 !important;
          padding-top: 0 !important;
          overflow: hidden;
          position: relative;
        }

        html {
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* 确保内容在背景之上 */
        [data-page="landing"] > * {
          position: relative;
          z-index: 10;
        }

        #cascading-waves-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          background-color: #000000;
        }

        /* 只在landing页面显示cascading waves */
        body:not(:has([data-page="landing"])) #cascading-waves-canvas {
          display: none !important;
        }

        @keyframes breathe {
          0%, 100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        .animate-breathe {
          animation: breathe 4.5s ease-in-out infinite;
        }

        .text-glow {
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.4),
            0 0 24px rgba(255, 255, 255, 0.2);
        }

        .terminal-font {
          font-family: 'Courier New', Courier, monospace;
        }

        .terminal-bg {
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .terminal-text {
          color: #ffffff;
        }

        .terminal-green {
          color: #00ff00;
        }

        .terminal-yellow {
          color: #ffff00;
        }

        .terminal-red {
          color: #ff0000;
        }

        .terminal-gold {
          color: #ffd700;
        }
      `}</style>
      </div>
    </>
  )
}
