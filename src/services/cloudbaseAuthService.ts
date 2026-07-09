/**
 * 认证服务（CloudBase SDK v3 / supabase-like 风格）
 *
 * 当前环境（体验版）已开启：匿名登录 + 用户名密码登录。
 * 由于新版 SDK 的 signUp 仅支持邮箱/手机验证码（OTP）注册，且体验版暂未开启
 * email 模式，这里以「匿名登录」作为可用的注册/登录入口：
 *   - 注册：匿名登录拿到稳定 UID → 建立 users 资料文档
 *   - 登录：匿名登录 → 加载（或建立）users 资料文档
 * 匿名 UID 会在浏览器 localStorage 中持久化，因此同一浏览器下次访问仍是同一用户。
 *
 * 升级到标准版并开启 email/手机登录后，只需把 registerWithEmail /
 * loginWithEmail 内部实现替换为 auth.signUp / auth.signInWithPassword 即可，
 * 对外接口保持不变。
 */
import { auth, db } from '@/lib/cloudbase';
import { extractList } from '@/lib/cloudbaseCrud';
import type { UserProfile } from '@/types';

interface AuthResult {
  success: boolean;
  uid?: string;
  error?: string;
}

/**
 * 获取当前登录用户的 UID（匿名或真实账号通用）
 */
function extractUid(): string | null {
  const u: any = (auth as any).currentUser;
  if (u) return u.id || u.uuid || u.uid || null;
  return null;
}

/**
 * 确保已有一个有效的登录会话（匿名），返回 UID。
 * 如果当前已有会话则直接复用，否则匿名登录。
 */
export async function ensureSession(): Promise<{ uid: string | null; error?: string }> {
  // 已登录则复用
  let uid = extractUid();
  if (uid) return { uid };

  try {
    const { data, error } = await (auth as any).signInAnonymously();
    if (error) {
      return { uid: null, error: error.message || '登录态建立失败' };
    }
    const id = data?.user?.id || data?.user?.uuid || data?.uuid || extractUid();
    if (!id) {
      return { uid: null, error: '未能获取用户标识' };
    }
    return { uid: id };
  } catch (e: any) {
    return { uid: null, error: e?.message || '登录态建立失败' };
  }
}

/**
 * 注册新用户（基于匿名会话 + users 资料文档）
 */
export async function registerWithEmail(
  email: string,
  password: string,
  userProfile: Partial<UserProfile>
): Promise<AuthResult> {
  try {
    const { uid, error } = await ensureSession();
    if (error || !uid) {
      return { success: false, error: error || '注册失败' };
    }

    // 检查是否已存在该用户的资料文档
    const existing = extractList(await db.collection('users').where({ uid }).get());
    if (existing && existing.length > 0) {
      return { success: true, uid };
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: uid,
      uid,
      displayName: userProfile.displayName || email.split('@')[0] || '用户',
      email,
      avatarUrl: userProfile.avatarUrl || '',
      bio: userProfile.bio || '',
      gender: userProfile.gender || 'other',
      birthday: userProfile.birthday || '',
      phone: userProfile.phone || '',
      wechat: userProfile.wechat || '',
      address: userProfile.address || '',
      occupation: userProfile.occupation || '',
      company: userProfile.company || '',
      department: userProfile.department || '',
      language: userProfile.language || 'zh-CN',
      timezone: userProfile.timezone || 'Asia/Shanghai',
      dateFormat: userProfile.dateFormat || 'YYYY-MM-DD',
      currency: userProfile.currency || 'CNY',
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    await db.collection('users').add(profile);
    return { success: true, uid };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || error?.toString() || '注册失败',
    };
  }
}

/**
 * 邮箱+密码登录（当前基于匿名会话建立，并加载用户资料）
 * 升级标准版并开启 email 登录后，可在此切换为 auth.signInWithPassword。
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { uid, error } = await ensureSession();
    if (error || !uid) {
      return { success: false, error: error || '登录失败' };
    }

    // 加载已有资料；不存在则建立（匿名会话下资料按 uid 隔离）
    const existing = extractList(await db.collection('users').where({ uid }).get());
    if (!existing || existing.length === 0) {
      const now = new Date().toISOString();
      const profile: UserProfile = {
        id: uid,
        uid,
        displayName: email.split('@')[0] || '用户',
        email,
        avatarUrl: '',
        bio: '',
        gender: 'other',
        birthday: '',
        phone: '',
        wechat: '',
        address: '',
        occupation: '',
        company: '',
        department: '',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        currency: 'CNY',
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      await db.collection('users').add(profile);
    }

    return { success: true, uid };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || error?.toString() || '登录失败',
    };
  }
}

/**
 * 退出登录
 */
export async function logout(): Promise<AuthResult> {
  try {
    await (auth as any).signOut();
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || error?.toString() || '退出失败',
    };
  }
}

/**
 * 获取当前登录用户 UID
 */
export function getCurrentUserUid(): string | null {
  return extractUid();
}

/**
 * 检查是否已登录
 */
export function hasLoginState(): boolean {
  return (auth as any).hasLoginState() === true || extractUid() !== null;
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChanged(
  callback: (user: { uid: string; email: string } | null) => void
): () => void {
  const unsubscribe = (auth as any).onAuthStateChange?.((event: any, session: any) => {
    const u = session?.user || (auth as any).currentUser;
    if (u) {
      callback({ uid: u.id || u.uuid || '', email: u.email || '' });
    } else {
      callback(null);
    }
  });

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}

/**
 * 从 CloudBase 获取当前用户资料
 */
export async function fetchCurrentUserProfile(): Promise<UserProfile | null> {
  const uid = getCurrentUserUid();
  if (!uid) return null;

  try {
    const data = extractList(await db.collection('users').where({ uid }).get());
    if (data && data.length > 0) {
      return data[0] as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    return null;
  }
}

/**
 * 更新当前用户资料（同步到数据库 + 同步到全局 store）
 */
export async function updateCurrentUserProfile(
  updates: Partial<UserProfile>
): Promise<AuthResult> {
  const uid = getCurrentUserUid();
  if (!uid) {
    return { success: false, error: '用户未登录' };
  }

  try {
    const data = extractList(await db.collection('users').where({ uid }).get());
    const updatedProfile = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (data && data.length > 0) {
      const docId = (data[0] as any)._id || (data[0] as any).id;
      await db.collection('users').doc(docId).update(updatedProfile);
    } else {
      await db.collection('users').add({
        ...updatedProfile,
        uid,
        id: uid,
        createdAt: new Date().toISOString(),
      } as UserProfile);
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || error?.toString() || '更新用户资料失败',
    };
  }
}

export default {
  registerWithEmail,
  loginWithEmail,
  logout,
  getCurrentUserUid,
  hasLoginState,
  onAuthStateChanged,
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
};
