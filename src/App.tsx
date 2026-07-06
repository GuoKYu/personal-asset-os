import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'

// Dashboard
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'

// Finance
import HoldingListPage from '@/modules/finance/pages/HoldingListPage'
import HoldingDetailPage from '@/modules/finance/pages/HoldingDetailPage'
import TransactionListPage from '@/modules/finance/pages/TransactionListPage'
import AssetAnalysisPage from '@/modules/finance/pages/AssetAnalysisPage'
import AccountListPage from '@/modules/finance/pages/AccountListPage'

// Insurance
import PolicyListPage from '@/modules/insurance/pages/PolicyListPage'
import PolicyDetailPage from '@/modules/insurance/pages/PolicyDetailPage'
import CoverageAnalysisPage from '@/modules/insurance/pages/CoverageAnalysisPage'

// IP
import IPListPage from '@/modules/ip/pages/IPListPage'
import IPDetailPage from '@/modules/ip/pages/IPDetailPage'
import CertificatePage from '@/modules/ip/pages/CertificatePage'

// Growth
import GrowthPathPage from '@/modules/growth/pages/GrowthPathPage'
import LearningPlanPage from '@/modules/growth/pages/LearningPlanPage'

// Health
import FamilyMemberPage from '@/modules/health/pages/FamilyMemberPage'
import HealthRecordPage from '@/modules/health/pages/HealthRecordPage'

// Documents
import DocumentListPage from '@/modules/documents/pages/DocumentListPage'

// Projects
import ProjectListPage from '@/modules/projects/pages/ProjectListPage'

// Settings
import ModuleManagePage from '@/modules/settings/pages/ModuleManagePage'
import FieldCustomPage from '@/modules/settings/pages/FieldCustomPage'
import DataManagePage from '@/modules/settings/pages/DataManagePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Finance */}
          <Route path="/finance" element={<AccountListPage />} />
          <Route path="/finance/holdings" element={<HoldingListPage />} />
          <Route path="/finance/holdings/:id" element={<HoldingDetailPage />} />
          <Route path="/finance/transactions" element={<TransactionListPage />} />
          <Route path="/finance/analysis" element={<AssetAnalysisPage />} />
          <Route path="/finance/accounts" element={<AccountListPage />} />

          {/* Insurance */}
          <Route path="/insurance" element={<PolicyListPage />} />
          <Route path="/insurance/policies" element={<PolicyListPage />} />
          <Route path="/insurance/policies/:id" element={<PolicyDetailPage />} />
          <Route path="/insurance/coverage" element={<CoverageAnalysisPage />} />

          {/* IP */}
          <Route path="/ip" element={<IPListPage />} />
          <Route path="/ip/:id" element={<IPDetailPage />} />
          <Route path="/ip/certificates" element={<CertificatePage />} />

          {/* Growth */}
          <Route path="/growth" element={<GrowthPathPage />} />
          <Route path="/growth/paths" element={<GrowthPathPage />} />
          <Route path="/growth/learning" element={<LearningPlanPage />} />

          {/* Health */}
          <Route path="/health" element={<FamilyMemberPage />} />
          <Route path="/health/members" element={<FamilyMemberPage />} />
          <Route path="/health/records" element={<HealthRecordPage />} />

          {/* Documents */}
          <Route path="/documents" element={<DocumentListPage />} />

          {/* Projects */}
          <Route path="/projects" element={<ProjectListPage />} />

          {/* Settings */}
          <Route path="/settings" element={<ModuleManagePage />} />
          <Route path="/settings/modules" element={<ModuleManagePage />} />
          <Route path="/settings/fields" element={<FieldCustomPage />} />
          <Route path="/settings/data" element={<DataManagePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
