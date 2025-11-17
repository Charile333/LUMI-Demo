'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import { OrderBook } from '@/components/OrderBook/OrderBook';
import { TradingForm } from '@/components/OrderBook/TradingForm';

// ✅ 官方组件配置
const CONTRACTS = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2', // ✅ Gnosis 官方
  exchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40', // ✅ Polymarket 官方 CTF Exchange
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', // Mock USDC
  adapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC'  // TestUmaCTFAdapter
};

export default function TradePage() {
  const params = useParams();
  const marketId = params.marketId as string;

  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState('0.50');

  // Mock market data - TODO: 从 RealUmaCTFAdapter 获取真实市场数据
  const marketData = {
    id: marketId,
    title: '特朗普会赢得2024年美国总统选举吗？',
    description: '预测市场：特朗普是否会在2024年美国总统选举中获胜',
    outcomeSlotCount: 2,
    outcomes: ['YES', 'NO'],
    tokenIds: {
      YES: '0x123...', // Outcome Token ID for YES
      NO: '0x456...'   // Outcome Token ID for NO
    },
    currentPrice: {
      YES: 0.55,
      NO: 0.45
    },
    volume24h: '125,430',
    resolved: false
  };

  // 检查钱包连接
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }

          const chain = await window.ethereum.request({
            method: 'eth_chainId'
          });
          setChainId(parseInt(chain, 16));
        } catch (error) {
          console.error('检查连接失败:', error);
        }
      }
    };

    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handlePriceClick = (price: string) => {
    setSelectedPrice(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <a href="/" className="text-blue-600 hover:text-blue-700">
                ← 返回首页
              </a>
              <div className="text-gray-300">|</div>
              <h1 className="text-2xl font-bold text-gray-900">订单簿交易</h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {marketData.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {marketData.description}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              marketData.resolved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {marketData.resolved ? '已解析' : '进行中'}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">YES 价格</div>
              <div className="text-2xl font-bold text-green-600">
                ${marketData.currentPrice.YES.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">NO 价格</div>
              <div className="text-2xl font-bold text-red-600">
                ${marketData.currentPrice.NO.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">24h 成交量</div>
              <div className="text-2xl font-bold text-gray-900">
                ${marketData.volume24h}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">结果数</div>
              <div className="text-2xl font-bold text-gray-900">
                {marketData.outcomeSlotCount}
              </div>
            </div>
          </div>
        </div>

        {/* Network Warning */}
        {chainId && chainId !== 80002 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-800 font-semibold">⚠️ 网络错误</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              请切换到 Polygon Amoy 测试网 (Chain ID: 80002)
            </p>
          </div>
        )}

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Book (2/3 width) */}
          <div className="lg:col-span-2">
            <OrderBook
              marketId={marketData.id}
              assetId={marketData.tokenIds.YES}
              onPriceClick={handlePriceClick}
            />
          </div>

          {/* Trading Form (1/3 width) */}
          <div>
            <TradingForm
              marketId={marketData.id}
              assetId={marketData.tokenIds.YES}
              tokenId={marketData.tokenIds.YES}
              account={account}
              defaultPrice={selectedPrice}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 合约信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">📋 合约信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CTF Exchange:</span>
                <a
                  href="https://amoy.polygonscan.com/address/0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40"
                  target="_blank"
                  className="text-blue-600 hover:underline font-mono"
                  title="Polymarket 官方 CTF Exchange ✅"
                >
                  0xdFE0...9E40
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conditional Tokens:</span>
                <a
                  href="https://amoy.polygonscan.com/address/0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2"
                  target="_blank"
                  className="text-blue-600 hover:underline font-mono"
                  title="Gnosis 官方 Conditional Tokens ✅"
                >
                  0xb171...10a2
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">USDC (Collateral):</span>
                <a
                  href="https://amoy.polygonscan.com/address/0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
                  target="_blank"
                  className="text-blue-600 hover:underline font-mono"
                >
                  0x41E9...e7582
                </a>
              </div>
            </div>
          </div>

          {/* 交易提示 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">💡 交易提示</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>订单在链下签名和匹配，无需 Gas 费</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>仅最终结算需要链上交易</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>默认手续费率: 1% (100 基点)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">⚠</span>
                <span>买入前需要 Approve USDC</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">⚠</span>
                <span>卖出前需要 Approve CTF Tokens</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

