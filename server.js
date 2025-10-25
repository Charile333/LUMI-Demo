// WebSocket 服务器 - 实时价格推送 + 预警系统
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 存储所有 WebSocket 连接
const marketConnections = new Map(); // marketId -> Set of ws clients
const alertConnections = new Set(); // 预警系统连接

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // 处理预警 API 请求
      if (req.url.startsWith('/api/alerts')) {
        handleAlertsAPI(req, res);
        return;
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 创建订单簿 WebSocket 服务器
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/orderbook'
  });
  
  // 创建预警 WebSocket 服务器
  const alertWss = new WebSocketServer({
    server,
    path: '/ws/alerts'
  });

  wss.on('connection', (ws, req) => {
    console.log('📡 WebSocket 客户端已连接');

    let subscribedMarketIds = new Set(); // 支持订阅多个市场

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe' && data.marketId) {
          // 订阅单个市场
          const marketId = data.marketId;
          subscribedMarketIds.add(marketId);
          
          if (!marketConnections.has(marketId)) {
            marketConnections.set(marketId, new Set());
          }
          marketConnections.get(marketId).add(ws);
          
          console.log(`📊 客户端订阅市场: ${marketId}, 当前订阅数: ${marketConnections.get(marketId).size}`);
          
          // 发送确认
          ws.send(JSON.stringify({
            type: 'subscribed',
            marketId: marketId
          }));
        } else if (data.type === 'subscribe_multiple' && Array.isArray(data.marketIds)) {
          // 🔥 批量订阅多个市场
          data.marketIds.forEach(marketId => {
            subscribedMarketIds.add(marketId);
            
            if (!marketConnections.has(marketId)) {
              marketConnections.set(marketId, new Set());
            }
            marketConnections.get(marketId).add(ws);
          });
          
          console.log(`📊 客户端批量订阅 ${data.marketIds.length} 个市场:`, data.marketIds);
          
          // 发送确认
          ws.send(JSON.stringify({
            type: 'subscribed_multiple',
            marketIds: data.marketIds,
            count: data.marketIds.length
          }));
        } else if (data.type === 'unsubscribe') {
          // 取消所有订阅
          subscribedMarketIds.forEach(marketId => {
            if (marketConnections.has(marketId)) {
              marketConnections.get(marketId).delete(ws);
              console.log(`📊 客户端取消订阅市场: ${marketId}`);
            }
          });
          subscribedMarketIds.clear();
        }
      } catch (error) {
        console.error('❌ 处理消息失败:', error);
      }
    });

    ws.on('close', () => {
      // 清理所有订阅的连接
      subscribedMarketIds.forEach(marketId => {
        if (marketConnections.has(marketId)) {
          marketConnections.get(marketId).delete(ws);
          console.log(`📊 客户端断开，市场 ${marketId}, 剩余订阅数: ${marketConnections.get(marketId).size}`);
          
          // 如果没有订阅者了，删除市场
          if (marketConnections.get(marketId).size === 0) {
            marketConnections.delete(marketId);
          }
        }
      });
      console.log('📡 WebSocket 客户端已断开');
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket 错误:', error);
    });

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'connected',
      message: '已连接到实时价格服务'
    }));
  });

  // 全局广播函数 - 暴露给其他模块使用
  global.broadcastOrderBookUpdate = (marketId, orderBookData) => {
    if (!marketConnections.has(marketId)) {
      return; // 没有订阅者
    }

    const clients = marketConnections.get(marketId);
    const message = JSON.stringify({
      type: 'orderbook_update',
      marketId,
      data: orderBookData,
      timestamp: Date.now()
    });

    let successCount = 0;
    let failCount = 0;

    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          successCount++;
        } catch (error) {
          console.error('❌ 发送失败:', error);
          failCount++;
        }
      }
    });

    if (successCount > 0) {
      console.log(`📤 订单簿更新已推送到 ${successCount} 个客户端 (市场 ${marketId})`);
    }
  };

  // ========== 预警系统 WebSocket ==========
  alertWss.on('connection', (ws) => {
    console.log('🦢 预警客户端已连接');
    alertConnections.add(ws);
    
    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'welcome',
      message: '已连接到黑天鹅预警系统'
    }));
    
    ws.on('close', () => {
      console.log('🦢 预警客户端已断开');
      alertConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('❌ 预警 WebSocket 错误:', error);
      alertConnections.delete(ws);
    });
  });
  
  // 预警广播函数
  global.broadcastAlert = (alert) => {
    const alertData = JSON.stringify({
      type: 'alert',
      data: alert
    });
    
    let successCount = 0;
    alertConnections.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(alertData);
          successCount++;
        } catch (error) {
          console.error('❌ 发送预警失败:', error);
        }
      }
    });
    
    if (successCount > 0) {
      console.log(`🦢 预警已推送到 ${successCount} 个客户端`);
    }
  };
  
  // ========== 预警数据库监控 ==========
  setupAlertsDatabaseWatcher();

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`\n════════════════════════════════════════`);
    console.log(`✅ LUMI 服务器启动成功！`);
    console.log(`════════════════════════════════════════`);
    console.log(`📍 应用地址: http://${hostname}:${port}`);
    console.log(`📊 订单簿 WebSocket: ws://${hostname}:${port}/ws/orderbook`);
    console.log(`🦢 预警系统 WebSocket: ws://${hostname}:${port}/ws/alerts`);
    console.log(`════════════════════════════════════════\n`);
  });
});

