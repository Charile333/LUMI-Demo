// 🚀 CLOB 交易页面（链下匹配）

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import MyOrders from '@/components/trading/MyOrders';
import { db } from '@/lib/db';

export default function CLOBTradePage() {
  const params = useParams();
  const marketId = parseInt(params.marketId as string);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 加载市场数据
  useEffect(() => {
    const loadMarket = async () => {
      try {
        // TODO: 从数据库加载真实市场数据
        // 临时使用模拟数据
        setMarketData({
          id: marketId,
          questionId: `question_${marketId}`,
          title: '特朗普会赢得2024年美国总统选举吗？',
          description: '预测市场：特朗普是否会在2024年美国总统选举中获胜',
          mainCategory: 'geopolitics',
          subCategory: '美国政治',
          status: 'active',
          resolved: false,
          currentPrice: {
            YES: 0.55,
            NO: 0.45
          },
          volume: 125430,
          participants: 234
        });
      } catch (error) {
        console.error('加载市场数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarket();
  }, [marketId]);
  
  if (loading) {
    const { LUMILoader } = require('@/components/Loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <LUMILoader size="lg" text="加载市场数据..." />
        </div>
      </div>
    );
  }
  
  if (!marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-xl text-gray-600">市场不存在</div>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            返回首页
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <span className="text-xl">←</span>
                返回首页
              </a>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ⚡ 链下订单匹配交易
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                CLOB 系统
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                毫秒级响应
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {marketData.title}
              </h2>
              <p className="text-gray-600">
                {marketData.description}
              </p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                  {marketData.mainCategory}
                </span>
                {marketData.subCategory && (
                  <span className="text-gray-500">
                    {marketData.subCategory}
                  </span>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl font-semibold ${
              marketData.resolved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
            }`}>
              {marketData.resolved ? '✅ 已解析' : '🔥 进行中'}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="text-sm text-gray-600 mb-1">YES 价格</div>
              <div className="text-3xl font-bold text-green-600">
                {(marketData.currentPrice.YES * 100).toFixed(1)}¢
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="text-sm text-gray-600 mb-1">NO 价格</div>
              <div className="text-3xl font-bold text-red-600">
                {(marketData.currentPrice.NO * 100).toFixed(1)}¢
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">总成交量</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(marketData.volume / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">参与人数</div>
              <div className="text-2xl font-bold text-gray-900">
                {marketData.participants}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Order Book */}
          <div className="lg:col-span-1">
            <OrderBook marketId={marketId} />
          </div>

          {/* Center: Order Form */}
          <div className="lg:col-span-1">
            <OrderForm 
              marketId={marketId} 
              questionId={marketData.questionId}
            />
          </div>

          {/* Right: My Orders */}
          <div className="lg:col-span-2">
            <MyOrders />
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              CLOB 系统优势
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-semibold text-gray-900">毫秒级响应</div>
                  <div className="text-sm text-gray-600">订单提交 &lt;100ms，无需等待区块确认</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-semibold text-gray-900">节省 90% Gas</div>
                  <div className="text-sm text-gray-600">链下匹配，批量结算，大幅降低成本</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-semibold text-gray-900">可撤单改单</div>
                  <div className="text-sm text-gray-600">未成交订单随时取消，灵活管理</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-semibold text-gray-900">实时订单簿</div>
                  <div className="text-sm text-gray-600">价格-时间优先，专业交易体验</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Trading Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              交易提示
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span className="text-gray-700">
                  <strong>连接钱包：</strong>先连接 MetaMask 钱包，确保在 Polygon Amoy 测试网
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span className="text-gray-700">
                  <strong>签名订单：</strong>使用 EIP-712 签名，安全且无 Gas 费
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span className="text-gray-700">
                  <strong>自动匹配：</strong>订单提交后自动尝试匹配，成交或挂单
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span className="text-gray-700">
                  <strong>查看订单：</strong>右侧查看我的订单，可随时取消未成交订单
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⚠</span>
                <span className="text-gray-700">
                  订单有效期 7 天，过期自动失效
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}







