/**
 * CTF Redeem Service
 * 实现 Position Tokens 赎回功能（提取奖励）
 * 参考 Polymarket 的实现方式
 */

import { ethers } from 'ethers';

// 合约配置
const CONFIG = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  collateralToken: '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a', // Mock USDC
  rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
  chainId: 80002,
  explorer: 'https://amoy.polygonscan.com'
};

// CTF ABI (只包含需要的函数)
const CTF_ABI = [
  "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] calldata indexSets) external",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint256 indexSet) external pure returns (bytes32)",
  "function getPositionId(address collateralToken, bytes32 collectionId) external pure returns (uint256)",
  "function isResolved(bytes32 conditionId) external view returns (bool)",
  "function payoutDenominator(bytes32 conditionId) external view returns (uint256)",
  "function payoutNumerators(bytes32 collectionId) external view returns (uint256)",
  "event PayoutRedemption(address indexed redeemer, address indexed collateralToken, bytes32 indexed parentCollectionId, bytes32 conditionId, uint256[] indexSets, uint256 payout)"
];

export interface RedeemParams {
  conditionId: string;
  outcomeIndex: number; // 0 = NO, 1 = YES
  userAddress: string;
}

export interface RedeemResult {
  success: boolean;
  transactionHash?: string;
  explorerUrl?: string;
  payout?: string; // USDC amount
  error?: string;
}

/**
 * 计算 Position ID
 */
export function calculatePositionId(
  collateralToken: string,
  conditionId: string,
  outcomeIndex: number
): string {
  // indexSet = 1 << outcomeIndex (例如：YES = 1 << 1 = 2, NO = 1 << 0 = 1)
  const indexSet = 1 << outcomeIndex;
  
  // collectionId = keccak256(conditionId, indexSet)
  const collectionId = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [conditionId, indexSet]
  );
  
  // positionId = uint256(keccak256(collateralToken, collectionId))
  const positionId = ethers.BigNumber.from(
    ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [collateralToken, collectionId]
    )
  );
  
  return positionId.toString();
}

/**
 * 检查用户是否有可赎回的 Position Tokens
 */
export async function checkRedeemableBalance(
  provider: ethers.providers.Provider,
  userAddress: string,
  conditionId: string,
  outcomeIndex: number
): Promise<{
  hasBalance: boolean;
  balance: string;
  positionId: string;
}> {
  const ctf = new ethers.Contract(
    CONFIG.conditionalTokens,
    CTF_ABI,
    provider
  );

  const positionId = calculatePositionId(
    CONFIG.collateralToken,
    conditionId,
    outcomeIndex
  );

  const balance = await ctf.balanceOf(userAddress, positionId);
  const balanceFormatted = ethers.utils.formatUnits(balance, 6); // USDC 6 decimals

  return {
    hasBalance: balance.gt(0),
    balance: balanceFormatted,
    positionId
  };
}

/**
 * 检查市场是否已解析
 */
export async function isMarketResolved(
  provider: ethers.providers.Provider,
  conditionId: string
): Promise<boolean> {
  const ctf = new ethers.Contract(
    CONFIG.conditionalTokens,
    CTF_ABI,
    provider
  );

  try {
    const resolved = await ctf.isResolved(conditionId);
    return resolved;
  } catch (error) {
    console.error('Error checking market resolution:', error);
    return false;
  }
}

/**
 * 计算可赎回的奖励金额
 */
export async function calculateRedeemablePayout(
  provider: ethers.providers.Provider,
  userAddress: string,
  conditionId: string,
  outcomeIndex: number
): Promise<{
  payout: string;
  positionBalance: string;
}> {
  const ctf = new ethers.Contract(
    CONFIG.conditionalTokens,
    CTF_ABI,
    provider
  );

  // 检查市场是否已解析
  const resolved = await isMarketResolved(provider, conditionId);
  if (!resolved) {
    return { payout: '0', positionBalance: '0' };
  }

  // 获取用户持仓
  const positionId = calculatePositionId(
    CONFIG.collateralToken,
    conditionId,
    outcomeIndex
  );
  const balance = await ctf.balanceOf(userAddress, positionId);
  
  if (balance.eq(0)) {
    return { payout: '0', positionBalance: '0' };
  }

  // 计算 collectionId
  const indexSet = 1 << outcomeIndex;
  const collectionId = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [conditionId, indexSet]
  );

  // 获取 payout numerator 和 denominator
  const payoutNumerator = await ctf.payoutNumerators(collectionId);
  const payoutDenominator = await ctf.payoutDenominator(conditionId);

  // 计算 payout = balance * payoutNumerator / payoutDenominator
  const payout = balance.mul(payoutNumerator).div(payoutDenominator);

  return {
    payout: ethers.utils.formatUnits(payout, 6), // USDC 6 decimals
    positionBalance: ethers.utils.formatUnits(balance, 6)
  };
}

/**
 * 赎回 Position Tokens（提取奖励）
 */
export async function redeemPositions(
  signer: ethers.Signer,
  conditionId: string,
  outcomeIndex: number
): Promise<RedeemResult> {
  try {
    const ctf = new ethers.Contract(
      CONFIG.conditionalTokens,
      CTF_ABI,
      signer
    );

    // 检查市场是否已解析
    const resolved = await isMarketResolved(signer.provider!, conditionId);
    if (!resolved) {
      return {
        success: false,
        error: 'Market not resolved yet'
      };
    }

    // 检查用户是否有持仓
    const userAddress = await signer.getAddress();
    const balanceCheck = await checkRedeemableBalance(
      signer.provider!,
      userAddress,
      conditionId,
      outcomeIndex
    );

    if (!balanceCheck.hasBalance) {
      return {
        success: false,
        error: 'No redeemable positions'
      };
    }

    // 准备参数
    const indexSet = 1 << outcomeIndex;
    const indexSets = [indexSet];
    const parentCollectionId = ethers.constants.HashZero; // 通常使用 0x0

    // 计算预期 payout
    const payoutInfo = await calculateRedeemablePayout(
      signer.provider!,
      userAddress,
      conditionId,
      outcomeIndex
    );

    console.log('💰 Redeeming positions...', {
      conditionId,
      outcomeIndex,
      indexSet,
      expectedPayout: payoutInfo.payout
    });

    // 执行赎回
    const tx = await ctf.redeemPositions(
      CONFIG.collateralToken,
      parentCollectionId,
      conditionId,
      indexSets,
      {
        gasLimit: 500000 // 设置 gas limit
      }
    );

    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();

    console.log('✅ Redeem successful!', {
      txHash: receipt.transactionHash,
      payout: payoutInfo.payout
    });

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      explorerUrl: `${CONFIG.explorer}/tx/${receipt.transactionHash}`,
      payout: payoutInfo.payout
    };
  } catch (error: any) {
    console.error('❌ Redeem error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * 批量赎回多个市场的奖励
 */
export async function redeemPositionsBatch(
  signer: ethers.Signer,
  markets: Array<{ conditionId: string; outcomeIndex: number }>
): Promise<RedeemResult[]> {
  const results: RedeemResult[] = [];

  for (const market of markets) {
    const result = await redeemPositions(
      signer,
      market.conditionId,
      market.outcomeIndex
    );
    results.push(result);
    
    // 如果失败，继续下一个
    if (!result.success) {
      console.warn(`Failed to redeem market ${market.conditionId}:`, result.error);
    }
  }

  return results;
}




