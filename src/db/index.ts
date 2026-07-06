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

    // Version 1: Initial schema
    this.version(1).stores({
      assets: 'id, type, status, data_grade, created_at, updated_at',
      financial_accounts: 'id, type, institution, currency, balance, status, data_grade, [type+institution]',
      holdings: 'id, account_id, symbol, market, sector, status, data_grade, [account_id+symbol], [market+sector]',
      transactions: 'id, account_id, holding_id, symbol, type, status, trade_date, [account_id+type], [symbol+trade_date]',
      insurance_policies: 'id, type, insurer, insured_person, status, data_grade, end_date, [type+status]',
      insurance_payments: 'id, policy_id, status, due_date, paid_date, [policy_id+status]',
      ips: 'id, type, status, jurisdiction, data_grade, expiry_date, [type+status], [jurisdiction+type]',
      certificates: 'id, category, status, data_grade, expiry_date, [category+status]',
      growth_paths: 'id, status, career_stage, progress',
      learning_plans: 'id, path_id, status, priority, progress, [path_id+status]',
      family_members: 'id, relationship, name',
      health_records: 'id, member_id, type, status, date, [member_id+type], [member_id+date]',
      documents: 'id, category_id, status, version, tags, [category_id+status]',
      document_categories: 'id, parent_id, sort_order, [parent_id+sort_order]',
      projects: 'id, status, priority, progress, target_date, [status+priority]',
      modules: 'id, module_id, enabled, sort_order, [enabled+sort_order]',
      field_defs: 'id, module_id, entity_type, field_key, sort_order, [module_id+entity_type], [entity_type+field_key]',
      view_defs: 'id, module_id, entity_type, view_key, default_view, [module_id+entity_type], [entity_type+view_key]',
      reminders: 'id, entity_type, entity_id, is_active, target_date, trigger_date, [is_active+target_date]',
      audit_logs: 'id, entity_type, entity_id, action, created_at, [entity_type+entity_id], [entity_type+action]',
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
    entity_type: entityType,
    entity_id: entityId,
    action,
    old_value: oldValue,
    new_value: newValue,
    changed_fields: changedFields,
    operator: 'user',
    created_at: new Date().toISOString(),
  });
}
