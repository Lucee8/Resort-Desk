import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit3, 
  CreditCard, 
  UserCheck, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Send,
  SlidersHorizontal,
  ChevronDown,
  Star
} from 'lucide-react';
import { StaffMember, StaffDepartment, StaffStatus } from '../../types';

interface StaffDirectoryTabProps {
  staffList: StaffMember[];
  onSelectStaff: (staff: StaffMember) => void;
  onOpenAddStaff: () => void;
  onQuickPay: (staff: StaffMember) => void;
  onOpenMarkAttendance: (staff: StaffMember) => void;
  onOpenAssignShift: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffDirectoryTab({
  staffList,
  onSelectStaff,
  onOpenAddStaff,
  onQuickPay,
  onOpenMarkAttendance,
  onOpenAssignShift,
  triggerToast
}: StaffDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('All');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'attendance' | 'salary'>('name');

  const departments: (StaffDepartment | 'All')[] = [
    'All',
    'Front Desk',
    'Kitchen',
    'Housekeeping',
    'Maintenance',
    'Restaurant',
    'Security',
    'Spa & Wellness'
  ];

  const statuses: (StaffStatus | 'All')[] = ['All', 'On Duty', 'Off Duty', 'On Leave', 'Absent', 'Late'];

  // Filter & Search logic
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // Natural language / query search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        staff.name.toLowerCase().includes(q) ||
        staff.employeeId.toLowerCase().includes(q) ||
        staff.role.toLowerCase().includes(q) ||
        staff.department.toLowerCase().includes(q) ||
        staff.skills.some(s => s.toLowerCase().includes(q)) ||
        (q.includes('duty') && staff.status.toLowerCase().includes('duty')) ||
        (q.includes('leave') && staff.status === 'On Leave') ||
        (q.includes('housekeeping') && staff.department === 'Housekeeping') ||
        (q.includes('chef') && staff.role.toLowerCase().includes('chef'));

      // Department
      const matchesDept = selectedDept === 'All' || staff.department === selectedDept;

      // Status
      const matchesStatus = selectedStatus === 'All' || staff.status === selectedStatus;

      // Shift Filter
      const matchesShift = selectedShiftFilter === 'All' || 
        (selectedShiftFilter === 'Morning' && (staff.todayShift.includes('07:00') || staff.todayShift.includes('08:00') || staff.todayShift.includes('09:00'))) ||
        (selectedShiftFilter === 'Evening' && (staff.todayShift.includes('01:00') || staff.todayShift.includes('02:00') || staff.todayShift.includes('03:00') || staff.todayShift.includes('04:00'))) ||
        (selectedShiftFilter === 'Night' && staff.todayShift.includes('08:00 PM'));

      return matchesSearch && matchesDept && matchesStatus && matchesShift;
    }).sort((a, b) => {
      if (sortBy === 'performance') return b.performanceScore - a.performanceScore;
      if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
      if (sortBy === 'salary') return b.netPay - a.netPay;
      return a.name.localeCompare(b.name);
    });
  }, [staffList, searchQuery, selectedDept, selectedStatus, selectedShiftFilter, sortBy]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStaffIds(filteredStaff.map(s => s.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (actionName: string) => {
    if (selectedStaffIds.length === 0) return;
    triggerToast(`Bulk ${actionName} applied for ${selectedStaffIds.length} selected staff members.`);
    setSelectedStaffIds([]);
  };

  return (
    <div className="flex flex-col gap-5 font-sans animate-in fade-in duration-200">
      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, role, ID, skill, or try 'Housekeeping available tonight'..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white transition-all text-slate-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerToast("Staff database exported as CSV.")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              id="btn-add-staff-directory"
              onClick={onOpenAddStaff}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-200" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Department scrollable tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Status & Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              {statuses.map(s => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="performance">Sort: Performance Score</option>
              <option value="attendance">Sort: Attendance Rate</option>
              <option value="salary">Sort: Net Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when items selected) */}
      {selectedStaffIds.length > 0 && (
        <div className="bg-teal-900 text-white rounded-2xl p-3 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center text-xs font-bold text-teal-200">
              {selectedStaffIds.length}
            </span>
            <span className="text-xs font-bold">Staff Members Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('Mark Attendance (Present)')}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Mark Present
            </button>
            <button
              onClick={() => handleBulkAction('WhatsApp Shift Broadcast')}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Broadcast Notification
            </button>
            <button
              onClick={() => handleBulkAction('Payroll Approval')}
              className="px-3 py-1.5 bg-white text-teal-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Approve Payroll
            </button>
            <button
              onClick={() => setSelectedStaffIds([])}
              className="px-2 py-1.5 text-teal-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Staff Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-teal-800 focus:ring-teal-700"
                  />
                </th>
                <th className="py-3.5 px-4">STAFF MEMBER</th>
                <th className="py-3.5 px-3">DEPARTMENT</th>
                <th className="py-3.5 px-3">STATUS</th>
                <th className="py-3.5 px-3">TODAY'S SHIFT</th>
                <th className="py-3.5 px-3">ATTENDANCE</th>
                <th className="py-3.5 px-3">PERFORMANCE</th>
                <th className="py-3.5 px-3">NET PAY</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((staff) => (
                <tr 
                  key={staff.id}
                  className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                  onClick={() => onSelectStaff(staff)}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.includes(staff.id)}
                      onChange={() => handleToggleSelect(staff.id)}
                      className="rounded text-teal-800 focus:ring-teal-700"
                    />
                  </td>

                  {/* Staff Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {staff.avatarImage ? (
                          <img 
                            src={staff.avatarImage} 
                            alt={staff.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0" 
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-black/5`}>
                            {staff.avatar}
                          </div>
                        )}
                        {staff.isTopPerformer && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">
                            ★
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors text-xs">
                            {staff.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {staff.employeeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {staff.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {staff.department}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3">
                    {staff.status === 'On Duty' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ON DUTY
                      </span>
                    ) : staff.status === 'On Leave' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-100 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        ON LEAVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-150 text-slate-600 border border-slate-200 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        OFF DUTY
                      </span>
                    )}
                  </td>

                  {/* Today's Shift */}
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {staff.todayShift}
                  </td>

                  {/* Attendance */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-700 h-2 rounded-full" 
                          style={{ width: `${staff.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{staff.attendanceRate}%</span>
                    </div>
                  </td>

                  {/* Performance */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{staff.performanceScore.toFixed(2)}</span>
                    </div>
                  </td>

                  {/* Net Pay */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 text-xs">
                    ₹{staff.netPay.toLocaleString('en-IN')}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onQuickPay(staff)}
                        className="px-3 py-1 bg-[#eaf6f6] hover:bg-[#d5eeee] text-teal-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Quick Pay Employee"
                      >
                        Quick Pay
                      </button>
                      <button
                        onClick={() => onSelectStaff(staff)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No staff members found matching your search query.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedDept('All'); setSelectedStatus('All'); }}
                      className="mt-2 text-xs font-bold text-teal-800 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong className="text-slate-800">{filteredStaff.length}</strong> of <strong className="text-slate-800">{staffList.length}</strong> resort staff members
          </div>
          <div className="flex items-center gap-4">
            <span>On Duty: <strong className="text-emerald-700">{staffList.filter(s => s.status === 'On Duty').length}</strong></span>
            <span>On Leave: <strong className="text-amber-700">{staffList.filter(s => s.status === 'On Leave').length}</strong></span>
            <span>Off Duty: <strong className="text-slate-600">{staffList.filter(s => s.status === 'Off Duty').length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
