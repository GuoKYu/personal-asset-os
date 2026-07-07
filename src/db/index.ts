/* ============================================
   personal-asset-os — Dexie.js Database Setup
   ============================================ */

import Dexie, { type Table } from 'dexie';
import type {
  Asset,
  FinancialAccount,
  Holding,
  Transaction,
  InsurancePolicy,
  InsurancePayment,
  IP,
  Certificate,
  GrowthPath,
  LearningPlan,
  FamilyMember,
  HealthRecord,
  Document,
  DocumentCategory,
  Project,
  ModuleConfig,
  FieldDef,
  ViewDef,
  Reminder,
  AuditLog,
} from '../types';

export class PersonalAssetDB extends Dexie {
  assets!: Table<Asset, string>;
  financial_accounts!: Table<FinancialAccount, string>;
  holdings!: Table<Holding, string>;
  transactions!: Table<Transaction, string>;
  insurance_policies!: Table<InsurancePolicy, string>;
  insurance_payments!: Table<InsurancePayment, string>;
  ips!: Table<IP, string>;
  certificates!: Table<Certificate, string>;
  growth_paths!: Table<GrowthPath, string>;
  learning_plans!: Table<LearningPlan, string>;
  family_members!: Table<FamilyMember, string>;
  health_records!: Table<HealthRecord, string>;
  documents!: Table<Document, string>;
  document_categories!: Table<DocumentCategory, string>;
  projects!: Table<Project, string>;
  modules!: Table<ModuleConfig, string>;
  field_defs!: Table<FieldDef, string>;
  view_defs!: Table<ViewDef, string>;
  reminders!: Table<Reminder, string>;
  audit_logs!: Table<AuditLog, string>;

  constructor() {
    super('personalAssetOS');

    // Version 2: Updated to camelCase field names
    this.version(2).stores({
      assets: 'id, type, status, dataGrade, createdAt, updatedAt',
      financial_accounts: 'id, type, institution, currency, balance, status, dataGrade, [type+institution]',
      holdings: 'id, accountId, symbol, market, sector, status, dataGrade, [accountId+symbol], [market+sector]',
      transactions: 'id, accountId, holdingId, symbol, type, status, tradeDate, [accountId+type], [symbol+tradeDate]',
      insurance_policies: 'id, type, insurer, insuredPerson, status, dataGrade, endDate, [type+status]',
      insurance_payments: 'id, policyId, status, dueDate, paidDate, [policyId+status]',
      ips: 'id, type, status, jurisdiction, dataGrade, expiryDate, [type+status], [jurisdiction+type]',
      certificates: 'id, category, status, dataGrade, expiryDate, [category+status]',
      growth_paths: 'id, status, careerStage, progress',
      learning_plans: 'id, pathId, status, priority, progress, [pathId+status]',
      family_members: 'id, relationship, name',
      health_records: 'id, memberId, type, status, date, [memberId+type], [memberId+date]',
      documents: 'id, categoryId, status, version, tags, [categoryId+status]',
      document_categories: 'id, parentId, sortOrder, [parentId+sortOrder]',
      projects: 'id, status, priority, progress, targetDate, [status+priority]',
      modules: 'id, moduleId, enabled, sortOrder, [enabled+sortOrder]',
      field_defs: 'id, moduleId, entityType, fieldKey, sortOrder, [moduleId+entityType], [entityType+fieldKey]',
      view_defs: 'id, moduleId, entityType, viewKey, defaultView, [moduleId+entityType], [entityType+viewKey]',
      reminders: 'id, entityType, entityId, isActive, targetDate, triggerDate, [isActive+targetDate]',
      audit_logs: 'id, entityType, entityId, action, createdAt, [entityType+entityId], [entityType+action]',
    });
  }
}

export const db = new PersonalAssetDB();

// ── Database Utilities ──

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.assets.clear(),
    db.financial_accounts.clear(),
    db.holdings.clear(),
    db.transactions.clear(),
    db.insurance_policies.clear(),
    db.insurance_payments.clear(),
    db.ips.clear(),
    db.certificates.clear(),
    db.growth_paths.clear(),
    db.learning_plans.clear(),
    db.family_members.clear(),
    db.health_records.clear(),
    db.documents.clear(),
    db.document_categories.clear(),
    db.projects.clear(),
    db.modules.clear(),
    db.field_defs.clear(),
    db.view_defs.clear(),
    db.reminders.clear(),
    db.audit_logs.clear(),
  ]);
}

export async function getDbStats(): Promise<Record<string, number>> {
  const tables = [
    'assets', 'financial_accounts', 'holdings', 'transactions',
    'insurance_policies', 'insurance_payments', 'ips', 'certificates',
    'growth_paths', 'learning_plans', 'family_members', 'health_records',
    'documents', 'document_categories', 'projects', 'modules',
    'field_defs', 'view_defs', 'reminders', 'audit_logs',
  ] as const;

  const stats: Record<string, number> = {};
  for (const table of tables) {
    stats[table] = await db[table].count();
  }
  return stats;
}

export async function writeAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>,
  changedFields?: string[],
): Promise<string> {
  return await db.audit_logs.add({
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    changedFields,
    operator: 'user',
    createdAt: new Date().toISOString(),
  });
}
