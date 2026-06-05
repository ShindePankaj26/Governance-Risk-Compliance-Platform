import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './hooks/useAuth'
import Layout from './components/shared/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RisksPage from './pages/RisksPage'
import VendorsPage from './pages/VendorsPage'
import CompliancePage from './pages/CompliancePage'
import AuditsPage from './pages/AuditsPage'
import PoliciesPage from './pages/PoliciesPage'
import AIGovPage from './pages/AIGovPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="risks" element={<RisksPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="audits" element={<AuditsPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="aigov" element={<AIGovPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
