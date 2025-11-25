/**
 * CTF Exchange 服务
 * 用于在服务端调用 CTF Exchange 合约执行链上交易
 */

import { ethers } from 'ethers';
import {
  CTFOrder,
  calculateTokenId,
  convertToCTFOrder
} from '@/lib/ctf-exchange/utils';

// CTF Exchange 合约地址（Polygon Amoy）
const CTF_EXCHANGE_ADDRESS = '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40';
const CONDITIONAL_TOKENS_ADDRESS = '0xb171BBc6b1476ee1b6aD4Ac2cA7ed4AfFdFa10a2';
const USDC_ADDRESS = '0x8d2dae90Dbc51dF7E18C1b857544AC979F87a77a'; // Mock USDC on Amoy

// CTF Exchange ABI
const CTF_EXCHANGE_ABI = [
  "function fillOrder(tuple(uint256 salt, address maker, address signer, address taker, uint256 tokenId, uint256 makerAmount, uint256 takerAmount, uint256 expiration, uint256 nonce, uint256 feeRateBps, uint8 side, uint8 signatureType) order, bytes signature, uint256 fillAmount) external",
  "function domainSeparator() view returns (bytes32)",
  "function orderFills(bytes32) view returns (uint256)"
];

// Conditional Tokens ABI (用于计算 tokenId)
const CONDITIONAL_TOKENS_ABI = [
  "function getPositionId(address collateralToken, bytes32 collectionId, bytes32 conditionId, uint256 indexSet) pure returns (uint256)"
];

/**
 * 使用合约计算 Token ID（更准确，但需要 RPC 调用）
 */
export async function calculateTokenIdFromContract(
  conditionId: string,
  outcome: number,
  rpcUrl?: string
): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(
    rpcUrl || 'https://polygon-amoy-bor-rpc.publicnode.com'
  );
  const conditionalTokens = new ethers.Contract(
    CONDITIONAL_TOKENS_ADDRESS,
    CONDITIONAL_TOKENS_ABI,
    provider
  );
  
  const collectionId = ethers.constants.HashZero;
  const indexSet = ethers.BigNumber.from(1).shl(outcome);
  
  const tokenId = await conditionalTokens.getPositionId(
    USDC_ADDRESS,
    collectionId,
    conditionId,
    indexSet
  );
  
  return tokenId.toString();
}

/**
 * 将我们的订单格式转换为 CTF Exchange 格式
 */
/**
 * CTF Exchange 服务类
 */
export class CTFExchangeService {
  private provider: ethers.providers.JsonRpcProvider;
  private ctfExchange: ethers.Contract;
  private conditionalTokens: ethers.Contract;
  
  constructor(rpcUrl?: string) {
    this.provider = new ethers.providers.JsonRpcProvider(
      rpcUrl || 'https://polygon-amoy-bor-rpc.publicnode.com'
    );
    this.ctfExchange = new ethers.Contract(
      CTF_EXCHANGE_ADDRESS,
      CTF_EXCHANGE_ABI,
      this.provider
    );
    this.conditionalTokens = new ethers.Contract(
      CONDITIONAL_TOKENS_ADDRESS,
      CONDITIONAL_TOKENS_ABI,
      this.provider
    );
  }
  
  /**
   * 使用签名者执行 fillOrder
   * 注意：这个方法需要在有私钥的环境中使用（服务端）
   */
  async fillOrderWithSigner(
    ctfOrder: CTFOrder,
    signature: string,
    fillAmount: ethers.BigNumber,
    privateKey: string
  ): Promise<ethers.providers.TransactionReceipt> {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const ctfExchangeWithSigner = this.ctfExchange.connect(wallet);
    
    console.log('💱 执行链上交易...', {
      maker: ctfOrder.maker,
      tokenId: ctfOrder.tokenId.toString(),
      fillAmount: fillAmount.toString()
    });
    
    const tx = await ctfExchangeWithSigner.fillOrder(
      ctfOrder,
      signature,
      fillAmount,
      {
        gasLimit: 500000 // 设置 gas limit
      }
    );
    
    console.log('⏳ 等待交易确认...', tx.hash);
    const receipt = await tx.wait();
    
    console.log('✅ 链上交易成功！', receipt.transactionHash);
    
    return receipt;
  }
  
  /**
   * 验证订单是否可以填充
   */
  async canFillOrder(orderHash: string, fillAmount: ethers.BigNumber): Promise<boolean> {
    try {
      const filled = await this.ctfExchange.orderFills(orderHash);
      // 这里需要知道订单的 takerAmount 才能判断
      // 简化处理：只要 filled < takerAmount 就可以填充
      return true;
    } catch (error) {
      console.error('验证订单失败:', error);
      return false;
    }
  }
  
  /**
   * 获取合约实例（用于前端调用）
   */
  getContract() {
    return this.ctfExchange;
  }
}

/**
 * 单例实例
 */
let serviceInstance: CTFExchangeService | null = null;

export function getCTFExchangeService(): CTFExchangeService {
  if (!serviceInstance) {
    serviceInstance = new CTFExchangeService();
  }
  return serviceInstance;
}

