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
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface FinancialAccount extends Asset {
  type: AccountType;
  institution: string;
  accountNumber?: string;
  currency: string;
  balance: number;
  balanceDate: string;
  autoSync: boolean;
  syncConfig?: Record<string, unknown>;
  pnl?: number;
  pnlPercent?: number;
}

export interface Holding extends Asset {
  accountId: string;
  symbol: string;
  name: string;
  market: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currency: string;
  sector?: string;
  subSector?: string;
  exchange?: string;
  lotSize?: number;
  costBasis: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  realizedPnl: number;
  dividendReceived: number;
  totalReturn: number;
  totalReturnPct: number;
  firstBuyDate?: string;
  lastTradeDate?: string;
  priceSource?: string;
  priceUpdatedAt?: string;
  stopLossPrice?: number;
}

export interface Transaction {
  id: string;
  type: string;
  name: string;
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  accountId: string;
  holdingId?: string;
  symbol?: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  quantity?: number;
  price?: number;
  amount: number;
  fee: number;
  currency: string;
  tradeDate: string;
  settlementDate?: string;
  source?: string;
  counterparty?: string;
}

export interface InsurancePolicy {
  id: string;
  type: string;
  name: string;
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  policyType: InsuranceType;
  insurer: string;
  policyNumber: string;
  insuredPerson: string;
  premiumAnnual: number;
  premiumTotal?: number;
  coverageAmount: number;
  coverageDetail?: string;
  deductible?: number;
  startDate: string;
  endDate: string;
  paymentFrequency: string;
  renewalType: string;
  status: InsuranceStatus;
  autoRenew: boolean;
  agentName?: string;
  agentContact?: string;
  beneficiary?: string;
  riderInfo?: string;
  exclusions?: string;
  claimCount: number;
  totalClaimAmount: number;
  remainingCoverage?: number;
  nextPaymentDate?: string;
}

export interface InsurancePayment {
  id: string;
  policyId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: InsurancePaymentStatus;
  receiptNo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IP {
  id: string;
  type: string;
  name: string;
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  ipType: IPType;
  title: string;
  registrationNo?: string;
  applicant: string;
  jurisdiction: string;
  status: IPStatus;
  filingDate?: string;
  grantDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  description?: string;
  valuation?: number;
  valuationDate?: string;
  revenueGenerated: number;
  enforcementActions?: string;
  licenseInfo?: string;
  relatedProjects?: string[];
  documents?: string[];
}

export interface Certificate {
  id: string;
  type: string;
  name: string;
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  certName: string;
  issuingBody: string;
  category: string;
  status: CertificateStatus;
  issueDate: string;
  expiryDate?: string;
  renewalDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  skillTags?: string[];
  difficulty?: string;
  studyHours?: number;
  cost?: number;
}

export interface GrowthPath {
  id: string;
  title: string;
  description?: string;
  careerStage: string;
  targetRole?: string;
  skillsGap?: string[];
  milestones?: string[];
  progress: number;
  startDate?: string;
  targetDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPlan {
  id: string;
  pathId: string;
  title: string;
  description?: string;
  resourceType: string;
  resourceUrl?: string;
  status: LearningPlanStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  skillTags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  emergencyContact?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  memberId: string;
  type: string;
  title: string;
  status: HealthStatus;
  date: string;
  detail?: string;
  attachments?: string[];
  followUpDate?: string;
  provider?: string;
  cost?: number;
  insuranceClaim?: boolean;
  claimId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  categoryId?: string;
  content?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  status: DocumentStatus;
  version: number;
  tags?: string[];
  relatedIds?: string[];
  accessLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  type: string;
  name: string;
  dataGrade: DataGrade;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  budget?: number;
  actualCost?: number;
  teamMembers?: string[];
  milestones?: Milestone[];
  deliverables?: string[];
  risks?: string[];
  relatedAssetIds?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  triggerDate?: string;
  triggerType: string;
  entityType?: string;
  entityId?: string;
  isRecurring: boolean;
  recurringConfig?: Record<string, unknown>;
  isActive: boolean;
  isCompleted: boolean;
  priority: ProjectPriority;
  notificationMethod?: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Module Configuration Types ──

export interface ModuleConfig {
  id: string;
  moduleId: string;
  enabled: boolean;
  sortOrder: number;
  customConfig?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FieldDef {
  id: string;
  moduleId: string;
  entityType: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  required: boolean;
  visible: boolean;
  editable: boolean;
  defaultValue?: string;
  validationRule?: string;
  sortOrder: number;
  groupKey?: string;
  helpText?: string;
  options?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ViewDef {
  id: string;
  moduleId: string;
  entityType: string;
  viewKey: string;
  viewName: string;
  viewType: string;
  columns: string[];
  filters?: FilterConfig[];
  sort?: SortConfig[];
  defaultView: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Audit Log ──

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changedFields?: string[];
  operator: string;
  ipAddress?: string;
  createdAt: string;
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
  pageSize: number;
  totalPages: number;
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
