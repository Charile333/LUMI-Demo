'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    mainCategory: 'emerging',
    subCategory: '',
    tags: '',
    startTime: '',
    endTime: '',
    resolutionTime: '',
    priorityLevel: 'recommended',
    rewardAmount: '10',
    // 新增：结果类型配置
    outcomeType: 'binary', // binary, multiple, numeric
    binaryOptions: ['YES', 'NO'],
    multipleOptions: ['选项 1', '选项 2'],
    numericMin: '0',
    numericMax: '100'
  });

  // 分类配置
  const categories = {
    automotive: {
      name: '🚗 汽车与新能源',
      subCategories: ['新能源', '传统汽车', '自动驾驶', '汽车配件']
    },
    'tech-ai': {
      name: '🤖 科技与AI',
      subCategories: ['人工智能', '区块链', '云计算', '物联网', '5G通信']
    },
    'sports-gaming': {
      name: '⚽ 体育与游戏',
      subCategories: ['足球', '篮球', '电竞', '网球']
    },
    'economy-social': {
      name: '💰 经济与社会',
      subCategories: ['股票', '加密货币', '房地产', '政治', '经济指标']
    },
    entertainment: {
      name: '🎬 娱乐',
      subCategories: ['电影', '音乐', '综艺', '颁奖典礼']
    },
    'smart-devices': {
      name: '📱 智能设备',
      subCategories: ['手机', '平板', '智能手表', '智能家居']
    },
    emerging: {
      name: '🌟 新兴市场',
      subCategories: ['元宇宙', 'Web3', 'NFT', 'DeFi', 'DAO']
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/markets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ ' + data.message);
        
        // 重置表单
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          mainCategory: 'emerging',
          subCategory: '',
          tags: '',
          startTime: '',
          endTime: '',
          resolutionTime: '',
          priorityLevel: 'recommended',
          rewardAmount: '10',
          outcomeType: 'binary',
          binaryOptions: ['YES', 'NO'],
          multipleOptions: ['选项 1', '选项 2'],
          numericMin: '0',
          numericMax: '100'
        });
      } else {
        alert('❌ 创建失败: ' + data.error);
      }
    } catch (error) {
      alert('❌ 创建失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            创建市场（数据库）
          </h1>
          <p className="text-gray-600">
            在数据库中创建市场，完全免费，活跃后自动上链
          </p>
        </div>

        {/* 提示卡片 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            创建提示
          </h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li>✅ 市场将保存到数据库，完全免费</li>
            <li>✅ 不会立即上链，节省成本</li>
            <li>✅ 用户可以浏览市场</li>
            <li>✅ 活跃度高时自动上链（浏览量 &gt; 100 或感兴趣用户 &gt; 10）</li>
            <li>✅ 支持批量创建</li>
          </ul>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              市场标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如：特斯拉 Q4 交付量会超过 50 万吗？"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              市场描述 *
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="详细描述市场内容、判断标准等..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* 分类 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                主分类
              </label>
              <select
                value={formData.mainCategory}
                onChange={e => setFormData({...formData, mainCategory: e.target.value, subCategory: ''})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              >
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                子分类
              </label>
              <select
                value={formData.subCategory}
                onChange={e => setFormData({...formData, subCategory: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              >
                <option value="">选择子分类</option>
                {categories[formData.mainCategory as keyof typeof categories].subCategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 图片 URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              图片 URL（可选）
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="特斯拉, 电动车, 交付量"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* 时间设置 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                开始时间
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                结束时间
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                结算时间
              </label>
              <input
                type="datetime-local"
                value={formData.resolutionTime}
                onChange={e => setFormData({...formData, resolutionTime: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
          </div>

          {/* 结果选项配置 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              结果选项配置
            </h3>

            {/* 选项类型 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                选项类型 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, outcomeType: 'binary'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.outcomeType === 'binary'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">✅❌</div>
                  <div className="font-semibold">二元选项</div>
                  <div className="text-xs text-gray-500">YES / NO</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, outcomeType: 'multiple'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.outcomeType === 'multiple'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">🎲</div>
                  <div className="font-semibold">多选项</div>
                  <div className="text-xs text-gray-500">自定义选项</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, outcomeType: 'numeric'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.outcomeType === 'numeric'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">📊</div>
                  <div className="font-semibold">数值范围</div>
                  <div className="text-xs text-gray-500">预测数值</div>
                </button>
              </div>
            </div>

            {/* 二元选项配置 */}
            {formData.outcomeType === 'binary' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">二元选项配置</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-blue-700 mb-1">选项 1</label>
                    <input
                      type="text"
                      value={formData.binaryOptions[0]}
                      onChange={e => setFormData({
                        ...formData,
                        binaryOptions: [e.target.value, formData.binaryOptions[1]]
                      })}
                      className="w-full px-3 py-2 border border-blue-300 rounded text-gray-900"
                      placeholder="YES"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-700 mb-1">选项 2</label>
                    <input
                      type="text"
                      value={formData.binaryOptions[1]}
                      onChange={e => setFormData({
                        ...formData,
                        binaryOptions: [formData.binaryOptions[0], e.target.value]
                      })}
                      className="w-full px-3 py-2 border border-blue-300 rounded text-gray-900"
                      placeholder="NO"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  💡 默认为 YES / NO，你也可以自定义为"会 / 不会"、"是 / 否"等
                </p>
              </div>
            )}

            {/* 多选项配置 */}
            {formData.outcomeType === 'multiple' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">多选项配置</h4>
                <div className="space-y-2">
                  {formData.multipleOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={e => {
                          const newOptions = [...formData.multipleOptions];
                          newOptions[index] = e.target.value;
                          setFormData({...formData, multipleOptions: newOptions});
                        }}
                        className="flex-1 px-3 py-2 border border-green-300 rounded text-gray-900"
                        placeholder={`选项 ${index + 1}`}
                      />
                      {formData.multipleOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = formData.multipleOptions.filter((_, i) => i !== index);
                            setFormData({...formData, multipleOptions: newOptions});
                          }}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    multipleOptions: [...formData.multipleOptions, `选项 ${formData.multipleOptions.length + 1}`]
                  })}
                  className="mt-3 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-semibold"
                >
                  + 添加选项
                </button>
                <p className="text-xs text-green-600 mt-2">
                  💡 例如：候选人名单、球队选择、产品选项等
                </p>
              </div>
            )}

            {/* 数值范围配置 */}
            {formData.outcomeType === 'numeric' && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">数值范围配置</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-yellow-700 mb-1">最小值</label>
                    <input
                      type="number"
                      value={formData.numericMin}
                      onChange={e => setFormData({...formData, numericMin: e.target.value})}
                      className="w-full px-3 py-2 border border-yellow-300 rounded text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-yellow-700 mb-1">最大值</label>
                    <input
                      type="number"
                      value={formData.numericMax}
                      onChange={e => setFormData({...formData, numericMax: e.target.value})}
                      className="w-full px-3 py-2 border border-yellow-300 rounded text-gray-900"
                      placeholder="100"
                    />
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  💡 例如：预测价格范围、销量数字、得分等
                </p>
              </div>
            )}
          </div>

          {/* 优先级和奖励 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                优先级
              </label>
              <select
                value={formData.priorityLevel}
                onChange={e => setFormData({...formData, priorityLevel: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              >
                <option value="hot">🔥 热门</option>
                <option value="recommended">⭐ 推荐</option>
                <option value="normal">📊 普通</option>
                <option value="low">💤 低优先级</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                预言机奖励（USDC）
              </label>
              <input
                type="number"
                value={formData.rewardAmount}
                onChange={e => setFormData({...formData, rewardAmount: e.target.value})}
                min="1"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '创建中...' : '✨ 创建市场（免费、即时）'}
          </button>
        </form>

        {/* 导航按钮 */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              ← 返回首页
            </button>
            <button
              onClick={() => router.push('/admin/markets')}
              className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200"
            >
              📋 管理市场
            </button>
            <button
              onClick={() => router.push('/markets/automotive')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              👁️ 前台预览
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

