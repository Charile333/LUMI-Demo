'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

// 实时警报数据类型
interface RealtimeAlert {
  id: string;
  timestamp: string;
  asset: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  change: number;
}

export default function LumiSoonPage() {
  const [realtimeData, setRealtimeData] = useState<RealtimeAlert[]>([]);
  const [stats, setStats] = useState({ totalAlerts: 0, monitoredAssets: 0 });
  const [wsConnected, setWsConnected] = useState(false);

  // 连接 WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let isUnmounting = false;

    const connectWebSocket = () => {
      if (isUnmounting) return;
      
      try {
        ws = new WebSocket('ws://localhost:3000/ws/alerts');

        ws.onopen = () => {
          console.log('✅ 已连接到预警系统');
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'alert' && data.data) {
              const alert = data.data;
              
              let change = 0;
              if (alert.details && alert.details.price_change) {
                change = alert.details.price_change * 100;
              }
              
              let severity: 'critical' | 'high' | 'medium' = 'medium';
              if (Math.abs(change) > 5) {
                severity = 'critical';
              } else if (Math.abs(change) > 2) {
                severity = 'high';
              }
              
              const newAlert: RealtimeAlert = {
                id: Date.now().toString(),
                timestamp: new Date(alert.timestamp).toLocaleTimeString('zh-CN'),
                asset: alert.symbol.replace('USDT', '/USDT'),
                severity: severity,
                message: alert.message,
                change: change
              };
              
              setRealtimeData(prev => [newAlert, ...prev].slice(0, 10));
            }
          } catch (e) {
            console.error('解析预警数据出错:', e);
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          if (!isUnmounting) {
            reconnectTimer = setTimeout(connectWebSocket, 5000);
          }
        };

      } catch (error) {
        console.error('连接预警系统失败:', error);
        if (!isUnmounting) {
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        }
      }
    };

    // 获取历史数据
    const fetchHistoricalAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/alerts');
        const result = await response.json();
        
        if (result.success && result.data) {
          const alerts: RealtimeAlert[] = result.data.slice(0, 5).map((item: any, index: number) => {
            let change = 0;
            if (item.details && item.details.price_change) {
              change = item.details.price_change * 100;
            }
            
            let severity: 'critical' | 'high' | 'medium' = 'medium';
            if (Math.abs(change) > 5) severity = 'critical';
            else if (Math.abs(change) > 2) severity = 'high';
            
            return {
              id: `${item.timestamp}-${item.symbol}-${index}`,
              timestamp: new Date(item.timestamp).toLocaleTimeString('zh-CN'),
              asset: item.symbol.replace('USDT', '/USDT'),
              severity: severity,
              message: item.message,
              change: change
            };
          });
          
          setRealtimeData(alerts);
        }
      } catch (error) {
        console.error('获取历史预警失败:', error);
      }
    };

    // 获取统计数据
    const loadStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/alerts/stats');
        const result = await response.json();
        if (result.success && result.data) {
          setStats({
            totalAlerts: result.data.total_alerts || 0,
            monitoredAssets: result.data.monitored_assets || 0
          });
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    fetchHistoricalAlerts();
    loadStats();
    connectWebSocket();

    return () => {
      isUnmounting = true;
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

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
      {/* 左上角Logo - 固定在顶部 */}
      <div className="fixed top-2 left-4 z-30">
        <Image 
          src="/image/lumi1 (1).png" 
          alt="LUMI Logo" 
          width={200} 
          height={200}
        />
      </div>

      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full">
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <h1 className="text-5xl md:text-6xl font-black text-white text-glow tracking-tight" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
              LUMI
            </h1>
          </div>

          {/* 核心 "SOON" 区域 */}
          <div className="animate-breathe max-w-4xl mx-auto">
            <p className="text-6xl md:text-9xl font-black text-white mb-6 text-glow" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>SOON</p>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: '400'}}>
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
                <div className="text-white font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>2025-Q4</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[200px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  黑天鹅预测<br/>预测市场
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>2026-Q1</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[180px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  彩票<br/>一站式链上博彩平台
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>2026-Q2</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[180px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  市场趋势预测
                </div>
              </div>
              <div className="flex flex-col items-center relative">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>2026-Q3</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[180px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>大模型量化</div>
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
                  <h3 className="text-xl font-semibold text-white mb-2">LUMI</h3>
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
                    <i className="fa fa-external-link mr-2"></i> 进入LUMI
                  </Link>
            </div>
              </div>
              
              {/* 右侧警报信息显示区 - 黑天鹅终端风格 */}
              <div className="flex-1">
                <div className="bg-black rounded-lg overflow-hidden border-2 border-green-500/50 h-full flex flex-col">
                  {/* 终端顶部栏 */}
                  <div className="bg-gray-900 border-b border-green-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-mono text-sm font-bold">
                        ═══ LIVE ALERT STREAM ═══
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                      <span className={`font-mono text-xs ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {wsConnected ? 'MONITORING' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>

                  {/* 终端内容区 */}
                  <div className="bg-black p-4 flex-1 flex flex-col">
                    {/* 实时数据流 - 终端样式 */}
                    <div className="space-y-1 flex-1 overflow-y-auto font-mono text-xs">
                      {realtimeData.length === 0 ? (
                        <div className="text-center py-10 text-gray-600">
                          <div className="text-2xl mb-2">[ STANDBY ]</div>
                          <p className="text-xs">Waiting for alert stream...</p>
                          <div className="mt-2 text-green-500 animate-pulse">█</div>
                        </div>
                      ) : (
                        realtimeData.map((alert, index) => (
                          <div
                            key={`alert-${alert.id}-${index}`}
                            className="hover:bg-gray-900/50 px-2 py-1.5 rounded transition-colors border-l-2 border-transparent hover:border-green-500"
                          >
                            <div className="flex items-start gap-2">
                              {/* 时间戳 */}
                              <span className="text-gray-600 shrink-0 text-[10px]">
                                [{alert.timestamp}]
                              </span>
                              
                              {/* 严重程度 */}
                              <span className={`font-bold shrink-0 w-16 text-[10px] ${
                                alert.severity === 'critical'
                                  ? 'text-red-500'
                                  : alert.severity === 'high'
                                  ? 'text-orange-500'
                                  : 'text-yellow-500'
                              }`}>
                                {alert.severity === 'critical' ? 'CRIT' : 
                                 alert.severity === 'high' ? 'HIGH' : 'MED'}
                              </span>
                              
                              {/* 资产 */}
                              <span className="text-cyan-400 shrink-0 w-20 text-[10px]">
                                {alert.asset}
                              </span>
                              
                              {/* 变化 */}
                              <span className={`shrink-0 w-14 text-[10px] ${
                                alert.change < 0 ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                              </span>
                              
                              {/* 消息 */}
                              <span className="text-gray-400 flex-1 truncate text-[10px]">
                                {alert.message}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 终端底部状态 */}
                    <div className="mt-3 pt-3 border-t border-green-900">
                      <div className="grid grid-cols-2 gap-2">
                        {/* 左侧：统计 */}
                        <div className="border border-green-900 p-2 rounded">
                          <div className="text-green-400 font-mono text-[10px] mb-1 font-bold">
                            ╔═ STATS ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Recent:</span>
                              <span className="text-white">{realtimeData.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Critical:</span>
                              <span className="text-red-500">
                                {realtimeData.filter(a => a.severity === 'critical').length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total:</span>
                              <span className="text-cyan-400">{stats.totalAlerts}</span>
                            </div>
                          </div>
                        </div>

                        {/* 右侧：系统状态 */}
                        <div className="border border-green-900 p-2 rounded">
                          <div className="text-green-400 font-mono text-[10px] mb-1 font-bold">
                            ╔═ SYSTEM ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">WS:</span>
                              <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
                                {wsConnected ? '✓ ONLINE' : '✗ OFFLINE'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Monitor:</span>
                              <span className="text-green-400">✓ ACTIVE</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Assets:</span>
                              <span className="text-cyan-400">{stats.monitoredAssets}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 查看完整终端链接 */}
                      <div className="mt-2 text-center">
                        <Link 
                          href="/black-swan"
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 font-mono text-[10px] transition-colors"
                        >
                          <span>→</span>
                          <span>Open Full Terminal</span>
                          <span>←</span>
                        </Link>
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

        /* 终端风格滚动条 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
          border: 1px solid #1a4d2e;
        }

        ::-webkit-scrollbar-thumb {
          background: #0f5132;
          border: 1px solid #00ff00;
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
          border-color: #22c55e;
        }

        ::-webkit-scrollbar-corner {
          background: #000000;
        }

        /* Firefox 滚动条 */
        * {
          scrollbar-width: thin;
          scrollbar-color: #0f5132 #000000;
        }
      `}</style>
      </div>
    </>
  )
}
