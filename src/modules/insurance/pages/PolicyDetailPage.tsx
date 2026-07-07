import React, { useState, useEffect } from 'react'
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
  ArrowLeft,
} from 'lucide-react'
import { insuranceService } from '@/services/insuranceService'
import { formatCurrency, formatDate, formatPolicyType } from '@/utils/format'
import { Breadcrumb, StatusTag } from '@/components/ui'
import ParticleBackground from '@/components/effects/ParticleBackground'

const PolicyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [policy, setPolicy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPolicy = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await insuranceService.getPolicyById(id)
        setPolicy(data || null)
      } catch (err) {
        console.error('Failed to load policy:', err)
        setError('加载保单失败')
      } finally {
        setLoading(false)
      }
    }

    loadPolicy()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground count={60} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200/50 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200/50 rounded-2xl"></div>
            <div className="h-48 bg-gray-200/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground count={60} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
          <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {error || '未找到保单信息'}
          </h2>
          <Link
            to="/insurance/policies"
            className="text-blue-600 text-sm mt-2 inline-block hover:text-blue-700 transition-colors"
          >
            ← 返回保单列表
          </Link>
        </div>
      </div>
    )
  }

  const typeInfo = formatPolicyType(policy.policyType || policy.type)

  return (
    <div className="min-h-screen relative">
      <ParticleBackground count={60} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-6" aria-label={`${policy.name} 保单详情`}>
        {/* Breadcrumb */}
        <div className="mb-6 anim-fade-in-up">
          <Breadcrumb items={[
            { label: '保险保障管理', href: '/insurance' },
            { label: '保单列表', href: '/insurance/policies' },
            { label: policy.name },
          ]} />
        </div>

        {/* Back Button */}
        <Link
          to="/insurance/policies"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6 anim-fade-in-up"
        >
          <ArrowLeft className="h-4 w-4" />
          返回保单列表
        </Link>

        {/* Policy Info Card */}
        <div className="glass-card p-6 mb-6 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold gradient-text-primary">{policy.name}</h1>
                <StatusTag status={policy.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{policy.insurer || policy.company}</p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium bg-gray-50 ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">保单编号</div>
              <div className="font-mono text-sm font-medium text-gray-900">{policy.policyNumber}</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">被保险人</div>
              <div className="font-medium text-gray-900">{policy.insuredPerson}</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">受益人</div>
              <div className="font-medium text-gray-900">{policy.beneficiary || '-'}</div>
            </div>
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
              <div className="text-xs text-gray-500 mb-1">保额</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(policy.coverageAmount, true)}
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div className="text-xs text-gray-500 mb-1">年保费</div>
              <div className="text-lg font-bold text-blue-700">
                {formatCurrency(policy.premium)}
              </div>
            </div>
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
              <div className="text-xs text-gray-500 mb-1">下次缴费日</div>
              <div className="text-lg font-bold text-orange-700">
                {formatDate(policy.nextPaymentDate)}
              </div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">生效日期</div>
              <div className="font-medium">{formatDate(policy.startDate)}</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">到期日期</div>
              <div className="font-medium">{formatDate(policy.endDate)}</div>
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100/50">
              <div className="text-xs text-gray-500 mb-1">缴费频率</div>
              <div className="font-medium">
                {policy.premiumFrequency === 'yearly' ? '按年' :
                 policy.premiumFrequency === 'monthly' ? '按月' : '一次性'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="glass-card p-6 mb-6 anim-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            缴费记录
          </h3>
          <div className="space-y-3">
            {[2026, 2025, 2024].map((year) => (
              <div key={year} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100/50 hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(policy.premium)}
                    </div>
                    <div className="text-xs text-gray-500">银行转账</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700">{year}-03-15</div>
                  <div className="text-xs text-green-600">已缴费</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Documents */}
        <div className="glass-card p-6 anim-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            关联文档
          </h3>
          {(!policy.documents || policy.documents.length === 0) ? (
            <p className="text-sm text-gray-400 py-8 text-center">暂无关联文档</p>
          ) : (
            <div className="space-y-2">
              {policy.documents.map((docId: string) => (
                <div
                  key={docId}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100/50 hover:bg-white/70 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{docId}</div>
                      <div className="text-xs text-gray-500">文档 ID</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PolicyDetailPage
