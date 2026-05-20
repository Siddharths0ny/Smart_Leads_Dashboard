import React from 'react';
import { Eye, Edit, Trash2, Calendar, Mail, FileText, UserPlus } from 'lucide-react';
import { Lead } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Status Badge Color Map
  const statusColorMap = {
    new: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    contacted: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    qualified: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    lost: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
  };

  // Source Badge Color Map
  const sourceColorMap = {
    website: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
    instagram: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    referral: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30',
  };

  // Check if active user has write permissions for this lead
  const canModifyLead = (lead: Lead) => {
    if (isAdmin) return true;
    return lead.assignedTo?._id === user?.id;
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-12 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 animate-pulse" />
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800/60 p-4"
          >
            <div className="h-4 w-1/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-1/5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-12 ml-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-16 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800 mb-6">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          No leads found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          No leads match the active filters in your pipeline. Try adjusting filters or create a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-3xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4">Lead Name</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Source</th>
              <th scope="col" className="px-6 py-4">Assigned To</th>
              <th scope="col" className="px-6 py-4">Created Date</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {leads.map((lead) => {
              const editable = canModifyLead(lead);
              return (
                <tr
                  key={lead._id}
                  className="group hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                >
                  {/* Name & Email */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {lead.name}
                      </span>
                      <span className="inline-flex items-center text-slate-400 text-3xs mt-0.5">
                        <Mail className="h-3 w-3 mr-1" />
                        {lead.email}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${statusColorMap[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Source Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider ${sourceColorMap[lead.source]}`}>
                      {lead.source}
                    </span>
                  </td>

                  {/* Assigned User */}
                  <td className="px-6 py-4">
                    {lead.assignedTo ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-4xs uppercase">
                            {lead.assignedTo.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {lead.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-slate-400 italic">
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Created At Date */}
                  <td className="px-6 py-4 text-slate-500">
                    <span className="inline-flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100">
                      {/* View Details */}
                      <button
                        onClick={() => onView(lead._id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      {editable && (
                        <button
                          onClick={() => onEdit(lead)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-brand-950/20 dark:hover:text-brand-400 cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete */}
                      {editable && (
                        <button
                          onClick={() => onDelete(lead._id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
