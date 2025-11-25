/**
 * CTF Redeem API
 * 处理用户赎回 Position Tokens 的请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { redeemPositions, checkRedeemableBalance, isMarketResolved, calculateRedeemablePayout } from '@/lib/ctf/redeem';

// 合约配置
const CONFIG = {
  conditionalTokens: '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2',
  rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com'
};

/**
 * GET - 检查可赎回余额
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const conditionId = searchParams.get('conditionId');
    const outcomeIndex = searchParams.get('outcomeIndex');

    if (!userAddress || !conditionId || outcomeIndex === null) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);

    // 检查市场是否已解析
    const resolved = await isMarketResolved(provider, conditionId);
    if (!resolved) {
      return NextResponse.json({
        redeemable: false,
        resolved: false,
        message: 'Market not resolved yet'
      });
    }

    // 检查可赎回余额
    const balanceInfo = await checkRedeemableBalance(
      provider,
      userAddress,
      conditionId,
      parseInt(outcomeIndex)
    );

    if (!balanceInfo.hasBalance) {
      return NextResponse.json({
        redeemable: false,
        resolved: true,
        balance: '0',
        message: 'No redeemable positions'
      });
    }

    // 计算预期 payout
    const payoutInfo = await calculateRedeemablePayout(
      provider,
      userAddress,
      conditionId,
      parseInt(outcomeIndex)
    );

    return NextResponse.json({
      redeemable: true,
      resolved: true,
      balance: balanceInfo.balance,
      expectedPayout: payoutInfo.payout,
      positionId: balanceInfo.positionId
    });
  } catch (error: any) {
    console.error('Error checking redeemable balance:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - 执行赎回
 * 注意：这个API需要前端签名，因为需要用户钱包签名
 * 建议：前端直接调用合约，这个API仅用于查询
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conditionId, outcomeIndex, signature } = body;

    if (!conditionId || outcomeIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 注意：实际赎回应该在前端执行，因为需要用户钱包签名
    // 这个API主要用于查询和验证
    
    return NextResponse.json({
      message: 'Redeem should be executed from frontend with user wallet',
      suggestion: 'Use redeemPositions() function from lib/ctf/redeem.ts in frontend'
    });
  } catch (error: any) {
    console.error('Error in redeem API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}




