// 🔍 数据库连接测试脚本

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('\n🔍 开始诊断数据库连接...\n');
  
  // 1. 检查环境变量
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL 未配置');
    console.log('\n💡 请在 .env.local 文件中配置 DATABASE_URL');
    console.log('格式: DATABASE_URL=postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL 已配置');
  
  // 解析 URL（隐藏密码）
  try {
    const url = new URL(dbUrl);
    console.log(`📍 主机: ${url.hostname}`);
    console.log(`🔌 端口: ${url.port || '5432'}`);
    console.log(`👤 用户: ${url.username}`);
    console.log(`🔑 密码: ${'*'.repeat(8)} (已隐藏)\n`);
    
    // 检查密码中的特殊字符
    const password = url.password;
    if (password && /[+@/]/.test(password)) {
      console.warn('⚠️  警告: 密码包含特殊字符 (+, @, /)');
      console.warn('    如果连接失败，这些字符需要 URL 编码:');
      console.warn('    + 应该编码为 %2B');
      console.warn('    @ 应该编码为 %40');
      console.warn('    / 应该编码为 %2F\n');
    }
    
    // 检查端口
    if (url.port === '6543') {
      console.warn('⚠️  警告: 使用端口 6543 (Transaction Pooler)');
      console.warn('    推荐使用端口 5432 (Direct Connection) 更稳定\n');
    }
  } catch (e) {
    console.error('❌ DATABASE_URL 格式错误:', e.message);
  }
  
  // 2. 测试连接
  console.log('🔌 正在测试连接...');
  
  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version()');
    const duration = Date.now() - start;
    
    console.log(`✅ 连接成功! (耗时: ${duration}ms)`);
    console.log(`⏰ 服务器时间: ${result.rows[0].current_time}`);
    console.log(`📦 PostgreSQL 版本: ${result.rows[0].version.split(',')[0]}\n`);
    
    // 3. 测试查询
    console.log('📊 测试查询 markets 表...');
    const marketResult = await pool.query('SELECT COUNT(*) as count FROM markets');
    console.log(`✅ markets 表查询成功, 共 ${marketResult.rows[0].count} 条记录\n`);
    
    console.log('🎉 数据库连接完全正常!\n');
    
  } catch (error) {
    console.error('\n❌ 连接失败:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.log('\n可能的原因:');
      console.log('  1. Supabase 项目暂停（免费版会自动暂停）');
      console.log('     解决: 登录 https://supabase.com/dashboard 唤醒项目');
      console.log('  2. 密码错误或包含未编码的特殊字符');
      console.log('     解决: 检查密码，特殊字符需要 URL 编码');
      console.log('  3. 网络连接问题');
      console.log('     解决: 检查网络或防火墙设置');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n可能的原因:');
      console.log('  1. DATABASE_URL 中的主机地址错误');
      console.log('  2. DNS 解析失败');
      console.log('     解决: 检查 DATABASE_URL 配置是否正确');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n可能的原因:');
      console.log('  1. 密码错误');
      console.log('  2. 密码包含特殊字符未正确编码');
      console.log('     解决: 在 Supabase Dashboard 中重置密码');
    }
  } finally {
    await pool.end();
  }
}

testConnection();













