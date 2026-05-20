import React from 'react';
import { Menu, LogOut, Sun, Moon, User as UserIcon, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 backdrop-blur-md">
      {/* Mobile Toggle & Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Smart Leads <span className="bg-gradient-to-r from-brand-500 to-indigo-400 bg-clip-text text-transparent">Dashboard</span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-300" />
          )}
        </button>

        {/* User Card */}
        {user && (
          <div className="hidden sm:flex items-center space-x-3 border-l border-slate-200 dark:border-slate-800 pl-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user.name}
              </span>
              <span className="inline-flex self-end items-center space-x-1 mt-0.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-3xs font-medium tracking-wide uppercase">
                {user.role === 'admin' ? (
                  <>
                    <Shield className="h-2.5 w-2.5 text-brand-500" />
                    <span className="text-slate-700 dark:text-slate-300">Admin</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-2.5 w-2.5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Sales</span>
                  </>
                )}
              </span>
            </div>
            
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
