import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { BackofficeDashboard } from './pages/BackofficeDashboard';
import { UserManagement } from './pages/UserManagement';
import { ProsumerManagement } from './pages/ProsumerManagement';
import { NodeManagement } from './pages/NodeManagement';
import { ReservationManagement } from './pages/ReservationManagement';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { OperatorQRScanner } from './pages/OperatorQRScanner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((r) => r.toLowerCase() === user?.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
              <Home />
            </main>
          }
        />
        <Route path="/login" element={<Login />} />

        {/* Backoffice Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Backoffice']}>
              <BackofficeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['Backoffice']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prosumers"
          element={
            <ProtectedRoute allowedRoles={['Backoffice']}>
              <ProsumerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/nodes"
          element={
            <ProtectedRoute allowedRoles={['Backoffice']}>
              <NodeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={['Backoffice']}>
              <ReservationManagement />
            </ProtectedRoute>
          }
        />

        {/* Grid Operator Protected Routes */}
        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRoles={['GridOperator', 'Backoffice']}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/scan-qr"
          element={
            <ProtectedRoute allowedRoles={['GridOperator', 'Backoffice']}>
              <OperatorQRScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/stations"
          element={
            <ProtectedRoute allowedRoles={['GridOperator', 'Backoffice']}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/reservations"
          element={
            <ProtectedRoute allowedRoles={['GridOperator', 'Backoffice']}>
              <ReservationManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
