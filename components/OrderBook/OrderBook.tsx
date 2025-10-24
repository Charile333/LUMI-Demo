'use client';

import { useState, useEffect } from 'react';
import { OrderBook as OrderBookType, OrderBookLevel } from '@/lib/polymarket/clob';

interface OrderBookProps {
  marketId: string;
  assetId: string;
  onPriceClick?: (price: string) => void;
}

export function OrderBook({ marketId, assetId, onPriceClick }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 实际集成 CLOB API
    // 这里使用模拟数据
    const mockOrderBook: OrderBookType = {
      market: marketId,
      asset: assetId,
      timestamp: Date.now(),
      bids: [
        { price: '0.65', size: '1000', totalSize: '1000' },
        { price: '0.64', size: '800', totalSize: '1800' },
        { price: '0.63', size: '1200', totalSize: '3000' },
        { price: '0.62', size: '500', totalSize: '3500' },
        { price: '0.61', size: '600', totalSize: '4100' },
      ],
      asks: [
        { price: '0.66', size: '900', totalSize: '900' },
        { price: '0.67', size: '700', totalSize: '1600' },
        { price: '0.68', size: '1100', totalSize: '2700' },
        { price: '0.69', size: '400', totalSize: '3100' },
        { price: '0.70', size: '550', totalSize: '3650' },
      ],
      spread: '0.01'
    };

    setTimeout(() => {
      setOrderBook(mockOrderBook);
      setLoading(false);
    }, 500);
  }, [marketId, assetId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📊 订单簿</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">加载订单簿...</p>
        </div>
      </div>
    );
  }

  if (!orderBook) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📊 订单簿</h2>
        <div className="text-center py-12 text-gray-500">
          <p>📭 暂无订单</p>
        </div>
      </div>
    );
  }

  const spread = parseFloat(orderBook.spread);
  const spreadPercent = (spread / parseFloat(orderBook.bids[0].price) * 100).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📊 订单簿</h2>
          <div className="text-sm">
            <span className="text-gray-600">价差:</span>{' '}
            <span className="font-mono text-orange-600">{spread.toFixed(4)}</span>{' '}
            <span className="text-gray-500">({spreadPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Order Book */}
      <div className="p-4">
        {/* Header Row */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-600 px-2">
          <div className="text-left">价格 (USDC)</div>
          <div className="text-right">数量</div>
          <div className="text-right">累计</div>
        </div>

        {/* Asks (卖单 - 红色) */}
        <div className="space-y-1 mb-3">
          {orderBook.asks.slice().reverse().map((ask, index) => (
            <OrderBookRow
              key={`ask-${index}`}
              level={ask}
              type="ask"
              maxTotal={parseFloat(orderBook.asks[orderBook.asks.length - 1].totalSize)}
              onClick={() => onPriceClick?.(ask.price)}
            />
          ))}
        </div>

        {/* Spread Indicator */}
        <div className="py-3 px-2 bg-gradient-to-r from-red-50 via-gray-50 to-green-50 rounded-lg mb-3">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-gray-600">买:</span>{' '}
              <span className="font-mono font-bold text-green-600">
                {parseFloat(orderBook.bids[0].price).toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">价差</span>
              <span className="text-sm font-mono font-bold text-orange-600">
                {spread.toFixed(4)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">卖:</span>{' '}
              <span className="font-mono font-bold text-red-600">
                {parseFloat(orderBook.asks[0].price).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Bids (买单 - 绿色) */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, index) => (
            <OrderBookRow
              key={`bid-${index}`}
              level={bid}
              type="bid"
              maxTotal={parseFloat(orderBook.bids[orderBook.bids.length - 1].totalSize)}
              onClick={() => onPriceClick?.(bid.price)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex justify-between">
          <div>
            <span className="font-semibold">总买单:</span>{' '}
            {orderBook.bids[orderBook.bids.length - 1].totalSize}
          </div>
          <div>
            <span className="font-semibold">总卖单:</span>{' '}
            {orderBook.asks[orderBook.asks.length - 1].totalSize}
          </div>
        </div>
      </div>
    </div>
  );
}

// 订单簿行组件
function OrderBookRow({
  level,
  type,
  maxTotal,
  onClick
}: {
  level: OrderBookLevel;
  type: 'bid' | 'ask';
  maxTotal: number;
  onClick?: () => void;
}) {
  const price = parseFloat(level.price);
  const size = parseFloat(level.size);
  const total = parseFloat(level.totalSize);
  const percentage = (total / maxTotal) * 100;

  const bgColor = type === 'bid' 
    ? 'bg-green-100' 
    : 'bg-red-100';
  
  const textColor = type === 'bid'
    ? 'text-green-700'
    : 'text-red-700';

  return (
    <div
      className="relative cursor-pointer hover:bg-gray-100 transition-colors rounded px-2 py-1"
      onClick={onClick}
    >
      {/* Background bar */}
      <div
        className={`absolute inset-y-0 right-0 ${bgColor} opacity-30 rounded`}
        style={{ width: `${percentage}%` }}
      />
      
      {/* Content */}
      <div className="relative grid grid-cols-3 gap-2 text-sm font-mono">
        <div className={`text-left font-semibold ${textColor}`}>
          {price.toFixed(4)}
        </div>
        <div className="text-right text-gray-700">
          {size.toLocaleString()}
        </div>
        <div className="text-right text-gray-500 text-xs">
          {total.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

