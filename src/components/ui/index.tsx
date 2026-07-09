import React, { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Tag, Input, Select, Pagination as TdPagination } from 'tdesign-react'
import { Search } from 'lucide-react'
import { formatDataGrade, formatStatus } from '@/utils/format'

type TagTheme = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const GRADE_THEME: Record<string, TagTheme> = {
  L1: 'danger',
  L2: 'warning',
  L3: 'primary',
  L4: 'default',
  L5: 'default',
}

const STATUS_THEME: Record<string, TagTheme> = {
  holding: 'success', watching: 'warning', sold: 'default',
  active: 'success', inactive: 'default', closed: 'default',
  pending: 'warning', expired: 'default', cancelled: 'danger',
  applied: 'primary', reviewing: 'warning', granted: 'success', rejected: 'danger',
  planning: 'primary', 'in-progress': 'warning', completed: 'success', paused: 'warning',
  planned: 'primary', dropped: 'default',
  normal: 'success', attention: 'warning', abnormal: 'danger',
  excellent: 'success', good: 'success', fair: 'warning', poor: 'danger',
}

// ==================== GlassCard (flat TDesign card) ====================

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  delay = 0,
  onClick,
}) => {
  return (
    <div
      className={clsx('glass-card anim-fade-in-up p-5', hover && 'cursor-pointer', className)}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

// ==================== DataGradeTag ====================

interface DataGradeTagProps {
  grade: string
  size?: 'sm' | 'md'
}

export const DataGradeTag: React.FC<DataGradeTagProps> = ({ grade, size = 'md' }) => {
  const { label } = formatDataGrade(grade)
  return (
    <Tag theme={GRADE_THEME[grade] || 'default'} variant="light" size={size === 'sm' ? 'small' : 'medium'}>
      {label}
    </Tag>
  )
}

// ==================== StatusTag ====================

interface StatusTagProps {
  status: string
  size?: 'sm' | 'md'
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'md' }) => {
  const { label } = formatStatus(status)
  return (
    <Tag theme={STATUS_THEME[status] || 'default'} variant="light" size={size === 'sm' ? 'small' : 'medium'}>
      {label}
    </Tag>
  )
}

// ==================== StatCard ====================

interface StatCardProps {
  title: string
  value: string
  subValue?: string
  subColor?: string
  icon?: React.ReactNode
  trend?: number
  dataGrade?: string
  onClick?: () => void
  delay?: number
  /** @deprecated retained for call-site compatibility; visual accent is now TDesign brand */
  gradient?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  subColor = '',
  icon,
  trend,
  dataGrade,
  onClick,
  delay = 0,
}) => {
  const isPositive = trend !== undefined && trend >= 0
  const showTrend = trend !== undefined

  return (
    <div
      className={clsx(
        'glass-card anim-fade-in-up p-5 group relative overflow-hidden',
        onClick && 'cursor-pointer',
      )}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      aria-label={`${title}: ${value}`}
    >
      <div className="relative flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: 'var(--pao-primary)', color: '#fff' }}
        >
          {icon && <div className="text-white">{icon}</div>}
        </div>

        <div className="flex items-center gap-2">
          {dataGrade && <DataGradeTag grade={dataGrade} size="sm" />}
          {showTrend && (
            <span
              className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                color: isPositive ? 'var(--td-success-color)' : 'var(--td-error-color)',
                background: isPositive ? 'var(--td-success-color-1)' : 'var(--td-error-color-1)',
              }}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--pao-text-primary)' }}
        >
          {value}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm truncate" style={{ color: 'var(--pao-text-tertiary)' }}>
            {title}
          </span>
          {subValue && (
            <span
              className={clsx('text-xs font-medium flex-shrink-0', subColor)}
              style={!subColor ? { color: 'var(--pao-text-tertiary)' } : undefined}
            >
              {subValue}
            </span>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ background: 'var(--pao-primary)' }}
      />
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
  color = 'var(--pao-primary)',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setTimeout(() => setAnimatedProgress(progress), 100)
    })
    return () => cancelAnimationFrame(timer)
  }, [progress])

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`${label || ''} ${progress}%`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--pao-divider)"
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
          className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ fontSize: size > 100 ? '1.5rem' : '1rem', color: 'var(--pao-text-primary)' }}
        >
          {Math.round(progress)}%
        </span>
        {subLabel && (
          <span className="text-xs mt-0.5" style={{ color: 'var(--pao-text-tertiary)' }}>
            {subLabel}
          </span>
        )}
      </div>
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
    <nav
      aria-label="面包屑导航"
      className="flex items-center gap-1.5 text-sm mb-5"
      style={{ color: 'var(--pao-text-tertiary)' }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <a href={item.href} className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--pao-primary)' }}>
              {item.label}
            </a>
          ) : (
            <span className="font-medium" style={{ color: 'var(--pao-text-primary)' }}>
              {item.label}
            </span>
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
    <Input
      value={value}
      onChange={(v) => onChange(v as string)}
      placeholder={placeholder}
      prefixIcon={<Search className="h-4 w-4" />}
      clearable
      style={{ width: 256 }}
    />
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
    <Select
      value={value || undefined}
      onChange={(v) => onChange((v as string) ?? '')}
      options={options}
      placeholder={placeholder}
      clearable
    />
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
    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--pao-divider)' }}>
      <span className="text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>
        共 {total} 条记录，第 {current}/{totalPages} 页
      </span>
      <TdPagination
        total={total}
        pageSize={pageSize}
        current={current}
        showJumper
        pageSizeOptions={[]}
        onChange={(pageInfo: { current: number }) => onChange(pageInfo.current)}
      />
    </div>
  )
}

// ==================== ModuleProgressBar ====================

interface ModuleProgressBarProps {
  label: string
  progress: number
  color?: string
  delay?: number
}

export const ModuleProgressBar: React.FC<ModuleProgressBarProps> = ({
  label,
  progress,
  color,
  delay = 0,
}) => {
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), 100 + delay * 100)
    return () => clearTimeout(timer)
  }, [progress, delay])

  return (
    <div className="flex items-center gap-3 anim-fade-in-up" style={{ animationDelay: `${delay * 0.08}s` }}>
      <span className="text-sm w-20 truncate" style={{ color: 'var(--pao-text-secondary)' }}>
        {label}
      </span>
      <div
        className="flex-1 h-2.5 rounded-full overflow-hidden relative"
        style={{ background: 'var(--pao-divider)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${animatedWidth}%`,
            background: color || 'var(--pao-primary)',
          }}
        />
      </div>
      <span className="text-sm font-semibold w-10 text-right" style={{ color: 'var(--pao-text-primary)' }}>
        {progress}%
      </span>
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
    <div className="flex flex-col items-center justify-center py-16 text-center anim-fade-in-up">
      {icon && (
        <div
          className="mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--pao-divider)', color: 'var(--pao-text-tertiary)' }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--pao-text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--pao-text-tertiary)' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

// ==================== PageHeader ====================

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between mb-6 anim-fade-in-down">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--pao-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
