'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { CategoryType } from '@/lib/types/market';
import { PriorityCalculator } from '@/lib/aggregator/priorityCalculator';

interface Market {
  id: string;
  title: string;
  source: string;
  priorityLevel?: string;
  customWeight?: number;
  isHomepage?: boolean;
  isHot?: boolean;
  probability: number;
  volume: string;
  endDate: string;
  _priorityScore?: number;
}

const UnifiedTestPage = () => {
  const [category, setCategory] = useState<CategoryType>('tech-ai');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const categories: { value: CategoryType; label: string }[] = [
    { value: 'automotive', label: '汽车与新能源' },
    { value: 'tech-ai', label: '科技与AI' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'smart-devices', label: '智能设备' },
    { value: 'sports-gaming', label: '体育与游戏' },
    { value: 'economy-social', label: '经济与社会' },
    { value: 'emerging', label: '新兴市场' },
  ];

  const fetchMarkets = async (skipCache = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        categoryType: category,
        limit: limit.toString(),
        mode: 'unified'
      });

      const response = await fetch(`/api/markets?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMarkets(result.data.markets);
        setPerformance(result.performance);
      } else {
        setError(result.error || '获取失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      alert('缓存已清除');
    } catch (err) {
      alert('清除失败: ' + err);
    }
  };

  const getPriorityLabel = (market: Market): string => {
    return PriorityCalculator.getLabel(market);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* 标题 */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 统一市场 API 测试
          </h1>
          <p className="text-gray-600">
            测试多数据源聚合、优先级排序和缓存功能
          </p>
        </div>

        {/* 控制面板 */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 分类选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数量
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            {/* 按钮 */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => fetchMarkets(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '加载中...' : '获取数据'}
              </button>
              <button
                onClick={() => fetchMarkets(true)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                title="跳过缓存"
              >
                🔄
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                title="清除缓存"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* 性能指标 */}
          {performance && (
            <div className="flex gap-4 text-sm">
              <span className={`px-3 py-1 rounded ${performance.cached ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {performance.cached ? '✓ 缓存命中' : '⚡ 实时聚合'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                耗时: {performance.duration}ms
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">
                数量: {markets.length}
              </span>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* 市场列表 */}
        {markets.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                市场列表 ({markets.length} 条)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {markets.map((market, index) => (
                <div key={market.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* 排名 */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
                      {index + 1}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1">
                      {/* 标题和标签 */}
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {market.title}
                        </h3>
                        <div className="flex gap-1 flex-wrap">
                          {getPriorityLabel(market) && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {getPriorityLabel(market)}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            market.source === 'custom' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {market.source === 'custom' ? '自定义' : 'Polymarket'}
                          </span>
                        </div>
                      </div>

                      {/* 详情 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">概率:</span>{' '}
                          <span className="font-medium">{market.probability}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">成交量:</span>{' '}
                          <span className="font-medium">{market.volume}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">截止:</span>{' '}
                          <span className="font-medium">{market.endDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">分数:</span>{' '}
                          <span className="font-bold text-purple-600">{market._priorityScore || 0}</span>
                        </div>
                      </div>

                      {/* 优先级详情 */}
                      {market.priorityLevel !== 'normal' && (
                        <div className="mt-2 text-xs text-gray-500">
                          等级: {market.priorityLevel} 
                          {market.customWeight && ` | 权重: ${market.customWeight}`}
                          {market.isHomepage && ' | 首页推荐'}
                          {market.isHot && ' | 热门'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 测试说明
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 点击"获取数据"会优先使用缓存（5分钟）</li>
            <li>• 点击🔄按钮会跳过缓存，直接聚合数据</li>
            <li>• 点击🗑️按钮会清除当前分类的缓存</li>
            <li>• 排序按优先级分数从高到低</li>
            <li>• 自定义市场默认有更高的基础分数</li>
            <li>• 可以在后台 `/admin/markets` 设置优先级</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTestPage;

