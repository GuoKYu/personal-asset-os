/**
 * Module Service — CloudBase NoSQL data layer for user module configuration
 * 模块配置服务层
 */
import { createCrudService, generateId, now, safeAdd } from '@/lib/cloudbaseCrud';

export interface ModuleConfig {
  id: string;
  key: string;        // e.g. 'finance', 'insurance', 'ip'
  name: string;        // display name
  description: string;
  icon: string;        // Lucide icon name, e.g. 'Briefcase'
  enabled: boolean;
  showOnDashboard?: boolean;  // 是否在总览页面显示卡片
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

const crud = createCrudService<ModuleConfig>('modules', 'module');

/** Default modules — seeded on first visit */
const DEFAULT_MODULES: Omit<ModuleConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { key: 'dashboard', name: '工作台', description: '仪表盘首页，概览所有模块数据', icon: 'LayoutDashboard', enabled: true, showOnDashboard: true, order: 1 },
  { key: 'finance', name: '金融资产管理', description: '持仓管理、交易记录、账户管理、资产分析', icon: 'Briefcase', enabled: true, showOnDashboard: true, order: 2 },
  { key: 'insurance', name: '保险保障管理', description: '保单管理、保障缺口分析、缴费提醒', icon: 'ShieldCheck', enabled: true, showOnDashboard: true, order: 3 },
  { key: 'ip', name: '知识产权管理', description: '软著/专利/商标管理、证书荣誉墙', icon: 'Award', enabled: true, showOnDashboard: true, order: 4 },
  { key: 'growth', name: '成长管理', description: '成长路径、学习计划跟踪', icon: 'TrendingUp', enabled: true, showOnDashboard: false, order: 5 },
  { key: 'health', name: '健康管理', description: '家庭成员健康信息、体检记录跟踪', icon: 'Heart', enabled: true, showOnDashboard: true, order: 6 },
  { key: 'documents', name: '文档管理', description: '文档分类存储、检索与下载', icon: 'FileText', enabled: true, showOnDashboard: false, order: 7 },
  { key: 'projects', name: '项目管理', description: '个人和工作项目进度跟踪', icon: 'FolderKanban', enabled: false, showOnDashboard: false, order: 8 },
  { key: 'settings', name: '系统设置', description: '模块配置、字段自定义与数据管理', icon: 'Settings', enabled: true, showOnDashboard: false, order: 9 },
];

export const moduleService = {
  async getAll(): Promise<ModuleConfig[]> {
    return crud.getAll();
  },

  async getEnabled(): Promise<ModuleConfig[]> {
    const all = await crud.getAll();
    return all.filter(m => m.enabled).sort((a, b) => a.order - b.order);
  },

  async toggleEnabled(key: string): Promise<void> {
    const all = await crud.getAll();
    const item = all.find(m => m.key === key);
    if (!item) return;
    await crud.update(item.id, { enabled: !item.enabled } as any);
  },

  async updateOrder(key: string, order: number): Promise<void> {
    const all = await crud.getAll();
    const item = all.find(m => m.key === key);
    if (!item) return;
    await crud.update(item.id, { order } as any);
  },

  async toggleDashboard(key: string): Promise<void> {
    const all = await crud.getAll();
    const item = all.find(m => m.key === key);
    if (!item) return;
    await crud.update(item.id, { showOnDashboard: !item.showOnDashboard } as any);
  },

  async addModule(data: Omit<ModuleConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = generateId('module');
    const ts = now();
    await safeAdd('modules', {
      ...data,
      id,
      createdAt: ts,
      updatedAt: ts,
    });
  },

  /** Re-seed default modules if collection is empty */
  async ensureDefaults(): Promise<void> {
    const existing = await crud.getAll();
    if (existing.length > 0) return;

    const ts = now();
    for (const mod of DEFAULT_MODULES) {
      await safeAdd('modules', {
        key: mod.key,
        name: mod.name,
        description: mod.description,
        icon: mod.icon,
        enabled: mod.enabled,
        showOnDashboard: mod.showOnDashboard ?? true,
        order: mod.order,
        id: generateId('module'),
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
