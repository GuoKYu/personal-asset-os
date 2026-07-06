import React from 'react'
import { formatDataGrade, formatStatus } from '@/utils/format'

// ==================== DataGradeTag ====================

interface DataGradeTagProps {
  grade: string
  size?: 'sm' | 'md'
}

export const DataGradeTag: React.FC<DataGradeTagProps> = ({ grade, size = 'md' }) => {
  const { label, color, bg } = formatDataGrade(grade)
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClass} ${color} ${bg}`}
      aria-label={`数据分级: ${label}`}
    >
      {label}
    </span>
  )
}

// ==================== StatusTag ====================

interface StatusTagProps {
  status: string
  size?: 'sm' | 'md'
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'md' }) => {
  const { label, color, bg, dotColor } = formatStatus(status)
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium ${sizeClass} ${color} ${bg}`}
      aria-label={`状态: ${label}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  )
}

// ==================== StatCard ====================

interface StatCardProps {
  title: string
  value: string
  subValue?: string
  subColor?: string
  icon?: React.ReactNode
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  subColor = 'text-gray-500',
  icon,
  onClick,
}) => {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subValue && (
        <div className={`mt-1 text-sm ${subColor}`}>{subValue}</div>
      )}
    </div>
  )
}

// ==================== ProgressRing ====================

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
  subLabel?: string
  color?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  subLabel,
  color = '#3B82F6',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center" aria-label={`${label || ''} ${progress}%`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-in-out"
        />
      </svg>
      {label && (
        <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
          <span className="text-xl font-bold text-gray-900">{progress}%</span>
          {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
        </div>
      )}
    </div>
  )
}

// ==================== Breadcrumb ====================

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="面包屑导航" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <a href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// ==================== SearchInput ====================

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '搜索...',
}) => {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        aria-label={placeholder}
      />
    </div>
  )
}

// ==================== FilterSelect ====================

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '全部',
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ==================== Pagination ====================

interface PaginationProps {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        共 {total} 条记录，第 {current}/{totalPages} 页
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          aria-label="上一页"
        >
          上一页
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`px-3 py-1.5 text-sm border rounded-lg ${
              page === current
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            aria-label={`第 ${page} 页`}
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current >= totalPages}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          aria-label="下一页"
        >
          下一页
        </button>
      </div>
    </div>
  )
}

// ==================== ModuleProgressBar ====================

interface ModuleProgressBarProps {
  label: string
  progress: number
  color?: string
}

export const ModuleProgressBar: React.FC<ModuleProgressBarProps> = ({
  label,
  progress,
  color = 'bg-blue-500',
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 w-10 text-right">{progress}%</span>
    </div>
  )
}

// ==================== EmptyState ====================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}
