// 🚀 市场链上激活工具

import { ethers } from 'ethers';
import { db } from '@/lib/db';

// 合约地址配置 - 完整 Polymarket 系统 🔮
const CONTRACTS = {
  adapter: '0xaBf0e29946C63fa1920E00bEA95dDADeF70FD80C',
  umaOracle: '0x263351499f82C107e540B01F0Ca959843e22464a',
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  exchange: '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40',
  mockUSDC: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'
};

const ADAPTER_ABI = [
  "function initialize(bytes32 questionId, string title, string description, uint256 outcomeSlotCount, address rewardToken, uint256 reward, uint256 customLiveness) returns (bytes32)"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

/**
 * 在链上激活市场
 */
export async function activateMarketOnChain(marketId: number): Promise<{
  success: boolean;
  conditionId?: string;
  txHash?: string;
  error?: string;
}> {
  console.log(`\n🚀 开始激活市场 ${marketId}...`);
  
  try {
    // 1. 获取市场数据
    const marketResult = await db.query(
      `SELECT * FROM markets WHERE id = $1`,
      [marketId]
    );
    
    if (marketResult.rows.length === 0) {
      throw new Error('市场不存在');
    }
    
    const market = marketResult.rows[0];
    
    // 检查是否已激活
    if (market.blockchain_status === 'created') {
      console.log('⚠️ 市场已激活');
      return {
        success: true,
        conditionId: market.condition_id,
        error: '市场已激活'
      };
    }
    
    console.log(`📊 市场信息:
      标题: ${market.title}
      活跃度: ${market.activity_score}
      浏览量: ${market.views}
      感兴趣: ${market.interested_users}
    `);
    
    // 2. 更新状态为 creating
    await db.query(
      `UPDATE markets SET blockchain_status = $1 WHERE id = $2`,
      ['creating', marketId]
    );
    
    // 2.5. 广播激活中事件（WebSocket）
    try {
      const { broadcastMarketActivating } = await import('@/lib/websocket/market-events');
      broadcastMarketActivating(marketId, {
        title: market.title,
        interestedUsers: market.interested_users || 0,
        threshold: 5
      });
    } catch (error) {
      console.error('WebSocket 广播失败:', error);
    }
    
    // 3. 连接区块链
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('PLATFORM_WALLET_PRIVATE_KEY 未配置');
    }
    
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com'
    );
    
    const platformWallet = new ethers.Wallet(privateKey, provider);
    console.log(`💰 平台账户: ${platformWallet.address}`);
    
    // 4. 检查 USDC 余额
    const usdc = new ethers.Contract(
      CONTRACTS.mockUSDC,
      USDC_ABI,
      platformWallet
    );
    
    const balance = await usdc.balanceOf(platformWallet.address);
    const rewardAmount = ethers.utils.parseUnits(market.reward_amount?.toString() || '10', 6);
    
    console.log(`💵 USDC 余额: ${ethers.utils.formatUnits(balance, 6)}`);
    console.log(`💵 所需奖励: ${ethers.utils.formatUnits(rewardAmount, 6)}`);
    
    if (balance.lt(rewardAmount)) {
      throw new Error('USDC 余额不足');
    }
    
    // 5. Approve USDC
    console.log('📝 Approving USDC...');
    const approveTx = await usdc.approve(CONTRACTS.adapter, rewardAmount, {
      gasLimit: 100000
    });
    await approveTx.wait();
    console.log('✅ USDC approved');
    
    // 6. 调用 initialize 创建市场
    const adapter = new ethers.Contract(
      CONTRACTS.adapter,
      ADAPTER_ABI,
      platformWallet
    );
    
    const questionId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(market.question_id)
    );
    
    console.log('📝 Creating market on-chain...');
    const tx = await adapter.initialize(
      questionId,
      market.title,
      market.description || '',
      2, // YES/NO
      CONTRACTS.mockUSDC,
      rewardAmount,
      0, // customLiveness
      {
        gasLimit: 1200000
      }
    );
    
    console.log(`⏳ 交易发送: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ 交易确认，区块: ${receipt.blockNumber}`);
    
    // 7. 解析 conditionId
    let conditionId = '';
    
    // 尝试从事件中获取
    if (receipt.events && receipt.events.length > 0) {
      const event = receipt.events.find((e: any) => e.event === 'MarketInitialized');
      if (event && event.args) {
        conditionId = event.args.conditionId;
      }
    }
    
    // 如果没有从事件获取到，计算 conditionId
    if (!conditionId) {
      conditionId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes32', 'uint256'],
          [CONTRACTS.adapter, questionId, 2]
        )
      );
    }
    
    console.log(`📊 Condition ID: ${conditionId}`);
    
    // 8. 更新数据库
    await db.query(
      `UPDATE markets 
       SET blockchain_status = $1,
           status = $2,
           condition_id = $3,
           activated_at = NOW(),
           adapter_address = $4,
           ctf_address = $5
       WHERE id = $6`,
      ['created', 'active', conditionId, CONTRACTS.adapter, CONTRACTS.ctf, marketId]
    );
    
    console.log('✅ 市场激活成功！');
    
    // 9. 广播激活成功事件（WebSocket）
    try {
      const { broadcastMarketActivated } = await import('@/lib/websocket/market-events');
      broadcastMarketActivated(marketId, {
        title: market.title,
        conditionId,
        txHash: tx.hash
      });
    } catch (error) {
      console.error('WebSocket 广播失败:', error);
    }
    
    // 10. 通知感兴趣的用户（可选）
    await notifyInterestedUsers(marketId);
    
    return {
      success: true,
      conditionId,
      txHash: tx.hash
    };
    
  } catch (error: any) {
    console.error(`❌ 激活失败:`, error.message);
    
    // 更新状态为 failed
    await db.query(
      `UPDATE markets SET blockchain_status = $1 WHERE id = $2`,
      ['failed', marketId]
    );
    
    // 广播激活失败事件（WebSocket）
    try {
      const { broadcastActivationFailed } = await import('@/lib/websocket/market-events');
      broadcastActivationFailed(marketId, error.message);
    } catch (wsError) {
      console.error('WebSocket 广播失败:', wsError);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量激活市场
 */
export async function activateBatchMarkets(marketIds: number[]): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{ marketId: number; success: boolean; error?: string }>;
}> {
  console.log(`\n📦 批量激活 ${marketIds.length} 个市场...`);
  
  const results = [];
  let succeeded = 0;
  let failed = 0;
  
  for (const marketId of marketIds) {
    const result = await activateMarketOnChain(marketId);
    
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
    
    results.push({
      marketId,
      success: result.success,
      error: result.error
    });
    
    // 等待一段时间，避免 RPC 限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n✅ 批量激活完成: ${succeeded} 成功, ${failed} 失败`);
  
  return {
    total: marketIds.length,
    succeeded,
    failed,
    results
  };
}

/**
 * 通知感兴趣的用户
 */
async function notifyInterestedUsers(marketId: number) {
  try {
    const result = await db.query(
      `SELECT user_address FROM user_interests WHERE market_id = $1`,
      [marketId]
    );
    
    console.log(`📧 通知 ${result.rows.length} 个用户市场已激活`);
    
    // TODO: 实现实际的通知逻辑（邮件/推送）
    // 这里只是记录日志
    for (const row of result.rows) {
      await db.query(
        `INSERT INTO activity_logs (user_address, action_type, market_id, details)
         VALUES ($1, $2, $3, $4)`,
        [
          row.user_address,
          'market_activated',
          marketId,
          JSON.stringify({ notified: true })
        ]
      );
    }
    
  } catch (error) {
    console.error('通知用户失败:', error);
  }
}

