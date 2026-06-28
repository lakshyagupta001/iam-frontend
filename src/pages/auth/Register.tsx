import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RegisterForm } from './components/RegisterForm';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Shield className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-4">
            IAM Console
          </h1>
          <p className="text-sm text-slate-500">
            Enterprise Identity & Access Management
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
            <CardDescription>
              Enter your details below to set up a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <p className="px-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
