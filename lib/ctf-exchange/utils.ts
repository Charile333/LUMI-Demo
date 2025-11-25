import { ethers } from 'ethers';
import { CTF_CONFIG } from '@/lib/ctf/config';

export interface CTFOrder {
  salt: ethers.BigNumber;
  maker: string;
  signer: string;
  taker: string;
  tokenId: ethers.BigNumber;
  makerAmount: ethers.BigNumber;
  takerAmount: ethers.BigNumber;
  expiration: ethers.BigNumber;
  nonce: ethers.BigNumber;
  feeRateBps: ethers.BigNumber;
  side: number;
  signatureType: number;
}

export interface SerializedCTFOrder {
  salt: string;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  side: number;
  signatureType: number;
}

const ZERO_COLLECTION_ID = ethers.constants.HashZero;

/**
 * 计算 Conditional Token ID
 */
export function calculateTokenId(conditionId: string, outcome: number): string {
  const indexSet = ethers.BigNumber.from(1).shl(outcome);
  const encoded = ethers.utils.solidityPack(
    ['address', 'bytes32', 'bytes32', 'uint256'],
    [CTF_CONFIG.contracts.usdc, ZERO_COLLECTION_ID, conditionId, indexSet]
  );

  return ethers.BigNumber.from(ethers.utils.keccak256(encoded)).toString();
}

/**
 * 将内部订单结构转为 CTF Exchange 订单
 */
export function convertToCTFOrder(
  order: {
    maker: string;
    marketId: number;
    outcome: number;
    side: 'buy' | 'sell';
    price: string;
    amount: string;
    expiration: number;
    nonce: number;
    salt: string;
  },
  conditionId: string
): CTFOrder {
  const tokenId = calculateTokenId(conditionId, order.outcome);
  const amountBN = ethers.utils.parseEther(order.amount);
  const price = parseFloat(order.price);

  let makerAmount: ethers.BigNumber;
  let takerAmount: ethers.BigNumber;

  if (order.side === 'buy') {
    makerAmount = amountBN;
    takerAmount = ethers.utils.parseUnits(
      (parseFloat(order.amount) * price).toFixed(6),
      6
    );
  } else {
    makerAmount = amountBN;
    takerAmount = ethers.utils.parseUnits(
      (parseFloat(order.amount) * price).toFixed(6),
      6
    );
  }

  return {
    salt: ethers.BigNumber.from(order.salt),
    maker: order.maker,
    signer: order.maker,
    taker: ethers.constants.AddressZero,
    tokenId: ethers.BigNumber.from(tokenId),
    makerAmount,
    takerAmount,
    expiration: ethers.BigNumber.from(order.expiration),
    nonce: ethers.BigNumber.from(order.nonce),
    feeRateBps: ethers.BigNumber.from(0),
    side: order.side === 'buy' ? 0 : 1,
    signatureType: 0
  };
}

/**
 * 序列化 CTF 订单，便于存储或通过 API 传输
 */
export function serializeCTFOrder(order: CTFOrder): SerializedCTFOrder {
  return {
    salt: order.salt.toString(),
    maker: order.maker,
    signer: order.signer,
    taker: order.taker,
    tokenId: order.tokenId.toString(),
    makerAmount: order.makerAmount.toString(),
    takerAmount: order.takerAmount.toString(),
    expiration: order.expiration.toString(),
    nonce: order.nonce.toString(),
    feeRateBps: order.feeRateBps.toString(),
    side: order.side,
    signatureType: order.signatureType
  };
}





