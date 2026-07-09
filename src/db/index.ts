/**
 * Database 兼容层 — CloudBase SDK 版本
 * 原来基于 Dexie.js，现已迁移到 CloudBase NoSQL
 *
 * 此文件保留用于：
 * 1. writeAuditLog — 向 CloudBase audit_logs 集合写入审计日志
 * 2. clearAllData — 清空所有业务集合（危险操作，仅开发使用）
 * 3. getDbStats — 获取各集合记录数
 *
 * Dexie.js 依赖已移除，所有数据操作通过 CloudBase SDK 完成。
 */
import { db } from '@/lib/cloudbase';
import { writeAuditLog as writeCloudBaseAuditLog, generateId } from '@/lib/cloudbaseCrud';

// 重新导出 writeAuditLog（保持向后兼容）
export { writeCloudBaseAuditLog as writeAuditLog };

// 所有业务集合名
const COLLECTIONS = [
  'financial_accounts',
  'holdings',
  'transactions',
  'insurance_policies',
  'insurance_payments',
  'ips',
  'certificates',
  'growth_paths',
  'learning_plans',
  'family_members',
  'health_records',
  'documents',
  'document_categories',
  'projects',
  'modules',
  'field_defs',
  'view_defs',
  'reminders',
  'audit_logs',
] as const;

/**
 * 清空所有业务集合数据（危险操作！仅开发环境使用）
 * 注意：CloudBase SDK 不支持批量清空集合，需要逐条删除
 */
export async function clearAllData(): Promise<void> {
  for (const collectionName of COLLECTIONS) {
    try {
      const { data } = await db.collection(collectionName).get();
      if (data && data.length > 0) {
        // 逐条删除
        for (const doc of data) {
          const docId = (doc as any)._id;
          if (docId) {
            await db.collection(collectionName).doc(docId).remove();
          }
        }
      }
    } catch (error) {
      console.warn(`[clearAllData] 清空 ${collectionName} 失败:`, error);
    }
  }
}

/**
 * 获取各集合的记录数统计
 */
export async function getDbStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  for (const collectionName of COLLECTIONS) {
    try {
      const { data } = await db.collection(collectionName).get();
      stats[collectionName] = data?.length || 0;
    } catch {
      stats[collectionName] = 0;
    }
  }
  return stats;
}

// 重新导出 generateId（保持向后兼容）
export { generateId };

// 集合名常量（供 Service 层引用）
export const COLLECTION_NAMES = COLLECTIONS;
