import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Activity,
  Stethoscope,
  Syringe,
  Pill,
  Clock,
  Search,
  HeartPulse,
} from 'lucide-react'
import { healthService } from '@/services/healthService'
import type { HealthRecord, FamilyMember } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const typeIcon = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    checkup: <Stethoscope className="h-4 w-4 text-blue-500" />,
    treatment: <Activity className="h-4 w-4 text-purple-500" />,
    medication: <Pill className="h-4 w-4 text-green-500" />,
    vaccination: <Syringe className="h-4 w-4 text-orange-500" />,
  }
  return map[type] || <Activity className="h-4 w-4 text-gray-400" />
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    checkup: '体检',
    treatment: '治疗',
    medication: '用药',
    vaccination: '疫苗接种',
  }
  return map[type] || type
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  normal: { label: '正常', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-300' },
  attention: { label: '关注', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-300' },
  abnormal: { label: '异常', color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-300' },
}

const HealthRecordPage: React.FC = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [memberFilter, setMemberFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recs, mems] = await Promise.all([
          healthService.getHealthRecords(),
          healthService.getFamilyMembers(),
        ])
        setRecords(recs)
        setMembers(mems)
      } catch (error) {
        console.error('Failed to load health records:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || '未知'
  }

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (memberFilter && r.memberId !== memberFilter) return false
      if (typeFilter && r.type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!r.title.toLowerCase().includes(q) && !(r.detail ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [records, memberFilter, typeFilter, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(16,185,129,0.08))',
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
                健康记录
                <span className="gradient-text ml-2">Health Records</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>{filtered.length} 条记录</p>
            </div>
            <button
              onClick={() => navigate('/health/records/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ef4444, #10b981)' }}
            >
              <Plus className="h-4 w-4" />
              添加记录
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索记录..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border"
            style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
          />
        </div>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
        >
          <option value="">全部成员</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
        >
          <option value="">全部类型</option>
          <option value="checkup">体检</option>
          <option value="treatment">治疗</option>
          <option value="medication">用药</option>
          <option value="vaccination">疫苗接种</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'var(--pao-border)' }} aria-hidden="true" />
        <div className="space-y-4">
          {filtered.map((record, index) => {
            const sc = statusConfig[record.status] || statusConfig.normal
            return (
              <div
                key={record.id}
                className="relative pl-16 anim-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`absolute left-3.5 mt-4 h-5 w-5 rounded-full border-2 z-10 ${sc.border}`}
                  style={{ background: 'var(--pao-bg-card)' }}
                />

                <div className="glass-card p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {typeIcon(record.type)}
                      <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>{typeLabel(record.type)}</span>
                      <span className="text-xs opacity-30">·</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                        {getMemberName(record.memberId)}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                    {record.title}
                  </h4>

                  {record.detail && (
                    <p className="text-xs mb-2" style={{ color: 'var(--pao-text-secondary)' }}>
                      {record.detail}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(record.date)}
                    </span>
                    {record.provider && (
                      <span className="flex items-center gap-1">
                        <HeartPulse className="h-3 w-3" />
                        {record.provider}
                      </span>
                    )}
                  </div>

                  {record.followUpDate && (
                    <div className="mt-2 pt-2 border-t text-xs text-amber-600" style={{ borderColor: 'var(--pao-border)' }}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      复查日期: {formatDate(record.followUpDate)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <HeartPulse className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无健康记录</p>
        </div>
      )}
    </div>
  )
}

export default HealthRecordPage
