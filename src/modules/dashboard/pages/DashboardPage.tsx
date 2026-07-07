import React from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShieldCheck,
  Award,
  DollarSign,
  Briefcase,
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'
import { mockHoldings } from '@/db/mock-data'
import { formatCurrency, formatPercent, getGreeting, getTodayDate } from '@/utils/format'
import { StatCard, ProgressRing, ModuleProgressBar, DataGradeTag, StatusTag } from '@/components/ui'
import ParticleBackground from '@/components/effects/ParticleBackground'

const DashboardPage: React.FC = () => {
  const totalAssets = 856234
  const monthlyReturn = 12456
  const monthlyReturnPercent = 5.1
  const totalReturnPercent = 2.3
  const stockPosition = 68

  const quickActions = [
    { label: '持仓管理', icon: <Briefcase className="h-4 w-4" />, to: '/finance/holdings', gradient: 'linear-gradient(135deg, #6366F1, #818CF8)' },
    { label: '保险保障', icon: <ShieldCheck className="h-4 w-4" />, to: '/insurance/policies', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    { label: '知识产权', icon: <Award className="h-4 w-4" />, to: '/ip', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
    { label: '文档中心', icon: <FileText className="h-4 w-4" />, to: '/documents', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  ]

  const moduleCompletion = [
    { label: '金融资产', progress: 85, color: 'linear-gradient(90deg, #6366F1, #818CF8)' },
    { label: '保险保障', progress: 72, color: 'linear-gradient(90deg, #10B981, #34D399)' },
    { label: '知识产权', progress: 90, color: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' },
    { label: '成长路径', progress: 60, color: 'linear-gradient(90deg, #F59E0B, #FBBF24)' },
    { label: '健康管理', progress: 45, color: 'linear-gradient(90deg, #EF4444, #F87171)' },
    { label: '文档管理', progress: 78, color: 'linear-gradient(90deg, #06B6D4, #22D3EE)' },
    { label: '项目管理', progress: 55, color: 'linear-gradient(90deg, #6366F1, #8B5CF6)' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section with Particle Background */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(6,182,212,0.06))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={60} />
        <div className="relative px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--pao-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--pao-text-secondary)' }}>
              {getTodayDate()}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
            {getGreeting()}，<span className="gradient-text">BTI</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--pao-text-secondary)' }}>
            你的个人资产全景视图 · 一切尽在掌握
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总资产"
          value={formatCurrency(totalAssets)}
          subValue={`较上月 ${formatPercent(totalReturnPercent, true)}`}
          subColor="text-green-600"
          icon={<DollarSign className="h-5 w-5" />}
          trend={totalReturnPercent}
          delay={0}
          gradient="linear-gradient(135deg, #6366F1, #818CF8)"
        />
        <StatCard
          title="本月收益"
          value={formatCurrency(monthlyReturn)}
          subValue={`月收益率 ${formatPercent(monthlyReturnPercent, true)}`}
          subColor="text-green-600"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={monthlyReturnPercent}
          delay={0.08}
          gradient="linear-gradient(135deg, #10B981, #34D399)"
        />
        <StatCard
          title="有效保单"
          value="3 张"
          subValue="总保额 ¥750万"
          icon={<ShieldCheck className="h-5 w-5" />}
          delay={0.16}
          gradient="linear-gradient(135deg, #06B6D4, #22D3EE)"
        />
        <StatCard
          title="知识产权"
          value="5 项"
          subValue="2项已授权 · 3项申请中"
          icon={<Award className="h-5 w-5" />}
          delay={0.24}
          gradient="linear-gradient(135deg, #8B5CF6, #A78BFA)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Holdings Table */}
        <div className="lg:col-span-2 anim-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
            {/* Table header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--pao-divider)' }}
            >
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
                <Briefcase className="h-4 w-4" style={{ color: 'var(--pao-primary)' }} />
                持仓概览
              </h2>
              <Link
                to="/finance/holdings"
                className="text-sm font-medium gradient-text hover:opacity-70 transition-opacity"
                aria-label="查看全部持仓"
              >
                查看全部 →
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="持仓概览表格">
                <thead>
                  <tr style={{ background: 'var(--pao-divider)' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>标的</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>持仓</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>成本</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>现价</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>盈亏</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>状态</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>分级</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHoldings.slice(0, 5).map((holding, idx) => {
                    const pnl = (holding.currentPrice - holding.costPrice) * holding.quantity
                    const pnlPercent = ((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100
                    const nearStopLoss = holding.currentPrice <= holding.stopLossPrice * 1.08
                    const isPositive = pnl >= 0

                    return (
                      <tr
                        key={holding.id}
                        className="group transition-all duration-300 hover:bg-white/5"
                        style={{
                          borderBottom: '1px solid var(--pao-divider)',
                          background: nearStopLoss ? 'rgba(245,158,11,0.05)' : undefined,
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
                          {formatCurrency(holding.costPrice)}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                          {formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                          <div
                            className="font-semibold flex items-center justify-end gap-1"
                            style={{ color: isPositive ? '#10B981' : '#EF4444' }}
                          >
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatCurrency(Math.abs(pnl))}
                          </div>
                          <div className="text-xs" style={{ color: isPositive ? '#10B981' : '#EF4444', opacity: 0.7 }}>
                            {formatPercent(pnlPercent, true)}
                          </div>
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
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Position Distribution Ring */}
          <div
            className="glass-card p-6 anim-fade-in-up"
            style={{ animationDelay: '0.36s' }}
          >
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
              <Wallet className="h-4 w-4" style={{ color: 'var(--pao-cyan)' }} />
              仓位分布
            </h2>
            <div className="flex justify-center mb-4">
              <ProgressRing
                progress={stockPosition}
                size={140}
                strokeWidth={10}
                subLabel="股票仓位"
              />
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--pao-primary)' }} />
                股票 {stockPosition}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--pao-divider)' }} />
                现金 {100 - stockPosition}%
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="glass-card p-6 anim-fade-in-up"
            style={{ animationDelay: '0.42s' }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--pao-text-primary)' }}>
              快捷操作
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'var(--pao-divider)',
                    border: '1px solid var(--pao-border)',
                  }}
                  aria-label={action.label}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: action.gradient,
                      boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                    }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--pao-text-secondary)' }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Module Completion */}
          <div
            className="glass-card p-6 anim-fade-in-up"
            style={{ animationDelay: '0.48s' }}
          >
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
              <FileText className="h-4 w-4" style={{ color: 'var(--pao-violet)' }} />
              模块完善度
            </h2>
            <div className="space-y-3">
              {moduleCompletion.map((mod, idx) => (
                <ModuleProgressBar
                  key={mod.label}
                  label={mod.label}
                  progress={mod.progress}
                  color={mod.color}
                  delay={idx}
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
