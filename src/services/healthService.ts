import { db, writeAuditLog } from '../db';
import type { FamilyMember, HealthRecord, HealthStatus } from '../types';

/**
 * Health Service — Dexie.js data layer for Health module
 * 健康档案数据服务层 - 封装所有健康档案相关的数据库操作
 */
export const healthService = {
  // ── FamilyMember methods ──

  /**
   * Get all family members
   */
  async getFamilyMembers(search?: string): Promise<FamilyMember[]> {
    let collection = db.family_members.toCollection();

    if (search) {
      const q = search.toLowerCase();
      collection = collection.filter(m =>
        (m.name?.toLowerCase().includes(q) || false) ||
        (m.relationship?.toLowerCase().includes(q) || false)
      );
    }

    return await collection.toArray();
  },

  /**
   * Get a single family member by ID
   */
  async getFamilyMemberById(id: string): Promise<FamilyMember | undefined> {
    return await db.family_members.get(id);
  },

  /**
   * Add a new family member
   */
  async addFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `member_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newMember: FamilyMember = {
      ...member,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.family_members.add(newMember);
    await writeAuditLog('family_member', id, 'create', undefined, newMember as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing family member
   */
  async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<void> {
    const oldMember = await db.family_members.get(id);
    if (!oldMember) throw new Error(`FamilyMember ${id} not found`);

    const updatedMember: FamilyMember = {
      ...oldMember,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.family_members.put(updatedMember);
    await writeAuditLog('family_member', id, 'update', oldMember as unknown as Record<string, unknown>, updatedMember as unknown as Record<string, unknown>);
  },

  /**
   * Delete a family member
   */
  async deleteFamilyMember(id: string): Promise<void> {
    const oldMember = await db.family_members.get(id);
    if (!oldMember) throw new Error(`FamilyMember ${id} not found`);

    // Also delete related health records
    const relatedRecords = await db.health_records.where('memberId').equals(id).toArray();
    for (const record of relatedRecords) {
      await db.health_records.delete(record.id);
      await writeAuditLog('health_record', record.id, 'delete', record as unknown as Record<string, unknown>, undefined);
    }

    await db.family_members.delete(id);
    await writeAuditLog('family_member', id, 'delete', oldMember as unknown as Record<string, unknown>, undefined);
  },

  // ── HealthRecord methods ──

  /**
   * Get all health records with optional filters
   */
  async getHealthRecords(filters?: {
    memberId?: string;
    search?: string;
    type?: string;
    status?: HealthStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<HealthRecord[]> {
    let collection = db.health_records.toCollection();

    if (filters?.memberId) {
      collection = collection.filter(hr => hr.memberId === filters.memberId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(hr =>
        (hr.title?.toLowerCase().includes(search) || false) ||
        (hr.detail?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.type) {
      collection = collection.filter(hr => hr.type === filters.type);
    }

    if (filters?.status) {
      collection = collection.filter(hr => hr.status === filters.status);
    }

    let healthRecords = await collection.toArray();

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof HealthRecord;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      healthRecords.sort((a, b) => {
        const aVal = a[key as keyof HealthRecord];
        const bVal = b[key as keyof HealthRecord];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return healthRecords;
  },

  /**
   * Get a single health record by ID
   */
  async getHealthRecordById(id: string): Promise<HealthRecord | undefined> {
    return await db.health_records.get(id);
  },

  /**
   * Add a new health record
   */
  async addHealthRecord(record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `hr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newRecord: HealthRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.health_records.add(newRecord);
    await writeAuditLog('health_record', id, 'create', undefined, newRecord as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing health record
   */
  async updateHealthRecord(id: string, updates: Partial<HealthRecord>): Promise<void> {
    const oldRecord = await db.health_records.get(id);
    if (!oldRecord) throw new Error(`HealthRecord ${id} not found`);

    const updatedRecord: HealthRecord = {
      ...oldRecord,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.health_records.put(updatedRecord);
    await writeAuditLog('health_record', id, 'update', oldRecord as unknown as Record<string, unknown>, updatedRecord as unknown as Record<string, unknown>);
  },

  /**
   * Delete a health record
   */
  async deleteHealthRecord(id: string): Promise<void> {
    const oldRecord = await db.health_records.get(id);
    if (!oldRecord) throw new Error(`HealthRecord ${id} not found`);

    await db.health_records.delete(id);
    await writeAuditLog('health_record', id, 'delete', oldRecord as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Get health summary stats
   */
  async getHealthStats(): Promise<{
    totalMembers: number;
    totalRecords: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentRecords: HealthRecord[];
  }> {
    const members = await db.family_members.toArray();
    const records = await db.health_records.toArray();

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const record of records) {
      // Count by status
      byStatus[record.status] = (byStatus[record.status] || 0) + 1;

      // Count by type
      byType[record.type] = (byType[record.type] || 0) + 1;
    }

    // Get recent records (last 10)
    const recentRecords = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalMembers: members.length,
      totalRecords: records.length,
      byStatus,
      byType,
      recentRecords,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(
    mockMembers: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>[],
    mockRecords: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<void> {
    const existingMembers = await db.family_members.count();
    if (existingMembers > 0) return; // Already seeded

    for (const mock of mockMembers) {
      const id = `member_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.family_members.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const mock of mockRecords) {
      const id = `hr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.health_records.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
