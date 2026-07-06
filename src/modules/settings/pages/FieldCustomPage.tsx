import React, { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X, MoveUp, MoveDown } from 'lucide-react'
import { Breadcrumb } from '@/components/ui'

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  module: string
  required: boolean
  visible: boolean
  options?: string[]
}

const FieldCustomPage: React.FC = () => {
  const [fields, setFields] = useState<CustomField[]>([
    { id: 'f1', name: '买入评级', type: 'select', module: 'finance', required: false, visible: true, options: ['强烈推荐', '推荐', '中性', '减持'] },
    { id: 'f2', name: '目标价', type: 'number', module: 'finance', required: false, visible: true },
    { id: 'f3', name: '保单备注', type: 'textarea', module: 'insurance', required: false, visible: true },
    { id: 'f4', name: 'IP关联项目', type: 'text', module: 'ip', required: false, visible: false },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const moduleLabel = (m: string) => {
    const map: Record<string, string> = {
      finance: '金融资产管理',
      insurance: '保险保障管理',
      ip: '知识产权管理',
      growth: '成长管理',
      health: '健康管理',
      documents: '文档管理',
      projects: '项目管理',
    }
    return map[m] || m
  }

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      text: '文本',
      number: '数字',
      date: '日期',
      select: '下拉选择',
      textarea: '多行文本',
    }
    return map[t] || t
  }

  const startEdit = (field: CustomField) => {
    setEditingId(field.id)
    setEditName(field.name)
  }

  const saveEdit = (id: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, name: editName } : f)))
    setEditingId(null)
  }

  const toggleVisible = (id: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)))
  }

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label="字段自定义">
      <Breadcrumb items={[
        { label: '系统设置', href: '/settings' },
        { label: '字段自定义' },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">字段自定义</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理各模块的自定义字段，{fields.length} 个自定义字段
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="添加自定义字段"
        >
          <Plus className="h-4 w-4" />
          添加字段
        </button>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="自定义字段列表">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">字段名称</th>
                <th className="px-4 py-3 text-left font-medium">所属模块</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-center font-medium">必填</th>
                <th className="px-4 py-3 text-center font-medium">可见</th>
                <th className="px-4 py-3 text-left font-medium">选项值</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {editingId === field.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded text-sm w-32"
                          aria-label="编辑字段名称"
                        />
                        <button onClick={() => saveEdit(field.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" aria-label="保存">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded" aria-label="取消">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{field.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{moduleLabel(field.module)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                      {typeLabel(field.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {field.required ? (
                      <span className="text-red-500 text-xs font-medium">是</span>
                    ) : (
                      <span className="text-gray-400 text-xs">否</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleVisible(field.id)}
                      className={`text-xs font-medium ${field.visible ? 'text-green-600' : 'text-gray-400'}`}
                      aria-label={`${field.visible ? '隐藏' : '显示'}字段`}
                    >
                      {field.visible ? '可见' : '隐藏'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {field.options ? field.options.join(', ') : '--'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(field)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" aria-label="编辑字段">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteField(field.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" aria-label="删除字段">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Plus className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm">暂无自定义字段，点击上方按钮添加</p>
        </div>
      )}
    </div>
  )
}

export default FieldCustomPage
