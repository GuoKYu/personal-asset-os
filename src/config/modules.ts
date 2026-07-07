/* ============================================
   personal-asset-os — Module Configuration
   ============================================ */

import type { ModuleConfig } from '../types';

export interface ModuleDefinition {
  id: string;
  name: string;
  icon: string;         // lucide-react icon name
  route: string;
  enabled: boolean;
  sortOrder: number;
  description?: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    name: '总览',
    icon: 'LayoutDashboard',
    route: '/',
    enabled: true,
    sortOrder: 1,
    description: '资产全景概览与核心指标',
  },
  {
    id: 'growth',
    name: '成长',
    icon: 'Rocket',
    route: '/growth',
    enabled: true,
    sortOrder: 2,
    description: '成长路径与学习计划管理',
  },
  {
    id: 'ip',
    name: '知识产权',
    icon: 'Shield',
    route: '/ip',
    enabled: true,
    sortOrder: 3,
    description: '专利、商标、著作权管理',
  },
  {
    id: 'finance',
    name: '金融',
    icon: 'TrendingUp',
    route: '/finance',
    enabled: true,
    sortOrder: 4,
    description: '账户、持仓、交易与资产分析',
  },
  {
    id: 'insurance',
    name: '保险',
    icon: 'HeartPulse',
    route: '/insurance',
    enabled: true,
    sortOrder: 5,
    description: '保单管理与保障分析',
  },
  {
    id: 'health',
    name: '健康',
    icon: 'Activity',
    route: '/health',
    enabled: true,
    sortOrder: 6,
    description: '家庭成员与健康档案',
  },
  {
    id: 'documents',
    name: '文档',
    icon: 'FileText',
    route: '/documents',
    enabled: true,
    sortOrder: 7,
    description: '文档与证书归档管理',
  },
  {
    id: 'projects',
    name: '项目',
    icon: 'FolderKanban',
    route: '/projects',
    enabled: true,
    sortOrder: 8,
    description: '项目进度与里程碑追踪',
  },
  {
    id: 'settings',
    name: '设置',
    icon: 'Settings',
    route: '/settings',
    enabled: true,
    sortOrder: 9,
    description: '模块配置、字段自定义与数据管理',
  },
];

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getModuleByRoute(route: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.route === route);
}

export function getEnabledModules(): ModuleDefinition[] {
  return MODULES.filter((m) => m.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getDefaultModuleConfigs(): ModuleConfig[] {
  return MODULES.map((m) => ({
    id: `cfg_${m.id}`,
    moduleId: m.id,
    enabled: m.enabled,
    sortOrder: m.sortOrder,
    customConfig: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
