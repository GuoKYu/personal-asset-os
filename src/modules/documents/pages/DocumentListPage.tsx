import React, { useState, useMemo, useEffect } from 'react'
import EntityFormModal, { type FormField } from '@/components/EntityFormModal'
import {
  Plus,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  FolderOpen,
  Tag,
  Search,
  Calendar,
} from 'lucide-react'
import { documentService } from '@/services/documentService'
import type { Document } from '@/types'
import { formatDate } from '@/utils/format'
import ParticleBackground from '@/components/effects/ParticleBackground'

const fileIcon = (type?: string) => {
  const map: Record<string, React.ReactNode> = {
    pdf: <FileText className="h-8 w-8 text-red-500" />,
    docx: <FileText className="h-8 w-8 text-blue-500" />,
    doc: <FileText className="h-8 w-8 text-blue-500" />,
    xlsx: <FileSpreadsheet className="h-8 w-8 text-green-500" />,
    xls: <FileSpreadsheet className="h-8 w-8 text-green-500" />,
    png: <FileImage className="h-8 w-8 text-purple-500" />,
    jpg: <FileImage className="h-8 w-8 text-purple-500" />,
    jpeg: <FileImage className="h-8 w-8 text-purple-500" />,
  }
  if (!type) return <File className="h-8 w-8 text-gray-400" />
  return map[type.toLowerCase()] || <File className="h-8 w-8 text-gray-400" />
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: '有效', color: 'text-green-600', bg: 'bg-green-500/10' },
  archived: { label: '已归档', color: 'text-gray-600', bg: 'bg-gray-500/10' },
  draft: { label: '草稿', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  expired: { label: '已过期', color: 'text-red-600', bg: 'bg-red-500/10' },
}

const DocumentListPage: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const data = await documentService.getDocuments()
        setDocs(data)
      } catch (error) {
        console.error('Failed to load documents:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDocs()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    docs.forEach((d) => {
      if (d.categoryId) set.add(d.categoryId)
    })
    return Array.from(set)
  }, [docs])

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (search) {
        const q = search.toLowerCase()
        const inTags = d.tags ? d.tags.some((t) => t.toLowerCase().includes(q)) : false
        if (!d.title.toLowerCase().includes(q) && !inTags) return false
      }
      if (selectedCategory && d.categoryId !== selectedCategory) return false
      return true
    })
  }, [docs, search, selectedCategory])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    docs.forEach((d) => {
      const cat = d.categoryId || 'uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [docs])

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
          background: 'linear-gradient(135deg, var(--td-brand-color-light), var(--td-bg-color-container))',
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
                文档库
                <span className="gradient-text ml-2">Documents</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>{filtered.length} 个文档</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
            >
              <Upload className="h-4 w-4" />
              上传文档
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <div className="glass-card p-4 sticky top-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--pao-text-primary)' }}>
              <FolderOpen className="h-4 w-4" style={{ color: 'var(--pao-text-secondary)' }} />
              分类
            </h3>
            <nav>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: selectedCategory === '' ? 'var(--pao-bg-hover)' : 'transparent',
                      color: selectedCategory === '' ? 'var(--pao-accent)' : 'var(--pao-text-secondary)',
                      fontWeight: selectedCategory === '' ? 600 : 400,
                    }}
                  >
                    全部文档
                    <span className="float-right text-xs opacity-60">{docs.length}</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background: selectedCategory === cat ? 'var(--pao-bg-hover)' : 'transparent',
                        color: selectedCategory === cat ? 'var(--pao-accent)' : 'var(--pao-text-secondary)',
                        fontWeight: selectedCategory === cat ? 600 : 400,
                      }}
                    >
                      {cat}
                      <span className="float-right text-xs opacity-60">{categoryCounts[cat] || 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-1">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索文档名称或标签..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border"
              style={{ background: 'var(--pao-bg-card)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((doc, index) => {
              const sc = statusConfig[doc.status] || statusConfig.active
              return (
                <div
                  key={doc.id}
                  className="glass-card p-4 anim-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="flex items-start gap-3">
                    {fileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--pao-text-primary)' }}>
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                          {doc.fileType || 'FILE'}
                        </span>
                        {doc.fileSize != null && (
                          <span className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                            · {(doc.fileSize / 1024).toFixed(0)} KB
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.createdAt)}
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/10"
                      style={{ color: 'var(--pao-text-secondary)' }}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无文档</p>
            </div>
          )}
        </div>
      </div>

      <EntityFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          await documentService.addDocument(data as any);
          const updated = await documentService.getDocuments();
          setDocs(updated);
        }}
        title="上传文档"
        subtitle="添加文档记录，管理您的各类文件资料"
        accentGradient="linear-gradient(135deg, var(--pao-primary), var(--pao-violet))"
        fields={[
          { key: 'title', label: '文档标题', type: 'text', required: true, placeholder: '如：2025年度体检报告' },
          { key: 'category', label: '分类', type: 'text', required: true, placeholder: '如：健康档案' },
          { key: 'type', label: '文件类型', type: 'select', options: [
            { value: 'PDF', label: 'PDF' },
            { value: 'DOCX', label: 'DOCX' },
            { value: 'XLSX', label: 'XLSX' },
            { value: 'image', label: '图片' },
            { value: 'other', label: '其他' },
          ]},
          { key: 'tags', label: '标签', type: 'tags' },
        ]}
      />
    </div>
  )
}

export default DocumentListPage
