// 📊 优化后的订单簿组件
// 使用全局Context，实时更新，零额外订阅

'use client';

import { useMarketData, OrderBookLevel } from '@/lib/contexts/MarketDataContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

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

  // 🎨 骨架屏
  if (loading) {
    return <OrderBookSkeleton />;
  }

  // 空状态
  if (!stats?.orderBook) {
    return <EmptyOrderBook />;
  }

  const { bids, asks } = stats.orderBook;

  // 处理价格点击
  const handlePriceClick = (price: number) => {
    if (onPriceClick) {
      onPriceClick(price);
    }
  };

  // 计算深度百分比（用于可视化）
  const getDepthPercentage = (total: number, maxTotal: number) => {
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  };

  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map(b => b.total)) : 0;
  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map(a => a.total)) : 0;

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

      {/* 订单簿内容 */}
      <div className="p-4 space-y-3">
        {/* 卖单区域（倒序显示，价格从高到低） */}
        {(selectedTab === 'all' || selectedTab === 'asks') && (
          <div className="space-y-1">
            {asks.length > 0 ? (
              [...asks]
                .reverse()
                .slice(0, maxDisplayRows)
                .map((order, index) => (
                  <OrderRow
                    key={`ask-${index}`}
                    order={order}
                    type="ask"
                    depthPercentage={getDepthPercentage(order.total, maxAskTotal)}
                    onClick={() => handlePriceClick(order.price)}
                  />
                ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                暂无卖单
              </div>
            )}
          </div>
        )}

        {/* 最新成交价（分隔线） */}
        {selectedTab === 'all' && (
          <div className="py-3 text-center bg-zinc-800/30 rounded">
            <div className="text-xs text-gray-500 mb-1">最新价</div>
            <div className="text-2xl font-bold text-white">
              {stats.bestBid.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              = {stats.probability.toFixed(1)}% 概率
            </div>
          </div>
        )}

        {/* 买单区域 */}
        {(selectedTab === 'all' || selectedTab === 'bids') && (
          <div className="space-y-1">
            {bids.length > 0 ? (
              bids.slice(0, maxDisplayRows).map((order, index) => (
                <OrderRow
                  key={`bid-${index}`}
                  order={order}
                  type="bid"
                  depthPercentage={getDepthPercentage(order.total, maxBidTotal)}
                  onClick={() => handlePriceClick(order.price)}
                />
              ))
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

// ==================== 订单行组件 ====================

interface OrderRowProps {
  order: OrderBookLevel;
  type: 'bid' | 'ask';
  depthPercentage: number;
  onClick: () => void;
}

function OrderRow({ order, type, depthPercentage, onClick }: OrderRowProps) {
  const isBid = type === 'bid';
  
  return (
    <div
      onClick={onClick}
      className={`relative grid grid-cols-3 text-sm py-2 px-3 rounded cursor-pointer transition-all hover:bg-white/5 ${
        isBid ? 'hover:bg-green-500/10' : 'hover:bg-red-500/10'
      }`}
    >
      {/* 深度背景条 */}
      <div
        className={`absolute inset-y-0 right-0 ${
          isBid ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}
        style={{ width: `${depthPercentage}%` }}
      />

      {/* 内容 */}
      <span className={`relative z-10 font-semibold ${
        isBid ? 'text-green-400' : 'text-red-400'
      }`}>
        {order.price.toFixed(2)}
      </span>
      <span className="relative z-10 text-right text-gray-300">
        {order.quantity.toFixed(2)}
      </span>
      <span className="relative z-10 text-right text-gray-500">
        {order.total.toFixed(2)}
      </span>
    </div>
  );
}

// ==================== 骨架屏 ====================

function OrderBookSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4">
      <div className="space-y-2 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-24 mb-4"></div>
        
        {/* 表头 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-4 bg-zinc-800 rounded"></div>
          <div className="h-4 bg-zinc-800 rounded"></div>
          <div className="h-4 bg-zinc-800 rounded"></div>
        </div>
        
        {/* 订单行 */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4">
            <div className="h-8 bg-zinc-800 rounded"></div>
            <div className="h-8 bg-zinc-800 rounded"></div>
            <div className="h-8 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
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


















