/**
 * 区块链市场数据提供者
 * 从链上合约读取市场数据
 */

import { IDataProvider } from './base';
import { Market, CategoryType } from '@/lib/types/market';
import { ethers } from 'ethers';

const CONTRACTS = {
  testAdapter: '0x5D440c98B55000087a8b0C164f1690551d18CfcC',
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com' // 🆕 稳定的 RPC
};

const ADAPTER_ABI = [
  "function getMarketCount() view returns (uint256)",
  "function getMarketList(uint256 offset, uint256 limit) view returns (bytes32[])",
  "function getMarket(bytes32 questionId) view returns (tuple(bytes32 questionId, bytes32 conditionId, string title, string description, uint256 outcomeSlotCount, uint256 requestTimestamp, bool resolved, address rewardToken, uint256 reward, uint256[] payouts))"
];

export class BlockchainProvider implements IDataProvider {
  name = 'blockchain';
  supportedCategories: CategoryType[] = [
    'automotive',
    'tech-ai',
    'entertainment',
    'smart-devices',
    'sports-gaming',
    'economy-social',
    'emerging'
  ];
  defaultPriority = 95; // 高优先级，因为是去中心化的

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
   * 获取市场数据
   */
  async fetchMarkets(
    category: CategoryType,
    limit: number
  ): Promise<Market[]> {
    try {
      // 1. 获取市场总数
      const count = await this.adapter.getMarketCount();
      
      if (count.eq(0)) {
        return [];
      }

      // 2. 获取所有市场ID
      const marketIds = await this.adapter.getMarketList(0, count.toNumber());

      // 3. 获取每个市场的详细信息
      const markets: Market[] = [];
      
      for (const questionId of marketIds) {
        try {
          const market = await this.adapter.getMarket(questionId);
          
          // 跳过已解析的市场（可选）
          // if (market.resolved) continue;

          // 转换为统一的 Market 格式
          const formattedMarket = this.formatMarket(market, category);
          if (formattedMarket) {
            markets.push(formattedMarket);
          }
        } catch (error) {
          console.error(`[Blockchain] 获取市场 ${questionId} 失败:`, error);
          continue;
        }
      }

      return markets.slice(0, limit);

    } catch (error) {
      console.error('[Blockchain] 获取市场列表失败:', error);
      return [];
    }
  }

  /**
   * 检查服务是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === 80002; // Polygon Amoy
    } catch {
      return false;
    }
  }

  /**
   * 格式化市场数据
   */
  private formatMarket(market: any, category: CategoryType): Market | null {
    try {
      const reward = parseFloat(ethers.utils.formatUnits(market.reward, 6));
      
      // 构建市场URL - 使用 conditionId 作为交易页面的参数
      const marketUrl = `/trade/${market.conditionId}`;

      return {
        id: market.questionId,
        title: market.title || '未命名市场',
        category: category, // 必需字段
        probability: 50, // 默认概率50%（未解析市场）
        volume: `${reward.toFixed(2)} USDC`, // 使用奖励作为成交量
        volumeNum: reward, // 数值型成交量
        endDate: 'TBD', // 链上市场没有固定结束时间
        trend: 'up' as const, // 默认趋势
        change: '+0%', // 默认变化
        description: market.description || market.title || '暂无描述',
        resolutionCriteria: [], // 链上市场的解析标准
        relatedMarkets: [], // 相关市场
        question: market.description || market.title || '暂无描述',
        image: '/image/default-market.png', // 默认图片
        options: [
          {
            name: 'YES',
            probability: market.resolved 
              ? (market.payouts[0].toString() === '1' ? '100%' : '0%')
              : '50%', // 未解析时显示50%
            totalValue: `${(reward / 2).toFixed(0)}` // 平分奖励
          },
          {
            name: 'NO',
            probability: market.resolved
              ? (market.payouts[1].toString() === '1' ? '100%' : '0%')
              : '50%',
            totalValue: `${(reward / 2).toFixed(0)}`
          }
        ],
        participants: 0, // 链上暂无此数据
        categoryType: category,
        priorityLevel: market.resolved ? 'normal' : 'recommended', // 进行中的市场优先级更高
        tags: [
          'blockchain',
          market.resolved ? 'resolved' : 'active',
          'usdc'
        ],
        source: 'blockchain' as const,
        sourceUrl: marketUrl,
        externalUrl: `https://www.oklink.com/amoy/address/${CONTRACTS.testAdapter}`,
        createdAt: new Date(market.requestTimestamp.toNumber() * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          conditionId: market.conditionId,
          questionId: market.questionId,
          outcomeSlotCount: market.outcomeSlotCount.toNumber(),
          reward: reward,
          rewardToken: market.rewardToken,
          resolved: market.resolved,
          contract: CONTRACTS.testAdapter
        }
      };
    } catch (error) {
      console.error('[Blockchain] 格式化市场失败:', error);
      return null;
    }
  }
}

// 导出单例
export const blockchainProvider = new BlockchainProvider();

