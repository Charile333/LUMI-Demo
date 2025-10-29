// 📊 市场卡片组件（完整版 - 带实时价格）

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarketActivationStatus } from './MarketActivationStatus';
import { TradeButton } from './TradeButton';
import { InterestedButton } from './InterestedButton';
import { useMarketPrice } from '@/hooks/useMarketPrice';

interface MarketCardProps {
  market: {
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
  };
  showPrice?: boolean; // 是否显示价格（默认 true）
}

export function MarketCard({ market: initialMarket, showPrice = true }: MarketCardProps) {
  const { t } = useTranslation();
  const [market, setMarket] = useState(initialMarket);
  
  // 🔥 获取实时价格（仅在已激活的市场获取）
  const price = useMarketPrice(
    market.id, 
    showPrice && market.blockchain_status === 'created'
  );

  // 处理感兴趣更新
  const handleInterestedUpdate = (newCount: number) => {
    setMarket({
      ...market,
      interested_users: newCount
    });
  };

  // 处理激活成功
  const handleActivated = (conditionId: string) => {
    setMarket({
      ...market,
      blockchain_status: 'created',
      condition_id: conditionId
    });
  };

  // 类别徽章颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      automotive: 'bg-blue-100 text-blue-800',
      'tech-ai': 'bg-purple-100 text-purple-800',
      'sports-gaming': 'bg-green-100 text-green-800',
      'economy-social': 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-pink-100 text-pink-800',
      'smart-devices': 'bg-indigo-100 text-indigo-800',
      emerging: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  // 获取流动性指示器
  const getLiquidityIndicator = (spread: number) => {
    if (spread < 0.02) return { color: 'text-green-500', icon: '🟢', label: t('market.highLiquidity') };
    if (spread < 0.10) return { color: 'text-yellow-500', icon: '🟡', label: t('market.mediumLiquidity') };
    return { color: 'text-red-500', icon: '🔴', label: t('market.lowLiquidity') };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* 卡片头部 */}
      <div className="p-6">
        {/* 标题和徽章 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1">
            {market.title}
          </h3>
          
          {/* 状态徽章 */}
          <div className="flex flex-col gap-1">
            {market.blockchain_status === 'created' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                ✓ {t('market.activated')}
              </span>
            )}
            {market.priority_level === 'hot' && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full whitespace-nowrap">
                🔥 {t('market.hot')}
              </span>
            )}
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {market.description}
        </p>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span>👁️</span>
            <span>{market.views || 0} {t('market.views')}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>⭐</span>
            <span>{market.interested_users || 0} {t('market.interestedCount')}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📊</span>
            <span>{t('market.activityScore')} {Math.round(market.activity_score || 0)}</span>
          </span>
        </div>

        {/* 分类 */}
        {market.main_category && (
          <div className="mb-4">
            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(market.main_category)}`}>
              {t(`categories.${market.main_category.replace('-', '')}`) || market.main_category}
            </span>
          </div>
        )}
      </div>

      {/* 价格显示区域 - 仅在已激活的市场显示 */}
      {showPrice && market.blockchain_status === 'created' && !price.loading && (
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            {/* YES/NO 概率 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-600">YES</span>
                <span className="text-2xl font-bold text-green-600">
                  {price.probability.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-gray-600">NO</span>
                <span className="text-2xl font-bold text-red-600">
                  {(100 - price.probability).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* 价格详情 */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-blue-200">
              <div>
                <span className="text-gray-500">买价:</span>
                <span className="ml-1 font-semibold text-green-600">${price.bestBid.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">卖价:</span>
                <span className="ml-1 font-semibold text-red-600">${price.bestAsk.toFixed(2)}</span>
              </div>
              <div className={getLiquidityIndicator(price.spread).color}>
                <span>{getLiquidityIndicator(price.spread).icon}</span>
                <span className="ml-1 font-semibold">
                  {(price.spread * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* 价差警告 */}
            {price.spread >= 0.10 && (
              <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <span>⚠️</span>
                <span>价差较大，交易成本较高</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 激活状态 */}
      <div className="px-6 pb-4">
        <MarketActivationStatus 
          market={market} 
          onActivated={handleActivated}
        />
      </div>

      {/* 操作按钮 */}
      <div className="px-6 pb-6 space-y-3">
        {/* 感兴趣按钮（未激活时显示） */}
        {market.blockchain_status === 'not_created' && (
          <InterestedButton 
            market={market}
            onUpdate={handleInterestedUpdate}
          />
        )}

        {/* 交易按钮 */}
        <TradeButton market={market} />
      </div>

      {/* 底部信息 */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t('market.marketId')}: {market.id}</span>
          {market.condition_id && (
            <span className="font-mono">
              {market.condition_id.substring(0, 8)}...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}



