import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { holdingService } from '@/services/holdingService';
import { accountService } from '@/services/accountService';
import { insuranceService } from '@/services/insuranceService';
import { ipService } from '@/services/ipService';
import { formatCurrency, formatPercent, getGreeting, getTodayDate } from '@/utils/format';
import { StatCard, ProgressRing, ModuleProgressBar, DataGradeTag, StatusTag } from '@/components/ui';
import ParticleBackground from '@/components/effects/ParticleBackground';
import type { Holding, FinancialAccount } from '@/types';

const DashboardPage: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [policyCount, setPolicyCount] = useState(0);
  const [totalCoverage, setTotalCoverage] = useState(0);
  const [ipCount, setIPCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [h, a, p, i] = await Promise.all([
          holdingService.getHoldings(),
          accountService.getAccounts(),
          insuranceService.getPolicies(),
          ipService.getIPs(),
        ]);
        setHoldings(h);
        setAccounts(a);
        setPolicyCount(p.length);
        setTotalCoverage(p.reduce((sum, pol) => sum + (pol.coverageAmount || 0), 0));
        setIPCount(i.length);
      } catch (err) {
        console.error('Dashboard data load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Computed values ──
  const totalAssets = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const holdingsMarketValue = holdings.reduce((s, h) => s + (h.marketValue || 0), 0);
  const totalPnl = holdings.reduce((s, h) => s + (h.unrealizedPnl || 0), 0);
  const totalPnlPercent = holdingsMarketValue > 0
    ? (totalPnl / (holdingsMarketValue - totalPnl)) * 100
    : 0;
  const stockPosition = holdingsMarketValue > 0 && totalAssets > 0
    ? Math.round((holdingsMarketValue / totalAssets) * 100)
    : 0;

  const quickActions = [
    { label: '持仓管理', icon: <Briefcase className="h-4 w-4" />, to: '/finance/holdings', gradient: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' },
    { label: '保险保障', icon: <ShieldCheck className="h-4 w-4" />, to: '/insurance/policies', gradient: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' },
    { label: '知识产权', icon: <Award className="h-4 w-4" />, to: '/ip', gradient: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' },
    { label: '文档中心', icon: <FileText className="h-4 w-4" />, to: '/documents', gradient: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' },
  ];

  const moduleCompletion = [
    { label: '金融资产', progress: accounts.length > 0 || holdings.length > 0 ? 100 : 0, color: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
    { label: '保险保障', progress: policyCount > 0 ? 100 : 0, color: 'linear-gradient(90deg, var(--td-success-color), var(--td-success-color))' },
    { label: '知识产权', progress: ipCount > 0 ? 100 : 0, color: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
    { label: '成长路径', progress: 0, color: 'linear-gradient(90deg, var(--td-warning-color), var(--td-warning-color))' },
    { label: '健康管理', progress: 0, color: 'linear-gradient(90deg, var(--td-error-color), var(--td-error-color))' },
    { label: '文档管理', progress: 0, color: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
    { label: '项目管理', progress: 0, color: 'linear-gradient(90deg, var(--td-brand-color), var(--td-brand-color))' },
  ];

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--pao-primary)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-container))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={60} />
        <div className="relative px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--pao-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--pao-text-secondary)' }}>{getTodayDate()}</span>
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
          value={loading ? '—' : formatCurrency(totalAssets)}
          subValue={accounts.length === 0 ? '添加首个账户' : `${accounts.length} 个账户`}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0}
          gradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        />
        <StatCard
          title="持仓市值"
          value={loading ? '—' : formatCurrency(holdingsMarketValue)}
          subValue={holdings.length > 0 ? `总盈亏 ${formatPercent(totalPnlPercent, true)}` : '暂无持仓'}
          subColor={totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={totalPnlPercent}
          delay={0.08}
          gradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        />
        <StatCard
          title="有效保单"
          value={policyCount === 0 ? '—' : `${policyCount} 张`}
          subValue={totalCoverage > 0 ? `总保额 ${formatCurrency(totalCoverage)}` : '暂无保单'}
          icon={<ShieldCheck className="h-5 w-5" />}
          delay={0.16}
          gradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        />
        <StatCard
          title="知识产权"
          value={ipCount === 0 ? '—' : `${ipCount} 项`}
          subValue={ipCount === 0 ? '暂无记录' : '已录入'}
          icon={<Award className="h-5 w-5" />}
          delay={0.24}
          gradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Holdings Table */}
        <div className="lg:col-span-2 anim-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
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
              >
                查看全部 →
              </Link>
            </div>

            {holdings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm mb-3" style={{ color: 'var(--pao-text-tertiary)' }}>暂无持仓数据</p>
                <Link
                  to="/finance/holdings"
                  className="inline-block px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
                >
                  + 添加持仓
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--pao-divider)' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>标的</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>持仓</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>成本</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>现价</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>盈亏</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>分级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.slice(0, 5).map((holding) => {
                      const pnl = holding.unrealizedPnl || 0;
                      const pnlPercent = holding.unrealizedPnlPct || 0;
                      const isPositive = pnl >= 0;

                      return (
                        <tr
                          key={holding.id}
                          className="group transition-all duration-300 hover:bg-white/5"
                          style={{ borderBottom: '1px solid var(--pao-divider)' }}
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/finance/holdings/${holding.id}`}
                              className="font-semibold hover:opacity-70 transition-opacity"
                              style={{ color: 'var(--pao-text-primary)' }}
                            >
                              {holding.symbol}
                            </Link>
                            <div className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>{holding.name}</div>
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
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {formatCurrency(Math.abs(pnl))}
                            </div>
                            <div className="text-xs" style={{ color: isPositive ? '#10B981' : '#EF4444', opacity: 0.7 }}>
                              {formatPercent(pnlPercent, true)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DataGradeTag grade={holding.dataGrade} size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Position Distribution Ring */}
          <div className="glass-card p-6 anim-fade-in-up" style={{ animationDelay: '0.36s' }}>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
              <Wallet className="h-4 w-4" style={{ color: 'var(--pao-cyan)' }} />
              仓位分布
            </h2>
            <div className="flex justify-center mb-4">
              <ProgressRing progress={stockPosition} size={140} strokeWidth={10} subLabel="股票仓位" />
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
          <div className="glass-card p-6 anim-fade-in-up" style={{ animationDelay: '0.42s' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--pao-text-primary)' }}>快捷操作</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{ background: 'var(--pao-divider)', border: '1px solid var(--pao-border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ background: action.gradient, boxShadow: '0 4px 12px var(--td-shadow-2)' }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--pao-text-secondary)' }}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Module Completion */}
          <div className="glass-card p-6 anim-fade-in-up" style={{ animationDelay: '0.48s' }}>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
              <FileText className="h-4 w-4" style={{ color: 'var(--pao-violet)' }} />
              模块完善度
            </h2>
            <div className="space-y-3">
              {moduleCompletion.map((mod, idx) => (
                <ModuleProgressBar key={mod.label} label={mod.label} progress={mod.progress} color={mod.color} delay={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
