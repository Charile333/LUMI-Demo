// 🎯 订单簿优化示例页面
// 展示优化前后的对比

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MarketDataProvider } from '@/lib/contexts/MarketDataContext';
import { OrderBookOptimized } from '@/components/trading/OrderBookOptimized';
import OrderBook from '@/components/trading/OrderBook'; // 原有组件
import { getSupabase } from '@/lib/supabase-client';

function OrderBookComparison({ marketId }: { marketId: number }) {
  const [showOld, setShowOld] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-8">
      <div className="container mx-auto max-w-7xl">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">订单簿优化对比</h1>
          <p className="text-gray-400">
            从轮询 → 实时订阅，延迟降低80%
          </p>
        </div>

        {/* 性能对比卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">更新方式</div>
            <div className="text-2xl font-bold text-orange-500">
              实时推送
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">更新延迟</div>
            <div className="text-2xl font-bold text-green-500">
              &lt; 1秒
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">额外订阅</div>
            <div className="text-2xl font-bold text-green-500">
              0个
            </div>
          </div>
        </div>

        {/* 切换按钮 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowOld(false)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              !showOld
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            ✅ 优化后（推荐）
          </button>
          <button
            onClick={() => setShowOld(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              showOld
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            ⚠️ 优化前（轮询）
          </button>
        </div>

        {/* 订单簿展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：订单簿 */}
          <div>
            {showOld ? (
              <div>
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold">旧版本（轮询模式）</div>
                      <div className="text-sm text-gray-300">
                        每5秒刷新一次，延迟较高
                      </div>
                    </div>
                  </div>
                </div>
                <OrderBook marketId={marketId} outcome={1} />
              </div>
            ) : (
              <div>
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold">优化版本（实时推送）</div>
                      <div className="text-sm text-gray-300">
                        Supabase Realtime，&lt;1秒延迟
                      </div>
                    </div>
                  </div>
                </div>
                <OrderBookOptimized 
                  marketId={marketId} 
                  outcome={1}
                  maxDisplayRows={15}
                />
              </div>
            )}
          </div>

          {/* 右侧：技术说明 */}
          <div className="space-y-6">
            {/* 优化前 */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-red-400">
                ⚠️ 优化前问题
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <div>
                    <div className="font-semibold">轮询更新</div>
                    <div className="text-sm text-gray-400">
                      每5秒请求一次API，浪费资源
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <div>
                    <div className="font-semibold">高延迟</div>
                    <div className="text-sm text-gray-400">
                      最多5秒延迟，错过交易机会
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <div>
                    <div className="font-semibold">独立请求</div>
                    <div className="text-sm text-gray-400">
                      没有与MarketCard共享订阅
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* 优化后 */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                ✅ 优化后优势
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <div>
                    <div className="font-semibold">实时推送</div>
                    <div className="text-sm text-gray-400">
                      Supabase Realtime，&lt;1秒更新
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <div>
                    <div className="font-semibold">零额外订阅</div>
                    <div className="text-sm text-gray-400">
                      共享MarketDataContext的订阅
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <div>
                    <div className="font-semibold">数据一致</div>
                    <div className="text-sm text-gray-400">
                      与卡片显示完全同步
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <div>
                    <div className="font-semibold">更多功能</div>
                    <div className="text-sm text-gray-400">
                      深度可视化、点击价格填充
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* 性能指标 */}
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 性能对比</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2">指标</th>
                    <th className="text-center py-2">优化前</th>
                    <th className="text-center py-2">优化后</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3">更新延迟</td>
                    <td className="text-center text-red-400">5秒</td>
                    <td className="text-center text-green-400">&lt;1秒</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">API请求</td>
                    <td className="text-center text-red-400">每5秒</td>
                    <td className="text-center text-green-400">0次</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3">额外订阅</td>
                    <td className="text-center text-red-400">1个</td>
                    <td className="text-center text-green-400">0个</td>
                  </tr>
                  <tr>
                    <td className="py-3">实时性</td>
                    <td className="text-center text-red-400">差</td>
                    <td className="text-center text-green-400">优秀</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ====================

export default function OrderBookDemoPage() {
  const params = useParams();
  const marketId = parseInt(params.marketId as string);
  const [marketExists, setMarketExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMarket = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('markets')
        .select('id')
        .eq('id', marketId)
        .single();
      
      setMarketExists(!!data);
      setLoading(false);
    };

    checkMarket();
  }, [marketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!marketExists) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-white text-xl mb-2">市场不存在</div>
          <div className="text-gray-400">ID: {marketId}</div>
        </div>
      </div>
    );
  }

  return (
    <MarketDataProvider marketIds={[marketId]}>
      <OrderBookComparison marketId={marketId} />
    </MarketDataProvider>
  );
}






















