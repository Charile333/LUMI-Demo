'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { Troubleshoot } from './troubleshoot';

// 导入部署的合约地址 - 使用真实 UMA Oracle 版本
import deployment from '@/deployments/amoy-real-uma.json';

// 真实 UMA Oracle 适配器 ABI
const ADAPTER_ABI = [
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function canResolve(bytes32 questionId) view returns (bool)",
  "function resolve(bytes32 questionId)"
];

interface MarketData {
  questionId: string;
  conditionId: string;
  title: string;
  description: string;
  outcomeSlotCount: number;
  resolved: boolean;
  canResolve: boolean;
  requestTimestamp: string;
  rewardToken: string;
  reward: string;
  error?: boolean;
}

export default function BlockchainMarketsPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '100'
  });

  // 检查钱包连接
  useEffect(() => {
    checkWallet();
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', checkWallet);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkWallet);
      }
    };
  }, []);

  // 加载市场列表
  useEffect(() => {
    if (account && chainId === 80002) {
      loadMarkets();
    }
  }, [account, chainId]);

  const checkWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const network = await provider.getNetwork();
          setChainId(network.chainId);
        } else {
          setAccount(null);
          setChainId(null);
        }
      } catch (error) {
        console.error('检查钱包失败:', error);
      }
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // 先尝试使用钱包 Provider
      let provider: ethers.providers.Provider;
      let usingFallback = false;
      
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('📱 使用钱包 Provider');
      } catch (walletError) {
        console.warn('⚠️ 钱包 Provider 初始化失败，使用公共 RPC');
        provider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
        usingFallback = true;
      }
      
      const adapter = new ethers.Contract(
        deployment.contracts.realUmaCTFAdapter.address,
        ADAPTER_ABI,
        provider
      );

      const count = await adapter.getMarketCount();
      console.log('📊 市场总数:', count.toString());
      
      if (usingFallback) {
        console.warn('⚠️ 使用了公共 RPC 读取数据，某些功能可能受限');
      }

      if (count.toNumber() > 0) {
        const marketIds = await adapter.getMarketList(0, count.toNumber());
        
        const marketsData = await Promise.all(
          marketIds.map(async (questionId: string) => {
            try {
              const market = await adapter.getMarket(questionId);
              
              // 尝试获取 canResolve 状态，如果失败则默认为 false
              let canResolve = false;
              try {
                canResolve = await adapter.canResolve(questionId);
              } catch (resolveError) {
                console.warn(`⚠️ 无法检查市场 ${questionId.substring(0, 10)}... 的解析状态:`, resolveError);
              }
              
              return {
                questionId,
                conditionId: market.conditionId,
                title: market.title,
                description: market.description,
                outcomeSlotCount: market.outcomeSlotCount.toNumber(),
                resolved: market.resolved,
                canResolve,
                requestTimestamp: new Date(market.requestTimestamp * 1000).toLocaleString(),
                rewardToken: market.rewardToken,
                reward: ethers.utils.formatUnits(market.reward, 6) // 假设是 USDC (6 decimals)
              };
            } catch (error) {
              console.error(`❌ 加载市场 ${questionId.substring(0, 10)}... 失败:`, error);
              // 返回一个基本的市场对象
              return {
                questionId,
                conditionId: '0x0000000000000000000000000000000000000000000000000000000000000000',
                title: '加载失败',
                description: '无法加载市场信息',
                outcomeSlotCount: 2,
                resolved: false,
                canResolve: false,
                requestTimestamp: '未知',
                rewardToken: '0x0000000000000000000000000000000000000000',
                reward: '0',
                error: true
              };
            }
          })
        );

        // 过滤掉加载失败的市场（如果需要）
        const validMarkets = marketsData.filter(m => !m.error);
        const errorCount = marketsData.length - validMarkets.length;
        
        setMarkets(validMarkets);
        console.log('✅ 加载了', validMarkets.length, '个市场');
        if (errorCount > 0) {
          console.warn(`⚠️ ${errorCount} 个市场加载失败`);
        }
      } else {
        setMarkets([]);
        console.log('📭 当前没有市场');
      }
    } catch (error: any) {
      console.error('❌ 加载市场失败:', error);
      
      // 更详细的错误信息
      let errorMsg = '加载市场失败:\n\n';
      
      if (error.code === 'CALL_EXCEPTION') {
        errorMsg += '⚠️ 合约调用失败\n\n';
        errorMsg += '可能的原因:\n';
        errorMsg += '1. 钱包连接有问题（尝试断开重连）\n';
        errorMsg += '2. 网络不稳定（刷新页面重试）\n';
        errorMsg += '3. 钱包缓存问题（清除缓存）\n\n';
        errorMsg += '💡 请使用下面的"故障诊断"工具排查问题';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMsg += '网络连接失败，请检查网络';
      } else {
        errorMsg += error.message || '未知错误';
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createMarket = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    if (chainId !== 80002) {
      alert('请切换到Polygon Amoy测试网');
      return;
    }

    if (!formData.title) {
      alert('请输入市场标题');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const adapter = new ethers.Contract(
        deployment.contracts.realUmaCTFAdapter.address,
        ADAPTER_ABI,
        signer
      );

      // 生成唯一的questionId
      const questionId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(formData.title + Date.now())
      );

      // Amoy 测试网 USDC 地址
      const USDC_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
      const reward = ethers.utils.parseUnits(formData.reward, 6); // USDC是6位小数

      console.log('📝 创建市场:', {
        title: formData.title,
        questionId,
        reward: formData.reward,
        rewardToken: USDC_ADDRESS
      });

      // 需要先 approve 奖励代币
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );
      
      console.log('💰 Approving USDC...');
      const approveTx = await usdcContract.approve(
        deployment.contracts.realUmaCTFAdapter.address,
        reward
      );
      await approveTx.wait();
      console.log('✅ USDC approved');

      const tx = await adapter.initialize(
        questionId,
        formData.title,
        formData.description || '市场描述',
        2, // YES/NO
        USDC_ADDRESS,
        reward,
        0, // customLiveness = 0 (使用默认 2 小时)
        {
          gasLimit: 800000 // 增加 gas limit，因为需要与真实 Oracle 交互
        }
      );

      console.log('⏳ 交易已发送:', tx.hash);
      alert(`市场创建中...\n\n交易哈希: ${tx.hash}\n\n请等待确认...`);

      const receipt = await tx.wait();
      console.log('✅ 交易确认:', receipt.transactionHash);

      alert('✅ 市场创建成功！');

      // 重置表单
      setFormData({ title: '', description: '', reward: '100' });
      setShowForm(false);

      // 刷新市场列表
      await loadMarkets();

    } catch (error: any) {
      console.error('创建失败:', error);
      
      let errorMessage = '创建失败: ';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += '余额不足，请获取测试币';
      } else if (error.code === 'ACTION_REJECTED') {
        errorMessage += '用户取消了交易';
      } else {
        errorMessage += error.message || '未知错误';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resolveMarket = async (questionId: string) => {
    if (!confirm('确定要解析这个市场吗？')) return;

    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const adapter = new ethers.Contract(
        deployment.contracts.realUmaCTFAdapter.address,
        ADAPTER_ABI,
        signer
      );

      console.log('🔄 解析市场:', questionId);

      const tx = await adapter.resolve(questionId, {
        gasLimit: 500000 // 增加 gas limit，因为需要与真实 Oracle 交互
      });

      alert(`解析中...\n交易: ${tx.hash}`);

      await tx.wait();
      alert('✅ 市场解析成功！');

      await loadMarkets();

    } catch (error: any) {
      console.error('解析失败:', error);
      alert('解析失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔮 区块链市场管理</h1>
            <p className="text-gray-600 mt-2">Polygon Amoy测试网 • UMA预言机</p>
          </div>
          <ConnectWallet />
        </div>

        {/* 合约信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 已部署的合约</h3>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-blue-700">CTF:</span>{' '}
              <a 
                href={`https://amoy.polygonscan.com/address/${deployment.contracts.conditionalTokens.address}`}
                target="_blank"
                className="text-blue-600 hover:underline font-mono"
              >
                {deployment.contracts.conditionalTokens.address}
              </a>
            </div>
            <div>
              <span className="text-blue-700">Adapter (Real UMA):</span>{' '}
              <a 
                href={`https://amoy.polygonscan.com/address/${deployment.contracts.realUmaCTFAdapter.address}`}
                target="_blank"
                className="text-blue-600 hover:underline font-mono"
              >
                {deployment.contracts.realUmaCTFAdapter.address}
              </a>
            </div>
            <div>
              <span className="text-blue-700">UMA Oracle V2:</span>{' '}
              <a 
                href={`https://amoy.polygonscan.com/address/${deployment.contracts.umaOptimisticOracle.address}`}
                target="_blank"
                className="text-blue-600 hover:underline font-mono"
              >
                {deployment.contracts.umaOptimisticOracle.address}
              </a>
            </div>
          </div>
        </div>

        {/* 故障排查组件 */}
        <Troubleshoot />

        {/* 主要内容 */}
        {!account ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🦊</div>
            <h2 className="text-2xl font-bold mb-2">请连接钱包</h2>
            <p className="text-gray-600 mb-6">
              使用MetaMask连接到Polygon Amoy测试网
            </p>
          </div>
        ) : chainId !== 80002 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">错误的网络</h2>
            <p className="text-gray-600 mb-6">
              请切换到Polygon Amoy测试网 (Chain ID: 80002)
            </p>
            <p className="text-sm text-gray-500">
              当前网络: Chain ID {chainId}
            </p>
          </div>
        ) : (
          <>
            {/* 创建市场按钮 */}
            <div className="mb-6">
              <button
                onClick={() => setShowForm(!showForm)}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition"
              >
                {showForm ? '取消' : '➕ 创建新市场'}
              </button>
            </div>

            {/* 创建表单 */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">创建区块链市场</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      市场标题 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="例如：比特币2025年突破10万美元？"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述（可选）
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                      rows={3}
                      placeholder="详细的市场描述和解析规则"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      奖励金额（USDC）
                    </label>
                    <input
                      type="number"
                      value={formData.reward}
                      onChange={(e) => setFormData({...formData, reward: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                      min="100"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      用于UMA预言机的奖励，最低100 USDC
                    </p>
                  </div>

                  <button
                    onClick={createMarket}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition"
                  >
                    {loading ? '创建中...' : '✅ 创建区块链市场'}
                  </button>
                </div>
              </div>
            )}

            {/* 市场列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">市场列表</h2>
                <button
                  onClick={loadMarkets}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  🔄 刷新
                </button>
              </div>

              {loading && markets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : markets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p>暂无市场，创建第一个吧！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {markets.map((market, index) => (
                    <div key={market.questionId} className="border rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-gray-500">
                              #{index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              market.resolved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {market.resolved ? '已解析' : '进行中'}
                            </span>
                            {market.canResolve && !market.resolved && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                可解析
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {market.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {market.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="font-mono text-gray-600">
                              <span className="text-gray-500">Question ID:</span> {market.questionId.substring(0, 10)}...
                            </p>
                            <p className="font-mono text-gray-600">
                              <span className="text-gray-500">Condition ID:</span> {market.conditionId.substring(0, 10)}...
                            </p>
                            <p className="text-gray-600">
                              <span className="text-gray-500">创建时间:</span> {market.requestTimestamp}
                            </p>
                            <p className="text-gray-600">
                              <span className="text-gray-500">奖励:</span> {market.reward} USDC
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!market.resolved && market.canResolve && (
                            <button
                              onClick={() => resolveMarket(market.questionId)}
                              disabled={loading}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                            >
                              解析
                            </button>
                          )}
                          <a
                            href={`https://amoy.polygonscan.com/address/${deployment.contracts.realUmaCTFAdapter.address}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-700 text-sm px-4 py-2 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            查看详情
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 帮助信息 */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">💡 使用提示（真实 UMA Oracle 版本）</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>创建市场前需要：</strong>获取测试 USDC 和 POL（用于 Gas）</li>
                <li>• <strong>USDC 水龙头：</strong><a href="https://faucet.polygon.technology/" target="_blank" className="underline">Polygon Faucet</a></li>
                <li>• <strong>工作流程：</strong>创建市场 → UMA 请求价格 → 等待提案 → 挑战期（2小时）→ 可解析</li>
                <li>• <strong>真实 Oracle：</strong>使用 UMA Optimistic Oracle V2，支持提案/争议机制</li>
                <li>• <strong>挑战期：</strong>市场创建后需等待约 2 小时的挑战期才能解析</li>
                <li>• 如果看到"⚠️ 无法检查解析状态"警告，说明挑战期未结束，这是正常的</li>
                <li>• 解析时需要有人先提出价格提案（propose），然后等待挑战期结束</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


