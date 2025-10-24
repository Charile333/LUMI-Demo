// 📊 订单簿显示组件

'use client';

import { useEffect, useState } from 'react';

interface OrderBookProps {
  marketId: number;
  outcome?: number;
}

export default function OrderBook({ marketId, outcome: initialOutcome }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState(initialOutcome || 1); // 1 = YES, 0 = NO
  
  useEffect(() => {
    loadOrderBook();
    
    // 每5秒刷新一次
    const interval = setInterval(loadOrderBook, 5000);
    return () => clearInterval(interval);
  }, [marketId, outcome]);
  
  const loadOrderBook = async () => {
    try {
      const response = await fetch(
        `/api/orders/book?marketId=${marketId}&outcome=${outcome}`
      );
      const data = await response.json();
      
      if (data.success) {
        setOrderBook(data.orderBook);
      }
    } catch (error) {
      console.error('加载订单簿失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-500">加载订单簿...</div>
        </div>
      </div>
    );
  }
  
  if (!orderBook) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">暂无订单数据</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">订单簿</h3>
        
        {/* YES/NO 切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setOutcome(1)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              outcome === 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            YES
          </button>
          <button
            onClick={() => setOutcome(0)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              outcome === 0
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            NO
          </button>
        </div>
      </div>
      
      {/* 表头 */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-500 border-b pb-2">
        <div>价格</div>
        <div className="text-right">数量</div>
        <div className="text-right">订单数</div>
      </div>
      
      {/* 卖单（从低到高，反序显示） */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-red-600 mb-1">
          卖单 (ASK)
        </div>
        {orderBook.asks && orderBook.asks.length > 0 ? (
          <div className="space-y-1">
            {orderBook.asks.slice(0, 10).reverse().map((ask: any, i: number) => {
              const totalValue = parseFloat(ask.price) * parseFloat(ask.total_amount);
              return (
                <div key={i} className="grid grid-cols-3 gap-2 text-sm hover:bg-red-50 rounded px-2 py-1 transition-colors">
                  <div className="text-red-600 font-mono font-semibold">
                    {parseFloat(ask.price).toFixed(3)}
                  </div>
                  <div className="text-right text-gray-700">
                    {parseFloat(ask.total_amount).toFixed(0)}
                  </div>
                  <div className="text-right text-gray-500 text-xs">
                    {ask.order_count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center py-2">暂无卖单</div>
        )}
      </div>
      
      {/* 价差 */}
      {orderBook.spread !== null && (
        <div className="py-2 px-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center mb-4 border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">价差</div>
          <div className="text-lg font-bold text-blue-600">
            {orderBook.spread.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500">
            {(orderBook.spread * 100).toFixed(2)}%
          </div>
        </div>
      )}
      
      {/* 买单（从高到低） */}
      <div>
        <div className="text-xs font-semibold text-green-600 mb-1">
          买单 (BID)
        </div>
        {orderBook.bids && orderBook.bids.length > 0 ? (
          <div className="space-y-1">
            {orderBook.bids.slice(0, 10).map((bid: any, i: number) => {
              const totalValue = parseFloat(bid.price) * parseFloat(bid.total_amount);
              return (
                <div key={i} className="grid grid-cols-3 gap-2 text-sm hover:bg-green-50 rounded px-2 py-1 transition-colors">
                  <div className="text-green-600 font-mono font-semibold">
                    {parseFloat(bid.price).toFixed(3)}
                  </div>
                  <div className="text-right text-gray-700">
                    {parseFloat(bid.total_amount).toFixed(0)}
                  </div>
                  <div className="text-right text-gray-500 text-xs">
                    {bid.order_count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center py-2">暂无买单</div>
        )}
      </div>
      
      {/* 更新时间 */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
        最后更新: {new Date(orderBook.updatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}