// ========== 预警 API 处理函数 ==========
function handleAlertsAPI(req, res) {
  // 尝试加载 sqlite3
  let sqlite3;
  try {
    sqlite3 = require('sqlite3');
  } catch (error) {
    console.error('⚠️  sqlite3 未安装，预警功能不可用');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: [],
      message: 'Alert system not configured' 
    }));
    return;
  }
  
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // LUMI独立数据库路径
  const dbFile = path.join(__dirname, 'database', 'alerts.db');
  
  if (req.url === '/api/alerts') {
    // 获取预警列表
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err.message);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: [] }));
        return;
      }
      
      db.all('SELECT * FROM alerts WHERE symbol IN ("BTCUSDT", "ETHUSDT") ORDER BY timestamp DESC LIMIT 20', 
        (err, rows) => {
          db.close();
          
          if (err || !rows) {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: [] }));
            return;
          }
          
          const formattedAlerts = rows.map(row => {
            let details = null;
            if (row.details) {
              try {
                details = JSON.parse(row.details);
              } catch (e) {}
            }
            
            return {
              symbol: row.symbol,
              type: row.type,
              message: row.message,
              timestamp: row.timestamp,
              details: details
            };
          });
          
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: formattedAlerts }));
        }
      );
    });
  } else if (req.url === '/api/alerts/stats') {
    // 获取统计信息
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: { total_alerts: 0, monitored_assets: 0 } }));
        return;
      }
      
      // 获取所有统计数据
      db.all('SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity', (err, severityStats) => {
        if (err) {
          db.close();
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: { total_alerts: 0, monitored_assets: 0 } }));
          return;
        }
        
        const severityCounts = {};
        let totalAlerts = 0;
        severityStats.forEach(item => {
          severityCounts[item.severity] = item.count;
          totalAlerts += item.count;
        });
        
        // 获取监控的资产数量
        db.all('SELECT DISTINCT symbol FROM alerts', (err, symbols) => {
          const monitoredAssets = symbols ? symbols.length : 0;
          
          const statsResponse = {
            total_alerts: totalAlerts,
            critical_alerts: severityCounts['critical'] || 0,
            high_alerts: severityCounts['high'] || 0,
            medium_alerts: severityCounts['medium'] || 0,
            monitored_assets: monitoredAssets,
            severity_breakdown: severityCounts
          };
          
          db.close();
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: statsResponse }));
        });
      });
    });
  } else if (req.url === '/api/alerts/real-crash-events') {
    // 返回真实的历史闪崩事件（不依赖数据库）
    // 按时间倒序排列（最新的在最上面）
    const realEvents = [
      {
        id: 'altcoins_2025-10-11',
        date: '2025-10-11',
        asset: 'ALTCOINS',
        crashPercentage: '-66.0',
        duration: '24h',
        description: '2025年10月闪崩：高杠杆与低流动性引发"系统性踩踏"，部分代币跌幅超99%',
        timestamp: '2025-10-11T02:00:00Z',
        details: {
          previous_price: 100,
          current_price: 34,
          price_change: -66.0
        }
      },
      {
        id: 'luna_2022-05-09',
        date: '2022-05-09',
        asset: 'LUNA/USDT',
        crashPercentage: '-99.99',
        duration: '72h',
        description: 'LUNA/UST崩盘：算法稳定币UST脱锚，引发"死亡螺旋"，LUNA从$119跌至<$0.0001',
        timestamp: '2022-05-09T00:00:00Z',
        details: {
          previous_price: 119,
          current_price: 0.0001,
          price_change: -99.9999
        }
      },
      {
        id: 'btc_2022-11-09',
        date: '2022-11-09',
        asset: 'BTC/USDT',
        crashPercentage: '-17.0',
        duration: '24h',
        description: 'FTX崩盘：中心化交易所因流动性挤兑破产，BTC从$20,500跌至$16,900',
        timestamp: '2022-11-09T12:00:00Z',
        details: {
          previous_price: 20500,
          current_price: 16900,
          price_change: -17.56
        }
      },
      {
        id: 'ftt_2022-11-08',
        date: '2022-11-08',
        asset: 'FTT/USDT',
        crashPercentage: '-80.0',
        duration: '48h',
        description: 'FTX Token崩盘：FTX交易所破产引发，FTT代币暴跌80%',
        timestamp: '2022-11-08T12:00:00Z',
        details: {
          previous_price: 25,
          current_price: 5,
          price_change: -80.0
        }
      },
      {
        id: 'btc_2020-03-12',
        date: '2020-03-12',
        asset: 'BTC/USDT',
        crashPercentage: '-50.0',
        duration: '24h',
        description: 'COVID"黑色星期四"：全球疫情恐慌，BTC从$8,000跌至$4,850，杠杆多头大规模清算',
        timestamp: '2020-03-12T12:00:00Z',
        details: {
          previous_price: 8000,
          current_price: 4850,
          price_change: -39.4
        }
      },
      {
        id: 'btc_2017-2018',
        date: '2017-12-17',
        asset: 'BTC/USDT',
        crashPercentage: '-84.0',
        duration: '365d',
        description: '2017-2018大熊市：ICO泡沫破裂，BTC从$20,000跌至$3,200，持续一年',
        timestamp: '2017-12-17T00:00:00Z',
        details: {
          previous_price: 20000,
          current_price: 3200,
          price_change: -84.0
        }
      },
      {
        id: 'btc_2013-04-10',
        date: '2013-04-10',
        asset: 'BTC/USDT',
        crashPercentage: '-43.0',
        duration: '12h',
        description: 'Mt. Gox崩盘：交易所遭DDoS攻击导致交易冻结，BTC从$265跌至$150',
        timestamp: '2013-04-10T08:00:00Z',
        details: {
          previous_price: 265,
          current_price: 150,
          price_change: -43.4
        }
      },
      {
        id: 'btc_2011-06-19',
        date: '2011-06-19',
        asset: 'BTC/USDT',
        crashPercentage: '-99.9',
        duration: '48h',
        description: 'Mt. Gox闪崩：交易所被黑，黑客低价抛售窃取的比特币，价格跌至$0.01',
        timestamp: '2011-06-19T12:00:00Z',
        details: {
          previous_price: 17.5,
          current_price: 0.01,
          price_change: -99.94
        }
      }
    ];
    
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: realEvents }));
  } else if (req.url === '/api/alerts/crash-events') {
    // 获取历史闪崩事件（最严重的警报，按日期分组）
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: [] }));
        return;
      }
      
      // 查询严重程度为 critical 的警报，只保留大事件（跌幅>3%）
      db.all(`
        SELECT 
          symbol,
          timestamp,
          message,
          details,
          severity,
          DATE(timestamp) as event_date
        FROM alerts 
        WHERE severity = 'critical'
        ORDER BY timestamp DESC 
        LIMIT 50
      `, (err, rows) => {
        db.close();
        
        if (err || !rows) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: [] }));
          return;
        }
        
        // 处理事件数据 - 按日期去重，保留每天最大跌幅的事件
        const eventsByDate = new Map(); // 使用 Map 按日期分组
        
        rows.forEach(row => {
          let details = null;
          let priceChange = 0;
          try {
            if (row.details) {
              details = JSON.parse(row.details);
              priceChange = details.price_change || 0;
            }
          } catch (e) {}
          
          // 计算百分比
          let percentageValue = priceChange;
          if (Math.abs(priceChange) < 1) {
            percentageValue = priceChange * 100;
          }
          
          const absChange = Math.abs(percentageValue);
          
          // 只记录跌幅超过 3% 的大事件
          if (absChange < 3) return;
          
          const dateKey = `${row.symbol}_${row.event_date}`;
          
          // 如果这个日期已经有事件，比较哪个跌幅更大
          if (eventsByDate.has(dateKey)) {
            const existing = eventsByDate.get(dateKey);
            if (absChange > Math.abs(existing.percentageValue)) {
              // 当前事件更严重，替换
              eventsByDate.set(dateKey, {
                row,
                details,
                percentageValue,
                absChange
              });
            }
          } else {
            eventsByDate.set(dateKey, {
              row,
              details,
              percentageValue,
              absChange
            });
          }
        });
        
        // 转换为数组并按跌幅排序
        const events = Array.from(eventsByDate.values())
          .sort((a, b) => b.absChange - a.absChange) // 按跌幅从大到小排序
          .map((item, index) => {
            const { row, details, percentageValue } = item;
            
            // 估算持续时间
            const sameDayEvents = rows.filter(r => 
              r.symbol === row.symbol && r.event_date === row.event_date
            );
            const durationHours = Math.max(1, Math.min(sameDayEvents.length * 0.5, 8));
            const duration = `${durationHours}h`;
            
            return {
              id: `${row.symbol}_${row.event_date}_${index}`,
              date: row.event_date,
              asset: row.symbol.replace('USDT', '/USDT'),
              crashPercentage: percentageValue.toFixed(1),
              duration: duration,
              description: row.message,
              timestamp: row.timestamp,
              details: details
            };
          });
        
        // 只返回前 5 个最严重的事件
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: events.slice(0, 5) }));
      });
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}

