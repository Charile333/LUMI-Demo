// 🔐 管理员认证工具
// 增强安全措施：登录尝试限制、会话管理、日志记录

import { NextRequest } from 'next/server';

// 登录尝试记录（内存存储，生产环境应使用 Redis）
interface LoginAttempt {
  ip: string;
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

// 配置
const MAX_LOGIN_ATTEMPTS = 5; // 最大登录尝试次数
const BLOCK_DURATION = 15 * 60 * 1000; // 锁定 15 分钟
const ATTEMPT_WINDOW = 60 * 1000; // 1 分钟内的尝试计数窗口

/**
 * 获取客户端 IP 地址
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || request.ip || 'unknown';
  return ip;
}

/**
 * 检查 IP 是否被锁定
 */
export function isIPBlocked(ip: string): boolean {
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;

  // 检查是否在锁定期间
  if (attempt.blockedUntil && Date.now() < attempt.blockedUntil) {
    return true;
  }

  // 如果锁定时间已过，清除记录
  if (attempt.blockedUntil && Date.now() >= attempt.blockedUntil) {
    loginAttempts.delete(ip);
    return false;
  }

  return false;
}

/**
 * 记录登录尝试
 */
export function recordLoginAttempt(ip: string, success: boolean): {
  blocked: boolean;
  remainingAttempts: number;
} {
  let attempt = loginAttempts.get(ip);

  if (!attempt) {
    attempt = {
      ip,
      attempts: 0,
      lastAttempt: Date.now()
    };
  }

  // 清除过期的尝试记录（超过时间窗口）
  if (Date.now() - attempt.lastAttempt > ATTEMPT_WINDOW) {
    attempt.attempts = 0;
  }

  if (success) {
    // 登录成功，清除记录
    loginAttempts.delete(ip);
    return { blocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  } else {
    // 登录失败，增加尝试次数
    attempt.attempts += 1;
    attempt.lastAttempt = Date.now();

    // 如果超过最大尝试次数，锁定 IP
    if (attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
      attempt.blockedUntil = Date.now() + BLOCK_DURATION;
      loginAttempts.set(ip, attempt);
      return { blocked: true, remainingAttempts: 0 };
    }

    loginAttempts.set(ip, attempt);
    return {
      blocked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.attempts
    };
  }
}

/**
 * Base64 编码（兼容 Edge Runtime）
 */
function base64Encode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  // Edge Runtime 兼容
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  // 降级方案
  return str;
}

/**
 * Base64 解码（兼容 Edge Runtime）
 */
function base64Decode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
  // Edge Runtime 兼容
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(str)));
  }
  // 降级方案
  return str;
}

/**
 * 生成安全的认证 token
 */
export function generateAuthToken(): string {
  // 使用时间戳 + 随机字符串生成 token
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const secret = process.env.ADMIN_AUTH_SECRET || 'default-secret-change-in-production';
  
  // 简单的哈希（生产环境应使用更安全的方法，如 JWT）
  const token = `${timestamp}-${random}-${secret.substring(0, 8)}`;
  return base64Encode(token);
}

/**
 * 验证认证 token（兼容 Edge Runtime）
 */
export function verifyAuthToken(token: string): boolean {
  try {
    const decoded = base64Decode(token);
    const parts = decoded.split('-');
    
    if (parts.length !== 3) return false;
    
    // 检查 token 是否过期（24小时）
    const timestamp = parseInt(parts[0], 36);
    if (isNaN(timestamp)) return false;
    
    const age = Date.now() - timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      return false; // Token 过期
    }
    
    // 验证 secret 部分
    const secret = process.env.ADMIN_AUTH_SECRET || 'default-secret-change-in-production';
    return parts[2] === secret.substring(0, 8);
  } catch {
    return false;
  }
}

/**
 * 设置认证 cookie（用于 API 路由）
 */
export function setAuthCookie(token: string): void {
  // 这个函数在 API 路由中使用 NextResponse.cookies.set() 设置
  // 这里只是占位，实际设置在 API 路由中完成
}

/**
 * 清除认证 cookie（用于 API 路由）
 */
export function clearAuthCookie(): void {
  // 这个函数在 API 路由中使用 NextResponse.cookies.delete() 清除
  // 这里只是占位，实际清除在 API 路由中完成
}

/**
 * 验证用户是否已认证
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin_authenticated')?.value;
  if (!token) return false;
  return verifyAuthToken(token);
}

/**
 * 记录登录日志
 */
export function logLoginAttempt(ip: string, success: boolean, reason?: string): void {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  const logMessage = `[${timestamp}] [${status}] IP: ${ip}${reason ? ` Reason: ${reason}` : ''}`;
  
  console.log(`🔐 Admin Login: ${logMessage}`);
  
  // 生产环境应该记录到日志系统（如 Sentry, Logtail 等）
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送到日志服务
  }
}

