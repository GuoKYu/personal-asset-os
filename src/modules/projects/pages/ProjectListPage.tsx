import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Calendar,
  CheckCircle,
  Target,
  Clock,
  Search,
  BarChart3,
  FolderKanban,
  Edit,
  Trash2,
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { DataGrade } from '@/types'
import type { Project, ProjectStatus, ProjectPriority } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'
import EntityFormModal, { type FormField } from '@/components/EntityFormModal'

const projectFormFields: FormField[] = [
  { key: 'title', label: '项目名称', type: 'text', required: true, placeholder: '项目名称' },
  { key: 'type', label: '类型', type: 'select', required: true, options: [
    { value: 'personal', label: '个人项目' },
    { value: 'work', label: '工作项目' },
    { value: 'study', label: '学习项目' },
    { value: 'investment', label: '投资项目' },
  ], defaultValue: 'personal' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'planning', label: '规划中' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'paused', label: '已暂停' },
    { value: 'cancelled', label: '已取消' },
  ], defaultValue: 'planning' },
  { key: 'priority', label: '优先级', type: 'select', options: [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' },
  ], defaultValue: 'medium' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '项目描述' },
  { key: 'startDate', label: '开始日期', type: 'date' },
  { key: 'targetDate', label: '目标日期', type: 'date' },
  { key: 'budget', label: '预算', type: 'number', placeholder: '预算金额', min: 0, step: 100 },
  { key: 'progress', label: '进度(%)', type: 'number', min: 0, max: 100, step: 5, defaultValue: 0 },
  { key: 'tags', label: '标签', type: 'tags', placeholder: '输入标签后回车' },
]

const statusConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  planning: { label: '规划中', color: 'text-amber-600', bg: 'bg-amber-500/10', bar: 'linear-gradient(90deg, var(--td-warning-color), var(--td-warning-color))' },
  'in_progress': { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-500/10', bar: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-500/10', bar: 'linear-gradient(90deg, var(--td-success-color), var(--td-success-color))' },
  paused: { label: '已暂停', color: 'text-gray-600', bg: 'bg-gray-500/10', bar: 'linear-gradient(90deg, var(--td-text-color-placeholder), var(--td-text-color-placeholder))' },
  cancelled: { label: '已取消', color: 'text-red-600', bg: 'bg-red-500/10', bar: 'linear-gradient(90deg, var(--td-error-color), var(--td-error-color))' },
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    personal: '个人项目',
    work: '工作项目',
    study: '学习项目',
    investment: '投资项目',
  }
  return map[type] || type
}

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const reload = async () => {
    const data = await projectService.getProjects()
    setProjects(data)
  }

  const handleAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditTarget(project)
    setModalOpen(true)
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    const base = {
      type: (data.type as string) || 'personal',
      name: (data.title as string) || '',
      dataGrade: DataGrade.L3,
      title: (data.title as string) || '',
      description: data.description as string | undefined,
      status: (data.status as ProjectStatus) || 'planning',
      priority: (data.priority as ProjectPriority) || 'medium',
      progress: (data.progress as number) || 0,
      startDate: data.startDate as string | undefined,
      targetDate: data.targetDate as string | undefined,
      budget: data.budget as number | undefined,
      tags: data.tags as string[] | undefined,
      milestones: [],
    }
    if (editTarget) {
      await projectService.updateProject(editTarget.id, base)
    } else {
      await projectService.addProject(base)
    }
    await reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return
    await projectService.deleteProject(id)
    await reload()
  }

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q)) return false
      }
      if (typeFilter && p.type !== typeFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [projects, search, typeFilter, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-container))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={35} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                项目管理
                <span className="gradient-text ml-2">Projects</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                {filtered.length} 个项目 · 进行中 {filtered.filter(p => p.status === 'in_progress').length} 个
              </p>
            </div>
            <button
              onClick={() => handleAdd()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
            >
              <Plus className="h-4 w-4" />
              新建项目
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 anim-fade-in-up">
              <div className="flex items-center gap-2 mb-1">
                <FolderKanban className="h-4 w-4 text-blue-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>总项目</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{filtered.length}</div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>已完成</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {filtered.filter(p => p.status === 'completed').length}
              </div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>进行中</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {filtered.filter(p => p.status === 'in_progress').length}
              </div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>规划中</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {filtered.filter(p => p.status === 'planning').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目名称..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border"
            style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
        >
          <option value="">全部类型</option>
          <option value="personal">个人项目</option>
          <option value="work">工作项目</option>
          <option value="study">学习项目</option>
          <option value="investment">投资项目</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
        >
          <option value="">全部状态</option>
          <option value="planning">规划中</option>
          <option value="in-progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="paused">已暂停</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((project, index) => {
          const sc = statusConfig[project.status] || statusConfig['in_progress']
          const milestones = project.milestones || []
          const doneCount = milestones.filter((m) => m.completed).length
          const rate = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : project.progress
          return (
            <div
              key={project.id}
              className="glass-card p-5 anim-fade-in-up transition-all duration-300 hover:scale-[1.01] hover:shadow-lg group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold truncate" style={{ color: 'var(--pao-text-primary)' }}>
                      {project.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs rounded font-medium" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                      {typeLabel(project.type)}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--pao-text-secondary)' }}>
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>
                    {sc.label}
                  </span>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 text-red-500 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--pao-bg-hover)' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--pao-text-secondary)' }}>
                  <span>完成进度</span>
                  <span>{doneCount}/{milestones.length} 里程碑 · {rate}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--pao-bg-hover)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, background: sc.bar }} />
                </div>
              </div>

              {/* Milestones Preview */}
              {milestones.length > 0 && (
                <div className="space-y-1 mb-3">
                  {milestones.slice(0, 3).map((ms, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`h-3 w-3 ${ms.completed ? 'text-green-500' : 'opacity-30'}`} style={!ms.completed ? { color: 'var(--pao-text-secondary)' } : {}} />
                      <span style={{ color: ms.completed ? 'var(--pao-text-secondary)' : 'var(--pao-text-primary)' }} className={ms.completed ? 'line-through opacity-60' : ''}>
                        {ms.title}
                      </span>
                      {ms.completed && ms.completedDate && (
                        <span className="ml-auto opacity-50">{formatDate(ms.completedDate)}</span>
                      )}
                    </div>
                  ))}
                  {milestones.length > 3 && (
                    <div className="text-xs pl-5" style={{ color: 'var(--pao-text-secondary)' }}>...还有 {milestones.length - 3} 个里程碑</div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                  <Calendar className="h-3 w-3" />
                  <span>{project.startDate ? formatDate(project.startDate) : '--'}</span>
                  {project.targetDate && (
                    <>
                      <span className="mx-1">→</span>
                      <span>{formatDate(project.targetDate)}</span>
                    </>
                  )}
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex gap-1">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无匹配的项目</p>
        </div>
      )}

      {/* CRUD Modal */}
      <EntityFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editTarget ? '编辑项目' : '新建项目'}
        subtitle={editTarget ? '修改项目信息' : '创建新的项目'}
        fields={projectFormFields}
        initialData={editTarget ? (editTarget as unknown as Record<string, unknown>) : undefined}
        accentGradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
      />
    </div>
  )
}

export default ProjectListPage
