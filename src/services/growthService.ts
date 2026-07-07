import { db, writeAuditLog } from '../db';
import type { GrowthPath, LearningPlan, LearningPlanStatus, ProjectPriority } from '../types';

/**
 * Growth Service — Dexie.js data layer for Growth module
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
    let collection = db.growth_paths.toCollection();

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(gp =>
        (gp.title?.toLowerCase().includes(search) || false) ||
        (gp.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      collection = collection.filter(gp => gp.status === filters.status);
    }

    if (filters?.careerStage) {
      collection = collection.filter(gp => gp.careerStage === filters.careerStage);
    }

    let growthPaths = await collection.toArray();

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
    return await db.growth_paths.get(id);
  },

  /**
   * Add a new growth path
   */
  async addGrowthPath(growthPath: Omit<GrowthPath, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `gp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newGrowthPath: GrowthPath = {
      ...growthPath,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.growth_paths.add(newGrowthPath);
    await writeAuditLog('growth_path', id, 'create', undefined, newGrowthPath as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing growth path
   */
  async updateGrowthPath(id: string, updates: Partial<GrowthPath>): Promise<void> {
    const oldGrowthPath = await db.growth_paths.get(id);
    if (!oldGrowthPath) throw new Error(`GrowthPath ${id} not found`);

    const updatedGrowthPath: GrowthPath = {
      ...oldGrowthPath,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.growth_paths.put(updatedGrowthPath);
    await writeAuditLog('growth_path', id, 'update', oldGrowthPath as unknown as Record<string, unknown>, updatedGrowthPath as unknown as Record<string, unknown>);
  },

  /**
   * Delete a growth path
   */
  async deleteGrowthPath(id: string): Promise<void> {
    const oldGrowthPath = await db.growth_paths.get(id);
    if (!oldGrowthPath) throw new Error(`GrowthPath ${id} not found`);

    // Also delete related learning plans
    const relatedPlans = await db.learning_plans.where('pathId').equals(id).toArray();
    for (const plan of relatedPlans) {
      await db.learning_plans.delete(plan.id);
      await writeAuditLog('learning_plan', plan.id, 'delete', plan as unknown as Record<string, unknown>, undefined);
    }

    await db.growth_paths.delete(id);
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
    let collection = db.learning_plans.toCollection();

    if (filters?.pathId) {
      collection = collection.filter(lp => lp.pathId === filters.pathId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(lp =>
        (lp.title?.toLowerCase().includes(search) || false) ||
        (lp.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      collection = collection.filter(lp => lp.status === filters.status);
    }

    if (filters?.priority) {
      collection = collection.filter(lp => lp.priority === filters.priority);
    }

    let learningPlans = await collection.toArray();

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
    return await db.learning_plans.get(id);
  },

  /**
   * Add a new learning plan
   */
  async addLearningPlan(learningPlan: Omit<LearningPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `lp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newLearningPlan: LearningPlan = {
      ...learningPlan,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.learning_plans.add(newLearningPlan);
    await writeAuditLog('learning_plan', id, 'create', undefined, newLearningPlan as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing learning plan
   */
  async updateLearningPlan(id: string, updates: Partial<LearningPlan>): Promise<void> {
    const oldLearningPlan = await db.learning_plans.get(id);
    if (!oldLearningPlan) throw new Error(`LearningPlan ${id} not found`);

    const updatedLearningPlan: LearningPlan = {
      ...oldLearningPlan,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.learning_plans.put(updatedLearningPlan);
    await writeAuditLog('learning_plan', id, 'update', oldLearningPlan as unknown as Record<string, unknown>, updatedLearningPlan as unknown as Record<string, unknown>);
  },

  /**
   * Delete a learning plan
   */
  async deleteLearningPlan(id: string): Promise<void> {
    const oldLearningPlan = await db.learning_plans.get(id);
    if (!oldLearningPlan) throw new Error(`LearningPlan ${id} not found`);

    await db.learning_plans.delete(id);
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
    const paths = await db.growth_paths.toArray();
    const plans = await db.learning_plans.toArray();

    let totalPathProgress = 0;
    for (const path of paths) {
      totalPathProgress += path.progress || 0;
    }

    let totalPlanProgress = 0;
    let completedPlans = 0;
    let inProgressPlans = 0;
    for (const plan of plans) {
      totalPlanProgress += plan.progress || 0;
      if (plan.status === 'completed') completedPlans++;
      if (plan.status === 'in_progress') inProgressPlans++;
    }

    return {
      totalPaths: paths.length,
      totalPlans: plans.length,
      avgPathProgress: paths.length > 0 ? totalPathProgress / paths.length : 0,
      avgPlanProgress: plans.length > 0 ? totalPlanProgress / plans.length : 0,
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
    const existingPaths = await db.growth_paths.count();
    if (existingPaths > 0) return; // Already seeded

    for (const mock of mockPaths) {
      const id = `gp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.growth_paths.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const mock of mockPlans) {
      const id = `lp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.learning_plans.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
