import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { FamilyMember, HealthRecord, HealthStatus } from '../types';

/**
 * Health Service — CloudBase NoSQL data layer for Health module
 * 健康档案数据服务层 - 封装所有健康档案相关的数据库操作
 */
export const healthService = {
  // ── 内部辅助 ──

  /** 按业务 id 查找文档的 CloudBase _id */
  async _getDocId(collection: string, id: string): Promise<string | undefined> {
    const { data } = await db.collection(collection).where({ id }).get();
    return (data?.[0] as any)?._id;
  },

  // ── FamilyMember methods ──

  /**
   * Get all family members
   */
  async getFamilyMembers(search?: string): Promise<FamilyMember[]> {
    const data = extractList(await db.collection('family_members').get());
    let members = (data || []) as FamilyMember[];

    if (search) {
      const q = search.toLowerCase();
      members = members.filter(m =>
        (m.name?.toLowerCase().includes(q) || false) ||
        (m.relationship?.toLowerCase().includes(q) || false)
      );
    }

    return members;
  },

  /**
   * Get a single family member by ID
   */
  async getFamilyMemberById(id: string): Promise<FamilyMember | undefined> {
    const { data } = await db.collection('family_members').where({ id }).get();
    return data?.[0] as FamilyMember | undefined;
  },

  /**
   * Add a new family member
   */
  async addFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('member');
    const ts = now();
    const newMember: FamilyMember = {
      ...member,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('family_members', newMember);
    await writeAuditLog('family_member', id, 'create', undefined, newMember as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing family member
   */
  async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<void> {
    const { data } = await db.collection('family_members').where({ id }).get();
    const oldMember = data?.[0];
    if (!oldMember) throw new Error(`FamilyMember ${id} not found`);

    const docId = (oldMember as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('family_members').doc(docId).update(updatedFields);

    const updatedMember = { ...oldMember, ...updatedFields } as FamilyMember;
    await writeAuditLog('family_member', id, 'update', oldMember as unknown as Record<string, unknown>, updatedMember as unknown as Record<string, unknown>);
  },

  /**
   * Delete a family member
   */
  async deleteFamilyMember(id: string): Promise<void> {
    const { data: memberData } = await db.collection('family_members').where({ id }).get();
    const oldMember = memberData?.[0];
    if (!oldMember) throw new Error(`FamilyMember ${id} not found`);

    // Also delete related health records
    const { data: relatedRecords } = await db.collection('health_records').where({ memberId: id }).get();
    for (const record of (relatedRecords || [])) {
      const recordDocId = (record as any)._id;
      await db.collection('health_records').doc(recordDocId).remove();
      await writeAuditLog('health_record', (record as any).id, 'delete', record as unknown as Record<string, unknown>, undefined);
    }

    const memberDocId = (oldMember as any)._id;
    await db.collection('family_members').doc(memberDocId).remove();
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
    const data = extractList(await db.collection('health_records').get());
    let healthRecords = (data || []) as HealthRecord[];

    if (filters?.memberId) {
      healthRecords = healthRecords.filter(hr => hr.memberId === filters.memberId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      healthRecords = healthRecords.filter(hr =>
        (hr.title?.toLowerCase().includes(search) || false) ||
        (hr.detail?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.type) {
      healthRecords = healthRecords.filter(hr => hr.type === filters.type);
    }

    if (filters?.status) {
      healthRecords = healthRecords.filter(hr => hr.status === filters.status);
    }

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
    const { data } = await db.collection('health_records').where({ id }).get();
    return data?.[0] as HealthRecord | undefined;
  },

  /**
   * Add a new health record
   */
  async addHealthRecord(record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('hr');
    const ts = now();
    const newRecord: HealthRecord = {
      ...record,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('health_records', newRecord);
    await writeAuditLog('health_record', id, 'create', undefined, newRecord as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing health record
   */
  async updateHealthRecord(id: string, updates: Partial<HealthRecord>): Promise<void> {
    const { data } = await db.collection('health_records').where({ id }).get();
    const oldRecord = data?.[0];
    if (!oldRecord) throw new Error(`HealthRecord ${id} not found`);

    const docId = (oldRecord as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('health_records').doc(docId).update(updatedFields);

    const updatedRecord = { ...oldRecord, ...updatedFields } as HealthRecord;
    await writeAuditLog('health_record', id, 'update', oldRecord as unknown as Record<string, unknown>, updatedRecord as unknown as Record<string, unknown>);
  },

  /**
   * Delete a health record
   */
  async deleteHealthRecord(id: string): Promise<void> {
    const { data } = await db.collection('health_records').where({ id }).get();
    const oldRecord = data?.[0];
    if (!oldRecord) throw new Error(`HealthRecord ${id} not found`);

    const docId = (oldRecord as any)._id;
    await db.collection('health_records').doc(docId).remove();
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
    const members = extractList(await db.collection('family_members').get());
    const records = extractList(await db.collection('health_records').get());

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const record of (records || []) as HealthRecord[]) {
      // Count by status
      byStatus[record.status] = (byStatus[record.status] || 0) + 1;

      // Count by type
      byType[record.type] = (byType[record.type] || 0) + 1;
    }

    // Get recent records (last 10)
    const allRecords = (records || []) as HealthRecord[];
    const recentRecords = allRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalMembers: (members || []).length,
      totalRecords: allRecords.length,
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
    const existingMembers = extractList(await db.collection('family_members').get());
    if ((existingMembers || []).length > 0) return; // Already seeded

    for (const mock of mockMembers) {
      const id = generateId('member');
      const ts = now();
      await safeAdd('family_members', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const mock of mockRecords) {
      const id = generateId('hr');
      const ts = now();
      await safeAdd('health_records', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
