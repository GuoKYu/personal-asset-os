import { db, writeAuditLog } from '../db'
import type { Holding } from '../types'

/**
 * Holding Service — Dexie.js data layer for Holdings
 * 持仓数据服务层 - 封装所有持仓相关的数据库操作
 */
export const holdingService = {
  /**
   * Get all holdings with optional filters
   */
  async getHoldings(filters?: {
    search?: string
    market?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<Holding[]> {
    let collection = db.holdings.toCollection()

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      collection = collection.filter(h =>
        h.symbol.toLowerCase().includes(search) ||
        h.name.includes(search)
      )
    }

    if (filters?.market) {
      collection = collection.filter(h => h.market === filters.market)
    }

    if (filters?.status) {
      collection = collection.filter(h => h.status === filters.status)
    }

    let holdings = await collection.toArray()

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof Holding
      const order = filters.sortOrder === 'desc' ? -1 : 1
      holdings.sort((a, b) => {
      const aVal = a[key as keyof Holding]
      const bVal = b[key as keyof Holding]
      if (aVal == null || bVal == null) return 0
      if (aVal < bVal) return -1 * order
      if (aVal > bVal) return 1 * order
        return 0
      })
    }

    return holdings
  },

  /**
   * Get a single holding by ID
   */
  async getHoldingById(id: string): Promise<Holding | undefined> {
    return await db.holdings.get(id)
  },

  /**
   * Add a new holding
   */
  async addHolding(holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `holding_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const newHolding: Holding = {
      ...holding,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await db.holdings.add(newHolding)
    await writeAuditLog('holding', id, 'create', undefined, newHolding as unknown as Record<string, unknown>)

    return id
  },

  /**
   * Update an existing holding
   */
  async updateHolding(id: string, updates: Partial<Holding>): Promise<void> {
    const oldHolding = await db.holdings.get(id)
    if (!oldHolding) throw new Error(`Holding ${id} not found`)

    const updatedHolding: Holding = {
      ...oldHolding,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.holdings.put(updatedHolding)
    await writeAuditLog('holding', id, 'update', oldHolding as unknown as Record<string, unknown>, updatedHolding as unknown as Record<string, unknown>)
  },

  /**
   * Delete a holding
   */
  async deleteHolding(id: string): Promise<void> {
    const oldHolding = await db.holdings.get(id)
    if (!oldHolding) throw new Error(`Holding ${id} not found`)

    await db.holdings.delete(id)
    await writeAuditLog('holding', id, 'delete', oldHolding as unknown as Record<string, unknown>, undefined)
  },

  /**
   * Get portfolio summary stats
   */
  async getPortfolioStats(): Promise<{
    totalValue: number
    totalCost: number
    totalPnL: number
    totalPnLPercent: number
    holdingCount: number
    nearStopLossCount: number
  }> {
    const holdings = await db.holdings.toArray()

    let totalValue = 0
    let totalCost = 0
    let nearStopLossCount = 0

    for (const h of holdings) {
      const value = h.currentPrice * h.quantity
      const cost = h.avgCost * h.quantity
      totalValue += value
      totalCost += cost

      if (h.currentPrice <= (h.stopLossPrice || 0) * 1.08) {
        nearStopLossCount++
      }
    }

    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      holdingCount: holdings.length,
      nearStopLossCount,
    }
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(mockHoldings: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const existing = await db.holdings.count()
    if (existing > 0) return // Already seeded

    for (const mock of mockHoldings) {
      const id = `holding_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const now = new Date().toISOString()
      await db.holdings.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
}
