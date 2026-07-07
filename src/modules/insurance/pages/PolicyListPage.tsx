import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ShieldCheck,
  Calendar,
  DollarSign,
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
} from 'lucide-react';
import { insuranceService } from '@/services/insuranceService';
import type { InsurancePolicy, InsuranceType, InsuranceStatus } from '@/types';
import { formatCurrency, formatDate, formatPolicyType } from '@/utils/format';
import { DataGradeTag, StatusTag } from '@/components/ui';
import ParticleBackground from '@/components/effects/ParticleBackground';

const PolicyListPage: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InsuranceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InsuranceStatus | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);

  // Load policies from Dexie.js
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const data = await insuranceService.getPolicies();
        setPolicies(data);
      } catch (error) {
        console.error('Failed to load policies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolicies();
  }, []);

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.insurer.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && p.policyType !== typeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [policies, search, typeFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalPremium = filtered.reduce((sum, p) => sum + p.premiumAnnual, 0);
  const totalCoverage = filtered.reduce((sum, p) => sum + p.coverageAmount, 0);
  const expiredCount = filtered.filter((p) => new Date(p.endDate) < new Date()).length;
  const activeCount = filtered.filter((p) => p.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section with Particle Background */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))',
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
                保单管理
                <span className="gradient-text ml-2">Insurance</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                共 {filtered.length} 张保单，年保费 {formatCurrency(totalPremium)}，总保额 {formatCurrency(totalCoverage, true)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  有效: {activeCount}
                </span>
                {expiredCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    已过期: {expiredCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/insurance/policies/add"
                className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-primary-dark))',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
                aria-label="新增保单"
              >
                <Plus className="h-4 w-4" />
                新增保单
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
              placeholder="搜索保单名称或保险公司..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-300"
              style={{
                background: 'var(--pao-divider)',
                border: '1px solid var(--pao-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--pao-text-primary)',
              }}
              aria-label="搜索保单"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InsuranceType | '')}
            className="px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-300"
            style={{
              background: 'var(--pao-divider)',
              border: '1px solid var(--pao-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--pao-text-secondary)',
            }}
            aria-label="筛选类型"
          >
            <option value="">全部类型</option>
            <option value="medical">医疗险</option>
            <option value="critical_illness">重疾险</option>
            <option value="accident">意外险</option>
            <option value="life">寿险</option>
            <option value="property">财产险</option>
            <option value="travel">旅行险</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InsuranceStatus | '')}
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
            <option value="active">有效</option>
            <option value="pending">待生效</option>
            <option value="expired">已过期</option>
            <option value="claimed">已理赔</option>
            <option value="cancelled">已取消</option>
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
            <table className="w-full text-sm" aria-label="保单列表表格">
              <thead>
                <tr style={{ background: 'var(--pao-divider)' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>保单名称</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>保险公司</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>保单号</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>被保险人</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>类型</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>保额</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>年保费</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>到期日</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--pao-text-tertiary)' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((policy, idx) => {
                  const typeInfo = formatPolicyType(policy.policyType);
                  const isExpired = new Date(policy.endDate) < new Date();
                  return (
                    <tr
                      key={policy.id}
                      className="group transition-all duration-300 hover:bg-white/5"
                      style={{
                        borderBottom: '1px solid var(--pao-divider)',
                        background: isExpired ? 'rgba(239,68,68,0.05)' : undefined,
                        animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/insurance/policies/${policy.id}`}
                          className="font-semibold hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--pao-text-primary)' }}
                        >
                          {policy.name}
                        </Link>
                        <div className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>
                          {policy.insuredPerson}
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--pao-text-secondary)' }}>
                        {policy.insurer}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: 'var(--pao-text-tertiary)' }}>
                        {policy.policyNumber}
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--pao-text-secondary)' }}>
                        {policy.insuredPerson}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-flex px-2 py-0.5 text-xs rounded font-medium"
                          style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                        {formatCurrency(policy.coverageAmount, true)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums" style={{ color: 'var(--pao-text-secondary)' }}>
                        {formatCurrency(policy.premiumAnnual)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-xs" style={{ color: isExpired ? '#EF4444' : 'var(--pao-text-tertiary)' }}>
                        {formatDate(policy.endDate)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusTag status={policy.status} size="sm" />
                      </td>
                    </tr>
                  );
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
          {paged.map((policy, idx) => {
            const typeInfo = formatPolicyType(policy.policyType);
            const isExpired = new Date(policy.endDate) < new Date();
            return (
              <Link
                key={policy.id}
                to={`/insurance/policies/${policy.id}`}
                className="glass-card p-5 hover:scale-105 transition-all duration-300 anim-fade-in-up"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  animationDelay: `${idx * 0.05}s`,
                  borderColor: isExpired ? 'rgba(239,68,68,0.5)' : 'var(--glass-border)',
                }}
                aria-label={`${policy.name} 详情`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold" style={{ color: 'var(--pao-text-primary)' }}>{policy.name}</span>
                    <span className="text-sm ml-2" style={{ color: 'var(--pao-text-tertiary)' }}>{policy.insurer}</span>
                  </div>
                  <StatusTag status={policy.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex px-2 py-0.5 text-xs rounded font-medium"
                    style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                  >
                    {typeInfo.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>#{policy.policyNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>被保险人</span>
                    <div className="font-medium" style={{ color: 'var(--pao-text-primary)' }}>{policy.insuredPerson}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>保额</span>
                    <div className="font-medium tabular-nums" style={{ color: 'var(--pao-text-primary)' }}>
                      {formatCurrency(policy.coverageAmount, true)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>年保费</span>
                    <div className="font-medium tabular-nums" style={{ color: 'var(--pao-text-secondary)' }}>{formatCurrency(policy.premiumAnnual)}</div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>到期日</span>
                    <div className={`font-medium tabular-nums text-xs ${isExpired ? 'text-red-600' : ''}`} style={{ color: isExpired ? undefined : 'var(--pao-text-secondary)' }}>
                      {formatDate(policy.endDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>
                    下次缴费: {policy.nextPaymentDate ? formatDate(policy.nextPaymentDate) : '未设置'}
                  </span>
                  <DataGradeTag grade={policy.dataGrade} size="sm" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PolicyListPage;
