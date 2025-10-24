/**
 * 测试 API 是否能获取数据
 */

async function testAPI() {
  console.log('🔍 测试 API 接口...\n');
  
  try {
    const url = 'http://localhost:3001/api/markets?categoryType=sports-gaming&limit=30';
    console.log('📡 请求:', url, '\n');
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('📊 API 响应:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Success:', result.success);
    console.log('Source:', result.source);
    console.log('数据量:', result.data?.markets?.length || 0);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (result.success && result.data.markets.length > 0) {
      console.log('✅ API 正常！返回了数据：\n');
      result.data.markets.forEach((m, i) => {
        console.log(`${i + 1}. ${m.title}`);
        console.log(`   categoryType: ${m.categoryType}`);
        console.log(`   isActive: ${m.isActive}`);
        console.log(`   ID: ${m.id}\n`);
      });
      
      console.log('🎉 前端应该能显示这些数据！');
      console.log('📍 请访问：http://localhost:3001/sports-gaming\n');
      
    } else if (result.success && result.data.markets.length === 0) {
      console.log('⚠️  API 正常，但没有数据！\n');
      console.log('可能原因：');
      console.log('1. 测试数据的 categoryType 不是 "sports-gaming"');
      console.log('2. 测试数据的 isActive 不是 true');
      console.log('3. 数据被删除了\n');
      console.log('💡 解决方法：');
      console.log('在 Supabase Table Editor 中检查测试数据的这两个字段\n');
      
    } else {
      console.log('❌ API 返回错误：', result.error, '\n');
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.log('\n💡 请确认：');
    console.log('1. 开发服务器正在运行（npm run dev）');
    console.log('2. 端口 3001 没有被占用\n');
  }
}

testAPI();










