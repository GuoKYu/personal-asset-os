import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Wallet,
  Building,
  CreditCard,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import { accountService } from '@/services/accountService'
import type { FinancialAccount } from '@/types'
import { formatCurrency, formatPercent } from '@/utils/format'
import { StatusTag } from '@/components/ui'
import ParticleBackground from '@/components/effects/ParticleBackground'

const AccountListPage: React.FC = () => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await accountService.getAccounts()
        setAccounts(data)
      } catch (error) {
        console.error('Failed to load accounts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAccounts()
  }, [])

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const totalPnl = accounts.reduce((s, a) => s + (a.pnl || 0), 0)

  const platformIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      brokerage: <CreditCard className="h-5 w-5" />,
      bank: <Building className="h-5 w-5" />,
      wallet: <Wallet className="h-5 w-5" />,
      other: <MoreHorizontal className="h-5 w-5" />,
    }
    return map[type] || <MoreHorizontal className="h-5 w-5" />
  }

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      brokerage: '券商账户',
      bank: '银行账户',
      wallet: '电子钱包',
      other: '其他',
    }
    return map[type] || type
  }

  const typeGradient = (type: string) => {
    const map: Record<string, string> = {
      brokerage: 'linear-gradient(135deg, #6366F1, #818CF8)',
      bank: 'linear-gradient(135deg, #10B981, #34D399)',
      wallet: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      other: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    }
    return map[type] || map.other
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.08))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={30} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                账户管理
                <span className="gradient-text ml-2">Accounts</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                {accounts.length} 个账户 · 总余额 {formatCurrency(totalBalance)} · 总收益{' '}
                <span className={totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                </span>
              </p>
            </div>
            <Link
              to="/finance/accounts/add"
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--pao-cyan), #0891B2)',
                boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
              }}
              aria-label="新增账户"
            >
              <Plus className="h-4 w-4" />
              新增账户
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--pao-primary)' }} />
        </div>
      )}

      {/* Account Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 anim-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {accounts.map((account, idx) => (
            <div
              key={account.id}
              className="glass-card p-5 hover:scale-105 transition-all duration-300 anim-fade-in-up"
              style={{
                borderRadius: 'var(--radius-lg)',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: typeGradient(account.type),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {platformIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--pao-text-primary)' }}>{account.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>{account.institution}</p>
                  </div>
                </div>
                <StatusTag status={account.status} size="sm" />
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>{typeLabel(account.type)}</span>
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--pao-text-primary)' }}>
                  {formatCurrency(account.balance)}
                </div>
                {account.pnl != null && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${account.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-3 w-3 ${account.pnl < 0 ? 'rotate-180' : ''}`} />
                    <span>{account.pnl >= 0 ? '+' : ''}{formatCurrency(account.pnl)}</span>
                    <span className="text-xs">({formatPercent(account.pnlPercent || 0, true)})</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountListPage
