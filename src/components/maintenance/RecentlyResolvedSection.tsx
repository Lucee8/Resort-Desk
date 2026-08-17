import React from 'react';
import { CheckCircle2, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { RecentlyResolvedMaintenance } from '../../types';

interface RecentlyResolvedSectionProps {
  items: RecentlyResolvedMaintenance[];
  onOpenItem?: (item: RecentlyResolvedMaintenance) => void;
}

export default function RecentlyResolvedSection({
  items,
  onOpenItem
}: RecentlyResolvedSectionProps) {
  return (
    <div id="section-recently-resolved" className="mt-8 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recently Resolved
          </h3>
          <span className="text-xs font-medium text-slate-400">
            Past 24 hours
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenItem && onOpenItem(item)}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            {/* Green Checkmark Circle */}
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-teal-900 transition-colors">
                  {item.title}
                </h4>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {item.completedAgo}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {item.roomNumber}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span className="truncate">Fixed by {item.technicianName}</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {item.resolutionTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
