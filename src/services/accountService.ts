import { db, writeAuditLog } from '../db'
import type { FinancialAccount } from '../types'

/**
 * Account Service — Dexie.js data layer for Financial Accounts
 * 账户数据服务层
 */
export const accountService = {
  async getAccounts(filters?: {
    type?: string
    status?: string
    search?: string
  }): Promise<FinancialAccount[]> {
    let collection = db.financial_accounts.toCollection()

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      collection = collection.filter(a =>
        a.name.toLowerCase().includes(search) ||
        a.institution.toLowerCase().includes(search)
      )
    }

    if (filters?.type) {
      collection = collection.filter(a => a.type === filters.type)
    }

    if (filters?.status) {
      collection = collection.filter(a => a.status === filters.status)
    }

    return await collection.toArray()
  },

  async getAccountById(id: string): Promise<FinancialAccount | undefined> {
    return await db.financial_accounts.get(id)
  },

  async addAccount(account: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `account_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const newAccount: FinancialAccount = {
      ...account,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await db.financial_accounts.add(newAccount)
    await writeAuditLog('account', id, 'create', undefined, newAccount as unknown as Record<string, unknown>)

    return id
  },

  async updateAccount(id: string, updates: Partial<FinancialAccount>): Promise<void> {
    const oldAccount = await db.financial_accounts.get(id)
    if (!oldAccount) throw new Error(`Account ${id} not found`)

    const updatedAccount: FinancialAccount = {
      ...oldAccount,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.financial_accounts.put(updatedAccount)
    await writeAuditLog('account', id, 'update', oldAccount as unknown as Record<string, unknown>, updatedAccount as unknown as Record<string, unknown>)
  },

  async deleteAccount(id: string): Promise<void> {
    const oldAccount = await db.financial_accounts.get(id)
    if (!oldAccount) throw new Error(`Account ${id} not found`)

    await db.financial_accounts.delete(id)
    await writeAuditLog('account', id, 'delete', oldAccount as unknown as Record<string, unknown>, undefined)
  },

  async getTotalBalance(): Promise<number> {
    const accounts = await db.financial_accounts.toArray()
    return accounts.reduce((sum, a) => sum + a.balance, 0)
  },
}
