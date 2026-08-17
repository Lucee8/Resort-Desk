import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Filter, 
  Download, 
  ArrowUpRight, 
  Check, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Bell,
  Search,
  UserCheck,
  Send
} from 'lucide-react';
import { 
  StaffMember, 
  StaffLeaveRequest, 
  StaffCoverageDay, 
  StaffTask 
} from '../../types';

interface StaffOverviewProps {
  staffList: StaffMember[];
  leaveRequests: StaffLeaveRequest[];
  weeklyCoverage: StaffCoverageDay[];
  onSelectStaff: (staff: StaffMember) => void;
  onOpenAddStaff: () => void;
  onOpenReleasePayroll: () => void;
  onOpenBulkAttendance: () => void;
  onOpenShiftPlanner: () => void;
  onOpenLeaveDetails: (request: StaffLeaveRequest) => void;
  onQuickPay: (staff: StaffMember) => void;
  onViewAllStaff: () => void;
  onOpenAIScheduler: () => void;
  onResolveCoverageGap: (day: string, dept: string) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffOverview({
  staffList,
  leaveRequests,
  weeklyCoverage,
  onSelectStaff,
  onOpenAddStaff,
  onOpenReleasePayroll,
  onOpenBulkAttendance,
  onOpenShiftPlanner,
  onOpenLeaveDetails,
  onQuickPay,
  onViewAllStaff,
  onOpenAIScheduler,
  onResolveCoverageGap,
  triggerToast
}: StaffOverviewProps) {
  const [automateAttendance, setAutomateAttendance] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<'Week 34' | 'Week 35'>('Week 34');
  const [selectedCoverageCell, setSelectedCoverageCell] = useState<{ day: string; dept: string } | null>(null);

  // Active staff count calculation
  const activeCount = staffList.filter(s => s.status === 'On Duty').length;
  const totalStaff = staffList.length;
  const pendingLeaveCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const topPerformers = [...staffList].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3);

