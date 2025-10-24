'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

interface PolymarketResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
  count?: number;
  data?: any[];
  sample_raw?: any;
  details?: string;
}

const PolymarketTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolymarketResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testPolymarketAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/polymarket/test');
      const data = await response.json();
      
      setResult(data);
      
      if (!data.success) {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
      console.error('测试失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Polymarket 数据测试
            </h1>
            <p className="text-gray-600">
              测试从 Polymarket 获取真实预测市场数据
            </p>
          </div>

          {/* 测试按钮 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={testPolymarketAPI}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  正在获取数据...
                </span>
              ) : (
                '🚀 开始测试 Polymarket API'
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-1">获取失败</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 测试结果 */}
          {result && (
            <div className="space-y-6">
              {/* 成功提示 */}
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">✅</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        {result.message}
                      </h3>
                      {result.recommendedEndpoint && (
                        <p className="text-sm text-green-700 mt-2">
                          推荐使用的 API: <code className="bg-white px-2 py-1 rounded">{result.recommendedEndpoint}</code>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                        {result.message}
                      </h3>
                      {result.suggestion && (
                        <p className="text-sm text-yellow-700 mt-2">
                          💡 {result.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 所有 endpoint 测试结果 */}
              {result.allTests && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🔬 Endpoint 测试结果
                  </h3>
                  <div className="space-y-3">
                    {result.allTests.map((test: any, index: number) => (
                      <div 
                        key={index}
                        className={`border rounded-lg p-4 ${
                          test.success && test.dataCount > 0
                            ? 'border-green-300 bg-green-50'
                            : test.success
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {test.endpoint}
                              </span>
                              {test.success && test.dataCount > 0 && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                  推荐
                                </span>
                              )}
                            </div>
                            <code className="text-xs text-gray-600 block mt-1">
                              {test.url}
                            </code>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              test.success ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {test.status || 'Error'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          {test.dataType && (
                            <div>
                              <span className="text-gray-500">数据类型：</span>
                              <span className="font-medium text-gray-900">{test.dataType}</span>
                            </div>
                          )}
                          {test.dataCount !== undefined && (
                            <div>
                              <span className="text-gray-500">数据量：</span>
                              <span className="font-medium text-gray-900">{test.dataCount}</span>
                            </div>
                          )}
                        </div>

                        {test.error && (
                          <p className="text-sm text-red-600 mt-2">
                            ❌ {test.error}
                          </p>
                        )}

                        {test.parseError && (
                          <p className="text-sm text-orange-600 mt-2">
                            ⚠️ {test.parseError}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 最佳结果的示例数据 */}
              {result.bestResult?.sample && (
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                    🔍 查看成功 API 的返回数据示例
                  </summary>
                  <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-x-auto text-xs">
                    {JSON.stringify(result.bestResult.sample, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* 说明文档 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📖 关于此测试
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• 此页面用于测试 Polymarket 公开 API 的连接性</li>
              <li>• 点击按钮将获取前 10 条真实的预测市场数据</li>
              <li>• 数据包括问题、分类、成交量、概率等信息</li>
              <li>• 如果测试成功，我们可以将其集成到你的应用中</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolymarketTestPage;

