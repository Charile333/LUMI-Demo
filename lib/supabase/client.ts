// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 客户端 Supabase 实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端 Supabase 实例（使用 service role key，权限更高）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);


