import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  FileCode,
  Copyright,
  BookmarkCheck,
  Shield,
  TrendingUp,
  AlertTriangle,
  Search,
  Clock,
  Trash2,
  Edit,
} from 'lucide-react'
import { ipService } from '@/services/ipService'
import { DataGrade } from '@/types'
import type { IP, IPType, IPStatus } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'
import EntityFormModal, { type FormField } from '@/components/EntityFormModal'

const ipFormFields: FormField[] = [
  { key: 'title', label: '标题', type: 'text', required: true, placeholder: '知识产权名称' },
  { key: 'ipType', label: '类型', type: 'select', required: true, options: [
    { value: 'software', label: '软件著作权' },
    { value: 'patent', label: '发明专利' },
    { value: 'trademark', label: '商标' },
    { value: 'copyright', label: '版权' },
  ]},
  { key: 'registrationNo', label: '编号', type: 'text', placeholder: '注册号/申请号' },
  { key: 'applicant', label: '权利人', type: 'text', placeholder: '申请人/权利人' },
  { key: 'jurisdiction', label: '管辖区域', type: 'text', placeholder: '如 CN, US' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'pending', label: '申请中' },
    { value: 'granted', label: '已授权' },
    { value: 'active', label: '有效' },
    { value: 'rejected', label: '被驳回' },
    { value: 'expired', label: '已过期' },
  ], defaultValue: 'pending' },
  { key: 'filingDate', label: '申请日期', type: 'date' },
  { key: 'grantDate', label: '授权日期', type: 'date' },
  { key: 'expiryDate', label: '到期日期', type: 'date' },
  { key: 'valuation', label: '估值', type: 'number', placeholder: '估值金额', min: 0, step: 1000 },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '简要描述' },
  { key: 'tags', label: '标签', type: 'tags', placeholder: '输入标签后回车' },
]

const typeIcon = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    software: <FileCode className="h-5 w-5 text-blue-500" />,
    patent: <BookmarkCheck className="h-5 w-5 text-purple-500" />,
    trademark: <Copyright className="h-5 w-5 text-green-500" />,
    copyright: <Copyright className="h-5 w-5 text-orange-500" />,
  }
  return map[type] || <Shield className="h-5 w-5 text-gray-400" />
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    software: '软件著作权',
    patent: '发明专利',
    trademark: '商标',
    copyright: '版权',
  }
  return map[type] || type
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '申请中', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  granted: { label: '已授权', color: 'text-green-600', bg: 'bg-green-500/10' },
  rejected: { label: '被驳回', color: 'text-red-600', bg: 'bg-red-500/10' },
  expired: { label: '已过期', color: 'text-gray-600', bg: 'bg-gray-500/10' },
  active: { label: '有效', color: 'text-green-600', bg: 'bg-green-500/10' },
  abandoned: { label: '已放弃', color: 'text-gray-600', bg: 'bg-gray-500/10' },
}

