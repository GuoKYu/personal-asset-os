import React, { useState, useMemo, useEffect } from 'react'
import EntityFormModal, { type FormField } from '@/components/EntityFormModal'
import {
  Plus,
  BookOpen,
  Clock,
  Target,
  Search,
  GraduationCap,
} from 'lucide-react'
import { growthService } from '@/services/growthService'
import type { LearningPlan } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const statusConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  'in_progress': { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-500/10', bar: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
  planned: { label: '计划中', color: 'text-amber-600', bg: 'bg-amber-500/10', bar: 'linear-gradient(90deg, var(--td-warning-color), var(--td-warning-color))' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-500/10', bar: 'linear-gradient(90deg, var(--td-success-color), var(--td-success-color))' },
  dropped: { label: '已放弃', color: 'text-gray-600', bg: 'bg-gray-500/10', bar: 'linear-gradient(90deg, var(--td-text-color-placeholder), var(--td-text-color-placeholder))' },
}

const LearningPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<LearningPlan[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await growthService.getLearningPlans()
        setPlans(data)
      } catch (error) {
        console.error('Failed to load learning plans:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlans()
  }, [])

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q)) return false
      }
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [plans, search, statusFilter])

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                学习计划
                <span className="gradient-text ml-2">Learning Plans</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                {filtered.length} 个学习计划 · 进行中 {filtered.filter(p => p.status === 'in_progress').length} 个
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
            >
              <Plus className="h-4 w-4" />
              新增计划
            </button>
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
            placeholder="搜索计划名称..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-300"
            style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
        >
          <option value="">全部状态</option>
          <option value="in_progress">进行中</option>
          <option value="planned">计划中</option>
          <option value="completed">已完成</option>
          <option value="dropped">已放弃</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plan, index) => {
          const sc = statusConfig[plan.status] || statusConfig.planned
          return (
            <div
              key={plan.id}
              className="glass-card p-5 anim-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: 'var(--pao-text-primary)' }}>
                    {plan.title}
                  </h3>
                  {plan.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--pao-text-secondary)' }}>
                      {plan.description}
                    </p>
                  )}
                </div>
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${sc.bg} ${sc.color} flex-shrink-0 ml-2`}>
                  {sc.label}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--pao-text-secondary)' }}>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    进度
                  </span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--pao-bg-hover)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${plan.progress}%`, background: sc.bar }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{plan.resourceType || '学习'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{plan.targetDate ? formatDate(plan.targetDate) : '无截止日'}</span>
                </div>
                {plan.priority && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>优先级: {plan.priority}</span>
                  </div>
                )}
              </div>

              {plan.skillTags && plan.skillTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                  {plan.skillTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无学习计划</p>
        </div>
      )}

      <EntityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          await growthService.addLearningPlan(data as any);
          const updated = await growthService.getLearningPlans();
          setPlans(updated);
        }}
        title="新增学习计划"
        subtitle="制定学习目标，系统管理您的成长路径"
        accentGradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        fields={[
          { key: 'title', label: '计划名称', type: 'text', required: true, placeholder: '如：学习React19新特性' },
          { key: 'description', label: '描述', type: 'textarea' },
          { key: 'category', label: '分类', type: 'text', placeholder: '如：前端技术' },
          { key: 'targetDate', label: '目标日期', type: 'date' },
          { key: 'status', label: '状态', type: 'select', options: [
            { value: 'active', label: '进行中' },
            { value: 'completed', label: '已完成' },
            { value: 'paused', label: '已暂停' },
          ]},
          { key: 'progress', label: '进度', type: 'number', min: 0, max: 100, defaultValue: 0 },
        ]}
      />
    </div>
  )
}

export default LearningPlanPage
