import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { GrowthPath, LearningPlan, LearningPlanStatus, ProjectPriority } from '../types';

/**
 * Growth Service — CloudBase NoSQL data layer for Growth module
 * 成长发展数据服务层 - 封装所有成长发展相关的数据库操作
 */
export const growthService = {
  // ── GrowthPath methods ──

  /**
   * Get all growth paths with optional filters
   */
  async getGrowthPaths(filters?: {
    search?: string;
    status?: string;
    careerStage?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GrowthPath[]> {
    const data = extractList(await db.collection('growth_paths').get());
    let growthPaths = (data || []) as GrowthPath[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      growthPaths = growthPaths.filter(gp =>
        (gp.title?.toLowerCase().includes(search) || false) ||
        (gp.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      growthPaths = growthPaths.filter(gp => gp.status === filters.status);
    }

    if (filters?.careerStage) {
      growthPaths = growthPaths.filter(gp => gp.careerStage === filters.careerStage);
    }

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof GrowthPath;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      growthPaths.sort((a, b) => {
        const aVal = a[key as keyof GrowthPath];
        const bVal = b[key as keyof GrowthPath];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return growthPaths;
  },

  /**
   * Get a single growth path by ID
   */
  async getGrowthPathById(id: string): Promise<GrowthPath | undefined> {
    const { data } = await db.collection('growth_paths').where({ id }).get();
    return data?.[0] as GrowthPath | undefined;
  },

  /**
   * Add a new growth path
   */
  async addGrowthPath(growthPath: Omit<GrowthPath, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('gp');
    const ts = now();
    const newGrowthPath: GrowthPath = {
      ...growthPath,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('growth_paths', newGrowthPath);
    await writeAuditLog('growth_path', id, 'create', undefined, newGrowthPath as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing growth path
   */
  async updateGrowthPath(id: string, updates: Partial<GrowthPath>): Promise<void> {
    const { data } = await db.collection('growth_paths').where({ id }).get();
    const oldGrowthPath = data?.[0];
    if (!oldGrowthPath) throw new Error(`GrowthPath ${id} not found`);

    const docId = (oldGrowthPath as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('growth_paths').doc(docId).update(updatedFields);

    const updatedGrowthPath = { ...oldGrowthPath, ...updatedFields } as GrowthPath;
    await writeAuditLog('growth_path', id, 'update', oldGrowthPath as unknown as Record<string, unknown>, updatedGrowthPath as unknown as Record<string, unknown>);
  },

  /**
   * Delete a growth path
   */
  async deleteGrowthPath(id: string): Promise<void> {
    const { data: pathData } = await db.collection('growth_paths').where({ id }).get();
    const oldGrowthPath = pathData?.[0];
    if (!oldGrowthPath) throw new Error(`GrowthPath ${id} not found`);

    // Also delete related learning plans
    const { data: relatedPlans } = await db.collection('learning_plans').where({ pathId: id }).get();
    for (const plan of (relatedPlans || [])) {
      const planDocId = (plan as any)._id;
      await db.collection('learning_plans').doc(planDocId).remove();
      await writeAuditLog('learning_plan', (plan as any).id, 'delete', plan as unknown as Record<string, unknown>, undefined);
    }

    const pathDocId = (oldGrowthPath as any)._id;
    await db.collection('growth_paths').doc(pathDocId).remove();
    await writeAuditLog('growth_path', id, 'delete', oldGrowthPath as unknown as Record<string, unknown>, undefined);
  },

  // ── LearningPlan methods ──

  /**
   * Get all learning plans with optional filters
   */
  async getLearningPlans(filters?: {
    pathId?: string;
    search?: string;
    status?: LearningPlanStatus;
    priority?: ProjectPriority;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LearningPlan[]> {
    const data = extractList(await db.collection('learning_plans').get());
    let learningPlans = (data || []) as LearningPlan[];

    if (filters?.pathId) {
      learningPlans = learningPlans.filter(lp => lp.pathId === filters.pathId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      learningPlans = learningPlans.filter(lp =>
        (lp.title?.toLowerCase().includes(search) || false) ||
        (lp.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      learningPlans = learningPlans.filter(lp => lp.status === filters.status);
    }

    if (filters?.priority) {
      learningPlans = learningPlans.filter(lp => lp.priority === filters.priority);
    }

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof LearningPlan;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      learningPlans.sort((a, b) => {
        const aVal = a[key as keyof LearningPlan];
        const bVal = b[key as keyof LearningPlan];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return learningPlans;
  },

  /**
   * Get a single learning plan by ID
   */
  async getLearningPlanById(id: string): Promise<LearningPlan | undefined> {
    const { data } = await db.collection('learning_plans').where({ id }).get();
    return data?.[0] as LearningPlan | undefined;
  },

  /**
   * Add a new learning plan
   */
  async addLearningPlan(learningPlan: Omit<LearningPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('lp');
    const ts = now();
    const newLearningPlan: LearningPlan = {
      ...learningPlan,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('learning_plans', newLearningPlan);
    await writeAuditLog('learning_plan', id, 'create', undefined, newLearningPlan as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing learning plan
   */
  async updateLearningPlan(id: string, updates: Partial<LearningPlan>): Promise<void> {
    const { data } = await db.collection('learning_plans').where({ id }).get();
    const oldLearningPlan = data?.[0];
    if (!oldLearningPlan) throw new Error(`LearningPlan ${id} not found`);

    const docId = (oldLearningPlan as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('learning_plans').doc(docId).update(updatedFields);

    const updatedLearningPlan = { ...oldLearningPlan, ...updatedFields } as LearningPlan;
    await writeAuditLog('learning_plan', id, 'update', oldLearningPlan as unknown as Record<string, unknown>, updatedLearningPlan as unknown as Record<string, unknown>);
  },

  /**
   * Delete a learning plan
   */
  async deleteLearningPlan(id: string): Promise<void> {
    const { data } = await db.collection('learning_plans').where({ id }).get();
    const oldLearningPlan = data?.[0];
    if (!oldLearningPlan) throw new Error(`LearningPlan ${id} not found`);

    const docId = (oldLearningPlan as any)._id;
    await db.collection('learning_plans').doc(docId).remove();
    await writeAuditLog('learning_plan', id, 'delete', oldLearningPlan as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Get growth summary stats
   */
  async getGrowthStats(): Promise<{
    totalPaths: number;
    totalPlans: number;
    avgPathProgress: number;
    avgPlanProgress: number;
    completedPlans: number;
    inProgressPlans: number;
  }> {
    const paths = extractList(await db.collection('growth_paths').get());
    const plans = extractList(await db.collection('learning_plans').get());

    const allPaths = (paths || []) as GrowthPath[];
    const allPlans = (plans || []) as LearningPlan[];

    let totalPathProgress = 0;
    for (const path of allPaths) {
      totalPathProgress += path.progress || 0;
    }

    let totalPlanProgress = 0;
    let completedPlans = 0;
    let inProgressPlans = 0;
    for (const plan of allPlans) {
      totalPlanProgress += plan.progress || 0;
      if (plan.status === 'completed') completedPlans++;
      if (plan.status === 'in_progress') inProgressPlans++;
    }

    return {
      totalPaths: allPaths.length,
      totalPlans: allPlans.length,
      avgPathProgress: allPaths.length > 0 ? totalPathProgress / allPaths.length : 0,
      avgPlanProgress: allPlans.length > 0 ? totalPlanProgress / allPlans.length : 0,
      completedPlans,
      inProgressPlans,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(
    mockPaths: Omit<GrowthPath, 'id' | 'createdAt' | 'updatedAt'>[],
    mockPlans: Omit<LearningPlan, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<void> {
    const existingPaths = extractList(await db.collection('growth_paths').get());
    if ((existingPaths || []).length > 0) return; // Already seeded

    for (const mock of mockPaths) {
      const id = generateId('gp');
      const ts = now();
      await safeAdd('growth_paths', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const mock of mockPlans) {
      const id = generateId('lp');
      const ts = now();
      await safeAdd('learning_plans', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
