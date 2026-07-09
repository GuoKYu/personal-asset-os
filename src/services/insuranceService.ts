import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { InsurancePolicy, InsurancePayment } from '../types';

/**
 * Insurance Service — CloudBase NoSQL data layer for Insurance Policies
 * 保险数据服务层
 */
export const insuranceService = {
  async getPolicies(filters?: {
    type?: string
    status?: string
    insurer?: string
    search?: string
  }): Promise<InsurancePolicy[]> {
    const data = extractList(await db.collection('insurance_policies').get());
    let items = (data || []) as InsurancePolicy[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.policyNumber.toLowerCase().includes(search) ||
        p.insurer.toLowerCase().includes(search)
      );
    }

    if (filters?.type) {
      items = items.filter(p => p.policyType === filters.type);
    }

    if (filters?.status) {
      items = items.filter(p => p.status === filters.status);
    }

    if (filters?.insurer) {
      items = items.filter(p => p.insurer === filters.insurer);
    }

    return items;
  },

  async getPolicyById(id: string): Promise<InsurancePolicy | undefined> {
    const { data } = await db.collection('insurance_policies').where({ id }).get();
    return data?.[0] as InsurancePolicy | undefined;
  },

  async addPolicy(policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('policy');
    const ts = now();
    const newPolicy: InsurancePolicy = {
      ...policy,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('insurance_policies', newPolicy);
    await writeAuditLog('insurance_policy', id, 'create', undefined, newPolicy as unknown as Record<string, unknown>);

    return id;
  },

  async updatePolicy(id: string, updates: Partial<InsurancePolicy>): Promise<void> {
    const { data } = await db.collection('insurance_policies').where({ id }).get();
    const oldPolicy = data?.[0];
    if (!oldPolicy) throw new Error(`Policy ${id} not found`);

    const docId = (oldPolicy as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('insurance_policies').doc(docId).update(updatedFields);

    const updatedPolicy = { ...oldPolicy, ...updatedFields } as InsurancePolicy;
    await writeAuditLog('insurance_policy', id, 'update', oldPolicy as unknown as Record<string, unknown>, updatedPolicy as unknown as Record<string, unknown>);
  },

  async deletePolicy(id: string): Promise<void> {
    const { data } = await db.collection('insurance_policies').where({ id }).get();
    const oldPolicy = data?.[0];
    if (!oldPolicy) throw new Error(`Policy ${id} not found`);

    const docId = (oldPolicy as any)._id;
    await db.collection('insurance_policies').doc(docId).remove();
    await writeAuditLog('insurance_policy', id, 'delete', oldPolicy as unknown as Record<string, unknown>, undefined);
  },

  async getPayments(policyId: string): Promise<InsurancePayment[]> {
    const { data } = await db.collection('insurance_payments').where({ policyId }).get();
    return (data || []) as InsurancePayment[];
  },

  async addPayment(payment: Omit<InsurancePayment, 'id' | 'createdAt'>): Promise<string> {
    const id = generateId('payment');
    const ts = now();

    await safeAdd('insurance_payments', {
      ...payment,
      id,
      createdAt: ts,
    });

    return id;
  },

  async getInsuranceStats(): Promise<{
    totalPolicies: number
    activePolicies: number
    totalCoverage: number
    totalPremium: number
    upcomingPayments: number
  }> {
    const data = extractList(await db.collection('insurance_policies').get());
    const policies = (data || []) as InsurancePolicy[];
    const nowDate = new Date();
    const next30Days = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    let totalCoverage = 0;
    let totalPremium = 0;
    let upcomingPayments = 0;

    for (const p of policies) {
      totalCoverage += p.coverageAmount;
      totalPremium += p.premiumAnnual;

      // Count upcoming payments in next 30 days
      if (p.nextPaymentDate) {
        const nextPayment = new Date(p.nextPaymentDate);
        if (nextPayment >= nowDate && nextPayment <= next30Days) {
          upcomingPayments++;
        }
      }
    }

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalCoverage,
      totalPremium,
      upcomingPayments,
    };
  },

  /**
   * Seed demo data (for development)
   */
  async seedMockData(mockPolicies: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const data = extractList(await db.collection('insurance_policies').get());
    if ((data || []).length > 0) return; // Already seeded
    for (const mock of mockPolicies) {
      const id = generateId('policy');
      const ts = now();
      await safeAdd('insurance_policies', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
