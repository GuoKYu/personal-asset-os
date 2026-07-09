/**
 * Field Service — CloudBase NoSQL data layer for custom field definitions
 * 自定义字段服务层
 */
import { createCrudService } from '@/lib/cloudbaseCrud';

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  module: string;
  required: boolean;
  visible: boolean;
  options?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const crud = createCrudService<CustomField>('field_defs', 'field');

export const fieldService = {
  async getAll(): Promise<CustomField[]> {
    return crud.getAll();
  },

  async getByModule(module: string): Promise<CustomField[]> {
    const all = await crud.getAll();
    return all.filter(f => f.module === module && f.visible);
  },

  async add(field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return crud.add(field);
  },

  async update(id: string, updates: Partial<CustomField>): Promise<void> {
    return crud.update(id, updates);
  },

  async remove(id: string): Promise<void> {
    return crud.remove(id);
  },
};
