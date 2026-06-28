import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../schemas/auth.schema';
import type { RegisterFormValues } from '../../../schemas/auth.schema';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cn } from '../../../lib/utils';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const currentPassword = watch('password', '');

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setIsSuccess(true);
      // Wait a moment for the user to see the success message before redirecting
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  const getErrorMessage = () => {
    if (!mutation.error) return null;
    if (axios.isAxiosError(mutation.error) && mutation.error.response) {
      return mutation.error.response.data.message || 'An error occurred during registration';
    }
    return 'Network error. Please try again.';
  };

  const hasLength = currentPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(currentPassword);
  const hasLower = /[a-z]/.test(currentPassword);
  const hasNumber = /[0-9]/.test(currentPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(currentPassword);

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={cn("flex items-center space-x-2 text-xs", met ? "text-green-600" : "text-slate-500")}>
      {met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      <span>{text}</span>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Organization Created!</h3>
        <p className="text-sm text-slate-500">
          Your organization has been successfully registered. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {mutation.isError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {getErrorMessage()}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name</Label>
        <Input
          id="organizationName"
          type="text"
          placeholder="e.g. Acme Corp"
          autoComplete="organization"
          disabled={mutation.isPending}
          aria-invalid={!!errors.organizationName}
          {...register('organizationName')}
        />
        {errors.organizationName && (
          <p className="text-xs text-red-500 font-medium">{errors.organizationName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Root User Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your Full Name"
          autoComplete="name"
          disabled={mutation.isPending}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={mutation.isPending}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={mutation.isPending}
            aria-invalid={!!errors.password}
            {...register('password')}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        
        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1">
          <PasswordRequirement met={hasLength} text="8+" />
          <PasswordRequirement met={hasUpper} text="Upper" />
          <PasswordRequirement met={hasLower} text="Lower" />
          <PasswordRequirement met={hasNumber} text="Number" />
          <PasswordRequirement met={hasSpecial} text="Special" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={mutation.isPending}
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
