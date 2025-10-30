/**
 * 🔮 UMA 官方预言机客户端
 * 
 * 使用 UMA 官方 SDK 与 Optimistic Oracle V2 交互
 * 参考: https://github.com/UMAprotocol/protocol
 */

import { ethers } from 'ethers';

// UMA Optimistic Oracle V2 地址（Polygon Amoy）
const UMA_ORACLE_ADDRESS = '0x263351499f82C107e540B01F0Ca959843e22464a';

// UMA Optimistic Oracle V2 ABI（关键函数）
const UMA_ORACLE_ABI = [
  // 请求价格
  "function requestPrice(bytes32 identifier, uint256 timestamp, bytes memory ancillaryData, address currency, uint256 reward) external returns (uint256)",
  
  // 提案价格
  "function proposePrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData, int256 proposedPrice) external returns (uint256)",
  
  // 争议价格
  "function disputePrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external returns (uint256)",
  
  // 结算并获取价格
  "function settle(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external returns (int256)",
  
  // 获取请求状态
  "function getState(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (uint8)",
  
  // 判断价格是否已解析
  "function hasPrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (bool)",
  
  // 获取价格
  "function getPrice(address requester, bytes32 identifier, uint256 timestamp, bytes memory ancillaryData) external view returns (int256)",
  
  // 默认挑战期（liveness）
  "function defaultLiveness() external view returns (uint256)",
  
  // 获取当前时间
  "function getCurrentTime() external view returns (uint256)"
];

/**
 * 预言机请求状态
 */
export enum OracleState {
  Invalid = 0,      // 无效请求
  Requested = 1,    // 已请求
  Proposed = 2,     // 已提案
  Expired = 3,      // 已过期（可结算）
  Disputed = 4,     // 已争议
  Resolved = 5,     // 已解析
  Settled = 6       // 已结算
}

/**
 * UMA 预言机客户端
 */
export class UMAOracleClient {
  private oracle: ethers.Contract;
  private provider: ethers.providers.Provider;
  
  constructor(
    provider: ethers.providers.Provider,
    oracleAddress: string = UMA_ORACLE_ADDRESS
  ) {
    this.provider = provider;
    this.oracle = new ethers.Contract(
      oracleAddress,
      UMA_ORACLE_ABI,
      provider
    );
  }
  
  /**
   * 请求预言机价格
   */
  async requestPrice(
    identifier: string,
    timestamp: number,
    ancillaryData: string,
    currency: string,
    reward: ethers.BigNumber,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const oracleWithSigner = this.oracle.connect(signer);
    
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    return await oracleWithSigner.requestPrice(
      identifierBytes,
      timestamp,
      ancillaryBytes,
      currency,
      reward
    );
  }
  
  /**
   * 提案价格（提议结果）
   */
  async proposePrice(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string,
    proposedPrice: ethers.BigNumber,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const oracleWithSigner = this.oracle.connect(signer);
    
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    return await oracleWithSigner.proposePrice(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes,
      proposedPrice
    );
  }
  
  /**
   * 争议提案
   */
  async disputePrice(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const oracleWithSigner = this.oracle.connect(signer);
    
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    return await oracleWithSigner.disputePrice(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes
    );
  }
  
  /**
   * 结算并获取最终价格
   */
  async settle(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string,
    signer: ethers.Signer
  ): Promise<ethers.BigNumber> {
    const oracleWithSigner = this.oracle.connect(signer);
    
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    const tx = await oracleWithSigner.settle(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes
    );
    await tx.wait();
    
    // 获取结算后的价格
    return await this.getPrice(requester, identifier, timestamp, ancillaryData);
  }
  
  /**
   * 获取请求状态
   */
  async getState(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string
  ): Promise<OracleState> {
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    const state = await this.oracle.getState(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes
    );
    
    return state as OracleState;
  }
  
  /**
   * 检查价格是否已解析
   */
  async hasPrice(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string
  ): Promise<boolean> {
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    return await this.oracle.hasPrice(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes
    );
  }
  
  /**
   * 获取价格
   */
  async getPrice(
    requester: string,
    identifier: string,
    timestamp: number,
    ancillaryData: string
  ): Promise<ethers.BigNumber> {
    const identifierBytes = ethers.utils.formatBytes32String(identifier);
    const ancillaryBytes = ethers.utils.toUtf8Bytes(ancillaryData);
    
    return await this.oracle.getPrice(
      requester,
      identifierBytes,
      timestamp,
      ancillaryBytes
    );
  }
  
  /**
   * 获取默认挑战期
   */
  async getDefaultLiveness(): Promise<number> {
    const liveness = await this.oracle.defaultLiveness();
    return liveness.toNumber();
  }
  
  /**
   * 获取当前时间戳
   */
  async getCurrentTime(): Promise<number> {
    const timestamp = await this.oracle.getCurrentTime();
    return timestamp.toNumber();
  }
  
  /**
   * 监听预言机事件
   */
  onPriceRequested(
    callback: (requester: string, identifier: string, timestamp: number, ancillaryData: string) => void
  ) {
    this.oracle.on('RequestPrice', (requester, identifier, timestamp, ancillaryData, currency, reward, event) => {
      callback(requester, identifier.toString(), timestamp.toNumber(), ethers.utils.toUtf8String(ancillaryData));
    });
  }
  
  onPriceProposed(
    callback: (requester: string, proposer: string, proposedPrice: ethers.BigNumber) => void
  ) {
    this.oracle.on('ProposePrice', (requester, proposer, identifier, timestamp, ancillaryData, proposedPrice, expirationTimestamp, currency, event) => {
      callback(requester, proposer, proposedPrice);
    });
  }
  
  onPriceDisputed(
    callback: (requester: string, disputer: string) => void
  ) {
    this.oracle.on('DisputePrice', (requester, proposer, disputer, identifier, timestamp, ancillaryData, proposedPrice, event) => {
      callback(requester, disputer);
    });
  }
  
  onPriceSettled(
    callback: (requester: string, price: ethers.BigNumber) => void
  ) {
    this.oracle.on('Settle', (requester, proposer, disputer, identifier, timestamp, ancillaryData, price, payout, event) => {
      callback(requester, price);
    });
  }
}

/**
 * 辅助函数：创建 YES_OR_NO_QUERY 的 ancillaryData
 */
export function createYesNoQuery(question: string): string {
  return `q: ${question}`;
}

/**
 * 辅助函数：解析价格结果（YES/NO）
 */
export function parseYesNoResult(price: ethers.BigNumber): 'YES' | 'NO' | 'UNKNOWN' {
  const priceNum = price.toString();
  
  if (priceNum === ethers.utils.parseEther('1').toString()) {
    return 'YES';
  } else if (priceNum === '0') {
    return 'NO';
  } else {
    return 'UNKNOWN';
  }
}

