
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-slate-900" />
            <span className="font-semibold tracking-tight">IAM Dashboard</span>
          </div>
          {user?.isRoot && (
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm font-medium text-blue-600">
                Overview
              </Link>
              <Link to="/users" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                User Management
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600">
            Logged in as <span className="font-medium text-slate-900">{user?.name}</span>
            {user?.isRoot && (
              <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                ROOT
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h1>
        <p className="text-slate-500">
          You have successfully authenticated using the Enterprise IAM system.
        </p>
        {/* Resource components will go here in Phase 2 */}
      </main>
    </div>
  );
}
