import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Target,
  Clock,
  ArrowRight,
  Rocket,
  CheckCircle,
} from 'lucide-react'
import { growthService } from '@/services/growthService'
import type { GrowthPath } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: '进行中', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  completed: { label: '已完成', color: 'text-green-600', bg: 'bg-green-500/10' },
  paused: { label: '已暂停', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  abandoned: { label: '已放弃', color: 'text-gray-600', bg: 'bg-gray-500/10' },
}

const GrowthPathPage: React.FC = () => {
  const navigate = useNavigate()
  const [paths, setPaths] = useState<GrowthPath[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPaths = async () => {
      try {
        const data = await growthService.getGrowthPaths()
        setPaths(data)
      } catch (error) {
        console.error('Failed to load growth paths:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPaths()
  }, [])

  const avgProgress = paths.length > 0
    ? Math.round(paths.reduce((sum, p) => sum + p.progress, 0) / paths.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.08))',
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
                成长路径
                <span className="gradient-text ml-2">Growth Journey</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                {paths.length} 个成长里程碑 · 平均进度 {avgProgress}%
              </p>
            </div>
            <button
              onClick={() => navigate('/growth/paths/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}
            >
              <Plus className="h-4 w-4" />
              新增里程碑
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 anim-fade-in-up">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-blue-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>进行中</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {paths.filter((p) => p.status === 'active').length}
              </div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>已完成</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {paths.filter((p) => p.status === 'completed').length}
              </div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>平均进度</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{avgProgress}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'var(--pao-border)' }} aria-hidden="true" />
        <div className="space-y-5">
          {paths.map((path, index) => {
            const sc = statusConfig[path.status] || statusConfig.active
            return (
              <div
                key={path.id}
                className="relative pl-16 anim-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-3.5 mt-1 h-5 w-5 rounded-full border-2 z-10 flex items-center justify-center"
                  style={{
                    background: path.status === 'completed' ? '#10b981' : 'var(--pao-bg-card)',
                    borderColor: path.status === 'completed' ? '#10b981' : 'var(--pao-border)',
                  }}
                >
                  {path.status === 'completed' && <CheckCircle className="h-3 w-3 text-white" />}
                </div>

                <div className="glass-card p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--pao-text-primary)' }}>
                        {path.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--pao-text-secondary)' }}>
                          <Clock className="h-3 w-3" />
                          {path.startDate ? formatDate(path.startDate) : '--'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-30" style={{ color: 'var(--pao-text-secondary)' }} />
                  </div>

                  {path.description && (
                    <p className="text-sm mb-3" style={{ color: 'var(--pao-text-secondary)' }}>
                      {path.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--pao-text-secondary)' }}>
                      <span>进度</span>
                      <span className="font-medium">{path.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--pao-bg-hover)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${path.progress}%`,
                          background: path.status === 'completed'
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                    {path.careerStage && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {path.careerStage}
                      </span>
                    )}
                    {path.targetRole && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {path.targetRole}
                      </span>
                    )}
                    {path.targetDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        目标: {formatDate(path.targetDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {paths.length === 0 && (
        <div className="text-center py-20">
          <Rocket className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无成长路径，开始记录你的成长吧</p>
        </div>
      )}
    </div>
  )
}

export default GrowthPathPage
