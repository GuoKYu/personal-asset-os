/* ============================================
   personal-asset-os — Zustand State Management
   ============================================ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, ThemeConfig, SidebarState, ModuleConfig, UserProfile } from '../types';
import { MODULES } from '../config/modules';
import cloudbaseAuthService from '../services/cloudbaseAuthService';

// ── UI Store ──
interface UIState {
  sidebar: SidebarState;
  theme: ThemeConfig;
  notifications: Notification[];
  activeModule: string;
  pageTitle: string;
  breadcrumbs: { label: string; path?: string }[];

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setActiveModule: (moduleId: string) => void;
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: { label: string; path?: string }[]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebar: { collapsed: true, expanded: false },
      theme: { mode: 'system' },
      notifications: [],
      activeModule: 'dashboard',
      pageTitle: '总览',
      breadcrumbs: [{ label: '总览', path: '/' }],

      toggleSidebar: () =>
        set((state) => ({
          sidebar: {
            collapsed: !state.sidebar.collapsed,
            expanded: !state.sidebar.collapsed,
          },
        })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({
          sidebar: { collapsed, expanded: !collapsed },
        }),

      setThemeMode: (mode: 'light' | 'dark' | 'system') =>
        set((state) => ({
          theme: { ...state.theme, mode },
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep max 50 notifications
        })),

      markNotificationRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      setActiveModule: (moduleId: string) =>
        set((state) => {
          const module = MODULES.find((m) => m.id === moduleId);
          const title = module?.name ?? '总览';
          return {
            activeModule: moduleId,
            pageTitle: title,
            breadcrumbs: [{ label: title, path: module?.route ?? '/' }],
          };
        }),

      setPageTitle: (title: string) => set({ pageTitle: title }),

      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    }),
    {
      name: 'personal-asset-os-ui',
      partialize: (state) => ({
        sidebar: state.sidebar,
        theme: state.theme,
      }),
    },
  ),
);

// ── Module Store ──
interface ModuleState {
  modules: ModuleConfig[];
  isLoading: boolean;

  // Actions
  setModules: (modules: ModuleConfig[]) => void;
  toggleModule: (moduleId: string) => void;
  setModuleEnabled: (moduleId: string, enabled: boolean) => void;
  reorderModules: (moduleId: string, newSortOrder: number) => void;
  getEnabledModules: () => ModuleConfig[];
  getModuleConfig: (moduleId: string) => ModuleConfig | undefined;
  setLoading: (loading: boolean) => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      modules: MODULES.map((m) => ({
        id: `cfg_${m.id}`,
        moduleId: m.id,
        enabled: m.enabled,
        sortOrder: m.sortOrder,
        customConfig: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      isLoading: false,

      setModules: (modules: ModuleConfig[]) => set({ modules }),

      toggleModule: (moduleId: string) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.moduleId === moduleId
              ? { ...m, enabled: !m.enabled, updatedAt: new Date().toISOString() }
              : m,
          ),
        })),

      setModuleEnabled: (moduleId: string, enabled: boolean) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.moduleId === moduleId
              ? { ...m, enabled, updatedAt: new Date().toISOString() }
              : m,
          ),
        })),

      reorderModules: (moduleId: string, newSortOrder: number) =>
        set((state) => {
          const oldIndex = state.modules.findIndex((m) => m.moduleId === moduleId);
          if (oldIndex === -1) return state;

          const newModules = [...state.modules];
          const [moved] = newModules.splice(oldIndex, 1);

          // Reorder all items
          const reordered = newModules
            .filter((m) => m.moduleId !== moduleId)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          reordered.splice(newSortOrder, 0, moved);

          // Update sortOrder for all
          const result = reordered.map((m, idx) => ({
            ...m,
            sortOrder: idx + 1,
            updatedAt: new Date().toISOString(),
          }));

          return { modules: result };
        }),

      getEnabledModules: () => {
        const { modules } = get();
        return modules
          .filter((m) => m.enabled)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getModuleConfig: (moduleId: string) => {
        const { modules } = get();
        return modules.find((m) => m.moduleId === moduleId);
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'personal-asset-os-modules',
      partialize: (state) => ({
        modules: state.modules,
      }),
    },
  ),
);

// ── Profile Store ──
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      isInitialized: false,

      loadProfile: async () => {
        set({ isLoading: true });
        try {
          // 从 CloudBase 获取当前登录用户资料
          const profile = await cloudbaseAuthService.fetchCurrentUserProfile();

          set({
            profile,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          console.error('Failed to load profile:', error);
          set({ isLoading: false, isInitialized: true });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        set({ isLoading: true });
        try {
          const result = await cloudbaseAuthService.updateCurrentUserProfile(updates);
          if (!result.success) {
            throw new Error(result.error || '更新失败');
          }
          // 重新获取最新资料
          const profile = await cloudbaseAuthService.fetchCurrentUserProfile();
          set({
            profile,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to update profile:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setProfile: (profile: UserProfile) => {
        set({ profile, isInitialized: true });
      },

      clearProfile: () => {
        set({ profile: null, isInitialized: false });
      },
    }),
    {
      name: 'personal-asset-os-profile',
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);

// Initialize profile on app start
if (typeof window !== 'undefined') {
  useProfileStore.getState().loadProfile();
}
