import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Lead, Status, Source, CreateLeadPayload, UpdateLeadPayload } from '../../types/index.js';
import { useLeads } from '../../hooks/useLeads.js';
import { useAuthStore } from '../../store/authStore.js';

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  status: z.enum(['new', 'contacted', 'qualified', 'lost']),
  source: z.enum(['website', 'instagram', 'referral']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
});

type LeadFormFields = z.infer<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead | null; // If populated, we are in Edit Mode
  onClose: () => void;
  onSuccess: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  lead = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = !!lead;
  const { createLead, updateLead, useUsersQuery } = useLeads();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Fetch users for assignment dropdown (enabled only for admins)
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsersQuery(isAdmin);
  const users = usersResponse?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormFields>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'new',
      source: 'website',
      notes: '',
      assignedTo: '',
    },
  });

  // Populate form with existing lead details if in Edit Mode
  useEffect(() => {
    if (lead) {
      setValue('name', lead.name);
      setValue('email', lead.email);
      setValue('status', lead.status);
      setValue('source', lead.source);
      setValue('notes', lead.notes || '');
      setValue('assignedTo', lead.assignedTo?._id || '');
    }
  }, [lead, setValue]);

  const onSubmit = async (data: LeadFormFields) => {
    try {
      const payload: CreateLeadPayload = {
        name: data.name,
        email: data.email,
        status: data.status as Status,
        source: data.source as Source,
        notes: data.notes || undefined,
        assignedTo: data.assignedTo || null,
      };

      if (isEditMode && lead) {
        await updateLead({ id: lead._id, data: payload as UpdateLeadPayload });
      } else {
        await createLead(payload);
      }
      onSuccess();
    } catch (err) {
      const error = err as Error & { code?: string };
      if (error.code === 'LEAD_EMAIL_EXISTS' || error.code === 'DUPLICATE_KEY_ERROR') {
        setError('email', {
          type: 'manual',
          message: 'This lead email is already registered in the system.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  const statuses: { value: Status; label: string }[] = [
    { value: 'new', label: 'New Lead' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
  ];

  const sources: { value: Source; label: string }[] = [
    { value: 'website', label: 'Company Website' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'referral', label: 'Referral Program' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
          <div>
            <h2 className="text-md font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Modify Lead Details' : 'Register New Lead'}
            </h2>
            <p className="text-4xs text-slate-500 dark:text-slate-400 font-medium">
              {isEditMode ? 'Update data fields for the active lead' : 'Add a new prospect to your sales pipeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.root && (
            <div className="flex items-center space-x-2.5 rounded-xl bg-red-500/10 p-4 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Lead Name */}
          <div className="space-y-1.5">
            <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Lead Name
            </label>
            <input
              type="text"
              {...register('name')}
              disabled={isSubmitting}
              className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Liam Thompson"
            />
            {errors.name && (
              <p className="text-3xs font-semibold text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Lead Email */}
          <div className="space-y-1.5">
            <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              disabled={isSubmitting}
              className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="lthompson@company.com"
            />
            {errors.email && (
              <p className="text-3xs font-semibold text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Status */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
                Status
              </label>
              <select
                {...register('status')}
                disabled={isSubmitting}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer appearance-none [&>option]:bg-slate-900"
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lead Source */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
                Source
              </label>
              <select
                {...register('source')}
                disabled={isSubmitting}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer appearance-none [&>option]:bg-slate-900"
              >
                {sources.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Assignee (Admin only) */}
          {isAdmin && (
            <div className="space-y-1.5">
              <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
                Lead Assignee (Admin Only)
              </label>
              <select
                {...register('assignedTo')}
                disabled={isSubmitting || isLoadingUsers}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer appearance-none [&>option]:bg-slate-900"
              >
                <option value="">Leave Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : 'Sales'})
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-3xs font-semibold text-red-400 mt-1">{errors.assignedTo.message}</p>
              )}
            </div>
          )}

          {/* Lead Notes */}
          <div className="space-y-1.5">
            <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
              Internal Notes
            </label>
            <textarea
              {...register('notes')}
              disabled={isSubmitting}
              rows={3}
              className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none ${
                errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Looking to onboard 15 users. Requested demo session..."
            />
            <div className="flex justify-between text-4xs text-slate-400">
              <span>Maximum 500 characters</span>
            </div>
            {errors.notes && (
              <p className="text-3xs font-semibold text-red-400 mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
