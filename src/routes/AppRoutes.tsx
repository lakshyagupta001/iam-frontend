import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import UsersList from '../pages/iam/users/UsersList';
import UserDetails from '../pages/iam/users/UserDetails';
import UserEdit from '../pages/iam/users/UserEdit';
import GroupsList from '../pages/iam/groups/GroupsList';
import GroupDetails from '../pages/iam/groups/GroupDetails';
import GroupEdit from '../pages/iam/groups/GroupEdit';
import PoliciesList from '../pages/iam/policies/PoliciesList';
import PolicyDetails from '../pages/iam/policies/PolicyDetails';
import PolicyEdit from '../pages/iam/policies/PolicyEdit';
import { Loader2 } from 'lucide-react';

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
      <Route path="/login" element={isAuthenticated ? <Navigate to="/iam/users" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/iam/users" replace /> : <Register />} />

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

      {/* Redirects */}
      <Route path="/dashboard" element={<Navigate to="/iam/users" replace />} />
      <Route path="/" element={<Navigate to="/iam/users" replace />} />
      <Route path="*" element={<Navigate to="/iam/users" replace />} />
    </Routes>
  );
}
