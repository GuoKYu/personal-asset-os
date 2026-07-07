/* ============================================
   personal-asset-os — React Router v6 Configuration
   ============================================ */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// ── Layout ──
import AppLayout from '@/components/layout/AppLayout';

// ── Lazy-loaded Page Components ──
const Dashboard = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));

// Finance
const AccountList = lazy(() => import('@/modules/finance/pages/AccountListPage'));
const HoldingList = lazy(() => import('@/modules/finance/pages/HoldingListPage'));
const HoldingDetail = lazy(() => import('@/modules/finance/pages/HoldingDetailPage'));
const TransactionList = lazy(() => import('@/modules/finance/pages/TransactionListPage'));
const AssetAnalysis = lazy(() => import('@/modules/finance/pages/AssetAnalysisPage'));

// Insurance
const PolicyList = lazy(() => import('@/modules/insurance/pages/PolicyListPage'));
const PolicyDetail = lazy(() => import('@/modules/insurance/pages/PolicyDetailPage'));
const CoverageAnalysis = lazy(() => import('@/modules/insurance/pages/CoverageAnalysisPage'));

// IP
const IPList = lazy(() => import('@/modules/ip/pages/IPListPage'));
const IPDetail = lazy(() => import('@/modules/ip/pages/IPDetailPage'));
const CertificatePage = lazy(() => import('@/modules/ip/pages/CertificatePage'));

// Growth
const GrowthPath = lazy(() => import('@/modules/growth/pages/GrowthPathPage'));
const LearningPlan = lazy(() => import('@/modules/growth/pages/LearningPlanPage'));

// Health
const FamilyMember = lazy(() => import('@/modules/health/pages/FamilyMemberPage'));
const HealthRecord = lazy(() => import('@/modules/health/pages/HealthRecordPage'));

// Documents
const DocumentList = lazy(() => import('@/modules/documents/pages/DocumentListPage'));

// Projects
const ProjectList = lazy(() => import('@/modules/projects/pages/ProjectListPage'));

// Settings
const ModuleManage = lazy(() => import('@/modules/settings/pages/ModuleManagePage'));
const FieldCustom = lazy(() => import('@/modules/settings/pages/FieldCustomPage'));
const DataManage = lazy(() => import('@/modules/settings/pages/DataManagePage'));

// ── Loading Spinner ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--pao-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>加载中...</span>
      </div>
    </div>
  );
}

// ── Suspense Wrapper ──
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// ── Route Definitions ──
const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: withSuspense(Dashboard),
      },

      // ── Finance Module ──
      {
        path: 'finance',
        element: withSuspense(AccountList),
      },
      {
        path: 'finance/holdings',
        element: withSuspense(HoldingList),
      },
      {
        path: 'finance/holdings/:id',
        element: withSuspense(HoldingDetail),
      },
      {
        path: 'finance/transactions',
        element: withSuspense(TransactionList),
      },
      {
        path: 'finance/analysis',
        element: withSuspense(AssetAnalysis),
      },

      // ── Insurance Module ──
      {
        path: 'insurance',
        element: withSuspense(PolicyList),
      },
      {
        path: 'insurance/:id',
        element: withSuspense(PolicyDetail),
      },
      {
        path: 'insurance/coverage',
        element: withSuspense(CoverageAnalysis),
      },

      // ── IP Module ──
      {
        path: 'ip',
        element: withSuspense(IPList),
      },
      {
        path: 'ip/:id',
        element: withSuspense(IPDetail),
      },
      {
        path: 'ip/certificates',
        element: withSuspense(CertificatePage),
      },

      // ── Growth Module ──
      {
        path: 'growth',
        element: withSuspense(GrowthPath),
      },
      {
        path: 'growth/learning',
        element: withSuspense(LearningPlan),
      },

      // ── Health Module ──
      {
        path: 'health',
        element: withSuspense(FamilyMember),
      },
      {
        path: 'health/records',
        element: withSuspense(HealthRecord),
      },

      // ── Documents Module ──
      {
        path: 'documents',
        element: withSuspense(DocumentList),
      },

      // ── Projects Module ──
      {
        path: 'projects',
        element: withSuspense(ProjectList),
      },

      // ── Settings Module ──
      {
        path: 'settings',
        element: withSuspense(ModuleManage),
      },
      {
        path: 'settings/fields',
        element: withSuspense(FieldCustom),
      },
      {
        path: 'settings/data',
        element: withSuspense(DataManage),
      },
    ],
  },

  // ── Catch-all: redirect to dashboard ──
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

// ── Router ──
export const router = createBrowserRouter(routes);

export default router;
