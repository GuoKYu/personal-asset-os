import React from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { mockGrowthPaths } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb } from '@/components/ui'

const GrowthPathPage: React.FC = () => {
  const typeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      promotion: <TrendingUp className="h-5 w-5 text-blue-600" />,
      'job-change': <Briefcase className="h-5 w-5 text-purple-600" />,
      certification: <Award className="h-5 w-5 text-yellow-600" />,
      achievement: <Star className="h-5 w-5 text-orange-600" />,
      education: <GraduationCap className="h-5 w-5 text-green-600" />,
    }
    return map[type] || null
  }

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      promotion: 'border-blue-200 bg-blue-50',
      'job-change': 'border-purple-200 bg-purple-50',
      certification: 'border-yellow-200 bg-yellow-50',
      achievement: 'border-orange-200 bg-orange-50',
      education: 'border-green-200 bg-green-50',
    }
    return map[type] || 'border-gray-200 bg-gray-50'
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      promotion: '晋升',
      'job-change': '跳槽',
      certification: '证书',
      achievement: '成就',
      education: '教育',
    }
    return map[type] || type
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label="成长路径">
      <Breadcrumb items={[
        { label: '成长管理', href: '/growth' },
        { label: '成长路径' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成长路径</h1>
          <p className="text-sm text-gray-500 mt-1">{mockGrowthPaths.length} 个关键里程碑</p>
        </div>
        <Link
          to="/growth/paths/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新增里程碑"
        >
          <Plus className="h-4 w-4" />
          新增里程碑
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" aria-hidden="true" />
        <div className="space-y-6">
          {mockGrowthPaths.map((path, index) => (
            <div key={path.id} className="relative pl-16">
              {/* Timeline dot */}
              <div
                className={`absolute left-4 mt-1 h-5 w-5 rounded-full border-2 bg-white z-10 ${typeColor(path.type)} flex items-center justify-center`}
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
              </div>

              {/* Timeline connector line */}
              {index < mockGrowthPaths.length - 1 && (
                <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gray-100" aria-hidden="true" />
              )}

              <div className={`rounded-xl border p-5 shadow-sm ${typeColor(path.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {typeIcon(path.type)}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{path.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(path.date)}
                        </span>
                        <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-white border border-gray-200 text-gray-600">
                          {typeLabel(path.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  影响: {path.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GrowthPathPage
