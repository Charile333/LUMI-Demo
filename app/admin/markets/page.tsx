'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Market {
  id: number;
  title: string;
  main_category: string;
  status: string;
  blockchain_status: string;
  interested_users: number;
  views: number;
  activity_score: number;
  condition_id: string | null;
  created_at: string;
  priority_level: string;
}

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);

  // 加载市场列表
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // 从 Supabase 加载
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);

      if (error) {
        console.error('加载失败:', error);
        alert('加载市场列表失败');
        return;
      }

      setMarkets(data || []);
    } catch (error) {
      console.error('加载失败:', error);
      alert('加载市场列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 激活市场
  const handleActivate = async (marketId: number) => {
    if (!confirm('确定要激活这个市场吗？\n\n激活需要约 30 秒，会消耗 Gas 和 USDC 奖励。')) {
      return;
    }

    setActivating(marketId);

    try {
      const response = await fetch(`/api/admin/markets/${marketId}/activate`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ 市场激活成功！\n\n` +
          `Condition ID: ${data.conditionId?.substring(0, 10)}...\n` +
          `交易哈希: ${data.txHash?.substring(0, 10)}...`
        );
        
        // 刷新列表
        loadMarkets();
      } else {
        alert('❌ 激活失败: ' + data.error);
      }
    } catch (error: any) {
      alert('❌ 激活失败: ' + error.message);
    } finally {
      setActivating(null);
    }
  };

  // 删除市场
  const handleDelete = async (marketId: number, title: string) => {
    if (!confirm(`确定要删除市场吗？\n\n${title}\n\n此操作无法撤销！`)) {
      return;
    }

    try {
      const response = await fetch(`/api/markets/${marketId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ 市场已删除');
        loadMarkets();
      } else {
        alert('❌ 删除失败: ' + data.error);
      }
    } catch (error) {
      alert('❌ 删除失败');
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'draft': { label: '草稿', color: 'bg-gray-100 text-gray-800' },
      'active': { label: '活跃', color: 'bg-green-100 text-green-800' },
      'resolved': { label: '已结算', color: 'bg-blue-100 text-blue-800' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>{badge.label}</span>;
  };

  const getBlockchainStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'not_created': { label: '未激活', color: 'bg-yellow-100 text-yellow-800' },
      'creating': { label: '激活中', color: 'bg-blue-100 text-blue-800' },
      'created': { label: '✓ 已激活', color: 'bg-green-100 text-green-800' },
      'failed': { label: '失败', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded text-xs ${badge.color}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              市场管理
            </h1>
            <p className="text-gray-600">
              查看和管理所有市场，一键激活上链
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMarkets}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🔄 刷新
            </button>
            <Link
              href="/admin/create-market"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              ✨ 创建市场
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{markets.length}</div>
            <div className="text-sm text-gray-600">总市场数</div>
                </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {markets.filter(m => m.blockchain_status === 'created').length}
              </div>
            <div className="text-sm text-gray-600">已激活</div>
              </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {markets.filter(m => m.blockchain_status === 'not_created').length}
              </div>
            <div className="text-sm text-gray-600">待激活</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {markets.filter(m => m.interested_users >= 5).length}
                </div>
            <div className="text-sm text-gray-600">达到激活条件</div>
                </div>
              </div>

        {/* 市场列表 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">标题</th>
                  <th className="px-4 py-3 text-left">分类</th>
                  <th className="px-4 py-3 text-center">状态</th>
                  <th className="px-4 py-3 text-center">区块链</th>
                  <th className="px-4 py-3 text-center">感兴趣</th>
                  <th className="px-4 py-3 text-center">活跃度</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {markets.map((market) => (
                  <tr key={market.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{market.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{market.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(market.created_at).toLocaleString('zh-CN')}
                  </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{market.main_category}</td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(market.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getBlockchainStatusBadge(market.blockchain_status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold">{market.interested_users || 0}</span>
                      <span className="text-xs text-gray-500"> / 5</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${Math.min(market.activity_score || 0, 100)}%` }}
                />
              </div>
                        <span className="text-xs font-semibold">
                          {Math.round(market.activity_score || 0)}
                        </span>
                  </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {market.blockchain_status === 'not_created' && (
                <button
                            onClick={() => handleActivate(market.id)}
                            disabled={activating === market.id}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {activating === market.id ? '⏳ 激活中...' : '🚀 激活'}
                </button>
                        )}
                        {market.blockchain_status === 'created' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                            ✓ 已激活
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(market.id, market.title)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                      </div>

          {markets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>还没有市场</p>
              <Link
                href="/admin/create-market"
                className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                创建第一个市场
              </Link>
            </div>
          )}
        </div>

        {/* 提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 激活说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 点击"激活"按钮可以立即激活市场（约 30 秒）</li>
            <li>• 激活会消耗平台钱包的 POL（Gas）和 USDC（奖励）</li>
            <li>• 激活后市场就可以交易了</li>
            <li>• 也可以等待自动激活（感兴趣 ≥ 5 人或活跃度 ≥ 60）</li>
          </ul>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/create-market"
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← 返回创建市场
          </Link>
        </div>
      </div>
    </div>
  );
}
