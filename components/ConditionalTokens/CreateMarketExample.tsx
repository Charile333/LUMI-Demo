/**
 * 创建市场示例组件
 * 演示如何使用 useConditionalTokens Hook 连接 BSC 合约
 */

'use client';

import React, { useState } from 'react';
import { useConditionalTokens } from './useConditionalTokens';

export default function CreateMarketExample() {
  const { loading, error, createMarket, getConditionId } = useConditionalTokens();
  
  const [questionId, setQuestionId] = useState('');
  const [outcomeCount, setOutcomeCount] = useState(2);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [conditionId, setConditionId] = useState<string | null>(null);

  const handleCreateMarket = async () => {
    try {
      // 清空之前的结果
      setTxHash(null);
      setConditionId(null);
      
      console.log('🚀 开始创建市场...');
      
      // 创建市场
      const receipt = await createMarket(questionId, outcomeCount);
      
      console.log('✅ 交易成功:', receipt);
      setTxHash(receipt.transactionHash);
      
      // 简单提示成功，不再额外查询
      alert('✅ 市场创建成功！\n\n交易哈希: ' + receipt.transactionHash);
      
    } catch (err: any) {
      console.error('❌ 创建失败:', err);
      alert('❌ 创建失败: ' + (err.message || '未知错误'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">创建预测市场</h2>
      
      <div className="space-y-4">
        {/* 问题 ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            问题 ID
          </label>
          <input
            type="text"
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            placeholder="例如: will-btc-reach-100k"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            唯一标识符，建议使用英文和短横线
          </p>
        </div>

        {/* 结果数量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            结果数量
          </label>
          <select
            value={outcomeCount}
            onChange={(e) => setOutcomeCount(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 (YES / NO)</option>
            <option value={3}>3 (A / B / C)</option>
            <option value={4}>4 (A / B / C / D)</option>
            <option value={5}>5 选项</option>
          </select>
        </div>

        {/* 创建按钮 */}
        <button
          onClick={handleCreateMarket}
          disabled={loading || !questionId}
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            loading || !questionId
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '创建中...' : '创建市场'}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">错误</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 成功结果 */}
        {txHash && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-medium mb-2">✅ 市场创建成功！</p>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">交易哈希:</span>{' '}
                <a
                  href={`https://bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </p>
              {conditionId && (
                <p className="break-all">
                  <span className="font-medium">Condition ID:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                    {conditionId}
                  </code>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">📝 使用说明</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 需要安装 MetaMask 或其他 Web3 钱包</li>
          <li>• 需要切换到 BSC 主网 (Chain ID: 56)</li>
          <li>• 需要有少量 BNB 支付 Gas (~0.001 BNB)</li>
          <li>• 每个问题 ID 只能创建一次</li>
        </ul>
        
        <div className="mt-3 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            💡 <span className="font-medium">提示:</span> 合约部署在 BSC 主网，所有操作都会上链。
            查看合约:{' '}
            <a
              href="https://bscscan.com/address/0x26075526ff4fab71fcc2a58d28b4d28ee60e03a7"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              0x2607...03a7
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


















