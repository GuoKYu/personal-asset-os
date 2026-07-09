import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Download,
  LayoutGrid,
  List,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'
import { holdingService } from '@/services/holdingService'
import type { Holding } from '@/types'
import { formatCurrency, formatPercent } from '@/utils/format'
import { DataGradeTag, StatusTag } from '@/components/ui'
import ParticleBackground from '@/components/effects/ParticleBackground'

const HoldingListPage: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [loading, setLoading] = useState(true)

  // Load holdings from Dexie.js
  useEffect(() => {
    const loadHoldings = async () => {
      try {
        const data = await holdingService.getHoldings()
        setHoldings(data)
      } catch (error) {
        console.error('Failed to load holdings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHoldings()
  }, [])

  const filtered = useMemo(() => {
    return holdings.filter((h) => {
      if (search && !h.symbol.toLowerCase().includes(search.toLowerCase()) && !h.name.includes(search)) return false
      if (marketFilter && h.market !== marketFilter) return false
      if (statusFilter && h.status !== statusFilter) return false
      return true
    })
  }, [holdings, search, marketFilter, statusFilter])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalPnl = filtered.reduce((sum, h) => sum + (h.currentPrice - h.avgCost) * h.quantity, 0)
  const totalValue = filtered.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section with Particle Background */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-container))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={40} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                持仓管理
                <span className="gradient-text ml-2">Portfolio</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                共 {filtered.length} 个持仓，总市值 {formatCurrency(totalValue)}，总盈亏{' '}
                <span className={totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="glass-card px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: 'var(--radius-md)' }}
                aria-label="导出数据"
              >
                <Download className="h-4 w-4" style={{ color: 'var(--pao-text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--pao-text-secondary)' }}>导出</span>
              </button>
              <Link
                to="/finance/holdings/add"
                className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-primary-dark))',
                  boxShadow: '0 4px 12px var(--td-shadow-2)',
                }}
                aria-label="新增持仓"
              >
                <Plus className="h-4 w-4" />
                新增持仓
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 mb-6 anim-fade-in-up" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--pao-text-tertiary)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标的代码或名称..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-300"
              style={{
                background: 'var(--pao-divider)',
                border: '1px solid var(--pao-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--pao-text-primary)',
              }}
              aria-label="搜索持仓"
            />
          </div>

          {/* Market Filter */}
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-300"
            style={{
              background: 'var(--pao-divider)',
              border: '1px solid var(--pao-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--pao-text-secondary)',
            }}
            aria-label="筛选市场"
          >
            <option value="">全部市场</option>
            <option value="美股">美股</option>
            <option value="A股">A股</option>
            <option value="港股">港股</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-300"
            style={{
              background: 'var(--pao-divider)',
              border: '1px solid var(--pao-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--pao-text-secondary)',
            }}
            aria-label="筛选状态"
          >
            <option value="">全部状态</option>
            <option value="holding">持仓中</option>
            <option value="watching">观察中</option>
            <option value="sold">已卖出</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border" style={{ borderColor: 'var(--pao-border)', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 transition-all duration-300 ${viewMode === 'table' ? 'text-white' : ''}`}
              style={{
                background: viewMode === 'table' ? 'var(--pao-primary)' : 'var(--pao-divider)',
                borderTopLeftRadius: 'var(--radius-md)',
                borderBottomLeftRadius: 'var(--radius-md)',
              }}
              aria-label="表格视图"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2.5 transition-all duration-300 ${viewMode === 'card' ? 'text-white' : ''}`}
              style={{
                background: viewMode === 'card' ? 'var(--pao-primary)' : 'var(--pao-divider)',
                borderTopRightRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)',
              }}
              aria-label="卡片视图"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--pao-primary)' }} />
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && (
        <div className="glass-card overflow-hidden anim-fade-in-up" style={{ borderRadius: 'var(--radius-lg)', animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="持仓列表表格">
              <thead>
                <tr style={{ background: 'var(--pao-divider)' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>标的</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>持仓</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>成本</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>现价</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>盈亏</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>仓位%</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>状态</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>分级</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((holding, idx) => {
                  const pnl = (holding.currentPrice - holding.avgCost) * holding.quantity
                  const pnlPercent = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100
                  const weight = totalValue > 0 ? ((holding.currentPrice * holding.quantity) / totalValue) * 100 : 0
                  const nearStopLoss = holding.stopLossPrice != null && holding.currentPrice <= holding.stopLossPrice * 1.08
                  const isPositive = pnl >= 0

                  return (
                    <tr
                      key={holding.id}
                      className="group transition-all duration-300 hover:bg-white/5"
                      style={{
                        borderBottom: '1px solid var(--pao-divider)',
                        background: nearStopLoss ? 'rgba(245,158,11,0.05)' : undefined,
                        animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/finance/holdings/${holding.id}`}
                          className="font-semibold hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--pao-text-primary)' }}
                        >
                          {holding.symbol}
                        </Link>
                        <div className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>
                          {holding.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums" style={{ color: 'var(--pao-text-secondary)' }}>
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums" style={{ color: 'var(--pao-text-secondary)' }}>
                        {formatCurrency(holding.avgCost)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                        {formatCurrency(holding.currentPrice)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        <div className="font-semibold flex items-center justify-end gap-1" style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                          {formatCurrency(Math.abs(pnl))}
                        </div>
                        <div className="text-xs" style={{ color: isPositive ? '#10B981' : '#EF4444', opacity: 0.7 }}>
                          {formatPercent(pnlPercent, true)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                        {weight.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusTag status={holding.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DataGradeTag grade={holding.dataGrade} size="sm" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--pao-divider)' }}>
            <span className="text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>
              第 {page} 页，共 {Math.ceil(filtered.length / pageSize)} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'var(--pao-divider)',
                  border: '1px solid var(--pao-border)',
                  color: 'var(--pao-text-secondary)',
                }}
              >
                上一页
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(filtered.length / pageSize)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'var(--pao-divider)',
                  border: '1px solid var(--pao-border)',
                  color: 'var(--pao-text-secondary)',
                }}
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card View */}
      {!loading && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 anim-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {paged.map((holding, idx) => {
            const pnl = (holding.currentPrice - holding.avgCost) * holding.quantity
            const pnlPercent = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100
            const nearStopLoss = holding.stopLossPrice != null && holding.currentPrice <= holding.stopLossPrice * 1.08

            return (
              <Link
                key={holding.id}
                to={`/finance/holdings/${holding.id}`}
                className="glass-card p-5 hover:scale-105 transition-all duration-300 anim-fade-in-up"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  animationDelay: `${idx * 0.05}s`,
                  borderColor: nearStopLoss ? 'rgba(245,158,11,0.5)' : 'var(--glass-border)',
                }}
                aria-label={`${holding.symbol} 详情`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold" style={{ color: 'var(--pao-text-primary)' }}>{holding.symbol}</span>
                    <span className="text-sm ml-2" style={{ color: 'var(--pao-text-tertiary)' }}>{holding.name}</span>
                  </div>
                  <StatusTag status={holding.status} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>市值</span>
                    <div className="font-medium tabular-nums" style={{ color: 'var(--pao-text-primary)' }}>
                      {formatCurrency(holding.currentPrice * holding.quantity)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>盈亏</span>
                    <div className={`font-medium tabular-nums ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>成本价</span>
                    <div className="font-medium tabular-nums" style={{ color: 'var(--pao-text-secondary)' }}>{formatCurrency(holding.avgCost)}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>当前价</span>
                    <div className="font-medium tabular-nums" style={{ color: 'var(--pao-text-primary)' }}>{formatCurrency(holding.currentPrice)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-medium ${pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
