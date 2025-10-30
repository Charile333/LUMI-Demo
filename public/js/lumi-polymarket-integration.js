/**
 * 🎯 LUMI Polymarket 集成库
 * 
 * 统一集成三大官方组件：
 * 1. UMA 官方预言机 (Optimistic Oracle V3)
 * 2. Polymarket 官方 CTF Exchange
 * 3. Gnosis Conditional Tokens
 * 
 * 可在所有 HTML 页面和 Next.js 应用中使用
 */

(function(window) {
  'use strict';

  // ==================== 配置 ====================
  
  const CONFIG = {
    // Polygon Amoy Testnet
    network: {
      chainId: 80002,
      name: 'Polygon Amoy',
      rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
      explorer: 'https://amoy.polygonscan.com'
    },
    
    // 三大官方组件地址
    contracts: {
      // 1. UMA 官方预言机
      umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
      
      // 2. Polymarket 官方 CTF Exchange
      ctfExchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',
      
      // 3. Gnosis Conditional Tokens
      conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
      
      // 适配器（连接三者）
      adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
      
      // 测试代币
      mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
    }
  };

  // ==================== ABI 定义 ====================
  
  const ABIS = {
    adapter: [
      "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)",
      "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))",
      "function getMarketCount() view returns (uint256)",
      "function requestOraclePrice(bytes32 questionId) external returns (uint256)",
      "function resolve(bytes32 questionId) external"
    ],
    
    ctfExchange: [
      "function fillOrder(tuple(uint256 salt, address maker, address signer, address taker, uint256 tokenId, uint256 makerAmount, uint256 takerAmount, uint256 expiration, uint256 nonce, uint256 feeRateBps, uint8 side, uint8 signatureType) order, bytes signature, uint256 fillAmount) external",
      "function getOrderStatus(bytes32 orderHash) view returns (uint256)"
    ],
    
    conditionalTokens: [
      "function prepareCondition(address oracle, bytes32 questionId, uint256 outcomeSlotCount) external",
      "function getConditionId(address oracle, bytes32 questionId, uint256 outcomeSlotCount) view returns (bytes32)",
      "function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] partition, uint256 amount) external",
      "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] indexSets) external",
      "function balanceOf(address owner, uint256 tokenId) view returns (uint256)"
    ],
    
    erc20: [
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ]
  };

  // ==================== LUMI Polymarket 类 ====================
  
  class LUMIPolymarket {
    constructor() {
      this.provider = null;
      this.signer = null;
      this.contracts = {};
      this.isInitialized = false;
    }

    /**
     * 初始化 - 连接钱包和合约
     */
    async init() {
      console.log('🚀 初始化 LUMI Polymarket 集成...');
      
      // 检查 MetaMask
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

      // 连接钱包
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ 已连接账号:', accounts);
      
      // 创建 Provider 和 Signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // 检查网络
      const network = await this.provider.getNetwork();
      if (network.chainId !== CONFIG.network.chainId) {
        await this.switchNetwork();
      }

      // 初始化合约
      this.contracts.adapter = new ethers.Contract(
        CONFIG.contracts.adapter,
        ABIS.adapter,
        this.signer
      );
      
      this.contracts.ctfExchange = new ethers.Contract(
        CONFIG.contracts.ctfExchange,
        ABIS.ctfExchange,
        this.signer
      );
      
      this.contracts.conditionalTokens = new ethers.Contract(
        CONFIG.contracts.conditionalTokens,
        ABIS.conditionalTokens,
        this.signer
      );
      
      this.contracts.mockUSDC = new ethers.Contract(
        CONFIG.contracts.mockUSDC,
        ABIS.erc20,
        this.signer
      );

      this.isInitialized = true;
      console.log('✅ LUMI Polymarket 初始化完成');
      
      return {
        address: await this.signer.getAddress(),
        network: network.name
      };
    }

    /**
     * 切换到正确的网络
     */
    async switchNetwork() {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(CONFIG.network.chainId) }],
        });
      } catch (error) {
        // 如果网络不存在，添加网络
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
    }

    // ==================== 组件 1: 创建市场 (Conditional Tokens) ====================
    
    /**
     * 创建预测市场
     */
    async createMarket(title, description, rewardAmount = 100) {
      if (!this.isInitialized) await this.init();
      
      console.log('📝 创建市场:', title);
      
      try {
        const userAddress = await this.signer.getAddress();
        
        // 🔍 检查余额
        console.log('💰 检查余额...');
        const maticBalance = await this.provider.getBalance(userAddress);
        const usdcBalance = await this.contracts.mockUSDC.balanceOf(userAddress);
        
        console.log('   MATIC 余额:', ethers.utils.formatEther(maticBalance), 'MATIC');
        console.log('   USDC 余额:', ethers.utils.formatUnits(usdcBalance, 6), 'USDC');
        
        // 检查是否有足够的 MATIC
        if (maticBalance.lt(ethers.utils.parseEther('0.01'))) {
          throw new Error('MATIC 余额不足！\n\n需要至少 0.01 MATIC 支付 Gas 费用。\n\n请访问水龙头获取测试币：\nhttps://faucet.polygon.technology/\n\n你的地址: ' + userAddress);
        }
        
        // 生成唯一的 questionId
        const questionId = ethers.utils.id(title + Date.now());
        const reward = ethers.utils.parseUnits(rewardAmount.toString(), 6);
        
        // 检查是否有足够的 USDC
        if (usdcBalance.lt(reward)) {
          console.warn('⚠️ USDC 余额不足！需要:', ethers.utils.formatUnits(reward, 6), 'USDC');
          console.warn('⚠️ 当前余额:', ethers.utils.formatUnits(usdcBalance, 6), 'USDC');
          
          // 尝试使用用户现有的余额
          if (usdcBalance.gt(0)) {
            console.log('💡 使用现有余额:', ethers.utils.formatUnits(usdcBalance, 6), 'USDC');
            reward = usdcBalance;
          } else {
            throw new Error('USDC 余额不足！\n\n需要至少 ' + rewardAmount + ' USDC 作为预言机奖励。\n\n你的地址: ' + userAddress);
          }
        }
        
        // 批准 USDC
        const allowance = await this.contracts.mockUSDC.allowance(userAddress, CONFIG.contracts.adapter);
        
        if (allowance.lt(reward)) {
          console.log('💰 批准 USDC...（需要在 MetaMask 确认）');
          try {
            const approveTx = await this.contracts.mockUSDC.approve(
              CONFIG.contracts.adapter,
              ethers.constants.MaxUint256
            );
            console.log('⏳ 等待批准交易确认...');
            await approveTx.wait();
            console.log('✅ USDC 批准成功！');
          } catch (approveError) {
            if (approveError.code === 4001) {
              throw new Error('你取消了 USDC 批准。\n\n创建市场需要批准 USDC 使用权限。');
            }
            throw approveError;
          }
        } else {
          console.log('✅ USDC 已批准');
        }

        // 创建市场
        console.log('🔨 调用适配器创建市场...（需要在 MetaMask 确认）');
        try {
          const tx = await this.contracts.adapter.initialize(
            questionId,
            title,
            description,
            2, // YES/NO
            CONFIG.contracts.mockUSDC,
            reward,
            0 // 使用默认挑战期
          );
          
          console.log('⏳ 等待交易确认...');
          const receipt = await tx.wait();
          
          console.log('✅ 市场创建成功！');
          console.log('   QuestionID:', questionId);
          console.log('   交易哈希:', receipt.transactionHash);
          
          return {
            questionId,
            transactionHash: receipt.transactionHash,
            explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
          };
        } catch (txError) {
          if (txError.code === 4001) {
            throw new Error('你取消了交易。');
          }
          
          // 尝试解析合约 revert 原因
          if (txError.data || txError.error) {
            console.error('合约错误详情:', txError);
            throw new Error('合约调用失败！\n\n可能原因：\n1. 合约未正确部署\n2. 参数错误\n3. Gas 不足\n\n详细错误: ' + (txError.reason || txError.message));
          }
          
          throw txError;
        }
      } catch (error) {
        console.error('❌ 创建市场详细错误:', error);
        throw error;
      }
    }

    /**
     * 获取市场信息
     */
    async getMarket(questionId) {
      if (!this.isInitialized) await this.init();
      
      const market = await this.contracts.adapter.getMarket(questionId);
      
      return {
        questionId: market.questionId,
        conditionId: market.conditionId,
        title: market.title,
        description: market.description,
        outcomeSlotCount: market.outcomeSlotCount.toNumber(),
        resolved: market.resolved,
        payouts: market.payouts.map(p => p.toNumber())
      };
    }

    // ==================== 组件 2: 交易 (CTF Exchange) ====================
    
    /**
     * 创建订单
     */
    async createOrder(tokenId, amount, price, side = 'BUY') {
      if (!this.isInitialized) await this.init();
      
      console.log('📋 创建订单...');
      
      const address = await this.signer.getAddress();
      
      const order = {
        salt: Date.now(),
        maker: address,
        signer: address,
        taker: ethers.constants.AddressZero,
        tokenId: tokenId,
        makerAmount: ethers.utils.parseUnits(amount.toString(), 6),
        takerAmount: ethers.utils.parseUnits((amount * price).toString(), 6),
        expiration: Math.floor(Date.now() / 1000) + 86400, // 24小时
        nonce: Date.now(),
        feeRateBps: 0,
        side: side === 'BUY' ? 0 : 1,
        signatureType: 0
      };
      
      // 签名订单 (EIP-712)
      const signature = await this.signOrder(order);
      
      return { order, signature };
    }

    /**
     * 签名订单 (EIP-712)
     */
    async signOrder(order) {
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
      
      return await this.signer._signTypedData(domain, types, order);
    }

    /**
     * 执行交易
     */
    async fillOrder(order, signature, fillAmount) {
      if (!this.isInitialized) await this.init();
      
      console.log('💱 执行交易...');
      
      const tx = await this.contracts.ctfExchange.fillOrder(
        order,
        signature,
        fillAmount || order.makerAmount
      );
      
      console.log('⏳ 等待交易确认...');
      const receipt = await tx.wait();
      
      console.log('✅ 交易成功！');
      
      return {
        transactionHash: receipt.transactionHash,
        explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
      };
    }

    // ==================== 组件 3: 结算 (UMA Oracle) ====================
    
    /**
     * 请求 UMA 预言机结算
     */
    async requestSettlement(questionId) {
      if (!this.isInitialized) await this.init();
      
      console.log('🔮 请求 UMA 预言机结算...');
      
      const tx = await this.contracts.adapter.requestOraclePrice(questionId);
      
      console.log('⏳ 等待交易确认...');
      const receipt = await tx.wait();
      
      console.log('✅ 结算请求已提交！');
      console.log('   现在进入挑战期（约2小时）');
      
      return {
        transactionHash: receipt.transactionHash,
        explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
      };
    }

    /**
     * 最终结算市场
     */
    async resolveMarket(questionId) {
      if (!this.isInitialized) await this.init();
      
      console.log('✅ 最终结算市场...');
      
      const tx = await this.contracts.adapter.resolve(questionId);
      
      console.log('⏳ 等待交易确认...');
      const receipt = await tx.wait();
      
      console.log('✅ 市场已结算！');
      
      return {
        transactionHash: receipt.transactionHash,
        explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
      };
    }

    // ==================== 实用函数 ====================
    
    /**
     * 获取用户余额
     */
    async getBalance(tokenAddress = null) {
      if (!this.isInitialized) await this.init();
      
      const address = await this.signer.getAddress();
      
      if (!tokenAddress) {
        // ETH/MATIC 余额
        const balance = await this.provider.getBalance(address);
        return ethers.utils.formatEther(balance);
      } else {
        // ERC20 余额
        const token = new ethers.Contract(tokenAddress, ABIS.erc20, this.signer);
        const balance = await token.balanceOf(address);
        const decimals = await token.decimals();
        return ethers.utils.formatUnits(balance, decimals);
      }
    }

    /**
     * 获取 Outcome Token 余额
     */
    async getOutcomeTokenBalance(tokenId) {
      if (!this.isInitialized) await this.init();
      
      const address = await this.signer.getAddress();
      const balance = await this.contracts.conditionalTokens.balanceOf(address, tokenId);
      
      return ethers.utils.formatUnits(balance, 6);
    }

    /**
     * 赎回获胜代币
     */
    async redeemWinnings(conditionId, outcomeIndex) {
      if (!this.isInitialized) await this.init();
      
      console.log('💰 赎回获胜代币...');
      
      const tx = await this.contracts.conditionalTokens.redeemPositions(
        CONFIG.contracts.mockUSDC,
        ethers.constants.HashZero,
        conditionId,
        [1 << outcomeIndex]
      );
      
      console.log('⏳ 等待交易确认...');
      const receipt = await tx.wait();
      
      console.log('✅ 赎回成功！');
      
      return {
        transactionHash: receipt.transactionHash,
        explorerUrl: `${CONFIG.network.explorer}/tx/${receipt.transactionHash}`
      };
    }

    /**
     * 监听账户变化
     */
    onAccountChange(callback) {
      if (!window.ethereum) return;
      
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          this.signer = this.provider.getSigner();
          callback(accounts[0]);
        }
      });
    }

    /**
     * 监听网络变化
     */
    onNetworkChange(callback) {
      if (!window.ethereum) return;
      
      window.ethereum.on('chainChanged', (chainId) => {
        callback(parseInt(chainId, 16));
      });
    }
  }

  // ==================== 导出到全局 ====================
  
  window.LUMIPolymarket = LUMIPolymarket;
  window.LUMI_CONFIG = CONFIG;
  
  console.log('✅ LUMI Polymarket 集成库已加载');

})(window);

