/**
 * 🔧 批量为所有HTML页面添加 LUMI Polymarket 集成
 * 
 * 使用方法: node scripts/add-polymarket-to-all-pages.js
 */

const fs = require('fs');
const path = require('path');

// HTML页面列表
// 注意：这些HTML文件已被Next.js页面替代（app目录下），此脚本已过时
// 如需使用，请参考对应的Next.js页面实现
const HTML_PAGES = [
  // 所有HTML文件已迁移到Next.js页面，此脚本不再需要
];

// 需要添加的脚本引用
const SCRIPT_IMPORTS = `
    <!-- LUMI Polymarket 集成 -->
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
    <script src="/js/lumi-polymarket-integration.js"></script>`;

// 需要添加的初始化代码
const INIT_CODE = `
        // ==================== LUMI Polymarket 集成 ====================
        let lumi = null;
        let isWalletConnected = false;

        // 初始化 LUMI Polymarket
        async function initLUMI() {
            try {
                if (!lumi) {
                    lumi = new LUMIPolymarket();
                }
                
                if (!isWalletConnected) {
                    const result = await lumi.init();
                    isWalletConnected = true;
                    console.log('✅ LUMI Polymarket 已连接:', result.address);
                    
                    // 更新余额显示
                    const usdcBalance = await lumi.getBalance(LUMI_CONFIG.contracts.mockUSDC);
                    console.log('💰 当前余额:', usdcBalance, 'USDC');
                }
                
                return lumi;
            } catch (error) {
                console.error('❌ LUMI 初始化失败:', error);
                alert('请安装 MetaMask 并连接钱包');
                throw error;
            }
        }

        // 使用 Polymarket 系统下注
        async function placeBetWithPolymarket(title, outcome, amount) {
            try {
                console.log('🎯 使用 Polymarket 系统下注...');
                console.log('   标题:', title);
                console.log('   选择:', outcome);
                console.log('   金额:', amount, 'USDC');
                
                // 初始化 LUMI
                const lumiInstance = await initLUMI();
                
                // 创建市场
                console.log('📝 创建预测市场...');
                const marketResult = await lumiInstance.createMarket(
                    title,
                    \`预测: \${title}\`,
                    100
                );
                
                console.log('✅ 市场创建成功！QuestionID:', marketResult.questionId);
                
                // 获取市场信息
                const market = await lumiInstance.getMarket(marketResult.questionId);
                
                // 创建订单
                const tokenId = outcome === 'YES' ? 1 : 2;
                const price = outcome === 'YES' ? 0.6 : 0.4;
                
                console.log('📋 创建订单...');
                const { order, signature } = await lumiInstance.createOrder(
                    tokenId,
                    amount,
                    price,
                    'BUY'
                );
                
                // 执行交易
                console.log('💱 在 Polymarket CTF Exchange 上执行交易...');
                const tradeResult = await lumiInstance.fillOrder(order, signature);
                
                console.log('✅ 下注成功！');
                console.log('🔗 交易哈希:', tradeResult.transactionHash);
                
                alert(\`✅ 下注成功！\\n\\n交易哈希: \${tradeResult.transactionHash.slice(0, 10)}...\\n\\n点击确定查看交易详情\`);
                
                window.open(tradeResult.explorerUrl, '_blank');
                
                return {
                    success: true,
                    questionId: marketResult.questionId,
                    transactionHash: tradeResult.transactionHash
                };
                
            } catch (error) {
                console.error('❌ 下注失败:', error);
                alert('下注失败: ' + error.message);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        // 页面加载完成后初始化
        console.log('🎯 LUMI Polymarket 集成已加载');
        console.log('三大官方组件地址:');
        console.log('  1️⃣ UMA 预言机:', LUMI_CONFIG.contracts.umaOracle);
        console.log('  2️⃣ CTF Exchange:', LUMI_CONFIG.contracts.ctfExchange);
        console.log('  3️⃣ Conditional Tokens:', LUMI_CONFIG.contracts.conditionalTokens);
`;

/**
 * 为单个HTML文件添加集成
 */
function addIntegrationToFile(filePath) {
  console.log(`\n📄 处理文件: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否已经集成过
  if (content.includes('lumi-polymarket-integration.js')) {
    console.log(`✅ 已集成，跳过: ${filePath}`);
    return false;
  }

  // 1. 添加脚本引用（在 </head> 之前）
  if (content.includes('</head>')) {
    content = content.replace('</head>', `${SCRIPT_IMPORTS}\n</head>`);
    console.log('  ✓ 添加脚本引用');
  } else {
    console.log('  ⚠️  未找到 </head> 标签');
  }

  // 2. 添加初始化代码（在第一个 <script> 标签之后）
  const scriptMatch = content.match(/<script[^>]*>\s*$/m);
  if (scriptMatch) {
    const insertPos = scriptMatch.index + scriptMatch[0].length;
    content = content.slice(0, insertPos) + INIT_CODE + content.slice(insertPos);
    console.log('  ✓ 添加初始化代码');
  } else {
    console.log('  ⚠️  未找到合适的位置插入代码');
  }

  // 保存文件
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✅ 已更新: ${filePath}`);
  
  return true;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始为所有页面添加 LUMI Polymarket 集成...\n');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const page of HTML_PAGES) {
    const filePath = path.join(__dirname, '..', page);
    
    try {
      const result = addIntegrationToFile(filePath);
      if (result) {
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ 处理失败: ${page}`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 处理完成！');
  console.log(`  ✅ 成功: ${successCount} 个文件`);
  console.log(`  ⏭️  跳过: ${skipCount} 个文件`);
  console.log(`  ❌ 失败: ${errorCount} 个文件`);
  console.log(`  📝 总计: ${HTML_PAGES.length} 个文件`);
  
  console.log('\n🎉 LUMI Polymarket 集成完成！');
  console.log('\n📚 使用说明:');
  console.log('  1. 在任何页面中调用 initLUMI() 连接钱包');
  console.log('  2. 使用 placeBetWithPolymarket(title, outcome, amount) 下注');
  console.log('  3. 查看控制台获取详细日志');
  console.log('\n📖 详细文档: LUMI_POLYMARKET_集成指南.md');
}

// 运行
main();

