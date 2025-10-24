'use client';

import { useState } from 'react';

export default function TestOrderBook() {
  const [marketId, setMarketId] = useState('1');
  const [outcome, setOutcome] = useState('1');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOrderBook = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/book?marketId=${marketId}&outcome=${outcome}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAllOrders = async () => {
    setLoading(true);
    try {
      // 同时测试YES和NO
      const [yesRes, noRes] = await Promise.all([
        fetch(`/api/orders/book?marketId=${marketId}&outcome=1`).then(r => r.json()),
        fetch(`/api/orders/book?marketId=${marketId}&outcome=0`).then(r => r.json())
      ]);
      
      setResult({
        YES: yesRes,
        NO: noRes
      });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 订单簿测试工具</h1>
        
        {/* 输入区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Market ID
              </label>
              <input
                type="number"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入市场ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Outcome
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setOutcome('1')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                    outcome === '1'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  YES (1)
                </button>
                <button
                  onClick={() => setOutcome('0')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                    outcome === '0'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  NO (0)
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testOrderBook}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '加载中...' : '测试当前设置'}
              </button>
              <button
                onClick={testAllOrders}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '加载中...' : '测试YES和NO'}
              </button>
            </div>
          </div>
        </div>
        
        {/* 结果显示 */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">测试结果</h2>
              <button
                onClick={() => setResult(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清除
              </button>
            </div>
            
            {/* 成功状态 */}
            {result.success !== undefined && (
              <div className={`mb-4 p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
                  <span className={`font-semibold ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.success ? '成功' : '失败'}
                  </span>
                </div>
              </div>
            )}
            
            {/* 订单统计 */}
            {result.orderBook && (
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 mb-1">买单 (BID)</div>
                  <div className="text-2xl font-bold text-green-700">
                    {result.orderBook.bids?.length || 0}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 mb-1">卖单 (ASK)</div>
                  <div className="text-2xl font-bold text-red-700">
                    {result.orderBook.asks?.length || 0}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 mb-1">价差</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {result.orderBook.spread !== null 
                      ? result.orderBook.spread.toFixed(4)
                      : 'N/A'}
                  </div>
                </div>
              </div>
            )}
            
            {/* YES/NO 双列显示 */}
            {result.YES && result.NO && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">
                    ✅ YES (outcome=1)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>买单:</span>
                      <span className="font-semibold">{result.YES.orderBook?.bids?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>卖单:</span>
                      <span className="font-semibold">{result.YES.orderBook?.asks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>价差:</span>
                      <span className="font-semibold">
                        {result.YES.orderBook?.spread !== null 
                          ? result.YES.orderBook.spread.toFixed(4)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    ❌ NO (outcome=0)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>买单:</span>
                      <span className="font-semibold">{result.NO.orderBook?.bids?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>卖单:</span>
                      <span className="font-semibold">{result.NO.orderBook?.asks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>价差:</span>
                      <span className="font-semibold">
                        {result.NO.orderBook?.spread !== null 
                          ? result.NO.orderBook.spread.toFixed(4)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* JSON数据 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                完整JSON数据
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 使用说明
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 输入你刚下单的市场ID</li>
            <li>• 选择YES或NO（根据你下的单）</li>
            <li>• 点击"测试当前设置"查看订单簿</li>
            <li>• 或点击"测试YES和NO"同时查看两个订单簿</li>
            <li>• 如果看到买单(BID)或卖单(ASK)，说明订单在订单簿中</li>
            <li>• 如果都是0，检查是否选对了outcome</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

