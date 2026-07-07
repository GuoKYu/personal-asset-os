/* ============================================
   personal-asset-os — TypeScript Type Definitions
   ============================================ */

// ── Data Grade ──
export enum DataGrade {
  L1 = 'L1', // 实时/自动同步 (API)
  L2 = 'L2', // 定期/半自动 (CSV导入)
  L3 = 'L3', // 手动维护 (表单录入)
  L4 = 'L4', // 历史冻结 (不可修改)
  L5 = 'L5', // 估算/他评 (主观判断)
}

// ── Status Enums ──
export enum AssetStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  DIVIDEND = 'dividend',
  INTEREST = 'interest',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  FEE = 'fee',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum InsuranceStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  CLAIMED = 'claimed',
  CANCELLED = 'cancelled',
}

export enum InsurancePaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export enum IPStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  GRANTED = 'granted',
  REJECTED = 'rejected',
  ABANDONED = 'abandoned',
}

export enum CertificateStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  PENDING = 'pending',
  RENEWING = 'renewing',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REVIEW = 'review',
}

export enum HealthStatus {
  NORMAL = 'normal',
  ATTENTION = 'attention',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum LearningPlanStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  DROPPED = 'dropped',
}

export enum AccountType {
  BROKERAGE = 'brokerage',
  FUND = 'fund',
  BANK = 'bank',
  CRYPTO = 'crypto',
  PENSION = 'pension',
  OTHER = 'other',
}

export enum IPType {
  PATENT = 'patent',
  TRADEMARK = 'trademark',
  COPYRIGHT_SOFTWARE = 'copyright_software',
  COPYRIGHT_WORK = 'copyright_work',
  TRADE_SECRET = 'trade_secret',
  OTHER = 'other',
}

export enum InsuranceType {
  MEDICAL = 'medical',
  CRITICAL_ILLNESS = 'critical_illness',
  ACCIDENT = 'accident',
  LIFE = 'life',
  PROPERTY = 'property',
  TRAVEL = 'travel',
  OTHER = 'other',
}

// ── Core Entity Types ──

export interface Asset {
  id: string;
  type: string;
  name: string;
  status: AssetStatus;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
}

export interface FinancialAccount extends Asset {
  type: AccountType;
  institution: string;
  account_number?: string;
  currency: string;
  balance: number;
  balance_date: string;
  auto_sync: boolean;
  sync_config?: Record<string, unknown>;
}

export interface Holding extends Asset {
  account_id: string;
  symbol: string;
  name: string;
  market: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  currency: string;
  sector?: string;
  sub_sector?: string;
  exchange?: string;
  lot_size?: number;
  cost_basis: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  realized_pnl: number;
  dividend_received: number;
  total_return: number;
  total_return_pct: number;
  first_buy_date?: string;
  last_trade_date?: string;
  price_source?: string;
  price_updated_at?: string;
}

export interface Transaction {
  id: string;
  type: string;
  name: string;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  account_id: string;
  holding_id?: string;
  symbol?: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  quantity?: number;
  price?: number;
  amount: number;
  fee: number;
  currency: string;
  trade_date: string;
  settlement_date?: string;
  source?: string;
  counterparty?: string;
}

export interface InsurancePolicy {
  id: string;
  type: string;
  name: string;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  policy_type: InsuranceType;
  insurer: string;
  policy_number: string;
  insured_person: string;
  premium_annual: number;
  premium_total?: number;
  coverage_amount: number;
  coverage_detail?: string;
  deductible?: number;
  start_date: string;
  end_date: string;
  payment_frequency: string;
  renewal_type: string;
  status: InsuranceStatus;
  auto_renew: boolean;
  agent_name?: string;
  agent_contact?: string;
  beneficiary?: string;
  rider_info?: string;
  exclusions?: string;
  claim_count: number;
  total_claim_amount: number;
  remaining_coverage?: number;
}

