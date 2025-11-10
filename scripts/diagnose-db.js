// 🔍 数据库连接诊断脚本
// 用于检查 DATABASE_URL 配置和市场ID问题

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

async function diagnoseDatabaseConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 数据库连接诊断工具');
  console.log('='.repeat(60) + '\n');

  // 1. 检查 DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log(colors.red, '❌', 'DATABASE_URL 未配置');
    console.log('\n💡 解决方案：');
    console.log('   在 .env.local 中添加：');
    console.log('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n');
    return;
  }
  
  log(colors.green, '✅', 'DATABASE_URL 已配置');
  
  // 2. 解析连接字符串
  try {
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    const password = url.password;
    const port = url.port || '5432';
    const host = url.hostname;
    
    console.log('\n📋 连接信息：');
    console.log(`   主机: ${host}`);
    console.log(`   端口: ${port}`);
    console.log(`   密码长度: ${password.length} 字符`);
    
    // 检查密码是否包含特殊字符
    const specialChars = password.match(/[+@#$%^&*()]/g);
    if (specialChars) {
      log(colors.yellow, '⚠️', `密码包含特殊字符: ${specialChars.join(', ')}`);
      console.log('   💡 特殊字符需要 URL 编码：');
      console.log('      + → %2B');
      console.log('      @ → %40');
      console.log('      # → %23');
      console.log('      其他特殊字符也需要编码');
    }
    
    // 检查端口
    if (port === '6543') {
      log(colors.yellow, '⚠️', '使用端口 6543 (Transaction Pooler)');
      console.log('   💡 建议改用端口 5432 (Direct Connection) 更稳定');
    } else if (port === '5432') {
      log(colors.green, '✅', '使用端口 5432 (Direct Connection)');
    }
    
  } catch (error) {
    log(colors.red, '❌', `DATABASE_URL 格式错误: ${error.message}`);
    return;
  }
  
  // 3. 测试连接
  console.log('\n📡 测试数据库连接...\n');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000, // 5秒超时
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // 测试简单查询
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    const duration = Date.now() - startTime;
    
    log(colors.green, '✅', `数据库连接成功 (${duration}ms)`);
    console.log(`   时间: ${result.rows[0].current_time}`);
    console.log(`   版本: ${result.rows[0].version.split(',')[0]}`);
    
    // 4. 检查 markets 表
    console.log('\n📊 检查 markets 表...\n');
    
    const marketsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_markets,
        MIN(id) as min_id,
        MAX(id) as max_id,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_markets,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_markets
      FROM markets
    `);
    
    const stats = marketsResult.rows[0];
    
    log(colors.blue, '📈', `总市场数: ${stats.total_markets}`);
    log(colors.blue, '📈', `最小ID: ${stats.min_id}`);
    log(colors.blue, '📈', `最大ID: ${stats.max_id}`);
    log(colors.blue, '📈', `活跃市场: ${stats.active_markets}`);
    log(colors.blue, '📈', `草稿市场: ${stats.draft_markets}`);
    
    // 5. 检查ID序列
    if (stats.total_markets > 0 && parseInt(stats.min_id) > 1) {
      log(colors.yellow, '⚠️', `最小市场ID是 ${stats.min_id}，不是从1开始`);
      console.log('   这说明之前的市场被删除了，但序列没有重置');
      console.log('\n   💡 如果需要重置序列从1开始：');
      console.log('      1. 删除所有市场');
      console.log('      2. 运行: ALTER SEQUENCE markets_id_seq RESTART WITH 1;');
    }
    
    // 6. 列出所有市场
    if (stats.total_markets > 0) {
      console.log('\n📋 现有市场列表：\n');
      const marketsList = await pool.query(`
        SELECT id, title, status, main_category, created_at
        FROM markets
        ORDER BY id
      `);
      
      marketsList.rows.forEach(market => {
        console.log(`   [${market.id}] ${market.title}`);
        console.log(`       状态: ${market.status} | 分类: ${market.main_category}`);
        console.log(`       创建时间: ${market.created_at.toISOString()}\n`);
      });
    }
    
    // 7. 检查序列当前值
    const seqResult = await pool.query(`
      SELECT last_value FROM markets_id_seq
    `);
    
    log(colors.blue, '🔢', `下一个市场ID将是: ${parseInt(seqResult.rows[0].last_value) + 1}`);
    
    console.log('\n' + '='.repeat(60));
    log(colors.green, '✅', '诊断完成！');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    log(colors.red, '❌', '数据库连接失败');
    console.log(`\n错误信息: ${error.message}\n`);
    
    console.log('💡 可能的原因：\n');
    console.log('   1. DATABASE_URL 密码错误');
    console.log('   2. 密码中的特殊字符未 URL 编码');
    console.log('   3. Supabase 项目暂停（免费版会暂停不活跃项目）');
    console.log('   4. 网络连接问题');
    console.log('   5. 数据库防火墙限制\n');
    
    console.log('🔧 解决步骤：\n');
    console.log('   1. 访问 Supabase Dashboard: https://supabase.com/dashboard');
    console.log('   2. 检查项目是否暂停，如果暂停点击 Resume');
    console.log('   3. 进入 Settings → Database');
    console.log('   4. 复制 Connection string (URI format)');
    console.log('   5. 更新 .env.local 中的 DATABASE_URL');
    console.log('   6. 确保特殊字符已 URL 编码\n');
    
    if (error.code) {
      console.log(`错误代码: ${error.code}`);
    }
  } finally {
    await pool.end();
  }
}

// 运行诊断
diagnoseDatabaseConnection().catch(console.error);

