#!/usr/bin/env node

/**
 * 产品缓存测试脚本
 * 用于验证缓存系统是否正常工作
 * 
 * 使用方法：
 * node scripts/test-product-cache.js
 */

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

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

async function testAPI(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${baseUrl}${url}`, options);
  return await response.json();
}

async function runTests() {
  log('\n🚀 开始测试产品缓存系统...\n', 'cyan');
  
  try {
    // 测试 1: 清除所有缓存
    log('📋 测试 1: 清除所有缓存', 'blue');
    const clearResult = await testAPI('/api/cache/clear?type=all');
    if (clearResult.success) {
      log('✅ 缓存清除成功', 'green');
    } else {
      log('❌ 缓存清除失败', 'red');
    }
    
    // 测试 2: 检查初始缓存状态
    log('\n📋 测试 2: 检查初始缓存状态', 'blue');
    const initialStats = await testAPI('/api/cache/stats');
    if (initialStats.success) {
      log(`✅ 缓存条目数: ${initialStats.summary.totalCacheEntries}`, 'green');
      log(`   内存使用: ${initialStats.summary.totalMemoryUsageMB}`, 'green');
    }
    
    // 测试 3: 缓存预热
    log('\n📋 测试 3: 执行缓存预热', 'blue');
    const warmupResult = await testAPI('/api/cache/products/warmup', 'POST', {
      categories: ['sports-gaming', 'emerging'],
      limit: 10
    });
    if (warmupResult.success) {
      log(`✅ 预热完成: ${warmupResult.summary.totalProducts} 个产品`, 'green');
      log(`   分类数: ${warmupResult.summary.categoriesWarmed}`, 'green');
    } else {
      log('❌ 预热失败', 'red');
    }
    
    // 等待一下让缓存生效
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试 4: 检查预热后的缓存状态
    log('\n📋 测试 4: 检查预热后的缓存状态', 'blue');
    const afterWarmup = await testAPI('/api/cache/stats');
    if (afterWarmup.success) {
      log(`✅ 缓存条目数: ${afterWarmup.summary.totalCacheEntries}`, 'green');
      log(`   内存使用: ${afterWarmup.summary.totalMemoryUsageMB}`, 'green');
      log(`   总体命中率: ${afterWarmup.summary.overallHitRate}`, 'green');
    }
    
    // 测试 5: 测试产品列表 API（应该命中缓存）
    log('\n📋 测试 5: 测试产品列表 API (应该命中缓存)', 'blue');
    const startTime = Date.now();
    const marketsResult = await testAPI('/api/polymarket/markets?categoryType=sports-gaming&limit=10');
    const duration = Date.now() - startTime;
    
    if (marketsResult.success) {
      log(`✅ 获取成功: ${marketsResult.data.markets.length} 个产品`, 'green');
      log(`   响应时间: ${duration}ms`, 'green');
      log(`   是否命中缓存: ${marketsResult.cached ? '是' : '否'}`, marketsResult.cached ? 'green' : 'yellow');
    }
    
    // 测试 6: 再次请求同样的数据（应该更快）
    log('\n📋 测试 6: 再次请求相同数据 (应该更快)', 'blue');
    const startTime2 = Date.now();
    const marketsResult2 = await testAPI('/api/polymarket/markets?categoryType=sports-gaming&limit=10');
    const duration2 = Date.now() - startTime2;
    
    if (marketsResult2.success) {
      log(`✅ 获取成功: ${marketsResult2.data.markets.length} 个产品`, 'green');
      log(`   响应时间: ${duration2}ms`, 'green');
      log(`   是否命中缓存: ${marketsResult2.cached ? '是' : '否'}`, marketsResult2.cached ? 'green' : 'yellow');
      log(`   性能提升: ${((1 - duration2/duration) * 100).toFixed(1)}%`, 'cyan');
    }
    
    // 测试 7: 查看产品缓存统计
    log('\n📋 测试 7: 查看产品缓存详细统计', 'blue');
    const productStats = await testAPI('/api/cache/products/stats');
    if (productStats.success) {
      log('✅ 产品缓存统计:', 'green');
      log(`   Polymarket 缓存命中率: ${productStats.stats.polymarket.hitRate}`, 'green');
      log(`   产品列表缓存命中率: ${productStats.stats.productList.hitRate}`, 'green');
      log(`   产品详情缓存命中率: ${productStats.stats.productDetail.hitRate}`, 'green');
      log(`   总体命中率: ${productStats.summary.overallHitRate}`, 'green');
      log(`   预计节省 API 调用: ${productStats.summary.estimatedSavings}`, 'cyan');
    }
    
    // 测试 8: 清除特定分类缓存
    log('\n📋 测试 8: 清除特定分类缓存', 'blue');
    const clearCategoryResult = await testAPI('/api/cache/products/clear', 'POST', {
      type: 'category',
      category: 'sports-gaming'
    });
    if (clearCategoryResult.success) {
      log(`✅ ${clearCategoryResult.message}`, 'green');
    }
    
    // 测试总结
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 测试总结', 'cyan');
    log('='.repeat(60), 'cyan');
    
    const finalStats = await testAPI('/api/cache/stats');
    if (finalStats.success) {
      log(`\n总缓存条目: ${finalStats.summary.totalCacheEntries}`, 'yellow');
      log(`总内存使用: ${finalStats.summary.totalMemoryUsageMB}`, 'yellow');
      log(`总体命中率: ${finalStats.summary.overallHitRate}`, 'yellow');
      log(`缓存命中次数: ${finalStats.summary.cachedResponses}`, 'yellow');
      log(`预计节省 API 调用: ${finalStats.summary.estimatedApiCallsSaved} 次`, 'yellow');
      
      log('\n性能指标:', 'cyan');
      log(`  全局缓存命中率: ${finalStats.performance.global.hitRate}`, 'green');
      log(`  产品缓存命中率: ${finalStats.performance.products.hitRate}`, 'green');
      log(`  整体缓存命中率: ${finalStats.performance.overall.hitRate}`, 'green');
    }
    
    log('\n✅ 所有测试完成！', 'green');
    log('\n💡 提示：如果命中率较低，可能需要更多的请求来预热缓存\n', 'yellow');
    
  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
log('\n🔧 产品缓存测试工具', 'cyan');
log(`🌐 测试服务器: ${baseUrl}\n`, 'cyan');

runTests().catch(error => {
  log(`\n❌ 发生错误: ${error.message}`, 'red');
  process.exit(1);
});


