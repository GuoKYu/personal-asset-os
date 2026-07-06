import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Calendar,
  CheckCircle,
  Target,
  Clock,
  Tag,
  BarChart3,
} from 'lucide-react'
import { mockProjects } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, StatusTag, FilterSelect, SearchInput } from '@/components/ui'

const ProjectListPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      if (search && !p.name.includes(search) && !p.description.includes(search)) return false
      if (typeFilter && p.type !== typeFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [search, typeFilter, statusFilter])

  const completionRate = useMemo(() => {
    return mockProjects.map((p) => {
      const done = p.milestones.filter((m) => m.completed).length
      return { ...p, done, rate: p.milestones.length > 0 ? Math.round((done / p.milestones.length) * 100) : 0 }
    })
  }, [])

  const filteredWithRate = useMemo(() => {
    const ids = new Set(filtered.map((p) => p.id))
    return completionRate.filter((p) => ids.has(p.id))
  }, [filtered, completionRate])

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      personal: '个人项目',
      work: '工作项目',
      study: '学习项目',
      investment: '投资项目',
    }
    return map[type] || type
  }

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      personal: 'bg-blue-50 text-blue-600',
      work: 'bg-purple-50 text-purple-600',
      study: 'bg-green-50 text-green-600',
      investment: 'bg-orange-50 text-orange-600',
    }
    return map[type] || 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="项目管理">
      <Breadcrumb items={[
        { label: '项目管理', href: '/projects' },
        { label: '项目列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目列表</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} 个项目</p>
        </div>
        <Link
          to="/projects/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新建项目"
        >
          <Plus className="h-4 w-4" />
          新建项目
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索项目名称..." />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="全部类型"
          options={[
            { value: 'personal', label: '个人项目' },
            { value: 'work', label: '工作项目' },
            { value: 'study', label: '学习项目' },
            { value: 'investment', label: '投资项目' },
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
          options={[
            { value: 'planning', label: '规划中' },
            { value: 'in-progress', label: '进行中' },
            { value: 'completed', label: '已完成' },
            { value: 'paused', label: '已暂停' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWithRate.map((project) => (
          <div
            key={project.id}
            className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            aria-label={`${project.name} 项目`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{project.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${typeColor(project.type)}`}>
                    {typeLabel(project.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
              </div>
              <StatusTag status={project.status} size="sm" />
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>完成进度</span>
                <span>{project.done}/{project.milestones.length} 里程碑</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    project.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${project.rate}%` }}
                />
              </div>
            </div>

            {/* Milestones Preview */}
            <div className="space-y-1 mb-3">
              {project.milestones.slice(0, 3).map((ms, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`h-3 w-3 ${ms.completed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={ms.completed ? 'text-gray-500 line-through' : 'text-gray-600'}>
                    {ms.title}
                  </span>
                  {ms.completed && ms.date && (
                    <span className="text-gray-400 ml-auto">{formatDate(ms.date)}</span>
                  )}
                </div>
              ))}
              {project.milestones.length > 3 && (
                <div className="text-xs text-gray-400 pl-5">...还有 {project.milestones.length - 3} 个里程碑</div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(project.startDate)}</span>
                {project.endDate && (
                  <>
                    <span className="mx-1">-</span>
                    <span>{formatDate(project.endDate)}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm">暂无匹配的项目</p>
        </div>
      )}
    </div>
  )
}

export default ProjectListPage
