import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Activity, TrendingUp, TrendingDown, Minus, Clock, Stethoscope, Syringe, Pill, FileText } from 'lucide-react'
import { mockHealthRecords, mockFamilyMembers } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, FilterSelect, StatusTag, SearchInput } from '@/components/ui'

const HealthRecordPage: React.FC = () => {
  const [memberFilter, setMemberFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = useMemo(() => {
    return mockHealthRecords.filter((r) => {
      if (memberFilter && r.familyMemberId !== memberFilter) return false
      if (typeFilter && r.type !== typeFilter) return false
      return true
    })
  }, [memberFilter, typeFilter])

  const recordTypeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      checkup: <Stethoscope className="h-4 w-4 text-blue-600" />,
      treatment: <Activity className="h-4 w-4 text-purple-600" />,
      medication: <Pill className="h-4 w-4 text-green-600" />,
      vaccination: <Syringe className="h-4 w-4 text-orange-600" />,
    }
    return map[type] || null
  }

  const recordTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      checkup: '体检',
      treatment: '治疗',
      medication: '用药',
      vaccination: '疫苗接种',
    }
    return map[type] || type
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <Minus className="h-3.5 w-3.5" />
      case 'attention': return <TrendingUp className="h-3.5 w-3.5" />
      case 'abnormal': return <TrendingDown className="h-3.5 w-3.5" />
      default: return null
    }
  }

  const getMemberName = (memberId: string) => {
    return mockFamilyMembers.find((m) => m.id === memberId)?.name || '未知'
  }

  const memberOptions = mockFamilyMembers.map((m) => ({ value: m.id, label: m.name }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="健康记录">
      <Breadcrumb items={[
        { label: '健康管理', href: '/health' },
        { label: '健康记录' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">健康记录</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} 条记录</p>
        </div>
        <Link
          to="/health/records/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="添加健康记录"
        >
          <Plus className="h-4 w-4" />
          添加记录
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <FilterSelect
          value={memberFilter}
          onChange={setMemberFilter}
          placeholder="全部成员"
          options={memberOptions}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="全部类型"
          options={[
            { value: 'checkup', label: '体检' },
            { value: 'treatment', label: '治疗' },
            { value: 'medication', label: '用药' },
            { value: 'vaccination', label: '疫苗接种' },
          ]}
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" aria-hidden="true" />
        <div className="space-y-4">
          {filtered.map((record) => (
            <div key={record.id} className="relative pl-16">
              <div className={`absolute left-3.5 mt-4 h-5 w-5 rounded-full border-2 bg-white z-10 ${
                record.status === 'abnormal' ? 'border-red-300' :
                record.status === 'attention' ? 'border-orange-300' : 'border-green-300'
              }`} aria-hidden="true" />

              <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {recordTypeIcon(record.type)}
                    <span className="text-xs text-gray-500">{recordTypeLabel(record.type)}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{getMemberName(record.familyMemberId)}</span>
                  </div>
                  <StatusTag status={record.status} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">指标</div>
                    <div className="text-sm font-medium text-gray-900">{record.indicator}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">检测值</div>
                    <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                      record.status === 'abnormal' ? 'text-red-600' :
                      record.status === 'attention' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {statusIcon(record.status)}
                      {record.value} {record.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">参考范围</div>
                    <div className="text-sm text-gray-600">{record.normalRange || '--'}</div>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">{record.notes}</p>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(record.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HealthRecordPage
