// WebSocket 连接测试脚本
const WebSocket = require('ws');

console.log('\n════════════════════════════════════════');
console.log('   🦢 WebSocket 连接测试');
console.log('════════════════════════════════════════\n');

const wsUrl = 'ws://localhost:3000/ws/alerts';
console.log(`📍 连接地址: ${wsUrl}`);
console.log('⏳ 正在连接...\n');

const ws = new WebSocket(wsUrl);

let receivedMessages = 0;

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功！');
  console.log('🎉 实时预警系统正常工作\n');
  console.log('📊 等待接收消息...');
  console.log('💡 提示: 运行 test-alert.js 插入测试预警\n');
});

ws.on('message', (data) => {
  receivedMessages++;
  const message = JSON.parse(data.toString());
  
  console.log('════════════════════════════════════════');
  console.log(`📨 收到消息 #${receivedMessages}`);
  console.log('════════════════════════════════════════');
  
  if (message.type === 'welcome') {
    console.log('类型: 欢迎消息');
    console.log(`内容: ${message.message}`);
  } else if (message.type === 'alert') {
    console.log('类型: 实时预警');
    console.log(`交易对: ${message.data.symbol}`);
    console.log(`消息: ${message.data.message}`);
    console.log(`严重程度: ${message.data.severity}`);
    console.log(`时间: ${message.data.timestamp}`);
    if (message.data.details) {
      console.log('详情:', JSON.stringify(message.data.details, null, 2));
    }
  } else {
    console.log('原始数据:', JSON.stringify(message, null, 2));
  }
  console.log('════════════════════════════════════════\n');
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket 错误:');
  console.error('════════════════════════════════════════');
  console.error('错误类型:', error.code || error.message);
  console.error('\n可能的原因:');
  console.error('  1. 服务器未启动 (运行 npm run dev)');
  console.error('  2. 端口 3000 被其他程序占用');
  console.error('  3. 防火墙阻止了连接');
  console.error('\n解决方案:');
  console.error('  1. cd LUMI && npm run dev');
  console.error('  2. 检查端口: Get-NetTCPConnection -LocalPort 3000');
  console.error('════════════════════════════════════════\n');
});

ws.on('close', (code, reason) => {
  console.log('\n🔌 WebSocket 已断开');
  console.log('════════════════════════════════════════');
  console.log(`断开码: ${code}`);
  console.log(`原因: ${reason || '正常关闭'}`);
  console.log(`收到消息总数: ${receivedMessages}`);
  console.log('════════════════════════════════════════\n');
  
  if (receivedMessages > 0) {
    console.log('✅ 测试成功！WebSocket 系统工作正常。\n');
  } else if (code === 1006) {
    console.log('⚠️  连接异常关闭，请检查服务器是否正在运行。\n');
  }
  
  process.exit(code === 1000 ? 0 : 1);
});

// 监听进程信号
process.on('SIGINT', () => {
  console.log('\n\n⏹️  用户中断测试');
  ws.close();
});

// 60秒后自动关闭
const timeout = setTimeout(() => {
  console.log('\n⏱️  测试时间到 (60秒)');
  console.log(`总共收到 ${receivedMessages} 条消息\n`);
  ws.close();
}, 60000);

// 清理定时器
ws.on('close', () => {
  clearTimeout(timeout);
});

console.log('💡 提示: 按 Ctrl+C 可以随时停止测试\n');


