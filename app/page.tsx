'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

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
  const { t } = useTranslation();
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
      
      // 检测是否在生产环境（Vercel）- 跳过 WebSocket 连接
      const isProduction = process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
      
      if (isProduction) {
        console.log('⚠️  生产环境：WebSocket 功能已禁用');
        return;
      }
      
      try {
        // 仅在本地开发环境连接 WebSocket
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.host;
        const wsUrl = `${wsProtocol}//${wsHost}/ws/alerts`;
        
        ws = new WebSocket(wsUrl);

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
        const response = await fetch('/api/alerts');
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
        const response = await fetch('/api/alerts/stats');
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
      <style dangerouslySetInnerHTML={{__html: `
        /* 自定义滚动条样式 - 白色 */
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.5) rgba(0, 0, 0, 0.3);
        }
      `}} />
      <Script src="/cascading-waves.js" strategy="afterInteractive" />
      <div className="font-sans relative min-h-screen bg-black" data-page="landing">
      {/* 左上角Logo - 固定在顶部，与语言切换器垂直居中对齐 */}
      <div style={{ position: 'fixed', top: '2rem', left: '1rem', zIndex: 50, transform: 'translateY(0)' }}>
        <Image 
          src="/image/lumi1 (1).png" 
          alt="LUMI Logo" 
          width={600} 
          height={200}
          style={{ height: '200px', width: 'auto', objectFit: 'contain', display: 'block', margin: 0, padding: 0 }}
        />
      </div>
      
      {/* 右上角语言切换器 - 与Logo垂直居中对齐 */}
      <div style={{ position: 'fixed', top: 'calc(2rem + 100px)', right: '2rem', zIndex: 50, transform: 'translateY(-50%)' }}>
        <LanguageSwitcher />
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
            <p className="text-6xl md:text-9xl font-black text-white mb-6 text-glow" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>{t('landing.soon')}</p>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: '400'}}>
              {t('landing.description')}
            </p>
          </div>
              </div>
              
        {/* 专业黑白主题时间轴 */}
        <div className="mt-16 w-full">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-[-9999px] right-[-12000px] top-6 h-[0.5px] bg-white z-0 transform -translate-y-1/2"></div>
            <div className="flex justify-between relative z-10">
              <Link href="/black-swan" className="flex flex-col items-center relative group cursor-pointer transition-all hover:scale-105">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2 group-hover:bg-green-400 group-hover:border-green-400 transition-colors"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1 group-hover:text-green-400 transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q4_2025_title')}</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[200px] group-hover:text-white transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q4_2025_desc1')}<br/>{t('landing.timeline.q4_2025_desc2')}
                </div>
              </Link>
              <Link href="/lottery" className="flex flex-col items-center relative group cursor-pointer transition-all hover:scale-105">
                <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-600 absolute top-6 -translate-y-1/2 group-hover:bg-green-400 group-hover:border-green-400 transition-colors"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1 group-hover:text-green-400 transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q1_2026_title')}</div>
                <div className="text-gray-400 text-lg font-semibold text-center max-w-[180px] group-hover:text-white transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q1_2026_desc1')}<br/>{t('landing.timeline.q1_2026_desc2')}
                </div>
              </Link>
              <div className="flex flex-col items-center relative group cursor-not-allowed opacity-60" title={`${t('landing.timeline.comingSoon')} in Q2 2026`}>
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-gray-300 font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q2_2026_title')}</div>
                <div className="text-gray-500 text-lg font-semibold text-center max-w-[180px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q2_2026_desc')}
                  <div className="text-xs text-gray-600 mt-1">{t('landing.timeline.comingSoon')}</div>
                </div>
              </div>
              <div className="flex flex-col items-center relative group cursor-not-allowed opacity-60" title={`${t('landing.timeline.comingSoon')} in Q3 2026`}>
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-gray-300 font-bold text-lg mt-8 mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q3_2026_title')}</div>
                <div className="text-gray-500 text-lg font-semibold text-center max-w-[180px]" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q3_2026_desc')}
                  <div className="text-xs text-gray-600 mt-1">{t('landing.timeline.comingSoon')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Our Apps 毛玻璃方框 */}
      <section className="relative z-20 flex justify-center px-4 mt-20 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 md:p-8">
            {/* 标题 */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              {t('landing.apps.title')}
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* 左侧应用卡片 */}
              <div className="flex flex-col gap-6 flex-1">
                <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border-2 border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl text-purple-400 border border-white/20">
                      <i className="fa fa-line-chart"></i>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{t('landing.apps.lumi.title')}</h3>
                  </div>
                  <p className="text-gray-300/90 text-sm leading-relaxed pl-[3.75rem]">
                    {t('landing.apps.lumi.desc')}
                  </p>
                </div>
                <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border-2 border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl text-purple-400 border border-white/20">
                      <i className="fa fa-bell"></i>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {t('landing.apps.moreApps.title')}
                    </h3>
                  </div>
                  <p className="text-gray-300/90 text-sm leading-relaxed pl-[3.75rem]">
                    {t('landing.apps.moreApps.desc')}
                  </p>
                </div>
                {/* 预测板块 - 白色毛玻璃效果 + 紫色点缀 */}
                <div className="backdrop-blur-xl bg-white/5 rounded-xl p-6 border-2 border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl hover:shadow-[0_8px_30px_rgb(255,255,255,0.12)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl text-purple-400 border border-white/20">
                      <i className="fa fa-bar-chart"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {t('landing.apps.prediction.title')}
                      </h3>
                      <p className="text-gray-300/80 text-xs mt-0.5">
                        {t('landing.apps.prediction.desc')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-5">
                    <div className="backdrop-blur-md bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium leading-tight">
                          {t('landing.apps.prediction.question1')}
                        </span>
                        <span className="text-sm px-3 py-1 bg-white/10 text-white rounded-full font-semibold backdrop-blur-sm border border-white/20">
                          82%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: '82%' }}
                        ></div>
                      </div>
                    </div>
                    <div className="backdrop-blur-md bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium leading-tight">
                          {t('landing.apps.prediction.question2')}
                        </span>
                        <span className="text-sm px-3 py-1 bg-white/10 text-white rounded-full font-semibold backdrop-blur-sm border border-white/20">
                          65%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/markets"
                    className="group mt-6 w-full py-3.5 bg-purple-500 text-white rounded-lg text-base font-semibold transition-all duration-300 flex items-center justify-center border-2 border-purple-400 hover:bg-purple-600 hover:border-purple-300 shadow-lg hover:shadow-[0_8px_20px_rgba(168,85,247,0.4)] transform hover:scale-[1.02]"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    <span className="relative flex items-center gap-2">
                      <i className="fa fa-rocket text-lg transition-transform duration-300 group-hover:translate-x-[-2px]"></i>
                      <span>{t('landing.apps.prediction.enterLumi')}</span>
                      <i className="fa fa-arrow-right text-sm transition-all duration-300 group-hover:translate-x-1 opacity-70 group-hover:opacity-100"></i>
                    </span>
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
                        ═══ {t('landing.terminal.liveAlertStream')} ═══
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                      <span className={`font-mono text-xs ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {wsConnected ? t('landing.terminal.monitoring').toUpperCase() : t('landing.terminal.offline').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* 终端内容区 */}
                  <div className="bg-black p-4 flex-1 flex flex-col">
                    {/* 实时数据流 - 终端样式 */}
                    <div className="space-y-1 flex-1 overflow-y-auto font-mono text-xs">
                      {realtimeData.length === 0 ? (
                        <div className="text-center py-10 text-gray-600">
                          <div className="text-2xl mb-2">[ {t('landing.terminal.standby').toUpperCase()} ]</div>
                          <p className="text-xs">{t('landing.terminal.waitingForAlerts')}</p>
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
                            ╔═ {t('landing.terminal.stats').toUpperCase()} ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.recent')}:</span>
                              <span className="text-white">{realtimeData.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.critical')}:</span>
                              <span className="text-red-500">
                                {realtimeData.filter(a => a.severity === 'critical').length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.total')}:</span>
                              <span className="text-cyan-400">{stats.totalAlerts}</span>
                            </div>
                          </div>
                        </div>

                        {/* 右侧：系统状态 */}
                        <div className="border border-green-900 p-2 rounded">
                          <div className="text-green-400 font-mono text-[10px] mb-1 font-bold">
                            ╔═ {t('landing.terminal.system').toUpperCase()} ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.ws')}:</span>
                              <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
                                {wsConnected ? `✓ ${t('landing.terminal.online').toUpperCase()}` : `✗ ${t('landing.terminal.offline').toUpperCase()}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.monitor')}:</span>
                              <span className="text-green-400">✓ {t('landing.terminal.active').toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">{t('landing.terminal.assets')}:</span>
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
                          <span>{t('landing.terminal.openFullTerminal')}</span>
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
        <p>© 2025 LUMI. {t('footer.allRightsReserved')}</p>
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
