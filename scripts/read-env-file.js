/**
 * 直接读取 .env.local 文件内容
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('📄 读取 .env.local 文件内容：\n');
console.log('文件路径:', envPath);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = (index + 1).toString().padStart(2, ' ');
    
    // 检查是否是 SERVICE_ROLE_KEY 相关的行
    if (line.includes('SERVICE') || line.includes('service')) {
      console.log(`${lineNum}| 🔍 ${line}`);
      
      // 检查常见问题
      if (line.includes(' =') || line.includes('= ')) {
        console.log('    ⚠️  警告：等号周围有空格');
      }
      if (line.includes('"') || line.includes("'")) {
        console.log('    ⚠️  警告：值包含引号（应该删除引号）');
      }
      if (!line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        console.log('    ⚠️  警告：变量名可能不正确');
        console.log('    应该是：SUPABASE_SERVICE_ROLE_KEY=...');
      }
    } else if (line.trim() && !line.trim().startsWith('#')) {
      console.log(`${lineNum}| ${line}`);
    } else if (line.trim().startsWith('#')) {
      console.log(`${lineNum}| ${line}`);
    }
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ 正确的格式应该是：');
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('\n注意：');
  console.log('- 等号两边没有空格');
  console.log('- 值不需要引号');
  console.log('- 变量名全大写，用下划线连接');
  
} catch (error) {
  console.error('❌ 读取文件失败:', error.message);
}










