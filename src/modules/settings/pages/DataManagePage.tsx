import React, { useState } from 'react'
import {
  Download,
  Upload,
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils/format'
import { Breadcrumb } from '@/components/ui'

interface BackupRecord {
  id: string
  date: string
  size: string
  type: 'manual' | 'auto'
  status: 'completed' | 'failed'
}

const DataManagePage: React.FC = () => {
  const [backups] = useState<BackupRecord[]>([
    { id: 'b1', date: '2026-07-05 02:00', size: '12.8 MB', type: 'auto', status: 'completed' },
    { id: 'b2', date: '2026-07-04 02:00', size: '12.6 MB', type: 'auto', status: 'completed' },
    { id: 'b3', date: '2026-07-03 02:00', size: '12.4 MB', type: 'auto', status: 'completed' },
    { id: 'b4', date: '2026-07-01 15:30', size: '12.3 MB', type: 'manual', status: 'completed' },
    { id: 'b5', date: '2026-06-28 02:00', size: '12.1 MB', type: 'auto', status: 'completed' },
  ])

  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleExport = () => {
    // In production: trigger data export download
    alert('数据导出功能将下载完整数据备份文件')
  }

  const handleImport = () => {
    setImportStatus('importing')
    setTimeout(() => setImportStatus('success'), 1500)
  }

  const stats = [
    { label: '总数据量', value: '15,432 条', icon: <Database className="h-5 w-5 text-blue-600" /> },
    { label: '存储空间', value: '12.8 MB', icon: <HardDrive className="h-5 w-5 text-green-600" /> },
    { label: '最近备份', value: '2026-07-05', icon: <Clock className="h-5 w-5 text-purple-600" /> },
    { label: '备份次数', value: `${backups.length} 次`, icon: <RefreshCw className="h-5 w-5 text-orange-600" /> },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label="数据管理">
      <Breadcrumb items={[
        { label: '系统设置', href: '/settings' },
        { label: '数据管理' },
      ]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理数据导入导出、备份与恢复</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Import/Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Export */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">导出数据</h3>
              <p className="text-xs text-gray-500">将所有数据导出为备份文件</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked id="export-all" className="rounded" />
              <label htmlFor="export-all" className="text-sm text-gray-700">全量导出（所有模块数据）</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked id="export-media" className="rounded" />
              <label htmlFor="export-media" className="text-sm text-gray-700">包含附件和图片</label>
            </div>
            <button
              onClick={handleExport}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              aria-label="开始导出"
            >
              开始导出
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">导入数据</h3>
              <p className="text-xs text-gray-500">从备份文件恢复数据</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center mb-4">
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">拖拽文件到此处或点击上传</p>
            <p className="text-xs text-gray-400">支持 .json, .csv 格式</p>
          </div>
          <button
            onClick={handleImport}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            aria-label="开始导入"
          >
            开始导入
          </button>
          {importStatus === 'importing' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <RefreshCw className="h-4 w-4 animate-spin" />
              正在导入数据...
            </div>
          )}
          {importStatus === 'success' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              数据导入成功
            </div>
          )}
        </div>
      </div>

      {/* Backup History */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          备份记录
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="备份记录表格">
            <thead>
              <tr className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">备份时间</th>
                <th className="px-4 py-3 text-left font-medium">文件大小</th>
                <th className="px-4 py-3 text-center font-medium">类型</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{backup.date}</td>
                  <td className="px-4 py-3 text-gray-600">{backup.size}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${
                      backup.type === 'auto' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {backup.type === 'auto' ? '自动' : '手动'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      成功
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded" aria-label="恢复此备份">
                        恢复
                      </button>
                      <button className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded" aria-label="删除此备份">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50/30 p-6">
        <h3 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          危险操作区
        </h3>
        <p className="text-sm text-red-600 mb-4">
          以下操作不可逆，请在操作前确保已完成数据备份。
        </p>
        <button
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          aria-label="清除所有数据"
        >
          <Trash2 className="h-4 w-4 inline mr-1.5" />
          清除所有数据
        </button>
      </div>
    </div>
  )
}

export default DataManagePage
