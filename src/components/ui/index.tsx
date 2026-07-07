import React, { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { formatDataGrade, formatStatus } from '@/utils/format'

// ==================== Premium Glass Card ====================

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
  const { label, color, bg } = formatDataGrade(grade)
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg font-semibold leading-none',
        sizeClass,
        color,
        bg,
      )}
      style={{
        backdropFilter: 'blur(8px)',
        border: '1px solid currentColor',
        borderWidth: '0 0 0 0',
        opacity: 0.95,
      }}
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
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg font-medium leading-none',
        sizeClass,
        color,
        bg,
      )}
      style={{ backdropFilter: 'blur(8px)' }}
      aria-label={`状态: ${label}`}
    >
      <span
        className={clsx('inline-block h-1.5 w-1.5 rounded-full flex-shrink-0', dotColor)}
        style={{ boxShadow: '0 0 6px currentColor' }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

// ==================== StatCard (Premium) ====================

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
  gradient = 'linear-gradient(135deg, #6366F1, #8B5CF6)',
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
      {/* Glow blob on hover */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: gradient, filter: 'blur(40px)', opacity: 0 }}
        ref={(el) => {
          if (el) el.style.opacity = '0'
        }}
      />

      <div className="relative flex items-start justify-between mb-4">
        {/* Gradient icon container */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            background: gradient,
            boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
          }}
        >
          {icon && (
            <div className="text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
              {icon}
            </div>
          )}
        </div>

        {/* Data grade or trend */}
        <div className="flex items-center gap-2">
          {dataGrade && <DataGradeTag grade={dataGrade} size="sm" />}
          {showTrend && (
            <span
              className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                color: isPositive ? '#10B981' : '#EF4444',
                background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              }}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Value */}
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

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ background: gradient }}
      />
    </div>
  )
}

// ==================== ProgressRing (Premium) ====================

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
  color = '#6366F1',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference
  const gradientId = `progress-gradient-${size}`

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
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--pao-divider)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress ring with gradient + glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#glow-${gradientId})`}
          className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold gradient-text"
          style={{ fontSize: size > 100 ? '1.5rem' : '1rem' }}
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
            <a href={item.href} className="hover:opacity-70 transition-opacity gradient-text font-medium">
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
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300"
        style={{ color: focused ? 'var(--pao-primary)' : 'var(--pao-text-tertiary)' }}
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-64 pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-all duration-300 glass"
        style={{
          color: 'var(--pao-text-primary)',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        }}
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
      className="px-3 py-2 rounded-xl text-sm outline-none glass cursor-pointer"
      style={{ color: 'var(--pao-text-primary)' }}
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
    <div
      className="flex items-center justify-between mt-4 pt-4"
      style={{ borderTop: '1px solid var(--pao-divider)' }}
    >
      <span className="text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>
        共 {total} 条记录，第 {current}/{totalPages} 页
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
          className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 glass"
          style={{ color: 'var(--pao-text-secondary)' }}
          aria-label="上一页"
        >
          上一页
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className="px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:scale-105"
            style={
              page === current
                ? {
                    background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  }
                : { background: 'var(--glass-bg)', color: 'var(--pao-text-secondary)' }
            }
            aria-label={`第 ${page} 页`}
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 glass"
          style={{ color: 'var(--pao-text-secondary)' }}
          aria-label="下一页"
        >
          下一页
        </button>
      </div>
    </div>
  )
}

// ==================== ModuleProgressBar (Premium) ====================

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

  const gradient = color || 'linear-gradient(90deg, #6366F1, #8B5CF6)'

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
          className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
          style={{
            width: `${animatedWidth}%`,
            background: gradient,
            boxShadow: '0 0 8px rgba(99,102,241,0.4)',
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
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
          style={{
            background: 'var(--pao-divider)',
            color: 'var(--pao-text-tertiary)',
          }}
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
