// 格式化工具函数

/**
 * 格式化金额为人民币
 */
export function formatCurrency(value: number | null | undefined, compact = false): string {
  // 防御 undefined/null/NaN（CloudBase 数据缺失时可能发生）
  if (value == null || isNaN(value)) return '¥0.00';
  if (compact) {
    if (Math.abs(value) >= 100000000) {
      return `¥${(value / 100000000).toFixed(2)}亿`
    }
    if (Math.abs(value) >= 10000) {
      return `¥${(value / 10000).toFixed(2)}万`
    }
  }
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, withSign = false): string {
  const prefix = withSign && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string, format: 'default' | 'short' | 'long' = 'default'): string {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (format) {
    case 'short':
      return `${month}-${day}`
    case 'long':
      return `${year}年${month}月${day}日`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 获取数据分级标签颜色
 */
export function formatDataGrade(grade: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    L1: { label: 'L1 核心', color: 'text-red-700', bg: 'bg-red-50' },
    L2: { label: 'L2 重要', color: 'text-orange-700', bg: 'bg-orange-50' },
    L3: { label: 'L3 常规', color: 'text-blue-700', bg: 'bg-blue-50' },
    L4: { label: 'L4 参考', color: 'text-gray-700', bg: 'bg-gray-100' },
    L5: { label: 'L5 探索', color: 'text-gray-500', bg: 'bg-gray-50' },
  }
  return map[grade] || { label: grade, color: 'text-gray-500', bg: 'bg-gray-50' }
}

/**
 * 获取状态标签样式
 */
export function formatStatus(status: string): { label: string; color: string; bg: string; dotColor: string } {
  const map: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
    // 持仓状态
    holding: { label: '持仓中', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    watching: { label: '观察中', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    sold: { label: '已卖出', color: 'text-gray-500', bg: 'bg-gray-100', dotColor: 'bg-gray-400' },
    // 账户状态
    active: { label: '活跃', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    inactive: { label: '休眠', color: 'text-gray-500', bg: 'bg-gray-100', dotColor: 'bg-gray-400' },
    closed: { label: '已关闭', color: 'text-red-700', bg: 'bg-red-50', dotColor: 'bg-red-500' },
    // 保单状态
    pending: { label: '待生效', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    expired: { label: '已过期', color: 'text-gray-500', bg: 'bg-gray-100', dotColor: 'bg-gray-400' },
    cancelled: { label: '已取消', color: 'text-red-700', bg: 'bg-red-50', dotColor: 'bg-red-500' },
    // IP状态
    applied: { label: '申请中', color: 'text-blue-700', bg: 'bg-blue-50', dotColor: 'bg-blue-500' },
    reviewing: { label: '审查中', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    granted: { label: '已授权', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    rejected: { label: '被驳回', color: 'text-red-700', bg: 'bg-red-50', dotColor: 'bg-red-500' },
    // 项目状态
    planning: { label: '规划中', color: 'text-blue-700', bg: 'bg-blue-50', dotColor: 'bg-blue-500' },
    'in-progress': { label: '进行中', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    completed: { label: '已完成', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    paused: { label: '已暂停', color: 'text-orange-700', bg: 'bg-orange-50', dotColor: 'bg-orange-500' },
    // 学习状态
    planned: { label: '计划中', color: 'text-blue-700', bg: 'bg-blue-50', dotColor: 'bg-blue-500' },
    dropped: { label: '已放弃', color: 'text-gray-500', bg: 'bg-gray-100', dotColor: 'bg-gray-400' },
    // 健康状态
    normal: { label: '正常', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    attention: { label: '注意', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    abnormal: { label: '异常', color: 'text-red-700', bg: 'bg-red-50', dotColor: 'bg-red-500' },
    // 交易纪律
    excellent: { label: '优秀', color: 'text-green-700', bg: 'bg-green-50', dotColor: 'bg-green-500' },
    good: { label: '良好', color: 'text-blue-700', bg: 'bg-blue-50', dotColor: 'bg-blue-500' },
    fair: { label: '一般', color: 'text-yellow-700', bg: 'bg-yellow-50', dotColor: 'bg-yellow-500' },
    poor: { label: '差', color: 'text-red-700', bg: 'bg-red-50', dotColor: 'bg-red-500' },
  }
  return map[status] || { label: status, color: 'text-gray-500', bg: 'bg-gray-50', dotColor: 'bg-gray-400' }
}

/**
 * 获取保单类型标签
 */
export function formatPolicyType(type: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    health: { label: '医疗险', color: 'text-green-600' },
    life: { label: '寿险', color: 'text-blue-600' },
    accident: { label: '意外险', color: 'text-orange-600' },
    critical: { label: '重疾险', color: 'text-red-600' },
    property: { label: '财产险', color: 'text-purple-600' },
  }
  return map[type] || { label: type, color: 'text-gray-500' }
}

/**
 * 获取证书级别标签
 */
export function formatCertificateLevel(level: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    national: { label: '国家级', color: 'text-red-600' },
    provincial: { label: '省级', color: 'text-blue-600' },
    city: { label: '市级', color: 'text-green-600' },
    organization: { label: '机构', color: 'text-gray-600' },
  }
  return map[level] || { label: level, color: 'text-gray-500' }
}

/**
 * 获取晨昏问候语
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

/**
 * 获取今天的日期字符串
 */
export function getTodayDate(): string {
  const now = new Date()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
}