// ========== 数据库监控函数 ==========
function setupAlertsDatabaseWatcher() {
  let sqlite3;
  try {
    sqlite3 = require('sqlite3');
  } catch (error) {
    console.log('⚠️  预警系统未配置（sqlite3 未安装）');
    return;
  }
  
  const dbFile = path.join(__dirname, 'database', 'alerts.db');
  let lastAlertId = null;
  
  const getLastAlertId = () => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) return;
      
      db.get('SELECT id FROM alerts ORDER BY id DESC LIMIT 1', (err, row) => {
        if (!err && row) {
          lastAlertId = row.id;
          console.log(`🦢 预警监控已启动，最后预警 ID: ${lastAlertId}`);
        }
        db.close();
      });
    });
  };
  
  const checkForNewAlerts = () => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) return;
      
      if (lastAlertId !== null) {
        db.all('SELECT * FROM alerts WHERE id > ? ORDER BY id ASC', [lastAlertId], (err, rows) => {
          if (!err && rows && rows.length > 0) {
            rows.forEach(row => {
              if (row.id > lastAlertId) {
                lastAlertId = row.id;
              }
              
              let details = null;
              if (row.details) {
                try {
                  details = JSON.parse(row.details);
                } catch (e) {}
              }
              
              const alert = {
                symbol: row.symbol,
                type: row.type,
                message: row.message,
                timestamp: row.timestamp,
                details: details
              };
              
              if (global.broadcastAlert) {
                global.broadcastAlert(alert);
              }
            });
          }
          db.close();
        });
      } else {
        getLastAlertId();
        db.close();
      }
    });
  };
  
  // 初始化并每2秒检查一次
  getLastAlertId();
  setInterval(checkForNewAlerts, 2000);
}

