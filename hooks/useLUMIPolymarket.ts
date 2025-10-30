/**
 * 🎯 LUMI Polymarket React Hook
 * 
 * 统一集成三大官方组件的 React Hook：
 * 1. UMA 官方预言机
 * 2. Polymarket 官方 CTF Exchange
 * 3. Gnosis Conditional Tokens
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// ==================== 配置 ====================

const CONFIG = {
  network: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
    explorer: 'https://amoy.polygonscan.com'
  },
  contracts: {
    umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
    ctfExchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',
    conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
    adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
    mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
  }
};

const ABIS = {
  adapter: [
    "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
    "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
    "function requestOraclePrice(bytes32 questionId) external returns (uint256)",
    "function resolve(bytes32 questionId) external"
  ],
  ctfExchange: [
    "function fillOrder(tuple(uint256 salt, address maker, address signer, address taker, uint256 tokenId, uint256 makerAmount, uint256 takerAmount, uint256 expiration, uint256 nonce, uint256 feeRateBps, uint8 side, uint8 signatureType) order, bytes signature, uint256 fillAmount) external"
  ],
  conditionalTokens: [
    "function balanceOf(address owner, uint256 tokenId) view returns (uint256)",
    "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] indexSets) external"
  ],
  erc20: [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)"
  ]
};

// ==================== 类型定义 ====================

export interface Market {
  questionId: string;
  conditionId: string;
  title: string;
  description: string;
  outcomeSlotCount: number;
  resolved: boolean;
  payouts: number[];
}

export interface Order {
  salt: number;
  maker: string;
  signer: string;
  taker: string;
  tokenId: number;
  makerAmount: ethers.BigNumber;
  takerAmount: ethers.BigNumber;
  expiration: number;
  nonce: number;
  feeRateBps: number;
  side: number;
  signatureType: number;
}

export interface TransactionResult {
  transactionHash: string;
  explorerUrl: string;
}

// ==================== Hook ====================

export function useLUMIPolymarket() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 合约实例
  const [contracts, setContracts] = useState<{
    adapter: ethers.Contract | null;
    ctfExchange: ethers.Contract | null;
    conditionalTokens: ethers.Contract | null;
    mockUSDC: ethers.Contract | null;
  }>({
    adapter: null,
    ctfExchange: null,
    conditionalTokens: null,
    mockUSDC: null
  });

  /**
   * 连接钱包
   */
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('请安装 MetaMask 钱包');
      }

      // 🎯 显示账号选择器
      try {
        // 先请求权限，这会显示账号选择器
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{
            eth_accounts: {}
          }]
        });
      } catch (error) {
        // 如果用户取消，继续尝试常规连接
        console.log('用户取消账号选择，使用默认账号');
      }

      // 请求账户访问
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ 已连接账号:', accounts);

      // 创建 Provider 和 Signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(userAddress);

      // 检查网络
      const network = await web3Provider.getNetwork();
      if (network.chainId !== CONFIG.network.chainId) {
        await switchNetwork();
      }

      // 初始化合约
      const adapter = new ethers.Contract(
        CONFIG.contracts.adapter,
        ABIS.adapter,
        web3Signer
      );
      
      const ctfExchange = new ethers.Contract(
        CONFIG.contracts.ctfExchange,
        ABIS.ctfExchange,
        web3Signer
      );
      
      const conditionalTokens = new ethers.Contract(
        CONFIG.contracts.conditionalTokens,
        ABIS.conditionalTokens,
        web3Signer
      );
      
      const mockUSDC = new ethers.Contract(
        CONFIG.contracts.mockUSDC,
        ABIS.erc20,
        web3Signer
      );

      setContracts({
        adapter,
        ctfExchange,
        conditionalTokens,
        mockUSDC
      });

      setIsConnected(true);
      console.log('✅ 已连接钱包:', userAddress);
    } catch (err: any) {
      setError(err.message);
      console.error('连接失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 切换网络
   */
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(CONFIG.network.chainId) }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: ethers.utils.hexValue(CONFIG.network.chainId),
            chainName: CONFIG.network.name,
            rpcUrls: [CONFIG.network.rpcUrl],
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
            },
            blockExplorerUrls: [CONFIG.network.explorer]
          }]
        });
      } else {
        throw error;
      }
    }
  };

  /**
   * 断开连接
   */
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setIsConnected(false);
    setContracts({
      adapter: null,
      ctfExchange: null,
      conditionalTokens: null,
      mockUSDC: null
    });
  }, []);

  // ==================== 组件 1: 创建市场 ====================

  /**
   * 创建市场
   */
  const createMarket = useCallback(async (
    title: string,
    description: string,
    rewardAmount: number = 100
  ): Promise<TransactionResult> => {
    if (!contracts.adapter || !contracts.mockUSDC) {
      throw new Error('请先连接钱包');
    }

    console.log('📝 创建市场:', title);

    // 生成 questionId
    const questionId = ethers.utils.id(title + Date.now());

    // 批准 USDC
    const reward = ethers.utils.parseUnits(rewardAmount.toString(), 6);
    const allowance = await contracts.mockUSDC.allowance(address, CONFIG.contracts.adapter);

    if (allowance.lt(reward)) {
      console.log('💰 批准 USDC...');
      const approveTx = await contracts.mockUSDC.approve(
        CONFIG.contracts.adapter,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
    }

    // 创建市场
    const tx = await contracts.adapter.initialize(
      questionId,
      title,
      description,
      2, // YES/NO
      CONFIG.contracts.mockUSDC,
      reward,
      0
    );

    const receipt = await tx.wait();

    console.log('✅ 市场创建成功！QuestionID:', questionId);

    return {
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
    };
  }, [contracts, address]);

  /**
   * 获取市场信息
   */
  const getMarket = useCallback(async (questionId: string): Promise<Market> => {
    if (!contracts.adapter) {
      throw new Error('请先连接钱包');
    }

    const market = await contracts.adapter.getMarket(questionId);

    return {
      questionId: market.questionId,
      conditionId: market.conditionId,
      title: market.title,
      description: market.description,
      outcomeSlotCount: market.outcomeSlotCount.toNumber(),
      resolved: market.resolved,
      payouts: market.payouts.map((p: ethers.BigNumber) => p.toNumber())
    };
  }, [contracts]);

  // ==================== 组件 2: 交易 ====================

  /**
   * 创建订单
   */
  const createOrder = useCallback(async (
    tokenId: number,
    amount: number,
    price: number,
    side: 'BUY' | 'SELL' = 'BUY'
  ) => {
    if (!signer) {
      throw new Error('请先连接钱包');
    }

    const order: Order = {
      salt: Date.now(),
      maker: address,
      signer: address,
      taker: ethers.constants.AddressZero,
      tokenId,
      makerAmount: ethers.utils.parseUnits(amount.toString(), 6),
      takerAmount: ethers.utils.parseUnits((amount * price).toString(), 6),
      expiration: Math.floor(Date.now() / 1000) + 86400,
      nonce: Date.now(),
      feeRateBps: 0,
      side: side === 'BUY' ? 0 : 1,
      signatureType: 0
    };

    // EIP-712 签名
    const domain = {
      name: 'CTF Exchange',
      version: '1',
      chainId: CONFIG.network.chainId,
      verifyingContract: CONFIG.contracts.ctfExchange
    };

    const types = {
      Order: [
        { name: 'salt', type: 'uint256' },
        { name: 'maker', type: 'address' },
        { name: 'signer', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'makerAmount', type: 'uint256' },
        { name: 'takerAmount', type: 'uint256' },
        { name: 'expiration', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'feeRateBps', type: 'uint256' },
        { name: 'side', type: 'uint8' },
        { name: 'signatureType', type: 'uint8' }
      ]
    };

    const signature = await signer._signTypedData(domain, types, order);

    return { order, signature };
  }, [signer, address]);

  /**
   * 执行交易
   */
  const fillOrder = useCallback(async (
    order: Order,
    signature: string,
    fillAmount?: ethers.BigNumber
  ): Promise<TransactionResult> => {
    if (!contracts.ctfExchange) {
      throw new Error('请先连接钱包');
    }

    console.log('💱 执行交易...');

    const tx = await contracts.ctfExchange.fillOrder(
      order,
      signature,
      fillAmount || order.makerAmount
    );

    const receipt = await tx.wait();

    console.log('✅ 交易成功！');

    return {
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
    };
  }, [contracts]);

  // ==================== 组件 3: 结算 ====================

  /**
   * 请求 UMA 预言机结算
   */
  const requestSettlement = useCallback(async (
    questionId: string
  ): Promise<TransactionResult> => {
    if (!contracts.adapter) {
      throw new Error('请先连接钱包');
    }

    console.log('🔮 请求 UMA 预言机结算...');

    const tx = await contracts.adapter.requestOraclePrice(questionId);
    const receipt = await tx.wait();

    console.log('✅ 结算请求已提交！现在进入挑战期（约2小时）');

    return {
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
    };
  }, [contracts]);

  /**
   * 最终结算市场
   */
  const resolveMarket = useCallback(async (
    questionId: string
  ): Promise<TransactionResult> => {
    if (!contracts.adapter) {
      throw new Error('请先连接钱包');
    }

    console.log('✅ 最终结算市场...');

    const tx = await contracts.adapter.resolve(questionId);
    const receipt = await tx.wait();

    console.log('✅ 市场已结算！');

    return {
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
    };
  }, [contracts]);

  /**
   * 赎回获胜代币
   */
  const redeemWinnings = useCallback(async (
    conditionId: string,
    outcomeIndex: number
  ): Promise<TransactionResult> => {
    if (!contracts.conditionalTokens) {
      throw new Error('请先连接钱包');
    }

    console.log('💰 赎回获胜代币...');

    const tx = await contracts.conditionalTokens.redeemPositions(
      CONFIG.contracts.mockUSDC,
      ethers.constants.HashZero,
      conditionId,
      [1 << outcomeIndex]
    );

    const receipt = await tx.wait();

    console.log('✅ 赎回成功！');

    return {
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
    };
  }, [contracts]);

  // ==================== 实用函数 ====================

  /**
   * 获取余额
   */
  const getBalance = useCallback(async (tokenAddress?: string): Promise<string> => {
    if (!provider || !address) {
      return '0';
    }

    if (!tokenAddress) {
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } else {
      const token = new ethers.Contract(tokenAddress, ABIS.erc20, provider);
      const balance = await token.balanceOf(address);
      return ethers.utils.formatUnits(balance, 6);
    }
  }, [provider, address]);

  // 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return {
    // 状态
    provider,
    signer,
    address,
    isConnected,
    isLoading,
    error,
    contracts,
    
    // 连接
    connect,
    disconnect,
    switchNetwork,
    
    // 组件 1: 创建市场 (Conditional Tokens)
    createMarket,
    getMarket,
    
    // 组件 2: 交易 (CTF Exchange)
    createOrder,
    fillOrder,
    
    // 组件 3: 结算 (UMA Oracle)
    requestSettlement,
    resolveMarket,
    redeemWinnings,
    
    // 实用函数
    getBalance,
    
    // 配置
    config: CONFIG
  };
}

