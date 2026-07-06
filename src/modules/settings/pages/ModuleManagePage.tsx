import React, { useState } from 'react'
import {
  Briefcase,
  ShieldCheck,
  Award,
  TrendingUp,
  Heart,
  FileText,
  FolderKanban,
  Settings,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Breadcrumb } from '@/components/ui'

interface ModuleItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  order: number
}

const ModuleManagePage: React.FC = () => {
  const [modules, setModules] = useState<ModuleItem[]>([
    {
      id: 'dashboard',
      name: '工作台',
      description: '仪表盘首页，概览所有模块数据',
      icon: <Settings className="h-5 w-5 text-blue-600" />,
      enabled: true,
      order: 1,
    },
    {
      id: 'finance',
      name: '金融资产管理',
      description: '持仓管理、交易记录、账户管理、资产分析',
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      enabled: true,
      order: 2,
    },
    {
      id: 'insurance',
      name: '保险保障管理',
      description: '保单管理、保障缺口分析、缴费提醒',
      icon: <ShieldCheck className="h-5 w-5 text-indigo-600" />,
      enabled: true,
      order: 3,
    },
    {
      id: 'ip',
      name: '知识产权管理',
      description: '软著/专利/商标管理、证书荣誉墙',
      icon: <Award className="h-5 w-5 text-purple-600" />,
      enabled: true,
      order: 4,
    },
    {
      id: 'growth',
      name: '成长管理',
      description: '成长路径、学习计划跟踪',
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      enabled: true,
      order: 5,
    },
    {
      id: 'health',
      name: '健康管理',
      description: '家庭成员健康信息、体检记录跟踪',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      enabled: true,
      order: 6,
    },
    {
      id: 'documents',
      name: '文档管理',
      description: '文档分类存储、检索与下载',
      icon: <FileText className="h-5 w-5 text-cyan-600" />,
      enabled: true,
      order: 7,
    },
    {
      id: 'projects',
      name: '项目管理',
      description: '个人和工作项目进度跟踪',
      icon: <FolderKanban className="h-5 w-5 text-yellow-600" />,
      enabled: false,
      order: 8,
    },
  ])

  const toggleModule = (id: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)))
  }

  const enabledCount = modules.filter((m) => m.enabled).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-6" aria-label="模块管理">
      <Breadcrumb items={[
        { label: '系统设置', href: '/settings' },
        { label: '模块管理' },
      ]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">模块管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          已启用 {enabledCount}/{modules.length} 个模块，拖拽可调整排序
        </p>
      </div>

      <div className="space-y-3">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((mod) => (
            <div
              key={mod.id}
              className={`rounded-xl border shadow-sm p-4 flex items-center gap-4 transition-colors ${
                mod.enabled ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-70'
              }`}
              aria-label={`${mod.name} 模块`}
            >
              {/* Drag handle */}
              <div className="cursor-grab text-gray-300 hover:text-gray-500" aria-label="拖拽排序">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Icon */}
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                {mod.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{mod.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {mod.enabled ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="focus:outline-none"
                aria-label={`${mod.enabled ? '禁用' : '启用'} ${mod.name}`}
                aria-pressed={mod.enabled}
              >
                {mod.enabled ? (
                  <ToggleRight className="h-6 w-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-300" />
                )}
              </button>
            </div>
          ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          提示：禁用的模块将在侧边栏中隐藏，但已录入的数据不会被删除。需要时可重新启用。
        </p>
      </div>
    </div>
  )
}

export default ModuleManagePage
