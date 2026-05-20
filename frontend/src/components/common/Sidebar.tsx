import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Shield, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Background */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Panel container */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-6 transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Sidebar Close Button Space / Brand Spacer */}
        <div className="flex h-10 items-center px-2 mb-6 lg:hidden">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Navigation Menu
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1 px-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3.5 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer User Widget */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          {user && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                  {user.role === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </p>
                  <p className="truncate text-3xs font-medium text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-start space-x-2 text-3xs text-slate-400">
                <Info className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>
                  Logged in as{' '}
                  <strong className="text-slate-600 dark:text-slate-300 font-semibold uppercase">
                    {user.role.replace('_', ' ')}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
