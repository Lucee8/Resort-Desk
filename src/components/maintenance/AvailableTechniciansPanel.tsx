import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  Star,
  CheckCircle2,
  Clock,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { Technician } from '../../types';

interface AvailableTechniciansPanelProps {
  technicians: Technician[];
  onSelectTechnician: (tech: Technician) => void;
  onScheduleVendor: () => void;
  onCallTechnician: (tech: Technician) => void;
  onMessageTechnician: (tech: Technician) => void;
}

export default function AvailableTechniciansPanel({
  technicians,
  onSelectTechnician,
  onScheduleVendor,
  onCallTechnician,
  onMessageTechnician
}: AvailableTechniciansPanelProps) {
  const getStatusBadge = (status: Technician['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Available
          </span>
        );
      case 'Busy':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Busy
          </span>
        );
      case 'On Break':
        return (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
            <Coffee className="w-3 h-3 text-slate-400" />
            Break
          </span>
        );
      case 'Offline':
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            Offline
          </span>
        );
    }
  };

  return (
    <div 
      id="panel-available-technicians"
      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Available Technicians
        </h3>
        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
          8 On Duty
        </span>
      </div>

      {/* Technician list */}
      <div className="flex flex-col divide-y divide-slate-100">
        {technicians.map((tech) => {
          const loadPercentage = Math.min(100, (tech.activeTicketsCount / 4) * 100);
          return (
            <div 
              key={tech.id} 
              className="py-3.5 first:pt-1 last:pb-1 group hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Avatar with Status Dot */}
                <div className="relative shrink-0 cursor-pointer" onClick={() => onSelectTechnician(tech)}>
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      tech.status === 'Available' ? 'bg-emerald-500' :
                      tech.status === 'Busy' ? 'bg-amber-500' :
                      tech.status === 'On Break' ? 'bg-slate-400' : 'bg-slate-300'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectTechnician(tech)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-teal-800 transition-colors truncate text-left"
                    >
                      {tech.name}
                    </button>
                    {getStatusBadge(tech.status)}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {tech.department} • Exp: {tech.experience}
                  </p>

                  {/* Workload Indicator */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-150 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          tech.activeTicketsCount === 0 ? 'bg-emerald-500' :
                          tech.activeTicketsCount <= 2 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(12, loadPercentage)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                      {tech.activeTicketsCount} active
                    </span>
                  </div>

                  {/* Quick Actions on Hover */}
                  <div className="mt-2.5 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onCallTechnician(tech)}
                      className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors"
                      title={`Call ${tech.name}`}
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => onMessageTechnician(tech)}
                      className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors"
                      title={`Radio message ${tech.name}`}
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => onSelectTechnician(tech)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors ml-auto"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule External Vendor Button */}
      <div className="pt-2">
        <button
          id="btn-schedule-vendor"
          onClick={onScheduleVendor}
          className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-700 hover:bg-teal-50/50 text-slate-700 hover:text-teal-900 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
          <span>+ Schedule External Vendor</span>
        </button>
      </div>
    </div>
  );
}
