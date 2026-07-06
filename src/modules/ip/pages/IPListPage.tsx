import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileCode, Copyright, BookmarkCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { mockIPs } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, SearchInput, StatusTag, FilterSelect } from '@/components/ui'

type TabKey = 'all' | 'software' | 'patent' | 'trademark'

const IPListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'software', label: '软著' },
    { key: 'patent', label: '专利' },
    { key: 'trademark', label: '商标' },
  ]

  const filtered = useMemo(() => {
    return mockIPs.filter((ip) => {
      if (activeTab !== 'all' && ip.type !== activeTab) return false
      if (search && !ip.title.includes(search) && !ip.number.includes(search)) return false
      if (statusFilter && ip.status !== statusFilter) return false
      return true
    })
  }, [activeTab, search, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { applied: 0, reviewing: 0, granted: 0, rejected: 0, expired: 0 }
    filtered.forEach((ip) => { counts[ip.status] = (counts[ip.status] || 0) + 1 })
    return counts
  }, [filtered])

  const typeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      software: <FileCode className="h-4 w-4 text-blue-600" />,
      patent: <BookmarkCheck className="h-4 w-4 text-purple-600" />,
      trademark: <Copyright className="h-4 w-4 text-green-600" />,
    }
    return map[type] || null
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { software: '软件著作权', patent: '发明专利', trademark: '商标' }
    return map[type] || type
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="知识产权列表">
      <Breadcrumb items={[
        { label: '知识产权管理', href: '/ip' },
        { label: 'IP列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识产权</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} 项 · 已授权 {statusCounts.granted || 0} 项 · 申请中 {statusCounts.applied || 0} 项
          </p>
        </div>
        <Link
          to="/ip/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新增知识产权"
        >
          <Plus className="h-4 w-4" />
          新增IP
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={`过滤: ${tab.label}`}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索标题或编号..." />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
          options={[
            { value: 'applied', label: '申请中' },
            { value: 'reviewing', label: '审查中' },
            { value: 'granted', label: '已授权' },
            { value: 'rejected', label: '被驳回' },
            { value: 'expired', label: '已过期' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="知识产权列表表格">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">标题</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-left font-medium">编号</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-right font-medium">申请日期</th>
                <th className="px-4 py-3 text-right font-medium">授权日期</th>
                <th className="px-4 py-3 text-right font-medium">到期日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ip) => (
                <tr
                  key={ip.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/ip/${ip.id}`}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/ip/${ip.id}` }}
                  aria-label={`查看 ${ip.title} 详情`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{ip.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ip.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      {typeIcon(ip.type)}
                      <span className="text-gray-600">{typeLabel(ip.type)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{ip.number}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusTag status={ip.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{formatDate(ip.applyDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{ip.grantDate ? formatDate(ip.grantDate) : '--'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{ip.expiryDate ? formatDate(ip.expiryDate) : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default IPListPage
