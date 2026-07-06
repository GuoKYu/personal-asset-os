import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Download,
  LayoutGrid,
  List,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { mockHoldings, type Holding } from '@/db/mock-data'
import { formatCurrency, formatPercent } from '@/utils/format'
import { Breadcrumb, SearchInput, FilterSelect, Pagination, DataGradeTag, StatusTag } from '@/components/ui'

const HoldingListPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    return mockHoldings.filter((h) => {
      if (search && !h.symbol.toLowerCase().includes(search.toLowerCase()) && !h.name.includes(search)) return false
      if (marketFilter && h.market !== marketFilter) return false
      if (statusFilter && h.status !== statusFilter) return false
      return true
    })
  }, [search, marketFilter, statusFilter])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalPnl = filtered.reduce((sum, h) => sum + (h.currentPrice - h.costPrice) * h.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="持仓列表">
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '持仓列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">持仓列表</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {filtered.length} 个持仓，总盈亏{' '}
            <span className={totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            aria-label="导出数据"
          >
            <Download className="h-4 w-4" />
            导出
          </button>
          <Link
            to="/finance/holdings/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            aria-label="新增持仓"
          >
            <Plus className="h-4 w-4" />
            新增持仓
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索标的代码或名称..." />
        <FilterSelect
          value={marketFilter}
          onChange={setMarketFilter}
          placeholder="全部市场"
          options={[
            { value: '美股', label: '美股' },
            { value: 'A股', label: 'A股' },
            { value: '港股', label: '港股' },
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="全部状态"
          options={[
            { value: 'holding', label: '持仓中' },
            { value: 'watching', label: '观察中' },
            { value: 'sold', label: '已卖出' },
          ]}
        />
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="表格视图"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="卡片视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="持仓列表表格">
              <thead>
                <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">标的代码</th>
                  <th className="px-4 py-3 text-left font-medium">名称</th>
                  <th className="px-4 py-3 text-left font-medium">市场</th>
                  <th className="px-4 py-3 text-right font-medium">持仓数量</th>
                  <th className="px-4 py-3 text-right font-medium">成本价</th>
                  <th className="px-4 py-3 text-right font-medium">当前价</th>
                  <th className="px-4 py-3 text-right font-medium">盈亏</th>
                  <th className="px-4 py-3 text-right font-medium">仓位占比</th>
                  <th className="px-4 py-3 text-right font-medium">止损价</th>
                  <th className="px-4 py-3 text-center font-medium">状态</th>
                  <th className="px-4 py-3 text-center font-medium">数据分级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((holding) => {
                  const pnl = (holding.currentPrice - holding.costPrice) * holding.quantity
                  const pnlPercent = ((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100
                  const totalValue = mockHoldings.reduce((s, h) => s + h.currentPrice * h.quantity, 0)
                  const weight = ((holding.currentPrice * holding.quantity) / totalValue) * 100
                  const nearStopLoss = holding.currentPrice <= holding.stopLossPrice * 1.08

                  return (
                    <tr
                      key={holding.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${nearStopLoss ? 'bg-orange-50/60' : ''}`}
                      onClick={() => window.location.href = `/finance/holdings/${holding.id}`}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = `/finance/holdings/${holding.id}` }}
                      aria-label={`查看 ${holding.symbol} 详情`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{holding.symbol}</td>
                      <td className="px-4 py-3 text-gray-700">{holding.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                          {holding.market}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{holding.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{formatCurrency(holding.costPrice)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(holding.currentPrice)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}</div>
                        <div className="text-xs">{formatPercent(pnlPercent, true)}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{weight.toFixed(1)}%</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${nearStopLoss ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        <span className="inline-flex items-center gap-1">
                          {nearStopLoss && <AlertTriangle className="h-3 w-3" />}
                          {formatCurrency(holding.stopLossPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusTag status={holding.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DataGradeTag grade={holding.dataGrade} size="sm" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3">
            <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((holding) => {
            const pnl = (holding.currentPrice - holding.costPrice) * holding.quantity
            const pnlPercent = ((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100
            const nearStopLoss = holding.currentPrice <= holding.stopLossPrice * 1.08

            return (
              <Link
                key={holding.id}
                to={`/finance/holdings/${holding.id}`}
                className={`rounded-xl bg-white border shadow-sm p-5 hover:shadow-md transition-shadow ${nearStopLoss ? 'border-orange-300' : 'border-gray-100'}`}
                aria-label={`${holding.symbol} 详情`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">{holding.symbol}</span>
                    <span className="text-sm text-gray-500 ml-2">{holding.name}</span>
                  </div>
                  <StatusTag status={holding.status} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">市值</span>
                    <div className="font-medium tabular-nums text-gray-900">
                      {formatCurrency(holding.currentPrice * holding.quantity)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">盈亏</span>
                    <div className={`font-medium tabular-nums ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">成本价</span>
                    <div className="font-medium tabular-nums">{formatCurrency(holding.costPrice)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">当前价</span>
                    <div className="font-medium tabular-nums">{formatCurrency(holding.currentPrice)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs ${pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    涨幅 {formatPercent(pnlPercent, true)}
                  </span>
                  <DataGradeTag grade={holding.dataGrade} size="sm" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HoldingListPage
