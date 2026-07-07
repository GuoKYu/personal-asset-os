import { db, writeAuditLog } from '../db'
import type { Transaction } from '../types'

/**
 * Transaction Service — Dexie.js data layer for Transactions
 * 交易数据服务层
 */
export const transactionService = {
  async getTransactions(filters?: {
    accountId?: string
    symbol?: string
    type?: string
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<Transaction[]> {
    let collection = db.transactions.toCollection()

    if (filters?.accountId) {
      collection = collection.filter(t => t.accountId === filters.accountId)
    }

    if (filters?.symbol) {
      collection = collection.filter(t => t.symbol === filters.symbol)
    }

    if (filters?.type) {
      collection = collection.filter(t => t.transactionType === filters.type)
    }

    if (filters?.startDate) {
      collection = collection.filter(t => t.tradeDate >= filters.startDate!)
    }

    if (filters?.endDate) {
      collection = collection.filter(t => t.tradeDate <= filters.endDate!)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      collection = collection.filter(t =>
        t.symbol?.toLowerCase().includes(search) ||
        (t as any).notes?.toLowerCase().includes(search)
      )
    }

    return await collection.toArray()
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id)
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await db.transactions.add(newTransaction)
    await writeAuditLog('transaction', id, 'create', undefined, newTransaction as unknown as Record<string, unknown>)

    return id
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const oldTransaction = await db.transactions.get(id)
    if (!oldTransaction) throw new Error(`Transaction ${id} not found`)

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.transactions.put(updatedTransaction)
    await writeAuditLog('transaction', id, 'update', oldTransaction as unknown as Record<string, unknown>, updatedTransaction as unknown as Record<string, unknown>)
  },

  async deleteTransaction(id: string): Promise<void> {
    const oldTransaction = await db.transactions.get(id)
    if (!oldTransaction) throw new Error(`Transaction ${id} not found`)

    await db.transactions.delete(id)
    await writeAuditLog('transaction', id, 'delete', oldTransaction as unknown as Record<string, unknown>, undefined)
  },

  async getTransactionStats(accountId?: string): Promise<{
    totalBuy: number
    totalSell: number
    totalDividend: number
    count: number
  }> {
    const transactions = accountId
      ? await db.transactions.where({ accountId }).toArray()
      : await db.transactions.toArray()

    let totalBuy = 0
    let totalSell = 0
    let totalDividend = 0

    for (const t of transactions) {
      if (t.transactionType === 'buy') totalBuy += t.amount
      if (t.transactionType === 'sell') totalSell += t.amount
      if (t.transactionType === 'dividend') totalDividend += t.amount
    }

    return {
      totalBuy,
      totalSell,
      totalDividend,
      count: transactions.length,
    }
  },
}
