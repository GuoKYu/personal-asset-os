import { db, writeAuditLog } from '../db';
import type { Project, ProjectStatus, ProjectPriority, Milestone } from '../types';

/**
 * Project Service — Dexie.js data layer for Projects module
 * 项目管理数据服务层 - 封装所有项目管理相关的数据库操作
 */
export const projectService = {
  /**
   * Get all projects with optional filters
   */
  async getProjects(filters?: {
    search?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Project[]> {
    let collection = db.projects.toCollection();

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter(p =>
        (p.title?.toLowerCase().includes(search) || false) ||
        (p.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      collection = collection.filter(p => p.status === filters.status);
    }

    if (filters?.priority) {
      collection = collection.filter(p => p.priority === filters.priority);
    }

    let projects = await collection.toArray();

    // Sort
    if (filters?.sortBy) {
      const key = filters.sortBy as keyof Project;
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      projects.sort((a, b) => {
        const aVal = a[key as keyof Project];
        const bVal = b[key as keyof Project];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return projects;
  },

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string): Promise<Project | undefined> {
    return await db.projects.get(id);
  },

  /**
   * Add a new project
   */
  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.projects.add(newProject);
    await writeAuditLog('project', id, 'create', undefined, newProject as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const oldProject = await db.projects.get(id);
    if (!oldProject) throw new Error(`Project ${id} not found`);

    const updatedProject: Project = {
      ...oldProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.projects.put(updatedProject);
    await writeAuditLog('project', id, 'update', oldProject as unknown as Record<string, unknown>, updatedProject as unknown as Record<string, unknown>);
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const oldProject = await db.projects.get(id);
    if (!oldProject) throw new Error(`Project ${id} not found`);

    await db.projects.delete(id);
    await writeAuditLog('project', id, 'delete', oldProject as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Add a milestone to a project
   */
  async addMilestone(projectId: string, milestone: Omit<Milestone, 'id'>): Promise<void> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const newMilestone: Milestone = {
      ...milestone,
      id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    const milestones = project.milestones || [];
    milestones.push(newMilestone);

    await db.projects.update(projectId, { milestones, updatedAt: new Date().toISOString() });
    await writeAuditLog('project', projectId, 'update', undefined, { milestones } as unknown as Record<string, unknown>);
  },

  /**
   * Update a milestone
   */
  async updateMilestone(projectId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const milestones = project.milestones || [];
    const index = milestones.findIndex(m => m.id === milestoneId);
    if (index === -1) throw new Error(`Milestone ${milestoneId} not found`);

    milestones[index] = { ...milestones[index], ...updates };

    await db.projects.update(projectId, { milestones, updatedAt: new Date().toISOString() });
    await writeAuditLog('project', projectId, 'update', undefined, { milestones } as unknown as Record<string, unknown>);
  },

  /**
   * Delete a milestone
   */
  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const milestones = (project.milestones || []).filter(m => m.id !== milestoneId);

    await db.projects.update(projectId, { milestones, updatedAt: new Date().toISOString() });
    await writeAuditLog('project', projectId, 'update', undefined, { milestones } as unknown as Record<string, unknown>);
  },

  /**
   * Get project summary stats
   */
  async getProjectStats(): Promise<{
    totalProjects: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    avgProgress: number;
    overdueCount: number;
  }> {
    const projects = await db.projects.toArray();
    const now = new Date();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalProgress = 0;
    let overdueCount = 0;

    for (const project of projects) {
      // Count by status
      byStatus[project.status] = (byStatus[project.status] || 0) + 1;

      // Count by priority
      byPriority[project.priority] = (byPriority[project.priority] || 0) + 1;

      // Total progress
      totalProgress += project.progress || 0;

      // Overdue count
      if (project.targetDate && new Date(project.targetDate) < now && project.status !== 'completed') {
        overdueCount++;
      }
    }

    return {
      totalProjects: projects.length,
      byStatus,
      byPriority,
      avgProgress: projects.length > 0 ? totalProgress / projects.length : 0,
      overdueCount,
    };
  },

  /**
   * Seed mock data (for development)
   */
  async seedMockData(mockProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    const existing = await db.projects.count();
    if (existing > 0) return; // Already seeded

    for (const mock of mockProjects) {
      const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      await db.projects.add({
        ...mock,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
};
