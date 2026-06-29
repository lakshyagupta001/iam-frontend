import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Login from '@/modules/auth/pages/Login';
import Register from '@/modules/auth/pages/Register';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import UsersList from '@/modules/iam/features/users/pages/UsersList';
import UserDetails from '@/modules/iam/features/users/pages/UserDetails';
import UserEdit from '@/modules/iam/features/users/pages/UserEdit';
import GroupsList from '@/modules/iam/features/groups/pages/GroupsList';
import GroupDetails from '@/modules/iam/features/groups/pages/GroupDetails';
import GroupEdit from '@/modules/iam/features/groups/pages/GroupEdit';
import PoliciesList from '@/modules/iam/features/policies/pages/PoliciesList';
import PolicyDetails from '@/modules/iam/features/policies/pages/PolicyDetails';
import PolicyEdit from '@/modules/iam/features/policies/pages/PolicyEdit';
import { Loader2 } from 'lucide-react';
import ReportsList from '../modules/resources/reports/pages/ReportsList';
import ReportDetails from '../modules/resources/reports/pages/ReportDetails';
import ManageReport from '../modules/resources/reports/pages/ManageReport';
import AlertsList from '../modules/resources/alerts/pages/AlertsList';
import AlertDetails from '../modules/resources/alerts/pages/AlertDetails';
import ManageAlert from '../modules/resources/alerts/pages/ManageAlert';
import SettingsList from '../modules/resources/settings/pages/SettingsList';
import AuditList from '../modules/resources/audit/pages/AuditList';
import Dashboard from '../modules/dashboard/pages/Dashboard';

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected IAM Routes */}
      <Route
        path="/iam"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="users" replace />} />

        {/* Users */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="users/:id/edit" element={<UserEdit />} />

        {/* Groups */}
        <Route path="groups" element={<GroupsList />} />
        <Route path="groups/:id" element={<GroupDetails />} />
        <Route path="groups/:id/edit" element={<GroupEdit />} />

        {/* Policies */}
        <Route path="policies" element={<PoliciesList />} />
        <Route path="policies/:id" element={<PolicyDetails />} />
        <Route path="policies/:id/edit" element={<PolicyEdit />} />
      </Route>

      {/* Protected Resources Routes */}
      <Route
        path="/reports"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<ReportsList />} />
        <Route path=":id" element={<ReportDetails />} />
        <Route path=":id/edit" element={<ManageReport />} />
      </Route>

      <Route
        path="/alerts"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<AlertsList />} />
        <Route path=":id" element={<AlertDetails />} />
        <Route path=":id/edit" element={<ManageAlert />} />
      </Route>

      <Route
        path="/settings"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<SettingsList />} />
      </Route>

      <Route
        path="/audit"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<AuditList />} />
      </Route>

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
