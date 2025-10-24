/**
 * 自动化直接替换脚本
 * 用官方 UMA-CTF-Adapter 替换当前的简化版
 * 
 * ⚠️ 警告：此操作会替换现有合约文件
 * 请确保已备份或提交当前代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const config = {
  officialRepoPath: path.join('E:', 'uma-ctf-adapter'),
  projectRoot: __dirname.replace(/\\scripts$/, ''),
  backupDir: path.join(__dirname, '..', 'contracts', 'backup'),
};

// 创建readline接口用于用户确认
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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
      cwd: options.cwd,
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
  return false;
}

function copyFile(source, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(source, dest);
    return true;
  } catch (error) {
    console.log(`   ❌ 复制失败: ${error.message}`);
    return false;
  }
}

function copyDirectory(source, dest) {
  try {
    if (!fs.existsSync(source)) {
      return false;
    }
    
    createDirectory(dest);
    
    const files = fs.readdirSync(source);
    let count = 0;
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else if (file.endsWith('.sol')) {
        copyFile(sourcePath, destPath);
        count++;
      }
    });
    
    return count;
  } catch (error) {
    console.log(`   ❌ 复制目录失败: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log("🔄 直接替换为官方 UMA-CTF-Adapter\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 步骤 0: 警告和确认
  console.log("⚠️  警告：此操作将：");
  console.log("   1. 备份当前合约文件");
  console.log("   2. 用官方版本替换现有合约");
  console.log("   3. 需要重新编译和部署");
  console.log("   4. 合约地址会改变\n");
  
  const confirm1 = await question("❓ 您确定要继续吗？ (yes/no): ");
  
  if (confirm1.toLowerCase() !== 'yes') {
    console.log("\n❌ 操作已取消\n");
    rl.close();
    return;
  }
  
  // 步骤 1: 检查 Git 状态
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 1: 检查 Git 状态\n");
  
  const gitStatus = execCommand('git status --short', { silent: true, cwd: config.projectRoot });
  
  if (gitStatus.success && gitStatus.output.trim()) {
    console.log("⚠️  您有未提交的更改：");
    console.log(gitStatus.output);
    console.log("");
    
    const confirm2 = await question("❓ 建议先提交更改。继续？ (yes/no): ");
    
    if (confirm2.toLowerCase() !== 'yes') {
      console.log("\n❌ 操作已取消");
      console.log("💡 请先提交代码：");
      console.log("   git add .");
      console.log("   git commit -m \"保存简化版实现\"\n");
      rl.close();
      return;
    }
  } else {
    console.log("   ✅ Git 状态正常\n");
  }
  
  // 步骤 2: 检查官方仓库
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 2: 检查官方仓库\n");
  
  if (!fileExists(config.officialRepoPath)) {
    console.log("   ❌ 官方仓库未找到");
    console.log("\n   请先克隆官方仓库：");
    console.log("   cd E:\\");
    console.log("   git clone https://github.com/Polymarket/uma-ctf-adapter.git\n");
    rl.close();
    return;
  }
  
  console.log("   ✅ 官方仓库已存在\n");
  
  // 更新官方仓库
  console.log("   🔄 更新官方仓库...");
  const pullResult = execCommand('git pull', { 
    silent: true, 
    cwd: config.officialRepoPath 
  });
  
  if (pullResult.success) {
    console.log("   ✅ 仓库已更新\n");
  } else {
    console.log("   ⚠️  更新失败，使用现有版本\n");
  }
  
  // 步骤 3: 备份当前版本
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 3: 备份当前版本\n");
  
  createDirectory(config.backupDir);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filesToBackup = [
    'UmaCTFAdapter.sol',
    'ConditionalTokens.sol',
    'MockOptimisticOracle.sol'
  ];
  
  filesToBackup.forEach(file => {
    const source = path.join(config.projectRoot, 'contracts', file);
    const dest = path.join(config.backupDir, `${file}.${timestamp}.bak`);
    
    if (fileExists(source)) {
      if (copyFile(source, dest)) {
        console.log(`   ✅ 已备份: ${file}`);
      }
    }
  });
  
  console.log("");
  
  // 步骤 4: 复制官方合约
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 4: 复制官方合约\n");
  
  // 复制主合约
  const officialAdapter = path.join(config.officialRepoPath, 'contracts', 'UmaCTFAdapter.sol');
  const destAdapter = path.join(config.projectRoot, 'contracts', 'UmaCTFAdapter.sol');
  
  if (fileExists(officialAdapter)) {
    if (copyFile(officialAdapter, destAdapter)) {
      console.log("   ✅ 已复制: UmaCTFAdapter.sol");
    }
  } else {
    console.log("   ❌ 官方合约未找到");
    rl.close();
    return;
  }
  
  // 复制接口
  const interfacesSource = path.join(config.officialRepoPath, 'contracts', 'interfaces');
  const interfacesDest = path.join(config.projectRoot, 'contracts', 'interfaces');
  
  if (fileExists(interfacesSource)) {
    const count = copyDirectory(interfacesSource, interfacesDest);
    console.log(`   ✅ 已复制: ${count} 个接口文件`);
  }
  
  // 复制库
  const librariesSource = path.join(config.officialRepoPath, 'contracts', 'libraries');
  const librariesDest = path.join(config.projectRoot, 'contracts', 'libraries');
  
  if (fileExists(librariesSource)) {
    const count = copyDirectory(librariesSource, librariesDest);
    if (count > 0) {
      console.log(`   ✅ 已复制: ${count} 个库文件`);
    }
  }
  
  console.log("");
  
  // 步骤 5: 检查依赖
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 5: 检查依赖\n");
  
  // 读取官方 package.json
  const officialPackageJson = path.join(config.officialRepoPath, 'package.json');
  const projectPackageJson = path.join(config.projectRoot, 'package.json');
  
  if (fileExists(officialPackageJson)) {
    const officialPkg = JSON.parse(fs.readFileSync(officialPackageJson, 'utf8'));
    const projectPkg = JSON.parse(fs.readFileSync(projectPackageJson, 'utf8'));
    
    const officialDeps = { ...officialPkg.dependencies, ...officialPkg.devDependencies };
    const projectDeps = { ...projectPkg.dependencies, ...projectPkg.devDependencies };
    
    const missingDeps = [];
    
    Object.keys(officialDeps).forEach(dep => {
      if (!projectDeps[dep] && dep.includes('@openzeppelin') || dep.includes('@uma')) {
        missingDeps.push(`${dep}@${officialDeps[dep]}`);
      }
    });
    
    if (missingDeps.length > 0) {
      console.log("   ⚠️  需要安装以下依赖：");
      missingDeps.forEach(dep => console.log(`      - ${dep}`));
      console.log("");
      console.log("   运行以下命令安装：");
      console.log(`   npm install ${missingDeps.join(' ')}`);
      console.log("");
    } else {
      console.log("   ✅ 依赖检查通过\n");
    }
  }
  
  // 步骤 6: 编译测试
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋 步骤 6: 编译合约\n");
  
  console.log("   🧹 清理旧的编译产物...");
  execCommand('npx hardhat clean', { silent: true, cwd: config.projectRoot });
  
  console.log("   🔨 编译合约...\n");
  const compileResult = execCommand('npx hardhat compile', { cwd: config.projectRoot });
  
  if (!compileResult.success) {
    console.log("\n   ❌ 编译失败！");
    console.log("\n   可能的原因：");
    console.log("   1. 缺少依赖包");
    console.log("   2. Solidity 版本不匹配");
    console.log("   3. 导入路径不正确");
    console.log("\n   请查看错误信息并修复后重试\n");
    rl.close();
    return;
  }
  
  console.log("\n   ✅ 编译成功！\n");
  
  // 完成
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🎉 替换完成！\n");
  console.log("📋 接下来的步骤：\n");
  console.log("1️⃣  重新部署合约到测试网：");
  console.log("   npx hardhat run scripts/deploy-to-amoy.js --network amoy\n");
  console.log("2️⃣  更新部署配置：");
  console.log("   更新 deployments/amoy.json 中的合约地址\n");
  console.log("3️⃣  测试前端功能：");
  console.log("   npm run dev\n");
  console.log("4️⃣  验证所有功能正常\n");
  
  console.log("💾 备份文件位置：");
  console.log(`   ${config.backupDir}\n`);
  
  console.log("🔄 如需回滚：");
  console.log("   node scripts/rollback-adapter.js\n");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 发生错误:", error);
    rl.close();
    process.exit(1);
  });


