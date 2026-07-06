import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Info,
  CheckCircle,
  Circle,
  Clock,
  FileCode,
  Copyright,
  BookmarkCheck,
  Calendar,
  User,
} from 'lucide-react'
import { mockIPs } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, StatusTag } from '@/components/ui'

const IPDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const ip = mockIPs.find((item) => item.id === id)

  if (!ip) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">未找到知识产权信息</h2>
        <Link to="/ip" className="text-blue-600 text-sm mt-2 inline-block">返回IP列表</Link>
      </div>
    )
  }

  const typeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      software: <FileCode className="h-5 w-5 text-blue-600" />,
      patent: <BookmarkCheck className="h-5 w-5 text-purple-600" />,
      trademark: <Copyright className="h-5 w-5 text-green-600" />,
    }
    return map[type] || null
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { software: '软件著作权', patent: '发明专利', trademark: '商标' }
    return map[type] || type
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label={`${ip.title} IP详情`}>
      <Breadcrumb items={[
        { label: '知识产权管理', href: '/ip' },
        { label: 'IP列表', href: '/ip' },
        { label: ip.title },
      ]} />

      {/* IP Info Card */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
              {typeIcon(ip.type)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ip.title}</h1>
              <p className="text-sm text-gray-500">{typeLabel(ip.type)}</p>
            </div>
          </div>
          <StatusTag status={ip.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">编号</div>
            <div className="font-mono text-sm font-medium text-gray-900">{ip.number}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">权利人</div>
            <div className="font-medium text-gray-900">{ip.owner}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">申请日期</div>
            <div className="font-medium">{formatDate(ip.applyDate)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">授权日期</div>
            <div className="font-medium">{ip.grantDate ? formatDate(ip.grantDate) : '待授权'}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">到期日期</div>
            <div className="font-medium">{ip.expiryDate ? formatDate(ip.expiryDate) : '--'}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">进度</div>
            <div className="font-medium text-blue-600">{ip.progress}%</div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">描述</div>
          <p className="text-sm text-gray-700">{ip.description}</p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          申请进度
        </h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" aria-hidden="true" />
          <div className="space-y-6">
            {ip.progressSteps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-10">
                <div className={`absolute left-2.5 mt-1.5 h-3 w-3 rounded-full border-2 ${
                  step.completed
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`} aria-hidden="true" />
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                  {step.date && (
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IPDetailPage
