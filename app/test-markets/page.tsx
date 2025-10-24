'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Market {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  [key: string]: any;
}

export default function SimpleMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 直接调用API
        const response = await fetch(`/api/markets?limit=20`);
        
        if (!response.ok) {
          throw new Error(`API返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('获取到的数据:', data);
        setMarkets(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        setError(errorMessage);
        console.error('获取市场数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="container mx-auto py-6">
      
      {loading && (
        <div className="text-center py-10">
          <p>加载中...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 rounded text-red-700 mb-6">
          错误: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="space-y-4">
          {markets.length === 0 ? (
            <p>没有市场数据</p>
          ) : (
            <ul className="space-y-2">
              {markets.map((market) => (
                <Link 
                key={market.id} 
                href={`/event/test-${market.id}`}
                className="block p-4 border border-[#ffcc00]/10 rounded-lg bg-[#1e1e2e] hover:border-[#ffcc00]/40 transition-colors"
              >
                <h3 className="font-semibold mb-2 hover:text-[#ffcc00] transition-colors">{market.question}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span>Yes价格: <span className="text-[#4ade80]">{market.yesPrice}</span></span>
                  <span>No价格: <span className="text-[#f87171]">{market.noPrice}</span></span>
                </div>
              </Link>
              ))}
            </ul>
          )}
        </div>
      )}
      </div>
    </div>
  );
}