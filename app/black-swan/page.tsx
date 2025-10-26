'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// TradingView Widget 声明
declare global {
  interface Window {
    TradingView: any;
  }
}

// 闪崩事件数据类型
interface CrashEvent {
  id: string;
  date: string;
  timestamp: string;
  asset: string;
  crashPercentage: number;
  duration: string;
  description: string;
  details?: {
    previous_price?: number;
    current_price?: number;
    price_change?: number;
  };
}

// 实时数据类型
interface RealtimeAlert {
  id: string;
  timestamp: string;
  asset: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  change: number;
}

export default function BlackSwanPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CrashEvent | null>(null);
  const [timeRange, setTimeRange] = useState<number>(3); // 默认3小时
  const [realtimeData, setRealtimeData] = useState<RealtimeAlert[]>([]);
  const [crashEvents, setCrashEvents] = useState<CrashEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAlerts: 0, monitoredAssets: 0 });
  
  // TradingView Widget 容器引用
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);

  // 加载历史闪崩事件和统计数据
  useEffect(() => {
    const loadCrashEvents = async () => {
      try {
        // 使用相对路径的 API（兼容 Vercel 部署）
        const response = await fetch('/api/alerts/real-crash-events');
        const result = await response.json();
        if (result.success && result.data) {
          setCrashEvents(result.data);
          // 自动选择第一个事件
          if (result.data.length > 0 && !selectedEvent) {
            setSelectedEvent(result.data[0]);
          }
        }
      } catch (error) {
        console.error('加载闪崩事件失败:', error);
      }
    };

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
      } finally {
        setLoading(false);
      }
    };

    loadCrashEvents();
    loadStats();
  }, []);

  // 连接真实的预警系统 WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let isUnmounting = false;

    const connectWebSocket = () => {
      if (isUnmounting) return;
      
      // 检测是否在生产环境（Vercel）- 跳过 WebSocket 连接
      const isProduction = process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
      
      if (isProduction) {
        console.log('⚠️  生产环境：WebSocket 功能已禁用，使用静态数据');
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
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 处理预警消息
            if (data.type === 'alert' && data.data) {
              const alert = data.data;
              
              // 解析 details 以获取价格变化
              let change = 0;
              if (alert.details && alert.details.price_change) {
                change = alert.details.price_change * 100; // 转换为百分比
              }
              
              // 确定严重程度
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
              
              setRealtimeData(prev => [newAlert, ...prev].slice(0, 20));
            }
          } catch (e) {
            console.error('解析预警数据出错:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
        };

        ws.onclose = () => {
          if (!isUnmounting) {
            console.log('❌ 预警系统连接断开，5秒后重连...');
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

    // 首次加载时获取历史预警数据
    const fetchHistoricalAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        const result = await response.json();
        
        if (result.success && result.data) {
          const alerts: RealtimeAlert[] = result.data.map((item: any, index: number) => {
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

    // 初始化
    fetchHistoricalAlerts();
    connectWebSocket();

    // 清理
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

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // TradingView Widget 初始化
  useEffect(() => {
    if (!selectedEvent) return;

    // 加载 TradingView 脚本
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (chartContainerRef.current && window.TradingView) {
        // 清理旧的 widget
        if (widgetInstanceRef.current) {
          chartContainerRef.current.innerHTML = '';
        }

        // 将资产名称转换为 TradingView 格式
        let symbol = selectedEvent.asset.replace('/', '');
        let exchange = 'BINANCE';
        
        // 处理特殊资产和早期事件
        const eventYear = new Date(selectedEvent.timestamp).getFullYear();
        
        // 对于2017年之前的事件，使用 BITSTAMP（更早的交易所）
        if (eventYear < 2017 && symbol === 'BTCUSDT') {
          symbol = 'BTCUSD';
          exchange = 'BITSTAMP';
        }
        
        // 对于ALTCOINS，使用BTC代替
        if (symbol === 'ALTCOINS') {
          symbol = 'BTCUSDT';
          exchange = 'BINANCE';
        }
        
        // 对于LUNA，如果是早期事件，使用现有数据
        if (symbol === 'LUNAUSDT') {
          exchange = 'BINANCE';
        }
        
        // 根据时间范围确定图表间隔
        let interval: string = '60'; // 默认1小时
        if (timeRange === 1) interval = '15';
        else if (timeRange === 3) interval = '60';
        else if (timeRange === 6) interval = '240';
        else if (timeRange === 12) interval = 'D';
        else if (timeRange === 24) interval = 'D';

        // 计算事件时间范围 - 让事件时间点在图表中央
        const eventDate = new Date(selectedEvent.timestamp);
        console.log('🔍 Debug - Event timestamp:', selectedEvent.timestamp);
        console.log('🔍 Debug - Parsed event date:', eventDate);
        console.log('🔍 Debug - Time range:', timeRange);
        
        const hoursBeforeEvent = Math.floor(timeRange / 2); // 事件前的时间
        const hoursAfterEvent = timeRange - hoursBeforeEvent; // 事件后的时间
        
        console.log('🔍 Debug - Hours before:', hoursBeforeEvent);
        console.log('🔍 Debug - Hours after:', hoursAfterEvent);
        
        const fromDate = new Date(eventDate.getTime() - hoursBeforeEvent * 60 * 60 * 1000);
        const toDate = new Date(eventDate.getTime() + hoursAfterEvent * 60 * 60 * 1000);
        
        const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
        const toTimestamp = Math.floor(toDate.getTime() / 1000);
        const eventTimestamp = Math.floor(eventDate.getTime() / 1000);

        console.log('📊 Chart Setup:');
        console.log('  Symbol:', `${exchange}:${symbol}`);
        console.log('  Event Time:', eventDate.toISOString());
        console.log('  Event Time (Local):', eventDate.toLocaleString('zh-CN'));
        console.log('  Range:', fromDate.toISOString(), 'to', toDate.toISOString());
        console.log('  Range (Local):', fromDate.toLocaleString('zh-CN'), 'to', toDate.toLocaleString('zh-CN'));
        console.log('  Unix Timestamps:', fromTimestamp, 'to', toTimestamp);
        console.log('  Event Timestamp:', eventTimestamp);
        console.log('  Selected Event:', selectedEvent);

        // 创建新的 TradingView Widget
        widgetInstanceRef.current = new window.TradingView.widget({
          width: '100%',
          height: 350,
          symbol: `${exchange}:${symbol}`,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'zh_CN',
          toolbar_bg: '#000000',
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: chartContainerRef.current.id,
          backgroundColor: '#000000',
          gridColor: 'rgba(0, 255, 0, 0.1)',
          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
          disabled_features: [
            'header_widget',
            'header_symbol_search',
            'symbol_search_hot_key',
            'header_resolutions',
            'header_interval_dialog_button',
            'show_interval_dialog_on_key_press',
            'header_chart_type',
            'header_settings',
            'header_indicators',
            'header_compare',
            'header_undo_redo',
            'header_screenshot',
            'header_fullscreen_button',
            'use_localstorage_for_settings',
            'left_toolbar',
            'control_bar',
            'timeframes_toolbar',
            'volume_force_overlay',
          ],
          enabled_features: [
            'hide_left_toolbar_by_default',
          ],
          studies: [],
          autosize: true,
          // onChartReady 是配置对象的一部分
          onChartReady: function() {
            console.log('✅ Chart ready! Now setting time range...');
            
            try {
              const chart = widgetInstanceRef.current.activeChart();
              console.log('📊 Got active chart');
              
              // 多次尝试设置可见范围
              const attempts = [3000, 5000, 7000];
              attempts.forEach((delay) => {
                setTimeout(() => {
                  console.log(`🎯 Setting range (after ${delay}ms)...`);
                  chart.setVisibleRange({ 
                    from: fromTimestamp, 
                    to: toTimestamp 
                  }, { 
                    applyDefaultRightMargin: false 
                  }).then(() => {
                    console.log(`✅ Range set successfully at ${delay}ms!`);
                    console.log(`   From: ${new Date(fromTimestamp * 1000).toLocaleString()}`);
                    console.log(`   To: ${new Date(toTimestamp * 1000).toLocaleString()}`);
                  }).catch((err: any) => {
                    console.warn(`⚠️ setVisibleRange failed at ${delay}ms:`, err);
                  });
                }, delay);
              });
            } catch (err) {
              console.error('❌ Error accessing chart:', err);
            }
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (widgetInstanceRef.current) {
        widgetInstanceRef.current = null;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [selectedEvent, timeRange]);

  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* 终端风格顶部导航 */}
      <div className="bg-gray-900 border-b border-green-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between font-mono">
          <Link href="/markets" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm">
            <span>[←</span>
            <span>BACK TO MARKETS]</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/image/black-swan.png" alt="Black Swan" className="w-6 h-6 object-contain brightness-125" />
            <h1 className="text-green-400 text-lg font-bold">BLACK SWAN DETECTION SYSTEM</h1>
            <Link 
              href="/black-swan-terminal" 
              className="ml-3 px-3 py-1 bg-green-600 hover:bg-green-500 text-black text-xs font-bold rounded transition-colors border border-green-400"
              title="切换到完整终端"
            >
              [FULL TERMINAL]
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs">MONITORING</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="container mx-auto px-4 py-6">
        {/* 终端风格欢迎横幅 */}
        <div className="mb-6 bg-gray-900 border-2 border-green-500/50 p-6 font-mono">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 text-sm mb-2">
                ╔═══════════════════════════════════════════════════════╗
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                MARKET ANOMALY DETECTION PLATFORM
              </h2>
              <p className="text-gray-400 text-sm">
                &gt; Real-time alert system powered by AI algorithms
              </p>
              <p className="text-gray-400 text-sm">
                &gt; Early identification of black swan events
              </p>
              <div className="text-green-400 text-sm mt-2">
                ╚═══════════════════════════════════════════════════════╝
              </div>
            </div>
            <div className="opacity-30">
              <img src="/image/black-swan.png" alt="Black Swan" className="w-24 h-24 object-contain brightness-125" />
            </div>
          </div>
        </div>

        {/* 三栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：历史事件选择器（终端风格）*/}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border-2 border-green-900 overflow-hidden sticky top-[6rem] flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
              {/* 终端标题栏 */}
              <div className="bg-gray-900 border-b border-green-500 px-4 py-2">
                <h2 className="text-sm font-bold text-green-400 font-mono flex items-center gap-2">
                  ═══ HISTORICAL EVENTS ═══
                </h2>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  &gt; Real crypto crash history
                </div>
              </div>
              
              <div className="p-4 bg-black flex-1 overflow-y-auto">
                {/* 日期输入 */}
                <div className="mb-4">
                  <label className="block text-xs font-mono text-gray-500 mb-2">
                    &gt; SELECT DATE:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-green-900 text-green-400 font-mono text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* 历史事件列表 */}
                <div className="space-y-2 mb-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 32rem)' }}>
                  <div className="text-xs font-mono text-gray-500 mb-2">
                    &gt; CRASH EVENTS: {loading ? '...' : crashEvents.length}
                  </div>
                  {loading ? (
                    <div className="text-center py-4 text-gray-600 font-mono text-xs">
                      Loading events...
                    </div>
                  ) : crashEvents.length === 0 ? (
                    <div className="text-center py-4 text-gray-600 font-mono text-xs">
                      No crash events found
                    </div>
                  ) : crashEvents.map((event, index) => (
                    <button
                      key={`${event.id}-${index}`}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-3 border transition-all font-mono text-xs ${
                        selectedEvent?.id === event.id
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-green-900 bg-gray-900 hover:border-green-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-cyan-400">{event.asset}</span>
                        <span className={`font-bold ${
                          event.crashPercentage < 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {event.crashPercentage}%
                        </span>
                      </div>
                      <div className="text-gray-500 mb-1">
                        {event.date}
                      </div>
                      <div className="text-gray-600">
                        Duration: {event.duration}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 时间范围选择 */}
                <div className="pt-4 border-t border-green-900">
                  <label className="block text-xs font-mono text-gray-500 mb-2">
                    &gt; TIME RANGE:
                  </label>
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[1, 3, 6].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setTimeRange(hours)}
                        className={`px-2 py-1.5 text-xs font-mono transition-all border ${
                          timeRange === hours
                            ? 'bg-green-600 text-black border-green-400'
                            : 'bg-gray-900 text-gray-400 border-green-900 hover:border-green-500'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[12, 24].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setTimeRange(hours)}
                        className={`px-2 py-1.5 text-xs font-mono transition-all border ${
                          timeRange === hours
                            ? 'bg-green-600 text-black border-green-400'
                            : 'bg-gray-900 text-gray-400 border-green-900 hover:border-green-500'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中间：数据分析区域（终端风格）*/}
          <div className="lg:col-span-6">
            <div className="bg-gray-900 border-2 border-green-900 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
              {/* 终端标题栏 */}
              <div className="bg-gray-900 border-b border-green-500 px-4 py-2">
                <h2 className="text-sm font-bold text-green-400 font-mono">
                  ═══ CRASH DATA ANALYSIS ═══
                </h2>
              </div>

              <div className="bg-black p-4 flex-1 overflow-y-auto">
                {selectedEvent ? (
                  <div className="space-y-4">
                    {/* 事件概览 - 终端样式 */}
                    <div className="border-2 border-green-500/50 p-4 bg-gray-900/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-cyan-400 font-mono text-lg font-bold mb-2">
                            {selectedEvent.asset}
                          </div>
                          <div className="text-gray-400 font-mono text-xs">
                            &gt; {selectedEvent.description}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-red-400 font-mono">
                            {selectedEvent.crashPercentage}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {selectedEvent.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-mono border-t border-green-900 pt-2">
                        <div>
                          &gt; Date: {selectedEvent.date}
                        </div>
                        <div>
                          &gt; Time: {new Date(selectedEvent.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          &gt; Window: {timeRange}h
                        </div>
                      </div>
                    </div>

                    {/* 图表区域 - TradingView Widget */}
                    <div className="flex-shrink-0">
                      <div className="text-green-400 font-mono text-xs mb-2 flex items-center justify-between">
                        <span>&gt; PRICE CHART:</span>
                        <span className="text-gray-600">
                          Powered by TradingView
                        </span>
                      </div>
                      <div className="bg-black border-2 border-green-900 overflow-hidden">
                        <div 
                          id="tradingview-widget-container" 
                          ref={chartContainerRef}
                          className="w-full bg-black"
                          style={{ height: '350px' }}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-gray-600 font-mono text-xs">
                          &gt; Chart: {(() => {
                            const eventYear = new Date(selectedEvent.timestamp).getFullYear();
                            const asset = selectedEvent.asset.replace('/', '');
                            let displayExchange = 'BINANCE';
                            let displaySymbol = asset;
                            
                            if (eventYear < 2017 && asset === 'BTCUSDT') {
                              displayExchange = 'BITSTAMP';
                              displaySymbol = 'BTCUSD';
                            } else if (asset === 'ALTCOINS') {
                              displaySymbol = 'BTCUSDT';
                            }
                            
                            return `${displayExchange}:${displaySymbol}`;
                          })()} | Event: {selectedEvent.date} | Window: {timeRange}h
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-gray-500">Timeline:</span>
                          <span className="text-cyan-400">←{Math.floor(timeRange/2)}h before</span>
                          <span className="text-red-400 font-bold">⚠ CRASH EVENT</span>
                          <span className="text-cyan-400">{timeRange - Math.floor(timeRange/2)}h after→</span>
                        </div>
                        <div className="text-yellow-400 font-mono text-xs">
                          ⚡ Chart auto-focused on crash time
                        </div>
                      </div>
                    </div>

                    {/* 数据详情 - 终端网格 */}
                    <div>
                      <div className="text-green-400 font-mono text-xs mb-2">
                        &gt; DATA METRICS:
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-900 border border-green-900 p-3">
                          <div className="text-gray-500 font-mono text-xs mb-1">Peak Price</div>
                          <div className="text-xl font-bold text-white font-mono">
                            {selectedEvent.details?.previous_price 
                              ? `$${selectedEvent.details.previous_price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                              : 'N/A'}
                          </div>
                          <div className="text-gray-600 font-mono text-xs mt-1">Pre-crash</div>
                        </div>
                        <div className="bg-gray-900 border border-red-500 p-3">
                          <div className="text-gray-500 font-mono text-xs mb-1">Bottom Price</div>
                          <div className="text-xl font-bold text-red-400 font-mono">
                            {selectedEvent.details?.current_price 
                              ? `$${selectedEvent.details.current_price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                              : 'N/A'}
                          </div>
                          <div className="text-gray-600 font-mono text-xs mt-1">At crash</div>
                        </div>
                        <div className="bg-gray-900 border border-orange-500 p-3">
                          <div className="text-gray-500 font-mono text-xs mb-1">Price Change</div>
                          <div className="text-xl font-bold text-orange-400 font-mono">
                            {selectedEvent.crashPercentage}%
                          </div>
                          <div className="text-gray-600 font-mono text-xs mt-1">Total drop</div>
                        </div>
                        <div className="bg-gray-900 border border-purple-500 p-3">
                          <div className="text-gray-500 font-mono text-xs mb-1">Duration</div>
                          <div className="text-xl font-bold text-purple-400 font-mono">
                            {selectedEvent.duration}
                          </div>
                          <div className="text-gray-600 font-mono text-xs mt-1">Event length</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4 text-gray-700">[ ? ]</div>
                    <p className="text-gray-600 font-mono text-sm">
                      &gt; Please select an event from the left panel
                    </p>
                    <div className="mt-3 text-green-500 font-mono text-xs animate-pulse">
                      █
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：实时数据终端（终端风格）*/}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-xl shadow-2xl overflow-hidden sticky top-[6rem] border-2 border-green-500/50">
              {/* 终端顶部栏 */}
              <div className="bg-gray-900 border-b border-green-500 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-mono text-sm font-bold">
                    ═══ LIVE ALERT STREAM ═══
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 font-mono text-xs">MONITORING</span>
                </div>
              </div>

              {/* 终端内容区 */}
              <div className="bg-black p-4">
                {/* 实时数据流 - 终端样式 */}
                <div className="space-y-1 max-h-[500px] overflow-y-auto font-mono text-xs">
                  {realtimeData.length === 0 ? (
                    <div className="text-center py-10 text-gray-600">
                      <div className="text-2xl mb-2">[ STANDBY ]</div>
                      <p className="text-xs">Waiting for alert stream...</p>
                      <div className="mt-2 text-green-500">█</div>
                    </div>
                  ) : (
                    realtimeData.map((alert, index) => (
                      <div
                        key={`alert-${alert.id}-${index}`}
                        className="hover:bg-gray-900/50 px-2 py-1.5 rounded transition-colors border-l-2 border-transparent hover:border-green-500"
                      >
                        <div className="flex items-start gap-2">
                          {/* 时间戳 */}
                          <span className="text-gray-600 shrink-0">
                            [{alert.timestamp}]
                          </span>
                          
                          {/* 严重程度 */}
                          <span className={`font-bold shrink-0 w-20 ${
                            alert.severity === 'critical'
                              ? 'text-red-500'
                              : alert.severity === 'high'
                              ? 'text-orange-500'
                              : 'text-yellow-500'
                          }`}>
                            {alert.severity === 'critical' ? 'CRITICAL' : 
                             alert.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                          </span>
                          
                          {/* 资产 */}
                          <span className="text-cyan-400 shrink-0 w-24">
                            {alert.asset}
                          </span>
                          
                          {/* 变化 */}
                          <span className={`shrink-0 w-16 ${
                            alert.change < 0 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                          </span>
                          
                          {/* 消息 */}
                          <span className="text-gray-400 flex-1 truncate">
                            {alert.message}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 终端底部状态 */}
                <div className="mt-4 pt-3 border-t border-green-900">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 左侧：统计 */}
                    <div className="border border-green-900 p-2 rounded">
                      <div className="text-green-400 font-mono text-xs mb-1.5 font-bold">
                        ╔═ STATISTICS ═╗
                      </div>
                      <div className="space-y-1 text-xs font-mono">
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
                      <div className="text-green-400 font-mono text-xs mb-1.5 font-bold">
                        ╔═ SYSTEM ═╗
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-500">WS:</span>
                          <span className="text-green-400">✓ ONLINE</span>
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

                  {/* 终端提示 */}
                  <div className="mt-3 text-center">
                    <Link 
                      href="/black-swan-terminal"
                      className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
                    >
                      <span>→</span>
                      <span>Open Full Terminal View</span>
                      <span>←</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 动画和滚动条样式 */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        /* 终端风格滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
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
  );
}

