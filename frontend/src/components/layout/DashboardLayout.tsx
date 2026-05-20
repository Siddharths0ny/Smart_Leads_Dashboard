import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar.js';
import Sidebar from '../common/Sidebar.js';
import { useAuthStore } from '../../store/authStore.js';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
