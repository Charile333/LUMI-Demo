/**
 * 实时市场监控模块
 * 使用 Binance WebSocket API 监控加密货币价格
 * 自动检测异常波动并生成警报
 */

const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class MarketMonitor {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.prices = new Map(); // 存储最近价格
    this.connections = new Map(); // WebSocket连接
    this.thresholds = {
      price_jump: 0.02,  // 2% 涨幅阈值
      price_drop: -0.02, // 2% 跌幅阈值
    };
    this.checkInterval = 60000; // 1分钟检查一次
    this.symbols = ['BTCUSDT', 'ETHUSDT'];
  }

  // 启动监控
  start() {
    console.log('🔍 启动市场监控...');
    this.symbols.forEach(symbol => {
      this.connectSymbol(symbol);
    });
  }

  // 连接单个交易对的WebSocket
  connectSymbol(symbol) {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`✅ 已连接 ${symbol} 市场数据流`);
    });

    ws.on('message', (data) => {
      try {
        const ticker = JSON.parse(data);
        this.processTicker(symbol, ticker);
      } catch (error) {
        console.error(`解析 ${symbol} 数据失败:`, error.message);
      }
    });

    ws.on('error', (error) => {
      console.error(`${symbol} WebSocket错误:`, error.message);
    });

    ws.on('close', () => {
      console.log(`❌ ${symbol} 连接断开，5秒后重连...`);
      setTimeout(() => this.connectSymbol(symbol), 5000);
    });

    this.connections.set(symbol, ws);
  }

  // 处理ticker数据
  processTicker(symbol, ticker) {
    const currentPrice = parseFloat(ticker.c); // 当前价格
    const priceChangePercent = parseFloat(ticker.P); // 24小时价格变化百分比
    
    // 存储当前价格用于后续比较
    const priceHistory = this.prices.get(symbol) || [];
    priceHistory.push({
      price: currentPrice,
      time: Date.now(),
      change: priceChangePercent
    });
    
    // 只保留最近10个价格点
    if (priceHistory.length > 10) {
      priceHistory.shift();
    }
    this.prices.set(symbol, priceHistory);

    // 检测异常（短期内的大幅波动）
    if (priceHistory.length >= 2) {
      const previousPrice = priceHistory[priceHistory.length - 2].price;
      const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

      // 如果单次价格变化超过1%（上涨或下跌）
      if (Math.abs(changePercent) >= 1) {
        this.createAlert(symbol, currentPrice, previousPrice, changePercent);
      }
    }
  }

  // 创建警报
  createAlert(symbol, currentPrice, previousPrice, changePercent) {
    const db = new sqlite3.Database(this.dbPath);
    
    const timestamp = new Date().toISOString();
    const severity = Math.abs(changePercent) > 5 ? 'critical' : 
                     Math.abs(changePercent) > 2 ? 'high' : 'medium';
    
    const direction = changePercent > 0 ? '上涨' : '下跌';
    const message = `${symbol.replace('USDT', '/USDT')} ${direction} ${Math.abs(changePercent).toFixed(2)}%`;
    
    const details = JSON.stringify({
      price_change: changePercent / 100,
      current_price: currentPrice,
      previous_price: previousPrice,
      alert_type: 'Real-time Market Monitor',
      source: 'binance_websocket',
      timestamp: timestamp
    });

    db.run(
      `INSERT INTO alerts (timestamp, symbol, message, severity, details, type)
       VALUES (?, ?, ?, ?, ?, 'price_jump')`,
      [timestamp, symbol, message, severity, details],
      function(err) {
        if (err) {
          console.error('插入警报失败:', err.message);
        } else {
          console.log(`🚨 新警报: ${message}`);
        }
        db.close();
      }
    );
  }

  // 停止监控
  stop() {
    console.log('⏹️  停止市场监控...');
    this.connections.forEach((ws, symbol) => {
      ws.close();
      console.log(`断开 ${symbol}`);
    });
    this.connections.clear();
  }
}

module.exports = MarketMonitor;

