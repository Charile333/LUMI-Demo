/**
 * 自动化集成 Polymarket 官方 UMA-CTF-Adapter
 * 
 * 此脚本会：
 * 1. 检查官方仓库是否已克隆
 * 2. 备份当前版本
 * 3. 创建官方版本副本
 * 4. 生成对比报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 Polymarket 官方 UMA-CTF-Adapter 集成工具\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 配置
const config = {
  officialRepoUrl: 'https://github.com/Polymarket/uma-ctf-adapter.git',
  officialRepoPath: path.join('E:', 'uma-ctf-adapter'),
  projectRoot: __dirname.replace(/\\scripts$/, ''),
  backupDir: path.join(__dirname, '..', 'contracts', 'backup'),
  officialDir: path.join(__dirname, '..', 'contracts', 'official'),
};

// 工具函数
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function execCommand(command, options = {}) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ 创建目录: ${dirPath}`);
    return true;
  }
  console.log(`   ℹ️  目录已存在: ${dirPath}`);
  return false;
}

function copyFile(source, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(source, dest);
    console.log(`   ✅ 复制: ${path.basename(source)} -> ${dest}`);
    return true;
  } catch (error) {
    console.log(`   ❌ 复制失败: ${error.message}`);
    return false;
  }
}

// 步骤 1: 检查官方仓库
async function step1_checkOfficialRepo() {
  console.log("📋 步骤 1: 检查官方仓库\n");
  
  if (fileExists(config.officialRepoPath)) {
    console.log(`   ✅ 官方仓库已存在: ${config.officialRepoPath}`);
    console.log("   ℹ️  更新仓库...");
    
    const result = execCommand(`cd ${config.officialRepoPath} && git pull`, { silent: true });
    
    if (result.success) {
      console.log("   ✅ 仓库更新成功");
    } else {
      console.log("   ⚠️  更新失败，将使用现有版本");
    }
  } else {
    console.log(`   ❌ 官方仓库未找到: ${config.officialRepoPath}`);
    console.log("\n   请先克隆官方仓库:");
    console.log(`   cd E:\\`);
    console.log(`   git clone ${config.officialRepoUrl}`);
    console.log("");
    return false;
  }
  
  console.log("");
  return true;
}

// 步骤 2: 备份当前版本
function step2_backupCurrent() {
  console.log("📋 步骤 2: 备份当前版本\n");
  
  createDirectory(config.backupDir);
  
  const currentAdapter = path.join(config.projectRoot, 'contracts', 'UmaCTFAdapter.sol');
  
  if (fileExists(currentAdapter)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = path.join(config.backupDir, `UmaCTFAdapter.simple.${timestamp}.sol`);
    
    copyFile(currentAdapter, backupPath);
    console.log(`   ✅ 当前版本已备份到: ${backupPath}`);
  } else {
    console.log("   ⚠️  当前合约不存在，跳过备份");
  }
  
  console.log("");
  return true;
}

// 步骤 3: 创建官方版本副本
function step3_copyOfficialVersion() {
  console.log("📋 步骤 3: 创建官方版本副本\n");
  
  createDirectory(config.officialDir);
  
  // 复制主合约
  const officialAdapter = path.join(config.officialRepoPath, 'contracts', 'UmaCTFAdapter.sol');
  const destAdapter = path.join(config.officialDir, 'UmaCTFAdapter.sol');
  
  if (fileExists(officialAdapter)) {
    copyFile(officialAdapter, destAdapter);
  } else {
    console.log("   ❌ 官方合约未找到");
    return false;
  }
  
  // 复制接口文件
  const interfacesDir = path.join(config.officialRepoPath, 'contracts', 'interfaces');
  if (fileExists(interfacesDir)) {
    const destInterfacesDir = path.join(config.officialDir, 'interfaces');
    createDirectory(destInterfacesDir);
    
    try {
      const files = fs.readdirSync(interfacesDir);
      files.forEach(file => {
        if (file.endsWith('.sol')) {
          const source = path.join(interfacesDir, file);
          const dest = path.join(destInterfacesDir, file);
          copyFile(source, dest);
        }
      });
    } catch (error) {
      console.log(`   ⚠️  复制接口文件失败: ${error.message}`);
    }
  }
  
  console.log("");
  return true;
}

// 步骤 4: 生成对比报告
function step4_generateComparison() {
  console.log("📋 步骤 4: 生成对比报告\n");
  
  const currentAdapter = path.join(config.projectRoot, 'contracts', 'UmaCTFAdapter.sol');
  const officialAdapter = path.join(config.officialDir, 'UmaCTFAdapter.sol');
  
  if (!fileExists(currentAdapter) || !fileExists(officialAdapter)) {
    console.log("   ⚠️  无法生成对比报告，文件不存在");
    console.log("");
    return false;
  }
  
  const currentCode = fs.readFileSync(currentAdapter, 'utf8');
  const officialCode = fs.readFileSync(officialAdapter, 'utf8');
  
  const currentLines = currentCode.split('\n').length;
  const officialLines = officialCode.split('\n').length;
  
  const report = `
# UMA-CTF-Adapter 对比报告

生成时间: ${new Date().toLocaleString()}

## 代码统计

| 项目 | 简化版（当前） | 官方版 |
|------|--------------|--------|
| 代码行数 | ${currentLines} | ${officialLines} |
| 文件位置 | contracts/UmaCTFAdapter.sol | contracts/official/UmaCTFAdapter.sol |
| 注释语言 | 中文 | 英文 |

## 功能对比

### 简化版特点
- ✅ 核心功能完整
- ✅ 中文注释，易于理解
- ✅ 适合学习和快速原型
- ✅ 已在测试网验证

### 官方版特点
- ✅ 生产级代码质量
- ✅ 完整的安全检查
- ✅ 经过审计
- ✅ 支持更多高级功能

## 建议

### 当前阶段（开发和测试）
建议继续使用简化版：
- 功能已验证
- 前端已集成
- 文档完善

### 主网部署前
建议升级到官方版：
- 进行安全审计
- 完整功能测试
- 生产环境部署

## 下一步

1. 在 VSCode 中对比两个文件:
   \`\`\`bash
   code contracts/UmaCTFAdapter.sol
   code contracts/official/UmaCTFAdapter.sol
   \`\`\`

2. 创建测试脚本，测试官方版本

3. 根据需求决定是否迁移

## 文件位置

- 当前版本: \`contracts/UmaCTFAdapter.sol\`
- 官方版本: \`contracts/official/UmaCTFAdapter.sol\`
- 备份: \`contracts/backup/\`
- 官方仓库: \`${config.officialRepoPath}\`
`;
  
  const reportPath = path.join(config.projectRoot, 'ADAPTER_COMPARISON.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`   ✅ 对比报告已生成: ${reportPath}`);
  console.log("");
  
  // 打印摘要
  console.log("   📊 代码行数对比:");
  console.log(`      简化版: ${currentLines} 行`);
  console.log(`      官方版: ${officialLines} 行`);
  console.log(`      差异: ${officialLines - currentLines} 行`);
  
  console.log("");
  return true;
}

// 步骤 5: 提供下一步建议
function step5_nextSteps() {
  console.log("📋 步骤 5: 下一步操作建议\n");
  
  console.log("   ✅ 集成准备完成！");
  console.log("");
  console.log("   📚 您现在可以:");
  console.log("");
  console.log("   1️⃣  对比两个版本的代码:");
  console.log("      code contracts/UmaCTFAdapter.sol");
  console.log("      code contracts/official/UmaCTFAdapter.sol");
  console.log("");
  console.log("   2️⃣  查看详细对比报告:");
  console.log("      code ADAPTER_COMPARISON.md");
  console.log("");
  console.log("   3️⃣  测试官方版本:");
  console.log("      npx hardhat compile");
  console.log("      # 创建测试脚本测试官方版本");
  console.log("");
  console.log("   4️⃣  决定迁移策略:");
  console.log("      - 选项A: 继续使用简化版（推荐当前阶段）");
  console.log("      - 选项B: 迁移到官方版（主网部署前）");
  console.log("      - 选项C: 两者并存，逐步迁移");
  console.log("");
  console.log("   📖 更多信息:");
  console.log("      code INTEGRATE_OFFICIAL_UMA_ADAPTER.md");
  console.log("");
}

// 主函数
async function main() {
  try {
    // 执行所有步骤
    const step1 = await step1_checkOfficialRepo();
    if (!step1) {
      console.log("❌ 集成中止：请先克隆官方仓库\n");
      return;
    }
    
    const step2 = step2_backupCurrent();
    const step3 = step3_copyOfficialVersion();
    if (!step3) {
      console.log("❌ 集成失败：无法复制官方版本\n");
      return;
    }
    
    step4_generateComparison();
    step5_nextSteps();
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("✅ 集成准备完成！");
    console.log("");
    
  } catch (error) {
    console.error("\n❌ 发生错误:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

