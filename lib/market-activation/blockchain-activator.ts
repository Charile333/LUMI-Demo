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
    // 1. 获取市场数据（增加重试次数）
    const marketResult = await db.query(
      `SELECT * FROM markets WHERE id = $1`,
      [marketId],
      2 // 重试2次
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
    
    // 2. 更新状态为 creating（增加重试）
    await db.query(
      `UPDATE markets SET blockchain_status = $1 WHERE id = $2`,
      ['creating', marketId],
      2 // 重试2次
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
    
    // 🚀 支持多个 RPC 端点作为 fallback（优先使用用户配置的 RPC）
    const userRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    
    // 如果用户配置了 RPC，优先使用；否则使用公共端点列表
    const rpcUrls = userRpcUrl 
      ? [
          userRpcUrl, // 用户配置的 RPC 放在第一位
          'https://rpc-amoy.polygon.technology',
          'https://polygon-amoy.g.alchemy.com/v2/demo',
          'https://polygon-amoy.drpc.org',
          'https://polygon-amoy-bor-rpc.publicnode.com',
          'https://rpc.ankr.com/polygon_amoy',
          'https://polygon-amoy.public.blastapi.io'
        ].filter(Boolean) as string[]
      : [
          'https://rpc-amoy.polygon.technology',
          'https://polygon-amoy.g.alchemy.com/v2/demo',
          'https://polygon-amoy.drpc.org',
          'https://polygon-amoy-bor-rpc.publicnode.com',
          'https://rpc.ankr.com/polygon_amoy',
          'https://polygon-amoy.public.blastapi.io'
        ];
    
    console.log(`🌐 用户配置的 RPC: ${userRpcUrl || '未配置'}`);
    console.log(`🌐 将尝试 ${rpcUrls.length} 个 RPC 端点（优先使用用户配置的）`);
    
    // 🚀 导入 RPC 缓存
    const { rpcCache } = await import('@/lib/cache/rpc-cache');
    
    // 如果用户配置了 RPC，直接使用，不经过缓存过滤
    let triableRPCs: string[];
    if (userRpcUrl) {
      // 用户配置了 RPC，优先使用，不经过缓存过滤
      triableRPCs = [userRpcUrl, ...rpcUrls.filter(url => url !== userRpcUrl)];
      console.log(`✅ 使用用户配置的 RPC: ${userRpcUrl}`);
    } else {
      // 没有用户配置，使用缓存过滤
      triableRPCs = rpcCache.getTriableRPCs(rpcUrls);
      
      if (triableRPCs.length === 0) {
        console.warn('⚠️ 所有 RPC 端点都暂时不可用，尝试全部端点');
        triableRPCs.push(...rpcUrls);
      }
    }
    
    console.log(`🌐 将尝试 ${triableRPCs.length} 个 RPC 端点（第一个是用户配置的）...`);
    
    let provider: ethers.providers.Provider | null = null;
    let rpcUrl = '';
    let lastError: Error | null = null;
    
    // 🔄 尝试连接每个 RPC 端点（带超时和重试）
    for (const url of triableRPCs) {
      try {
        console.log(`🌐 尝试连接 RPC: ${url}`);
        const startTime = Date.now();
        
        // 🚀 创建 Provider（使用与测试脚本相同的方式）
        // 注意：StaticJsonRpcProvider 的构造函数参数格式不同
        const testProvider = new ethers.providers.JsonRpcProvider(
          url,
          {
            name: 'polygon-amoy',
            chainId: 80002
          }
        );
        
        // 设置超时（通过覆盖 fetch 方法）
        const originalFetch = (testProvider as any).connection;
        if (originalFetch && originalFetch.fetch) {
          const originalFetchMethod = originalFetch.fetch;
          originalFetch.fetch = async (url: string, options: any) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
            
            try {
              const response = await fetch(url, {
                ...options,
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              return response;
            } catch (error: any) {
              clearTimeout(timeoutId);
              if (error.name === 'AbortError') {
                throw new Error('Connection timeout after 15s');
              }
              throw error;
            }
          };
        }
        
        // 🔄 测试连接（带超时保护）
        const blockNumberPromise = testProvider.getBlockNumber();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 15s')), 15000)
        );
        
        const blockNumber = await Promise.race([blockNumberPromise, timeoutPromise]) as number;
        const latency = Date.now() - startTime;
        
        // ✅ 连接成功
        provider = testProvider;
        rpcUrl = url;
        rpcCache.markAvailable(url, latency);
        
        console.log(`✅ RPC 连接成功: ${url}`);
        console.log(`   延迟: ${latency}ms`);
        console.log(`   当前区块: ${blockNumber}`);
        break;
        
      } catch (error: any) {
        const errorMsg = error.message || error.reason || '未知错误';
        console.warn(`⚠️ RPC ${url} 连接失败: ${errorMsg}`);
        
        // 如果是用户配置的 RPC 失败，给出更详细的提示
        if (url === userRpcUrl) {
          console.warn(`⚠️ 您配置的 Alchemy RPC 连接失败！`);
          console.warn(`   请检查：`);
          console.warn(`   1. API Key 是否正确`);
          console.warn(`   2. 网络是否能访问 alchemy.com`);
          console.warn(`   3. Alchemy App 是否选择了 Polygon Amoy 网络`);
        }
        
        // 标记为不可用（但用户配置的 RPC 不标记，因为可能是临时问题）
        if (url !== userRpcUrl) {
          rpcCache.markUnavailable(url);
        }
        lastError = error;
        
        // 短暂延迟再试下一个（避免过快连续请求）
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
    }
    
    if (!provider) {
      // 显示 RPC 缓存统计
      const stats = rpcCache.getStats();
      console.error('📊 RPC 状态统计:', {
        total: stats.total,
        available: stats.available,
        unavailable: stats.unavailable
      });
      
      throw new Error(
        `所有 RPC 端点连接失败。\n` +
        `  尝试的端点: ${triableRPCs.join(', ')}\n` +
        `  最后错误: ${lastError?.message || '未知错误'}\n` +
        `  建议: \n` +
        `    1. 检查网络连接（国内可能需要代理）\n` +
        `    2. 检查防火墙设置\n` +
        `    3. 稍后再试（RPC 服务可能暂时不可用）\n` +
        `    4. 使用自己的 RPC 端点（Alchemy/Infura）`
      );
    }
    
    console.log(`✅ Provider 已创建 (chainId: 80002, RPC: ${rpcUrl})`);
    
    const platformWallet = new ethers.Wallet(privateKey, provider);
    console.log(`💰 平台账户: ${platformWallet.address}`);
    
    // 4. 检查 USDC 余额
    const usdc = new ethers.Contract(
      CONTRACTS.mockUSDC,
      USDC_ABI,
      platformWallet
    );
    
    // 先检查合约是否存在
    let code;
    try {
      code = await provider.getCode(CONTRACTS.mockUSDC);
    } catch (codeError: any) {
      throw new Error(`无法检查 USDC 合约代码: ${codeError.message || codeError.reason}. RPC URL: ${rpcUrl}`);
    }
    
    if (code === '0x' || code === '0x0') {
      throw new Error(`USDC 合约不存在于地址 ${CONTRACTS.mockUSDC}. 请确认合约已部署到 Polygon Amoy 测试网.`);
    }
    console.log(`✅ USDC 合约已验证存在 (代码长度: ${code.length} 字符)`);
    
    // 使用 try-catch 处理 balanceOf 调用
    let balance;
    try {
      // 尝试直接调用
      balance = await usdc.balanceOf(platformWallet.address);
      console.log(`✅ 成功获取余额 (方法: balanceOf)`);
    } catch (error: any) {
      console.warn(`⚠️ balanceOf 调用失败，尝试替代方法...`, error.message || error.reason);
      
      // 如果 balanceOf 失败，尝试使用 callStatic
      try {
        balance = await usdc.callStatic.balanceOf(platformWallet.address);
        console.log(`✅ 成功获取余额 (方法: callStatic)`);
      } catch (staticError: any) {
        // 最后尝试使用 provider.call
        try {
          const iface = new ethers.utils.Interface(USDC_ABI);
          const data = iface.encodeFunctionData('balanceOf', [platformWallet.address]);
          const result = await provider.call({
            to: CONTRACTS.mockUSDC,
            data: data
          });
          balance = iface.decodeFunctionResult('balanceOf', result)[0];
          console.log(`✅ 成功获取余额 (方法: provider.call)`);
        } catch (callError: any) {
          const errorMsg = error.message || error.reason || staticError.message || staticError.reason || callError.message || '未知错误';
          throw new Error(
            `无法获取 USDC 余额。\n` +
            `  合约地址: ${CONTRACTS.mockUSDC}\n` +
            `  账户地址: ${platformWallet.address}\n` +
            `  RPC URL: ${rpcUrl}\n` +
            `  错误: ${errorMsg}\n` +
            `  建议: 1) 检查 RPC 节点是否正常 2) 确认合约地址正确 3) 尝试使用其他 RPC 端点`
          );
        }
      }
    }
    
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
    
    // 8. 更新数据库（增加重试）
    await db.query(
      `UPDATE markets 
       SET blockchain_status = $1,
           status = $2,
           condition_id = $3,
           activated_at = NOW(),
           adapter_address = $4,
           ctf_address = $5
       WHERE id = $6`,
      ['created', 'active', conditionId, CONTRACTS.adapter, CONTRACTS.conditionalTokens, marketId],
      2 // 重试2次
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
    
    // 更新状态为 failed（增加重试，确保状态更新成功）
    try {
      await db.query(
        `UPDATE markets SET blockchain_status = $1 WHERE id = $2`,
        ['failed', marketId],
        2 // 重试2次
      );
    } catch (updateError) {
      console.error('❌ 更新失败状态也失败了:', updateError);
    }
    
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
      [marketId],
      2 // 重试2次
    );
    
    console.log(`📧 通知 ${result.rows.length} 个用户市场已激活`);
    
    // TODO: 实现实际的通知逻辑（邮件/推送）
    // 这里只是记录日志
    for (const row of result.rows) {
      try {
        await db.query(
          `INSERT INTO activity_logs (user_address, action_type, market_id, details)
           VALUES ($1, $2, $3, $4)`,
          [
            row.user_address,
            'market_activated',
            marketId,
            JSON.stringify({ notified: true })
          ],
          1 // 重试1次（日志不是关键操作）
        );
      } catch (logError) {
        console.warn('记录活动日志失败:', logError);
      }
    }
    
  } catch (error) {
    console.error('通知用户失败:', error);
  }
}

