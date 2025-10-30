'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MarketCard } from '@/components/MarketCard';
import Link from 'next/link';

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Market {
  id: number;
  title: string;
  description: string;
  blockchain_status: string;
  interested_users: number;
  views: number;
  activity_score: number;
  condition_id?: string;
  main_category?: string;
  priority_level?: string;
  created_at: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'not_created' | 'created'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets();
  }, [filter]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false });

      // 应用筛选
      if (filter !== 'all') {
        query = query.eq('blockchain_status', filter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setMarkets(data || []);
      console.log('✅ 加载市场成功:', data?.length, '个');
    } catch (error: any) {
      console.error('加载市场失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← 返回主页
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 所有预测市场
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats & Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">总市场数</div>
              <div className="text-3xl font-bold text-blue-600">{markets.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">已激活</div>
              <div className="text-3xl font-bold text-green-600">
                {markets.filter(m => m.blockchain_status === 'created').length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">待激活</div>
              <div className="text-3xl font-bold text-yellow-600">
                {markets.filter(m => m.blockchain_status === 'not_created').length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">激活中</div>
              <div className="text-3xl font-bold text-purple-600">
                {markets.filter(m => m.blockchain_status === 'creating').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">筛选：</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全部市场
                </button>
                <button
                  onClick={() => setFilter('not_created')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'not_created'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  待激活
                </button>
                <button
                  onClick={() => setFilter('created')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'created'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  已激活
                </button>
              </div>
              <button
                onClick={loadMarkets}
                disabled={loading}
                className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {loading ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 font-medium">加载失败：{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载市场中...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && markets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              暂无市场
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? '系统中还没有市场' : `没有找到${filter === 'not_created' ? '待激活' : '已激活'}的市场`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                查看所有市场
              </button>
            )}
          </div>
        )}

        {/* Markets Grid */}
        {!loading && markets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                showPrice={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
