// 📊 优化后的订单簿组件（可视化增强版）
// 使用全局Context，实时更新，零额外订阅
// ✨ 新增功能：
// - 渐变色深度柱状图
// - 中间价差区域高亮显示
// - 实时价格标记线（可拖动）
// - 悬停显示价格档位总数量
// - 价格变化闪烁提示

'use client';

import { useMarketData, OrderBookLevel } from '@/lib/contexts/MarketDataContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { VirtualList } from '@/components/VirtualList';

interface OrderBookOptimizedProps {
  marketId: number;
  outcome?: number; // 1 = YES, 0 = NO
  onPriceClick?: (price: number) => void; // 点击价格填充到交易表单
  maxDisplayRows?: number; // 最多显示行数
}

export function OrderBookOptimized({ 
  marketId, 
  outcome = 1,
  onPriceClick,
  maxDisplayRows = 10
}: OrderBookOptimizedProps) {
  const { t } = useTranslation();
  const { stats, loading, connected } = useMarketData(marketId);
  const [selectedTab, setSelectedTab] = useState<'all' | 'bids' | 'asks'>('all');
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredTotal, setHoveredTotal] = useState<number | null>(null);
  const [hoveredQuantity, setHoveredQuantity] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [priceMarker, setPriceMarker] = useState<number | null>(null);
  const previousOrderBookRef = useRef<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] } | null>(null);
  const [flashingPrices, setFlashingPrices] = useState<Set<number>>(new Set());

  // 🎨 骨架屏
  if (loading) {
    return <OrderBookSkeleton />;
  }

  // 空状态
  if (!stats?.orderBook) {
    return <EmptyOrderBook />;
  }

  const { bids, asks } = stats.orderBook;

  // 计算价差
  const spread = useMemo(() => {
    if (bids.length === 0 || asks.length === 0) return 0;
    const bestBid = bids[0].price;
    const bestAsk = asks[asks.length - 1].price;
    return bestAsk - bestBid;
  }, [bids, asks]);

  const spreadPercent = useMemo(() => {
    if (bids.length === 0) return 0;
    return (spread / bids[0].price) * 100;
  }, [spread, bids]);

  // 价格变化检测和闪烁效果（检测数量或价格变化）
  useEffect(() => {
    if (!previousOrderBookRef.current) {
      previousOrderBookRef.current = { bids, asks };
      return;
    }

    const newFlashing = new Set<number>();
    const prev = previousOrderBookRef.current;

    // 检测买单变化
    bids.forEach(order => {
      const prevOrder = prev.bids.find(p => p.price === order.price);
      if (prevOrder && (prevOrder.quantity !== order.quantity || prevOrder.total !== order.total)) {
        newFlashing.add(order.price);
      }
    });

    // 检测卖单变化
    asks.forEach(order => {
      const prevOrder = prev.asks.find(p => p.price === order.price);
      if (prevOrder && (prevOrder.quantity !== order.quantity || prevOrder.total !== order.total)) {
        newFlashing.add(order.price);
      }
    });

    // 检测新价格出现
    const allPrevPrices = new Set([...prev.bids, ...prev.asks].map(o => o.price));
    [...bids, ...asks].forEach(order => {
      if (!allPrevPrices.has(order.price)) {
        newFlashing.add(order.price);
      }
    });

    if (newFlashing.size > 0) {
      setFlashingPrices(newFlashing);
      // 500ms后清除闪烁效果
      setTimeout(() => {
        setFlashingPrices(new Set());
      }, 500);
    }

    previousOrderBookRef.current = { bids, asks };
  }, [bids, asks]);

  // 处理价格点击
  const handlePriceClick = (price: number) => {
    if (onPriceClick) {
      onPriceClick(price);
    }
    setPriceMarker(price);
  };

  // 计算深度百分比（用于可视化）
  const getDepthPercentage = (total: number, maxTotal: number) => {
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  };

  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map(b => b.total)) : 0;
  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map(a => a.total)) : 0;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  // 🚀 虚拟滚动：订单簿超过50行时启用
  const shouldVirtualize = (bids.length + asks.length) > 50;
  const orderBookItemHeight = 40; // 每行高度

  return (
    <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {t('orderbook.title') || '订单簿'}
          </h3>
          
          {/* 连接状态 */}
          <div className={`flex items-center gap-2 text-sm ${
            connected ? 'text-green-400' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            }`}></div>
            <span>{connected ? '实时' : '离线'}</span>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedTab === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setSelectedTab('bids')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedTab === 'bids'
                ? 'bg-green-500 text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            买单
          </button>
          <button
            onClick={() => setSelectedTab('asks')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedTab === 'asks'
                ? 'bg-red-500 text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            卖单
          </button>
        </div>
      </div>

      {/* 表头 */}
      <div className="px-4 py-2 bg-zinc-800/50 grid grid-cols-3 text-xs text-gray-500 font-medium">
        <span>价格</span>
        <span className="text-right">数量</span>
        <span className="text-right">累计</span>
      </div>

      {/* 悬停提示 */}
      {hoveredPrice !== null && hoveredTotal !== null && hoverPosition && (
        <div 
          className="fixed z-50 bg-zinc-800 border border-amber-400/50 rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{ 
            top: `${hoverPosition.y - 80}px`,
            left: `${hoverPosition.x + 20}px`,
            maxWidth: '200px'
          }}
        >
          <div className="text-xs text-gray-400 mb-1">价格档位信息</div>
          <div className="text-sm font-bold text-white mb-1">{hoveredPrice.toFixed(4)}</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>数量: <span className="text-amber-400 font-semibold">{hoveredQuantity?.toFixed(2) || '0.00'}</span></div>
            <div>累计总量: <span className="text-amber-400 font-semibold">{hoveredTotal.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {/* 订单簿内容 */}
      <div className="p-4 space-y-3 relative">
        {/* 卖单区域（倒序显示，价格从高到低） */}
        {(selectedTab === 'all' || selectedTab === 'asks') && (
          <div className="space-y-1">
            {asks.length > 0 ? (
              shouldVirtualize && asks.length > maxDisplayRows ? (
                <VirtualList
                  items={[...asks].reverse().slice(0, maxDisplayRows * 2)}
                  renderItem={(order, index) => (
                    <OrderRow
                      order={order}
                      type="ask"
                      depthPercentage={getDepthPercentage(order.total, maxTotal)}
                      maxTotal={maxTotal}
                      isFlashing={flashingPrices.has(order.price)}
                      isMarked={priceMarker === order.price}
                      onMouseEnter={(e) => {
                        setHoveredPrice(order.price);
                        setHoveredTotal(order.total);
                        setHoveredQuantity(order.quantity);
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredPrice(null);
                        setHoveredTotal(null);
                        setHoveredQuantity(null);
                        setHoverPosition(null);
                      }}
                      onMouseMove={(e) => {
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => handlePriceClick(order.price)}
                    />
                  )}
                  itemHeight={orderBookItemHeight}
                  containerHeight={300}
                  threshold={maxDisplayRows}
                  gap={4}
                />
              ) : (
                [...asks]
                  .reverse()
                  .slice(0, maxDisplayRows)
                  .map((order, index) => (
                    <OrderRow
                      key={`ask-${index}`}
                      order={order}
                      type="ask"
                      depthPercentage={getDepthPercentage(order.total, maxTotal)}
                      maxTotal={maxTotal}
                      isFlashing={flashingPrices.has(order.price)}
                      isMarked={priceMarker === order.price}
                      onMouseEnter={(e) => {
                        setHoveredPrice(order.price);
                        setHoveredTotal(order.total);
                        setHoveredQuantity(order.quantity);
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredPrice(null);
                        setHoveredTotal(null);
                        setHoveredQuantity(null);
                        setHoverPosition(null);
                      }}
                      onMouseMove={(e) => {
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => handlePriceClick(order.price)}
                    />
                  ))
              )
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                暂无卖单
              </div>
            )}
          </div>
        )}

        {/* 中间价差区域（高亮显示） */}
        {selectedTab === 'all' && (
          <div className="relative py-4 px-3 bg-gradient-to-r from-red-500/20 via-amber-500/30 to-green-500/20 rounded-lg border-2 border-amber-400/50 shadow-lg shadow-amber-400/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-amber-400">价差区域</div>
                <div className="text-xs text-gray-400">
                  买: {bids.length > 0 ? bids[0].price.toFixed(4) : '--'} | 
                  卖: {asks.length > 0 ? asks[asks.length - 1].price.toFixed(4) : '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">最新价</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.bestBid.toFixed(4)}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="text-gray-400">
                    = {stats.probability.toFixed(1)}% 概率
                  </div>
                  <div className="h-4 w-px bg-gray-600"></div>
                  <div className="text-amber-400 font-semibold">
                    价差: {spread.toFixed(4)} ({spreadPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              {/* 价格标记线（可拖动） */}
              {priceMarker !== null && (
                <div className="mt-3 pt-3 border-t border-amber-400/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">标记价格:</span>
                    <span className="text-amber-400 font-bold">{priceMarker.toFixed(4)}</span>
                    <button
                      onClick={() => setPriceMarker(null)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 买单区域 */}
        {(selectedTab === 'all' || selectedTab === 'bids') && (
          <div className="space-y-1">
            {bids.length > 0 ? (
              shouldVirtualize && bids.length > maxDisplayRows ? (
                <VirtualList
                  items={bids.slice(0, maxDisplayRows * 2)}
                  renderItem={(order, index) => (
                    <OrderRow
                      order={order}
                      type="bid"
                      depthPercentage={getDepthPercentage(order.total, maxTotal)}
                      maxTotal={maxTotal}
                      isFlashing={flashingPrices.has(order.price)}
                      isMarked={priceMarker === order.price}
                      onMouseEnter={(e) => {
                        setHoveredPrice(order.price);
                        setHoveredTotal(order.total);
                        setHoveredQuantity(order.quantity);
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredPrice(null);
                        setHoveredTotal(null);
                        setHoveredQuantity(null);
                        setHoverPosition(null);
                      }}
                      onMouseMove={(e) => {
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => handlePriceClick(order.price)}
                    />
                  )}
                  itemHeight={orderBookItemHeight}
                  containerHeight={300}
                  threshold={maxDisplayRows}
                  gap={4}
                />
              ) : (
                bids.slice(0, maxDisplayRows).map((order, index) => (
                  <OrderRow
                    key={`bid-${index}`}
                    order={order}
                    type="bid"
                    depthPercentage={getDepthPercentage(order.total, maxTotal)}
                    maxTotal={maxTotal}
                    isFlashing={flashingPrices.has(order.price)}
                    isMarked={priceMarker === order.price}
                    onMouseEnter={(e) => {
                      setHoveredPrice(order.price);
                      setHoveredTotal(order.total);
                      setHoveredQuantity(order.quantity);
                      setHoverPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredPrice(null);
                      setHoveredTotal(null);
                      setHoveredQuantity(null);
                      setHoverPosition(null);
                    }}
                    onMouseMove={(e) => {
                      setHoverPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onClick={() => handlePriceClick(order.price)}
                  />
                ))
              )
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                暂无买单
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="px-4 py-3 border-t border-white/10 bg-zinc-800/30">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">买单深度</div>
            <div className="text-green-400 font-semibold">
              {bids.reduce((sum, b) => sum + b.quantity, 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-500">卖单深度</div>
            <div className="text-red-400 font-semibold">
              {asks.reduce((sum, a) => sum + a.quantity, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 订单行组件（增强版） ====================

interface OrderRowProps {
  order: OrderBookLevel;
  type: 'bid' | 'ask';
  depthPercentage: number;
  maxTotal: number;
  isFlashing?: boolean;
  isMarked?: boolean;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function OrderRow({ 
  order, 
  type, 
  depthPercentage, 
  maxTotal,
  isFlashing = false,
  isMarked = false,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick 
}: OrderRowProps) {
  const isBid = type === 'bid';
  
  // 计算渐变强度（基于深度百分比）
  const gradientIntensity = Math.min(depthPercentage / 50, 1);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      className={`relative grid grid-cols-3 text-sm py-2 px-3 rounded cursor-pointer transition-all duration-200 ${
        isBid 
          ? 'hover:bg-green-500/10 hover:border-l-2 hover:border-l-green-400' 
          : 'hover:bg-red-500/10 hover:border-l-2 hover:border-l-red-400'
      } ${
        isFlashing ? 'animate-pulse' : ''
      } ${
        isMarked ? 'ring-2 ring-amber-400/50 bg-amber-400/10' : ''
      }`}
    >
      {/* 渐变色深度背景条 */}
      <div
        className="absolute inset-y-0 right-0 rounded-r transition-all duration-300"
        style={{ 
          width: `${depthPercentage}%`,
          background: isBid
            ? `linear-gradient(to right, 
                rgba(34, 197, 94, ${0.1 + gradientIntensity * 0.2}), 
                rgba(34, 197, 94, ${0.15 + gradientIntensity * 0.25}))`
            : `linear-gradient(to right, 
                rgba(239, 68, 68, ${0.1 + gradientIntensity * 0.2}), 
                rgba(239, 68, 68, ${0.15 + gradientIntensity * 0.25}))`,
          boxShadow: isBid
            ? `inset -2px 0 4px rgba(34, 197, 94, ${0.3 * gradientIntensity})`
            : `inset -2px 0 4px rgba(239, 68, 68, ${0.3 * gradientIntensity})`
        }}
      />
      
      {/* 价格标记线指示器 */}
      {isMarked && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l"></div>
      )}

      {/* 内容 */}
      <span className={`relative z-10 font-semibold transition-all ${
        isBid ? 'text-green-400' : 'text-red-400'
      } ${isFlashing ? 'text-yellow-400' : ''}`}>
        {order.price.toFixed(4)}
        {isFlashing && <span className="ml-1 text-xs">⚡</span>}
      </span>
      <span className="relative z-10 text-right text-gray-300 font-mono">
        {order.quantity.toFixed(2)}
      </span>
      <span className="relative z-10 text-right text-gray-500 text-xs font-mono">
        {order.total.toFixed(2)}
      </span>
    </div>
  );
}

// ==================== 骨架屏 ====================

import { OrderBookSkeleton as NewOrderBookSkeleton } from '@/components/Loading';

function OrderBookSkeleton() {
  return <NewOrderBookSkeleton rows={10} />;
}

// ==================== 空状态 ====================

function EmptyOrderBook() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-white/10 p-8">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-xl text-gray-400 mb-2">暂无订单</div>
        <div className="text-sm text-gray-500">
          成为第一个下单的交易者
        </div>
      </div>
    </div>
  );
}





































