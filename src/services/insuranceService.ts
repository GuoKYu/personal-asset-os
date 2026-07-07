import { db, writeAuditLog } from '../db'
import type { InsurancePolicy, InsurancePayment } from '../types'

/**
 * Insurance Service — Dexie.js data layer for Insurance Policies
 * 保险数据服务层
 */
export const insuranceService = {
  async getPolicies(filters?: {
    type?: string
    status?: string
    insurer?: string
    search?: string
  }): Promise<InsurancePolicy[]> {
    let collection = db.insurance_policies.toCollection()

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      collection = collection.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.policyNumber.toLowerCase().includes(search) ||
        p.insurer.toLowerCase().includes(search)
      )
    }

    if (filters?.type) {
      collection = collection.filter(p => p.policyType === filters.type)
    }

    if (filters?.status) {
      collection = collection.filter(p => p.status === filters.status)
    }

    if (filters?.insurer) {
      collection = collection.filter(p => p.insurer === filters.insurer)
    }

    return await collection.toArray()
  },

  async getPolicyById(id: string): Promise<InsurancePolicy | undefined> {
    return await db.insurance_policies.get(id)
  },

  async addPolicy(policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `policy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const newPolicy: InsurancePolicy = {
      ...policy,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await db.insurance_policies.add(newPolicy)
    await writeAuditLog('insurance_policy', id, 'create', undefined, newPolicy as unknown as Record<string, unknown>)

    return id
  },

  async updatePolicy(id: string, updates: Partial<InsurancePolicy>): Promise<void> {
    const oldPolicy = await db.insurance_policies.get(id)
    if (!oldPolicy) throw new Error(`Policy ${id} not found`)

    const updatedPolicy: InsurancePolicy = {
      ...oldPolicy,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.insurance_policies.put(updatedPolicy)
    await writeAuditLog('insurance_policy', id, 'update', oldPolicy as unknown as Record<string, unknown>, updatedPolicy as unknown as Record<string, unknown>)
  },

  async deletePolicy(id: string): Promise<void> {
    const oldPolicy = await db.insurance_policies.get(id)
    if (!oldPolicy) throw new Error(`Policy ${id} not found`)

    await db.insurance_policies.delete(id)
    await writeAuditLog('insurance_policy', id, 'delete', oldPolicy as unknown as Record<string, unknown>, undefined)
  },

  async getPayments(policyId: string): Promise<InsurancePayment[]> {
    return await db.insurance_payments.where({ policyId }).toArray()
  },

  async addPayment(payment: Omit<InsurancePayment, 'id' | 'createdAt'>): Promise<string> {
    const id = `payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()

    await db.insurance_payments.add({
      ...payment,
      id,
      createdAt: now,
    })

    return id
  },

  async getInsuranceStats(): Promise<{
    totalPolicies: number
    activePolicies: number
    totalCoverage: number
    totalPremium: number
    upcomingPayments: number
  }> {
    const policies = await db.insurance_policies.toArray()
    const now = new Date()
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let totalCoverage = 0
    let totalPremium = 0
    let upcomingPayments = 0

    for (const p of policies) {
      totalCoverage += p.coverageAmount
      totalPremium += p.premiumAnnual

      // Count upcoming payments in next 30 days
      if (p.nextPaymentDate) {
        const nextPayment = new Date(p.nextPaymentDate)
        if (nextPayment >= now && nextPayment <= next30Days) {
          upcomingPayments++
        }
      }
    }

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalCoverage,
      totalPremium,
      upcomingPayments,
    }
  },
}
