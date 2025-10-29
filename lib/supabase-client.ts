/**
 * Supabase 客户端配置
 * 用于 Vercel 环境访问云数据库
 * 
 * 使用单例模式避免多实例警告
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 单例实例
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * 获取前端 Supabase 客户端（使用 public key）
 */
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase 环境变量未配置');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase 客户端已初始化');
  }
  return supabaseInstance;
};

/**
 * 获取服务端 Supabase 客户端（使用 service role key，仅在 API 路由中使用）
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ Supabase Admin 环境变量未配置');
    }
    
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase Admin 客户端已初始化');
  }
  return supabaseAdminInstance;
};

// 向后兼容：导出实例
export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();

// 简单的 fetch 包装器（保持向后兼容）
export async function queryAlerts(limit: number = 20) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase 未配置，使用本地数据库');
    return null;
  }
  
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/alerts?type=neq.historical_crash&timestamp=gt.${fiveMinutesAgo}&order=id.desc&limit=${limit}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Supabase 查询失败:', error);
    return null;
  }
}

export async function queryHistoricalCrashes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/alerts?type=eq.historical_crash&order=timestamp.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Supabase 查询失败:', error);
    return null;
  }
}

