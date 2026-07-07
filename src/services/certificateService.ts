import { db, writeAuditLog } from '../db';
import type { Certificate, CertificateStatus } from '../types';

/**
 * Certificate Service — Dexie.js data layer for Certificates
 * 证书数据服务层 - 封装所有证书相关的数据库操作
 */
export const certificateService = {
  /**
   * Get all certificates with optional filters
   */
  async getCertificates(filters?: {
    search?: string;
    category?: string;
    status?: CertificateStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Certificate[]> {
    let collection = db.certificates.toCollection();

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(cert =>
        cert.certName?.toLowerCase().includes(search) ||
        cert.issuingBody?.toLowerCase().includes(search)
      );
    }

    if (filters?.category) {
      collection = collection.filter(cert => cert.category === filters.category);
    }

    if (filters?.status) {
      collection = collection.filter(cert => cert.status === filters.status);
    }

    let certificates = await collection.toArray();

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof Certificate;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      certificates.sort((a, b) => {
        const aVal = a[key as keyof Certificate];
        const bVal = b[key as keyof Certificate];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return certificates;
  },

  /**
   * Get a single certificate by ID
   */
  async getCertificateById(id: string): Promise<Certificate | undefined> {
    return await db.certificates.get(id);
  },

  /**
   * Add a new certificate
   */
  async addCertificate(certificate: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newCertificate: Certificate = {
      ...certificate,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.certificates.add(newCertificate);
    await writeAuditLog('certificate', id, 'create', undefined, newCertificate as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing certificate
   */
  async updateCertificate(id: string, updates: Partial<Certificate>): Promise<void> {
    const oldCertificate = await db.certificates.get(id);
    if (!oldCertificate) throw new Error(`Certificate ${id} not found`);

    const updatedCertificate: Certificate = {
      ...oldCertificate,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.certificates.put(updatedCertificate);
    await writeAuditLog('certificate', id, 'update', oldCertificate as unknown as Record<string, unknown>, updatedCertificate as unknown as Record<string, unknown>);
  },

  /**
   * Delete a certificate
   */
  async deleteCertificate(id: string): Promise<void> {
    const oldCertificate = await db.certificates.get(id);
    if (!oldCertificate) throw new Error(`Certificate ${id} not found`);

    await db.certificates.delete(id);
    await writeAuditLog('certificate', id, 'delete', oldCertificate as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Get certificate summary stats
   */
  async getCertificateStats(): Promise<{
    totalCount: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    expiredCount: number;
    expiringSoonCount: number;
  }> {
    const certificates = await db.certificates.toArray();
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let expiredCount = 0;
    let expiringSoonCount = 0;

    for (const cert of certificates) {
      // Count by category
      byCategory[cert.category] = (byCategory[cert.category] || 0) + 1;

      // Count by status
      byStatus[cert.status] = (byStatus[cert.status] || 0) + 1;

      // Expired count
      if (cert.expiryDate && new Date(cert.expiryDate) < now) {
        expiredCount++;
      }

      // Expiring soon (within 90 days)
      if (cert.expiryDate && new Date(cert.expiryDate) >= now && new Date(cert.expiryDate) <= threeMonthsFromNow) {
        expiringSoonCount++;
      }
    }

    return {
      totalCount: certificates.length,
      byCategory,
      byStatus,
      expiredCount,
      expiringSoonCount,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(mockCertificates: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const existing = await db.certificates.count();
    if (existing > 0) return; // Already seeded

    for (const mock of mockCertificates) {
      const id = `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.certificates.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
