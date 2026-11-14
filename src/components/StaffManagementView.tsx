import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  UserCheck,
  Building,
} from 'lucide-react';
import {
  StaffMember,
  StaffLeaveRequest,
  StaffCoverageDay,
  StaffShiftPlan,
  StaffTask,
  StaffAIInsightItem,
  AttendanceStatus,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { subscribeCollection, upsertCollectionDoc } from '../services/resortDataService';
import { formatShortDate, getTodayISO } from '../utils/bookingUtils';

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
  triggerToast: (msg: string) => void;
}

export default function StaffManagementView({
  initialTab = 'overview',
  triggerToast,
}: StaffManagementViewProps) {
  const { user, firestoreStatus } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Manager';

  const [currentTab, setCurrentTab] = useState<string>(initialTab);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [weeklyCoverage, setWeeklyCoverage] = useState<
    (StaffCoverageDay & { id?: string })[]
  >([]);
  const [shiftPlans, setShiftPlans] = useState<StaffShiftPlan[]>([]);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([]);
  const [aiInsights, setAiInsights] = useState<StaffAIInsightItem[]>([]);

  useEffect(() => {
    if (firestoreStatus === 'permission-denied') return;
    const unsubStaff = subscribeCollection<StaffMember>('staffMembers', setStaffList);
    const unsubLeave = subscribeCollection<StaffLeaveRequest>(
      'staffLeaveRequests',
      setLeaveRequests
    );
    const unsubCov = subscribeCollection<StaffCoverageDay & { id: string }>(
      'staffWeeklyCoverage',
      setWeeklyCoverage
    );
    const unsubShifts = subscribeCollection<StaffShiftPlan>(
      'staffShiftPlans',
      setShiftPlans
    );
    const unsubTasks = subscribeCollection<StaffTask>('staffTasks', setStaffTasks);
    const unsubAI = subscribeCollection<StaffAIInsightItem>(
      'staffAIInsights',
      setAiInsights
    );
    return () => {
      unsubStaff();
      unsubLeave();
      unsubCov();
      unsubShifts();
      unsubTasks();
      unsubAI();
    };
  }, [firestoreStatus]);

  const [selectedStaffProfile, setSelectedStaffProfile] = useState<StaffMember | null>(
    null
  );
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [isAIScheduleOpen, setIsAIScheduleOpen] = useState(false);
  const [recognitionStaff, setRecognitionStaff] = useState<StaffMember | null>(null);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);

  const filteredStaff = useMemo(() => {
    if (!globalSearch.trim()) return staffList;
    const q = globalSearch.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q)
    );
  }, [staffList, globalSearch]);

  const totalPayrollLakhs = useMemo(() => {
    const sum = staffList.reduce((acc, s) => acc + (s.netPay || 0), 0);
    return sum >= 100000
      ? `₹${(sum / 100000).toFixed(2)}L`
      : `₹${sum.toLocaleString('en-IN')}`;
  }, [staffList]);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending');
  const coverageGapCount = weeklyCoverage.reduce(
    (sum, d) =>
      sum + Object.values(d.departments || {}).filter((dep: any) => dep.hasGap).length,
    0
  );
  const notificationsCount = pendingLeaves.length + coverageGapCount;

  const handleQuickPay = async (staff: StaffMember) => {
    try {
      await upsertCollectionDoc('staffMembers', {
        ...staff,
        payrollStatus: 'Paid',
      });
      triggerToast(
        `Payroll marked Paid (₹${staff.netPay.toLocaleString('en-IN')}) for ${staff.name}.`
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update payroll status.'
      );
    }
  };

  const handleSaveStaff = async (staffData: Partial<StaffMember>) => {
    try {
      if (staffData.id) {
        const existing = staffList.find((s) => s.id === staffData.id);
        const merged = { ...existing, ...staffData } as StaffMember;
        await upsertCollectionDoc('staffMembers', merged);
        triggerToast(`Staff profile updated in Firestore for ${merged.name}.`);
      } else {
        const newStaff: StaffMember = {
          id: `staff-${Date.now()}`,
          employeeId: `MYK-${Date.now().toString().slice(-4)}`,
          name: staffData.name || 'New Staff',
          role: staffData.role || 'Front Desk Associate',
          department: staffData.department || 'Front Desk',
          status: 'On Duty',
          phone: staffData.phone || '+91 98200 00000',
          email: staffData.email || 'staff@mykonoscottage.in',
          todayShift: staffData.todayShift || '09:00 AM - 06:00 PM',
          baseSalary: staffData.baseSalary || 25000,
          netPay: staffData.netPay || staffData.baseSalary || 24200,
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
          joinDate: formatShortDate(getTodayISO()),
          avatar: staffData.avatar || 'NS',
          avatarBg: 'bg-teal-100 text-teal-800',
          leaveBalance: { casual: 5, sick: 7, annual: 10, emergency: 2 },
          skills: staffData.skills || ['Hospitality'],
          bankDetails: staffData.bankDetails || {
            bankName: 'HDFC Bank - Malvan',
            accountNumber: '•••• 8824',
            ifsc: 'HDFC0001824',
          },
        };
        await upsertCollectionDoc('staffMembers', newStaff);
        triggerToast(`Added ${newStaff.name} (${newStaff.role}) to Firestore roster.`);
      }
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save staff profile.'
      );
    }
  };

  const handleApproveLeave = async (id: string) => {
    const req = leaveRequests.find((l) => l.id === id);
    if (!req) return;
    try {
      await upsertCollectionDoc('staffLeaveRequests', { ...req, status: 'Approved' });
      triggerToast('Leave request approved in Firestore.');
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to approve leave request.'
      );
    }
  };

  const handleRejectLeave = async (id: string) => {
    const req = leaveRequests.find((l) => l.id === id);
    if (!req) return;
    try {
      await upsertCollectionDoc('staffLeaveRequests', { ...req, status: 'Rejected' });
      triggerToast('Leave request rejected.');
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to reject leave request.'
      );
    }
  };

  const handleSaveBulkAttendance = async (
    attendanceMap: Record<string, AttendanceStatus>
  ) => {
    try {
      await Promise.all(
        staffList.map(async (s) => {
          const status = attendanceMap[s.id];
          if (!status) return;
          const newStatus =
            status === 'Present' || status === 'Late'
              ? ('On Duty' as const)
              : status === 'On Leave'
                ? ('On Leave' as const)
                : ('Off Duty' as const);
          await upsertCollectionDoc('staffMembers', { ...s, status: newStatus });
        })
      );
      triggerToast('Staff attendance saved to Firestore.');
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update attendance.'
      );
    }
  };

  const handleResolveGap = async (day: string, dept: string) => {
    const targetDay = weeklyCoverage.find((d) => d.day === day);
    if (!targetDay) return;
    const deptData = targetDay.departments[dept];
    if (!deptData) return;

    const updatedDay = {
      ...targetDay,
      id: targetDay.id || day.toLowerCase(),
      departments: {
        ...targetDay.departments,
        [dept]: {
          ...deptData,
          scheduled: deptData.required,
          hasGap: false,
          staffNames: [...deptData.staffNames, `${operatorName} (Relief)`],
          aiSuggestion: undefined,
        },
      },
    };

    try {
      await upsertCollectionDoc('staffWeeklyCoverage', updatedDay);
      triggerToast(`Coverage gap on ${day} (${dept}) resolved in Firestore.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to resolve coverage gap.'
      );
    }
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const task = staffTasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextStatus =
      task.status === 'Pending'
        ? ('In Progress' as const)
        : task.status === 'In Progress'
          ? ('Completed' as const)
          : ('Pending' as const);
    try {
      await upsertCollectionDoc('staffTasks', { ...task, status: nextStatus });
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update task status.'
      );
    }
  };

  const handleAssignTask = async (newTask: Partial<StaffTask>) => {
    const task: StaffTask = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'Operational Task',
      department: newTask.department || 'Housekeeping',
      assignedToName: newTask.assignedToName || 'Staff Member',
      assignedToId: newTask.assignedToId || staffList[0]?.id || 'staff-1',
      assignedToAvatar: newTask.assignedToAvatar || 'ST',
      location: newTask.location || 'Mykonos Cottage',
      priority: newTask.priority || 'Normal',
      status: 'Pending',
      dueTime: 'Today 05:00 PM',
    };
    try {
      await upsertCollectionDoc('staffTasks', task);
      triggerToast(`Task "${task.title}" assigned to ${task.assignedToName}.`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Failed to assign task.');
    }
  };

  const handleConfirmReleasePayroll = async () => {
    try {
      await Promise.all(
        staffList.map((s) =>
          upsertCollectionDoc('staffMembers', { ...s, payrollStatus: 'Paid' as const })
        )
      );
      triggerToast(`Payroll marked Paid for all ${staffList.length} staff members.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to release batch payroll.'
      );
    }
  };

  const handleExportStaffCSV = () => {
    const header = [
      'Employee ID',
      'Name',
      'Role',
      'Department',
      'Status',
      'Shift',
      'Phone',
      'Net Pay (INR)',
      'Payroll Status',
    ];
    const rows = staffList.map((s) => [
      s.employeeId,
      s.name,
      s.role,
      s.department,
      s.status,
      s.todayShift,
      s.phone,
      String(s.netPay),
      s.payrollStatus,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykonos-staff-${getTodayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${staffList.length} staff records to CSV.`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full font-sans text-slate-800 overflow-x-hidden">
      {/* 1. TOP UTILITY BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
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
            placeholder="Search staff, shifts, or departments..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700/20 text-slate-800 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors relative cursor-pointer shadow-2xs"
              title="Staff Alerts"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-40">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900">
                    Staff Alerts ({notificationsCount})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotificationsDropdown(false)}
                    className="text-[10px] text-teal-800 hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-2 text-xs">
                  {pendingLeaves.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setCurrentTab('leave');
                        setShowNotificationsDropdown(false);
                      }}
                      className="p-2 bg-rose-50 rounded-xl text-[11px] text-rose-900 cursor-pointer hover:bg-rose-100"
                    >
                      <strong>Leave Request:</strong> {l.staffName} ({l.startDate} –{' '}
                      {l.endDate})
                    </div>
                  ))}
                  {coverageGapCount > 0 && (
                    <div
                      onClick={() => {
                        setCurrentTab('shifts');
                        setShowNotificationsDropdown(false);
                      }}
                      className="p-2 bg-amber-50 rounded-xl text-[11px] text-amber-900 cursor-pointer hover:bg-amber-100"
                    >
                      <strong>Shift Coverage:</strong> {coverageGapCount} shift gap(s) flagged
                      in planner.
                    </div>
                  )}
                  {notificationsCount === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-2 text-center">
                      No pending leave requests or shift gaps.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer shadow-2xs"
              title="Staff Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showHelpDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 text-xs">
                <h4 className="font-bold text-slate-900 mb-1">Staff Management Guide</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Track attendance, assign cottage teams, manage leave approvals, and mark
                  monthly payroll disbursements in Firestore.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('ai');
                    setShowHelpDropdown(false);
                  }}
                  className="mt-3 w-full py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Open Staff Copilot →
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Building className="w-3.5 h-3.5 text-teal-800" />
            <span>Mykonos Cottage, Tarkarli</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-teal-900 text-white text-xs font-bold flex items-center justify-center">
              {operatorName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                {operatorName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">Resort Ops</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Staff Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
              {staffList.length} Personnel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your Mykonos Cottage team, shifts, attendance, and payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-staff-header"
            type="button"
            onClick={handleExportStaffCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Staff</span>
          </button>

          <button
            id="btn-manage-shifts-header"
            type="button"
            onClick={() => setCurrentTab('shifts')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Shifts</span>
          </button>

          <button
            id="btn-add-staff-header"
            type="button"
            onClick={() => {
              setStaffToEdit(null);
              setIsAddStaffOpen(true);
            }}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-200" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-0 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'directory', label: 'Staff Directory', count: filteredStaff.length },
          { id: 'attendance', label: 'Attendance & Logs', icon: UserCheck },
          { id: 'shifts', label: 'Shift Planner & Coverage', icon: Calendar },
          {
            id: 'leave',
            label: 'Leave Management',
            count: pendingLeaves.length,
            alert: true,
          },
          { id: 'performance', label: 'Performance & Awards', icon: Star },
          { id: 'payroll', label: `Payroll (${totalPayrollLakhs})`, icon: CreditCard },
          {
            id: 'tasks',
            label: 'Cross-Dept Tasks',
            count: staffTasks.filter((t) => t.status !== 'Completed').length,
          },
          { id: 'ai', label: 'Staff Assistant', icon: Sparkles, highlight: true },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-t-xl ${
                isActive
                  ? 'border-teal-800 text-teal-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? 'text-teal-800'
                      : tab.highlight
                        ? 'text-amber-500'
                        : 'text-slate-400'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    tab.alert
                      ? 'bg-rose-100 text-rose-700'
                      : isActive
                        ? 'bg-teal-100 text-teal-900'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      <div className="w-full min-w-0">
        {currentTab === 'overview' && (
          <StaffOverview
            staffList={filteredStaff}
            leaveRequests={leaveRequests}
            weeklyCoverage={weeklyCoverage}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            onOpenAddStaff={() => {
              setStaffToEdit(null);
              setIsAddStaffOpen(true);
            }}
            onOpenReleasePayroll={() => setIsPayrollModalOpen(true)}
            onOpenBulkAttendance={() => setIsBulkAttendanceOpen(true)}
            onOpenShiftPlanner={() => setCurrentTab('shifts')}
            onOpenLeaveDetails={() => setCurrentTab('leave')}
            onQuickPay={(s) => void handleQuickPay(s)}
            onViewAllStaff={() => setCurrentTab('directory')}
            onOpenAIScheduler={() => setIsAIScheduleOpen(true)}
            onResolveCoverageGap={(d, dept) => void handleResolveGap(d, dept)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'directory' && (
          <StaffDirectoryTab
            staffList={filteredStaff}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            onOpenAddStaff={() => {
              setStaffToEdit(null);
              setIsAddStaffOpen(true);
            }}
            onQuickPay={(s) => void handleQuickPay(s)}
            onOpenMarkAttendance={() => setIsBulkAttendanceOpen(true)}
            onOpenAssignShift={() => setCurrentTab('shifts')}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'attendance' && (
          <StaffAttendanceTab
            staffList={filteredStaff}
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
            onOpenCreateShift={() => setIsAIScheduleOpen(true)}
            onResolveGap={(d, dept) => void handleResolveGap(d, dept)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'leave' && (
          <StaffLeaveTab
            leaveRequests={leaveRequests}
            staffList={staffList}
            onApproveLeave={(id) => void handleApproveLeave(id)}
            onRejectLeave={(id) => void handleRejectLeave(id)}
            onOpenLeaveDetails={() => {}}
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
            onQuickPay={(s) => void handleQuickPay(s)}
            onOpenReleasePayroll={() => setIsPayrollModalOpen(true)}
            onSelectStaff={(staff) => setSelectedStaffProfile(staff)}
            triggerToast={triggerToast}
          />
        )}

        {currentTab === 'tasks' && (
          <StaffTasksTab
            tasks={staffTasks}
            staffList={staffList}
            onToggleTaskStatus={(id) => void handleToggleTaskStatus(id)}
            onAssignTask={(t) => void handleAssignTask(t)}
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

      {/* 5. MODALS */}
      <StaffProfileModal
        staff={selectedStaffProfile}
        onClose={() => setSelectedStaffProfile(null)}
        onQuickPay={(s) => void handleQuickPay(s)}
        onEditStaff={(staff) => {
          setSelectedStaffProfile(null);
          setStaffToEdit(staff);
          setIsAddStaffOpen(true);
        }}
        triggerToast={triggerToast}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => {
          setIsAddStaffOpen(false);
          setStaffToEdit(null);
        }}
        onSaveStaff={(data) => void handleSaveStaff(data)}
        staffToEdit={staffToEdit}
      />

      <ReviewPayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        staffList={staffList}
        onConfirmRelease={() => void handleConfirmReleasePayroll()}
        triggerToast={triggerToast}
      />

      <MarkBulkAttendanceModal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        staffList={staffList}
        onSaveBulkAttendance={(map) => void handleSaveBulkAttendance(map)}
        triggerToast={triggerToast}
      />

      <AIScheduleModal
        isOpen={isAIScheduleOpen}
        onClose={() => setIsAIScheduleOpen(false)}
        onApplySchedule={() => {
          void Promise.all(
            weeklyCoverage.map((d) =>
              upsertCollectionDoc('staffWeeklyCoverage', {
                ...d,
                id: d.id || d.day.toLowerCase(),
                departments: Object.fromEntries(
                  Object.entries(d.departments).map(([k, v]: [string, any]) => [
                    k,
                    {
                      ...v,
                      scheduled: v.required,
                      hasGap: false,
                      aiSuggestion: undefined,
                    },
                  ])
                ),
              })
            )
          ).then(() =>
            triggerToast('Weekly coverage schedule balanced & saved to Firestore.')
          );
        }}
        triggerToast={triggerToast}
      />

      <RecognitionModal
        isOpen={!!recognitionStaff}
        onClose={() => setRecognitionStaff(null)}
        staff={recognitionStaff}
        triggerToast={triggerToast}
      />

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        staffList={staffList}
        onApplyLeave={(newLeave) => {
          const req: StaffLeaveRequest = {
            id: `leave-${Date.now()}`,
            staffId: newLeave.staffId || staffList[0]?.id || 'staff-1',
            staffName: newLeave.staffName || 'Staff',
            staffRole: newLeave.staffRole || 'Associate',
            department: newLeave.department || 'Front Desk',
            avatar: newLeave.avatar || 'ST',
            leaveType: newLeave.leaveType || 'Casual Leave',
            startDate: newLeave.startDate || getTodayISO(),
            endDate: newLeave.endDate || getTodayISO(),
            days: newLeave.days || 1,
            reason: newLeave.reason || 'Personal leave',
            status: 'Pending',
            appliedOn: formatShortDate(getTodayISO()),
            coveragePlan: newLeave.coveragePlan,
            isUrgent: false,
          };
          void upsertCollectionDoc('staffLeaveRequests', req).then(() =>
            triggerToast(`Leave request logged for ${req.staffName}.`)
          );
        }}
        triggerToast={triggerToast}
      />
    </div>
  );
}
