'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import Link from 'next/link';

// 合约配置
const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  ctfExchange: '0x41AE309fAb269adF729Cfae78E6Ef741F6a8E3AE',
  conditionalTokens: '0xeB4F3700FE422c1618B449763d423687D5ad0950',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
];

interface Market {
  questionId: string;
  conditionId: string;
  title: string;
  description: string;
  reward: string;
  resolved: boolean;
  payouts?: string[];
}

export default function BlockchainMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    checkWallet();
    loadMarkets();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', checkWallet);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const checkWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chain, 16));
      } catch (error) {
        console.error('检查钱包失败:', error);
      }
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // 使用 JsonRpcProvider 而不是 Web3Provider
      const provider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
      const adapter = new ethers.Contract(CONTRACTS.testAdapter, ADAPTER_ABI, provider);
      
      const count = await adapter.getMarketCount();
      
      if (count.gt(0)) {
        const marketIds = await adapter.getMarketList(0, count.toNumber());
        const marketsData = await Promise.all(
          marketIds.map(async (questionId: string) => {
            try {
              const market = await adapter.getMarket(questionId);
              return {
                questionId,
                conditionId: market.conditionId,
                title: market.title || '未命名市场',
                description: market.description || '暂无描述',
                reward: ethers.utils.formatUnits(market.reward, 6),
                resolved: market.resolved,
                payouts: market.resolved ? market.payouts.map((p: any) => p.toString()) : undefined
              };
            } catch (error) {
              console.error(`加载市场 ${questionId} 失败:`, error);
              return null;
            }
          })
        );
        setMarkets(marketsData.filter(m => m !== null) as Market[]);
      }
    } catch (error) {
      console.error('加载市场列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← 返回主页
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                🔗 区块链预测市场
              </h1>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">市场总数</div>
            <div className="text-3xl font-bold text-blue-600">{markets.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">进行中</div>
            <div className="text-3xl font-bold text-green-600">
              {markets.filter(m => !m.resolved).length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">已解析</div>
            <div className="text-3xl font-bold text-gray-600">
              {markets.filter(m => m.resolved).length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">总奖励池</div>
            <div className="text-3xl font-bold text-yellow-600">
              {markets.reduce((sum, m) => sum + parseFloat(m.reward), 0).toFixed(0)} USDC
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">探索市场</h2>
            <p className="text-gray-600 mt-1">发现有趣的预测，参与区块链交易</p>
          </div>
          <button
            onClick={loadMarkets}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            🔄 刷新
          </button>
        </div>

        {/* Network Warning */}
        {chainId && chainId !== 80002 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  请切换到 <strong>Polygon Amoy 测试网</strong> (Chain ID: 80002)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Markets Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载市场中...</p>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无市场</h3>
            <p className="text-gray-600 mb-6">当前没有可用的预测市场，请稍后再来</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div
                key={market.questionId}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        market.resolved
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {market.resolved ? '已解析' : '进行中'}
                    </span>
                    <span className="text-sm text-gray-500">{market.reward} USDC</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {market.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {market.description}
                  </p>

                  {/* Result (if resolved) */}
                  {market.resolved && market.payouts && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">结果</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          {market.payouts[0] === '1' ? '✅ YES' : '❌ NO'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/trade/${market.conditionId}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      📊 交易
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(market.conditionId);
                        alert('Market ID 已复制！');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      📋
                    </button>
                  </div>

                  {/* Market ID */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 font-mono truncate">
                      ID: {market.conditionId.slice(0, 10)}...{market.conditionId.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 关于区块链市场</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>• Polymarket 预言机</strong>
              <p className="text-blue-700">使用 UMA Optimistic Oracle 确保市场结果公正透明</p>
            </div>
            <div>
              <strong>• 订单薄交易</strong>
              <p className="text-blue-700">EIP-712 签名订单，链上结算，去中心化交易</p>
            </div>
            <div>
              <strong>• Mock USDC</strong>
              <p className="text-blue-700">测试环境使用 Mock USDC，真实环境将使用 USDC</p>
            </div>
            <div>
              <strong>• Polygon Amoy</strong>
              <p className="text-blue-700">部署在 Polygon 测试网，低 Gas 费，快速确认</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">❓ 常见问题</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">Q: 如何参与交易？</strong>
              <p>点击市场卡片上的"交易"按钮，即可进入订单薄交易界面。</p>
            </div>
            <div>
              <strong className="text-gray-900">Q: 需要什么准备？</strong>
              <p>连接支持 Polygon Amoy 的钱包（如 MetaMask），并确保有测试币。</p>
            </div>
            <div>
              <strong className="text-gray-900">Q: 如何获取测试币？</strong>
              <p>访问 <a href="https://faucet.polygon.technology/" target="_blank" className="text-blue-600 hover:underline">Polygon 水龙头</a> 获取免费的测试币。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

