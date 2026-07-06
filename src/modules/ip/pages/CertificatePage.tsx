import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Award,
  Medal,
  FileBadge,
  Building,
  Globe,
  Landmark,
  Users,
  Calendar,
} from 'lucide-react'
import { mockCertificates } from '@/db/mock-data'
import { formatDate, formatCertificateLevel } from '@/utils/format'
import { Breadcrumb, FilterSelect } from '@/components/ui'

const CertificatePage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = useMemo(() => {
    return mockCertificates.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false
      return true
    })
  }, [typeFilter])

  const levelIcon = (level: string) => {
    const map: Record<string, React.ReactNode> = {
      national: <Globe className="h-4 w-4" />,
      provincial: <Landmark className="h-4 w-4" />,
      city: <Building className="h-4 w-4" />,
      organization: <Users className="h-4 w-4" />,
    }
    return map[level] || null
  }

  const typeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      certificate: <FileBadge className="h-5 w-5 text-blue-600" />,
      honor: <Medal className="h-5 w-5 text-yellow-600" />,
      license: <Award className="h-5 w-5 text-green-600" />,
    }
    return map[type as keyof typeof map] || null
  }

  const typeBg = (type: string) => {
    const map: Record<string, string> = {
      certificate: 'bg-blue-50',
      honor: 'bg-yellow-50',
      license: 'bg-green-50',
    }
    return map[type as keyof typeof map] || 'bg-gray-50'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="证书荣誉墙">
      <Breadcrumb items={[
        { label: '知识产权管理', href: '/ip' },
        { label: '证书荣誉' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">证书与荣誉</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} 项证书与荣誉</p>
        </div>
        <Link
          to="/ip/certificates/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="添加证书"
        >
          <Plus className="h-4 w-4" />
          添加证书
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="全部类型"
          options={[
            { value: 'certificate', label: '资格证书' },
            { value: 'honor', label: '荣誉奖项' },
            { value: 'license', label: '执照许可' },
          ]}
        />
      </div>

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cert) => {
          const levelInfo = formatCertificateLevel(cert.level)
          return (
            <div
              key={cert.id}
              className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              aria-label={`${cert.title} 证书`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${typeBg(cert.type)}`}>
                  {typeIcon(cert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{cert.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-50 ${levelInfo.color}`}>
                  {levelIcon(cert.level)}
                  {levelInfo.label}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>颁发: {formatDate(cert.issueDate)}</span>
                </div>
                {cert.expiryDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>有效期至: {formatDate(cert.expiryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm">暂无相关证书或荣誉</p>
        </div>
      )}
    </div>
  )
}

export default CertificatePage
