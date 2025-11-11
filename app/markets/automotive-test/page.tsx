'use client';

import React from 'react';
import { MarketCard } from '@/components/MarketCard';

// 🧪 测试用的模拟数据
const mockMarkets = [
  {
    id: 4,
    question_id: 'test-question-1',
    title: '特斯拉 Model Y 会在 2025 年成为全球销量第一吗？',
    description: '预测特斯拉 Model Y 是否会在 2025 年成为全球销量最高的车型',
    main_category: 'automotive',
    blockchain_status: 'active',
    interested_users: 50,
    views: 1000,
    activity_score: 85
  },
  {
    id: 5,
    question_id: 'test-question-2',
    title: '比亚迪2025年全球销量会超过特斯拉吗？',
    description: '预测比亚迪是否能在2025年超越特斯拉成为全球电动车销量冠军',
    main_category: 'automotive',
    blockchain_status: 'active',
    interested_users: 30,
    views: 650,
    activity_score: 70
  }
];

export default function AutomotiveTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🧪 Automotive 测试页面</h1>
          <p className="text-gray-400">使用模拟数据测试市场卡片显示</p>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">这是测试页面</h3>
              <p className="text-sm text-gray-300">
                此页面使用模拟数据，用于测试前端卡片渲染是否正常。
                <br />
                如果这个页面能正常显示卡片，说明前端代码没问题，问题在于 Supabase 连接。
              </p>
            </div>
          </div>
        </div>

        {/* 市场卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
            />
          ))}
        </div>

        {/* 说明 */}
        <div className="mt-12 bg-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">📝 测试说明</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✅ 如果看到上面的市场卡片，说明前端组件工作正常</li>
            <li>❌ 如果还是看不到卡片，说明前端组件有问题</li>
            <li>🔧 真实页面连接失败的原因是 Supabase 网络连接问题</li>
          </ul>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8">
          <a
            href="/markets/automotive"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← 返回真实 Automotive 页面
          </a>
        </div>
      </div>
    </div>
  );
}














