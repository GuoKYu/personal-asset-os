import React, { useState, useEffect } from 'react'
import { X, Check, Loader2 } from 'lucide-react'

export interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'tags'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: string | number
  min?: number
  max?: number
  step?: number
}

export interface EntityFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  title: string
  subtitle?: string
  fields: FormField[]
  initialData?: Record<string, unknown>
  /** Accent gradient for hero header, e.g. 'linear-gradient(135deg, #6366f1, #06b6d4)' */
  accentGradient?: string
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  fields,
  initialData,
  accentGradient = 'linear-gradient(135deg, #6366f1, #06b6d4)',
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ ...initialData })
    } else if (isOpen) {
      const defaults: Record<string, unknown> = {}
      fields.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue
        else if (f.type === 'tags') defaults[f.key] = []
        else if (f.type === 'number') defaults[f.key] = 0
        else defaults[f.key] = ''
      })
      setFormData(defaults)
    }
    setError('')
    setTagInput('')
  }, [isOpen, initialData, fields])

  if (!isOpen) return null

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddTag = (key: string) => {
    const tag = tagInput.trim()
    if (!tag) return
    const current = (formData[key] as string[]) || []
    if (!current.includes(tag)) {
      handleChange(key, [...current, tag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (key: string, tag: string) => {
    const current = (formData[key] as string[]) || []
    handleChange(key, current.filter((t) => t !== tag))
  }

  const handleSubmit = async () => {
    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const val = formData[field.key]
        if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
          setError(`请填写「${field.label}」`)
          return
        }
      }
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !submitting) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose() }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl anim-fade-in-up"
        style={{
          background: 'var(--pao-bg-card)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden px-6 py-5"
          style={{ background: accentGradient }}
        >
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={() => !submitting && onClose()}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--pao-text-primary)' }}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={(formData[field.key] as string) || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border resize-none transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                  style={{
                    background: 'var(--pao-bg-input, var(--pao-bg-hover))',
                    borderColor: 'var(--pao-border)',
                    color: 'var(--pao-text-primary)',
                  }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={(formData[field.key] as string) || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border cursor-pointer transition-all duration-300"
                  style={{
                    background: 'var(--pao-bg-input, var(--pao-bg-hover))',
                    borderColor: 'var(--pao-border)',
                    color: 'var(--pao-text-primary)',
                  }}
                >
                  <option value="">请选择...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'tags' ? (
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(field.key) } }}
                      placeholder={field.placeholder || '输入标签后回车...'}
                      className="flex-1 px-4 py-2 rounded-xl text-sm border transition-all duration-300"
                      style={{
                        background: 'var(--pao-bg-input, var(--pao-bg-hover))',
                        borderColor: 'var(--pao-border)',
                        color: 'var(--pao-text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(field.key)}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: accentGradient }}
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {((formData[field.key] as string[]) || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full"
                        style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-primary)' }}
                      >
                        {tag}
                        <button onClick={() => handleRemoveTag(field.key, tag)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={(formData[field.key] as string | number) ?? ''}
                  onChange={(e) => {
                    const val = field.type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value
                    handleChange(field.key, val)
                  }}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
                  style={{
                    background: 'var(--pao-bg-input, var(--pao-bg-hover))',
                    borderColor: 'var(--pao-border)',
                    color: 'var(--pao-text-primary)',
                  }}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="px-4 py-2.5 rounded-xl text-sm text-red-600 bg-red-500/10">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--pao-border)' }}>
          <button
            onClick={() => !submitting && onClose()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--pao-bg-hover)',
              color: 'var(--pao-text-primary)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: accentGradient }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                确定
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntityFormModal
