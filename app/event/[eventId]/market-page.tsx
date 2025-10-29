// 🎯 市场详情页面（使用订单簿系统）
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import MyOrders from '@/components/trading/MyOrders';
import { useTranslation } from '@/hooks/useTranslation';

export default function MarketDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const marketId = parseInt(params.eventId as string);
  
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📊 从数据库加载市场数据
  useEffect(() => {
    const loadMarket = async () => {
      try {
        setLoading(true);
        
        // 从 Supabase 加载市场数据
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('markets')
          .select('*')
          .eq('id', marketId)
          .single();
        
        if (error) {
          console.error('加载市场失败:', error);
          setError('市场不存在');
          return;
        }
        
        setMarketData(data);
      } catch (err) {
        console.error('加载失败:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadMarket();
  }, [marketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('marketDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('marketDetail.notFound')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('marketDetail.backToMarkets')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
          >
            ← {t('marketDetail.backToMarkets')}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Market Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Market Title Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {marketData.title}
                  </h1>
                  <p className="text-gray-600">
                    {marketData.description}
                  </p>
                </div>
                {marketData.image_url && (
                  <img
                    src={marketData.image_url}
                    alt={marketData.title}
                    className="w-24 h-24 rounded-lg object-cover ml-4"
                  />
                )}
              </div>
              
              {/* Market Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('marketDetail.volume')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${marketData.volume || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('hero.activeTraders')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {marketData.participants || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('marketDetail.status')}</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    marketData.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : marketData.status === 'resolved'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {String(t(`market.${marketData.status}`, marketData.status))}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('marketDetail.priceChart')}</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('marketDetail.orderBook')}</h3>
              <OrderBook marketId={marketId} />
            </div>

            {/* My Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('marketDetail.myOrders')}</h3>
              <MyOrders marketId={marketId} />
            </div>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('marketDetail.trade')}</h3>
                <OrderForm 
                  marketId={marketId}
                  questionId={marketData.question_id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






