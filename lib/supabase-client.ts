/**
 * Supabase 客户端配置
 * 用于 Vercel 环境访问云数据库
 */

// 简单的 fetch 包装器，不需要 Supabase SDK
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

