import React, { useState } from 'react';
import { Plus, Download, BarChart2, Briefcase, TrendingUp, Users, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { useLeads } from '../hooks/useLeads.js';
import { useAuthStore } from '../store/authStore.js';
import { useDebounce } from '../hooks/useDebounce.js';
import leadService from '../services/leadService.js';
import LeadFilters from '../components/leads/LeadFilters.js';
import LeadTable from '../components/leads/LeadTable.js';
import LeadCard from '../components/leads/LeadCard.js';
import LeadForm from '../components/leads/LeadForm.js';
import { Lead } from '../types/index.js';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { useLeadsQuery, deleteLead } = useLeads();

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [source, setSource] = useState<string[]>([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Debounce search query (300ms delay)
  const debouncedSearch = useDebounce(search, 300);

  // Assemble Active Filters
  const activeFilters = {
    page,
    limit,
    sort,
    search: debouncedSearch,
    status: status.join(','),
    source: source.join(','),
  };

  // Query Leads
  const { data: response, isLoading, isError, refetch } = useLeadsQuery(activeFilters);
  const leads = response?.data || [];
  const pagination = response?.pagination;

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStatus([]);
    setSource([]);
    setSort('latest');
    setPage(1);
  };

  // Trigger CSV Export
  const handleExportCSV = async () => {
    try {
      const exportFilters = {
        sort,
        search: debouncedSearch,
        status: status.join(','),
        source: source.join(','),
      };
      await leadService.downloadCSV(exportFilters);
    } catch (err) {
      const error = err as Error;
      alert(`CSV Export Failed: ${error.message}`);
    }
  };

  // Toggle Edit Modal
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  // Handle Delete
  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      try {
        await deleteLead(id);
      } catch (err) {
        const error = err as Error;
        alert(`Failed to delete lead: ${error.message}`);
      }
    }
  };

  // Handle View Details
  const handleViewLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  // Calculate Metrics from leads (within this visible query)
  // For a professional dashboard, we can display counts based on the active query response
  const totalLeads = pagination?.total || 0;
  const qualifiedCount = leads.filter((l) => l.status === 'qualified').length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;

  return (
    <div className="space-y-6 select-none">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sales Pipeline Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, <strong className="text-slate-700 dark:text-slate-200">{user?.name}</strong>. Here is your pipeline review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 focus:outline-none cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {/* Create Lead Button */}
          <button
            onClick={() => {
              setEditingLead(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-3xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Leads
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalLeads}
            </span>
            <span className="text-4xs text-slate-400 block font-medium">Active prospects in pipeline</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/5">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: New */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-3xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              New Leads
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : leads.filter(l => l.status === 'new').length}
            </span>
            <span className="text-4xs text-slate-400 block font-medium">Prospects awaiting review</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/5">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Contacted */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-3xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Contacted
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : contactedCount}
            </span>
            <span className="text-4xs text-slate-400 block font-medium">Conversations in progress</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/5">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Qualified */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-3xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Qualified
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? '...' : qualifiedCount}
            </span>
            <span className="text-4xs text-slate-400 block font-medium">Prospects meeting conditions</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/5">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <LeadFilters
        search={search}
        setSearch={(val) => { setSearch(val); setPage(1); }}
        status={status}
        setStatus={(val) => { setStatus(val); setPage(1); }}
        source={source}
        setSource={(val) => { setSource(val); setPage(1); }}
        sort={sort}
        setSort={(val) => { setSort(val); setPage(1); }}
        clearFilters={handleClearFilters}
      />

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/5 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mb-4">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-slate-900 dark:text-red-400 mb-1">
            Failed to retrieve leads list
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            A network interruption prevented loading your leads directory. Please verify server connection.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2.5 shadow-md shadow-red-500/15"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Leads Directory (Visible only when not erroring) */}
      {!isError && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <LeadTable
              leads={leads}
              isLoading={isLoading}
              onView={handleViewLead}
              onEdit={handleEditLead}
              onDelete={handleDeleteLead}
            />
          </div>

          {/* Mobile Grid View */}
          <div className="block md:hidden">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center">
                <p className="text-xs text-slate-500">No leads found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead._id}
                    lead={lead}
                    onView={handleViewLead}
                    onEdit={handleEditLead}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
              <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">
                Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
                {Math.min(page * limit, totalLeads)} of {totalLeads} records
              </span>

              <div className="flex items-center space-x-2">
                {/* Previous Page */}
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!pagination.hasPrev || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                {/* Page badges */}
                {[...Array(pagination.pages)].map((_, index) => {
                  const pNum = index + 1;
                  // Render limited pages in list to keep compact
                  if (Math.abs(page - pNum) > 1 && pNum !== 1 && pNum !== pagination.pages) {
                    return null;
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`h-9 w-9 rounded-xl text-xs font-semibold cursor-pointer ${
                        page === pNum
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                  disabled={!pagination.hasNext || isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal Dialog */}
      {isFormOpen && (
        <LeadForm
          lead={editingLead}
          onClose={() => {
            setIsFormOpen(false);
            setEditingLead(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingLead(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
