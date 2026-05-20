import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.js';
import { useAuthStore } from '../store/authStore.js';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If already authenticated, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-6 select-none">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative z-10 w-full flex justify-center animate-float">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
