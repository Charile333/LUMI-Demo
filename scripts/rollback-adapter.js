/**
 * 回滚脚本
 * 将官方版本回滚到简化版
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const config = {
  projectRoot: __dirname.replace(/\\scripts$/, ''),
  backupDir: path.join(__dirname, '..', 'contracts', 'backup'),
};

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function copyFile(source, dest) {
  try {
    fs.copyFileSync(source, dest);
    return true;
  } catch (error) {
    console.log(`   ❌ 恢复失败: ${error.message}`);
    return false;
  }
}

function main() {
  console.log("🔄 回滚到简化版 UMA-CTF-Adapter\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // 查找最新的备份文件
  if (!fileExists(config.backupDir)) {
    console.log("❌ 未找到备份文件");
    console.log("   备份目录不存在：", config.backupDir);
    return;
  }
  
  const backupFiles = fs.readdirSync(config.backupDir);
  const adapterBackups = backupFiles
    .filter(f => f.startsWith('UmaCTFAdapter.sol'))
    .sort()
    .reverse();
  
  if (adapterBackups.length === 0) {
    console.log("❌ 未找到 UmaCTFAdapter 的备份文件\n");
    return;
  }
  
  console.log("📋 找到以下备份：\n");
  adapterBackups.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log("");
  
  // 使用最新的备份
  const latestBackup = adapterBackups[0];
  console.log(`📝 使用最新备份: ${latestBackup}\n`);
  
  // 恢复文件
  const backupPath = path.join(config.backupDir, latestBackup);
  const destPath = path.join(config.projectRoot, 'contracts', 'UmaCTFAdapter.sol');
  
  if (copyFile(backupPath, destPath)) {
    console.log("✅ UmaCTFAdapter.sol 已恢复\n");
  } else {
    return;
  }
  
  // 删除官方版本的接口和库（可选）
  const interfacesDir = path.join(config.projectRoot, 'contracts', 'interfaces');
  const librariesDir = path.join(config.projectRoot, 'contracts', 'libraries');
  
  console.log("🧹 清理官方版本的文件...\n");
  
  if (fileExists(interfacesDir)) {
    console.log("   ⚠️  interfaces/ 目录仍然存在");
    console.log("   如需删除，请手动执行：");
    console.log(`   rmdir /S /Q "${interfacesDir}"`);
  }
  
  if (fileExists(librariesDir)) {
    console.log("   ⚠️  libraries/ 目录仍然存在");
    console.log("   如需删除，请手动执行：");
    console.log(`   rmdir /S /Q "${librariesDir}"`);
  }
  
  console.log("");
  
  // 恢复部署配置
  const simpleDeployment = path.join(config.projectRoot, 'deployments', 'amoy.simple.json');
  const currentDeployment = path.join(config.projectRoot, 'deployments', 'amoy.json');
  
  if (fileExists(simpleDeployment)) {
    if (copyFile(simpleDeployment, currentDeployment)) {
      console.log("✅ 部署配置已恢复\n");
    }
  }
  
  // 重新编译
  console.log("🔨 重新编译合约...\n");
  try {
    execSync('npx hardhat clean', { 
      cwd: config.projectRoot,
      stdio: 'inherit'
    });
    execSync('npx hardhat compile', { 
      cwd: config.projectRoot,
      stdio: 'inherit'
    });
    console.log("\n✅ 编译成功！\n");
  } catch (error) {
    console.log("\n❌ 编译失败\n");
    return;
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🎉 回滚完成！\n");
  console.log("📋 接下来：\n");
  console.log("1️⃣  重启开发服务器：");
  console.log("   npm run dev\n");
  console.log("2️⃣  测试功能是否正常\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main();


