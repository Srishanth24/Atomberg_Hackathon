import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './layouts/MainLayout';

const Analytics = lazy(() => import('./pages/Analytics'));

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

function App() {
  // Mock current role based on local storage or set it statically for demo
  // In a real app, this comes from an AuthContext or Zustand store
  const currentRole = localStorage.getItem('userRole') || 'employee';

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<MainLayout />}>
            {/* Protected Routes Example */}
            <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['employee', 'manager', 'admin']} />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/analytics" element={<Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading analytics module...</div>}><Analytics /></Suspense>} />
            </Route>

            <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['manager', 'admin']} />}>
              <Route path="/manager" element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute currentRole={currentRole} allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
