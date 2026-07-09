import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginWithEmail } from '@/services/cloudbaseAuthService';
import { useProfileStore } from '@/store';
import ParticleBackground from '@/components/effects/ParticleBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);

      if (result.success) {
        // 登录成功，加载用户资料
        const loadProfile = useProfileStore.getState().loadProfile;
        await loadProfile();
        navigate('/');
      } else {
        setError(result.error || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--pao-bg-base)' }}>
      {/* Three.js 粒子背景 */}
      <ParticleBackground />

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="glass-card p-8 rounded-2xl">
          {/* Logo & 标题 */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--pao-primary)',
                boxShadow: '0 8px 32px var(--td-shadow-2)',
              }}
            >
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text">个人资产管理系统</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pao-text-secondary)' }}>
              登录您的账户
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--pao-text-tertiary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300"
                  style={{
                    background: 'var(--pao-bg-input)',
                    borderColor: 'var(--pao-border)',
                    color: 'var(--pao-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--pao-text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-300"
                  style={{
                    background: 'var(--pao-bg-input)',
                    borderColor: 'var(--pao-border)',
                    color: 'var(--pao-text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--pao-text-tertiary)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'var(--pao-text-tertiary)'
                  : 'var(--pao-primary)',
                boxShadow: '0 4px 16px var(--td-shadow-2)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--pao-text-secondary)' }}>
            还没有账户？{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--pao-primary)' }}>
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
