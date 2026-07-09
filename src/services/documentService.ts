import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { Document, DocumentCategory, DocumentStatus } from '../types';

/**
 * Document Service — CloudBase NoSQL data layer for Documents module
 * 文档管理数据服务层 - 封装所有文档管理相关的数据库操作
 */
export const documentService = {
  // ── DocumentCategory methods ──

  /**
   * Get all document categories
   */
  async getCategories(): Promise<DocumentCategory[]> {
    const data = extractList(await db.collection('document_categories').get());
    const categories = (data || []) as DocumentCategory[];
    // Sort by parentId, then by sortOrder
    categories.sort((a, b) => {
      if (a.parentId !== b.parentId) {
        return (a.parentId || '').localeCompare(b.parentId || '');
      }
      return a.sortOrder - b.sortOrder;
    });
    return categories;
  },

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<DocumentCategory | undefined> {
    const { data } = await db.collection('document_categories').where({ id }).get();
    return data?.[0] as DocumentCategory | undefined;
  },

  /**
   * Add a new category
   */
  async addCategory(category: Omit<DocumentCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('cat');
    const ts = now();
    const newCategory: DocumentCategory = {
      ...category,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('document_categories', newCategory);
    await writeAuditLog('document_category', id, 'create', undefined, newCategory as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<DocumentCategory>): Promise<void> {
    const { data } = await db.collection('document_categories').where({ id }).get();
    const oldCategory = data?.[0];
    if (!oldCategory) throw new Error(`DocumentCategory ${id} not found`);

    const docId = (oldCategory as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('document_categories').doc(docId).update(updatedFields);

    const updatedCategory = { ...oldCategory, ...updatedFields } as DocumentCategory;
    await writeAuditLog('document_category', id, 'update', oldCategory as unknown as Record<string, unknown>, updatedCategory as unknown as Record<string, unknown>);
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const { data: catData } = await db.collection('document_categories').where({ id }).get();
    const oldCategory = catData?.[0];
    if (!oldCategory) throw new Error(`DocumentCategory ${id} not found`);

    // Also delete documents in this category
    const { data: relatedDocs } = await db.collection('documents').where({ categoryId: id }).get();
    for (const doc of (relatedDocs || [])) {
      const docDocId = (doc as any)._id;
      await db.collection('documents').doc(docDocId).remove();
      await writeAuditLog('document', (doc as any).id, 'delete', doc as unknown as Record<string, unknown>, undefined);
    }

    const catDocId = (oldCategory as any)._id;
    await db.collection('document_categories').doc(catDocId).remove();
    await writeAuditLog('document_category', id, 'delete', oldCategory as unknown as Record<string, unknown>, undefined);
  },

  // ── Document methods ──

  /**
   * Get all documents with optional filters
   */
  async getDocuments(filters?: {
    categoryId?: string;
    search?: string;
    status?: DocumentStatus;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Document[]> {
    const data = extractList(await db.collection('documents').get());
    let documents = (data || []) as Document[];

    if (filters?.categoryId) {
      documents = documents.filter(doc => doc.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      documents = documents.filter(doc =>
        (doc.title?.toLowerCase().includes(search) || false) ||
        (doc.content?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      documents = documents.filter(doc => doc.status === filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tags = filters.tags;
      documents = documents.filter(doc =>
        doc.tags ? tags.some(tag => doc.tags!.includes(tag)) : false
      );
    }

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof Document;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      documents.sort((a, b) => {
        const aVal = a[key as keyof Document];
        const bVal = b[key as keyof Document];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return documents;
  },

  /**
   * Get a single document by ID
   */
  async getDocumentById(id: string): Promise<Document | undefined> {
    const { data } = await db.collection('documents').where({ id }).get();
    return data?.[0] as Document | undefined;
  },

  /**
   * Add a new document
   */
  async addDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('doc');
    const ts = now();
    const newDocument: Document = {
      ...document,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('documents', newDocument);
    await writeAuditLog('document', id, 'create', undefined, newDocument as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const { data } = await db.collection('documents').where({ id }).get();
    const oldDocument = data?.[0];
    if (!oldDocument) throw new Error(`Document ${id} not found`);

    const docId = (oldDocument as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('documents').doc(docId).update(updatedFields);

    const updatedDocument = { ...oldDocument, ...updatedFields } as Document;
    await writeAuditLog('document', id, 'update', oldDocument as unknown as Record<string, unknown>, updatedDocument as unknown as Record<string, unknown>);
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const { data } = await db.collection('documents').where({ id }).get();
    const oldDocument = data?.[0];
    if (!oldDocument) throw new Error(`Document ${id} not found`);

    const docId = (oldDocument as any)._id;
    await db.collection('documents').doc(docId).remove();
    await writeAuditLog('document', id, 'delete', oldDocument as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Get document summary stats
   */
  async getDocumentStats(): Promise<{
    totalDocuments: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalSize: number;
  }> {
    const documents = extractList(await db.collection('documents').get());
    const categories = extractList(await db.collection('document_categories').get());

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalSize = 0;

    for (const doc of (documents || []) as Document[]) {
      // Count by status
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;

      // Count by category
      if (doc.categoryId) {
        byCategory[doc.categoryId] = (byCategory[doc.categoryId] || 0) + 1;
      }

      // Total size
      if (doc.fileSize) {
        totalSize += doc.fileSize;
      }
    }

    return {
      totalDocuments: (documents || []).length,
      byStatus,
      byCategory,
      totalSize,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(
    mockCategories: Omit<DocumentCategory, 'id' | 'createdAt' | 'updatedAt'>[],
    mockDocuments: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<void> {
    const existingCategories = extractList(await db.collection('document_categories').get());
    if ((existingCategories || []).length > 0) return; // Already seeded

    for (const mock of mockCategories) {
      const id = generateId('cat');
      const ts = now();
      await safeAdd('document_categories', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const mock of mockDocuments) {
      const id = generateId('doc');
      const ts = now();
      await safeAdd('documents', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
