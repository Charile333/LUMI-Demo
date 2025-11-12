'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        // 登录成功，重定向
        const redirect = searchParams.get('redirect') || '/admin/create-market';
        router.push(redirect);
        router.refresh(); // 刷新页面以更新认证状态
      } else {
        setError(data.error || '密码错误');
      }
    } catch (error) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          管理员密码
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="请输入管理员密码"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          required
          autoFocus
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 shadow-lg"
      >
        {loading ? '登录中...' : '🔓 登录'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            管理员登录
          </h1>
          <p className="text-gray-600 mt-2">
            LUMI 后台管理系统
          </p>
        </div>

        {/* 登录表单 - 使用 Suspense 包裹 */}
        <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
          <LoginForm />
        </Suspense>

        {/* 提示 */}
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">
              💡 <strong>开发环境快速登录：</strong>
            </p>
            <p className="text-xs text-blue-600">
              默认密码：<code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700">
              🔒 生产环境需要在 Vercel 环境变量中配置 <code className="bg-yellow-100 px-1 rounded">ADMIN_PASSWORD</code>
            </p>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

