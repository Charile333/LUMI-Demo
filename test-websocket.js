// WebSocket 连接测试脚本
const WebSocket = require('ws');

console.log('🔍 测试 WebSocket 连接到 ws://localhost:3000/ws/alerts...\n');

const ws = new WebSocket('ws://localhost:3000/ws/alerts');

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功！');
  console.log('⏳ 等待消息...\n');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 收到消息:');
    console.log(JSON.stringify(message, null, 2));
    console.log('');
  } catch (e) {
    console.log('📨 收到原始消息:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket 错误:', error.message);
});

ws.on('close', () => {
  console.log('❌ WebSocket 连接已关闭');
  process.exit(0);
});

// 10秒后自动关闭
setTimeout(() => {
  console.log('\n✅ 测试完成，WebSocket 连接正常！');
  ws.close();
}, 10000);

