/**
 * CTF Exchange 订单签名工具
 * 用于生成符合 CTF Exchange 合约要求的订单签名
 */

import { ethers } from 'ethers';

// CTF Exchange 合约地址
const CTF_EXCHANGE_ADDRESS = '0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40';
const CHAIN_ID = 80002; // Polygon Amoy

/**
 * CTF Exchange 订单格式
 */
export interface CTFOrderForSigning {
  salt: string | ethers.BigNumber;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string | ethers.BigNumber;
  makerAmount: string | ethers.BigNumber;
  takerAmount: string | ethers.BigNumber;
  expiration: string | ethers.BigNumber;
  nonce: string | ethers.BigNumber;
  feeRateBps: string | ethers.BigNumber;
  side: number;
  signatureType: number;
}

/**
 * 签名 CTF Exchange 订单
 */
export async function signCTFOrder(
  order: CTFOrderForSigning,
  signer: ethers.Signer
): Promise<string> {
  // EIP-712 Domain
  const domain = {
    name: 'CTF Exchange',
    version: '1.0',
    chainId: CHAIN_ID,
    verifyingContract: CTF_EXCHANGE_ADDRESS
  };

  // EIP-712 Types
  const types = {
    Order: [
      { name: 'salt', type: 'uint256' },
      { name: 'maker', type: 'address' },
      { name: 'signer', type: 'address' },
      { name: 'taker', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'makerAmount', type: 'uint256' },
      { name: 'takerAmount', type: 'uint256' },
      { name: 'expiration', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'feeRateBps', type: 'uint256' },
      { name: 'side', type: 'uint8' },
      { name: 'signatureType', type: 'uint8' }
    ]
  };

  // 转换所有 BigNumber 为字符串
  const orderForSigning = {
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

  // 签名
  const signature = await (signer as any)._signTypedData(domain, types, orderForSigning);
  
  return signature;
}

/**
 * 验证 CTF Exchange 订单签名
 */
export function verifyCTFOrderSignature(
  order: CTFOrderForSigning,
  signature: string
): boolean {
  try {
    const domain = {
      name: 'CTF Exchange',
      version: '1.0',
      chainId: CHAIN_ID,
      verifyingContract: CTF_EXCHANGE_ADDRESS
    };

    const types = {
      Order: [
        { name: 'salt', type: 'uint256' },
        { name: 'maker', type: 'address' },
        { name: 'signer', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'makerAmount', type: 'uint256' },
        { name: 'takerAmount', type: 'uint256' },
        { name: 'expiration', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'feeRateBps', type: 'uint256' },
        { name: 'side', type: 'uint8' },
        { name: 'signatureType', type: 'uint8' }
      ]
    };

    const orderForVerifying = {
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

    const recovered = ethers.utils.verifyTypedData(
      domain,
      types,
      orderForVerifying,
      signature
    );

    return recovered.toLowerCase() === order.maker.toLowerCase();
  } catch (error) {
    console.error('验证签名失败:', error);
    return false;
  }
}

