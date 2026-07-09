import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Download,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  ArrowLeftRight,
  Filter,
  Loader2,
} from 'lucide-react'
import { transactionService } from '@/services/transactionService'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { Breadcrumb, SearchInput, FilterSelect, Pagination as Pager, StatusTag } from '@/components/ui'

const TransactionListPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await transactionService.getTransactions()
        setTransactions(data)
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const uniqueSymbols = useMemo(() => [...new Set(transactions.map((t) => t.symbol).filter(Boolean))], [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !(t.symbol?.toLowerCase().includes(search.toLowerCase())) && !(t.notes?.includes(search))) return false
      if (typeFilter && t.transactionType !== typeFilter) return false
      if (symbolFilter && t.symbol !== symbolFilter) return false
      if (dateFrom && t.tradeDate < dateFrom) return false
      if (dateTo && t.tradeDate > dateTo) return false
      return true
    })
  }, [transactions, search, typeFilter, symbolFilter, dateFrom, dateTo])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const typeIcon = (transactionType: string) => {
    const map: Record<string, React.ReactNode> = {
      buy: <ArrowDownCircle className="h-4 w-4 text-green-600" />,
      sell: <ArrowUpCircle className="h-4 w-4 text-red-600" />,
      dividend: <Gift className="h-4 w-4 text-blue-600" />,
      transfer_in: <ArrowLeftRight className="h-4 w-4 text-gray-600" />,
      transfer_out: <ArrowLeftRight className="h-4 w-4 text-gray-600" />,
    }
    return map[transactionType] || null
  }

  const typeLabel = (transactionType: string) => {
    const map: Record<string, string> = {
      buy: '买入',
      sell: '卖出',
      dividend: '分红',
      transfer_in: '转入',
      transfer_out: '转出',
      interest: '利息',
      fee: '费用',
    }
    return map[transactionType] || transactionType
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-gray-500">加载交易记录...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="交易记录列表">
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '交易记录' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交易记录</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filtered.length} 条交易记录</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            aria-label="导出交易记录"
          >
            <Download className="h-4 w-4" />
            导出
          </button>
          <Link
            to="/finance/transactions/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            aria-label="新增交易"
          >
            <Plus className="h-4 w-4" />
            新增交易
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="搜索标的代码或原因..." />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="全部类型"
          options={[
            { value: 'buy', label: '买入' },
            { value: 'sell', label: '卖出' },
            { value: 'dividend', label: '分红' },
            { value: 'transfer_in', label: '转入' },
            { value: 'transfer_out', label: '转出' },
          ]}
        />
        <FilterSelect
          value={symbolFilter}
          onChange={setSymbolFilter}
          placeholder="全部标的"
          options={uniqueSymbols.map((s) => ({ value: s ?? '', label: s ?? '' }))}
        />
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="开始日期"
          />
          <span className="text-gray-400 text-sm">至</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="结束日期"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="交易记录表格">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">日期</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-left font-medium">标的</th>
                <th className="px-4 py-3 text-right font-medium">价格</th>
                <th className="px-4 py-3 text-right font-medium">数量</th>
                <th className="px-4 py-3 text-right font-medium">金额</th>
                <th className="px-4 py-3 text-right font-medium">手续费</th>
                <th className="px-4 py-3 text-left font-medium">说明</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(tx.tradeDate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      {typeIcon(tx.transactionType)}
                      <span className={tx.transactionType === 'buy' ? 'text-green-600' : tx.transactionType === 'sell' ? 'text-red-600' : 'text-gray-600'}>
                        {typeLabel(tx.transactionType)}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{tx.symbol || '--'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {tx.price != null && tx.price > 0 ? formatCurrency(tx.price) : '--'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{tx.quantity != null && tx.quantity > 0 ? tx.quantity : '--'}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${
                    tx.transactionType === 'buy' ? 'text-red-600' : tx.transactionType === 'sell' || tx.transactionType === 'dividend' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {tx.transactionType === 'buy' ? '-' : tx.transactionType === 'transfer_out' ? '' : '+'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                    {tx.fee > 0 ? formatCurrency(tx.fee) : '--'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{tx.notes || ''}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusTag status={tx.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <Pager current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export default TransactionListPage