  // Top 4 preview staff for main directory card
  const previewStaff = staffList.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* 1. TOP KPI CARDS (4-Grid matching reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Staff Today */}
        <div id="kpi-active-staff" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              +2 from yesterday
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Active Staff Today</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{activeCount} / {totalStaff}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Leave Requests */}
        <div id="kpi-pending-leave" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              Urgent
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Pending Leave Requests</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">0{pendingLeaveCount}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Monthly Payroll */}
        <div id="kpi-monthly-payroll" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Aug 2024
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Monthly Payroll Total</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">₹4,25,000</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Average Performance */}
        <div id="kpi-avg-performance" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Excellent
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Avg. Performance</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">4.8 / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD (Matching Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: STAFF DIRECTORY + WEEKLY COVERAGE PLANNER (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* STAFF DIRECTORY SUMMARY CARD */}
          <div id="staff-directory-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Staff Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage roles, status, and quick payroll actions.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  id="btn-filter-staff"
                  onClick={onViewAllStaff}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filter</span>
                </button>
                <button 
                  id="btn-export-csv-summary"
                  onClick={() => triggerToast("Staff Directory exported as staff_directory_aug2024.csv")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">NAME & ROLE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">TODAY'S SHIFT</th>
                    <th className="py-3 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {previewStaff.map((staff) => (
                    <tr 
                      key={staff.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectStaff(staff)}
                    >
                      {/* Name & Role */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-black/5`}>
                            {staff.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors text-xs">
                              {staff.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {staff.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {staff.status === 'On Duty' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ON DUTY
                          </span>
                        ) : staff.status === 'On Leave' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-100 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            ON LEAVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-150 text-slate-600 border border-slate-200 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            OFF DUTY
                          </span>
                        )}
                      </td>

                      {/* Today's Shift */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                        {staff.todayShift}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`quick-pay-${staff.id}`}
                          onClick={() => onQuickPay(staff)}
                          className="px-3.5 py-1.5 bg-[#eaf6f6] hover:bg-[#d5eeee] text-teal-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Quick Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer View All Toggle */}
            <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-center">
              <button
                id="btn-view-all-staff-footer"
                onClick={onViewAllStaff}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 transition-colors cursor-pointer"
              >
                View All {totalStaff} Staff Members →
              </button>
            </div>
          </div>

          {/* WEEKLY COVERAGE PLANNER CARD */}
          <div id="weekly-coverage-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Weekly Coverage Planner</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ensuring 24/7 resort operations</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedWeek('Week 34')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedWeek === 'Week 34' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Week 34
                </button>
                <button
                  onClick={() => setSelectedWeek('Week 35')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedWeek === 'Week 35' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Week 35
                </button>
              </div>
            </div>

            {/* Coverage Matrix Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400">
                    <th className="text-left py-2 px-3 font-semibold text-slate-400"></th>
                    <th className="py-2 px-2 font-semibold">Mon</th>
                    <th className="py-2 px-2 font-semibold">Tue</th>
                    <th className="py-2 px-2 font-semibold">Wed</th>
                    <th className="py-2 px-2 font-semibold">Thu</th>
                    <th className="py-2 px-2 font-semibold">Fri</th>
                    <th className="py-2 px-2 font-semibold">Sat</th>
                    <th className="py-2 px-2 font-semibold">Sun</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold">
                  {/* Front Desk Row */}
                  <tr className="border-t border-slate-100">
                    <td className="text-left py-3 px-3 font-bold text-slate-800 text-xs whitespace-nowrap">
                      Front Desk
                    </td>
                    {weeklyCoverage.map((day) => {
                      const deptInfo = day.departments['Front Desk'];
                      const isGap = deptInfo?.hasGap;
                      return (
                        <td key={day.day} className="py-2 px-1">
                          <button
                            onClick={() => {
                              setSelectedCoverageCell({ day: day.day, dept: 'Front Desk' });
                              if (isGap) {
                                onResolveCoverageGap(day.day, 'Front Desk');
                              }
                            }}
                            className={`w-11 h-9 rounded-xl flex items-center justify-center mx-auto text-xs font-bold transition-all cursor-pointer ${
                              isGap 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30' 
                                : 'bg-[#c5e6e3] text-teal-950 hover:opacity-90'
                            }`}
                            title={isGap ? deptInfo?.aiSuggestion : `${deptInfo?.scheduled}/${deptInfo?.required} Staffed`}
                          >
                            {deptInfo?.scheduled}/{deptInfo?.required}
                          </button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Kitchen Row */}
                  <tr className="border-t border-slate-100">
                    <td className="text-left py-3 px-3 font-bold text-slate-800 text-xs whitespace-nowrap">
                      Kitchen
                    </td>
                    {weeklyCoverage.map((day) => {
                      const deptInfo = day.departments['Kitchen'];
                      const isGap = deptInfo?.hasGap;
                      return (
                        <td key={day.day} className="py-2 px-1">
                          <button
                            onClick={() => setSelectedCoverageCell({ day: day.day, dept: 'Kitchen' })}
                            className={`w-11 h-9 rounded-xl flex items-center justify-center mx-auto text-xs font-bold transition-all cursor-pointer ${
                              isGap 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                : 'bg-[#c5e6e3] text-teal-950 hover:opacity-90'
                            }`}
                          >
                            {deptInfo?.scheduled}/{deptInfo?.required}
                          </button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Housekeeping Row */}
                  <tr className="border-t border-slate-100">
                    <td className="text-left py-3 px-3 font-bold text-slate-800 text-xs whitespace-nowrap">
                      Housekeeping
                    </td>
                    {weeklyCoverage.map((day) => {
                      const deptInfo = day.departments['Housekeeping'];
                      const isGap = deptInfo?.hasGap;
                      return (
                        <td key={day.day} className="py-2 px-1">
                          <button
                            onClick={() => setSelectedCoverageCell({ day: day.day, dept: 'Housekeeping' })}
                            className={`w-11 h-9 rounded-xl flex items-center justify-center mx-auto text-xs font-bold transition-all cursor-pointer ${
                              isGap 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                : 'bg-[#c5e6e3] text-teal-950 hover:opacity-90'
                            }`}
                          >
                            {deptInfo?.scheduled}/{deptInfo?.required}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legend & AI Gap Alert */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#c5e6e3] border border-teal-200"></span>
                  <span>Fully Staffed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></span>
                  <span>Gaps Identified</span>
                </div>
              </div>

              <button
                id="btn-open-ai-scheduler"
                onClick={onOpenAIScheduler}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Auto-Balance Schedule →</span>
              </button>
            </div>

            {/* AI Callout Banner for Gap */}
            <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-amber-900">AI Scheduling Alert: </span>
                <span className="text-amber-800">
                  Front Desk is understaffed on Wednesday evening (2/3). Sneha Patil is on approved marriage leave.
                </span>
                <button 
                  onClick={() => onResolveCoverageGap('Wed', 'Front Desk')}
                  className="ml-2 font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer"
                >
                  Assign Priya Sharma
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTENDANCE + TOP PERFORMERS + PAYROLL READY (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* CARD 1: ATTENDANCE */}
          <div id="attendance-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Attendance</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAutomateAttendance(!automateAttendance);
                    triggerToast(`Automatic biometric & geofence attendance ${!automateAttendance ? 'Enabled' : 'Paused'}`);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    automateAttendance ? 'bg-teal-800' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      automateAttendance ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-slate-600">Automate</span>
              </div>
            </div>

            {/* Leave & Absence Items */}
            <div className="flex flex-col gap-2.5 mt-3.5">
              {leaveRequests.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  onClick={() => onOpenLeaveDetails(req)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Date Block */}
                    <div className="w-11 h-11 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                        {req.startDate.split(' ')[0]}
                      </span>
                      <span className="text-sm font-black text-slate-800 leading-none mt-0.5">
                        {req.startDate.split(' ')[1]?.replace(',', '')}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">
                        {req.staffName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {req.leaveType} {req.status === 'Pending' ? <span className="text-amber-600 font-semibold">(Pending)</span> : <span className="text-emerald-600 font-semibold">(Approved)</span>}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              ))}
            </div>

            {/* Mark Bulk Attendance Button */}
            <button
              id="btn-mark-bulk-attendance"
              onClick={onOpenBulkAttendance}
              className="w-full mt-4 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Mark Bulk Attendance</span>
            </button>
          </div>

          {/* CARD 2: TOP PERFORMERS */}
          <div id="top-performers-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            {/* Header */}
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Top Performers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Based on guest reviews & tasks</p>
            </div>

            {/* Performers List */}
            <div className="flex flex-col gap-3.5 mt-3.5">
              {topPerformers.map((performer, idx) => (
                <div 
                  key={performer.id}
                  onClick={() => onSelectStaff(performer)}
                  className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={performer.avatarImage || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80"} 
                        alt={performer.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                        idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-teal-800 transition-colors">
                        {performer.name}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                        <span>⭐ {performer.performanceScore.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasks</span>
                    <span className="text-xs font-bold text-slate-800">{performer.tasksCompleted}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Manager Note Callout (Cyan Tint Quote matching reference) */}
            <div className="mt-4 p-3.5 bg-[#eaf6f6] rounded-xl border border-[#cbebe9] text-xs">
              <p className="italic text-teal-950 font-medium leading-relaxed">
                "Vikram consistently receives glowing reviews for his 'Malvani Special' dinner menu. Guest satisfaction up 12%."
              </p>
              <p className="text-[10px] font-bold text-teal-800 text-right mt-1.5 uppercase tracking-wider">
                — AI Manager Note
              </p>
            </div>
          </div>

          {/* CARD 3: PAYROLL READY (Deep Teal matching reference) */}
          <div id="payroll-ready-card" className="bg-[#0c4a45] text-white rounded-2xl p-6 shadow-md shadow-teal-950/20 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Payroll Ready</h3>
            </div>

            <p className="text-xs text-teal-100/90 leading-relaxed font-normal">
              August payroll is calculated for all 15 staff members. Review and approve to release funds.
            </p>

            <button
              id="btn-release-payroll-hero"
              onClick={onOpenReleasePayroll}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-teal-950 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.99]"
            >
              Release Payroll
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
