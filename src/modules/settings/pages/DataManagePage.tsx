import React, { useState, useEffect } from 'react'
import { Download, Upload, Database, HardDrive, Trash2, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Breadcrumb } from '@/components/ui'
import { db } from '@/lib/cloudbase'
import { seedAllDemoData } from '@/services/seedService'

const COLLECTIONS = [
  'financial_accounts', 'holdings', 'transactions',
  'insurance_policies', 'insurance_payments',
  'ips', 'certificates',
  'growth_paths', 'learning_plans',
  'family_members', 'health_records',
  'documents', 'document_categories',
  'projects',
]

const DataManagePage: React.FC = () => {
  const [stats, setStats] = useState({ totalDocs: 0, collectionCount: 0 })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')
  const [importMsg, setImportMsg] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        let total = 0
        let count = 0
        for (const col of COLLECTIONS) {
          try {
            const result = await db.collection(col).get()
            const docs = (result as any)?.data || (result as any)?.records || []
            total += docs.length
            if (docs.length > 0) count++
          } catch { /* skip failed collections */ }
        }
        setStats({ totalDocs: total, collectionCount: count })
      } catch (err) {
        console.error('Failed to load data stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const allData: Record<string, any[]> = {}
      for (const col of COLLECTIONS) {
        try {
          const result = await db.collection(col).get()
          allData[col] = ((result as any)?.data || (result as any)?.records || []) as any[]
        } catch { allData[col] = [] }
      }

      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personal-asset-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setImportStatus('importing')
      setImportMsg('')
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        let imported = 0
        for (const [col, docs] of Object.entries(data)) {
          if (!Array.isArray(docs)) continue
          for (const doc of docs) {
            try {
              const { _id, ...rest } = doc as any
              await db.collection(col).add(rest)
              imported++
            } catch { /* skip individual failures */ }
          }
        }
        setImportStatus('success')
        setImportMsg(`成功导入 ${imported} 条记录`)
        // reload stats
        window.location.reload()
      } catch (err: any) {
        setImportStatus('error')
        setImportMsg(err?.message || '导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const handleSeed = async () => {
    if (!confirm('将示例数据写入 CloudBase 数据库（已存在的集合会跳过）。\n\n确定继续？')) return
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await seedAllDemoData()
      setSeedMsg(
        res.errors.length === 0
          ? `示例数据已加载完成（共处理 ${res.seeded.length} 个模块）`
          : `部分加载失败：${res.errors.join('；')}`,
      )
      window.location.reload()
    } catch (err: any) {
      setSeedMsg(err?.message || '加载失败')
    } finally {
      setSeeding(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('⚠️ 此操作将清除所有数据且不可恢复！\n\n确定要继续吗？')) return
    if (!confirm('再次确认：所有模块的数据将被永久删除')) return
    try {
      for (const col of COLLECTIONS) {
        try {
          const result = await db.collection(col).get()
          const docs = (result as any)?.data || (result as any)?.records || []
          for (const doc of docs) {
            await db.collection(col).doc(doc._id).remove()
          }
        } catch { /* continue */ }
      }
      alert('所有数据已清除')
      window.location.reload()
    } catch (err) {
      console.error('Clear failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--pao-primary)' }} />
      </div>
    )
  }

  const statCards = [
    { label: '总数据量', value: `${stats.totalDocs} 条`, icon: <Database className="h-5 w-5" style={{ color: 'var(--pao-primary)' }} /> },
    { label: '活跃模块', value: `${stats.collectionCount} 个`, icon: <HardDrive className="h-5 w-5 text-green-600" /> },
    { label: '导出格式', value: 'JSON', icon: <Download className="h-5 w-5 text-purple-600" /> },
    { label: '安全规则', value: 'CUSTOM', icon: <RefreshCw className="h-5 w-5 text-orange-600" /> },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Breadcrumb items={[{ label: '系统设置', href: '/settings' }, { label: '数据管理' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--pao-text-primary)' }}>数据管理</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--pao-text-secondary)' }}>管理数据导入导出、备份与恢复</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="surface-card p-4">
            <div className="flex items-center gap-2 mb-2">{stat.icon}
              <span className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>{stat.label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--pao-text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Export */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--td-brand-color-light)' }}>
              <Download className="h-5 w-5" style={{ color: 'var(--pao-primary)' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--pao-text-primary)' }}>导出数据</h3>
              <p className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>将所有数据导出为 JSON 备份文件</p>
            </div>
          </div>
          <button
            onClick={handleExport} disabled={exporting || stats.totalDocs === 0}
            className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
          >
            {exporting ? '导出中...' : '开始导出'}
          </button>
        </div>

        {/* Import */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--pao-text-primary)' }}>导入数据</h3>
              <p className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>从 JSON 备份文件恢复数据</p>
            </div>
          </div>
          <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4" style={{ borderColor: 'var(--pao-border)' }}>
            <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--pao-text-tertiary)' }} />
            <p className="text-sm mb-1" style={{ color: 'var(--pao-text-secondary)' }}>选择 JSON 备份文件</p>
            <p className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>支持 .json 格式</p>
          </div>
          <button onClick={handleImport}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            选择文件导入
          </button>
          {importStatus === 'success' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 rounded-lg px-3 py-2" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle className="h-4 w-4" /> {importMsg || '导入成功'}
            </div>
          )}
          {importStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="h-4 w-4" /> {importMsg || '导入失败'}
            </div>
          )}
        </div>
      </div>

      {/* Seed demo data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--td-brand-color-light)' }}>
              <Database className="h-5 w-5" style={{ color: 'var(--pao-primary)' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--pao-text-primary)' }}>加载示例数据</h3>
              <p className="text-xs" style={{ color: 'var(--pao-text-tertiary)' }}>将演示数据写入 CloudBase 数据库（已存在则跳过）</p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
          >
            {seeding ? '加载中...' : '加载示例数据'}
          </button>
          {seedMsg && (
            <div className="mt-3 text-sm rounded-lg px-3 py-2" style={{ background: 'var(--td-brand-color-light)', color: 'var(--pao-primary)' }}>
              {seedMsg}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="surface-card p-6" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <h3 className="text-base font-semibold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> 危险操作区
        </h3>
        <p className="text-sm text-red-500 mb-4">以下操作不可逆，请在操作前确保已完成数据备份。</p>
        <button onClick={handleClearAll}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
          <Trash2 className="h-4 w-4 inline mr-1.5" /> 清除所有数据
        </button>
      </div>
    </div>
  )
}

export default DataManagePage
