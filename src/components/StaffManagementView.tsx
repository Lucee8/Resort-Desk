import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  CreditCard, 
  Star, 
  Download, 
  Search, 
  Bell, 
  HelpCircle, 
  CheckSquare, 
  Sparkles, 
  SlidersHorizontal,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Building
} from 'lucide-react';
import { 
  StaffMember, 
  StaffLeaveRequest, 
  StaffCoverageDay, 
  StaffShiftPlan, 
  StaffTask, 
  StaffAIInsightItem,
  AttendanceStatus 
} from '../types';
import { 
  initialStaffMembers, 
  initialLeaveRequests, 
  initialWeeklyCoverage, 
  initialShiftPlans, 
  initialStaffTasks, 
  initialAIInsights 
} from '../data/staffData';

import StaffOverview from './staff/StaffOverview';
import StaffDirectoryTab from './staff/StaffDirectoryTab';
import StaffAttendanceTab from './staff/StaffAttendanceTab';
import StaffShiftPlannerTab from './staff/StaffShiftPlannerTab';
import StaffLeaveTab from './staff/StaffLeaveTab';
import StaffPerformanceTab from './staff/StaffPerformanceTab';
import StaffPayrollTab from './staff/StaffPayrollTab';
import StaffTasksTab from './staff/StaffTasksTab';
import StaffAIWorkspaceTab from './staff/StaffAIWorkspaceTab';

import StaffProfileModal from './staff/StaffProfileModal';
import AddStaffModal from './staff/AddStaffModal';
import ReviewPayrollModal from './staff/ReviewPayrollModal';
import MarkBulkAttendanceModal from './staff/MarkBulkAttendanceModal';
import AIScheduleModal from './staff/AIScheduleModal';
import RecognitionModal from './staff/RecognitionModal';
import ApplyLeaveModal from './staff/ApplyLeaveModal';

interface StaffManagementViewProps {
  initialTab?: string;
}

