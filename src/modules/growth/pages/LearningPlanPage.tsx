import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Clock, Target, CheckCircle } from 'lucide-react'
import { mockLearningPlans } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, SearchInput, FilterSelect, StatusTag, Pagination as Pager } from '@/components/ui'

const LearningPlanPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    return mockLearningPlans.filter((p) => {
      if (search && !p.title.includes(search) && !p.category.includes(search)) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="学习计划">
      <Breadcrumb items={[
        { label: '成长管理', href: '/growth' },
        { label: '学习计划' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学习计划</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} 个学习计划</p>
        </div>
        <Link
          to="/growth/learning/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新增学习计划"
        >
          <Plus className="h-4 w-4" />
          新增计划
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索计划名称或分类..." />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
          options={[
            { value: 'in-progress', label: '进行中' },
            { value: 'planned', label: '计划中' },
            { value: 'completed', label: '已完成' },
            { value: 'dropped', label: '已放弃' },
          ]}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paged.map((plan) => (
          <div key={plan.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{plan.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{plan.category}</p>
              </div>
              <StatusTag status={plan.status} size="sm" />
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>学习进度</span>
                <span>{plan.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    plan.status === 'completed' ? 'bg-green-500' :
                    plan.status === 'dropped' ? 'bg-gray-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{plan.platform}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{plan.completedHours}/{plan.estimatedHours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{formatDate(plan.dueDate)}</span>
              </div>
            </div>

            {plan.notes && (
              <p className="text-xs text-gray-400 mt-3 line-clamp-2">{plan.notes}</p>
            )}
          </div>
        ))}
      </div>

      <Pager current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
    </div>
  )
}

export default LearningPlanPage
