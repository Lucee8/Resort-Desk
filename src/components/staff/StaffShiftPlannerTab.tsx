import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Plus, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  ArrowRightLeft, 
  Layers, 
  ChevronRight, 
  Download, 
  Filter, 
  Check,
  TrendingUp
} from 'lucide-react';
import { StaffShiftPlan, StaffCoverageDay, StaffMember } from '../../types';

interface StaffShiftPlannerTabProps {
  shiftPlans: StaffShiftPlan[];
  weeklyCoverage: StaffCoverageDay[];
  staffList: StaffMember[];
  onOpenAIScheduler: () => void;
  onOpenCreateShift: () => void;
  onResolveGap: (day: string, dept: string) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffShiftPlannerTab({
  shiftPlans,
  weeklyCoverage,
  staffList,
  onOpenAIScheduler,
  onOpenCreateShift,
  onResolveGap,
  triggerToast
}: StaffShiftPlannerTabProps) {
  const [selectedWeek, setSelectedWeek] = useState<'Week 34' | 'Week 35'>('Week 34');
  const [activeDeptTab, setActiveDeptTab] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('Wed');

  const departments = ['All', 'Front Desk', 'Kitchen', 'Housekeeping', 'Maintenance', 'Restaurant', 'Security'];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const currentCoverageDay = weeklyCoverage.find(d => d.day === selectedDay) || weeklyCoverage[2];

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Top Banner with AI Scheduler Trigger */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">AI Shift & Coverage Optimization</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Weekend Occupancy 96%
            </span>
          </div>
          <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
            ResortDesk AI continuously monitors incoming check-in volume, banquet dinners, and approved staff leaves to auto-balance 24/7 coverage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateShift}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/20 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Shift Template</span>
          </button>
          <button
            id="btn-ai-generate-schedule-banner"
            onClick={onOpenAIScheduler}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-teal-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-teal-950 fill-teal-950" />
            <span>AI Auto-Generate Next Week</span>
          </button>
        </div>
      </div>

      {/* 1. WEEKLY COVERAGE MATRIX (Full interactive view) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">24/7 Weekly Roster & Coverage Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any day column to view and edit scheduled staff assignments.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedWeek('Week 34')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedWeek === 'Week 34' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Week 34 (Current)
              </button>
              <button
                onClick={() => setSelectedWeek('Week 35')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedWeek === 'Week 35' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Week 35 (Next Week)
              </button>
            </div>
            <button
              onClick={() => triggerToast("Schedule published to staff WhatsApp group and mobile portal.")}
              className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Publish Schedule
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 bg-slate-50/70 border-b border-slate-100">
                <th className="text-left py-3 px-4 uppercase tracking-wider">DEPARTMENT</th>
                {weeklyCoverage.map(day => (
                  <th 
                    key={day.day} 
                    onClick={() => setSelectedDay(day.day)}
                    className={`py-3 px-3 cursor-pointer transition-colors ${
                      selectedDay === day.day ? 'text-teal-900 bg-teal-50/60 font-black' : 'hover:text-slate-800'
                    }`}
                  >
                    <div>{day.day}</div>
                    <div className="text-[10px] font-medium text-slate-400">{day.dateStr}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {['Front Desk', 'Kitchen', 'Housekeeping', 'Maintenance', 'Restaurant', 'Security'].map(dept => (
                <tr key={dept} className="hover:bg-slate-50/60 transition-colors">
                  <td className="text-left py-3.5 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                    {dept}
                  </td>
                  {weeklyCoverage.map(day => {
                    const deptInfo = day.departments[dept] || { scheduled: 2, required: 2, hasGap: false, staffNames: [] };
                    const isGap = deptInfo.hasGap;
                    const isOver = deptInfo.scheduled > deptInfo.required;
                    return (
                      <td key={day.day} className={`py-2 px-2 ${selectedDay === day.day ? 'bg-teal-50/30' : ''}`}>
                        <button
                          onClick={() => {
                            setSelectedDay(day.day);
                            if (isGap) onResolveGap(day.day, dept);
                          }}
                          className={`w-14 h-9 rounded-xl flex items-center justify-center mx-auto text-xs font-bold transition-all cursor-pointer ${
                            isGap 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/40 shadow-xs' 
                              : isOver
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                                : 'bg-[#c5e6e3] text-teal-950 hover:opacity-90'
                          }`}
                        >
                          {deptInfo.scheduled} / {deptInfo.required}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend & AI Gap Callout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#c5e6e3] border border-teal-200"></span> Fully Staffed (Match)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></span> Coverage Gap (Understaffed)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200"></span> High Volume Extra Shift
            </span>
          </div>

          <div className="text-slate-500">
            Selected Day: <strong className="text-teal-900">{selectedDay} ({currentCoverageDay.dateStr})</strong>
          </div>
        </div>
      </div>

      {/* 2. SHIFT ROSTER DETAIL FOR SELECTED DAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Scheduled Staff breakdown for selected day (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-base text-slate-900">
                {selectedDay} Roster Breakdown ({currentCoverageDay.dateStr})
              </h4>
              <p className="text-xs text-slate-500">Shift assignments across all 6 resort operating departments</p>
            </div>
            <button
              onClick={() => triggerToast(`Shift swap request sent for ${selectedDay}.`)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Shift Swap</span>
            </button>
          </div>

          {/* Department breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(currentCoverageDay.departments).map(([deptName, info]) => (
              <div 
                key={deptName}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                  info.hasGap ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{deptName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    info.hasGap ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {info.scheduled} / {info.required} Staffed
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {info.staffNames.map((name, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-white rounded-lg text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      {name}
                    </span>
                  ))}
                  {info.hasGap && (
                    <button
                      onClick={() => onResolveGap(selectedDay, deptName)}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-teal-950 font-bold rounded-lg text-[11px] shadow-xs cursor-pointer"
                    >
                      + Fill Gap
                    </button>
                  )}
                </div>

                {info.hasGap && (
                  <p className="text-[11px] text-amber-800 font-medium leading-tight">
                    ⚠️ {info.aiSuggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shift Templates library on right (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-base text-slate-900">Active Shift Templates</h4>
            <span className="text-xs text-slate-400 font-semibold">{shiftPlans.length} shifts</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {shiftPlans.map((plan) => (
              <div 
                key={plan.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900">{plan.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{plan.startTime} – {plan.endTime}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Required</span>
                  <span className="text-xs font-bold text-slate-800">{plan.requiredStaff} Staff</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenCreateShift}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Add Custom Shift Rule</span>
          </button>
        </div>

      </div>
    </div>
  );
}
