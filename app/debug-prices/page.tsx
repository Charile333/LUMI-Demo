'use client';

import { useState, useEffect } from 'react';
import { useMarketPrice } from '@/hooks/useMarketPrice';
import { useMarketData, MarketDataProvider } from '@/lib/contexts/MarketDataContext';
import { getSupabase } from '@/lib/supabase-client';

// 诊断单个市场的子组件
function MarketDiagnostics({ marketId }: { marketId: number }) {
  const [dbData, setDbData] = useState<any>(null);
  
  // 方法1：useMarketPrice（详细页使用）
  const priceHook = useMarketPrice(marketId, true);
  
  // 方法2：MarketDataContext（卡片页使用）
  const { stats: contextStats } = useMarketData(marketId);
  
  // 方法3：直接查询数据库
  useEffect(() => {
    const fetchDbData = async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('orderbooks')
        .select('*')
        .eq('market_id', marketId)
        .single();
      
      if (!error && data) {
        setDbData(data);
      }
    };
    
    fetchDbData();
    const interval = setInterval(fetchDbData, 5000); // 每5秒刷新一次
    
    return () => clearInterval(interval);
  }, [marketId]);
  
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-2xl font-bold text-white mb-4">
        市场 #{marketId} 数据对比
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 方法1：useMarketPrice */}
        <div className="bg-black/50 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>useMarketPrice Hook</span>
            {priceHook.connected ? (
              <span className="text-green-500 text-xs">●</span>
            ) : (
              <span className="text-red-500 text-xs">●</span>
            )}
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">概率:</span>
              <span className="text-white">{priceHook.probability.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">YES:</span>
              <span className="text-green-400">{priceHook.yes.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">NO:</span>
              <span className="text-red-400">{priceHook.no.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">bestBid:</span>
              <span className="text-white">{priceHook.bestBid.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">bestAsk:</span>
              <span className="text-white">{priceHook.bestAsk.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">中间价:</span>
              <span className="text-yellow-400">
                {((priceHook.bestBid + priceHook.bestAsk) / 2).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
        
        {/* 方法2：MarketDataContext */}
        <div className="bg-black/50 rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
            <span>🗂️</span>
            <span>MarketDataContext</span>
          </h3>
          {contextStats ? (
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">概率:</span>
                <span className="text-white">{contextStats.probability.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">YES:</span>
                <span className="text-green-400">{contextStats.yes.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NO:</span>
                <span className="text-red-400">{contextStats.no.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">bestBid:</span>
                <span className="text-white">{contextStats.bestBid.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">bestAsk:</span>
                <span className="text-white">{contextStats.bestAsk.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">中间价:</span>
                <span className="text-yellow-400">
                  {((contextStats.bestBid + contextStats.bestAsk) / 2).toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">加载中...</div>
          )}
        </div>
        
        {/* 方法3：直接查询数据库 */}
        <div className="bg-black/50 rounded-lg p-4 border border-green-500/30">
          <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            <span>💾</span>
            <span>数据库原始数据</span>
          </h3>
          {dbData ? (
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">市场ID:</span>
                <span className="text-white">{dbData.market_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">买单档位:</span>
                <span className="text-white">{dbData.bids?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">卖单档位:</span>
                <span className="text-white">{dbData.asks?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">bestBid:</span>
                <span className="text-white">
                  {dbData.bids?.[0]?.price ? parseFloat(dbData.bids[0].price).toFixed(4) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">bestAsk:</span>
                <span className="text-white">
                  {dbData.asks?.[0]?.price ? parseFloat(dbData.asks[0].price).toFixed(4) : 'N/A'}
                </span>
              </div>
              {dbData.bids?.[0]?.price && dbData.asks?.[0]?.price && (
                <div className="flex justify-between">
                  <span className="text-gray-400">中间价:</span>
                  <span className="text-yellow-400">
                    {(
                      (parseFloat(dbData.bids[0].price) + parseFloat(dbData.asks[0].price)) / 2
                    ).toFixed(4)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">更新时间:</span>
                <span className="text-gray-500 text-xs">
                  {new Date(dbData.updated_at).toLocaleTimeString('zh-CN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">加载中...</div>
          )}
        </div>
      </div>
      
      {/* 数据一致性检查 */}
      <div className="mt-6 p-4 bg-black/50 rounded-lg border border-yellow-500/30">
        <h3 className="text-yellow-400 font-semibold mb-3">🔍 数据一致性检查</h3>
        <div className="space-y-2 text-sm">
          {contextStats && dbData && (
            <>
              <div className="flex items-center gap-2">
                {Math.abs(priceHook.probability - contextStats.probability) < 0.01 ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
                <span className="text-gray-300">
                  Hook概率 vs Context概率: 
                  <span className="text-white ml-2">
                    {Math.abs(priceHook.probability - contextStats.probability).toFixed(2)}% 差异
                  </span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {Math.abs(priceHook.yes - contextStats.yes) < 0.0001 ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
                <span className="text-gray-300">
                  Hook YES vs Context YES: 
                  <span className="text-white ml-2">
                    {Math.abs(priceHook.yes - contextStats.yes).toFixed(4)} 差异
                  </span>
                </span>
              </div>
              
              {dbData.bids?.[0]?.price && (
                <div className="flex items-center gap-2">
                  {Math.abs(priceHook.bestBid - parseFloat(dbData.bids[0].price)) < 0.0001 ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                  <span className="text-gray-300">
                    Hook bestBid vs DB bestBid: 
                    <span className="text-white ml-2">
                      {Math.abs(priceHook.bestBid - parseFloat(dbData.bids[0].price)).toFixed(4)} 差异
                    </span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 主诊断页面
export default function DebugPricesPage() {
  const [marketId, setMarketId] = useState(4); // 默认市场ID
  const [markets, setMarkets] = useState<any[]>([]);
  
  useEffect(() => {
    // 加载所有市场列表
    const fetchMarkets = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('markets')
        .select('id, title')
        .limit(10);
      
      if (data) {
        setMarkets(data);
      }
    };
    
    fetchMarkets();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🐛 价格数据诊断工具</h1>
          <p className="text-gray-400">对比不同数据源的价格数据，找出不一致的原因</p>
        </div>
        
        {/* 市场选择器 */}
        <div className="mb-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-sm text-gray-400 mb-2 block">选择市场:</label>
          <select 
            value={marketId}
            onChange={(e) => setMarketId(Number(e.target.value))}
            className="bg-black text-white px-4 py-2 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
          >
            {markets.map(m => (
              <option key={m.id} value={m.id}>
                #{m.id} - {m.title}
              </option>
            ))}
          </select>
        </div>
        
        {/* 诊断内容 */}
        <MarketDataProvider marketIds={[marketId]}>
          <MarketDiagnostics marketId={marketId} />
        </MarketDataProvider>
        
        {/* 说明 */}
        <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold mb-3">📖 使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• <strong>useMarketPrice Hook:</strong> 详细页使用，订阅 orderbooks 表的实时更新</li>
            <li>• <strong>MarketDataContext:</strong> 卡片页使用，批量订阅 orderbooks 表</li>
            <li>• <strong>数据库原始数据:</strong> 直接查询 orderbooks 表，每5秒刷新</li>
            <li>• 如果三者数据不一致，说明存在同步问题</li>
            <li>• 绿色✓表示数据一致，红色✗表示数据不一致</li>
          </ul>
        </div>
        
        {/* 返回按钮 */}
        <div className="mt-8">
          <a
            href="/markets/automotive"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← 返回市场页
          </a>
        </div>
      </div>
    </div>
  );
}




