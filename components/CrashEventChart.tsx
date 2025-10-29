'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
import { getBinanceKlines, KlineData } from '@/utils/binanceAPI';

interface CrashEventChartProps {
  symbol: string;           // 交易对，如 'BTCUSDT'
  eventTimestamp: number;   // 事件时间戳（秒）- 崩盘最低点时刻
  eventDate: string;        // 事件日期显示
  duration: string;         // 崩盘持续时间，如 '24h', '72h', '12h'
  crashPercentage: number;  // 崩盘幅度
  crashStart?: string;      // 🟠 崩盘开始时刻（ISO字符串）
  crashEnd?: string;        // 🟢 崩盘结束时刻（ISO字符串）
}

export default function CrashEventChart({
  symbol,
  eventTimestamp,
  eventDate,
  duration,
  crashPercentage,
  crashStart,
  crashEnd,
}: CrashEventChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [klineCount, setKlineCount] = useState(0);

  useEffect(() => {
    if (!chartContainerRef.current) {
      console.error('❌ Chart container not found');
      return;
    }

    // 清理旧的图表
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.error('Error removing old chart:', e);
      }
      chartRef.current = null;
      seriesRef.current = null;
    }

    try {
      console.log('📊 Creating Lightweight Chart...');
      
      // 创建图表
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 350,
        layout: {
          background: { color: '#000000' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { color: 'rgba(0, 255, 0, 0.1)' },
          horzLines: { color: 'rgba(0, 255, 0, 0.1)' },
        },
        localization: {
          // 🕒 时间格式化 - 解决鼠标悬停时间显示问题
          timeFormatter: (timestamp: number) => {
            const date = new Date(timestamp * 1000);
            const year = date.getUTCFullYear();
            const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
            const day = date.getUTCDate().toString().padStart(2, '0');
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: '#71649C',
          rightOffset: 5,           // 右侧留白
          barSpacing: 8,            // K线间距
          minBarSpacing: 4,         // 最小K线间距
          fixLeftEdge: false,       // 允许左侧滚动
          fixRightEdge: false,      // 允许右侧滚动
          lockVisibleTimeRangeOnResize: true, // 调整大小时保持时间范围
        },
        rightPriceScale: {
          borderColor: '#71649C',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
      });

      console.log('✅ Chart created:', chart);
      console.log('   addLineSeries available:', typeof chart.addLineSeries);

      // 🎨 添加面积图系列（带渐变填充，更美观）
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(0, 230, 118, 0.4)',      // 顶部绿色，40%透明度
        bottomColor: 'rgba(0, 230, 118, 0.0)',   // 底部透明
        lineColor: '#00E676',                    // 线条颜色：亮绿色
        lineWidth: 3,                            // 线条粗细
        lineStyle: 0,                            // 实线
        lineType: 2,                             // 曲线
        crosshairMarkerVisible: true,            // 十字光标标记
        crosshairMarkerRadius: 6,                // 标记半径
        crosshairMarkerBorderColor: '#00E676',   // 标记边框
        crosshairMarkerBackgroundColor: '#000000', // 标记背景
        lastValueVisible: true,                  // 显示最后价格
        priceLineVisible: true,                  // 显示价格线
        priceLineWidth: 1,
        priceLineColor: '#00E676',
        priceLineStyle: 2,                       // 虚线
      });

      console.log('✅ Area series created (line chart with gradient fill)');

      chartRef.current = chart;
      seriesRef.current = areaSeries;

      // 加载数据
      loadData();
    } catch (err) {
      console.error('❌ Error creating chart:', err);
      setError('创建图表失败: ' + (err as Error).message);
      setLoading(false);
    }

    // 响应式调整
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, eventTimestamp, duration, crashStart, crashEnd]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 验证事件时间戳
      const eventDateTime = new Date(eventTimestamp * 1000);
      if (isNaN(eventDateTime.getTime())) {
        throw new Error(`无效的事件时间戳: ${eventTimestamp}`);
      }

      // 🎯 获取真实的崩盘时间段（优先使用真实数据）
      let crashStartTimestamp: number;
      let crashEndTimestamp: number;
      
      if (crashStart && crashEnd) {
        // ✅ 使用真实的崩盘开始和结束时刻（从币安API查询）
        crashStartTimestamp = Math.floor(new Date(crashStart).getTime() / 1000);
        crashEndTimestamp = Math.floor(new Date(crashEnd).getTime() / 1000);
        console.log('✅ 使用真实崩盘时间段数据');
      } else {
        // ⚠️ 回退到估算（基于duration）
        const parseDuration = (durationStr: string): number => {
          const match = durationStr.match(/^(-?\d+)(h|d|m)$/);
          if (!match) return 0;
          const value = parseInt(match[1]);
          const unit = match[2];
          
          if (unit === 'h') return value;
          if (unit === 'd') return value * 24;
          if (unit === 'm') return value / 60;
          return 0;
        };

        const crashDurationHours = parseDuration(duration);
        crashStartTimestamp = Math.floor(eventTimestamp - Math.abs(crashDurationHours * 3600) / 2);
        crashEndTimestamp = Math.floor(eventTimestamp + Math.abs(crashDurationHours * 3600) / 2);
        console.log('⚠️ 使用估算的崩盘时间段（建议更新为真实数据）');
      }

      // 🎯 固定时间范围：崩盘前6小时 + 崩盘本身 + 崩盘后6小时
      const fromTimestamp = Math.floor(crashStartTimestamp - 6 * 3600);  // 前6小时
      const toTimestamp = Math.floor(crashEndTimestamp + 6 * 3600);      // 后6小时

      // 计算总时间范围
      const totalHours = (toTimestamp - fromTimestamp) / 3600;

      // 确定K线周期（根据总时间范围自动调整）
      let interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' = '15m';
      if (totalHours <= 6) interval = '5m';
      else if (totalHours <= 24) interval = '15m';
      else if (totalHours <= 72) interval = '30m';
      else if (totalHours <= 168) interval = '1h';  // 7天
      else interval = '4h';

      // 计算预期的K线数量
      const intervalSeconds = interval === '5m' ? 300 : 
                            interval === '15m' ? 900 : 
                            interval === '30m' ? 1800 : 
                            interval === '1h' ? 3600 : 
                            interval === '4h' ? 14400 : 3600;
      const expectedKlines = Math.floor((toTimestamp - fromTimestamp) / intervalSeconds);

      const crashDurationHours = (crashEndTimestamp - crashStartTimestamp) / 3600;
      
      console.log('');
      console.log('📊 ========== Loading Chart Data (Real Data) ==========');
      console.log('   Symbol:', symbol);
      console.log('   Interval:', interval);
      console.log('   Event Date:', eventDate);
      console.log('   Duration:', duration, '→', crashDurationHours.toFixed(1), 'hours');
      console.log('   ');
      console.log('   🟠 Crash Start:', new Date(crashStartTimestamp * 1000).toLocaleString('zh-CN'));
      console.log('   🔴 Lowest Point:', eventDateTime.toLocaleString('zh-CN'));
      console.log('   🟢 Crash End:', new Date(crashEndTimestamp * 1000).toLocaleString('zh-CN'));
      console.log('   ');
      console.log('   Display Range: ±6h around crash period');
      console.log('   From:', new Date(fromTimestamp * 1000).toLocaleString('zh-CN'));
      console.log('   To:', new Date(toTimestamp * 1000).toLocaleString('zh-CN'));
      console.log('   Total Hours:', totalHours.toFixed(1));
      console.log('   Expected K-lines:', expectedKlines);
      console.log('=======================================================');
      console.log('');

      // 🔥 从币安获取K线数据
      const klineData = await getBinanceKlines(
        symbol.replace('/', ''),
        interval,
        fromTimestamp,
        toTimestamp
      );

      if (klineData.length === 0) {
        throw new Error(`无数据可用于此时间范围 (${eventDate})`);
      }

      setKlineCount(klineData.length);

      // 设置折线数据
      if (seriesRef.current && chartRef.current) {
        console.log('');
        console.log('📊 Processing kline data...');
        console.log('   Total klines:', klineData.length);
        
        if (klineData.length > 0) {
          console.log('   First kline time:', klineData[0].time, '→', new Date(klineData[0].time * 1000).toLocaleString('zh-CN'));
          console.log('   Last kline time:', klineData[klineData.length - 1].time, '→', new Date(klineData[klineData.length - 1].time * 1000).toLocaleString('zh-CN'));
          console.log('   Event should be at point #', Math.floor(klineData.length * 0.382));
          console.log('   Price range:', klineData[0].close, '-', klineData[klineData.length - 1].close);
        }

        // 转换数据格式为折线图数据（使用收盘价）
        const lineData: LineData[] = klineData.map(k => ({
          time: k.time as any,
          value: k.close,  // 使用收盘价作为折线的值
        }));

        seriesRef.current.setData(lineData);

        // 🎯 自动跳转到事件时间点（这是我们想要的！）
        chartRef.current.timeScale().setVisibleRange({
          from: fromTimestamp as any,
          to: toTimestamp as any,
        });

        console.log('');
        console.log('✅ ========== Chart Loaded Successfully ==========');
        console.log('   ✓ 数据点数量:', klineData.length);
        console.log('   ✓ 图表类型: 折线图（收盘价）');
        console.log('   ✓ 时间范围:', new Date(fromTimestamp * 1000).toLocaleString('zh-CN'), 
                    'to', new Date(toTimestamp * 1000).toLocaleString('zh-CN'));
        console.log('   ✓ 崩盘时间段:', new Date(crashStartTimestamp * 1000).toLocaleString('zh-CN'),
                    'to', new Date(crashEndTimestamp * 1000).toLocaleString('zh-CN'));
        console.log('   ✓ 最低点时间:', new Date(eventTimestamp * 1000).toLocaleString('zh-CN'));
        console.log('=================================================');
        console.log('');

        // 🎯 添加崩盘时间段标记（优化版）
        const markers = [];
        
        // 1. 崩盘开始标记（黄色向下箭头）- 只在有真实数据时显示
        if (crashStart && crashEnd) {
          markers.push({
            time: crashStartTimestamp as any,
            position: 'aboveBar' as const,
            color: '#FFC107',  // 金黄色（醒目）
            shape: 'arrowDown' as const,
            text: '开始▼',
            size: 1.5,
          });
        }
        
        // 2. 崩盘最低点（红色箭头，下方显示）- 始终显示
        markers.push({
          time: eventTimestamp as any,
          position: 'belowBar' as const,  // 改为下方，更准确
          color: '#FF1744',  // 鲜红色（强调）
          shape: 'arrowUp' as const,  // 从下方向上指，更直观
          text: '⚡最低点',
          size: 2,
        });
        
        // 3. 崩盘结束标记（绿色向上箭头）- 只在有真实数据时显示
        if (crashStart && crashEnd) {
          markers.push({
            time: crashEndTimestamp as any,
            position: 'aboveBar' as const,  // 改为上方
            color: '#00E676',  // 亮绿色（醒目）
            shape: 'arrowDown' as const,  // 从上方向下指
            text: '▼恢复',
            size: 1.5,
          });
        }
        
        seriesRef.current.setMarkers(markers);
        
        console.log('✅ 时间段标记已添加:', markers.length, '个');
        if (crashStart && crashEnd) {
          console.log('   🟠 崩盘开始 →', new Date(crashStartTimestamp * 1000).toLocaleString('zh-CN'));
          console.log('   🔴 最低点 →', new Date(eventTimestamp * 1000).toLocaleString('zh-CN'));
          console.log('   🟢 崩盘结束 →', new Date(crashEndTimestamp * 1000).toLocaleString('zh-CN'));
        } else {
          console.log('   🔴 最低点 →', new Date(eventTimestamp * 1000).toLocaleString('zh-CN'));
          console.log('   ⚠️ 缺少真实的崩盘开始和结束数据');
        }

        // 稍等后再次确认时间范围（确保设置生效）
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().setVisibleRange({
              from: fromTimestamp as any,
              to: toTimestamp as any,
            });
            console.log('🔒 Time range locked and confirmed');
          }
        }, 500);
        
        // 再次确认（双保险）
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().setVisibleRange({
              from: fromTimestamp as any,
              to: toTimestamp as any,
            });
          }
        }, 1500);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error loading chart:', err);
      setError(err.message || '加载图表失败');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* 图表容器 */}
      <div 
        ref={chartContainerRef}
        style={{ width: '100%', height: '350px' }}
        className="bg-zinc-950"
      />
      
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
          <div className="text-center">
            <div className="text-amber-400 text-lg mb-2">⏳ 加载中...</div>
            <div className="text-stone-400 text-xs font-mono">
              正在从币安获取K线数据
            </div>
          </div>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
          <div className="text-center max-w-md">
            <div className="text-rose-400 text-lg mb-2">❌ 加载失败</div>
            <div className="text-stone-400 text-xs font-mono">
              {error}
            </div>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}
      
      {/* 成功加载后的信息 */}
      {!loading && !error && (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-mono text-stone-500 flex items-center gap-4 flex-wrap">
            <span>✅ 已加载 {klineCount} 个数据点</span>
            <span>📊 数据来源: Binance API</span>
            <span>⚡ 事件点已标记</span>
          </div>
          <div className="text-xs font-mono text-stone-600 flex items-center gap-3 flex-wrap">
            <span>🕒 图表时区: UTC</span>
            <span>📍 事件时间: {new Date(eventTimestamp * 1000).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

