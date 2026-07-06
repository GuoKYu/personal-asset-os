import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertTriangle,
  XCircle,
  Edit3,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Shield,
  Info,
} from 'lucide-react'
import { mockHoldings, mockTransactions } from '@/db/mock-data'
import { formatCurrency, formatPercent, formatDate } from '@/utils/format'
import { Breadcrumb, DataGradeTag, StatusTag } from '@/components/ui'

const HoldingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const holding = mockHoldings.find((h) => h.id === id)

  // Inline edit for stop-loss
  const [editingStopLoss, setEditingStopLoss] = useState(false)
  const [stopLossValue, setStopLossValue] = useState(holding?.stopLossPrice ?? 0)

  // Discipline self-review
  const [disciplineReview, setDisciplineReview] = useState('')
  const [disciplineRating, setDisciplineRating] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  if (!holding) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">未找到持仓信息</h2>
        <Link to="/finance/holdings" className="text-blue-600 text-sm mt-2 inline-block">返回持仓列表</Link>
      </div>
    )
  }

  const pnl = (holding.currentPrice - holding.costPrice) * holding.quantity
  const pnlPercent = ((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100
  const nearStopLoss = holding.currentPrice <= holding.stopLossPrice * 1.08
  const breachedStopLoss = holding.currentPrice <= holding.stopLossPrice

  const relatedTransactions = mockTransactions.filter((t) => t.symbol === holding.symbol)

  const handleSaveStopLoss = () => {
    setEditingStopLoss(false)
    // In production: call API to update
  }

  const handleSubmitReview = () => {
    setReviewSubmitted(true)
  }

  const ratingOptions: { value: 'excellent' | 'good' | 'fair' | 'poor'; label: string; color: string }[] = [
    { value: 'excellent', label: '优秀', color: 'bg-green-500' },
    { value: 'good', label: '良好', color: 'bg-blue-500' },
    { value: 'fair', label: '一般', color: 'bg-yellow-500' },
    { value: 'poor', label: '差', color: 'bg-red-500' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-6" aria-label={`${holding.symbol} 持仓详情`}>
      <Breadcrumb items={[
        { label: '金融资产管理', href: '/finance' },
        { label: '持仓列表', href: '/finance/holdings' },
        { label: holding.symbol },
      ]} />

      {/* Stop-loss Alert Banner */}
      {breachedStopLoss && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-5" role="alert">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <span>止损价已触发！当前价 {formatCurrency(holding.currentPrice)} 低于止损价 {formatCurrency(holding.stopLossPrice)}，请立即处理。</span>
        </div>
      )}
      {!breachedStopLoss && nearStopLoss && (
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm mb-5" role="alert">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>价格接近止损线！当前价 {formatCurrency(holding.currentPrice)}，止损价 {formatCurrency(holding.stopLossPrice)}，请密切关注。</span>
        </div>
      )}

      {/* Detail Card */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{holding.symbol}</h2>
            <span className="text-sm text-gray-500">{holding.name}</span>
            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">{holding.market}</span>
          </div>
          <div className="flex items-center gap-2">
            <DataGradeTag grade={holding.dataGrade} />
            <StatusTag status={holding.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">持仓数量</div>
            <div className="text-lg font-semibold tabular-nums">{holding.quantity} 股</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">成本价</div>
            <div className="text-lg font-semibold tabular-nums">{formatCurrency(holding.costPrice)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">当前价</div>
            <div className="text-lg font-semibold tabular-nums">{formatCurrency(holding.currentPrice)}</div>
          </div>
          <div className={`p-3 rounded-lg ${pnl >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-xs text-gray-500 mb-1">浮动盈亏</div>
            <div className={`text-lg font-semibold tabular-nums ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
            </div>
            <div className={`text-xs ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(pnlPercent, true)}
            </div>
          </div>
        </div>

        {/* Stop-loss */}
        <div className="mt-4 p-3 bg-orange-50/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-700">止损价</span>
          </div>
          {editingStopLoss ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stopLossValue}
                onChange={(e) => setStopLossValue(Number(e.target.value))}
                className="w-28 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                aria-label="编辑止损价"
              />
              <button onClick={handleSaveStopLoss} className="p-1 text-green-600 hover:bg-green-50 rounded" aria-label="保存止损价">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => { setEditingStopLoss(false); setStopLossValue(holding.stopLossPrice) }} className="p-1 text-gray-400 hover:bg-gray-50 rounded" aria-label="取消编辑">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tabular-nums">{formatCurrency(stopLossValue)}</span>
              <button onClick={() => setEditingStopLoss(true)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" aria-label="编辑止损价">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Buy Reason */}
        <div className="mt-4 p-3 bg-blue-50/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">买入理由</span>
          </div>
          <p className="text-sm text-gray-600">{holding.buyReason}</p>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          交易记录
        </h3>
        {relatedTransactions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">暂无相关交易记录</p>
        ) : (
          <div className="space-y-3">
            {relatedTransactions.map((tx) => (
              <div key={tx.id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-100 pb-3 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tx.type === 'buy' ? 'bg-green-50 text-green-600' : tx.type === 'sell' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {tx.type === 'buy' ? '买入' : tx.type === 'sell' ? '卖出' : tx.type === 'dividend' ? '分红' : '转账'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(tx.amount)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {tx.type !== 'transfer' && tx.type !== 'dividend' && `${tx.quantity}股 @ ${formatCurrency(tx.price)}`}
                    {tx.fee > 0 && ` · 手续费 ${formatCurrency(tx.fee)}`}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.reason}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discipline Self-Review */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          交易纪律自评
        </h3>
        {reviewSubmitted ? (
          <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700">
            自评已提交，感谢你的反思！
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">本次交易纪律评分</label>
              <div className="flex gap-2">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDisciplineRating(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      disciplineRating === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    aria-label={`纪律评分: ${opt.label}`}
                    aria-pressed={disciplineRating === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="review-notes" className="block text-sm text-gray-700 mb-2">自评说明</label>
              <textarea
                id="review-notes"
                value={disciplineReview}
                onChange={(e) => setDisciplineReview(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="记录本次交易的纪律执行情况、改进点..."
                aria-label="自评说明"
              />
            </div>
            <button
              onClick={handleSubmitReview}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              提交自评
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HoldingDetailPage
