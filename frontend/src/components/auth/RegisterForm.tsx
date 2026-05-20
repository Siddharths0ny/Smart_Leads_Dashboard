import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    role: z.enum(['admin', 'sales_user'], {
      required_error: 'Role selection is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'sales_user',
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setServerError(null);
    try {
      await authRegister(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const error = err as Error;
      setServerError(error.message || 'An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl glass-panel p-8 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
        <p className="text-sm text-slate-400 mt-2">Get started with your Smart Leads Dashboard workspace</p>
      </div>

      {serverError && (
        <div className="mb-6 flex items-center space-x-2.5 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Full Name
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              {...register('name')}
              className={`w-full bg-slate-950/40 rounded-xl border py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-800'
              }`}
              placeholder="Sarah Jenkins"
            />
          </div>
          {errors.name && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              {...register('email')}
              className={`w-full bg-slate-950/40 rounded-xl border py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-800'
              }`}
              placeholder="sjenkins@company.com"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Workspace Role Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Workspace Role
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <select
              {...register('role')}
              className="w-full bg-slate-950/40 rounded-xl border border-slate-800 py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none [&>option]:bg-slate-900"
            >
              <option value="sales_user">Sales User (Read/Write own leads)</option>
              <option value="admin">Admin (Manage all leads & users)</option>
            </select>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Password
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full bg-slate-950/40 rounded-xl border py-3 pl-11 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-800'
              }`}
              placeholder="Min. 8 chars (A-z, 0-9)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-red-400 mt-1 max-w-sm leading-relaxed">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Confirm Password
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full bg-slate-950/40 rounded-xl border py-3 pl-11 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-800'
              }`}
              placeholder="Confirm password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-semibold text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 mt-6 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Registering Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-sm border-t border-slate-800/60 pt-4">
        <span className="text-slate-400">Already registered? </span>
        <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
