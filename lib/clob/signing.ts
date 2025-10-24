// 🔐 EIP-712 订单签名和验证

import { ethers } from 'ethers';

// EIP-712 Domain
export const ORDER_DOMAIN = {
  name: 'Market CLOB',
  version: '1',
  chainId: 80002, // Polygon Amoy
  verifyingContract: '0x0000000000000000000000000000000000000000'
};

// EIP-712 Types
export const ORDER_TYPES = {
  Order: [
    { name: 'orderId', type: 'string' },
    { name: 'maker', type: 'address' },
    { name: 'marketId', type: 'uint256' },
    { name: 'outcome', type: 'uint256' },
    { name: 'side', type: 'string' },
    { name: 'price', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'expiration', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'salt', type: 'string' }
  ]
};

export interface Order {
  orderId: string;
  maker: string;
  marketId: number;
  outcome: number;
  side: 'buy' | 'sell';
  price: string;
  amount: string;
  expiration: number;
  nonce: number;
  salt: string;
  signature?: string;
}

/**
 * 获取订单哈希
 */
export function getOrderHash(order: Order): string {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['string', 'address', 'uint256', 'uint256', 'string', 'string', 'string', 'uint256', 'uint256', 'string'],
      [
        order.orderId,
        order.maker,
        order.marketId,
        order.outcome,
        order.side,
        order.price,
        order.amount,
        order.expiration,
        order.nonce,
        order.salt
      ]
    )
  );
}

/**
 * 前端：生成订单签名
 */
export async function signOrder(order: Order, signer: ethers.Signer): Promise<string> {
  try {
    const signature = await signer._signTypedData(
      ORDER_DOMAIN,
      ORDER_TYPES,
      {
        orderId: order.orderId,
        maker: order.maker,
        marketId: order.marketId.toString(),
        outcome: order.outcome.toString(),
        side: order.side,
        price: order.price,
        amount: order.amount,
        expiration: order.expiration.toString(),
        nonce: order.nonce.toString(),
        salt: order.salt
      }
    );
    
    return signature;
  } catch (error) {
    console.error('签名失败:', error);
    throw error;
  }
}

/**
 * 后端：验证订单签名
 */
export function verifyOrderSignature(order: Order): boolean {
  try {
    if (!order.signature) {
      console.error('签名验证失败: 缺少签名');
      return false;
    }
    
    // 恢复签名者地址
    const recovered = ethers.utils.verifyTypedData(
      ORDER_DOMAIN,
      ORDER_TYPES,
      {
        orderId: order.orderId,
        maker: order.maker,
        marketId: order.marketId.toString(),
        outcome: order.outcome.toString(),
        side: order.side,
        price: order.price,
        amount: order.amount,
        expiration: order.expiration.toString(),
        nonce: order.nonce.toString(),
        salt: order.salt
      },
      order.signature
    );
    
    // 检查恢复的地址是否与 maker 匹配
    const isValid = recovered.toLowerCase() === order.maker.toLowerCase();
    
    if (!isValid) {
      console.error('签名验证失败: 地址不匹配');
      console.error('  Expected:', order.maker);
      console.error('  Recovered:', recovered);
    }
    
    return isValid;
    
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

/**
 * 检查订单是否过期
 */
export function isOrderExpired(order: Order): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now > order.expiration;
}

/**
 * 生成随机盐值
 */
export function generateSalt(): string {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
}

/**
 * 生成订单 ID
 */
export function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
