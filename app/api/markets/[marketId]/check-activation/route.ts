// 🔍 检查市场交易量并自动激活

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';
import { ethers } from 'ethers';

// #vercel环境禁用 - 使用单例 Supabase Admin 客户端，避免多实例警告
const supabase = getSupabaseAdmin();

const ACTIVATION_THRESHOLD = 100; // $100 交易量阈值

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = parseInt(params.marketId);

    // 1. 获取市场信息
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('*')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json({
        success: false,
        error: '市场不存在'
      }, { status: 404 });
    }

    // 如果已经激活，直接返回
    if (market.blockchain_status === 'created') {
      return NextResponse.json({
        success: true,
        alreadyActivated: true,
        message: '市场已激活'
      });
    }

    // 2. 计算当前交易量（从订单表统计）
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('amount')
      .eq('market_id', marketId)
      .eq('status', 'completed');

    const tradingVolume = orders?.reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0) || 0;

    // 3. 更新市场的交易量
    await supabase
      .from('markets')
      .update({ trading_volume: tradingVolume })
      .eq('id', marketId);

    // 4. 检查是否达到激活条件
    if (tradingVolume >= ACTIVATION_THRESHOLD) {
      console.log(`🚀 市场 ${marketId} 达到激活条件，开始激活...`);
      
      // 更新状态为激活中
      await supabase
        .from('markets')
        .update({ blockchain_status: 'creating' })
        .eq('id', marketId);

      // 5. 激活市场
      try {
        // 连接区块链
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.GNOSIS_RPC_URL || 'https://rpc.gnosischain.com'
        );
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

        // CTF 合约地址
        const ctfAddress = process.env.NEXT_PUBLIC_CTF_EXCHANGE || '0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e';
        const ctfABI = [
          'function prepareCondition(address oracle, bytes32 questionId, uint256 outcomeSlotCount) external'
        ];
        const ctfContract = new ethers.Contract(ctfAddress, ctfABI, wallet);

        // 准备条件
        const oracle = process.env.NEXT_PUBLIC_UMA_OPTIMISTIC_ORACLE || '0x...';
        const questionId = ethers.utils.formatBytes32String(`market_${marketId}_${Date.now()}`);
        const outcomeSlotCount = 2; // YES/NO

        const tx = await ctfContract.prepareCondition(oracle, questionId, outcomeSlotCount);
        console.log('⏳ 等待交易确认...', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ 交易已确认');

        // 计算 condition ID
        const conditionId = ethers.utils.solidityKeccak256(
          ['address', 'bytes32', 'uint256'],
          [oracle, questionId, outcomeSlotCount]
        );

        // 更新数据库
        await supabase
          .from('markets')
          .update({
            blockchain_status: 'created',
            condition_id: conditionId,
            activated_at: new Date().toISOString()
          })
          .eq('id', marketId);

        console.log(`✅ 市场 ${marketId} 激活成功！Condition ID: ${conditionId}`);

        return NextResponse.json({
          success: true,
          activated: true,
          conditionId,
          txHash: tx.hash,
          tradingVolume,
          message: '市场已自动激活'
        });

      } catch (activationError: any) {
        console.error('❌ 激活失败:', activationError);
        
        // 恢复状态
        await supabase
          .from('markets')
          .update({ blockchain_status: 'not_created' })
          .eq('id', marketId);

        return NextResponse.json({
          success: false,
          error: '激活失败: ' + activationError.message
        }, { status: 500 });
      }
    }

    // 未达到激活条件
    return NextResponse.json({
      success: true,
      activated: false,
      tradingVolume,
      remaining: ACTIVATION_THRESHOLD - tradingVolume,
      progress: (tradingVolume / ACTIVATION_THRESHOLD) * 100,
      message: `当前交易量 $${tradingVolume.toFixed(2)}，还需 $${(ACTIVATION_THRESHOLD - tradingVolume).toFixed(2)}`
    });

  } catch (error: any) {
    console.error('检查激活失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

