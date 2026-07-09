import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { IP, IPType, IPStatus } from '../types';

/**
 * IP Service — CloudBase NoSQL data layer for Intellectual Property
 * 知识产权数据服务层 - 封装所有IP相关的数据库操作
 */
export const ipService = {
  /**
   * Get all IPs with optional filters
   */
  async getIPs(filters?: {
    search?: string;
    ipType?: IPType;
    status?: IPStatus;
    jurisdiction?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IP[]> {
    const data = extractList(await db.collection('ips').get());
    let ips = (data || []) as IP[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      ips = ips.filter(ip =>
        ip.title?.toLowerCase().includes(search) ||
        ip.registrationNo?.toLowerCase().includes(search) ||
        ip.applicant?.toLowerCase().includes(search)
      );
    }

    if (filters?.ipType) {
      ips = ips.filter(ip => ip.ipType === filters.ipType);
    }

    if (filters?.status) {
      ips = ips.filter(ip => ip.status === filters.status);
    }

    if (filters?.jurisdiction) {
      ips = ips.filter(ip => ip.jurisdiction === filters.jurisdiction);
    }

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof IP;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      ips.sort((a, b) => {
        const aVal = a[key as keyof IP];
        const bVal = b[key as keyof IP];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return ips;
  },

  /**
   * Get a single IP by ID
   */
  async getIPById(id: string): Promise<IP | undefined> {
    const { data } = await db.collection('ips').where({ id }).get();
    return data?.[0] as IP | undefined;
  },

  /**
   * Add a new IP
   */
  async addIP(ip: Omit<IP, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('ip');
    const ts = now();
    const newIP: IP = {
      ...ip,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('ips', newIP);
    await writeAuditLog('ip', id, 'create', undefined, newIP as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing IP
   */
  async updateIP(id: string, updates: Partial<IP>): Promise<void> {
    const { data } = await db.collection('ips').where({ id }).get();
    const oldIP = data?.[0];
    if (!oldIP) throw new Error(`IP ${id} not found`);

    const docId = (oldIP as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('ips').doc(docId).update(updatedFields);

    const updatedIP = { ...oldIP, ...updatedFields } as IP;
    await writeAuditLog('ip', id, 'update', oldIP as unknown as Record<string, unknown>, updatedIP as unknown as Record<string, unknown>);
  },

  /**
   * Delete an IP
   */
  async deleteIP(id: string): Promise<void> {
    const { data } = await db.collection('ips').where({ id }).get();
    const oldIP = data?.[0];
    if (!oldIP) throw new Error(`IP ${id} not found`);

    const docId = (oldIP as any)._id;
    await db.collection('ips').doc(docId).remove();
    await writeAuditLog('ip', id, 'delete', oldIP as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Get IP summary stats
   */
  async getIPStats(): Promise<{
    totalCount: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalValuation: number;
    expiredCount: number;
    expiringSoonCount: number;
  }> {
    const data = extractList(await db.collection('ips').get());
    const ips = (data || []) as IP[];
    const nowDate = new Date();
    const threeMonthsFromNow = new Date(nowDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalValuation = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;

    for (const ip of ips) {
      // Count by type
      byType[ip.ipType] = (byType[ip.ipType] || 0) + 1;

      // Count by status
      byStatus[ip.status] = (byStatus[ip.status] || 0) + 1;

      // Total valuation
      if (ip.valuation) {
        totalValuation += ip.valuation;
      }

      // Expired count
      if (ip.expiryDate && new Date(ip.expiryDate) < nowDate) {
        expiredCount++;
      }

      // Expiring soon (within 90 days)
      if (ip.expiryDate && new Date(ip.expiryDate) >= nowDate && new Date(ip.expiryDate) <= threeMonthsFromNow) {
        expiringSoonCount++;
      }
    }

    return {
      totalCount: ips.length,
      byType,
      byStatus,
      totalValuation,
      expiredCount,
      expiringSoonCount,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(mockIPs: Omit<IP, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const data = extractList(await db.collection('ips').get());
    if ((data || []).length > 0) return; // Already seeded

    for (const mock of mockIPs) {
      const id = generateId('ip');
      const ts = now();
      await safeAdd('ips', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