const IPListPage: React.FC = () => {
  const navigate = useNavigate()
  const [ips, setIps] = useState<IP[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IP | null>(null)

  useEffect(() => {
    const loadIPs = async () => {
      try {
        const data = await ipService.getIPs()
        setIps(data)
      } catch (error) {
        console.error('Failed to load IPs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadIPs()
  }, [])

  const reload = async () => {
    const data = await ipService.getIPs()
    setIps(data)
  }

  const handleAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleEdit = (ip: IP) => {
    setEditTarget(ip)
    setModalOpen(true)
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    const base = {
      type: 'ip',
      name: data.title as string,
      dataGrade: DataGrade.L3,
      ipType: (data.ipType as IPType) || 'software',
      title: (data.title as string) || '',
      registrationNo: data.registrationNo as string | undefined,
      applicant: (data.applicant as string) || '',
      jurisdiction: (data.jurisdiction as string) || 'CN',
      status: (data.status as IPStatus) || 'pending',
      filingDate: data.filingDate as string | undefined,
      grantDate: data.grantDate as string | undefined,
      expiryDate: data.expiryDate as string | undefined,
      valuation: data.valuation as number | undefined,
      description: data.description as string | undefined,
      tags: data.tags as string[] | undefined,
      revenueGenerated: 0,
    }
    if (editTarget) {
      await ipService.updateIP(editTarget.id, base)
    } else {
      await ipService.addIP(base)
    }
    await reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条知识产权记录吗？')) return
    await ipService.deleteIP(id)
    await reload()
  }

  const filtered = useMemo(() => {
    return ips.filter((ip) => {
      if (search) {
        const q = search.toLowerCase()
        if (!ip.title.toLowerCase().includes(q) && !(ip.registrationNo ?? '').toLowerCase().includes(q)) return false
      }
      if (typeFilter && ip.ipType !== typeFilter) return false
      if (statusFilter && ip.status !== statusFilter) return false
      return true
    })
  }, [ips, search, typeFilter, statusFilter])

  const stats = useMemo(() => {
    const granted = filtered.filter((i) => i.status === 'granted').length
    const pending = filtered.filter((i) => i.status === 'pending').length
    const totalValuation = filtered.reduce((sum, i) => sum + (i.valuation ?? 0), 0)
    const expiringSoon = filtered.filter((i) => {
      if (!i.expiryDate) return false
      const d = new Date(i.expiryDate)
      const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      return d <= threeMonths && d >= new Date()
    }).length
    return { granted, pending, totalValuation, expiringSoon }
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
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={40} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                知识产权
                <span className="gradient-text ml-2">IP Assets</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>
                共 {filtered.length} 项 · 已授权 {stats.granted} 项 · 申请中 {stats.pending} 项
              </p>
            </div>
            <button
              onClick={() => handleAdd()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
            >
              <Plus className="h-4 w-4" />
              新增IP
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>总资产</span>
              </div>
              <div className="text-2xl font-bold gradient-text">{filtered.length}</div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>估值总额</span>
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>
                {formatCurrency(stats.totalValuation)}
              </div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>即将到期</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            </div>
            <div className="glass-card p-4 anim-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>申请中</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.pending}</div>
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
            placeholder="搜索标题或编号..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-300"
            style={{
              background: 'var(--pao-bg-card)',
              borderColor: 'var(--pao-border)',
              color: 'var(--pao-text-primary)',
            }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{
            background: 'var(--pao-bg-card)',
            borderColor: 'var(--pao-border)',
            color: 'var(--pao-text-primary)',
          }}
        >
          <option value="">全部类型</option>
          <option value="software">软件著作权</option>
          <option value="patent">发明专利</option>
          <option value="trademark">商标</option>
          <option value="copyright">版权</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
          style={{
            background: 'var(--pao-bg-card)',
            borderColor: 'var(--pao-border)',
            color: 'var(--pao-text-primary)',
          }}
        >
          <option value="">全部状态</option>
          <option value="pending">申请中</option>
          <option value="granted">已授权</option>
          <option value="rejected">被驳回</option>
          <option value="expired">已过期</option>
          <option value="active">有效</option>
        </select>
      </div>

      {/* IP Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ip, index) => {
          const sc = statusConfig[ip.status] || { label: ip.status, color: 'text-gray-600', bg: 'bg-gray-500/10' }
          return (
            <div
              key={ip.id}
              onClick={() => navigate(`/ip/${ip.id}`)}
              className="glass-card p-5 cursor-pointer anim-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--pao-bg-hover)' }}>
                    {typeIcon(ip.ipType)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--pao-text-primary)' }}>
                      {ip.title}
                    </h3>
                    <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                      {typeLabel(ip.ipType)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>
                    {sc.label}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(ip) }}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ip.id) }}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 text-red-500 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--pao-bg-hover)' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span>编号</span>
                  <span className="font-mono font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                    {ip.registrationNo || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>权利人</span>
                  <span className="font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                    {ip.applicant || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>申请日</span>
                  <span className="tabular-nums">{ip.filingDate ? formatDate(ip.filingDate) : '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>到期日</span>
                  <span className="tabular-nums">
                    {ip.expiryDate ? formatDate(ip.expiryDate) : '--'}
                  </span>
                </div>
                {ip.valuation != null && ip.valuation > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                    <span>估值</span>
                    <span className="font-bold gradient-text">{formatCurrency(ip.valuation)}</span>
                  </div>
                )}
              </div>

              {ip.tags && ip.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                  {ip.tags.slice(0, 3).map((tag) => (
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
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无知识产权数据</p>
        </div>
      )}

      {/* CRUD Modal */}
      <EntityFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editTarget ? '编辑知识产权' : '新增知识产权'}
        subtitle={editTarget ? '修改知识产权信息' : '录入新的知识产权记录'}
        fields={ipFormFields}
        initialData={editTarget ? (editTarget as unknown as Record<string, unknown>) : undefined}
        accentGradient="linear-gradient(135deg, #6366f1, #06b6d4)"
      />
    </div>
  )
}

export default IPListPage
