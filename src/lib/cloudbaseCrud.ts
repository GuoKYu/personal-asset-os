/**
 * CloudBase CRUD 基类
 * 封装通用的 NoSQL 数据库操作，供所有 Service 层复用
 * 替代 Dexie.js 的 db.table 操作
 *
 * 2026-07-08: 修复 supabase-like SDK { data, error } 响应处理、
 *             显式注入 _openid 到新建文档、完善错误传播
 */
import { db, auth } from './cloudbase';

// ── 认证辅助 ──

/** 获取当前登录用户的 UID（匿名或真实账号通用） */
function getCurrentUid(): string | null {
  try {
    const u: any = (auth as any).currentUser;
    if (u) return u.id || u.uuid || u.uid || null;
    return null;
  } catch {
    return null;
  }
}

// ── 响应工具 ──

/**
 * 从 CloudBase SDK v3 响应中提取文档列表
 * SDK v3 结构: { data: { code, message, list: [...] }, requestId, response }
 */
export function extractList(result: any): any[] {
  // 优先: data.list（SDK v3 实际结构）
  const list = result?.data?.list;
  if (Array.isArray(list)) return list;
  // 兼容: data 直接是数组
  if (Array.isArray(result?.data)) return result.data;
  // 兼容: records 字段
  if (Array.isArray(result?.records)) return result.records;
  return [];
}

/** 检查 SDK 返回值是否包含业务错误 */
function checkError(result: any, context: string): void {
  // supabase-style: { error }
  if (result?.error) {
    const msg = result.error?.message || result.error?.toString() || '未知错误';
    throw new Error(`[${context}] ${msg}`);
  }
  // CloudBase 服务端错误: data.code 不为 ok/success
  const code = result?.data?.code;
  if (code && code !== 'ok' && code !== 'success' && code !== 'SUCCESS') {
    const msg = result?.data?.message || `服务器错误 code=${code}`;
    throw new Error(`[${context}] ${msg}`);
  }
}

// ── 工具函数 ──

/** 生成唯一 ID（保持与原 Dexie 版本一致的格式） */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 获取当前时间 ISO 字符串 */
export function now(): string {
  return new Date().toISOString();
}

// ── 审计日志 ──

/**
 * 写入审计日志到 CloudBase audit_logs 集合
 * 与原 Dexie 版 writeAuditLog 接口完全一致
 */
export async function writeAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>,
  changedFields?: string[],
): Promise<void> {
  try {
    const result = await db.collection('audit_logs').add({
      id: generateId('log'),
      entityType,
      entityId,
      action,
      oldValue,
      newValue,
      changedFields,
      operator: 'user',
      createdAt: now(),
    });
    checkError(result, 'writeAuditLog');
  } catch (error) {
    // 审计日志失败不应阻断主操作
    console.error('[审计日志] 写入失败:', error);
  }
}

// ── 安全写入辅助（供不使用 CRUD 工厂的 service 直接调用）──

/**
 * 安全写入——自动注入 _openid，检查 supabase-style { error } 返回值
 * @param collectionName 集合名
 * @param data 要写入的文档数据（无需手动加 _openid）
 * @returns CloudBase 返回的原始结果（含 _id）
 */
export async function safeAdd(collectionName: string, data: any): Promise<any> {
  const uid = getCurrentUid();
  if (!uid) {
    throw new Error(`[${collectionName}] safeAdd 失败：未登录`);
  }
  const doc = { ...data, _openid: uid };
  const result = await db.collection(collectionName).add(doc);
  checkError(result, `${collectionName}.safeAdd`);
  return result;
}

// ── 通用 CRUD 工厂 ──

/**
 * 创建一个通用的 CRUD 服务对象
 * @param collectionName CloudBase NoSQL 集合名
 * @param idPrefix ID 前缀（如 'account', 'holding'）
 *
 * 返回对象包含：
 * - getAll(): 获取全部记录
 * - getById(id): 按 id 获取单条
 * - add(item): 新增（自动生成 id/_openid/createdAt/updatedAt + 审计日志）
 * - update(id, updates): 更新（自动更新 updatedAt + 审计日志）
 * - remove(id): 删除（带审计日志）
 * - count(): 获取记录数
 */
export function createCrudService<
  T extends { id: string; createdAt?: string; updatedAt?: string },
