import { db } from '@/lib/cloudbase';
import { createCrudService, writeAuditLog, generateId, now, sortBy, matchSearch, safeAdd } from '@/lib/cloudbaseCrud';
import type { FinancialAccount } from '../types';

/**
 * Account Service — CloudBase NoSQL data layer for Financial Accounts
 * 账户数据服务层
 */
const crud = createCrudService<FinancialAccount>('financial_accounts', 'account');

export const accountService = {
  async getAccounts(filters?: {
    type?: string
    status?: string
    search?: string
  }): Promise<FinancialAccount[]> {
    let accounts = await crud.getAll();

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      accounts = accounts.filter(a =>
        a.name.toLowerCase().includes(search) ||
        a.institution.toLowerCase().includes(search)
      );
    }

    if (filters?.type) {
      accounts = accounts.filter(a => a.type === filters.type);
    }

    if (filters?.status) {
      accounts = accounts.filter(a => a.status === filters.status);
    }

    return accounts;
  },

  async getAccountById(id: string): Promise<FinancialAccount | undefined> {
    return await crud.getById(id);
  },

  async addAccount(account: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('account');
    const ts = now();
    const newAccount: FinancialAccount = {
      ...account,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('financial_accounts', newAccount);
    await writeAuditLog('account', id, 'create', undefined, newAccount as unknown as Record<string, unknown>);

    return id;
  },

  async updateAccount(id: string, updates: Partial<FinancialAccount>): Promise<void> {
    const oldAccount = await crud.getById(id);
    if (!oldAccount) throw new Error(`Account ${id} not found`);

    const { data } = await db.collection('financial_accounts').where({ id }).get();
    const docId = (data[0] as any)._id;

    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('financial_accounts').doc(docId).update(updatedFields);

    const updatedAccount: FinancialAccount = {
      ...oldAccount,
      ...updates,
      updatedAt: updatedFields.updatedAt,
    };
    await writeAuditLog('account', id, 'update', oldAccount as unknown as Record<string, unknown>, updatedAccount as unknown as Record<string, unknown>);
  },

  async deleteAccount(id: string): Promise<void> {
    const oldAccount = await crud.getById(id);
    if (!oldAccount) throw new Error(`Account ${id} not found`);

    const { data } = await db.collection('financial_accounts').where({ id }).get();
    const docId = (data[0] as any)._id;

    await db.collection('financial_accounts').doc(docId).remove();
    await writeAuditLog('account', id, 'delete', oldAccount as unknown as Record<string, unknown>, undefined);
  },

  async getTotalBalance(): Promise<number> {
    const accounts = await crud.getAll();
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  },

  /**
   * Seed demo data (for development)
   */
  async seedMockData(mockAccounts: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const existing = await crud.count();
    if (existing > 0) return; // Already seeded
    for (const mock of mockAccounts) {
      const id = generateId('account');
      const ts = now();
      await safeAdd('financial_accounts', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
