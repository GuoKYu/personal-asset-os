import React, { useState, useEffect } from 'react'
import { Dialog, Form, Input, Textarea, Select, DatePicker, TagInput } from 'tdesign-react'

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
  /** Retained for backward compatibility; TDesign Dialog uses a neutral header. */
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
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
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
  }, [isOpen, initialData, fields])

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
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

  const renderField = (field: FormField) => {
    const val = formData[field.key]
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={(val as string) ?? ''}
            onChange={(v) => handleChange(field.key, v)}
            placeholder={field.placeholder}
          />
        )
      case 'select':
        return (
          <Select
            value={(val as string) ?? ''}
            onChange={(v) => handleChange(field.key, v)}
            options={field.options}
            placeholder="请选择..."
            clearable
          />
        )
      case 'tags':
        return (
          <TagInput
            value={(val as string[]) ?? []}
            onChange={(v) => handleChange(field.key, v)}
            placeholder={field.placeholder || '输入标签后回车'}
          />
        )
      case 'date':
        return (
          <DatePicker
            value={(val as string) ?? ''}
            onChange={(v) => handleChange(field.key, v)}
            clearable
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={String((val as number) ?? 0)}
            onChange={(v) => handleChange(field.key, v === '' ? 0 : Number(v))}
            placeholder={field.placeholder}
          />
        )
      default:
        return (
          <Input
            value={(val as string) ?? ''}
            onChange={(v) => handleChange(field.key, v)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <Dialog
      visible={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleSubmit}
      header={title}
      width={560}
      destroyOnClose
      closeOnOverlayClick={!submitting}
      confirmBtn={{ content: submitting ? '提交中...' : '确定', loading: submitting, theme: 'primary' }}
      cancelBtn="取消"
    >
      <div className="pao-scroll-thin" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {subtitle && (
          <p className="mb-4 text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
        <Form>
          {fields.map((field) => (
            <Form.FormItem key={field.key} label={field.label} requiredMark={field.required}>
              {renderField(field)}
            </Form.FormItem>
          ))}
        </Form>
        {error && (
          <div
            className="mt-3 px-3 py-2 rounded text-sm"
            style={{ color: 'var(--td-error-color)', background: 'var(--td-error-color-1)' }}
          >
            {error}
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default EntityFormModal
