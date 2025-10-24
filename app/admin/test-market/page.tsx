'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

// 使用完整版系统 ⭐
const CONTRACTS = {
  adapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC', // Test Adapter
  mockOracle: '0x378fA22104E4c735680772Bf18C5195778a55b33',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  ctf: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2', // 🆕 完整版 FullConditionalTokens
  exchange: '0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d' // 🆕 CTFExchange (订单薄)
};

const ADAPTER_ABI = [
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])"
];

const USDC_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export default function TestMarketPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // 分类信息
    mainCategory: 'emerging',
    subCategory: '',
    customSubCategory: '',
    
    // 基本信息
    title: '',
    description: '',
    imageUrl: '',
    
    // 时间设置
    startTime: '',
    endTime: '',
    resolutionTime: '',
    
    // 下注选项
    outcomeType: 'binary', // binary, multiple, numeric
    binaryOptions: ['YES', 'NO'],
    multipleOptions: [''],
    numericMin: '0',
    numericMax: '100',
    
    // 其他设置
    reward: '100',
    priorityLevel: 'recommended',
    tags: ''
  });

  // 分类系统
  const categories = {
    automotive: {
      name: '🚗 汽车',
      subCategories: ['新能源', '传统汽车', '自动驾驶', '汽车配件', '汽车服务']
    },
    'tech-ai': {
      name: '🤖 科技与AI',
      subCategories: ['人工智能', '区块链', '云计算', '物联网', '5G通信', '量子计算']
    },
    'sports-gaming': {
      name: '⚽ 体育与游戏',
      subCategories: ['足球', '篮球', '电竞', '网球', '游泳', '其他运动']
    },
    'economy-social': {
      name: '💰 经济与社会',
      subCategories: ['股票', '加密货币', '房地产', '政治', '社会事件', '经济指标']
    },
    entertainment: {
      name: '🎬 娱乐',
      subCategories: ['电影', '音乐', '综艺', '明星八卦', '颁奖典礼', '票房预测']
    },
    'smart-devices': {
      name: '📱 智能设备',
      subCategories: ['手机', '平板', '智能手表', '智能家居', 'VR/AR', '可穿戴设备']
    },
    emerging: {
      name: '🌟 新兴市场',
      subCategories: ['元宇宙', 'Web3', 'NFT', 'DeFi', 'DAO', '其他']
    }
  };

  useEffect(() => {
    checkWallet();
    
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

  useEffect(() => {
    if (account && chainId === 80002) {
      loadUSDCBalance();
      loadMarkets();
    }
  }, [account, chainId]);

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

  const loadUSDCBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const usdc = new ethers.Contract(CONTRACTS.mockUSDC, USDC_ABI, provider);
      const balance = await usdc.balanceOf(account);
      setUsdcBalance(ethers.utils.formatUnits(balance, 6));
    } catch (error) {
      console.error('加载 USDC 余额失败:', error);
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, provider);
      
      const count = await adapter.getMarketCount();
      
      if (count.gt(0)) {
        const marketIds = await adapter.getMarketList(0, count.toNumber());
        const marketsData = await Promise.all(
          marketIds.map(async (questionId: string) => {
            const market = await adapter.getMarket(questionId);
            return {
              questionId,
              title: market.title,
              description: market.description,
              reward: ethers.utils.formatUnits(market.reward, 6),
              resolved: market.resolved
            };
          })
        );
        setMarkets(marketsData);
      }
    } catch (error) {
      console.error('加载市场失败:', error);
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
      alert('请切换到 Polygon Amoy 测试网');
      return;
    }

    if (!formData.title) {
      alert('请输入市场标题');
      return;
    }

    if (!formData.description) {
      alert('请输入市场描述');
      return;
    }

    setCreating(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const usdc = new ethers.Contract(CONTRACTS.mockUSDC, USDC_ABI, signer);
      const adapter = new ethers.Contract(CONTRACTS.adapter, ADAPTER_ABI, signer);

      const reward = ethers.utils.parseUnits(formData.reward, 6);

      // 获取当前 Gas Price
      const gasPrice = await provider.getGasPrice();
      const gasPriceWithBuffer = gasPrice.mul(110).div(100); // +10% buffer

      console.log('⛽ Gas Price:', ethers.utils.formatUnits(gasPriceWithBuffer, 'gwei'), 'Gwei');

      // Step 1: Approve USDC
      console.log('📝 Approving USDC...');
      const approveTx = await usdc.approve(CONTRACTS.adapter, reward, {
        gasLimit: 100000,
        gasPrice: gasPriceWithBuffer
      });
      console.log('⏳ Approve 交易已发送:', approveTx.hash);
      await approveTx.wait();
      console.log('✅ USDC approved');

      // Step 2: Create Market
      console.log('📝 创建市场...');
      const questionId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(formData.title + Date.now())
      );

      const tx = await adapter.initialize(
        questionId,
        formData.title,
        formData.description,
        2, // YES/NO
        CONTRACTS.mockUSDC,
        reward,
        0, // 默认挑战期
        {
          gasLimit: 1200000,
          gasPrice: gasPriceWithBuffer
        }
      );

      console.log('⏳ 交易已发送:', tx.hash);
      console.log('📊 市场信息:', {
        title: formData.title,
        category: formData.category,
        imageUrl: formData.imageUrl,
        priority: formData.priorityLevel
      });

      alert(`✅ 市场创建成功！\n\n交易哈希: ${tx.hash}\n\n类型: ${formData.category}\n优先级: ${formData.priorityLevel}`);

      await tx.wait();

      // 重置表单并刷新
      setFormData({ 
        title: '', 
        description: '', 
        reward: '100',
        category: 'emerging',
        imageUrl: '',
        priorityLevel: 'recommended'
      });
      await loadMarkets();
      await loadUSDCBalance();

    } catch (error: any) {
      console.error('创建失败:', error);
      alert('创建失败:\n\n' + (error.message || '未知错误'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    市场管理中心
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">使用 Mock Oracle 和 Mock USDC 进行完整测试</p>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <ConnectWallet />
            </div>
          </div>

        {/* Network Warning */}
        {chainId && chainId !== 80002 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold">⚠️ 请切换到 Polygon Amoy 测试网 (Chain ID: 80002)</p>
          </div>
        )}

        {/* Balance & Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* USDC Balance Card */}
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-50">💰 USDC 余额</h3>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">{usdcBalance}</p>
            <p className="text-green-100 text-sm">Mock USDC</p>
          </div>
          
          {/* Test Adapter Card */}
          <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-50">🔧 Test Adapter</h3>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
            <p className="text-xs font-mono break-all text-purple-100">{CONTRACTS.adapter}</p>
          </div>

          {/* Mock Oracle Card */}
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-pink-50">🔮 Mock Oracle</h3>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎲</span>
              </div>
            </div>
            <p className="text-xs font-mono break-all text-pink-100">{CONTRACTS.mockOracle}</p>
          </div>
        </div>

        {/* Create Market Form */}
        {account && chainId === 80002 && (
          <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">创建新市场</h2>
            </div>
            
            <div className="space-y-6">
              {/* ========== 第一部分：分类系统 ========== */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>📂</span> 市场分类
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 大分类 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      主分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.mainCategory}
                      onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value, subCategory: '' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer"
                      disabled={creating}
                    >
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 小分类 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      子分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer"
                      disabled={creating}
                    >
                      <option value="">选择子分类...</option>
                      {categories[formData.mainCategory as keyof typeof categories]?.subCategories?.map((sub: string) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="custom">✏️ 自定义...</option>
                    </select>
                  </div>

                  {/* 自定义子分类 */}
                  {formData.subCategory === 'custom' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        自定义子分类 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customSubCategory}
                        onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                        placeholder="输入自定义子分类名称..."
                        disabled={creating}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ========== 第二部分：基本信息 ========== */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span>📝</span> 基本信息
                </h3>
                
                {/* 标题 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    市场标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    placeholder="例如：比亚迪2025年销量会超过特斯拉吗？"
                    disabled={creating}
                  />
                </div>

                {/* 描述 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    市场描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    rows={4}
                    placeholder="详细描述市场规则和结算条件..."
                    disabled={creating}
                  />
                </div>

                {/* 图片上传 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    封面图片
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 方式1: 上传文件 */}
                    <div>
                      <label className="block w-full cursor-pointer">
                        <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 hover:border-blue-500 transition-all duration-200 bg-blue-50 hover:bg-blue-100 text-center">
                          <div className="text-4xl mb-2">📤</div>
                          <div className="text-sm font-semibold text-blue-700 mb-1">上传图片</div>
                          <div className="text-xs text-blue-600">点击选择文件</div>
                          <div className="text-xs text-gray-500 mt-2">支持 JPG, PNG, GIF (最大5MB)</div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // 检查文件大小
                              if (file.size > 5 * 1024 * 1024) {
                                alert('图片太大！请选择小于5MB的图片');
                                return;
                              }
                              
                              // 转换为 base64
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setImagePreview(base64);
                                setFormData({ ...formData, imageUrl: base64 });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          disabled={creating}
                        />
                      </label>
                    </div>

                    {/* 方式2: 输入URL */}
                    <div>
                      <input
                        type="url"
                        value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, imageUrl: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50 h-full"
                        placeholder="或输入图片URL..."
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* 图片预览 */}
                  {(imagePreview || formData.imageUrl) && (
                    <div className="mt-4 relative">
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="预览"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview('');
                            alert('图片加载失败，请检查URL是否正确');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, imageUrl: '' });
                            setImagePreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                          disabled={creating}
                        >
                          ❌ 删除
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <span>✅</span> 图片预览成功
                      </p>
                    </div>
                  )}

                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">💡 三种方式添加图片：</span><br />
                      1️⃣ 点击上传按钮选择本地文件（推荐）<br />
                      2️⃣ 输入图片URL（如从图床复制）<br />
                      3️⃣ 留空使用默认图片
                    </p>
                  </div>

                  {/* 免费图床推荐 */}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      📎 推荐免费图床服务（点击展开）
                    </summary>
                    <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                      <p>• <a href="https://imgur.com" target="_blank" className="text-blue-600 hover:underline">Imgur</a> - 国际知名图床</p>
                      <p>• <a href="https://sm.ms" target="_blank" className="text-blue-600 hover:underline">SM.MS</a> - 简单好用</p>
                      <p>• <a href="https://imgbb.com" target="_blank" className="text-blue-600 hover:underline">ImgBB</a> - 永久免费</p>
                      <p>• <a href="https://postimages.org" target="_blank" className="text-blue-600 hover:underline">PostImages</a> - 无需注册</p>
                      <p className="text-gray-500 mt-2">💡 上传到这些网站后，复制图片链接粘贴到URL输入框</p>
                    </div>
                  </details>
                </div>

                {/* 标签 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    标签（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    placeholder="热门, 推荐, 新品 (用逗号分隔)"
                    disabled={creating}
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 用逗号分隔多个标签</p>
                </div>
              </div>

              {/* ========== 第三部分：时间设置 ========== */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <span>⏰</span> 时间设置
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 开始时间 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      开始时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">市场开始接受下注的时间</p>
                  </div>

                  {/* 结束时间 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      结束时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">停止接受下注的时间</p>
                  </div>

                  {/* 结算时间 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      结算时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.resolutionTime}
                      onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">市场预计结算的时间</p>
                  </div>
                </div>
              </div>

              {/* ========== 第四部分：下注选项 ========== */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <span>🎯</span> 下注选项设置
                </h3>
                
                {/* 选项类型 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    选项类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, outcomeType: 'binary' })}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        formData.outcomeType === 'binary'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                      disabled={creating}
                    >
                      ✅ 二选一
                      <div className="text-xs mt-1 opacity-80">YES / NO</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, outcomeType: 'multiple' })}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        formData.outcomeType === 'multiple'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                      disabled={creating}
                    >
                      📊 多选项
                      <div className="text-xs mt-1 opacity-80">自定义选项</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, outcomeType: 'numeric' })}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        formData.outcomeType === 'numeric'
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300'
                      }`}
                      disabled={creating}
                    >
                      🔢 数值范围
                      <div className="text-xs mt-1 opacity-80">Min - Max</div>
                    </button>
                  </div>
                </div>

                {/* 二选一选项 */}
                {formData.outcomeType === 'binary' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        选项 A <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.binaryOptions[0]}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          binaryOptions: [e.target.value, formData.binaryOptions[1]] 
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                        placeholder="例如：YES"
                        disabled={creating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        选项 B <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.binaryOptions[1]}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          binaryOptions: [formData.binaryOptions[0], e.target.value] 
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                        placeholder="例如：NO"
                        disabled={creating}
                      />
                    </div>
                  </div>
                )}

                {/* 多选项 */}
                {formData.outcomeType === 'multiple' && (
                  <div className="space-y-3">
                    {formData.multipleOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.multipleOptions];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, multipleOptions: newOptions });
                          }}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                          placeholder={`选项 ${index + 1}`}
                          disabled={creating}
                        />
                        {formData.multipleOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = formData.multipleOptions.filter((_, i) => i !== index);
                              setFormData({ ...formData, multipleOptions: newOptions });
                            }}
                            className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                            disabled={creating}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        multipleOptions: [...formData.multipleOptions, ''] 
                      })}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                      disabled={creating}
                    >
                      ➕ 添加选项
                    </button>
                  </div>
                )}

                {/* 数值范围 */}
                {formData.outcomeType === 'numeric' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        最小值 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.numericMin}
                        onChange={(e) => setFormData({ ...formData, numericMin: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                        placeholder="0"
                        disabled={creating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        最大值 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.numericMax}
                        onChange={(e) => setFormData({ ...formData, numericMax: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                        placeholder="100"
                        disabled={creating}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ========== 第五部分：其他设置 ========== */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
                  <span>⚙️</span> 其他设置
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* 优先级 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      优先级 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priorityLevel}
                      onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer"
                      disabled={creating}
                    >
                      <option value="hot">🔥 热门推荐</option>
                      <option value="recommended">⭐ 推荐</option>
                      <option value="normal">📊 普通</option>
                    </select>
                  </div>

                  {/* 奖励金额 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      奖励金额 (USDC) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.reward}
                      onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white hover:bg-gray-50"
                      placeholder="100"
                      min="1"
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">💰 当前余额: {usdcBalance} USDC</p>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                onClick={createMarket}
                disabled={creating || !formData.title || !formData.description}
                className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                  {creating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      创建中...（需确认2次交易）
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🚀</span>
                      创建市场
                    </span>
                  )}
                </span>
              </button>

              {/* 提示信息 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">温馨提示</p>
                    <p className="text-xs text-blue-700">
                      创建市场需要确认 2 次交易：<br />
                      1️⃣ Approve USDC（授权）<br />
                      2️⃣ 创建市场（上链）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Markets List */}
        <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">市场列表</h2>
            </div>
            <button
              onClick={loadMarkets}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              刷新
            </button>
          </div>

          {loading && markets.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p>暂无市场，创建第一个吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {markets.map((market, index) => (
                <div 
                  key={market.questionId} 
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold">
                          #{index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          market.resolved 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                            : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                        }`}>
                          {market.resolved ? '✅ 已解析' : '⚡ 进行中'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                        {market.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{market.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                          <p className="text-sm font-bold text-orange-700">
                            💰 奖励: {market.reward} USDC
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Info */}
        <div className="mt-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-3">测试版特点</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">🔮</span>
                  <p className="text-sm text-green-800">使用 Mock Oracle：无需等待真实 UMA Oracle</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">💵</span>
                  <p className="text-sm text-green-800">使用 Mock USDC：无白名单限制，您有 {usdcBalance} USDC 可用</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">👛</span>
                  <p className="text-sm text-green-800">创建市场会弹出 2 次钱包确认（Approve + Create）</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⚠️</span>
                  <p className="text-sm text-orange-800 font-semibold">仅用于测试，不用于生产环境</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

