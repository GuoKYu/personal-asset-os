import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { registerWithEmail } from '@/services/cloudbaseAuthService';
import { useProfileStore } from '@/store';
import ParticleBackground from '@/components/effects/ParticleBackground';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      const result = await registerWithEmail(formData.email, formData.password, {
        displayName: formData.displayName,
      });

      if (result.success) {
        setSuccess(true);
        // 注册即建立会话，加载资料后直接进入系统
        const loadProfile = useProfileStore.getState().loadProfile;
        await loadProfile();
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || '注册失败');
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pao-bg-base)' }}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--pao-primary)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
            注册成功！
          </h2>
          <p style={{ color: 'var(--pao-text-secondary)' }}>
            正在进入系统...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--pao-bg-base)' }}>
      {/* Three.js 粒子背景 */}
      <ParticleBackground />

      {/* 注册卡片 */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="glass-card p-8 rounded-2xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold gradient-text">创建新账户</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--pao-text-secondary)' }}>
              填写以下信息注册您的账户
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--pao-text-tertiary)' }} />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="您的用户名"
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

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--pao-text-tertiary)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="至少6位"
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

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--pao-text-tertiary)' }} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="再次输入密码"
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
                  注册中...
                </span>
              ) : (
                '注册'
              )}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--pao-text-secondary)' }}>
            已有账户？{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--pao-primary)' }}>
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
