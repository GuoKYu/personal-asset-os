import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  Globe,
  Clock,
  DollarSign,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Camera,
  Upload,
} from 'lucide-react';
import { useProfileStore } from '@/store';
import type { UserProfile } from '@/types';
import { GlassCard } from '@/components/ui';

const ProfileManagePage: React.FC = () => {
  const { profile, isLoading, loadProfile, updateProfile } = useProfileStore();

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const presetAvatars = [
    { emoji: '👤', bg: '#6366F1' }, { emoji: '🧑‍💻', bg: '#06B6D4' },
    { emoji: '🚀', bg: '#F43F5E' }, { emoji: '🌟', bg: '#F59E0B' },
    { emoji: '🦊', bg: '#10B981' }, { emoji: '🐱', bg: '#8B5CF6' },
    { emoji: '🦁', bg: '#EF4444' }, { emoji: '🐼', bg: '#3B82F6' },
  ];

  // Load profile on mount
  useEffect(() => {
    if (!profile) {
      loadProfile();
    } else {
      setFormData(profile);
    }
  }, [profile, loadProfile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
    setSaveStatus('idle');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveStatus('idle');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
      setAvatarUploading(false);
    };
    reader.onerror = () => setAvatarUploading(false);
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: { emoji: string; bg: string }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="100" fill="${preset.bg}"/><text x="100" y="120" text-anchor="middle" font-size="80">${preset.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人账户信息</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理您的个人信息，同步到整个系统
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5" style={{ color: 'var(--pao-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--pao-text-primary)' }}>头像设置</h2>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          {/* Current avatar */}
          <div className="flex-shrink-0">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="头像" className="h-24 w-24 rounded-full object-cover border-2" style={{ borderColor: 'var(--pao-border)' }} />
            ) : (
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}>
                {(formData.displayName || profile?.displayName || '用').charAt(0)}
              </div>
            )}
          </div>

          {/* Upload + Presets */}
          <div className="flex-1 min-w-0">
            <label
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:scale-105 mb-4"
              style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
            >
              <Upload className="h-4 w-4" />
              {avatarUploading ? '上传中...' : '上传图片'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--pao-text-tertiary)' }}>或选择预设头像：</p>
            <div className="flex flex-wrap gap-2">
              {presetAvatars.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetSelect(p)}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-all duration-200 border-2 border-transparent hover:border-current"
                  style={{ background: `${p.bg}30` }}
                  title={`头像 ${i + 1}`}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    显示名称 *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入您的名称"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{profile.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    个人简介
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="简短的个人简介"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 py-2">{profile.bio || '未设置'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      性别
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                      >
                        <option value="">未设置</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                        <option value="other">其他</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 py-2">
                        {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : profile.gender === 'other' ? '其他' : '未设置'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      生日
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.birthday || ''}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.birthday || '未设置'}</p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Contact Info Card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">联系方式</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{profile.email || '未设置'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      电话
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="手机号"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.phone || '未设置'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      微信
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.wechat || ''}
                        onChange={(e) => handleInputChange('wechat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="微信号"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.wechat || '未设置'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地址
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="详细地址"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 py-2">{profile.address || '未设置'}</p>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Work Info Card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">工作信息</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      职业
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.occupation || ''}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="职业"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.occupation || '未设置'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      公司
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="公司名称"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.company || '未设置'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部门
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="部门"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2">{profile.department || '未设置'}</p>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Preferences Card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">系统偏好</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      语言
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.language || 'zh-CN'}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                        <option value="zh-TW">繁体中文</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 py-2">
                        {profile.language === 'zh-CN' ? '简体中文' : profile.language === 'en-US' ? 'English' : '繁体中文'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      时区
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.timezone || 'Asia/Shanghai'}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                      >
                        <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                        <option value="America/New_York">纽约时间 (UTC-5)</option>
                        <option value="Europe/London">伦敦时间 (UTC+0)</option>
                        <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 py-2">
                        {profile.timezone === 'Asia/Shanghai' ? '北京时间 (UTC+8)' : profile.timezone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日期格式
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.dateFormat || 'YYYY-MM-DD'}
                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{profile.dateFormat}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认货币
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.currency || 'CNY'}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
                      >
                        <option value="CNY">人民币 (CNY)</option>
                        <option value="USD">美元 (USD)</option>
                        <option value="EUR">欧元 (EUR)</option>
                        <option value="GBP">英镑 (GBP)</option>
                        <option value="JPY">日元 (JPY)</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 py-2">
                        {profile.currency === 'CNY' ? '人民币 (CNY)' : profile.currency}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saveStatus === 'saving' ? '保存中...' : '保存'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  编辑信息
                </button>
              )}
            </div>

            {/* Save Status */}
            {saveStatus === 'saved' && (
              <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in-up">
                ✅ 保存成功！
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in-up">
                ❌ 保存失败，请重试
              </div>
            )}
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="space-y-6">
              <GlassCard className="p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">预览</h3>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  {profile.avatarUrl || formData.avatarUrl ? (
                    <img src={profile.avatarUrl || formData.avatarUrl || ''} alt="头像" className="h-24 w-24 rounded-full object-cover border-4 mb-3" style={{ borderColor: 'var(--pao-border)' }} />
                  ) : (
                    <div className="h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3" style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}>
                      {(profile.displayName || '用').charAt(0)}
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900">{profile.displayName}</h4>
                  <p className="text-sm text-gray-500">{profile.occupation || '未设置职业'}</p>
                </div>

                {/* Info List */}
                <div className="space-y-3 text-sm">
                  {profile.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.company && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                  )}
                </div>

                {/* System Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    系统信息
                  </h5>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>语言</span>
                      <span className="text-gray-900">{profile.language === 'zh-CN' ? '简体中文' : profile.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>时区</span>
                      <span className="text-gray-900">{profile.timezone === 'Asia/Shanghai' ? '北京时间' : profile.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>货币</span>
                      <span className="text-gray-900">{profile.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>版本</span>
                      <span className="text-gray-900">v{profile.version || 1}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileManagePage;
