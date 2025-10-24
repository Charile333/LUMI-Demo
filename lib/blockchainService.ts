/**
 * 区块链服务 - 纯 Web3 架构
 * 直接从链上读取市场数据
 */

import { ethers } from 'ethers';

// 合约配置
const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  fullCtf: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  exchange: '0x213F1F4Fa93f4079BB24FAB7eAA891e603dB2E2d',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com'
};

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
];

// 简单的客户端缓存
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 30000; // 30 秒

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new ClientCache();

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private adapter: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(CONTRACTS.rpcUrl);
    this.adapter = new ethers.Contract(
      CONTRACTS.testAdapter,
      ADAPTER_ABI,
      this.provider
    );
  }

  /**
   * 获取所有市场
   */
  async getMarkets(limit: number = 50) {
    try {
      // 检查缓存
      const cached = cache.get('markets');
      if (cached) {
        console.log('[Blockchain] 使用缓存');
        return cached;
      }

      console.log('[Blockchain] 从链上读取市场...');
      
      const count = await this.adapter.getMarketCount();
      if (count.eq(0)) {
        console.log('[Blockchain] 没有市场');
        return [];
      }

      const marketIds = await this.adapter.getMarketList(0, Math.min(count.toNumber(), limit));
      
      const markets = [];
      for (const questionId of marketIds) {
        try {
          const market = await this.adapter.getMarket(questionId);
          markets.push({
            id: market.questionId,
            title: market.title,
            description: market.description,
            resolved: market.resolved,
            outcomeSlotCount: market.outcomeSlotCount.toNumber(),
            rewardToken: market.rewardToken,
            reward: ethers.utils.formatUnits(market.reward, 6), // USDC 6 decimals
            conditionId: market.conditionId,
            requestTimestamp: market.requestTimestamp.toNumber(),
            payouts: market.payouts.map((p: ethers.BigNumber) => p.toString()),
          });
        } catch (error) {
          console.error('[Blockchain] 获取市场失败:', questionId, error);
        }
      }
      
      // 缓存结果
      cache.set('markets', markets);
      console.log(`[Blockchain] 成功加载 ${markets.length} 个市场`);
      
      return markets;
    } catch (error) {
      console.error('[Blockchain] getMarkets 失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个市场详情
   */
  async getMarket(questionId: string) {
    try {
      const market = await this.adapter.getMarket(questionId);
      return {
        id: market.questionId,
        title: market.title,
        description: market.description,
        resolved: market.resolved,
        outcomeSlotCount: market.outcomeSlotCount.toNumber(),
        rewardToken: market.rewardToken,
        reward: ethers.utils.formatUnits(market.reward, 6),
        conditionId: market.conditionId,
        requestTimestamp: market.requestTimestamp.toNumber(),
        payouts: market.payouts.map((p: ethers.BigNumber) => p.toString()),
      };
    } catch (error) {
      console.error('[Blockchain] getMarket 失败:', error);
      throw error;
    }
  }

  /**
   * 获取合约地址
   */
  getContracts() {
    return CONTRACTS;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    cache.clear();
  }
}

// 导出单例
export const blockchainService = new BlockchainService();







