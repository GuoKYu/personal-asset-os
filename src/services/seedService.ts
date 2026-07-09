import { holdingService } from './holdingService';
import { accountService } from './accountService';
import { transactionService } from './transactionService';
import { insuranceService } from './insuranceService';
import { ipService } from './ipService';
import { certificateService } from './certificateService';
import { growthService } from './growthService';
import { healthService } from './healthService';
import { documentService } from './documentService';
import { projectService } from './projectService';
import * as mock from '@/db/mock-data';

/**
 * 文档分类——mock-data 里未单独导出 document_categories 数组，
 * 此处从 mockDocuments 的 category 字段去重派生。
 */
const documentCategories = Array.from(
  new Set(mock.mockDocuments.map((d: any) => d.category)),
)
  .filter(Boolean)
  .map((name, i) => ({
    name,
    description: `${name}类文档`,
    icon: 'folder',
    order: i + 1,
  }));

export interface SeedResult {
  seeded: string[];
  errors: string[];
}

/**
 * 将所有示例数据写入 CloudBase NoSQL（幂等：集合已有数据则跳过）。
 * 必须在匿名会话建立后调用，因为 safeAdd 要求 _openid 注入。
 */
export async function seedAllDemoData(): Promise<SeedResult> {
  const result: SeedResult = { seeded: [], errors: [] };

  const tasks: Array<[string, () => Promise<void>]> = [
    ['holdings', () => holdingService.seedMockData(mock.mockHoldings as any)],
    ['financial_accounts', () => accountService.seedMockData(mock.mockAccounts as any)],
    ['transactions', () => transactionService.seedMockData(mock.mockTransactions as any)],
    ['insurance_policies', () => insuranceService.seedMockData(mock.mockPolicies as any)],
    ['ips', () => ipService.seedMockData(mock.mockIPs as any)],
    ['certificates', () => certificateService.seedMockData(mock.mockCertificates as any)],
    ['growth', () => growthService.seedMockData(mock.mockGrowthPaths as any, mock.mockLearningPlans as any)],
    ['health', () => healthService.seedMockData(mock.mockFamilyMembers as any, mock.mockHealthRecords as any)],
    ['documents', () => documentService.seedMockData(documentCategories as any, mock.mockDocuments as any)],
    ['projects', () => projectService.seedMockData(mock.mockProjects as any)],
  ];

  for (const [name, fn] of tasks) {
    try {
      await fn();
      result.seeded.push(name);
    } catch (err: any) {
      console.error(`[seed] ${name} 失败:`, err);
      result.errors.push(`${name}: ${err?.message || err}`);
    }
  }

  return result;
}
