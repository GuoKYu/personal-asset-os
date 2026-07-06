import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'
import { mockDocuments } from '@/db/mock-data'
import { formatDate } from '@/utils/format'
import { Breadcrumb, SearchInput, Pagination as Pager } from '@/components/ui'

const DocumentListPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const categories = useMemo(() => {
    return [...new Set(mockDocuments.map((d) => d.category))]
  }, [])

  const filtered = useMemo(() => {
    return mockDocuments.filter((d) => {
      if (search && !d.title.includes(search) && !d.tags.some((t) => t.includes(search))) return false
      if (selectedCategory && d.category !== selectedCategory) return false
      return true
    })
  }, [search, selectedCategory])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const fileIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      PDF: <FileText className="h-8 w-8 text-red-500" />,
      DOCX: <FileText className="h-8 w-8 text-blue-500" />,
      XLSX: <FileSpreadsheet className="h-8 w-8 text-green-500" />,
      PNG: <FileImage className="h-8 w-8 text-purple-500" />,
      JPG: <FileImage className="h-8 w-8 text-purple-500" />,
    }
    return map[type] || <File className="h-8 w-8 text-gray-400" />
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockDocuments.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="文档库">
      <Breadcrumb items={[
        { label: '文档管理', href: '/documents' },
        { label: '文档列表' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文档库</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} 个文档</p>
        </div>
        <Link
          to="/documents/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="上传文档"
        >
          <Upload className="h-4 w-4" />
          上传文档
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gray-400" />
              分类
            </h3>
            <nav aria-label="文档分类">
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === '' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    全部文档
                    <span className="float-right text-xs text-gray-400">{mockDocuments.length}</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                      <span className="float-right text-xs text-gray-400">{categoryCounts[cat] || 0}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-1">
          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="搜索文档名称或标签..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paged.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                aria-label={`${doc.title} 文档`}
              >
                <div className="flex items-start gap-3">
                  {fileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{doc.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.type} · {doc.size}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(doc.uploadedAt)}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500 flex items-center gap-0.5">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" aria-label="下载文档">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Pager current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentListPage
