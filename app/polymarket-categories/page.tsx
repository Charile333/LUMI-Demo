'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

interface CategoryStat {
  category: string;
  count: number;
  percentage: string;
  samples: Array<{ question: string; tags: string[] }>;
}

interface TagStat {
  tag: string;
  count: number;
  percentage: string;
}

const PolymarketCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/polymarket/categories');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Polymarket 分类分析
            </h1>
            <p className="text-gray-600">
              查看 Polymarket 实际有哪些分类的预测市场
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">正在分析数据...</p>
            </div>
          ) : data?.success ? (
            <div className="space-y-6">
              {/* 概览 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  数据概览
                </h2>
                <p className="text-gray-700">
                  分析了 <span className="font-bold text-blue-600">{data.totalMarkets}</span> 个活跃市场
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  更新时间: {new Date(data.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>

              {/* 主要分类 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 主要分类分布
                </h2>
                <div className="space-y-4">
                  {data.categories.map((cat: CategoryStat, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cat.category}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {cat.count}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cat.percentage}
                          </div>
                        </div>
                      </div>
                      
                      {/* 进度条 */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: cat.percentage }}
                        ></div>
                      </div>

                      {/* 示例 */}
                      {cat.samples && cat.samples.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                            查看示例问题 ({cat.samples.length})
                          </summary>
                          <ul className="mt-2 space-y-1 text-sm text-gray-700 pl-4">
                            {cat.samples.map((sample, idx) => (
                              <li key={idx} className="list-disc">
                                {sample.question}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 热门标签 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🏷️ 热门标签 (Top 30)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.topTags.map((tag: TagStat, index: number) => (
                    <div 
                      key={index}
                      className="px-3 py-2 bg-gray-100 rounded-full border border-gray-300 hover:border-blue-400 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{tag.tag}</span>
                      <span className="ml-2 text-sm text-gray-600">({tag.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 结论 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                  💡 分析结论
                </h3>
                <ul className="space-y-2 text-yellow-800">
                  <li>• Polymarket 主要专注于：政治、体育、加密货币、经济等领域</li>
                  <li>• <strong>可能缺少的分类：</strong>汽车、智能设备、传统制造业等</li>
                  <li>• <strong>建议：</strong>调整项目分类以匹配 Polymarket 的数据，或使用混合数据源</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">获取数据失败</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolymarketCategoriesPage;

