import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Se încarcă...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Se încarcă...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main Layout
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

// Placeholder pages
const ClientsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Clienți</h1><p className="mt-4">Pagina pentru management clienți</p></div>;
const SessionsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Ședințe</h1><p className="mt-4">Pagina pentru management ședințe</p></div>;
const CRMPage = () => <div className="p-8"><h1 className="text-3xl font-bold">CRM</h1><p className="mt-4">Pagina CRM</p></div>;
const FinancesPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Finanțe</h1><p className="mt-4">Pagina financiară</p></div>;
const MaterialsPage = () => <div className="p-8"><h1 className="text-3xl font-bold">Materiale</h1><p className="mt-4">Pagina pentru materiale didactice</p></div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clienti"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ClientsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sedinte"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SessionsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/crm"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CRMPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finante"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <FinancesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/materiale"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MaterialsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
