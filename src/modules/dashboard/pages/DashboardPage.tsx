import React from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Plus,
  FilePlus,
  ShieldCheck,
  Award,
  Upload,
  DollarSign,
  Briefcase,
  FileText,
  Wallet,
} from 'lucide-react'
import { mockHoldings } from '@/db/mock-data'
import { formatCurrency, formatPercent, formatDate, getGreeting, getTodayDate } from '@/utils/format'
import { StatCard, ProgressRing, ModuleProgressBar, DataGradeTag, StatusTag } from '@/components/ui'

const DashboardPage: React.FC = () => {
  const totalAssets = 856234
  const monthlyReturn = 12456
  const monthlyReturnPercent = 5.1
  const totalReturnPercent = 2.3
  const stockPosition = 68

  const quickActions = [
    { label: '新增交易', icon: <TrendingUp className="h-4 w-4" />, to: '/finance/transactions/add', color: 'bg-blue-50 text-blue-600' },
    { label: '新增保单', icon: <ShieldCheck className="h-4 w-4" />, to: '/insurance/policies/add', color: 'bg-green-50 text-green-600' },
    { label: '登记证书', icon: <Award className="h-4 w-4" />, to: '/ip/certificates/add', color: 'bg-purple-50 text-purple-600' },
    { label: '上传文档', icon: <Upload className="h-4 w-4" />, to: '/documents/upload', color: 'bg-orange-50 text-orange-600' },
  ]

  const moduleCompletion = [
    { label: '金融资产', progress: 85, color: 'bg-blue-500' },
    { label: '保险保障', progress: 72, color: 'bg-green-500' },
    { label: '知识产权', progress: 90, color: 'bg-purple-500' },
    { label: '成长路径', progress: 60, color: 'bg-orange-500' },
    { label: '健康管理', progress: 45, color: 'bg-red-400' },
    { label: '文档管理', progress: 78, color: 'bg-cyan-500' },
    { label: '项目管理', progress: 55, color: 'bg-indigo-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="工作台">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}，欢迎回来
        </h1>
        <p className="text-sm text-gray-500 mt-1">{getTodayDate()}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总资产"
          value={formatCurrency(totalAssets)}
          subValue={`较上月 ${formatPercent(totalReturnPercent, true)}`}
          subColor="text-green-600"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="本月收益"
          value={formatCurrency(monthlyReturn)}
          subValue={`月收益率 ${formatPercent(monthlyReturnPercent, true)}`}
          subColor="text-green-600"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="有效保单"
          value="3 张"
          subValue="总保额 ¥750万"
          subColor="text-gray-500"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          title="知识产权"
          value="5 项"
          subValue="2项已授权 · 3项申请中"
          subColor="text-gray-500"
          icon={<Award className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Holdings Table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                持仓概览
              </h2>
              <Link
                to="/finance/holdings"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                aria-label="查看全部持仓"
              >
                查看全部
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="持仓概览表格">
                <thead>
                  <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">标的</th>
                    <th className="px-5 py-3 text-right font-medium">持仓数量</th>
                    <th className="px-5 py-3 text-right font-medium">成本价</th>
                    <th className="px-5 py-3 text-right font-medium">当前价</th>
                    <th className="px-5 py-3 text-right font-medium">盈亏</th>
                    <th className="px-5 py-3 text-center font-medium">状态</th>
                    <th className="px-5 py-3 text-center font-medium">分级</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mockHoldings.slice(0, 3).map((holding) => {
                    const pnl = (holding.currentPrice - holding.costPrice) * holding.quantity
                    const pnlPercent = ((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100
                    const nearStopLoss = holding.currentPrice <= holding.stopLossPrice * 1.08

                    return (
                      <tr
                        key={holding.id}
                        className={`hover:bg-gray-50 transition-colors ${nearStopLoss ? 'bg-orange-50/50' : ''}`}
                      >
                        <td className="px-5 py-3.5">
                          <Link to={`/finance/holdings/${holding.id}`} className="hover:text-blue-600 font-medium text-gray-900">
                            {holding.symbol}
                          </Link>
                          <div className="text-xs text-gray-500">{holding.name}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{holding.quantity}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(holding.costPrice)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(holding.currentPrice)}</td>
                        <td className={`px-5 py-3.5 text-right tabular-nums font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div>{pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}</div>
                          <div className="text-xs">{formatPercent(pnlPercent, true)}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <StatusTag status={holding.status} size="sm" />
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <DataGradeTag grade={holding.dataGrade} size="sm" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right - Position Ring + Quick Actions + Progress */}
        <div className="space-y-4">
          {/* Position Ring */}
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-600" />
              仓位分布
            </h2>
            <div className="flex justify-center">
              <ProgressRing
                progress={stockPosition}
                size={140}
                strokeWidth={10}
                label=""
                subLabel="股票仓位"
                color="#3B82F6"
              />
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
              现金及等价物占比 {100 - stockPosition}%
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">快捷操作</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color} hover:opacity-80`}
                  aria-label={action.label}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Module Completion */}
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              模块完善度
            </h2>
            <div className="space-y-3">
              {moduleCompletion.map((mod) => (
                <ModuleProgressBar
                  key={mod.label}
                  label={mod.label}
                  progress={mod.progress}
                  color={mod.color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
