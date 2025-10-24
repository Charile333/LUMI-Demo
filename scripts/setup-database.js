/**
 * 自动创建 Supabase 数据库表
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请先配置 .env.local 文件');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 开始设置 Supabase 数据库...\n');

  try {
    // 创建表的 SQL
    const createTableSQL = `
      -- 创建预测市场数据表
      CREATE TABLE IF NOT EXISTS markets (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        categoryType TEXT NOT NULL,
        probability DECIMAL(5,2) DEFAULT 50.0,
        volume TEXT DEFAULT '$0',
        volumeNum DECIMAL DEFAULT 0,
        participants INTEGER DEFAULT 0,
        endDate TEXT NOT NULL,
        trend TEXT DEFAULT 'up',
        change TEXT DEFAULT '+0%',
        description TEXT NOT NULL,
        resolutionCriteria TEXT[] DEFAULT '{}',
        relatedMarkets TEXT[] DEFAULT '{}',
        isActive BOOLEAN DEFAULT true,
        source TEXT DEFAULT 'custom',
        priorityLevel TEXT DEFAULT 'normal',
        customWeight INTEGER DEFAULT 50,
        isHomepage BOOLEAN DEFAULT false,
        isHot BOOLEAN DEFAULT false,
        isTrending BOOLEAN DEFAULT false,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_markets_categoryType ON markets(categoryType);
      CREATE INDEX IF NOT EXISTS idx_markets_isActive ON markets(isActive);
      CREATE INDEX IF NOT EXISTS idx_markets_createdAt ON markets(createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_markets_source ON markets(source);
      CREATE INDEX IF NOT EXISTS idx_markets_priorityLevel ON markets(priorityLevel);
    `;

    console.log('📊 创建 markets 表...');
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      // 如果 rpc 方法不存在，提示用户手动创建
      console.log('⚠️  无法通过 API 自动创建表\n');
      console.log('请手动在 Supabase 中创建表：\n');
      console.log('1. 打开 Supabase 项目：https://supabase.com/dashboard');
      console.log('2. 点击左侧 "SQL Editor"');
      console.log('3. 点击 "New Query"');
      console.log('4. 复制以下 SQL 并执行：\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(createTableSQL);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('5. 点击 "Run" 执行');
      console.log('6. 看到 "Success" 后，重新运行：node scripts/import-sports-data.js\n');
      
      // 或者直接使用文件
      console.log('💡 提示：SQL 语句已保存在 scripts/create-table.sql 文件中');
      
      return;
    }

    console.log('✅ 数据库表创建成功！\n');
    console.log('📍 下一步：运行导入脚本');
    console.log('   node scripts/import-sports-data.js\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log('\n请手动在 Supabase SQL Editor 中执行 scripts/create-table.sql\n');
  }
}

setupDatabase();










