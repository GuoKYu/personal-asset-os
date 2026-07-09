import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { Certificate, CertificateStatus } from '../types';

/**
 * Certificate Service — CloudBase NoSQL data layer for Certificates
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
    const data = extractList(await db.collection('certificates').get());
    let certificates = (data || []) as Certificate[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      certificates = certificates.filter(cert =>
        cert.certName?.toLowerCase().includes(search) ||
        cert.issuingBody?.toLowerCase().includes(search)
      );
    }

    if (filters?.category) {
      certificates = certificates.filter(cert => cert.category === filters.category);
    }

    if (filters?.status) {
      certificates = certificates.filter(cert => cert.status === filters.status);
    }

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
    const { data } = await db.collection('certificates').where({ id }).get();
    return data?.[0] as Certificate | undefined;
  },

  /**
   * Add a new certificate
   */
  async addCertificate(certificate: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('cert');
    const ts = now();
    const newCertificate: Certificate = {
      ...certificate,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('certificates', newCertificate);
    await writeAuditLog('certificate', id, 'create', undefined, newCertificate as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing certificate
   */
  async updateCertificate(id: string, updates: Partial<Certificate>): Promise<void> {
    const { data } = await db.collection('certificates').where({ id }).get();
    const oldCertificate = data?.[0];
    if (!oldCertificate) throw new Error(`Certificate ${id} not found`);

    const docId = (oldCertificate as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('certificates').doc(docId).update(updatedFields);

    const updatedCertificate = { ...oldCertificate, ...updatedFields } as Certificate;
    await writeAuditLog('certificate', id, 'update', oldCertificate as unknown as Record<string, unknown>, updatedCertificate as unknown as Record<string, unknown>);
  },

  /**
   * Delete a certificate
   */
  async deleteCertificate(id: string): Promise<void> {
    const { data } = await db.collection('certificates').where({ id }).get();
    const oldCertificate = data?.[0];
    if (!oldCertificate) throw new Error(`Certificate ${id} not found`);

    const docId = (oldCertificate as any)._id;
    await db.collection('certificates').doc(docId).remove();
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
    const data = extractList(await db.collection('certificates').get());
    const certificates = (data || []) as Certificate[];
    const nowDate = new Date();
    const threeMonthsFromNow = new Date(nowDate.getTime() + 90 * 24 * 60 * 60 * 1000);

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
      if (cert.expiryDate && new Date(cert.expiryDate) < nowDate) {
        expiredCount++;
      }

      // Expiring soon (within 90 days)
      if (cert.expiryDate && new Date(cert.expiryDate) >= nowDate && new Date(cert.expiryDate) <= threeMonthsFromNow) {
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
    const data = extractList(await db.collection('certificates').get());
    if ((data || []).length > 0) return; // Already seeded

    for (const mock of mockCertificates) {
      const id = generateId('cert');
      const ts = now();
      await safeAdd('certificates', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
