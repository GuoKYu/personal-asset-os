import { db } from '@/lib/cloudbase';
import { createCrudService, writeAuditLog, generateId, now, sortBy, matchSearch, safeAdd } from '@/lib/cloudbaseCrud';
import type { Transaction } from '../types';

/**
 * Transaction Service — CloudBase NoSQL data layer for Transactions
 * 交易数据服务层
 */
const crud = createCrudService<Transaction>('transactions', 'txn');

export const transactionService = {
  async getTransactions(filters?: {
    accountId?: string
    symbol?: string
    type?: string
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<Transaction[]> {
    let transactions = await crud.getAll();

    if (filters?.accountId) {
      transactions = transactions.filter(t => t.accountId === filters.accountId);
    }

    if (filters?.symbol) {
      transactions = transactions.filter(t => t.symbol === filters.symbol);
    }

    if (filters?.type) {
      transactions = transactions.filter(t => t.transactionType === filters.type);
    }

    if (filters?.startDate) {
      transactions = transactions.filter(t => t.tradeDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      transactions = transactions.filter(t => t.tradeDate <= filters.endDate!);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      transactions = transactions.filter(t =>
        t.symbol?.toLowerCase().includes(search) ||
        (t as any).notes?.toLowerCase().includes(search)
      );
    }

    return transactions;
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return await crud.getById(id);
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('txn');
    const ts = now();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('transactions', newTransaction);
    await writeAuditLog('transaction', id, 'create', undefined, newTransaction as unknown as Record<string, unknown>);

    return id;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const oldTransaction = await crud.getById(id);
    if (!oldTransaction) throw new Error(`Transaction ${id} not found`);

    const { data } = await db.collection('transactions').where({ id }).get();
    const docId = (data[0] as any)._id;

    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('transactions').doc(docId).update(updatedFields);

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      ...updates,
      updatedAt: updatedFields.updatedAt,
    };
    await writeAuditLog('transaction', id, 'update', oldTransaction as unknown as Record<string, unknown>, updatedTransaction as unknown as Record<string, unknown>);
  },

  async deleteTransaction(id: string): Promise<void> {
    const oldTransaction = await crud.getById(id);
    if (!oldTransaction) throw new Error(`Transaction ${id} not found`);

    const { data } = await db.collection('transactions').where({ id }).get();
    const docId = (data[0] as any)._id;

    await db.collection('transactions').doc(docId).remove();
    await writeAuditLog('transaction', id, 'delete', oldTransaction as unknown as Record<string, unknown>, undefined);
  },

  async getTransactionStats(accountId?: string): Promise<{
    totalBuy: number
    totalSell: number
    totalDividend: number
    count: number
  }> {
    const transactions = accountId
      ? await crud.query({ accountId })
      : await crud.getAll();

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

  /**
   * Seed demo data (for development)
   */
  async seedMockData(mockTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const existing = await crud.count();
    if (existing > 0) return; // Already seeded
    for (const mock of mockTransactions) {
      const id = generateId('txn');
      const ts = now();
      await safeAdd('transactions', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
