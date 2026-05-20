import React from 'react';
import { Eye, Edit, Trash2, Mail } from 'lucide-react';
import { Lead } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';

interface LeadCardProps {
  lead: Lead;
  onView: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onView,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

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

  const editable = isAdmin || lead.assignedTo?._id === user?.id;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-3xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-slate-950 dark:text-white truncate">
              {lead.name}
            </span>
            <span className="inline-flex items-center text-slate-400 text-3xs mt-1 truncate">
              <Mail className="h-3 w-3 mr-1 shrink-0" />
              {lead.email}
            </span>
          </div>
          
          <div className="flex flex-col items-end space-y-1.5 shrink-0 pl-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-4xs font-bold uppercase tracking-wider ${statusColorMap[lead.status]}`}>
              {lead.status}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-4xs font-bold uppercase tracking-wider ${sourceColorMap[lead.source]}`}>
              {lead.source}
            </span>
          </div>
        </div>

        {lead.notes && (
          <p className="text-3xs text-slate-500 dark:text-slate-400 mt-3.5 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40 line-clamp-2">
            {lead.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
        <div className="flex flex-col text-4xs space-y-0.5">
          <span className="text-slate-400">Assigned To:</span>
          {lead.assignedTo ? (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {lead.assignedTo.name}
            </span>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(lead._id)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {editable && (
            <button
              onClick={() => onEdit(lead)}
              className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-brand-950/20 dark:hover:text-brand-400 cursor-pointer"
              title="Edit Lead"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {editable && (
            <button
              onClick={() => onDelete(lead._id)}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 cursor-pointer"
              title="Delete Lead"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
