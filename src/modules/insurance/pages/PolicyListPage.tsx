import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ShieldCheck, Calendar, DollarSign, Users } from 'lucide-react'
import { mockPolicies } from '@/db/mock-data'
import { formatCurrency, formatDate, formatPolicyType, formatStatus } from '@/utils/format'
import { Breadcrumb, SearchInput, FilterSelect, StatusTag, DataGradeTag } from '@/components/ui'

const PolicyListPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const filtered = useMemo(() => {
    return mockPolicies.filter((p) => {
      if (search && !p.name.includes(search) && !p.company.includes(search)) return false
      if (typeFilter && p.type !== typeFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      return true
    })
  }, [search, typeFilter, statusFilter])

  const totalPremium = filtered.reduce((s, p) => s + p.premium, 0)
  const totalCoverage = filtered.reduce((s, p) => s + p.coverageAmount, 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="保单列表">
      <Breadcrumb items={[
        { label: '保险保障管理', href: '/insurance' },
        { label: '保单列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">保单列表</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} 张保单 · 年保费 {formatCurrency(totalPremium)} · 总保额 {formatCurrency(totalCoverage, true)}
          </p>
        </div>
        <Link
          to="/insurance/policies/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新增保单"
        >
          <Plus className="h-4 w-4" />
          新增保单
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索保单名称或保险公司..." />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="全部类型"
          options={[
            { value: 'health', label: '医疗险' },
            { value: 'life', label: '寿险' },
            { value: 'accident', label: '意外险' },
            { value: 'critical', label: '重疾险' },
            { value: 'property', label: '财产险' },
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
          options={[
            { value: 'active', label: '有效' },
            { value: 'pending', label: '待生效' },
            { value: 'expired', label: '已过期' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-2 text-sm ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
            aria-label="卡片视图"
          >
            卡片
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
            aria-label="表格视图"
          >
            表格
          </button>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((policy) => {
            const typeInfo = formatPolicyType(policy.type)
            return (
              <Link
                key={policy.id}
                to={`/insurance/policies/${policy.id}`}
                className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                aria-label={`${policy.name} 详情`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{policy.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{policy.company}</p>
                  </div>
                  <StatusTag status={policy.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium bg-gray-50 ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-xs text-gray-400">#{policy.policyNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">被保险人</span>
                    <div className="font-medium text-gray-900">{policy.insuredPerson}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">保额</span>
                    <div className="font-medium text-gray-900">{formatCurrency(policy.coverageAmount, true)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">年保费</span>
                    <div className="font-medium text-gray-900">{formatCurrency(policy.premium)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">下次缴费</span>
                    <div className="font-medium text-gray-900">{formatDate(policy.nextPaymentDate)}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="保单列表表格">
              <thead>
                <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">保单名称</th>
                  <th className="px-4 py-3 text-left font-medium">保险公司</th>
                  <th className="px-4 py-3 text-left font-medium">保单号</th>
                  <th className="px-4 py-3 text-left font-medium">被保险人</th>
                  <th className="px-4 py-3 text-center font-medium">类型</th>
                  <th className="px-4 py-3 text-right font-medium">保额</th>
                  <th className="px-4 py-3 text-right font-medium">保费</th>
                  <th className="px-4 py-3 text-right font-medium">下次缴费</th>
                  <th className="px-4 py-3 text-center font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((policy) => {
                  const typeInfo = formatPolicyType(policy.type)
                  return (
                    <tr key={policy.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/insurance/policies/${policy.id}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{policy.name}</td>
                      <td className="px-4 py-3 text-gray-600">{policy.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{policy.policyNumber}</td>
                      <td className="px-4 py-3">{policy.insuredPerson}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(policy.coverageAmount, true)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(policy.premium)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{formatDate(policy.nextPaymentDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusTag status={policy.status} size="sm" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PolicyListPage
