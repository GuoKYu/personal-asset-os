import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Award,
  Medal,
  FileBadge,
  Building2,
  Calendar,
  AlertCircle,
  Search,
} from 'lucide-react'
import { certificateService } from '@/services/certificateService'
import type { Certificate } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const categoryIcon = (category: string) => {
  const map: Record<string, React.ReactNode> = {
    certificate: <FileBadge className="h-6 w-6 text-blue-500" />,
    honor: <Medal className="h-6 w-6 text-yellow-500" />,
    license: <Award className="h-6 w-6 text-green-500" />,
  }
  return map[category] || <Award className="h-6 w-6 text-gray-400" />
}

const categoryLabel = (category: string) => {
  const map: Record<string, string> = {
    certificate: '资格证书',
    honor: '荣誉奖项',
    license: '执照许可',
  }
  return map[category] || category
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  valid: { label: '有效', color: 'text-green-600', bg: 'bg-green-500/10' },
  expired: { label: '已过期', color: 'text-red-600', bg: 'bg-red-500/10' },
  'expiring-soon': { label: '即将过期', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  revoked: { label: '已撤销', color: 'text-gray-600', bg: 'bg-gray-500/10' },
}

const CertificatePage: React.FC = () => {
  const navigate = useNavigate()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCerts = async () => {
      try {
        const data = await certificateService.getCertificates()
        setCerts(data)
      } catch (error) {
        console.error('Failed to load certificates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCerts()
  }, [])

  const filtered = useMemo(() => {
    return certs.filter((cert) => {
      if (search) {
        const q = search.toLowerCase()
        if (!cert.certName.toLowerCase().includes(q) && !(cert.issuingBody ?? '').toLowerCase().includes(q)) return false
      }
      if (categoryFilter && cert.category !== categoryFilter) return false
      return true
    })
  }, [certs, search, categoryFilter])

  const stats = useMemo(() => {
    const valid = filtered.filter((c) => c.status === 'valid').length
    const expired = filtered.filter((c) => c.status === 'expired').length
    const expiringSoon = filtered.filter((c) => {
      if (!c.expiryDate) return false
      const d = new Date(c.expiryDate)
      const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      return d <= threeMonths && d >= new Date()
    }).length
    return { valid, expired, expiringSoon }
  }, [filtered])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(99,102,241,0.08))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={35} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                证书与荣誉
                <span className="gradient-text ml-2">Certificates</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                共 {filtered.length} 项 · 有效 {stats.valid} · 即将过期 {stats.expiringSoon}
              </p>
            </div>
            <button
              onClick={() => navigate('/ip/certificates/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #6366f1)' }}
            >
              <Plus className="h-4 w-4" />
              添加证书
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>有效证书</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>即将过期</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-red-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>已过期</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </div>
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
            placeholder="搜索证书名称或颁发机构..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-300"
            style={{
              background: 'var(--pao-bg-card)',
              borderColor: 'var(--pao-border)',
              color: 'var(--pao-text-primary)',
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{
            background: 'var(--pao-bg-card)',
            borderColor: 'var(--pao-border)',
            color: 'var(--pao-text-primary)',
          }}
        >
          <option value="">全部类型</option>
          <option value="certificate">资格证书</option>
          <option value="honor">荣誉奖项</option>
          <option value="license">执照许可</option>
        </select>
      </div>

      {/* Certificate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cert, index) => {
          const sc = statusConfig[cert.status] || { label: cert.status, color: 'text-gray-600', bg: 'bg-gray-500/10' }
          const isExpiringSoon = cert.expiryDate && new Date(cert.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && new Date(cert.expiryDate) >= new Date()
          return (
            <div
              key={cert.id}
              className="glass-card p-5 anim-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--pao-bg-hover)' }}>
                  {categoryIcon(cert.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--pao-text-primary)' }}>
                    {cert.certName}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" style={{ color: 'var(--pao-text-secondary)' }} />
                    <span className="text-xs line-clamp-1" style={{ color: 'var(--pao-text-secondary)' }}>
                      {cert.issuingBody || '--'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 text-xs rounded-full font-medium" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                  {categoryLabel(cert.category)}
                </span>
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>
                  {sc.label}
                </span>
              </div>

              <div className="space-y-1.5 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>颁发: {formatDate(cert.issueDate)}</span>
                </div>
                {cert.expiryDate && (
                  <div className={`flex items-center gap-1.5 ${isExpiringSoon ? 'text-amber-600' : ''}`}>
                    <Calendar className="h-3 w-3" />
                    <span>有效期至: {formatDate(cert.expiryDate)}</span>
                  </div>
                )}
                {cert.credentialId && (
                  <div className="flex items-center gap-1.5">
                    <FileBadge className="h-3 w-3" />
                    <span className="font-mono">{cert.credentialId}</span>
                  </div>
                )}
              </div>

              {cert.skillTags && cert.skillTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                  {cert.skillTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Award className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无证书或荣誉</p>
        </div>
      )}
    </div>
  )
}

export default CertificatePage
