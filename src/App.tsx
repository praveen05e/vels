import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ResetPassword from './pages/auth/ResetPassword';
import DonorDashboard from './pages/donor/DonorDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route element={<Layout />}>
              <Route path="/donor/*" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
              <Route path="/receiver/*" element={<ProtectedRoute allowedRoles={['receiver']}><ReceiverDashboard /></ProtectedRoute>} />
              <Route path="/driver/*" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
              <Route path="/coordinator/*" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </OfflineProvider>
  );
}
