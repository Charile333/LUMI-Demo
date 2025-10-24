/**
 * Polymarket CLOB (Central Limit Order Book) API 客户端
 * 
 * 基于 Polymarket 的链下订单簿架构
 * - 订单在链下提交和匹配
 * - 链上仅处理最终结算
 */

import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';

// =============================================================
//                          类型定义
// =============================================================

export enum OrderSide {
  BUY = 0,
  SELL = 1
}

export enum OrderStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Order {
  salt: string;
  maker: string;
  signer: string;
  taker: string;            // 0x0000... 表示任何人都可以接受
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: number;
  nonce: number;
  feeRateBps: number;       // 手续费率（基点，1% = 100）
  side: OrderSide;
  signatureType: number;
}

export interface SignedOrder extends Order {
  signature: string;
}

export interface OrderBookLevel {
  price: string;            // 价格（0-1之间）
  size: string;             // 数量
  totalSize: string;        // 累计数量
}

export interface OrderBook {
  market: string;
  asset: string;            // Outcome Token ID
  timestamp: number;
  bids: OrderBookLevel[];   // 买单
  asks: OrderBookLevel[];   // 卖单
  spread: string;           // 买卖价差
}

export interface Trade {
  id: string;
  market: string;
  asset: string;
  side: OrderSide;
  price: string;
  size: string;
  timestamp: number;
  makerOrderId: string;
  takerOrderId: string;
}

export interface Market {
  id: string;
  question: string;
  description: string;
  outcomes: string[];       // ["YES", "NO"]
  active: boolean;
  closed: boolean;
  endDate: string;
  volume: string;
  liquidity: string;
}

// =============================================================
//                      CLOB API 客户端
// =============================================================

export class PolymarketCLOBClient {
  private api: AxiosInstance;
  private chainId: number;
  private exchangeAddress: string;

