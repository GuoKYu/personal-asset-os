import { db, writeAuditLog } from '../db';
import type { IP, IPType, IPStatus } from '../types';

/**
 * IP Service — Dexie.js data layer for Intellectual Property
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
    let collection = db.ips.toCollection();

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(ip =>
        ip.title?.toLowerCase().includes(search) ||
        ip.registrationNo?.toLowerCase().includes(search) ||
        ip.applicant?.toLowerCase().includes(search)
      );
    }

    if (filters?.ipType) {
      collection = collection.filter(ip => ip.ipType === filters.ipType);
    }

    if (filters?.status) {
      collection = collection.filter(ip => ip.status === filters.status);
    }

    if (filters?.jurisdiction) {
      collection = collection.filter(ip => ip.jurisdiction === filters.jurisdiction);
    }

    let ips = await collection.toArray();

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
    return await db.ips.get(id);
  },

  /**
   * Add a new IP
   */
  async addIP(ip: Omit<IP, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `ip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newIP: IP = {
      ...ip,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.ips.add(newIP);
    await writeAuditLog('ip', id, 'create', undefined, newIP as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing IP
   */
  async updateIP(id: string, updates: Partial<IP>): Promise<void> {
    const oldIP = await db.ips.get(id);
    if (!oldIP) throw new Error(`IP ${id} not found`);

    const updatedIP: IP = {
      ...oldIP,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.ips.put(updatedIP);
    await writeAuditLog('ip', id, 'update', oldIP as unknown as Record<string, unknown>, updatedIP as unknown as Record<string, unknown>);
  },

  /**
   * Delete an IP
   */
  async deleteIP(id: string): Promise<void> {
    const oldIP = await db.ips.get(id);
    if (!oldIP) throw new Error(`IP ${id} not found`);

    await db.ips.delete(id);
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
    const ips = await db.ips.toArray();
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

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
      if (ip.expiryDate && new Date(ip.expiryDate) < now) {
        expiredCount++;
      }

      // Expiring soon (within 90 days)
      if (ip.expiryDate && new Date(ip.expiryDate) >= now && new Date(ip.expiryDate) <= threeMonthsFromNow) {
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
    const existing = await db.ips.count();
    if (existing > 0) return; // Already seeded

    for (const mock of mockIPs) {
      const id = `ip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.ips.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
