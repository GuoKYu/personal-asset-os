import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  DollarSign,
  Users,
  FileText,
  Clock,
  ShieldCheck,
  Info,
  ChevronRight,
} from 'lucide-react'
import { mockPolicies, mockDocuments } from '@/db/mock-data'
import { formatCurrency, formatDate, formatPolicyType } from '@/utils/format'
import { Breadcrumb, StatusTag } from '@/components/ui'

const PolicyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const policy = mockPolicies.find((p) => p.id === id)

  if (!policy) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">未找到保单信息</h2>
        <Link to="/insurance/policies" className="text-blue-600 text-sm mt-2 inline-block">返回保单列表</Link>
      </div>
    )
  }

  const typeInfo = formatPolicyType(policy.type)
  const relatedDocs = mockDocuments.filter((d) => policy.documents.includes(d.id))

  // Simulated payment history
  const paymentHistory = [
    { date: '2026-03-15', amount: policy.premium, method: '银行转账', status: 'paid' },
    { date: '2025-03-15', amount: policy.premium, method: '银行转账', status: 'paid' },
    { date: '2024-03-15', amount: policy.premium, method: '银行转账', status: 'paid' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label={`${policy.name} 保单详情`}>
      <Breadcrumb items={[
        { label: '保险保障管理', href: '/insurance' },
        { label: '保单列表', href: '/insurance/policies' },
        { label: policy.name },
      ]} />

      {/* Policy Info Card */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{policy.name}</h1>
              <StatusTag status={policy.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{policy.company}</p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium bg-gray-50 ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">保单编号</div>
            <div className="font-mono text-sm font-medium text-gray-900">{policy.policyNumber}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">被保险人</div>
            <div className="font-medium text-gray-900">{policy.insuredPerson}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">受益人</div>
            <div className="font-medium text-gray-900">{policy.beneficiary}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">保额</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(policy.coverageAmount, true)}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">年保费</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(policy.premium)}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">下次缴费日</div>
            <div className="text-lg font-bold text-orange-700">{formatDate(policy.nextPaymentDate)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">生效日期</div>
            <div className="font-medium">{formatDate(policy.startDate)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">到期日期</div>
            <div className="font-medium">{formatDate(policy.endDate)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">缴费频率</div>
            <div className="font-medium">
              {policy.premiumFrequency === 'yearly' ? '按年' : policy.premiumFrequency === 'monthly' ? '按月' : '一次性'}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          缴费记录
        </h3>
        <div className="space-y-3">
          {paymentHistory.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                  <div className="text-xs text-gray-500">{payment.method}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700">{formatDate(payment.date)}</div>
                <div className="text-xs text-green-600">已缴费</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Documents */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          关联文档
        </h3>
        {relatedDocs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">暂无关联文档</p>
        ) : (
          <div className="space-y-2">
            {relatedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-500">{doc.type} · {doc.size}</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PolicyDetailPage
