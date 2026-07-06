import React from 'react'
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
import { AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react'
import { mockHoldings, mockAccounts } from '@/db/mock-data'
import { formatCurrency, formatPercent } from '@/utils/format'
import { Breadcrumb, StatCard } from '@/components/ui'

const AssetAnalysisPage: React.FC = () => {
  // Calculate position distribution
  const positionData = mockHoldings.map((h) => ({
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
  const maxPosValue = Math.max(...positionData.map((p) => p.value))
  const concentrationRatio = totalValue > 0 ? (maxPosValue / totalValue) * 100 : 0

  // Data grade distribution
  const gradeGroups: Record<string, number> = {}
  mockHoldings.forEach((h) => {
    gradeGroups[h.dataGrade] = (gradeGroups[h.dataGrade] || 0) + h.currentPrice * h.quantity
  })
  const gradeData = Object.entries(gradeGroups).map(([name, value]) => ({
    name: `${name}级`,
    value,
    percent: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0',
  }))

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  const totalPnl = mockHoldings.reduce((s, h) => s + (h.currentPrice - h.costPrice) * h.quantity, 0)
  const totalCost = mockHoldings.reduce((s, h) => s + h.costPrice * h.quantity, 0)
  const returnRate = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalAssets = mockAccounts.reduce((s, a) => s + a.balance, 0)

  // Leverage check (simplified: if total loan > equity)
  const leverage = totalAssets > 0 ? (totalValue / totalAssets) : 0

  const topHolding = mockHoldings.reduce((max, h) => {
    const v = h.currentPrice * h.quantity
    return v > (max?.currentPrice ?? 0) * (max?.quantity ?? 0) ? h : max
  }, mockHoldings[0])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="资产分析">
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '资产分析' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">资产分析</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总资产"
          value={formatCurrency(totalAssets)}
          subValue={`持仓市值 ${formatCurrency(totalValue)}`}
          subColor="text-gray-500"
        />
        <StatCard
          title="总盈亏"
          value={totalPnl >= 0 ? `+${formatCurrency(totalPnl)}` : formatCurrency(totalPnl)}
          subValue={`收益率 ${formatPercent(returnRate, true)}`}
          subColor={totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          title="投资回报率"
          value={formatPercent(returnRate, true)}
          subValue={`最大持仓: ${topHolding?.symbol || '--'}`}
          subColor="text-gray-500"
        />
        <StatCard
          title="杠杆水平"
          value={`${leverage.toFixed(2)}x`}
          subValue={leverage > 1.5 ? '高杠杆风险' : '正常范围'}
          subColor={leverage > 1.5 ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Distribution Pie Chart */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">市场分布</h2>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Grade Distribution */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">数据分级分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v, true)} fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={40} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
          <div className="lg:col-span-2 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" role="alert">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <strong>杠杆警告：</strong>
              当前杠杆水平为 {leverage.toFixed(2)}x，超过 1.5x 安全线。建议降低仓位或增加流动储备金。
            </div>
          </div>
        )}

        {/* Concentration Risk */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            集中度风险
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">最大单仓占比</div>
              <div className={`text-xl font-bold ${concentrationRatio > 30 ? 'text-red-600' : 'text-gray-900'}`}>
                {concentrationRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {topHolding?.symbol} {topHolding?.name}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">持仓数量</div>
              <div className="text-xl font-bold text-gray-900">{mockHoldings.length}</div>
              <div className="text-xs text-gray-400 mt-0.5">覆盖 {pieData.length} 个市场</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">分散度评分</div>
              <div className="text-xl font-bold text-blue-600">
                {mockHoldings.length >= 5 ? '良好' : mockHoldings.length >= 3 ? '一般' : '不足'}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">建议5-8个标的</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetAnalysisPage
