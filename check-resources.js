// 检查静态资源是否存在
const fs = require('fs');
const path = require('path');

console.log('\n════════════════════════════════════════');
console.log('   📦 静态资源检查工具');
console.log('════════════════════════════════════════\n');

// 需要检查的资源列表
const resources = [
  // JavaScript 文件
  { path: 'public/cascading-waves.js', name: 'Cascading Waves 脚本', critical: true },
  
  // 图片资源
  { path: 'public/image/black-swan.png', name: '黑天鹅图标', critical: true },
  { path: 'public/image/duolum.jpg', name: 'Duolum 图片', critical: false },
  
  // Favicon
  { path: 'public/favicon.ico', name: '网站图标', critical: false },
  
  // 数据库
  { path: 'database/alerts.db', name: '预警数据库', critical: true },
  
  // 关键配置文件
  { path: 'server-with-websocket.js', name: 'WebSocket 服务器', critical: true },
  { path: 'package.json', name: 'NPM 配置', critical: true },
  { path: 'next.config.js', name: 'Next.js 配置', critical: true },
];

let missingCritical = [];
let missingOptional = [];
let foundResources = 0;

resources.forEach(resource => {
  const fullPath = path.join(__dirname, resource.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    foundResources++;
    console.log(`✅ ${resource.name.padEnd(25)} ${resource.path}`);
  } else {
    if (resource.critical) {
      missingCritical.push(resource);
      console.log(`❌ ${resource.name.padEnd(25)} ${resource.path} [关键]`);
    } else {
      missingOptional.push(resource);
      console.log(`⚠️  ${resource.name.padEnd(25)} ${resource.path} [可选]`);
    }
  }
});

console.log('\n════════════════════════════════════════');
console.log('   检查结果');
console.log('════════════════════════════════════════\n');

console.log(`总资源数: ${resources.length}`);
console.log(`✅ 已找到: ${foundResources}`);
console.log(`❌ 缺失 (关键): ${missingCritical.length}`);
console.log(`⚠️  缺失 (可选): ${missingOptional.length}`);

// 检查关键目录
console.log('\n════════════════════════════════════════');
console.log('   关键目录检查');
console.log('════════════════════════════════════════\n');

const directories = [
  { path: 'public', name: '静态资源目录' },
  { path: 'public/image', name: '图片目录' },
  { path: 'database', name: '数据库目录' },
  { path: 'app', name: 'Next.js App 目录' },
  { path: 'components', name: '组件目录' },
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir.path);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${dir.name.padEnd(20)} ${dir.path}`);
});

// 详细建议
console.log('\n════════════════════════════════════════');
console.log('   建议');
console.log('════════════════════════════════════════\n');

if (missingCritical.length > 0) {
  console.log('⚠️  发现缺失的关键资源！\n');
  missingCritical.forEach(resource => {
    console.log(`❌ ${resource.name}: ${resource.path}`);
  });
  console.log('\n这些资源对系统运行至关重要，请确保它们存在。\n');
}

if (missingOptional.length > 0) {
  console.log('💡 发现缺失的可选资源：\n');
  missingOptional.forEach(resource => {
    console.log(`⚠️  ${resource.name}: ${resource.path}`);
  });
  console.log('\n这些资源是可选的，不影响核心功能。\n');
}

if (missingCritical.length === 0 && missingOptional.length === 0) {
  console.log('🎉 所有资源检查通过！');
  console.log('✅ 系统配置完整，可以正常运行。\n');
}

// 额外检查：文件大小
console.log('════════════════════════════════════════');
console.log('   文件大小');
console.log('════════════════════════════════════════\n');

resources.forEach(resource => {
  const fullPath = path.join(__dirname, resource.path);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📄 ${resource.name.padEnd(25)} ${sizeKB} KB`);
  }
});

console.log('\n════════════════════════════════════════\n');

// 退出代码
if (missingCritical.length > 0) {
  console.log('❌ 检查失败：有关键资源缺失\n');
  process.exit(1);
} else {
  console.log('✅ 检查通过\n');
  process.exit(0);
}



