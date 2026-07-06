import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Wallet, Building, CreditCard, MoreHorizontal } from 'lucide-react'
import { mockAccounts } from '@/db/mock-data'
import { formatCurrency, formatPercent } from '@/utils/format'
import { Breadcrumb, StatusTag } from '@/components/ui'

const AccountListPage: React.FC = () => {
  const totalBalance = mockAccounts.reduce((s, a) => s + a.balance, 0)
  const totalPnl = mockAccounts.reduce((s, a) => s + a.pnl, 0)

  const platformIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      brokerage: <CreditCard className="h-5 w-5 text-blue-600" />,
      bank: <Building className="h-5 w-5 text-green-600" />,
      wallet: <Wallet className="h-5 w-5 text-orange-600" />,
      other: <MoreHorizontal className="h-5 w-5 text-gray-600" />,
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="账户列表">
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '账户列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">账户列表</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockAccounts.length} 个账户 · 总余额 {formatCurrency(totalBalance)} · 总收益 {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
          </p>
        </div>
        <Link
          to="/finance/accounts/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="新增账户"
        >
          <Plus className="h-4 w-4" />
          新增账户
        </Link>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAccounts.map((account) => (
          <div
            key={account.id}
            className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  {platformIcon(account.type)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-xs text-gray-500">{account.platform}</p>
                </div>
              </div>
              <StatusTag status={account.status} size="sm" />
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">{typeLabel(account.type)}</span>
              </div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(account.balance)}
              </div>
              {account.pnl !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${account.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{account.pnl >= 0 ? '+' : ''}{formatCurrency(account.pnl)}</span>
                  <span className="text-xs">({formatPercent(account.pnlPercent, true)})</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccountListPage
