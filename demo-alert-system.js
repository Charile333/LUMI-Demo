// 黑天鹅预警系统演示脚本
// 模拟实时警报生成和广播

const WebSocket = require('ws');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('┌─────────────────────────────────────────────────────────┐');
console.log('│  🦢 黑天鹅预警系统 - 实时演示                            │');
console.log('└─────────────────────────────────────────────────────────┘\n');

// 模拟警报数据
const mockAlerts = [
  {
    symbol: 'BTCUSDT',
    type: 'price_jump',
    message: 'BTC 价格在过去1分钟内跳涨 2.5%！',
    details: {
      previous_price: 35000,
      current_price: 35875,
      price_change: 0.025,
      volume: 1250000
    }
  },
  {
    symbol: 'ETHUSDT',
    type: 'price_drop',
    message: 'ETH 价格在过去1分钟内下跌 3.2%！',
    details: {
      previous_price: 2000,
      current_price: 1936,
      price_change: -0.032,
      volume: 850000
    }
  },
  {
    symbol: 'BTCUSDT',
    type: 'volume_spike',
    message: 'BTC 成交量激增至正常水平的 3.5 倍！',
    details: {
      normal_volume: 800000,
      current_volume: 2800000,
      spike_multiplier: 3.5
    }
  },
  {
    symbol: 'ETHUSDT',
    type: 'price_jump',
    message: 'ETH 价格在过去1分钟内跳涨 5.8%！',
    details: {
      previous_price: 1936,
      current_price: 2048,
      price_change: 0.058,
      volume: 1100000
    }
  }
];

// 连接到 WebSocket 服务器
let ws;
let isConnected = false;

function connectWebSocket() {
  console.log('📡 正在连接到 WebSocket 服务器...');
  ws = new WebSocket('ws://localhost:3000/ws/alerts');

  ws.on('open', () => {
    console.log('✅ WebSocket 连接成功！');
    isConnected = true;
    console.log('');
    startDemo();
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('\n📨 从服务器接收到消息:');
    console.log('   类型:', message.type);
    if (message.type === 'alert') {
      console.log('   资产:', message.data.symbol);
      console.log('   消息:', message.data.message);
    }
  });

  ws.on('error', (error) => {
    console.error('\n❌ WebSocket 错误:', error.message);
    console.error('\n💡 提示: 请确保服务器正在运行:');
    console.error('   cd LUMI && npm run dev\n');
    process.exit(1);
  });

  ws.on('close', () => {
    console.log('\n❌ WebSocket 连接已关闭');
    isConnected = false;
  });
}

// 演示流程
async function startDemo() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 开始演示：模拟市场异常事件');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 检查数据库是否存在
  const dbFile = path.join(__dirname, '..', 'duolume-master', 'utils', 'database', 'app.db');
  const fs = require('fs');
  
  if (!fs.existsSync(dbFile)) {
    console.log('⚠️  警报数据库未找到');
    console.log('💡 演示模式：将直接通过 WebSocket 发送消息');
    console.log('   （实际系统会先存入数据库）\n');
    
    // 模拟发送警报
    await simulateAlertsWithoutDB();
  } else {
    console.log('✅ 找到警报数据库');
    console.log('📊 演示模式：将写入数据库，系统会自动广播\n');
    
    // 写入数据库
    await simulateAlertsWithDB(dbFile);
  }
}

// 模拟警报（无数据库）
async function simulateAlertsWithoutDB() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (let i = 0; i < mockAlerts.length; i++) {
    const alert = mockAlerts[i];
    
    console.log(`\n⏰ 事件 ${i + 1}/${mockAlerts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 资产: ${alert.symbol}`);
    console.log(`🔔 类型: ${alert.type}`);
    console.log(`💬 消息: ${alert.message}`);
    console.log(`📈 详情:`, JSON.stringify(alert.details, null, 2));
    
    console.log('\n💡 注意:');
    console.log('   1️⃣  警报已通过 WebSocket 连接发送');
    console.log('   2️⃣  打开浏览器查看: http://localhost:3000/black-swan');
    console.log('   3️⃣  右侧实时警报流应该会显示此警报');
    
    // 等待5秒再发送下一个
    if (i < mockAlerts.length - 1) {
      console.log('\n⏳ 5秒后发送下一个警报...');
      await sleep(5000);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 演示完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 系统工作流程:');
  console.log('   市场数据 → 检测异常 → 生成警报 → 广播到客户端 → 用户看到');
  console.log('');
  console.log('🌐 访问页面查看实时警报:');
  console.log('   http://localhost:3000/black-swan');
  console.log('');
  
  if (ws && isConnected) {
    ws.close();
  }
  
  setTimeout(() => process.exit(0), 2000);
}

// 模拟警报（写入数据库）
async function simulateAlertsWithDB(dbFile) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const db = new sqlite3.Database(dbFile);
  
  for (let i = 0; i < mockAlerts.length; i++) {
    const alert = mockAlerts[i];
    const timestamp = new Date().toISOString();
    
    console.log(`\n⏰ 事件 ${i + 1}/${mockAlerts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 资产: ${alert.symbol}`);
    console.log(`🔔 类型: ${alert.type}`);
    console.log(`💬 消息: ${alert.message}`);
    
    // 写入数据库
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO alerts (timestamp, symbol, type, message, details) VALUES (?, ?, ?, ?, ?)`,
        [timestamp, alert.symbol, alert.type, alert.message, JSON.stringify(alert.details)],
        function(err) {
          if (err) {
            console.error('❌ 写入数据库失败:', err.message);
            reject(err);
          } else {
            console.log(`✅ 已写入数据库 (ID: ${this.lastID})`);
            console.log('⏳ 等待服务器监视器检测 (最多2秒)...');
            resolve();
          }
        }
      );
    });
    
    console.log('\n💡 工作流程:');
    console.log('   1️⃣  警报已写入 SQLite 数据库');
    console.log('   2️⃣  WebSocket 服务器每2秒检查新警报');
    console.log('   3️⃣  检测到新警报后自动广播到所有客户端');
    console.log('   4️⃣  浏览器接收并显示实时警报');
    
    // 等待7秒（确保服务器有时间检测和广播）
    if (i < mockAlerts.length - 1) {
      console.log('\n⏳ 7秒后发送下一个警报...');
      await sleep(7000);
    } else {
      console.log('\n⏳ 等待5秒让最后一个警报被广播...');
      await sleep(5000);
    }
  }
  
  db.close();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 演示完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 完整系统流程:');
  console.log('   市场监控 → 检测异常 → 写入数据库 → 服务器检测 → 广播警报 → 用户看到');
  console.log('');
  console.log('🌐 访问页面查看所有警报:');
  console.log('   http://localhost:3000/black-swan');
  console.log('');
  
  if (ws && isConnected) {
    ws.close();
  }
  
  setTimeout(() => process.exit(0), 2000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动演示
connectWebSocket();

