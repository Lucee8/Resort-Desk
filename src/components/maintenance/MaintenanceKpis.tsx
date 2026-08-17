import React from 'react';
import { 
  ClipboardList, 
  AlertOctagon, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface MaintenanceKpisProps {
  activeCount: number;
  highPriorityCount: number;
  pendingAssignmentCount: number;
  completedThisWeekCount: number;
  efficiencyRate: number;
  onFilterClick?: (filterType: 'all' | 'high_priority' | 'unassigned' | 'completed') => void;
  activeFilter?: string;
}

export default function MaintenanceKpis({
  activeCount = 18,
  highPriorityCount = 5,
  pendingAssignmentCount = 3,
  completedThisWeekCount = 42,
  efficiencyRate = 85,
  onFilterClick,
  activeFilter
}: MaintenanceKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Issues */}
      <div 
        id="kpi-active-issues"
        onClick={() => onFilterClick && onFilterClick('all')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'all' 
            ? 'border-teal-700 ring-2 ring-teal-700/10' 
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <TrendingUp className="w-3 h-3" />
            <span>+3 since yesterday</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Active Issues
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {String(activeCount).padStart(2, '0')}
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              tickets ongoing
            </span>
          </div>
        </div>
      </div>

      {/* 2. High Priority */}
      <div 
        id="kpi-high-priority"
        onClick={() => onFilterClick && onFilterClick('high_priority')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'high_priority' 
            ? 'border-rose-600 ring-2 ring-rose-600/10' 
            : 'border-slate-200/90 hover:border-rose-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertOctagon className="w-5 h-5 font-bold" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            <span>Critical focus</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            High Priority
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold text-rose-600 font-sans tracking-tight">
              {String(highPriorityCount).padStart(2, '0')}
            </h2>
            <span className="text-xs text-rose-500 font-medium">
              requires immediate action
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Assignment */}
      <div 
        id="kpi-pending-assignment"
        onClick={() => onFilterClick && onFilterClick('unassigned')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'unassigned' 
            ? 'border-amber-600 ring-2 ring-amber-600/10' 
            : 'border-slate-200/90 hover:border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span>Needs Technician</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pending Assignment
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold text-amber-700 font-sans tracking-tight">
              {String(pendingAssignmentCount).padStart(2, '0')}
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              in triage queue
            </span>
          </div>
        </div>
      </div>

      {/* 4. Completed This Week */}
      <div 
        id="kpi-completed-week"
        onClick={() => onFilterClick && onFilterClick('completed')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
          activeFilter === 'completed' 
            ? 'border-emerald-600 ring-2 ring-emerald-600/10' 
            : 'border-slate-200/90 hover:border-emerald-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{efficiencyRate}% efficiency</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Completed this Week
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {completedThisWeekCount}
            </h2>
            <span className="text-xs text-emerald-600 font-medium">
              avg 38m resolution
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
