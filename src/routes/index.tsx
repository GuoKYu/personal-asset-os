/* ============================================
   personal-asset-os — React Router v6 Configuration
   ============================================ */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

// ── Layout ──
import AppLayout from '../layouts/AppLayout';

// ── Lazy-loaded Page Components ──
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

// Finance
const AccountList = lazy(() => import('../pages/finance/AccountList'));
const HoldingList = lazy(() => import('../pages/finance/HoldingList'));
const HoldingDetail = lazy(() => import('../pages/finance/HoldingDetail'));
const TransactionList = lazy(() => import('../pages/finance/TransactionList'));
const AssetAnalysis = lazy(() => import('../pages/finance/AssetAnalysis'));

// Insurance
const PolicyList = lazy(() => import('../pages/insurance/PolicyList'));
const PolicyDetail = lazy(() => import('../pages/insurance/PolicyDetail'));
const CoverageAnalysis = lazy(() => import('../pages/insurance/CoverageAnalysis'));

// IP
const IPList = lazy(() => import('../pages/ip/IPList'));
const IPDetail = lazy(() => import('../pages/ip/IPDetail'));
const CertificatePage = lazy(() => import('../pages/ip/CertificatePage'));

// Growth
const GrowthPath = lazy(() => import('../pages/growth/GrowthPath'));
const LearningPlan = lazy(() => import('../pages/growth/LearningPlan'));

// Health
const FamilyMember = lazy(() => import('../pages/health/FamilyMember'));
const HealthRecord = lazy(() => import('../pages/health/HealthRecord'));

// Documents
const DocumentList = lazy(() => import('../pages/documents/DocumentList'));

// Projects
const ProjectList = lazy(() => import('../pages/projects/ProjectList'));

// Settings
const ModuleManage = lazy(() => import('../pages/settings/ModuleManage'));
const FieldCustom = lazy(() => import('../pages/settings/FieldCustom'));
const DataManage = lazy(() => import('../pages/settings/DataManage'));

// ── Loading Spinner ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--pmgo-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--pmgo-text-secondary)]">加载中...</span>
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