export interface InsurancePayment {
  id: string;
  policy_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: InsurancePaymentStatus;
  receipt_no?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IP {
  id: string;
  type: string;
  name: string;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  ip_type: IPType;
  title: string;
  registration_no?: string;
  applicant: string;
  jurisdiction: string;
  status: IPStatus;
  filing_date?: string;
  grant_date?: string;
  expiry_date?: string;
  renewal_date?: string;
  description?: string;
  valuation?: number;
  valuation_date?: string;
  revenue_generated: number;
  enforcement_actions?: string;
  license_info?: string;
  related_projects?: string[];
  documents?: string[];
}

export interface Certificate {
  id: string;
  type: string;
  name: string;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  cert_name: string;
  issuing_body: string;
  category: string;
  status: CertificateStatus;
  issue_date: string;
  expiry_date?: string;
  renewal_date?: string;
  credential_id?: string;
  verification_url?: string;
  skill_tags?: string[];
  difficulty?: string;
  study_hours?: number;
  cost?: number;
}

export interface GrowthPath {
  id: string;
  title: string;
  description?: string;
  career_stage: string;
  target_role?: string;
  skills_gap?: string[];
  milestones?: string[];
  progress: number;
  start_date?: string;
  target_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPlan {
  id: string;
  path_id: string;
  title: string;
  description?: string;
  resource_type: string;
  resource_url?: string;
  status: LearningPlanStatus;
  priority: ProjectPriority;
  progress: number;
  start_date?: string;
  target_date?: string;
  completed_date?: string;
  skill_tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birth_date?: string;
  gender?: string;
  occupation?: string;
  emergency_contact?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  member_id: string;
  type: string;
  title: string;
  status: HealthStatus;
  date: string;
  detail?: string;
  attachments?: string[];
  follow_up_date?: string;
  provider?: string;
  cost?: number;
  insurance_claim?: boolean;
  claim_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  category_id?: string;
  content?: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  status: DocumentStatus;
  version: number;
  tags?: string[];
  related_ids?: string[];
  access_level?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  type: string;
  name: string;
  data_grade: DataGrade;
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  start_date?: string;
  target_date?: string;
  completed_date?: string;
  budget?: number;
  actual_cost?: number;
  team_members?: string[];
  milestones?: Milestone[];
  deliverables?: string[];
  risks?: string[];
  related_asset_ids?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  completed_date?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  target_date: string;
  trigger_date?: string;
  trigger_type: string;
  entity_type?: string;
  entity_id?: string;
  is_recurring: boolean;
  recurring_config?: Record<string, unknown>;
  is_active: boolean;
  is_completed: boolean;
  priority: ProjectPriority;
  notification_method?: string[];
  created_at: string;
  updated_at: string;
}

// ── Module Configuration Types ──

export interface ModuleConfig {
  id: string;
  module_id: string;
  enabled: boolean;
  sort_order: number;
  custom_config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FieldDef {
  id: string;
  module_id: string;
  entity_type: string;
  field_key: string;
  field_label: string;
  field_type: string;
  required: boolean;
  visible: boolean;
  editable: boolean;
  default_value?: string;
  validation_rule?: string;
  sort_order: number;
  group_key?: string;
  help_text?: string;
  options?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ViewDef {
  id: string;
  module_id: string;
  entity_type: string;
  view_key: string;
  view_name: string;
  view_type: string;
  columns: string[];
  filters?: FilterConfig[];
  sort?: SortConfig[];
  default_view: boolean;
  created_at: string;
  updated_at: string;
}

// ── Audit Log ──

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  changed_fields?: string[];
  operator: string;
  ip_address?: string;
  created_at: string;
}

// ── Query / Filter / Pagination Types ──

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'between' | 'like';
  value: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Filter {
  field: string;
  operator: string;
  value: unknown;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ── UI State Types ──

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  auto_dismiss?: boolean;
}

export interface SidebarState {
  collapsed: boolean;
  expanded: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primary_color?: string;
}
