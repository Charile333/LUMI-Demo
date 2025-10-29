'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import CrashEventChart from '@/components/CrashEventChart';

// TradingView Widget 声明（已弃用，改用 Lightweight Charts）
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
  crashStart?: string;  // 🟠 崩盘开始时刻（真实数据）
  crashEnd?: string;    // 🟢 崩盘结束时刻（真实数据）
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
  const { t, i18n } = useTranslation();
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // 'all' 或具体日期
  const [selectedEvent, setSelectedEvent] = useState<CrashEvent | null>(null);
  // 移除 timeRange 状态 - 现在使用固定的前后6小时范围
  const [realtimeData, setRealtimeData] = useState<RealtimeAlert[]>([]);
  const [crashEvents, setCrashEvents] = useState<CrashEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAlerts: 0, monitoredAssets: 0 });
  const [mounted, setMounted] = useState(false); // 防止 hydration 错误
  
  // TradingView Widget 容器引用（已弃用，保留以供参考）
  // const chartContainerRef = useRef<HTMLDivElement>(null);
  // const widgetInstanceRef = useRef<any>(null);

  // 客户端挂载标记
  useEffect(() => {
    setMounted(true);
  }, []);

  // 安全的时间格式化函数（防止 hydration 错误）
  const formatTime = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // 获取所有唯一日期（从事件中提取）
  const getUniqueDates = (): string[] => {
    const dates = crashEvents.map(event => event.date);
    return Array.from(new Set(dates)).sort((a, b) => {
      // 按日期降序排列（最新的在前）
      return new Date(b).getTime() - new Date(a).getTime();
    });
  };

  // 根据选中的日期过滤事件
  const getFilteredEvents = (): CrashEvent[] => {
    if (selectedDateFilter === 'all') {
      return crashEvents;
    }
    return crashEvents.filter(event => event.date === selectedDateFilter);
  };

  // 加载历史闪崩事件和统计数据
  useEffect(() => {
    const loadCrashEvents = async () => {
      try {
        // Use i18n.language to get current language
        const currentLang = i18n.language || 'zh';
        // 使用相对路径的 API（兼容 Vercel 部署），传递语言参数
        const response = await fetch(`/api/alerts/real-crash-events?lang=${currentLang}`);
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
  }, [i18n.language]); // 当语言切换时重新加载数据

  // 连接真实的预警系统 WebSocket 或轮询
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
            // 合并新旧数据，保留最近20条
            const merged = [...newAlerts, ...prev.filter(a => !a.id.includes('-' + Date.now()))];
            return merged.slice(0, 20);
          });
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
                timestamp: formatTime(item.timestamp),
                asset: item.symbol.replace('USDT', '/USDT'),
                severity: severity,
                message: item.message,
                change: change
              };
            });
            
            setRealtimeData(prev => [...newAlerts, ...prev].slice(0, 20));
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
                timestamp: formatTime(alert.timestamp),
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
              timestamp: formatTime(item.timestamp),
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
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      if (binanceTimer) {
        clearInterval(binanceTimer);
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

  // ===== 已弃用：TradingView Widget 初始化 =====
  // 现在使用 Lightweight Charts + 币安API
  // 保留此代码以供参考
  /*
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
        
        // 根据时间范围确定图表间隔（优化后）
        let interval: string = '15'; // 默认15分钟
        if (timeRange === 1) interval = '5';      // 1小时：5分钟K线
        else if (timeRange === 3) interval = '15';  // 3小时：15分钟K线
        else if (timeRange === 6) interval = '30';  // 6小时：30分钟K线
        else if (timeRange === 12) interval = '60'; // 12小时：1小时K线
        else if (timeRange === 24) interval = '60'; // 24小时：1小时K线

        // 🎯 优化的时间范围算法 - 黄金分割点布局
        const eventDate = new Date(selectedEvent.timestamp);
        const crashPercentage = Math.abs(selectedEvent.crashPercentage);
        
        console.log('🔍 Debug - Event timestamp:', selectedEvent.timestamp);
        console.log('🔍 Debug - Parsed event date:', eventDate);
        console.log('🔍 Debug - Time range:', timeRange);
        console.log('🔍 Debug - Crash percentage:', crashPercentage);
        
        // 根据崩盘幅度动态调整时间范围（波动性越大，时间范围越宽）
        const volatilityFactor = Math.min(crashPercentage / 20, 0.5); // 最多增加50%
        const adjustedTimeRange = timeRange * (1 + volatilityFactor);
        
        console.log('📊 Volatility factor:', volatilityFactor);
        console.log('📊 Adjusted time range:', adjustedTimeRange, 'hours');
        
        // 使用黄金分割比例（0.382:0.618）- 事件点在38.2%位置
        // 这样用户可以看到更多的事后反应，符合分析习惯
        const hoursBeforeEvent = adjustedTimeRange * 0.382; // 事件前38.2%
        const hoursAfterEvent = adjustedTimeRange * 0.618;  // 事件后61.8%
        
        console.log('🔍 Debug - Hours before (38.2%):', hoursBeforeEvent.toFixed(2));
        console.log('🔍 Debug - Hours after (61.8%):', hoursAfterEvent.toFixed(2));
        
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

        // 🎯 方案：由于免费版TradingView限制，添加用户提示
        console.log('⚠️ TradingView免费版API限制：无法通过代码设置时间范围');
        console.log('💡 建议：用户需要手动拖动K线图查看历史数据');
        console.log('');
        console.log('📍 目标时间点：', new Date(eventTimestamp * 1000).toLocaleString('zh-CN'));
        console.log('📅 目标日期：', selectedEvent.date);
        console.log('');
        
        // === 创建标准 TradingView Widget ===
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
          // 🔥 关键：禁用默认时间框架，让我们手动控制
          time_frames: [],
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
            console.log('✅ Chart ready!');
            console.log('');
            console.log('📌 TradingView免费Widget限制说明：');
            console.log('   - 免费版无法通过API自动跳转到历史时间点');
            console.log('   - 图表默认显示最新数据');
            console.log('');
            console.log('🔍 如何查看历史崩盘数据：');
            console.log(`   1. 在图表上向左拖动（使用鼠标）`);
            console.log(`   2. 找到目标日期：${selectedEvent.date}`);
            console.log(`   3. 目标时间：${new Date(eventTimestamp * 1000).toLocaleString('zh-CN')}`);
            console.log('');
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
  */
  // ===== 结束：已弃用的TradingView Widget代码 =====

  useEffect(() => {
    document.body.style.paddingTop = '0';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950">
      {/* 终端风格顶部导航 */}
      <div className="bg-gradient-to-r from-zinc-900/98 via-neutral-900/98 to-zinc-900/98 border-b border-amber-600/30 backdrop-blur-md sticky top-0 z-50 shadow-2xl shadow-black/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between font-mono">
          <Link href="/markets" className="flex items-center gap-2 text-amber-400/90 hover:text-amber-300 transition-colors text-sm group">
            <span className="group-hover:translate-x-[-4px] transition-transform">[←</span>
            <span>{t('nav.backToMarkets').toUpperCase()}]</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/image/black-swan.png" alt="Black Swan" className="w-6 h-6 object-contain brightness-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-lg font-bold tracking-wide">{t('blackSwan.title').toUpperCase()}</h1>
            <Link 
              href="/black-swan-terminal" 
              className="ml-3 px-3 py-1 bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 hover:to-yellow-500 text-black text-xs font-bold rounded transition-all duration-300 border border-amber-500/60 shadow-xl shadow-amber-900/40"
              title={t('blackSwan.openFullTerminal')}
            >
              [{t('blackSwan.fullTerminal')}]
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/60"></span>
              <span className="text-amber-400/90 text-xs">{t('blackSwan.monitoring').toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="container mx-auto px-4 py-6">
        {/* 终端风格欢迎横幅 */}
        <div className="mb-6 bg-gradient-to-br from-zinc-900/95 via-neutral-900/90 to-zinc-900/95 border-2 border-amber-600/25 p-6 font-mono backdrop-blur-sm shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 via-yellow-500/3 to-amber-500/3 animate-pulse"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-amber-500/80 text-sm mb-2">
                ╔═══════════════════════════════════════════════════════╗
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mb-2 tracking-wide">
                {t('blackSwan.subtitle').toUpperCase()}
              </h2>
              <p className="text-stone-300 text-sm flex items-center gap-2">
                <span className="text-amber-500">&gt;</span> {t('blackSwan.realtime')}
              </p>
              <p className="text-stone-300 text-sm flex items-center gap-2">
                <span className="text-amber-500">&gt;</span> {t('blackSwan.earlyDetection')}
              </p>
              <div className="text-amber-500/80 text-sm mt-2">
                ╚═══════════════════════════════════════════════════════╝
              </div>
            </div>
            <div className="opacity-50">
              <img src="/image/black-swan.png" alt="Black Swan" className="w-24 h-24 object-contain brightness-110 drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]" />
            </div>
          </div>
        </div>

        {/* 三栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：历史事件选择器（终端风格）*/}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-zinc-900/95 to-neutral-900/90 border-2 border-amber-700/20 overflow-hidden sticky top-[6rem] flex flex-col backdrop-blur-sm shadow-2xl shadow-black/50" style={{ height: 'calc(100vh - 8rem)' }}>
              {/* 终端标题栏 */}
              <div className="bg-gradient-to-r from-zinc-900/98 to-neutral-900/98 border-b border-amber-600/30 px-4 py-2 shadow-lg shadow-black/40">
                <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono flex items-center gap-2 tracking-wide">
                  ═══ {t('blackSwan.historicalEvents').toUpperCase()} ═══
                </h2>
                <div className="text-xs text-stone-400 font-mono mt-1">
                  <span className="text-amber-500">&gt;</span> {t('blackSwan.realCryptoHistory')}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-b from-zinc-950 to-neutral-950/90 flex-1 overflow-y-auto">
                {/* 日期筛选按钮 */}
                <div className="mb-4">
                  <label className="block text-xs font-mono text-stone-400 mb-2">
                    <span className="text-amber-500">&gt;</span> {t('blackSwan.filterByDate').toUpperCase()}:
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {/* 全部按钮 */}
                    <button
                      onClick={() => setSelectedDateFilter('all')}
                      className={`w-full text-left px-3 py-2 font-mono text-xs transition-all border ${
                        selectedDateFilter === 'all'
                          ? 'bg-gradient-to-r from-amber-600/70 to-yellow-600/70 text-black border-amber-500/50 font-bold shadow-lg shadow-amber-900/40'
                          : 'bg-zinc-900/60 text-stone-400 border-amber-900/20 hover:border-amber-700/40 hover:bg-zinc-800/60'
                      }`}
                    >
                      <span className="mr-2">
                        {selectedDateFilter === 'all' ? '●' : '○'}
                      </span>
                      {t('blackSwan.allDates').toUpperCase()} ({crashEvents.length})
                    </button>
                    
                    {/* 日期按钮列表 */}
                    {!loading && getUniqueDates().map((date) => {
                      const eventsCount = crashEvents.filter(e => e.date === date).length;
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDateFilter(date)}
                          className={`w-full text-left px-3 py-2 font-mono text-xs transition-all border ${
                            selectedDateFilter === date
                              ? 'bg-gradient-to-r from-amber-600/70 to-yellow-600/70 text-black border-amber-500/50 font-bold shadow-lg shadow-amber-900/40'
                              : 'bg-zinc-900/60 text-stone-400 border-amber-900/20 hover:border-amber-700/40 hover:bg-zinc-800/60'
                          }`}
                        >
                          <span className="mr-2">
                            {selectedDateFilter === date ? '●' : '○'}
                          </span>
                          {date} ({eventsCount})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 历史事件列表 */}
                <div className="space-y-2 mb-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 32rem)' }}>
                  <div className="text-xs font-mono text-stone-400 mb-2">
                    <span className="text-amber-500">&gt;</span> CRASH EVENTS: {loading ? '...' : getFilteredEvents().length}
                    {selectedDateFilter !== 'all' && <span className="text-yellow-500"> (filtered by {selectedDateFilter})</span>}
                  </div>
                  {loading ? (
                    <div className="text-center py-4 text-stone-500 font-mono text-xs">
                      {t('blackSwan.loadingEvents')}
                    </div>
                  ) : getFilteredEvents().length === 0 ? (
                    <div className="text-center py-4 text-stone-500 font-mono text-xs">
                      {t('blackSwan.noEventsFound')}
                    </div>
                  ) : getFilteredEvents().map((event, index) => (
                    <button
                      key={`${event.id}-${index}`}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-3 border transition-all font-mono text-xs ${
                        selectedEvent?.id === event.id
                          ? 'border-amber-600/50 bg-gradient-to-r from-amber-900/25 to-yellow-900/20 shadow-lg shadow-amber-900/30'
                          : 'border-amber-900/20 bg-zinc-900/40 hover:border-amber-700/40 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-amber-400">{event.asset}</span>
                        <span className={`font-bold ${
                          event.crashPercentage < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {event.crashPercentage}%
                        </span>
                      </div>
                      <div className="text-stone-300 mb-1">
                        {event.date}
                      </div>
                      <div className="text-stone-500">
                        {t('blackSwan.duration')}: {event.duration}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 时间范围说明（固定为前后6小时）*/}
                <div className="pt-4 border-t border-amber-900/20">
                  <div className="text-xs font-mono text-stone-400">
                    <span className="text-amber-500">&gt;</span> 时间范围：
                  </div>
                  <div className="mt-2 bg-zinc-950/60 border border-amber-900/30 px-3 py-2 text-xs font-mono">
                    <div className="text-amber-300">崩盘前6小时 + 崩盘过程 + 崩盘后6小时</div>
                    <div className="text-stone-500 mt-1">完整展示崩盘事件的前后变化</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中间：数据分析区域（终端风格）*/}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-zinc-900/95 to-neutral-900/90 border-2 border-amber-700/20 overflow-hidden flex flex-col backdrop-blur-sm shadow-2xl shadow-black/50" style={{ height: 'calc(100vh - 8rem)' }}>
              {/* 终端标题栏 */}
              <div className="bg-gradient-to-r from-zinc-900/98 to-neutral-900/98 border-b border-amber-600/30 px-4 py-2 shadow-lg shadow-black/40">
                <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono tracking-wide">
                  ═══ CRASH DATA ANALYSIS ═══
                </h2>
              </div>

              <div className="bg-gradient-to-b from-zinc-950 to-neutral-950/90 p-4 flex-1 overflow-y-auto">
                {selectedEvent ? (
                  <div className="space-y-4">
                    {/* 事件概览 - 终端样式 */}
                    <div className="border-2 border-amber-700/30 p-4 bg-gradient-to-br from-zinc-900/90 to-neutral-900/80 shadow-2xl shadow-black/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 via-yellow-500/3 to-amber-500/3"></div>
                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className="flex-1">
                          <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-lg font-bold mb-2 tracking-wide">
                            {selectedEvent.asset}
                          </div>
                          <div className="text-stone-300 font-mono text-xs">
                            <span className="text-amber-500">&gt;</span> {selectedEvent.description}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500 font-mono">
                            {selectedEvent.crashPercentage}%
                          </div>
                          <div className="text-xs text-stone-400 mt-1 font-mono">
                            {selectedEvent.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-400 font-mono border-t border-amber-900/30 pt-2 relative z-10">
                        <div>
                          <span className="text-amber-500">&gt;</span> Date: {selectedEvent.date}
                        </div>
                        <div>
                          <span className="text-amber-500">&gt;</span> Time: {mounted ? formatTime(selectedEvent.timestamp).substring(0, 5) : '--:--'}
                        </div>
                        <div>
                          <span className="text-amber-500">&gt;</span> Duration: {selectedEvent.duration}
                        </div>
                      </div>
                    </div>

                    {/* 图表区域 - Lightweight Charts + 币安API */}
                    <div className="flex-shrink-0">
                      <div className="text-amber-400 font-mono text-xs mb-2 flex items-center justify-between">
                        <span><span className="text-amber-500">&gt;</span> {t('blackSwan.priceChart')}:</span>
                        <span className="text-emerald-500 text-[10px]">
                          🚀 Powered by Lightweight Charts + Binance API
                        </span>
                      </div>
                      <div className="bg-zinc-950 border-2 border-amber-900/30 overflow-hidden shadow-2xl shadow-black/40">
                        {/* 🎯 新的图表组件 - 显示崩盘时间段（使用真实数据）*/}
                        <CrashEventChart
                          symbol={selectedEvent.asset.replace('ALTCOINS', 'BTC/USDT')}
                          eventTimestamp={(() => {
                            // 确保时间戳转换正确
                            const timestamp = new Date(selectedEvent.timestamp).getTime();
                            const timestampInSeconds = Math.floor(timestamp / 1000);
                            console.log('🕒 Event time conversion:', {
                              original: selectedEvent.timestamp,
                              parsed: new Date(selectedEvent.timestamp).toLocaleString('zh-CN'),
                              timestampMs: timestamp,
                              timestampSec: timestampInSeconds,
                              hasCrashStart: !!selectedEvent.crashStart,
                              hasCrashEnd: !!selectedEvent.crashEnd
                            });
                            return timestampInSeconds;
                          })()}
                          eventDate={selectedEvent.date}
                          duration={selectedEvent.duration}
                          crashPercentage={selectedEvent.crashPercentage}
                          crashStart={selectedEvent.crashStart}
                          crashEnd={selectedEvent.crashEnd}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-stone-500 font-mono text-xs">
                          <span className="text-amber-500">&gt;</span> Chart: {selectedEvent.asset} | Event: {selectedEvent.date} | Duration: {selectedEvent.duration}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                          <span className="text-stone-400">时间段标记：</span>
                          <span className="text-yellow-400 font-bold">▼开始</span>
                          <span className="text-stone-400">→</span>
                          <span className="text-red-500 font-bold text-sm">⚡最低点▲</span>
                          <span className="text-stone-400">→</span>
                          <span className="text-green-400 font-bold">▼恢复</span>
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-600/40 rounded px-3 py-2 mt-2">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 text-lg flex-shrink-0">✅</span>
                            <div className="text-xs font-mono space-y-1">
                              <div className="text-emerald-300 font-bold">
                                智能崩盘时间段分析：
                              </div>
                              <div className="text-stone-300">
                                ✓ <span className="text-emerald-400">折线图</span>清晰展示价格走势（前后6小时）
                              </div>
                              <div className="text-stone-300">
                                ✓ <span className="text-emerald-400">三点标记</span>：<span className="text-yellow-400">▼开始</span> → <span className="text-red-500">⚡最低▲</span> → <span className="text-green-400">▼恢复</span>
                              </div>
                              <div className="text-stone-300">
                                ✓ <span className="text-red-500">最低点</span>位于图表下方，<span className="text-emerald-400">精确定位</span>
                              </div>
                              <div className="text-stone-500 text-[10px] mt-1 flex items-center gap-2">
                                <span>💡 Lightweight Charts + 币安API</span>
                                <span>|</span>
                                <span>🕒 UTC时区</span>
                                <span>|</span>
                                <span>📈 固定前后6小时范围</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 数据详情 - 终端网格 */}
                    <div>
                      <div className="text-amber-400 font-mono text-xs mb-2">
                        <span className="text-amber-500">&gt;</span> {t('blackSwan.dataMetrics')}:
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-zinc-900/90 to-emerald-950/30 border border-emerald-600/30 p-3 shadow-xl shadow-black/30">
                          <div className="text-stone-400 font-mono text-xs mb-1">{t('blackSwan.peakPrice')}</div>
                          <div className="text-xl font-bold text-emerald-400 font-mono">
                            {selectedEvent.details?.previous_price 
                              ? `$${selectedEvent.details.previous_price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                              : 'N/A'}
                          </div>
                          <div className="text-stone-500 font-mono text-xs mt-1">{t('blackSwan.preCrash')}</div>
                        </div>
                        <div className="bg-gradient-to-br from-zinc-900/90 to-rose-950/30 border border-rose-600/30 p-3 shadow-xl shadow-black/30">
                          <div className="text-stone-400 font-mono text-xs mb-1">{t('blackSwan.bottomPrice')}</div>
                          <div className="text-xl font-bold text-rose-400 font-mono">
                            {selectedEvent.details?.current_price 
                              ? `$${selectedEvent.details.current_price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                              : 'N/A'}
                          </div>
                          <div className="text-stone-500 font-mono text-xs mt-1">{t('blackSwan.atCrash')}</div>
                        </div>
                        <div className="bg-gradient-to-br from-zinc-900/90 to-orange-950/30 border border-orange-600/30 p-3 shadow-xl shadow-black/30">
                          <div className="text-stone-400 font-mono text-xs mb-1">{t('blackSwan.priceChange')}</div>
                          <div className="text-xl font-bold text-orange-400 font-mono">
                            {selectedEvent.crashPercentage}%
                          </div>
                          <div className="text-stone-500 font-mono text-xs mt-1">{t('blackSwan.totalDrop')}</div>
                        </div>
                        <div className="bg-gradient-to-br from-zinc-900/90 to-amber-950/30 border border-amber-600/30 p-3 shadow-xl shadow-black/30">
                          <div className="text-stone-400 font-mono text-xs mb-1">{t('blackSwan.duration')}</div>
                          <div className="text-xl font-bold text-amber-400 font-mono">
                            {selectedEvent.duration}
                          </div>
                          <div className="text-stone-500 font-mono text-xs mt-1">{t('blackSwan.eventLength')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4 text-stone-700">[ ? ]</div>
                    <p className="text-stone-400 font-mono text-sm">
                      <span className="text-amber-500">&gt;</span> Please select an event from the left panel
                    </p>
                    <div className="mt-3 text-amber-500 font-mono text-xs animate-pulse">
                      █
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：实时数据终端（终端风格）*/}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-zinc-900/95 to-neutral-900/90 rounded-xl shadow-2xl overflow-hidden sticky top-[6rem] border-2 border-amber-700/20 backdrop-blur-sm shadow-black/50 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
              {/* 终端顶部栏 */}
              <div className="bg-gradient-to-r from-zinc-900/98 to-neutral-900/98 border-b border-amber-600/30 px-4 py-2 flex items-center justify-between shadow-lg shadow-black/40">
                <div className="flex items-center gap-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-sm font-bold tracking-wide">
                    ═══ LIVE ALERT STREAM ═══
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/60"></span>
                </div>
              </div>

              {/* 终端内容区 */}
              <div className="bg-gradient-to-b from-zinc-950 to-neutral-950/90 p-4 flex-1 flex flex-col overflow-hidden">
                {/* 实时数据流 - 终端样式 */}
                <div className="mb-2 text-xs text-amber-400 font-mono border-b border-amber-900/30 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span>🔴 LIVE</span>
                    <span className="text-stone-500">|</span>
                    <span className="text-stone-400">{t('blackSwan.liveMarketData')}</span>
                  </div>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto font-mono text-xs">
                  {realtimeData.length === 0 ? (
                    <div className="text-center py-10 text-stone-500">
                      <div className="text-2xl mb-2 text-stone-700">[ LOADING ]</div>
                      <p className="text-xs">{t('blackSwan.connectingApi')}</p>
                      <div className="mt-2 text-amber-500 animate-pulse">█</div>
                    </div>
                  ) : (
                    realtimeData.map((alert, index) => (
                      <div
                        key={`alert-${alert.id}-${index}`}
                        className="hover:bg-zinc-800/50 px-2 py-1.5 rounded transition-colors border-l-2 border-transparent hover:border-amber-500"
                      >
                        <div className="flex items-start gap-2">
                          {/* 时间戳 */}
                          <span className="text-stone-500 shrink-0">
                            [{alert.timestamp}]
                          </span>
                          
                          {/* 严重程度 */}
                          <span className={`font-bold shrink-0 w-20 ${
                            alert.severity === 'critical'
                              ? 'text-rose-400'
                              : alert.severity === 'high'
                              ? 'text-orange-400'
                              : 'text-yellow-500'
                          }`}>
                            {alert.severity === 'critical' ? 'CRITICAL' : 
                             alert.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                          </span>
                          
                          {/* 资产 */}
                          <span className="text-amber-400 shrink-0 w-24">
                            {alert.asset}
                          </span>
                          
                          {/* 变化 */}
                          <span className={`shrink-0 w-16 ${
                            alert.change < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                          </span>
                          
                          {/* 消息 */}
                          <span className="text-stone-400 flex-1 truncate">
                            {alert.message}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 终端底部状态 */}
                <div className="mt-4 pt-3 border-t border-amber-900/30 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 左侧：统计 */}
                    <div className="border border-amber-900/30 p-2 rounded bg-zinc-900/50">
                      <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-xs mb-1.5 font-bold tracking-wide">
                        ╔═ STATISTICS ═╗
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Recent:</span>
                          <span className="text-white">{realtimeData.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Critical:</span>
                          <span className="text-rose-400">
                            {realtimeData.filter(a => a.severity === 'critical').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Total:</span>
                          <span className="text-amber-400">{stats.totalAlerts}</span>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：系统状态 */}
                    <div className="border border-amber-900/30 p-2 rounded bg-zinc-900/50">
                      <div className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 font-mono text-xs mb-1.5 font-bold tracking-wide">
                        ╔═ SYSTEM ═╗
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-stone-400">WS:</span>
                          <span className="text-emerald-400">✓ ONLINE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Monitor:</span>
                          <span className="text-emerald-400">✓ ACTIVE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Assets:</span>
                          <span className="text-amber-400">{stats.monitoredAssets}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 终端提示 */}
                  <div className="mt-3 text-center">
                    <Link 
                      href="/black-swan-terminal"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-mono text-xs transition-colors"
                    >
                      <span>→</span>
                      <span>{t('blackSwan.openFullTerminal')}</span>
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

        /* 奢华金融风格滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #18181b;
          border: 1px solid #292524;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #78716c 0%, #a8a29e 100%);
          border: 1px solid #78716c;
          border-radius: 2px;
          box-shadow: 0 0 4px rgba(161, 98, 7, 0.2);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #d97706 0%, #f59e0b 100%);
          border-color: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }

        ::-webkit-scrollbar-corner {
          background: #18181b;
        }

        /* Firefox 滚动条 */
        * {
          scrollbar-width: thin;
          scrollbar-color: #78716c #18181b;
        }
      `}</style>
    </div>
  );
}

