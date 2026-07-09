import React, { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Loader2 } from 'lucide-react'
import { holdingService } from '@/services/holdingService'
import { accountService } from '@/services/accountService'
import type { Holding, FinancialAccount } from '@/types'
import { formatCurrency, formatPercent } from '@/utils/format'
import { Breadcrumb, StatCard } from '@/components/ui'

// TDesign default chart palette (brand / success / warning / error / purple)
const PIE_COLORS = ['#0052D9', '#00A870', '#ED7B2F', '#E34D59', '#834EC2']

const AssetAnalysisPage: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [holdingsData, accountsData] = await Promise.all([
          holdingService.getHoldings(),
          accountService.getAccounts(),
        ])
        setHoldings(holdingsData)
        setAccounts(accountsData)
      } catch (err) {
        console.error('Failed to fetch analysis data:', err)
        setError('加载数据失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--pao-primary)' }} />
        <span className="ml-3 text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>加载分析数据...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--pao-rose)' }} />
        <h2 className="text-lg font-medium" style={{ color: 'var(--pao-text-primary)' }}>数据加载失败</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--pao-text-tertiary)' }}>{error}</p>
      </div>
    )
  }

  // Calculate position distribution
  const positionData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentPrice * h.quantity,
    market: h.market,
  }))

  // Market distribution for pie chart
  const marketGroups: Record<string, number> = {}
  positionData.forEach((p) => {
    const key = p.market
    marketGroups[key] = (marketGroups[key] || 0) + p.value
  })
  const pieData = Object.entries(marketGroups).map(([name, value]) => ({ name, value }))

  // Concentration risk
  const totalValue = positionData.reduce((s, p) => s + p.value, 0)
  const maxPosValue = positionData.length ? Math.max(...positionData.map((p) => p.value)) : 0
  const concentrationRatio = totalValue > 0 ? (maxPosValue / totalValue) * 100 : 0

  // Data grade distribution
  const gradeGroups: Record<string, number> = {}
  holdings.forEach((h) => {
    const grade = h.dataGrade as string
    gradeGroups[grade] = (gradeGroups[grade] || 0) + h.currentPrice * h.quantity
  })
  const gradeData = Object.entries(gradeGroups).map(([name, value]) => ({
    name: `${name}级`,
    value,
    percent: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0',
  }))

  const totalPnl = holdings.reduce((s, h) => s + (h.currentPrice - h.avgCost) * h.quantity, 0)
  const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.quantity, 0)
  const returnRate = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalAssets = accounts.reduce((s, a) => s + a.balance, 0)

  // Leverage check
  const leverage = totalAssets > 0 ? (totalValue / totalAssets) : 0

  const topHolding = holdings.reduce<Holding | null>((max, h) => {
    if (!max) return h
    const v = h.currentPrice * h.quantity
    const maxV = max.currentPrice * max.quantity
    return v > maxV ? h : max
  }, null)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="资产分析">
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '资产分析' },
      ]} />

      <h1 className="text-2xl font-bold mb-5" style={{ color: 'var(--pao-text-primary)' }}>资产分析</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总资产"
          value={formatCurrency(totalAssets)}
          subValue={`持仓市值 ${formatCurrency(totalValue)}`}
          subColor="var(--pao-text-tertiary)"
        />
        <StatCard
          title="总盈亏"
          value={totalPnl >= 0 ? `+${formatCurrency(totalPnl)}` : formatCurrency(totalPnl)}
          subValue={`收益率 ${formatPercent(returnRate, true)}`}
          subColor={totalPnl >= 0 ? 'var(--pao-emerald)' : 'var(--pao-rose)'}
        />
        <StatCard
          title="投资回报率"
          value={formatPercent(returnRate, true)}
          subValue={`最大持仓: ${topHolding?.symbol || '--'}`}
          subColor="var(--pao-text-tertiary)"
        />
        <StatCard
          title="杠杆水平"
          value={`${leverage.toFixed(2)}x`}
          subValue={leverage > 1.5 ? '高杠杆风险' : '正常范围'}
          subColor={leverage > 1.5 ? 'var(--pao-rose)' : 'var(--pao-emerald)'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Distribution Pie Chart */}
        <div className="rounded-xl p-6" style={{ background: 'var(--pao-surface)', border: '1px solid var(--pao-border)' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--pao-text-primary)' }}>市场分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Grade Distribution */}
        <div className="rounded-xl p-6" style={{ background: 'var(--pao-surface)', border: '1px solid var(--pao-border)' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--pao-text-primary)' }}>数据分级分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pao-divider)" />
                <XAxis type="number" tickFormatter={(v: any) => formatCurrency(v, true)} fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={60} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {gradeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leverage Warning */}
        {leverage > 1.5 && (
          <div className="lg:col-span-2 flex items-center gap-3 px-5 py-4 rounded-xl text-sm" role="alert"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--pao-rose)',
            }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <strong>杠杆警告：</strong>
              当前杠杆水平为 {leverage.toFixed(2)}x，超过 1.5x 安全线。建议降低仓位或增加流动储备金。
            </div>
          </div>
        )}

        {/* Concentration Risk */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: 'var(--pao-surface)', border: '1px solid var(--pao-border)' }}>
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
            <Shield className="h-4 w-4" style={{ color: 'var(--pao-primary)' }} />
            集中度风险
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ background: 'var(--pao-divider)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--pao-text-tertiary)' }}>最大单仓占比</div>
              <div className={`text-xl font-bold ${concentrationRatio > 30 ? 'var(--pao-rose)' : 'var(--pao-text-primary)'}`}>
                {concentrationRatio.toFixed(1)}%
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--pao-text-tertiary)' }}>
                {topHolding?.symbol} {topHolding?.name}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--pao-divider)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--pao-text-tertiary)' }}>持仓数量</div>
              <div className="text-xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>{holdings.length}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--pao-text-tertiary)' }}>覆盖 {pieData.length} 个市场</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--pao-divider)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--pao-text-tertiary)' }}>分散度评分</div>
              <div className="text-xl font-bold" style={{ color: 'var(--pao-primary)' }}>
                {holdings.length >= 5 ? '良好' : holdings.length >= 3 ? '一般' : '不足'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--pao-text-tertiary)' }}>建议5-8个标的</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetAnalysisPage
