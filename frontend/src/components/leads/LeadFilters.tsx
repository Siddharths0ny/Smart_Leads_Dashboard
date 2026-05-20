import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Status, Source } from '../../types/index.js';

interface LeadFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string[];
  setStatus: (value: string[]) => void;
  source: string[];
  setSource: (value: string[]) => void;
  sort: string;
  setSort: (value: string) => void;
  clearFilters: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  setSearch,
  status,
  setStatus,
  source,
  setSource,
  sort,
  setSort,
  clearFilters,
}) => {
  // Calculate active filter counts
  const activeFiltersCount =
    (search ? 1 : 0) +
    status.length +
    source.length +
    (sort !== 'latest' ? 1 : 0);

  const toggleStatus = (val: Status) => {
    if (status.includes(val)) {
      setStatus(status.filter((s) => s !== val));
    } else {
      setStatus([...status, val]);
    }
  };

  const toggleSource = (val: Source) => {
    if (source.includes(val)) {
      setSource(source.filter((s) => s !== val));
    } else {
      setSource([...source, val]);
    }
  };

  const statuses: Status[] = ['new', 'contacted', 'qualified', 'lost'];
  const sources: Source[] = ['website', 'instagram', 'referral'];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
              Filter Pipeline
            </h3>
            <p className="text-3xs text-slate-400 font-medium">
              Refine and sort leads in your queue
            </p>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-3 self-start lg:self-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 dark:bg-brand-950/20 px-2.5 py-1 text-3xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30">
              {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-1 text-3xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
            Search
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 focus:border-transparent"
              placeholder="Search name or email..."
            />
          </div>
        </div>

        {/* Status multi-select */}
        <div className="space-y-1.5">
          <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => {
              const isActive = status.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`rounded-full px-3 py-1.5 text-3xs font-medium uppercase tracking-wide border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-500 dark:text-white dark:border-brand-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source multi-select */}
        <div className="space-y-1.5">
          <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
            Source
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src) => {
              const isActive = source.includes(src);
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => toggleSource(src)}
                  className={`rounded-full px-3 py-1.5 text-3xs font-medium uppercase tracking-wide border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-500 dark:text-white dark:border-brand-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900'
                  }`}
                >
                  {src}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-1.5">
          <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">
            Sort Order
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="latest">Latest Created</option>
              <option value="oldest">Oldest Created</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;