export default function StaffManagementView({ initialTab = 'overview' }: StaffManagementViewProps) {
  // Primary Navigation Tab State
  const [currentTab, setCurrentTab] = useState<string>(initialTab);

  // Core Entity State
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaffMembers);
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>(initialLeaveRequests);
  const [weeklyCoverage, setWeeklyCoverage] = useState<StaffCoverageDay[]>(initialWeeklyCoverage);
  const [shiftPlans, setShiftPlans] = useState<StaffShiftPlan[]>(initialShiftPlans);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(initialStaffTasks);
  const [aiInsights, setAiInsights] = useState<StaffAIInsightItem[]>(initialAIInsights);

  // Modals state
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<StaffMember | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [isAIScheduleOpen, setIsAIScheduleOpen] = useState(false);
  const [recognitionStaff, setRecognitionStaff] = useState<StaffMember | null>(null);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<StaffLeaveRequest | null>(null);

  // Global search input in header
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('Vanya Boutique Resort, Konkan');

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Quick Pay individual handler
  const handleQuickPay = (staff: StaffMember) => {
    setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, payrollStatus: 'Paid' } : s));
    triggerToast(`Direct IMPS payout of ₹${staff.netPay.toLocaleString('en-IN')} initiated to ${staff.name}'s ${staff.bankDetails?.bankName || 'bank account'}.`);
  };

  // Add/Edit staff handler
  const handleSaveStaff = (staffData: Partial<StaffMember>) => {
    if (staffData.id) {
      // Edit
      setStaffList(prev => prev.map(s => s.id === staffData.id ? { ...s, ...staffData } as StaffMember : s));
      triggerToast(`Staff profile for ${staffData.name} updated successfully.`);
    } else {
      // Add
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: staffData.name || 'New Staff',
        role: staffData.role || 'Resort Associate',
        department: staffData.department || 'Front Desk',
        status: 'On Duty',
        phone: staffData.phone || '+91 98200 00000',
        email: staffData.email || 'staff@resortdesk.ai',
        todayShift: staffData.todayShift || '09:00 AM - 06:00 PM',
        baseSalary: staffData.baseSalary || 25000,
        netPay: staffData.netPay || 24200,
        attendanceRate: 100,
        performanceScore: 4.8,
        managerRating: 4.8,
        tasksCompleted: 0,
        taskCompletionRate: 100,
        responseTimeMins: 5.0,
        guestRating: 4.8,
        complaintsCount: 0,
        overtimeHours: 0,
        overtimePay: 0,
        bonus: 0,
        deductions: 800,
        payrollStatus: 'Ready',
        employmentType: staffData.employmentType || 'Full-time',
        joinDate: 'Aug 2024',
        avatar: staffData.avatar || 'NS',
        avatarBg: 'bg-teal-100 text-teal-800',
        leaveBalance: { casual: 5, sick: 7, annual: 10, emergency: 2 },
        skills: staffData.skills || ['Hospitality'],
        bankDetails: staffData.bankDetails || {
          bankName: 'HDFC Bank',
          accountNumber: '•••• 8824',
          ifsc: 'HDFC0001824'
        }
      };
      setStaffList(prev => [newStaff, ...prev]);
      triggerToast(`Added ${newStaff.name} (${newStaff.role}) to resort staff roster.`);
    }
  };

  // Leave approval/rejection
  const handleApproveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    triggerToast("Leave request approved. Coverage schedule updated.");
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    triggerToast("Leave request rejected.");
  };

  // Bulk attendance update
  const handleSaveBulkAttendance = (attendanceMap: Record<string, AttendanceStatus>) => {
    setStaffList(prev => prev.map(s => {
      const status = attendanceMap[s.id];
      if (!status) return s;
      const newStatus = status === 'Present' || status === 'Late' ? 'On Duty' : status === 'On Leave' ? 'On Leave' : 'Off Duty';
      return {
        ...s,
        status: newStatus
      };
    }));
  };

  // Resolve coverage gap
  const handleResolveGap = (day: string, dept: string) => {
    setWeeklyCoverage(prev => prev.map(d => {
      if (d.day !== day) return d;
      return {
        ...d,
        departments: {
          ...d.departments,
          [dept]: {
            ...d.departments[dept],
            scheduled: d.departments[dept].required,
            hasGap: false,
            staffNames: [...d.departments[dept].staffNames, 'Priya Sharma (Relief)'],
            aiSuggestion: undefined
          }
        }
      };
    }));
    triggerToast(`Coverage gap on ${day} (${dept}) resolved by assigning Priya Sharma.`);
  };

  // Task status toggle
  const handleToggleTaskStatus = (taskId: string) => {
    setStaffTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextStatus = t.status === 'Pending' ? 'In Progress' : t.status === 'In Progress' ? 'Completed' : 'Pending';
      return { ...t, status: nextStatus };
    }));
  };

  // Assign new task
  const handleAssignTask = (newTask: Partial<StaffTask>) => {
    const task: StaffTask = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'Operational Task',
      department: newTask.department || 'Housekeeping',
      assignedToName: newTask.assignedToName || 'Staff Member',
      assignedToId: newTask.assignedToId || 'staff-1',
      assignedToAvatar: newTask.assignedToAvatar || 'VK',
      location: newTask.location || 'Resort',
      priority: newTask.priority || 'Normal',
      status: 'Pending',
      dueTime: 'Today 05:00 PM'
    };
    setStaffTasks(prev => [task, ...prev]);
  };

  // Batch release payroll
  const handleConfirmReleasePayroll = () => {
    setStaffList(prev => prev.map(s => ({ ...s, payrollStatus: 'Paid' })));
    triggerToast("August 2024 payroll released for all 15 staff members.");
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. TOP UTILITY BAR (Global Search, Notifications, Help, Property Selector, Profile) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (e.target.value.trim().length > 0 && currentTab === 'overview') {
                setCurrentTab('directory');
              }
            }}
            placeholder="Search staff, shifts, or tasks..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 text-slate-800 shadow-2xs transition-all"
          />
        </div>

        {/* Right Tools: Notifications, Help, Resort Selector, Manager Profile */}
        <div className="flex items-center justify-end gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors relative cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900">Staff Notifications</span>
                  <button 
                    onClick={() => { setNotificationsCount(0); setShowNotificationsDropdown(false); }}
                    className="text-[10px] text-teal-800 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-2 text-xs">
                  <div className="p-2 bg-rose-50 rounded-xl text-[11px] text-rose-900">
                    <strong>Leave Request:</strong> Sneha Patil applied for Marriage Leave (Aug 24-29).
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl text-[11px] text-amber-900">
                    <strong>Coverage Gap:</strong> Wednesday evening front desk needs 1 more associate.
                  </div>
                  <div className="p-2 bg-teal-50 rounded-xl text-[11px] text-teal-900">
                    <strong>Payroll Ready:</strong> August timesheets calculated for 15 staff.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative">
            <button
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer shadow-2xs"
              title="Help & Guides"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showHelpDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 text-xs animate-in fade-in duration-150">
                <h4 className="font-bold text-slate-900 mb-1">Staff Management Guide</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Use this console to track real-time attendance, schedule 24/7 shifts, handle leaves, award performance bonuses, and disburse bank payrolls.
                </p>
                <button
                  onClick={() => {
                    setCurrentTab('ai');
                    setShowHelpDropdown(false);
                  }}
                  className="mt-3 w-full py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold"
                >
                  Ask AI Staff Copilot →
                </button>
              </div>
            )}
          </div>

          {/* Resort Selector */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Building className="w-3.5 h-3.5 text-teal-800" />
            <span>{selectedProperty}</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" 
              alt="Anjali Rao" 
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Anjali Rao</p>
              <p className="text-[10px] text-slate-500 leading-tight">Resort Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Title, Subtitle, Actions) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
              15 Active Personnel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your resort team, shifts, attendance, and performance.
          </p>
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-staff-header"
            onClick={() => triggerToast("Staff roster & biometric attendance exported as CSV.")}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Staff</span>
          </button>

          <button
            id="btn-manage-shifts-header"
            onClick={() => setCurrentTab('shifts')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Shifts</span>
          </button>

          <button
            id="btn-add-staff-header"
            onClick={() => {
              setStaffToEdit(null);
              setIsAddStaffOpen(true);
            }}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-200" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS (To access all 26 feature requirements smoothly) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-0 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'directory', label: 'Staff Directory', count: staffList.length },
          { id: 'attendance', label: 'Attendance & Logs', icon: UserCheck },
          { id: 'shifts', label: 'Shift Planner & Coverage', icon: Calendar },
          { id: 'leave', label: 'Leave Management', count: leaveRequests.filter(l => l.status === 'Pending').length, alert: true },
          { id: 'performance', label: 'Performance & Awards', icon: Star },
          { id: 'payroll', label: 'Payroll (₹4.25L)', icon: CreditCard },
          { id: 'tasks', label: 'Cross-Dept Tasks', count: staffTasks.filter(t => t.status !== 'Completed').length },
          { id: 'ai', label: 'AI Staff Assistant', icon: Sparkles, highlight: true }
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                isActive
                  ? 'border-teal-800 text-teal-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-800' : tab.highlight ? 'text-amber-500' : 'text-slate-400'}`} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  tab.alert 
                    ? 'bg-rose-100 text-rose-700' 
                    : isActive 
                      ? 'bg-teal-100 text-teal-900' 
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      <div className="w-full">
        {currentTab === 'overview' && (
          <StaffOverview
            staffList={staffList}
            leaveRequests={leaveRequests}
            weeklyCoverage={weeklyCoverage}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            onOpenAddStaff={() => { setStaffToEdit(null); setIsAddStaffOpen(true); }}
            onOpenReleasePayroll={() => setIsPayrollModalOpen(true)}
            onOpenBulkAttendance={() => setIsBulkAttendanceOpen(true)}
            onOpenShiftPlanner={() => setCurrentTab('shifts')}
            onOpenLeaveDetails={(req) => { setSelectedLeaveRequest(req); setIsApplyLeaveOpen(true); }}
            onQuickPay={handleQuickPay}
            onViewAllStaff={() => setCurrentTab('directory')}
            onOpenAIScheduler={() => setIsAIScheduleOpen(true)}
            onResolveCoverageGap={handleResolveGap}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'directory' && (
          <StaffDirectoryTab
            staffList={staffList}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            onOpenAddStaff={() => { setStaffToEdit(null); setIsAddStaffOpen(true); }}
            onQuickPay={handleQuickPay}
            onOpenMarkAttendance={() => setIsBulkAttendanceOpen(true)}
            onOpenAssignShift={(staff) => setCurrentTab('shifts')}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'attendance' && (
          <StaffAttendanceTab
            staffList={staffList}
            onOpenBulkAttendance={() => setIsBulkAttendanceOpen(true)}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'shifts' && (
          <StaffShiftPlannerTab
            shiftPlans={shiftPlans}
            weeklyCoverage={weeklyCoverage}
            staffList={staffList}
            onOpenAIScheduler={() => setIsAIScheduleOpen(true)}
            onOpenCreateShift={() => triggerToast("Create Custom Shift Template dialog opened.")}
            onResolveGap={handleResolveGap}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'leave' && (
          <StaffLeaveTab
            leaveRequests={leaveRequests}
            staffList={staffList}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onOpenLeaveDetails={(req) => setSelectedLeaveRequest(req)}
            onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'performance' && (
          <StaffPerformanceTab
            staffList={staffList}
            aiInsights={aiInsights}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            onOpenRecognitionModal={(staff) => setRecognitionStaff(staff)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'payroll' && (
          <StaffPayrollTab
            staffList={staffList}
            onQuickPay={handleQuickPay}
            onOpenReleasePayroll={() => setIsPayrollModalOpen(true)}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'tasks' && (
          <StaffTasksTab
            tasks={staffTasks}
            staffList={staffList}
            onToggleTaskStatus={handleToggleTaskStatus}
            onAssignTask={handleAssignTask}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'ai' && (
          <StaffAIWorkspaceTab
            staffList={staffList}
            leaveRequests={leaveRequests}
            weeklyCoverage={weeklyCoverage}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            triggerToast={triggerToast}
          />
        )}
      </div>

      {/* 5. MODAL DIALOGS */}
      {/* Staff Profile Drawer / Modal */}
      <StaffProfileModal
        staff={selectedStaffProfile}
        onClose={() => setSelectedStaffProfile(null)}
        onQuickPay={handleQuickPay}
        onEditStaff={(staff) => {
          setSelectedStaffProfile(null);
          setStaffToEdit(staff);
          setIsAddStaffOpen(true);
        }}
        triggerToast={triggerToast}
      />

      {/* Add / Edit Staff Modal */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => { setIsAddStaffOpen(false); setStaffToEdit(null); }}
        onSaveStaff={handleSaveStaff}
        staffToEdit={staffToEdit}
      />

      {/* Review & Release Payroll Modal */}
      <ReviewPayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        staffList={staffList}
        onConfirmRelease={handleConfirmReleasePayroll}
        triggerToast={triggerToast}
      />

      {/* Mark Bulk Attendance Modal */}
      <MarkBulkAttendanceModal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        staffList={staffList}
        onSaveBulkAttendance={handleSaveBulkAttendance}
        triggerToast={triggerToast}
      />

      {/* AI Schedule Generator Modal */}
      <AIScheduleModal
        isOpen={isAIScheduleOpen}
        onClose={() => setIsAIScheduleOpen(false)}
        onApplySchedule={() => {
          // Fill gaps across weekly coverage
          setWeeklyCoverage(prev => prev.map(d => ({
            ...d,
            departments: Object.fromEntries(
              Object.entries(d.departments).map(([k, v]: [string, any]) => [
                k,
                { ...v, scheduled: v.required, hasGap: false, aiSuggestion: undefined }
              ])
            )
          })));
        }}
        triggerToast={triggerToast}
      />

      {/* Recognition Award Modal */}
      <RecognitionModal
        isOpen={!!recognitionStaff}
        onClose={() => setRecognitionStaff(null)}
        staff={recognitionStaff}
        triggerToast={triggerToast}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        staffList={staffList}
        onApplyLeave={(newLeave) => {
          const req: StaffLeaveRequest = {
            id: `leave-${Date.now()}`,
            staffId: newLeave.staffId || 'staff-1',
            staffName: newLeave.staffName || 'Staff',
            staffRole: newLeave.staffRole || 'Associate',
            department: newLeave.department || 'Front Desk',
            avatar: newLeave.avatar || 'ST',
            leaveType: newLeave.leaveType || 'Casual Leave',
            startDate: newLeave.startDate || 'Aug 27, 2024',
            endDate: newLeave.endDate || 'Aug 28, 2024',
            days: newLeave.days || 2,
            reason: newLeave.reason || 'Personal leave',
            status: 'Pending',
            appliedOn: 'Aug 24, 2024',
            coveragePlan: newLeave.coveragePlan,
            isUrgent: false
          };
          setLeaveRequests(prev => [req, ...prev]);
        }}
        triggerToast={triggerToast}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c4a45] text-white px-5 py-3 rounded-2xl shadow-xl border border-teal-600/40 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-teal-300 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
