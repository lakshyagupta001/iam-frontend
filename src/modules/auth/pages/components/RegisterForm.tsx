import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/modules/auth/validation/auth.validation';
import type { RegisterFormValues } from '@/modules/auth/validation/auth.validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/modules/auth/services/auth.service';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cn } from '@/lib/utils';

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
    defaultValues: {
      registrationType: 'ROOT',
    }
  });

  const currentPassword = watch('password', '');
  const registrationType = watch('registrationType', 'ROOT');
  const isRoot = registrationType === 'ROOT';

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
        <h3 className="text-xl font-semibold text-slate-900">Registration Successful!</h3>
        <p className="text-sm text-slate-500">
          Your account has been successfully registered. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {mutation.isError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {getErrorMessage()}
        </div>
      )}

      <div className="space-y-2 pb-1">
        <Label className="text-sm text-slate-700 font-medium">Sign Up As</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className={cn(
            "flex items-center space-x-3 border rounded-lg p-3 flex-1 cursor-pointer transition-all",
            isRoot ? "border-slate-900 bg-slate-50/50 ring-1 ring-slate-900 shadow-sm" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          )}>
            <input 
              type="radio" 
              value="ROOT" 
              className="accent-slate-900 w-4 h-4 cursor-pointer"
              {...register('registrationType')}
            />
            <span className="text-sm font-medium text-slate-900">Root Administrator</span>
          </label>
          <label className={cn(
            "flex items-center space-x-3 border rounded-lg p-3 flex-1 cursor-pointer transition-all",
            !isRoot ? "border-slate-900 bg-slate-50/50 ring-1 ring-slate-900 shadow-sm" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          )}>
            <input 
              type="radio" 
              value="NORMAL" 
              className="accent-slate-900 w-4 h-4 cursor-pointer"
              {...register('registrationType')}
            />
            <span className="text-sm font-medium text-slate-900">Normal User</span>
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="organizationName">
          {isRoot ? "Organization Name" : "Organization Name or ID"}
        </Label>
        <Input
          id="organizationName"
          type="text"
          placeholder="e.g. Acme Corp"
          autoComplete="organization"
          disabled={mutation.isPending}
          aria-invalid={!!errors.organizationName}
          {...register('organizationName')}
        />
        <p className="text-[13px] text-slate-500">
          {isRoot ? "Creates a new organization" : "Join an existing organization"}
        </p>
        {errors.organizationName && (
          <p className="text-xs text-red-500 font-medium">{errors.organizationName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="name">{isRoot ? "Root User Full Name" : "Full Name"}</Label>
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

      <div className="space-y-1">
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

      <div className="space-y-1">
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
        
        <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1">
          <PasswordRequirement met={hasLength} text="8+" />
          <PasswordRequirement met={hasUpper} text="Upper" />
          <PasswordRequirement met={hasLower} text="Lower" />
          <PasswordRequirement met={hasNumber} text="Number" />
          <PasswordRequirement met={hasSpecial} text="Special" />
        </div>
      </div>

      <div className="space-y-1">
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