>(collectionName: string, idPrefix: string) {
  return {
    /** 获取全部记录 */
    async getAll(): Promise<T[]> {
      try {
        const result = await db.collection(collectionName).get();
        checkError(result, `${collectionName}.getAll`);
        return extractList(result) as T[];
      } catch (error) {
        console.error(`[${collectionName}] getAll 失败:`, error);
        throw error;
      }
    },

    /** 按 id 获取单条记录 */
    async getById(id: string): Promise<T | undefined> {
      try {
        const result = await db.collection(collectionName).where({ id }).get();
        checkError(result, `${collectionName}.getById`);
        return extractList(result)[0] as T | undefined;
      } catch (error) {
        console.error(`[${collectionName}] getById(${id}) 失败:`, error);
        throw error;
      }
    },

    /**
     * 新增记录
     * @param item 不含 id/createdAt/updatedAt 的数据
     * @returns 新生成的 id
     */
    async add(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const uid = getCurrentUid();
      if (!uid) {
        throw new Error(`[${collectionName}] 新增失败：未登录`);
      }

      const id = generateId(idPrefix);
      const ts = now();
      const newItem = {
        ...(item as any),
        id,
        _openid: uid,            // 显式注入 _openid 确保安全规则匹配
        createdAt: ts,
        updatedAt: ts,
      } as T;

      try {
        const result = await db.collection(collectionName).add(newItem);
        checkError(result, `${collectionName}.add`);
        console.log(`[${collectionName}] 新增成功:`, id);
      } catch (error) {
        console.error(`[${collectionName}] add 失败:`, error);
        throw error;
      }

      await writeAuditLog(
        collectionName,
        id,
        'create',
        undefined,
        newItem as unknown as Record<string, unknown>,
      );

      return id;
    },

    /**
     * 更新记录
     * @param id 业务 id
     * @param updates 需要更新的字段
     */
    async update(id: string, updates: Partial<T>): Promise<void> {
      try {
        const result = await db.collection(collectionName).where({ id }).get();
        checkError(result, `${collectionName}.update(query)`);
        const list = extractList(result);
        const oldItem = list?.[0];
        if (!oldItem) throw new Error(`${collectionName} ${id} 不存在`);

        const docId = (oldItem as any)._id;
        if (!docId) throw new Error(`${collectionName} ${id} 缺少 _id 字段`);

        const updatedFields = {
          ...updates,
          updatedAt: now(),
        };

        const updateResult = await db.collection(collectionName).doc(docId).update(updatedFields);
        checkError(updateResult, `${collectionName}.update`);

        const updatedItem = { ...oldItem, ...updatedFields } as T;
        await writeAuditLog(
          collectionName,
          id,
          'update',
          oldItem as unknown as Record<string, unknown>,
          updatedItem as unknown as Record<string, unknown>,
        );

        console.log(`[${collectionName}] 更新成功:`, id);
      } catch (error) {
        console.error(`[${collectionName}] update(${id}) 失败:`, error);
        throw error;
      }
    },

    /**
     * 删除记录
     * @param id 业务 id
     */
    async remove(id: string): Promise<void> {
      try {
        const result = await db.collection(collectionName).where({ id }).get();
        checkError(result, `${collectionName}.remove(query)`);
        const list = extractList(result);
        const oldItem = list?.[0];
        if (!oldItem) throw new Error(`${collectionName} ${id} 不存在`);

        const docId = (oldItem as any)._id;
        if (!docId) throw new Error(`${collectionName} ${id} 缺少 _id 字段`);

        const removeResult = await db.collection(collectionName).doc(docId).remove();
        checkError(removeResult, `${collectionName}.remove`);

        await writeAuditLog(
          collectionName,
          id,
          'delete',
          oldItem as unknown as Record<string, unknown>,
          undefined,
        );

        console.log(`[${collectionName}] 删除成功:`, id);
      } catch (error) {
        console.error(`[${collectionName}] remove(${id}) 失败:`, error);
        throw error;
      }
    },

    /** 获取记录总数 */
    async count(): Promise<number> {
      const all = await this.getAll();
      return all.length;
    },

    /**
     * 按条件查询（CloudBase where + 客户端过滤兜底）
     * @param whereClause CloudBase where 条件（等于查询）
     * @param clientFilter 额外的客户端过滤函数
     */
    async query(
      whereClause: Record<string, any>,
      clientFilter?: (item: T) => boolean,
    ): Promise<T[]> {
      let result;
      if (Object.keys(whereClause).length > 0) {
        result = await db.collection(collectionName).where(whereClause).get();
      } else {
        result = await db.collection(collectionName).get();
      }
      checkError(result, `${collectionName}.query`);

      const raw = extractList(result);
      let items = raw as T[];
      if (clientFilter) {
        items = items.filter(clientFilter);
      }
      return items;
    },

    /** 获取集合名（供子类扩展使用） */
    get collectionName() {
      return collectionName;
    },
  };
}

// ── 排序工具 ──

/**
 * 通用排序函数（替代 Dexie collection 的客户端排序）
 */
export function sortBy<T>(
  items: T[],
  sortByKey: keyof T | string,
  sortOrder: 'asc' | 'desc' = 'asc',
): T[] {
  const order = sortOrder === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const aVal = a[sortByKey as keyof T];
    const bVal = b[sortByKey as keyof T];
    if (aVal == null || bVal == null) return 0;
    if (aVal < bVal) return -1 * order;
    if (aVal > bVal) return 1 * order;
    return 0;
  });
}

// ── 搜索工具 ──

/**
 * 模糊搜索（检查多个字段是否包含搜索词，不区分大小写）
 */
export function matchSearch<T>(
  item: T,
  search: string,
  fields: (keyof T)[],
): boolean {
  const q = search.toLowerCase();
  return fields.some((field) => {
    const val = item[field];
    if (val == null) return false;
    return String(val).toLowerCase().includes(q);
  });
}
