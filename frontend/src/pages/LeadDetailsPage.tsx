import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Mail, FileText, UserPlus, ShieldAlert, Award } from 'lucide-react';
import { useLeads } from '../hooks/useLeads.js';
import { useAuthStore } from '../store/authStore.js';
import LoadingSpinner from '../components/common/LoadingSpinner.js';
import LeadForm from '../components/leads/LeadForm.js';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { useLeadQuery, deleteLead } = useLeads();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: response, isLoading, isError, refetch } = useLeadQuery(id || '', !!id);
  const lead = response?.data;

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      try {
        await deleteLead(lead._id);
        navigate('/dashboard');
      } catch (err) {
        const error = err as Error;
        alert(`Failed to delete lead: ${error.message}`);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (isError || !lead) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6 select-none">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mb-6 border border-red-500/5">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Lead details not found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          The lead you requested could not be located, or you may lack permissions to view its pipeline details.
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  // Double check authorization (redundant safety)
  const isAdmin = currentUser?.role === 'admin';
  const canModify = isAdmin || lead.assignedTo?._id === currentUser?.id;

  const statusColorMap = {
    new: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    contacted: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    qualified: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    lost: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
  };

  const sourceColorMap = {
    website: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
    instagram: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    referral: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Back & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 self-start"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Return to Dashboard</span>
        </button>

        {canModify && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
            >
              <Edit className="h-4 w-4 text-brand-500" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-2 rounded-xl border border-red-200 dark:border-red-950/40 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span>Delete Lead</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Info Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-3xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
              <div className="space-y-1">
                <span className="text-4xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block">
                  Lead File Profile
                </span>
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">
                  {lead.name}
                </h1>
                <p className="text-xs text-slate-400 font-medium inline-flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {lead.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-3xs font-semibold uppercase tracking-wider ${statusColorMap[lead.status]}`}>
                  {lead.status}
                </span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-3xs font-semibold uppercase tracking-wider ${sourceColorMap[lead.source]}`}>
                  {lead.source}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider inline-flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                Notes & Descriptions
              </h3>
              {lead.notes ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/45 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap">
                  {lead.notes}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/60 text-center">
                  No notes recorded for this lead yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Assignment Details & Timestamps */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-3xs space-y-5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Management Meta
            </h3>

            {/* Lead Owner */}
            <div className="space-y-1.5">
              <span className="text-4xs font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Rep
              </span>
              {lead.assignedTo ? (
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/5">
                    {lead.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {lead.assignedTo.name}
                    </p>
                    <p className="text-4xs text-slate-400">{lead.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-400 italic bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/60 justify-center">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-xs">Unassigned Lead</span>
                </div>
              )}
            </div>

            {/* Lead Creator */}
            <div className="space-y-1.5">
              <span className="text-4xs font-bold text-slate-400 uppercase tracking-wider block">
                Created By
              </span>
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/5">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {lead.createdBy?.name || 'System Seeder'}
                  </p>
                  <p className="text-4xs text-slate-400">{lead.createdBy?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5 text-3xs text-slate-500 dark:text-slate-400 font-semibold">
              <div className="flex justify-between">
                <span className="inline-flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  Date Added
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {new Date(lead.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="inline-flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  Last Updated
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {new Date(lead.updatedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Drawer */}
      {isEditOpen && (
        <LeadForm
          lead={lead}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default LeadDetailsPage;
