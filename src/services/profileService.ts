/**
 * Profile Service — CloudBase SDK 版本
 * 委托给 cloudbaseAuthService 处理用户资料
 * 保留接口兼容性，供未来使用
 */
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
} from './cloudbaseAuthService';
import type { UserProfile } from '../types';

export const profileService = {
  /**
   * 获取当前用户资料（从 CloudBase users 集合）
   */
  async getProfile(): Promise<UserProfile | null> {
    return await fetchCurrentUserProfile();
  },

  /**
   * 保存完整用户资料
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    const { uid } = profile;
    if (!uid) {
      throw new Error('Cannot save profile without uid');
    }
    await updateCurrentUserProfile(profile);
  },

  /**
   * 更新部分字段
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const result = await updateCurrentUserProfile(updates);
    if (!result.success) {
      throw new Error(result.error || 'Failed to update profile');
    }
    // 返回更新后的完整 profile
    const updated = await fetchCurrentUserProfile();
    if (!updated) {
      throw new Error('Profile not found after update');
    }
    return updated;
  },

  /**
   * 删除用户资料（谨慎使用）
   */
  async deleteProfile(): Promise<void> {
    // 在 CloudBase 架构下，删除用户资料需要通过云函数
    // 暂时不实现，抛出提示
    throw new Error(
      'Profile deletion requires cloud function. Use cloudbaseAuthService.logout() instead.',
    );
  },

  /**
   * 初始化默认资料（如果不存在）
   */
  async initializeDefaultProfile(): Promise<UserProfile> {
    const existing = await this.getProfile();
    if (existing) {
      return existing;
    }

    // 尝试创建一个默认资料
    const result = await updateCurrentUserProfile({
      displayName: '个人用户',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      currency: 'CNY',
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to initialize profile');
    }

    const profile = await this.getProfile();
    if (!profile) {
      throw new Error('Profile not found after initialization');
    }
    return profile;
  },
};
