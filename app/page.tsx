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

  // 下滑指引点击处理函数
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // 连接 WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let pollingTimer: NodeJS.Timeout;
    let binanceTimer: NodeJS.Timeout;
    let isUnmounting = false;

    // 检测是否在生产环境（Vercel）
    const isProduction = process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

    // 🔥 新增：直接从币安获取实时市场数据（Vercel 兼容）
    const fetchBinanceData = async () => {
      if (isUnmounting) return;
      
      try {
        // 获取BTC和ETH的24小时数据
        const symbols = ['BTCUSDT', 'ETHUSDT'];
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
        );
        
        if (!response.ok) throw new Error('币安API请求失败');
        
        const data = await response.json();
        const newAlerts: RealtimeAlert[] = [];
        
        data.forEach((ticker: any) => {
          const priceChange = parseFloat(ticker.priceChangePercent);
          
          // 只显示价格变化超过1%的币种
          if (Math.abs(priceChange) > 1) {
            let severity: 'critical' | 'high' | 'medium' = 'medium';
            if (Math.abs(priceChange) > 5) severity = 'critical';
            else if (Math.abs(priceChange) > 3) severity = 'high';
            
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            newAlerts.push({
              id: `${ticker.symbol}-${Date.now()}`,
              timestamp: timeString,
              asset: ticker.symbol.replace('USDT', '/USDT'),
              severity: severity,
              message: `24h 价格变化 ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}% | 当前价格: $${parseFloat(ticker.lastPrice).toFixed(2)}`,
              change: priceChange
            });
          }
        });
        
        // 按价格变化幅度排序（绝对值最大的在前）
        newAlerts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        
        if (newAlerts.length > 0) {
          setRealtimeData(prev => {
            // 合并新旧数据，保留最近10条
            const merged = [...newAlerts, ...prev.filter(a => !a.id.includes('-' + Date.now()))];
            const newData = merged.slice(0, 10);
            
            // 快速检查：如果长度和第一项相同，可能数据没变化
            if (prev.length === newData.length && prev.length > 0 && prev[0].id === newData[0].id) {
              return prev;
            }
            return newData;
          });
          setWsConnected(true); // 设置为已连接状态
        }
        
        console.log('✅ 实时市场数据更新成功', newAlerts.length, '条警报');
      } catch (error) {
        console.error('获取币安数据失败:', error);
      }
    };

    // Vercel 环境：使用轮询 + 币安API
    const startPolling = () => {
      if (isUnmounting) return;
      
      console.log('🔄 Vercel 环境：使用轮询模式 + 币安API实时数据');
      
      const fetchLatestAlerts = async () => {
        try {
          const response = await fetch('/api/alerts/latest');
          const result = await response.json();
          
          if (result.success && result.data && result.data.length > 0) {
            const newAlerts: RealtimeAlert[] = result.data.map((item: any) => {
              let change = 0;
              if (item.details && item.details.price_change) {
                change = item.details.price_change * 100;
              }
              
              let severity: 'critical' | 'high' | 'medium' = item.severity || 'medium';
              
              return {
                id: item.id?.toString() || Date.now().toString(),
                timestamp: new Date(item.timestamp).toLocaleTimeString('zh-CN'),
                asset: item.symbol.replace('USDT', '/USDT'),
                severity: severity,
                message: item.message,
                change: change
              };
            });
            
            setRealtimeData(prev => [...newAlerts, ...prev].slice(0, 10));
          }
        } catch (error) {
          console.error('获取最新警报失败:', error);
        }
      };
      
      // 立即获取一次数据库警报（如果有）
      fetchLatestAlerts();
      
      // 立即获取一次币安数据
      fetchBinanceData();
      
      // 每15秒轮询数据库一次
      pollingTimer = setInterval(fetchLatestAlerts, 15000);
      
      // 每10秒获取币安数据
      binanceTimer = setInterval(fetchBinanceData, 10000);
    };

    const connectWebSocket = () => {
      if (isUnmounting) return;
      
      if (isProduction) {
        startPolling();
        return;
      }
      
      // 本地环境也启用币安数据（作为补充）
      fetchBinanceData();
      binanceTimer = setInterval(fetchBinanceData, 30000); // 本地环境30秒更新一次
      
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
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      if (binanceTimer) {
        clearInterval(binanceTimer);
      }
    };
  }, []);

  useEffect(() => {
    // 页面卸载时清理canvas
    return () => {
      const wormholeCanvas = document.getElementById('wormhole-canvas')
      if (wormholeCanvas) {
        wormholeCanvas.remove()
      }
      // 清理全局实例
      if (window.wormholeBackground) {
        window.wormholeBackground.destroy()
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
      <Script src="/wormhole-background.js" strategy="afterInteractive" />
      <div className="font-sans relative min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#080808]" data-page="landing">
      {/* 左上角Logo - 固定在顶部，与语言切换器垂直居中对齐 */}
      <div style={{ position: 'fixed', top: '2rem', left: '1rem', zIndex: 50, transform: 'translateY(0)' }}>
        <Image 
          src="/image/LUMI-golden.png" 
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
          {/* BETA SOON 卡片 */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-gray-300 text-sm font-semibold tracking-wider uppercase" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
                {t('landing.betaTag')}
              </span>
            </div>
          </div>

          {/* 核心 "LUMI" 区域 */}
          <div className="animate-breathe max-w-4xl mx-auto">
            <p className="text-6xl md:text-9xl font-black mb-6 gradient-text-lumi" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>{t('landing.soon')}</p>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: '400'}}>
              {t('landing.description')}
            </p>
          </div>
              </div>
              
        {/* 专业黑白主题时间轴 */}
        <div className="mt-16 w-full">
          <div className="relative max-w-7xl mx-auto px-9">
            <div className="absolute left-[-9999px] right-[-12000px] top-6 h-[0.5px] bg-white z-0 transform -translate-y-1/2"></div>
            <div className="flex justify-between relative z-10">
              <Link href="/black-swan" className="flex flex-col items-center relative group cursor-pointer transition-all hover:scale-105">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-600/60 absolute top-6 -translate-y-1/2 group-hover:border-yellow-400 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1 group-hover:text-yellow-400 transition-colors whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q4_2025_title')}</div>
                <div className="text-gray-400 text-lg font-semibold text-center group-hover:text-white transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q4_2025_desc1')}<br/>{t('landing.timeline.q4_2025_desc2')}
                </div>
              </Link>
              <Link href="/lottery" className="flex flex-col items-center relative group cursor-pointer transition-all hover:scale-105">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 border-2 border-yellow-600/60 absolute top-6 -translate-y-1/2 group-hover:border-yellow-400 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all"></div>
                <div className="text-white font-bold text-lg mt-8 mb-1 group-hover:text-yellow-400 transition-colors whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q1_2026_title')}</div>
                <div className="text-gray-400 text-lg font-semibold text-center group-hover:text-white transition-colors" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q1_2026_desc1')}<br/>{t('landing.timeline.q1_2026_desc2')}
                </div>
              </Link>
              <div className="flex flex-col items-center relative group cursor-not-allowed opacity-60" title={`${t('landing.timeline.comingSoon')} in Q2 2026`}>
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-gray-300 font-bold text-lg mt-8 mb-1 whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q2_2026_title')}</div>
                <div className="text-gray-500 text-lg font-semibold text-center whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q2_2026_desc')}
                  <div className="text-xs text-gray-600 mt-1">{t('landing.timeline.comingSoon')}</div>
                </div>
              </div>
              <div className="flex flex-col items-center relative group cursor-not-allowed opacity-60" title={`${t('landing.timeline.comingSoon')} in Q3 2026`}>
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 absolute top-6 -translate-y-1/2"></div>
                <div className="text-gray-300 font-bold text-lg mt-8 mb-1 whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>{t('landing.timeline.q3_2026_title')}</div>
                <div className="text-gray-500 text-lg font-semibold text-center whitespace-nowrap" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em'}}>
                  {t('landing.timeline.q3_2026_desc')}
                  <div className="text-xs text-gray-600 mt-1">{t('landing.timeline.comingSoon')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 进入市场按钮 - 虫洞科技风格 */}
        <div className="relative z-20 flex justify-center py-8 mt-8">
          <Link 
            href="/markets/automotive"
            className="group relative inline-block"
          >
            {/* 外层能量环 - 静态 */}
            <div className="absolute -inset-8 opacity-30 group-hover:opacity-60 transition-opacity duration-700">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30"></div>
              <div className="absolute inset-4 rounded-full border-2 border-amber-500/40"></div>
              <div className="absolute inset-8 rounded-full border border-yellow-400/50"></div>
            </div>
            
            {/* 脉动光环 */}
            <div className="absolute -inset-6 bg-gradient-to-r from-yellow-500/0 via-amber-500/20 to-yellow-500/0 rounded-full blur-xl animate-pulse"></div>
            
            {/* 主容器 - 六边形感 */}
            <div className="relative" style={{ 
              clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
              padding: '2px'
            }}>
              {/* 外发光边框 */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ 
                  clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
                  filter: 'blur(2px) brightness(1.2)'
                }}></div>
              
              {/* 主体背景 */}
              <div className="relative bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 group-hover:from-yellow-400 group-hover:via-amber-500 group-hover:to-yellow-600 transition-all duration-500 overflow-hidden"
                style={{ 
                  clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)'
                }}>
                
                {/* 网格背景 */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                }}></div>
                
                {/* 扫描线动画 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-2000 ease-in-out"></div>
                
                {/* 粒子效果层 */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '2s'
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* 内容容器 */}
                <div className="relative px-16 py-6 flex items-center justify-center gap-6">
                  {/* 左侧六边形装饰 */}
                  <div className="relative w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white animate-spin-slow">
                      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  </div>
                  
                  {/* 文字 */}
                  <div className="relative">
                    <span className="text-white text-2xl font-black tracking-[0.15em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] group-hover:tracking-[0.25em] transition-all duration-500" 
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        textShadow: '0 0 30px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                      {t('landing.enterMarket')}
                    </span>
                    {/* 文字下方光线 */}
                    <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* 右侧箭头 + 能量波纹 */}
                  <div className="relative">
                    {/* 能量波纹 */}
                    <div className="absolute inset-0 -m-2">
                      <div className="absolute inset-0 border-2 border-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"></div>
                      <div className="absolute inset-0 border border-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-[2] transition-all duration-1000 delay-150"></div>
                    </div>
                    
                    {/* 箭头 */}
                    <svg className="w-8 h-8 text-white relative z-10 transition-all duration-500 group-hover:translate-x-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      <circle cx="18" cy="12" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* 右侧六边形装饰 */}
                  <div className="relative w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white animate-spin-reverse">
                      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                
                {/* 底部高光 */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/30 to-transparent"></div>
                
                {/* 顶部高光 */}
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
            </div>
            
            {/* 底部反光效果 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
          </Link>
        </div>
        
        {/* 动态下滑指引 - 双V形箭头 (右下角) */}
        <div className="fixed right-8 bottom-8 z-20">
          <div className="scroll-indicator" onClick={handleScrollDown}>
            <div className="scroll-text">
              <span className="text-white/60 text-sm font-medium tracking-wider">
                {t('landing.scrollDown')}
              </span>
            </div>
            <div className="chevron-container">
              <svg className="chevron chevron-1" width="50" height="50" viewBox="0 0 60 60">
                <polyline points="10,20 30,40 50,20" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg className="chevron chevron-2" width="50" height="50" viewBox="0 0 60 60">
                <polyline points="10,20 30,40 50,20" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Our Apps 毛玻璃方框 */}
      <section className="relative z-20 flex justify-center px-4 mt-24 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 md:p-8">
            {/* 标题 */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              {t('landing.apps.title')}
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* 左侧应用卡片 - 简约优雅重设计 */}
              <div className="flex flex-col gap-6 flex-1">
                {/* LUMI卡片 */}
                <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-black/40 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20">
                  {/* 背景光晕 */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-700"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start gap-5">
                      {/* 图标 */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center group-hover:border-yellow-400/50 group-hover:scale-110 transition-all duration-300">
                          <i className="fa fa-line-chart text-3xl text-yellow-400"></i>
                        </div>
                        {/* 角标装饰 */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                          {t('landing.apps.lumi.title')}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {t('landing.apps.lumi.desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 底部渐变条 */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent group-hover:via-yellow-400 transition-all"></div>
                </div>

                {/* More Apps卡片 */}
                <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-black/40 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20">
                  {/* 背景光晕 */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-700"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start gap-5">
                      {/* 图标 */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center group-hover:border-yellow-400/50 group-hover:scale-110 transition-all duration-300">
                          <i className="fa fa-bell text-3xl text-yellow-400"></i>
                        </div>
                        {/* Coming Soon标签 */}
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-bold">
                          SOON
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                          {t('landing.apps.moreApps.title')}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {t('landing.apps.moreApps.desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 底部渐变条 */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent group-hover:via-yellow-400 transition-all"></div>
                </div>

                {/* 预测市场板块 - 主打卡片 */}
                <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/60 via-zinc-900/40 to-black/60 border-2 border-yellow-500/40 hover:border-yellow-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/30">
                  {/* 多层背景光晕 */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl group-hover:bg-yellow-400/25 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative p-8">
                    {/* 头部 */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border-2 border-yellow-500/40 flex items-center justify-center group-hover:border-yellow-400/60 group-hover:scale-105 transition-all duration-300">
                          <i className="fa fa-bar-chart text-4xl text-yellow-400"></i>
                        </div>
                        {/* 脉动装饰 */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500/20 animate-pulse"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-yellow-400 uppercase tracking-wide">
                            {t('landing.apps.prediction.title')}
                          </h3>
                          <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                            <span className="text-yellow-400 text-xs font-bold">LIVE</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {t('landing.apps.prediction.desc')}
                        </p>
                      </div>
                    </div>
                    
                    {/* 预测问题列表 */}
                    <div className="space-y-5 mb-8">
                      {/* 问题1 */}
                      <div className="relative group/item p-5 rounded-xl bg-black/30 border border-yellow-500/20 hover:border-yellow-400/40 hover:bg-black/40 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-white font-medium text-sm pr-4 leading-relaxed">
                            {t('landing.apps.prediction.question1')}
                          </p>
                          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg">
                            82%
                          </div>
                        </div>
                        <div className="relative h-3 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full transition-all duration-700"
                            style={{ width: '82%' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 问题2 */}
                      <div className="relative group/item p-5 rounded-xl bg-black/30 border border-yellow-500/20 hover:border-yellow-400/40 hover:bg-black/40 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-white font-medium text-sm pr-4 leading-relaxed">
                            {t('landing.apps.prediction.question2')}
                          </p>
                          <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg">
                            65%
                          </div>
                        </div>
                        <div className="relative h-3 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full transition-all duration-700"
                            style={{ width: '65%' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* CTA按钮 */}
                    <Link
                      href="/markets/automotive"
                      className="group/btn relative block w-full overflow-hidden rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 group-hover/btn:from-yellow-400 group-hover/btn:to-amber-500 transition-all duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                      <div className="relative py-5 flex items-center justify-center gap-4">
                        <i className="fa fa-rocket text-xl text-black"></i>
                        <span className="text-black text-lg font-black uppercase tracking-wide">
                          {t('landing.apps.prediction.enterLumi')}
                        </span>
                        <svg className="w-6 h-6 text-black transition-transform group-hover/btn:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* 右侧警报信息显示区 - 黑天鹅终端风格 */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-zinc-900/95 to-neutral-900/90 rounded-xl overflow-hidden border-2 border-amber-700/20 flex flex-col backdrop-blur-sm shadow-2xl shadow-black/50 h-full">
                  {/* 终端顶部栏 */}
                  <div className="bg-gradient-to-r from-zinc-900/98 to-neutral-900/98 border-b border-amber-600/30 px-4 py-2 flex items-center justify-between shadow-lg shadow-black/40">
                    <div className="flex items-center gap-3">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-sm font-bold tracking-wide">
                        ═══ {t('landing.terminal.liveAlertStream')} ═══
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-amber-400 animate-pulse shadow-lg shadow-amber-500/60' : 'bg-red-400'}`}></span>
                      <span className={`font-mono text-xs ${wsConnected ? 'text-amber-400' : 'text-red-400'}`}>
                        {wsConnected ? 'LIVE' : t('landing.terminal.offline').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* 终端内容区 */}
                  <div className="bg-gradient-to-b from-zinc-950 to-neutral-950/90 p-4 flex-1 flex flex-col">
                    {/* 实时数据流标题 */}
                    <div className="mb-2 text-xs text-amber-400 font-mono border-b border-amber-900/30 pb-2">
                      <div className="flex items-center gap-2">
                        <span>🔴 LIVE</span>
                        <span className="text-stone-500">|</span>
                        <span className="text-stone-400">{t('landing.terminal.liveMarketData')}</span>
                      </div>
                    </div>
                    {/* 实时数据流 - 终端样式 */}
                    <div className="space-y-1 flex-1 overflow-y-auto font-mono text-xs" style={{ willChange: 'contents' }}>
                      {realtimeData.length === 0 ? (
                        <div className="text-center py-10 text-stone-600">
                          <div className="text-2xl mb-2 text-amber-600/60">[ {t('landing.terminal.standby').toUpperCase()} ]</div>
                          <p className="text-xs text-stone-500">{t('landing.terminal.connectingBinance')}</p>
                          <div className="mt-2 text-amber-500 animate-pulse">█</div>
                        </div>
                      ) : (
                        realtimeData.map((alert, index) => (
                          <div
                            key={`alert-${alert.id}-${index}`}
                            className="hover:bg-zinc-900/50 px-2 py-1.5 rounded transition-colors border-l-2 border-transparent hover:border-amber-500"
                          >
                            <div className="flex items-start gap-2">
                              {/* 时间戳 */}
                              <span className="text-stone-600 shrink-0 text-[10px]">
                                [{alert.timestamp}]
                              </span>
                              
                              {/* 严重程度 */}
                              <span className={`font-bold shrink-0 w-12 text-[10px] ${
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
                              <span className="text-amber-400 shrink-0 w-20 text-[10px]">
                                {alert.asset}
                              </span>
                              
                              {/* 变化 */}
                              <span className={`shrink-0 w-14 text-[10px] ${
                                alert.change < 0 ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                              </span>
                              
                              {/* 消息 */}
                              <span className="text-stone-400 flex-1 truncate text-[10px]">
                                {alert.message}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 终端底部状态 */}
                    <div className="mt-3 pt-3 border-t border-amber-900/30">
                      <div className="grid grid-cols-2 gap-2">
                        {/* 左侧：统计 */}
                        <div className="border border-amber-900/30 p-2 rounded bg-zinc-900/50">
                          <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-[10px] mb-1 font-bold tracking-wide">
                            ╔═ {t('landing.terminal.stats').toUpperCase()} ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.recent')}:</span>
                              <span className="text-white">{realtimeData.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.critical')}:</span>
                              <span className="text-red-500">
                                {realtimeData.filter(a => a.severity === 'critical').length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.total')}:</span>
                              <span className="text-amber-400">{stats.totalAlerts}</span>
                            </div>
                          </div>
                        </div>

                        {/* 右侧：系统状态 */}
                        <div className="border border-amber-900/30 p-2 rounded bg-zinc-900/50">
                          <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-[10px] mb-1 font-bold tracking-wide">
                            ╔═ {t('landing.terminal.system').toUpperCase()} ═╗
                          </div>
                          <div className="space-y-0.5 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.ws')}:</span>
                              <span className={wsConnected ? 'text-amber-400' : 'text-red-400'}>
                                {wsConnected ? `✓ ${t('landing.terminal.online').toUpperCase()}` : `✗ ${t('landing.terminal.offline').toUpperCase()}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.monitor')}:</span>
                              <span className="text-amber-400">✓ {t('landing.terminal.active').toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">{t('landing.terminal.assets')}:</span>
                              <span className="text-amber-400">{stats.monitoredAssets}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 查看完整终端链接 */}
                      <div className="mt-2 text-center">
                        <Link 
                          href="/black-swan"
                          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[10px] transition-colors"
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
          background: #0a0a0a !important;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(30, 30, 35, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(25, 25, 30, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0d0d0d 0%, #0a0a0a 50%, #080808 100%) !important;
          padding-top: 0 !important;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        html {
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
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
          background: linear-gradient(135deg, #0d0d0d 0%, #0a0a0a 50%, #080808 100%);
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

        /* LUMI 高级艺术字 - 白金配色 */
        .gradient-text-lumi {
          color: #ffffff;
          font-weight: 900;
          letter-spacing: 0.05em;
          position: relative;
          text-transform: uppercase;
          /* 多层阴影打造立体感 */
          text-shadow: 
            /* 黄色描边层 */
            -1px -1px 0 #facc15,
            1px -1px 0 #facc15,
            -1px 1px 0 #facc15,
            1px 1px 0 #facc15,
            -2px -2px 0 #eab308,
            2px -2px 0 #eab308,
            -2px 2px 0 #eab308,
            2px 2px 0 #eab308,
            /* 立体深度 */
            0 3px 0 #ca8a04,
            0 6px 0 #a16207,
            0 9px 0 #854d0e,
            0 12px 0 #713f12,
            /* 深色阴影 */
            0 15px 20px rgba(0, 0, 0, 0.4),
            0 20px 40px rgba(0, 0, 0, 0.3);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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
          background: #0d0d0d;
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
          background: #0d0d0d;
        }

        /* Firefox 滚动条 */
        * {
          scrollbar-width: thin;
          scrollbar-color: #0f5132 #0d0d0d;
        }

        /* 动态下滑指引样式 - 双V形箭头 */
        .scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .scroll-indicator:hover {
          transform: translateY(-4px);
        }

        .scroll-text {
          animation: fadeInOut 2s ease-in-out infinite;
        }

        .chevron-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 85px;
        }

        .chevron {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }

        .chevron-1 {
          animation: chevronFloat 2s ease-in-out infinite;
        }

        .chevron-2 {
          animation: chevronFloat 2s ease-in-out 0.5s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes chevronFloat {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-15px);
          }
          25% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
            transform: translateX(-50%) translateY(15px);
          }
          75% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(45px);
          }
        }

        /* 点击下滑指引时的滚动效果 */
        .scroll-indicator:active {
          transform: translateY(2px);
        }

        .scroll-indicator:hover .chevron {
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
        }

        /* 高级按钮光效动画 */
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        
        /* 虫洞按钮动画 */
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes particle-float {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tw-translate-x, 0), -20px) scale(1);
            opacity: 0;
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        
        .animate-particle {
          animation: particle-float 2s ease-out infinite;
        }
      `}</style>
      </div>
    </>
  )
}
