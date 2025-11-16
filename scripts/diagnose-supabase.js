#!/usr/bin/env node

/**
 * 🔍 Supabase 连接诊断工具
 * 检测 Supabase 配置和连接状态
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 测试 Supabase REST API 连接
 */
async function testSupabaseREST(url, key) {
  return new Promise((resolve) => {
    const apiUrl = `${url}/rest/v1/`;
    
    https.get(apiUrl, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200 || res.statusCode === 404,
          statusCode: res.statusCode,
          message: res.statusCode === 200 ? 'REST API 可访问' : 'REST API 响应'
        });
      });
    }).on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    }).on('timeout', () => {
      resolve({
        success: false,
        error: 'Connection timeout (10s)'
      });
    });
  });
}

/**
 * 测试基础连通性
 */
async function testBasicConnectivity(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve({
        success: true,
        statusCode: res.statusCode
      });
    }).on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    }).on('timeout', () => {
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

/**
 * 主诊断函数
 */
async function diagnose() {
  log('\n🔍 Supabase 连接诊断工具', 'cyan');
  log('=' + '='.repeat(59), 'cyan');
  
  // 1. 检查环境变量
  log('\n1️⃣ 检查环境变量配置', 'yellow');
  log('-'.repeat(60), 'blue');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl, required: true },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseKey, required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: serviceRoleKey, required: false },
    { name: 'DATABASE_URL', value: databaseUrl, required: false },
  ];
  
  let allConfigured = true;
  
  for (const check of checks) {
    if (check.value) {
      const displayValue = check.value.length > 30 
        ? check.value.substring(0, 30) + '...'
        : check.value;
      log(`✅ ${check.name}: ${displayValue}`, 'green');
    } else {
      if (check.required) {
        log(`❌ ${check.name}: 未配置`, 'red');
        allConfigured = false;
      } else {
        log(`⚠️ ${check.name}: 未配置（可选）`, 'yellow');
      }
    }
  }
  
  if (!allConfigured) {
    log('\n❌ 必需的环境变量未配置！', 'red');
    log('\n请在 .env.local 中配置：', 'yellow');
    log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co', 'blue');
    log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key', 'blue');
    log('\n获取方式: https://supabase.com → 项目设置 → API', 'cyan');
    return;
  }
  
  // 2. 测试基础连通性
  log('\n2️⃣ 测试 Supabase 服务器连通性', 'yellow');
  log('-'.repeat(60), 'blue');
  
  const basicTest = await testBasicConnectivity(supabaseUrl);
  
  if (basicTest.success) {
    log(`✅ Supabase 服务器可访问 (HTTP ${basicTest.statusCode})`, 'green');
  } else {
    log(`❌ 无法连接到 Supabase 服务器: ${basicTest.error}`, 'red');
    log('\n可能原因:', 'yellow');
    log('  - 网络连接问题', 'yellow');
    log('  - 防火墙阻止', 'yellow');
    log('  - Supabase URL 配置错误', 'yellow');
    log('  - Supabase 项目已暂停/删除', 'yellow');
    return;
  }
  
  // 3. 测试 REST API
  log('\n3️⃣ 测试 Supabase REST API', 'yellow');
  log('-'.repeat(60), 'blue');
  
  const restTest = await testSupabaseREST(supabaseUrl, supabaseKey);
  
  if (restTest.success) {
    log(`✅ REST API 连接成功 (HTTP ${restTest.statusCode})`, 'green');
    log(`   ${restTest.message}`, 'green');
  } else {
    log(`❌ REST API 连接失败: ${restTest.error}`, 'red');
    log('\n可能原因:', 'yellow');
    log('  - API Key 错误', 'yellow');
    log('  - 项目已暂停', 'yellow');
    log('  - RLS 策略阻止', 'yellow');
  }
  
  // 4. 测试实际数据查询
  log('\n4️⃣ 测试数据查询', 'yellow');
  log('-'.repeat(60), 'blue');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    
    // 测试查询 markets 表
    const { data, error } = await supabase
      .from('markets')
      .select('id, title')
      .limit(1);
    
    if (error) {
      log(`❌ 查询失败: ${error.message}`, 'red');
      log(`   详情: ${error.details || error.hint || '无'}`, 'yellow');
      
      if (error.code === 'PGRST301') {
        log('\n💡 可能原因: RLS 策略阻止匿名访问', 'cyan');
        log('   解决: 在 Supabase 控制台关闭 RLS 或添加策略', 'cyan');
      }
    } else {
      log(`✅ 查询成功`, 'green');
      log(`   返回数据: ${data ? data.length : 0} 条`, 'green');
      if (data && data.length > 0) {
        log(`   示例: ${JSON.stringify(data[0])}`, 'blue');
      }
    }
  } catch (error) {
    log(`❌ 查询测试失败: ${error.message}`, 'red');
  }
  
  // 总结
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 诊断总结', 'cyan');
  log('='.repeat(60), 'cyan');
  
  if (allConfigured && basicTest.success && restTest.success) {
    log('\n✅ Supabase 配置正确且连接正常！', 'green');
    log('\n如果应用中仍有错误，可能是:', 'yellow');
    log('  1. 表结构不存在 - 运行数据库迁移', 'yellow');
    log('  2. RLS 策略问题 - 检查访问权限', 'yellow');
    log('  3. 临时网络波动 - 重试即可', 'yellow');
  } else {
    log('\n⚠️ 发现问题，请根据上述建议修复', 'yellow');
  }
  
  log('\n');
}

// 运行诊断
diagnose().catch(error => {
  log(`\n❌ 诊断过程出错: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});









