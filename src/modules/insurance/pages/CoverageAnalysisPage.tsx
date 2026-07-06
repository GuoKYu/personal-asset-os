import React, { useMemo } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { mockPolicies, mockFamilyMembers } from '@/db/mock-data'
import { formatCurrency } from '@/utils/format'
import { Breadcrumb } from '@/components/ui'

interface MemberCoverage {
  memberId: string
  name: string
  relation: string
  policies: typeof mockPolicies
  totalCoverage: number
  healthCoverage: number
  lifeCoverage: number
  criticalCoverage: number
  accidentCoverage: number
  gapAreas: string[]
  score: number
}

const CoverageAnalysisPage: React.FC = () => {
  const membersCoverage = useMemo((): MemberCoverage[] => {
    return mockFamilyMembers.slice(0, 2).map((member) => {
      const memberPolicies = mockPolicies.filter(
        (p) => p.insuredPerson === member.name || p.insuredPerson === member.relation || (member.relation === '本人' && p.insuredPerson === '本人')
      )

      const healthCoverage = memberPolicies.filter((p) => p.type === 'health').reduce((s, p) => s + p.coverageAmount, 0)
      const lifeCoverage = memberPolicies.filter((p) => p.type === 'life').reduce((s, p) => s + p.coverageAmount, 0)
      const criticalCoverage = memberPolicies.filter((p) => p.type === 'critical').reduce((s, p) => s + p.coverageAmount, 0)
      const accidentCoverage = memberPolicies.filter((p) => p.type === 'accident').reduce((s, p) => s + p.coverageAmount, 0)
      const totalCoverage = healthCoverage + lifeCoverage + criticalCoverage + accidentCoverage

      const gapAreas: string[] = []
      if (healthCoverage === 0) gapAreas.push('医疗险')
      if (lifeCoverage === 0) gapAreas.push('寿险')
      if (criticalCoverage === 0) gapAreas.push('重疾险')
      if (accidentCoverage === 0) gapAreas.push('意外险')

      const score = totalCoverage > 5000000 ? 85 : totalCoverage > 2000000 ? 65 : totalCoverage > 0 ? 40 : 0

      return {
        memberId: member.id,
        name: member.name,
        relation: member.relation,
        policies: memberPolicies,
        totalCoverage,
        healthCoverage,
        lifeCoverage,
        criticalCoverage,
        accidentCoverage,
        gapAreas,
        score,
      }
    })
  }, [])

  const recommendations = [
    {
      id: 1,
      member: '本人',
      title: '建议补充百万医疗险',
      reason: '当前缺少医疗险保障，突发大病可能造成较大财务压力',
      priority: 'high',
      estimatedCost: '¥300-500/年',
    },
    {
      id: 2,
      member: '配偶',
      title: '重疾险保额偏低',
      reason: '50万重疾保额对于当前收入水平偏低，建议提升至100万',
      priority: 'medium',
      estimatedCost: '¥3,000-5,000/年',
    },
    {
      id: 3,
      member: '子女',
      title: '建议配置儿童意外险',
      reason: '6岁以下儿童意外风险较高，建议配置专门意外险',
      priority: 'medium',
      estimatedCost: '¥100-200/年',
    },
  ]

  const totalFamilyCoverage = membersCoverage.reduce((s, m) => s + m.totalCoverage, 0)
  const membersWithGaps = membersCoverage.filter((m) => m.gapAreas.length > 0).length

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="保障缺口分析">
      <Breadcrumb items={[
        { label: '保险保障管理', href: '/insurance' },
        { label: '保障分析' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-5">保障缺口分析</h1>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500">家庭总保额</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalFamilyCoverage, true)}</div>
          <div className="text-xs text-gray-500 mt-1">覆盖 {membersCoverage.reduce((s, m) => s + m.policies.length, 0)} 张保单</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-500">保障缺口</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{membersWithGaps}</div>
          <div className="text-xs text-gray-500 mt-1">位家庭成员存在保障缺口</div>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">整体评分</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {membersCoverage.length > 0
              ? Math.round(membersCoverage.reduce((s, m) => s + m.score, 0) / membersCoverage.length)
              : 0}{' '}
            <span className="text-sm text-gray-400">/100</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">建议尽快补全缺失保障</div>
        </div>
      </div>

      {/* Per-member coverage */}
      <div className="space-y-4 mb-6">
        {membersCoverage.map((member) => (
          <div key={member.memberId} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.relation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">保障评分</span>
                <span className={`text-lg font-bold ${member.score >= 65 ? 'text-green-600' : member.score >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                  {member.score}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className={`p-3 rounded-lg ${member.healthCoverage > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">医疗险</div>
                <div className="font-semibold text-sm">{member.healthCoverage > 0 ? formatCurrency(member.healthCoverage, true) : '未配置'}</div>
              </div>
              <div className={`p-3 rounded-lg ${member.lifeCoverage > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">寿险</div>
                <div className="font-semibold text-sm">{member.lifeCoverage > 0 ? formatCurrency(member.lifeCoverage, true) : '未配置'}</div>
              </div>
              <div className={`p-3 rounded-lg ${member.criticalCoverage > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">重疾险</div>
                <div className="font-semibold text-sm">{member.criticalCoverage > 0 ? formatCurrency(member.criticalCoverage, true) : '未配置'}</div>
              </div>
              <div className={`p-3 rounded-lg ${member.accidentCoverage > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">意外险</div>
                <div className="font-semibold text-sm">{member.accidentCoverage > 0 ? formatCurrency(member.accidentCoverage, true) : '未配置'}</div>
              </div>
            </div>

            {member.gapAreas.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>保障缺口: {member.gapAreas.join('、')}</span>
              </div>
            )}
            {member.gapAreas.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>保障齐全</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">优化建议</h3>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${rec.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                    {rec.priority === 'high' ? '紧急' : '建议'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>适用: {rec.member}</span>
                  <span>预估成本: {rec.estimatedCost}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoverageAnalysisPage
