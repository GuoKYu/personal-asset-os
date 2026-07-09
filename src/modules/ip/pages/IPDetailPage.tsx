import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileCode,
  Copyright,
  BookmarkCheck,
  Shield,
  Building2,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  Trash2,
} from 'lucide-react'
import { ipService } from '@/services/ipService'
import type { IP } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const typeIcon = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    software: <FileCode className="h-6 w-6 text-blue-500" />,
    patent: <BookmarkCheck className="h-6 w-6 text-purple-500" />,
    trademark: <Copyright className="h-6 w-6 text-green-500" />,
    copyright: <Copyright className="h-6 w-6 text-orange-500" />,
  }
  return map[type] || <Shield className="h-6 w-6 text-gray-400" />
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
  applied: { label: '申请中', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  reviewing: { label: '审查中', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  granted: { label: '已授权', color: 'text-green-600', bg: 'bg-green-500/10' },
  rejected: { label: '被驳回', color: 'text-red-600', bg: 'bg-red-500/10' },
  expired: { label: '已过期', color: 'text-gray-600', bg: 'bg-gray-500/10' },
}

const IPDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ip, setIp] = useState<IP | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadIP = async () => {
      if (!id) return
      try {
        const data = await ipService.getIPById(id)
        setIp(data ?? null)
      } catch (error) {
        console.error('Failed to load IP:', error)
      } finally {
        setLoading(false)
      }
    }
    loadIP()
  }, [id])

  const handleDelete = async () => {
    if (!ip || !confirm('确定要删除这条知识产权记录吗？')) return
    try {
      await ipService.deleteIP(ip.id)
      navigate('/ip')
    } catch (error) {
      console.error('Failed to delete IP:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!ip) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <h2 className="text-lg font-medium" style={{ color: 'var(--pao-text-primary)' }}>未找到知识产权信息</h2>
        <button onClick={() => navigate('/ip')} className="text-blue-500 text-sm mt-2">返回IP列表</button>
      </div>
    )
  }

  const sc = statusConfig[ip.status] || { label: ip.status, color: 'text-gray-600', bg: 'bg-gray-500/10' }

  const infoItems = [
    { icon: Shield, label: '编号', value: ip.registrationNo || '--' },
    { icon: Building2, label: '权利人', value: ip.applicant || '--' },
    { icon: Globe, label: '管辖区域', value: ip.jurisdiction || '--' },
    { icon: Calendar, label: '申请日期', value: ip.filingDate ? formatDate(ip.filingDate) : '--' },
    { icon: Calendar, label: '授权日期', value: ip.grantDate ? formatDate(ip.grantDate) : '待授权' },
    { icon: Calendar, label: '到期日期', value: ip.expiryDate ? formatDate(ip.expiryDate) : '--' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
      {/* Back + Hero */}
      <button
        onClick={() => navigate('/ip')}
        className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-blue-500"
        style={{ color: 'var(--pao-text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        返回IP列表
      </button>

      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-container))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={30} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--pao-bg-hover)' }}>
                {typeIcon(ip.ipType)}
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: 'var(--pao-text-primary)' }}>
                  {ip.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>{typeLabel(ip.ipType)}</span>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/ip/${ip.id}/edit`)}
                className="p-2.5 rounded-xl border transition-all duration-300 hover:scale-105"
                style={{ borderColor: 'var(--pao-border)', color: 'var(--pao-text-secondary)' }}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 text-red-500"
                style={{ borderColor: 'var(--pao-border)' }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {infoItems.map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-3 anim-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="h-3.5 w-3.5 opacity-50" style={{ color: 'var(--pao-text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>{item.label}</span>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--pao-text-primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {ip.description && (
        <div className="glass-card p-5 mb-4 anim-fade-in-up">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
            <FileCode className="h-4 w-4 text-blue-500" />
            描述
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--pao-text-secondary)' }}>
            {ip.description}
          </p>
        </div>
      )}

      {/* Valuation & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="glass-card p-5 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold" style={{ color: 'var(--pao-text-primary)' }}>估值</span>
          </div>
          <div className="text-2xl font-bold gradient-text">
            {ip.valuation != null ? formatCurrency(ip.valuation) : '未评估'}
          </div>
          {ip.valuationDate && (
            <div className="text-xs mt-1" style={{ color: 'var(--pao-text-secondary)' }}>
              评估日期: {formatDate(ip.valuationDate)}
            </div>
          )}
        </div>
        <div className="glass-card p-5 anim-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-semibold" style={{ color: 'var(--pao-text-primary)' }}>产生收益</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(ip.revenueGenerated || 0)}
          </div>
        </div>
      </div>

      {/* Tags & Notes */}
      {(ip.tags?.length || ip.notes) && (
        <div className="glass-card p-5 anim-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {ip.tags && ip.tags.length > 0 && (
            <div className="mb-3">
              <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>标签</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {ip.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ip.notes && (
            <div>
              <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>备注</span>
              <p className="text-sm mt-1" style={{ color: 'var(--pao-text-primary)' }}>{ip.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IPDetailPage
