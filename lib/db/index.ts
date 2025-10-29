// 🗄️ PostgreSQL 数据库连接工具
import { Pool, QueryResult } from 'pg';

// 数据库连接池
let pool: Pool | null = null;

/**
 * 获取数据库连接池
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      const errorMsg = '❌ DATABASE_URL 环境变量未设置！\n' +
        '请在 Vercel Dashboard → Settings → Environment Variables 中添加：\n' +
        'DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n' +
        '参考文档: VERCEL_环境变量配置指南.md';
      console.error(errorMsg);
      throw new Error('DATABASE_URL 环境变量未设置 - 订单系统需要 PostgreSQL 数据库连接');
    }
    
    pool = new Pool({
      connectionString,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // 错误处理
    pool.on('error', (err) => {
      console.error('❌ PostgreSQL 连接池错误:', err);
    });
    
    console.log('✅ PostgreSQL 连接池已创建');
  }
  
  return pool;
}

/**
 * 数据库操作类
 */
export class Database {
  private pool: Pool;
  
  constructor() {
    this.pool = getPool();
  }
  
  /**
   * 执行查询
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      // 记录慢查询
      if (duration > 1000) {
        console.warn(`⚠️ 慢查询 (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      console.error('❌ 数据库查询错误:', error);
      console.error('SQL:', text);
      console.error('参数:', params);
      throw error;
    }
  }
  
  /**
   * 执行事务
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ PostgreSQL 连接池已关闭');
    }
  }
}

// 导出单例
export const db = new Database();

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ 数据库连接成功:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 在服务器启动时测试连接（仅在服务器端）
if (typeof window === 'undefined') {
  testConnection().catch(console.error);
}







