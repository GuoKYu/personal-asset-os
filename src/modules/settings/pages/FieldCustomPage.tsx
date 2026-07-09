import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Check, X, Loader2 } from 'lucide-react'
import { Breadcrumb } from '@/components/ui'
import { fieldService, type CustomField } from '@/services/fieldService'

const MODULE_LABELS: Record<string, string> = {
  finance: '金融资产管理', insurance: '保险保障管理', ip: '知识产权管理',
  growth: '成长管理', health: '健康管理', documents: '文档管理', projects: '项目管理',
}

const TYPE_LABELS: Record<string, string> = {
  text: '文本', number: '数字', date: '日期', select: '下拉选择', textarea: '多行文本',
}

const FieldCustomPage: React.FC = () => {
  const [fields, setFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fieldService.getAll()
        setFields(data)
      } catch (err) {
        console.error('Failed to load fields:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const startEdit = (field: CustomField) => {
    setEditingId(field.id)
    setEditName(field.name)
  }

  const saveEdit = async (id: string) => {
    const newName = editName.trim()
    if (!newName) return
    setFields(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))
    setEditingId(null)
    try { await fieldService.update(id, { name: newName }) } catch (err) { console.error(err) }
  }

  const toggleVisible = async (id: string) => {
    const field = fields.find(f => f.id === id)
    if (!field) return
    const next = !field.visible
    setFields(prev => prev.map(f => f.id === id ? { ...f, visible: next } : f))
    try { await fieldService.update(id, { visible: next }) } catch (err) { console.error(err) }
  }

  const deleteField = async (id: string) => {
    if (!confirm('确定删除此自定义字段？')) return
    setFields(prev => prev.filter(f => f.id !== id))
    try { await fieldService.remove(id) } catch (err) { console.error(err) }
  }

  const addField = async () => {
    try {
      const id = await fieldService.add({
        name: '新字段', type: 'text', module: 'finance', required: false, visible: true,
      })
      setFields(prev => [...prev, {
        id, name: '新字段', type: 'text', module: 'finance', required: false, visible: true,
      }])
    } catch (err) {
      console.error('Failed to add field:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--pao-primary)' }} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Breadcrumb items={[{ label: '系统设置', href: '/settings' }, { label: '字段自定义' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>字段自定义</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--pao-text-secondary)' }}>
            管理各模块的自定义字段，{fields.length} 个自定义字段
          </p>
        </div>
        <button
          onClick={addField}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
        >
          <Plus className="h-4 w-4" /> 添加字段
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-16 surface-card rounded-xl">
          <Plus className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--pao-text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--pao-text-tertiary)' }}>暂无自定义字段，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="surface-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--pao-bg-hover)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--pao-text-tertiary)' }}>字段名称</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--pao-text-tertiary)' }}>所属模块</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--pao-text-tertiary)' }}>类型</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--pao-text-tertiary)' }}>可见</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--pao-text-tertiary)' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className="transition-colors" style={{ borderBottom: '1px solid var(--pao-divider)' }}>
                    <td className="px-4 py-3">
                      {editingId === field.id ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                            className="px-2 py-1 rounded text-sm w-32" style={{ background: 'var(--pao-bg-input)', borderColor: 'var(--pao-border)', color: 'var(--pao-text-primary)' }} />
                          <button onClick={() => saveEdit(field.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded" style={{ color: 'var(--pao-text-tertiary)' }}><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <span className="font-medium" style={{ color: 'var(--pao-text-primary)' }}>{field.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--pao-text-secondary)' }}>{MODULE_LABELS[field.module] || field.module}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs rounded" style={{ background: 'var(--pao-bg-hover)', color: 'var(--pao-text-secondary)' }}>{TYPE_LABELS[field.type] || field.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleVisible(field.id)} className="text-xs font-medium" style={{ color: field.visible ? '#10B981' : 'var(--pao-text-tertiary)' }}>
                        {field.visible ? '可见' : '隐藏'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(field)} className="p-1.5 rounded hover:text-blue-600" style={{ color: 'var(--pao-text-tertiary)' }}><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteField(field.id)} className="p-1.5 rounded hover:text-red-600" style={{ color: 'var(--pao-text-tertiary)' }}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldCustomPage
