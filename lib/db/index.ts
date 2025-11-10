// 🗄️ PostgreSQL 数据库连接工具
import { Pool, QueryResult } from 'pg';

// 数据库连接池
let pool: Pool | null = null;

// 检测是否在 Vercel serverless 环境
const isVercel = process.env.VERCEL === '1';

/**
 * 获取数据库连接池
 * 针对 Vercel serverless 环境优化
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.warn('⚠️ DATABASE_URL 未配置 - 订单系统功能将不可用（仅影响交易功能，不影响浏览市场）');
      console.warn('💡 如需启用交易功能，请在 .env.local 中配置：');
      console.warn('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
      
      // 创建一个假的池对象，避免代码崩溃
      // @ts-ignore
      pool = {
        query: async () => {
          throw new Error('DATABASE_URL not configured');
        },
        connect: async () => {
          throw new Error('DATABASE_URL not configured');
        },
        end: async () => {},
        on: () => {}
      } as any;
      return pool;
    }
    
    // Vercel serverless 环境优化配置
    const poolConfig = isVercel ? {
      connectionString,
      max: 1, // serverless 环境中减少连接数
      idleTimeoutMillis: 10000, // 减少空闲超时
      connectionTimeoutMillis: 20000, // 🔧 增加连接超时到20秒（针对 Supabase Pooler）
      query_timeout: 20000, // 查询超时20秒
      ssl: {
        rejectUnauthorized: false // Supabase 需要
      }
    } : {
      connectionString,
      max: 5, // 🔧 减少开发环境连接数，避免连接池耗尽
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // 🔧 增加连接超时到20秒
      query_timeout: 20000, // 查询超时20秒
      ssl: {
        rejectUnauthorized: false // Supabase 需要 SSL
      }
    };
    
    pool = new Pool(poolConfig);
    
    // 错误处理
    pool.on('error', (err) => {
      console.error('❌ PostgreSQL 连接池错误:', err);
      // 在 serverless 环境中重置连接池
      if (isVercel) {
        pool = null;
      }
    });
    
    console.log(`✅ PostgreSQL 连接池已创建 (${isVercel ? 'Vercel' : 'Local'} 模式)`);
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
   * 健康检查 - 测试数据库连接
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT NOW() as current_time');
      console.log('✅ 数据库连接正常:', result.rows[0].current_time);
      return true;
    } catch (error: any) {
      console.error('❌ 数据库健康检查失败:', error.message);
      // 尝试重置连接池
      try {
        await this.pool.end();
        pool = null;
        this.pool = getPool();
        console.log('🔄 连接池已重置');
      } catch (resetError) {
        console.error('❌ 连接池重置失败:', resetError);
      }
      return false;
    }
  }
  
  /**
   * 执行查询（带重试机制和超时控制）
   */
  async query<T = any>(text: string, params?: any[], retries = 2): Promise<QueryResult<T>> {
    const start = Date.now();
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 🔧 先检查连接池健康状态
        if (attempt > 0) {
          console.log(`🔄 重试查询 (第${attempt}/${retries}次)...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 递增延迟
        }

        // 🚀 使用 Promise.race 实现查询超时（20秒超时，针对 Supabase Pooler）
        const queryPromise = this.pool.query<T>(text, params);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 20 seconds - Check DATABASE_URL password or network connection')), 20000)
        );

        const result = await Promise.race([queryPromise, timeoutPromise]) as QueryResult<T>;
        const duration = Date.now() - start;
        
        // 记录查询耗时
        if (duration > 5000) {
          console.warn(`⚠️ 慢查询 (${duration}ms):`, text.substring(0, 100));
        } else if (duration > 2000) {
          console.log(`⏱️ 查询耗时 ${duration}ms`);
        }
        
        // 成功后重置连接池错误标记
        return result;
        
      } catch (error: any) {
        lastError = error;
        
        // 连接超时或终止
        if (error.message?.includes('timeout') || error.message?.includes('terminated') || error.message?.includes('Query timeout') || error.message?.includes('DATABASE_URL not configured')) {
          // 如果是 DATABASE_URL 未配置，直接失败不重试
          if (error.message?.includes('DATABASE_URL not configured')) {
            break; // 直接退出，不重试
          }
          
          console.warn(`⚠️ 数据库连接超时 (尝试 ${attempt + 1}/${retries + 1})`);
          
          // 如果是最后一次尝试，不重置连接池（避免重复尝试）
          if (attempt === retries) {
            break;
          }
          continue; // 继续重试
        }
        
        // 处理连接池已关闭的错误
        if (error.message?.includes('Cannot use a pool after calling end')) {
          console.warn('⚠️ 连接池已关闭，重新创建...');
          pool = null;
          this.pool = getPool();
          if (attempt < retries) {
            continue; // 重试
          }
        }
        
        // 其他错误不重试
        break;
      }
    }
    
    // 所有重试都失败，记录错误
    if (lastError.message?.includes('DATABASE_URL not configured')) {
      // DATABASE_URL 未配置 - 静默失败（只警告一次）
      // 不抛出错误，让上层处理
    } else if (lastError.code === 'ENOTFOUND' || lastError.message?.includes('getaddrinfo')) {
      // 连接错误简化日志
      console.error('❌ 数据库连接失败:', lastError.message);
    } else {
      // 其他错误详细日志
      console.error('❌ 数据库查询错误:', lastError.message || lastError);
      console.error('SQL:', text.substring(0, 200));
      console.error('参数:', params);
    }
    
    throw lastError;
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
  } catch (error: any) {
    // 连接错误时只记录简要信息，避免启动时的详细错误堆栈
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      console.warn('⚠️ 数据库连接不可用（DATABASE_URL 可能未配置或 Supabase 项目不可用）');
    } else {
      console.error('❌ 数据库连接失败:', error.message || error);
    }
    return false;
  }
}

// 在服务器启动时测试连接（仅在服务器端）
// 静默处理连接错误，避免启动时的错误日志
if (typeof window === 'undefined') {
  testConnection().catch(() => {
    // 静默处理，避免启动时的错误日志
  });
}