  /**
   * 创建 CLOB 客户端
   * @param baseURL CLOB API 基础 URL
   * @param chainId 链 ID
   * @param exchangeAddress CTFExchange 合约地址
   */
  constructor(
    baseURL: string = 'https://clob.polymarket.com',
    chainId: number = 137, // Polygon 主网
    exchangeAddress: string
  ) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    this.chainId = chainId;
    this.exchangeAddress = exchangeAddress;
  }

  // =============================================================
  //                      订单簿查询
  // =============================================================

  /**
   * 获取订单簿
   * @param market 市场 ID
   * @param asset Outcome Token ID
   */
  async getOrderBook(market: string, asset: string): Promise<OrderBook> {
    const response = await this.api.get(`/book`, {
      params: { market, asset }
    });
    return response.data;
  }

  /**
   * 获取市场信息
   * @param marketId 市场 ID
   */
  async getMarket(marketId: string): Promise<Market> {
    const response = await this.api.get(`/markets/${marketId}`);
    return response.data;
  }

  /**
   * 获取所有活跃市场
   */
  async getActiveMarkets(): Promise<Market[]> {
    const response = await this.api.get('/markets', {
      params: { active: true }
    });
    return response.data;
  }

  /**
   * 获取历史成交记录
   * @param market 市场 ID
   * @param asset Outcome Token ID
   * @param limit 限制数量
   */
  async getTrades(
    market: string,
    asset: string,
    limit: number = 100
  ): Promise<Trade[]> {
    const response = await this.api.get(`/trades`, {
      params: { market, asset, limit }
    });
    return response.data;
  }

  // =============================================================
  //                      订单操作
  // =============================================================

  /**
   * 提交订单
   * @param order 签名的订单
   */
  async submitOrder(order: SignedOrder): Promise<string> {
    const response = await this.api.post('/orders', order);
    return response.data.orderId;
  }

  /**
   * 批量提交订单
   * @param orders 签名的订单数组
   */
  async submitOrders(orders: SignedOrder[]): Promise<string[]> {
    const response = await this.api.post('/orders/batch', { orders });
    return response.data.orderIds;
  }

  /**
   * 取消订单
   * @param orderId 订单 ID
   */
  async cancelOrder(orderId: string): Promise<void> {
    await this.api.delete(`/orders/${orderId}`);
  }

  /**
   * 批量取消订单
   * @param orderIds 订单 ID 数组
   */
  async cancelOrders(orderIds: string[]): Promise<void> {
    await this.api.delete('/orders/batch', {
      data: { orderIds }
    });
  }

  /**
   * 获取订单状态
   * @param orderId 订单 ID
   */
  async getOrder(orderId: string): Promise<SignedOrder & { status: OrderStatus }> {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * 获取用户的所有订单
   * @param maker 用户地址
   * @param market 市场 ID（可选）
   */
  async getUserOrders(
    maker: string,
    market?: string
  ): Promise<Array<SignedOrder & { status: OrderStatus }>> {
    const response = await this.api.get('/orders', {
      params: { maker, market }
    });
    return response.data;
  }

  // =============================================================
  //                      订单创建和签名
  // =============================================================

  /**
   * 创建订单
   * @param params 订单参数
   */
  createOrder(params: {
    maker: string;
    tokenId: string;
    side: OrderSide;
    price: number;          // 价格（0-1）
    amount: string;         // 数量
    expiration?: number;    // 过期时间戳（默认 24 小时）
    feeRateBps?: number;    // 手续费率（默认 100 = 1%）
  }): Order {
    const {
      maker,
      tokenId,
      side,
      price,
      amount,
      expiration = Math.floor(Date.now() / 1000) + 86400, // 24小时后
      feeRateBps = 100 // 1%
    } = params;

    // 计算 makerAmount 和 takerAmount
    let makerAmount: string;
    let takerAmount: string;

    if (side === OrderSide.BUY) {
      // 买入：用 collateral 购买 outcome token
      // makerAmount = 需要支付的 collateral
      // takerAmount = 获得的 outcome token
      makerAmount = ethers.utils.parseUnits(
        (parseFloat(amount) * price).toFixed(6),
        6 // USDC decimals
      ).toString();
      takerAmount = ethers.utils.parseEther(amount).toString();
    } else {
      // 卖出：卖出 outcome token 获得 collateral
      // makerAmount = 卖出的 outcome token
      // takerAmount = 获得的 collateral
      makerAmount = ethers.utils.parseEther(amount).toString();
      takerAmount = ethers.utils.parseUnits(
        (parseFloat(amount) * price).toFixed(6),
        6
      ).toString();
    }

    return {
      salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
      maker,
      signer: maker,
      taker: ethers.constants.AddressZero, // 任何人都可以接受
      tokenId,
      makerAmount,
      takerAmount,
      expiration,
      nonce: 0,
      feeRateBps,
      side,
      signatureType: 0 // EOA
    };
  }

  /**
   * 签名订单
   * @param order 订单
   * @param signer 签名者（wallet）
   */
  async signOrder(
    order: Order,
    signer: ethers.Signer
  ): Promise<SignedOrder> {
    // EIP-712 类型定义
    const domain = {
      name: 'CTF Exchange',
      version: '1.0',
      chainId: this.chainId,
      verifyingContract: this.exchangeAddress
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

    // 签名
    const signature = await signer._signTypedData(domain, types, order);

    return {
      ...order,
      signature
    };
  }

  /**
   * 创建并签名订单（便捷方法）
   */
  async createAndSignOrder(
    params: {
      maker: string;
      tokenId: string;
      side: OrderSide;
      price: number;
      amount: string;
      expiration?: number;
      feeRateBps?: number;
    },
    signer: ethers.Signer
  ): Promise<SignedOrder> {
    const order = this.createOrder(params);
    return await this.signOrder(order, signer);
  }
}

// =============================================================
//                      辅助函数
// =============================================================

/**
 * 计算订单的价格
 * @param order 订单
 */
export function getOrderPrice(order: Order): number {
  const makerAmount = parseFloat(ethers.utils.formatUnits(order.makerAmount, 6));
  const takerAmount = parseFloat(ethers.utils.formatEther(order.takerAmount));

  if (order.side === OrderSide.BUY) {
    return makerAmount / takerAmount;
  } else {
    return takerAmount / makerAmount;
  }
}

/**
 * 计算订单簿的价差
 * @param orderBook 订单簿
 */
export function getSpread(orderBook: OrderBook): number {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return 0;
  }

  const bestBid = parseFloat(orderBook.bids[0].price);
  const bestAsk = parseFloat(orderBook.asks[0].price);

  return bestAsk - bestBid;
}

/**
 * 获取订单簿的中间价
 * @param orderBook 订单簿
 */
export function getMidPrice(orderBook: OrderBook): number {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return 0;
  }

  const bestBid = parseFloat(orderBook.bids[0].price);
  const bestAsk = parseFloat(orderBook.asks[0].price);

  return (bestBid + bestAsk) / 2;
}

