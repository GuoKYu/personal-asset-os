import { db, writeAuditLog } from '../db';
import type { Document, DocumentCategory, DocumentStatus } from '../types';

/**
 * Document Service — Dexie.js data layer for Documents module
 * 文档管理数据服务层 - 封装所有文档管理相关的数据库操作
 */
export const documentService = {
  // ── DocumentCategory methods ──

  /**
   * Get all document categories
   */
  async getCategories(): Promise<DocumentCategory[]> {
    const categories = await db.document_categories.toArray();
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
    return await db.document_categories.get(id);
  },

  /**
   * Add a new category
   */
  async addCategory(category: Omit<DocumentCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newCategory: DocumentCategory = {
      ...category,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.document_categories.add(newCategory);
    await writeAuditLog('document_category', id, 'create', undefined, newCategory as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<DocumentCategory>): Promise<void> {
    const oldCategory = await db.document_categories.get(id);
    if (!oldCategory) throw new Error(`DocumentCategory ${id} not found`);

    const updatedCategory: DocumentCategory = {
      ...oldCategory,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.document_categories.put(updatedCategory);
    await writeAuditLog('document_category', id, 'update', oldCategory as unknown as Record<string, unknown>, updatedCategory as unknown as Record<string, unknown>);
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const oldCategory = await db.document_categories.get(id);
    if (!oldCategory) throw new Error(`DocumentCategory ${id} not found`);

    // Also delete documents in this category
    const relatedDocs = await db.documents.where('categoryId').equals(id).toArray();
    for (const doc of relatedDocs) {
      await db.documents.delete(doc.id);
      await writeAuditLog('document', doc.id, 'delete', doc as unknown as Record<string, unknown>, undefined);
    }

    await db.document_categories.delete(id);
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
    let collection = db.documents.toCollection();

    if (filters?.categoryId) {
      collection = collection.filter(doc => doc.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(doc =>
        (doc.title?.toLowerCase().includes(search) || false) ||
        (doc.content?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      collection = collection.filter(doc => doc.status === filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tags = filters.tags; // Assign to variable to narrow type
      collection = collection.filter(doc =>
        doc.tags ? tags.some(tag => doc.tags!.includes(tag)) : false
      );
    }

    let documents = await collection.toArray();

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
    return await db.documents.get(id);
  },

  /**
   * Add a new document
   */
  async addDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newDocument: Document = {
      ...document,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.documents.add(newDocument);
    await writeAuditLog('document', id, 'create', undefined, newDocument as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const oldDocument = await db.documents.get(id);
    if (!oldDocument) throw new Error(`Document ${id} not found`);

    const updatedDocument: Document = {
      ...oldDocument,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.documents.put(updatedDocument);
    await writeAuditLog('document', id, 'update', oldDocument as unknown as Record<string, unknown>, updatedDocument as unknown as Record<string, unknown>);
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const oldDocument = await db.documents.get(id);
    if (!oldDocument) throw new Error(`Document ${id} not found`);

    await db.documents.delete(id);
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
    const documents = await db.documents.toArray();
    const categories = await db.document_categories.toArray();

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalSize = 0;

    for (const doc of documents) {
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
      totalDocuments: documents.length,
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
    const existingCategories = await db.document_categories.count();
    if (existingCategories > 0) return; // Already seeded

    for (const mock of mockCategories) {
      const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.document_categories.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const mock of mockDocuments) {
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.documents.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
