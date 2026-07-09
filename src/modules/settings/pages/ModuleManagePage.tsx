import React, { useState, useEffect } from 'react'
import {
  Briefcase, ShieldCheck, Award, TrendingUp, Heart, FileText,
  FolderKanban, LayoutDashboard, Settings,
  GripVertical, ToggleLeft, ToggleRight, Eye, EyeOff, Loader2,
  Plus, PanelLeft,
} from 'lucide-react'
import { Breadcrumb } from '@/components/ui'
import { moduleService, type ModuleConfig } from '@/services/moduleService'
import EntityFormModal, { type FormField } from '@/components/EntityFormModal'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5 text-blue-600" />,
  Briefcase: <Briefcase className="h-5 w-5 text-green-600" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5 text-indigo-600" />,
  Award: <Award className="h-5 w-5 text-purple-600" />,
  TrendingUp: <TrendingUp className="h-5 w-5 text-orange-600" />,
  Heart: <Heart className="h-5 w-5 text-red-500" />,
  FileText: <FileText className="h-5 w-5 text-cyan-600" />,
  FolderKanban: <FolderKanban className="h-5 w-5 text-yellow-600" />,
}

const ModuleManagePage: React.FC = () => {
  const [modules, setModules] = useState<ModuleConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await moduleService.ensureDefaults()
        const data = await moduleService.getAll()
        setModules(data.sort((a, b) => a.order - b.order))
      } catch (err) {
        console.error('Failed to load modules:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleModule = async (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m))
    try {
      await moduleService.toggleEnabled(key)
    } catch (err) {
      console.error('Failed to toggle module:', err)
      // rollback on failure
      setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m))
    }
  }

  const toggleDashboard = async (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, showOnDashboard: !m.showOnDashboard } : m))
    try {
      await moduleService.toggleDashboard(key)
    } catch (err) {
      console.error('Failed to toggle dashboard:', err)
      setModules(prev => prev.map(m => m.key === key ? { ...m, showOnDashboard: !m.showOnDashboard } : m))
    }
  }

  const enabledCount = modules.filter(m => m.enabled).length

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--pao-primary)' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Breadcrumb items={[
        { label: '系统设置', href: '/settings' },
        { label: '模块管理' },
      ]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>模块管理</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--pao-text-secondary)' }}>
            已启用 {enabledCount}/{modules.length} 个模块
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
        >
          <Plus className="h-4 w-4" />
          新增模块
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.key}
            className="surface-card p-4 flex items-center gap-4 transition-colors"
            style={{ opacity: mod.enabled ? 1 : 0.7 }}
          >
            <div className="cursor-grab" style={{ color: 'var(--pao-text-tertiary)' }}>
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pao-bg-hover)' }}>
              {ICON_MAP[mod.icon] || <Settings className="h-5 w-5" style={{ color: 'var(--pao-text-tertiary)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--pao-text-primary)' }}>{mod.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--pao-text-tertiary)' }}>{mod.description}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleDashboard(mod.key)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
                style={{
                  background: mod.showOnDashboard ? 'var(--td-brand-color-light)' : 'var(--pao-bg-hover)',
                  color: mod.showOnDashboard ? 'var(--pao-primary)' : 'var(--pao-text-tertiary)',
                }}
                title={mod.showOnDashboard ? '已显示在总览' : '未在总览显示'}
              >
                <PanelLeft className="h-3.5 w-3.5" />
                总览{mod.showOnDashboard ? '' : '隐藏'}
              </button>
              {mod.enabled ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4" style={{ color: 'var(--pao-text-tertiary)' }} />
              )}
            </div>
            <button
              onClick={() => toggleModule(mod.key)}
              className="focus:outline-none"
              aria-label={`${mod.enabled ? '禁用' : '启用'} ${mod.name}`}
            >
              {mod.enabled ? (
                <ToggleRight className="h-6 w-6" style={{ color: 'var(--pao-primary)' }} />
              ) : (
                <ToggleLeft className="h-6 w-6" style={{ color: 'var(--pao-text-tertiary)' }} />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--td-brand-color-light)' }}>
        <p className="text-sm" style={{ color: 'var(--pao-primary)' }}>
          提示：禁用的模块将在侧边栏中隐藏，但已录入的数据不会被删除。需要时可重新启用。<br />
          「总览显示」控制模块是否出现在 Dashboard 首页。
        </p>
      </div>

      <EntityFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={async (data) => {
          await moduleService.addModule({
            key: (data.key as string).toLowerCase().replace(/\s+/g, '_'),
            name: data.name as string,
            description: (data.description as string) || '',
            icon: data.icon as string,
            enabled: true,
            showOnDashboard: false,
            order: modules.length + 1,
          });
          const updated = await moduleService.getAll();
          setModules(updated.sort((a, b) => a.order - b.order));
        }}
        title="新增模块"
        subtitle="扩展系统功能，添加自定义模块或子系统"
        accentGradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        fields={[
          { key: 'name', label: '模块名称', type: 'text', required: true, placeholder: '如：投资研究' },
          { key: 'key', label: '模块标识', type: 'text', required: true, placeholder: '如：investment_research（拼音）' },
          { key: 'description', label: '模块描述', type: 'textarea', placeholder: '简要描述这个模块的功能...' },
          { key: 'icon', label: 'Lucide 图标名', type: 'text', placeholder: '如：BarChart3 / Brain / Target' },
        ]}
      />
    </div>
  )
}

export default ModuleManagePage
