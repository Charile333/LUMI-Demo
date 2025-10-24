'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface Market {
  id: string;
  title: string;
  category: string;
  categoryType: string;
  probability: number;
  volume: string;
  endDate: string;
  trend: string;
  change: string;
}

const PolymarketLivePage = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'tech-ai', name: '科技与AI' },
    { id: 'automotive', name: '汽车' },
    { id: 'entertainment', name: '娱乐' },
    { id: 'sports-gaming', name: '体育' },
    { id: 'economy-social', name: '经济' },
    { id: 'emerging', name: '新兴' },
  ];

  const fetchMarkets = async (category?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('categoryType', category);
      }
      params.append('limit', '20');

      const response = await fetch(`/api/polymarket/markets?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMarkets(data.data.markets);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
      console.error('获取市场数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔴 Polymarket 实时数据
              </h1>
              <p className="text-gray-600">真实的预测市场数据，实时更新</p>
            </div>
            <button
              onClick={() => fetchMarkets(selectedCategory)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-400'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* 市场列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : markets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div
                key={market.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    {market.category}
                  </span>
                  <span className={`text-sm font-medium ${
                    market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.change}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                  {market.title}
                </h3>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {market.probability}%
                  </div>
                  <div className="text-xs text-gray-500">YES 概率</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg py-2 text-green-600 font-medium text-sm">
                    YES {market.probability}%
                  </button>
                  <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg py-2 text-red-600 font-medium text-sm">
                    NO {100 - market.probability}%
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-600">
                  <span>💰 {market.volume}</span>
                  <span>📅 {market.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">暂无市场数据</p>
          </div>
        )}

        {/* 数据来源说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">关于数据来源</h3>
              <p className="text-sm text-blue-800">
                所有数据来自 Polymarket 的公开 API (gamma-api.polymarket.com)，
                这些是真实的预测市场数据，每次刷新都会获取最新信息。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolymarketLivePage;

