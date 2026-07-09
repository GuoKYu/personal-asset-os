import { db } from '@/lib/cloudbase';
import { writeAuditLog, generateId, now, safeAdd , extractList } from "@/lib/cloudbaseCrud";
import type { Project, ProjectStatus, ProjectPriority, Milestone } from '../types';

/**
 * Project Service — CloudBase NoSQL data layer for Projects module
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
    const data = extractList(await db.collection('projects').get());
    let projects = (data || []) as Project[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      projects = projects.filter(p =>
        (p.title?.toLowerCase().includes(search) || false) ||
        (p.description?.toLowerCase().includes(search) || false)
      );
    }

    if (filters?.status) {
      projects = projects.filter(p => p.status === filters.status);
    }

    if (filters?.priority) {
      projects = projects.filter(p => p.priority === filters.priority);
    }

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
    const { data } = await db.collection('projects').where({ id }).get();
    return data?.[0] as Project | undefined;
  },

  /**
   * Add a new project
   */
  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId('proj');
    const ts = now();
    const newProject: Project = {
      ...project,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    await safeAdd('projects', newProject);
    await writeAuditLog('project', id, 'create', undefined, newProject as unknown as Record<string, unknown>);

    return id;
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const { data } = await db.collection('projects').where({ id }).get();
    const oldProject = data?.[0];
    if (!oldProject) throw new Error(`Project ${id} not found`);

    const docId = (oldProject as any)._id;
    const updatedFields = {
      ...updates,
      updatedAt: now(),
    };

    await db.collection('projects').doc(docId).update(updatedFields);

    const updatedProject = { ...oldProject, ...updatedFields } as Project;
    await writeAuditLog('project', id, 'update', oldProject as unknown as Record<string, unknown>, updatedProject as unknown as Record<string, unknown>);
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const { data } = await db.collection('projects').where({ id }).get();
    const oldProject = data?.[0];
    if (!oldProject) throw new Error(`Project ${id} not found`);

    const docId = (oldProject as any)._id;
    await db.collection('projects').doc(docId).remove();
    await writeAuditLog('project', id, 'delete', oldProject as unknown as Record<string, unknown>, undefined);
  },

  /**
   * Add a milestone to a project
   */
  async addMilestone(projectId: string, milestone: Omit<Milestone, 'id'>): Promise<void> {
    const { data } = await db.collection('projects').where({ id: projectId }).get();
    const project = data?.[0];
    if (!project) throw new Error(`Project ${projectId} not found`);

    const newMilestone: Milestone = {
      ...milestone,
      id: generateId('ms'),
    };

    const milestones = (project as any).milestones || [];
    milestones.push(newMilestone);

    const docId = (project as any)._id;
    await db.collection('projects').doc(docId).update({ milestones, updatedAt: now() });
    await writeAuditLog('project', projectId, 'update', undefined, { milestones } as unknown as Record<string, unknown>);
  },

  /**
   * Update a milestone
   */
  async updateMilestone(projectId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    const { data } = await db.collection('projects').where({ id: projectId }).get();
    const project = data?.[0];
    if (!project) throw new Error(`Project ${projectId} not found`);

    const milestones = (project as any).milestones || [];
    const index = milestones.findIndex((m: Milestone) => m.id === milestoneId);
    if (index === -1) throw new Error(`Milestone ${milestoneId} not found`);

    milestones[index] = { ...milestones[index], ...updates };

    const docId = (project as any)._id;
    await db.collection('projects').doc(docId).update({ milestones, updatedAt: now() });
    await writeAuditLog('project', projectId, 'update', undefined, { milestones } as unknown as Record<string, unknown>);
  },

  /**
   * Delete a milestone
   */
  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    const { data } = await db.collection('projects').where({ id: projectId }).get();
    const project = data?.[0];
    if (!project) throw new Error(`Project ${projectId} not found`);

    const milestones = ((project as any).milestones || []).filter((m: Milestone) => m.id !== milestoneId);

    const docId = (project as any)._id;
    await db.collection('projects').doc(docId).update({ milestones, updatedAt: now() });
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
    const data = extractList(await db.collection('projects').get());
    const projects = (data || []) as Project[];
    const nowDate = new Date();

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
      if (project.targetDate && new Date(project.targetDate) < nowDate && project.status !== 'completed') {
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
    const existing = extractList(await db.collection('projects').get());
    if ((existing || []).length > 0) return; // Already seeded

    for (const mock of mockProjects) {
      const id = generateId('proj');
      const ts = now();
      await safeAdd('projects', {
        ...mock,
        id,
        createdAt: ts,
        updatedAt: ts,
      });
    }
  },
};
