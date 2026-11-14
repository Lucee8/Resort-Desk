import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  HelpCircle,
  Bell,
  Brush,
  CheckCircle2,
  Users,
  Clock,
  AlertTriangle,
  Check,
  X,
  Plus,
  Camera,
  Eye,
  Download,
  Sparkles,
  UserCheck,
  Upload,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { HousekeepingTask, RoomUnit, StaffMember } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  batchUpdateHousekeepingTasks,
  uploadHousekeepingPhoto,
} from '../services/resortDataService';

interface HousekeepingViewProps {
  tasks: HousekeepingTask[];
  rooms?: RoomUnit[];
  staffMembers?: StaffMember[];
  openMaintenanceCount?: number;
  onSaveTask: (updated: HousekeepingTask) => Promise<void>;
  onNavigateMaintenance?: () => void;
  triggerToast: (msg: string) => void;
  initialFilter?: 'All' | 'Urgent' | 'Unassigned' | 'Assigned';
  navigationKey?: number;
}

export default function HousekeepingView({
  tasks,
  rooms = [],
  staffMembers = [],
  openMaintenanceCount = 0,
  onSaveTask,
  onNavigateMaintenance,
  triggerToast,
  initialFilter,
  navigationKey,
}: HousekeepingViewProps) {
  const { user } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Staff';
  const operatorRole = user?.email ? 'FRONT DESK / OPS' : 'RESORT OPS';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(tasks[0]?.id || '');
  const [filterType, setFilterType] = useState<'All' | 'Urgent' | 'Unassigned' | 'Assigned'>(
    initialFilter || 'All'
  );

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [newRoomNo, setNewRoomNo] = useState('');
  const [newRoomType, setNewRoomType] = useState(
    rooms[0]?.categoryName || 'Deluxe Sea Facing'
  );
  const [newPriority, setNewPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (navigationKey === undefined) return;
    setFilterType(initialFilter || 'All');
    setSearchQuery('');
  }, [navigationKey, initialFilter]);

  // Keep selectedRoomId valid when tasks load asynchronously from Firestore
  useEffect(() => {
    if (tasks.length > 0 && !tasks.some((t) => t.id === selectedRoomId)) {
      setSelectedRoomId(tasks[0].id);
    }
  }, [tasks, selectedRoomId]);

  // Derive active housekeeping staff from Firestore staffMembers + live task assignments
  const hkStaff = useMemo(() => {
    const candidates = staffMembers.filter(
      (s) =>
        s.department === 'Housekeeping' ||
        s.role.toLowerCase().includes('housekeep') ||
        s.role.toLowerCase().includes('steward')
    );
    const pool = candidates.length > 0 ? candidates : staffMembers;

    return pool.map((member) => {
      const activeTask = tasks.find(
        (t) =>
          t.assignedTo &&
          t.assignedTo.toLowerCase() === member.name.toLowerCase() &&
          t.status !== 'Verified'
      );
      const completedCount = tasks.filter(
        (t) =>
          t.assignedTo &&
          t.assignedTo.toLowerCase() === member.name.toLowerCase() &&
          (t.status === 'Cleaned' || t.status === 'Verified')
      ).length;

      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        activeRoom: activeTask?.roomNumber,
        status: activeTask
          ? activeTask.status === 'Cleaned'
            ? 'Verification'
            : 'In Progress'
          : member.status === 'On Duty'
            ? 'Idle'
            : member.status,
        completedCount,
        rating: member.guestRating || 4.8,
      };
    });
  }, [staffMembers, tasks]);

  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedRoomId) || tasks[0];
  }, [tasks, selectedRoomId]);

  const stats = useMemo(() => {
    const toClean = tasks.filter((t) => t.status !== 'Verified').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const verifiedReady = tasks.filter((t) => t.status === 'Verified').length;
    const urgentCount = tasks.filter(
      (t) => t.priority === 'Urgent' && t.status !== 'Verified'
    ).length;
    return { toClean, inProgress, verifiedReady, urgentCount };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.roomNumber.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    if (filterType === 'Urgent') {
      result = result.filter((t) => t.priority === 'Urgent');
    } else if (filterType === 'Unassigned') {
      result = result.filter((t) => !t.assignedTo);
    } else if (filterType === 'Assigned') {
      result = result.filter((t) => !!t.assignedTo);
    }

    return result;
  }, [tasks, searchQuery, filterType]);

  const columns = [
    {
      id: 'Pending',
      label: 'DIRTY / PENDING',
      bg: 'border-amber-200 bg-amber-50/40 text-amber-800',
    },
    {
      id: 'In Progress',
      label: 'CLEANING',
      bg: 'border-teal-200 bg-teal-50/40 text-teal-800',
    },
    {
      id: 'Cleaned',
      label: 'VERIFICATION',
      bg: 'border-purple-200 bg-purple-50/40 text-purple-800',
    },
  ];

  const persistTask = async (updated: HousekeepingTask, successMsg?: string) => {
    setIsSaving(true);
    try {
      await onSaveTask(updated);
      if (successMsg) triggerToast(successMsg);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to save housekeeping update to Firestore.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChecklist = async (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let photoVerified = task.photoVerified;
    const updatedChecklist = task.checklist.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.checked;
        if (item.name.toLowerCase().includes('photo')) {
          photoVerified = nextState && Boolean(task.photoUrl);
        }
        return { ...item, checked: nextState };
      }
      return item;
    });

    let nextStatus = task.status;
    let completionTime = task.completionTime;
    const allChecked = updatedChecklist.every((item) => item.checked);
    let toastMsg: string | undefined;

    if (allChecked && task.status === 'In Progress') {
      nextStatus = 'Cleaned';
      completionTime = completionTime && completionTime !== 'Not Started' ? completionTime : '28 mins';
      toastMsg = `${task.roomNumber} checklist complete — moved to Manager Verification.`;
    } else if (!allChecked && task.status === 'Cleaned') {
      nextStatus = 'In Progress';
    }

    await persistTask(
      {
        ...task,
        checklist: updatedChecklist,
        photoVerified,
        status: nextStatus,
        completionTime,
      },
      toastMsg
    );
  };

  const handleAssignStaff = async (taskId: string, staffName: string) => {
    const staff = hkStaff.find((s) => s.name === staffName);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated: HousekeepingTask = {
      ...task,
      assignedTo: staffName,
      assignedAvatar: staff?.avatar,
      status: task.status === 'Pending' ? 'In Progress' : task.status,
      completionTime: task.status === 'Pending' ? 'In Progress' : task.completionTime,
    };

    await persistTask(updated, `${staffName} assigned to ${task.roomNumber}`);
  };

  const handleAssignAll = async () => {
    const unassigned = tasks.filter((t) => !t.assignedTo && t.status !== 'Verified');
    if (unassigned.length === 0) {
      triggerToast('All active housekeeping rooms are already assigned.');
      return;
    }
    if (hkStaff.length === 0) {
      triggerToast('No housekeeping staff found in Staff directory. Add staff first.');
      return;
    }

    const idlePool = hkStaff.filter((s) => s.status === 'Idle' || !s.activeRoom);
    const staffPool = idlePool.length > 0 ? idlePool : hkStaff;

    const updatedBatch: HousekeepingTask[] = unassigned.map((task, idx) => {
      const staff = staffPool[idx % staffPool.length];
      return {
        ...task,
        assignedTo: staff.name,
        assignedAvatar: staff.avatar,
        status: task.status === 'Pending' ? 'In Progress' : task.status,
        completionTime: task.status === 'Pending' ? 'Assigned' : task.completionTime,
      };
    });

    setIsSaving(true);
    try {
      await batchUpdateHousekeepingTasks(updatedBatch);
      triggerToast(`Assigned ${updatedBatch.length} rooms to housekeeping staff in Firestore.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to batch assign rooms.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveVerification = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const verifiedChecklist = task.checklist.map((item) => ({ ...item, checked: true }));
    await persistTask(
      {
        ...task,
        status: 'Verified',
        checklist: verifiedChecklist,
        photoVerified: Boolean(task.photoUrl) || task.photoVerified,
        completionTime:
          task.completionTime && task.completionTime !== 'Not Started'
            ? task.completionTime
            : 'Verified',
      },
      `Inspection approved: ${task.roomNumber} marked Verified & Available.`
    );
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;
    if (!file.type.startsWith('image/')) {
      triggerToast('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const downloadUrl = await uploadHousekeepingPhoto(selectedTask.id, file);
      const updatedChecklist = selectedTask.checklist.map((item) =>
        item.name.toLowerCase().includes('photo') ||
        item.name.toLowerCase().includes('verification')
          ? { ...item, checked: true }
          : item
      );
      await onSaveTask({
        ...selectedTask,
        photoVerified: true,
        photoUrl: downloadUrl,
        checklist: updatedChecklist,
      });
      triggerToast(`Verification photo uploaded to Firebase Storage for ${selectedTask.roomNumber}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error
          ? err.message
          : 'Photo upload failed. Ensure you are signed in and Firebase Storage rules permit uploads.'
      );
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNo.trim()) return;

    const formattedRoom = newRoomNo.toLowerCase().includes('room') ||
      newRoomNo.toLowerCase().includes('villa') ||
      newRoomNo.toLowerCase().includes('suite') ||
      newRoomNo.toLowerCase().includes('cottage')
      ? newRoomNo.trim()
      : `Cottage ${newRoomNo.trim()}`;

    if (
      tasks.some(
        (t) =>
          t.roomNumber.toLowerCase() === formattedRoom.toLowerCase() &&
          t.status !== 'Verified'
      )
    ) {
      triggerToast(`Active housekeeping job for ${formattedRoom} already exists.`);
      return;
    }

    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomNumber: formattedRoom,
      type: newRoomType,
      status: 'Pending',
      priority: newPriority,
      assignedTo: undefined,
      assignedAvatar: undefined,
      photoVerified: false,
      completionTime: 'Not Started',
      checklist: [
        { id: 't1', name: 'Strip Bedding & Linen', checked: false },
        { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: false },
        { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
        { id: 't4', name: 'Dusting & Surface Polish', checked: false },
        { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
        { id: 't6', name: 'Quality Photo Verification', checked: false },
      ],
    };

    await persistTask(newTask, `Cleaning job created for ${formattedRoom}`);
    setSelectedRoomId(newTask.id);
    setShowNewTaskModal(false);
    setNewRoomNo('');
  };

  const handleExportRoomReport = (task: HousekeepingTask) => {
    const rows = [
      ['Property', 'Mykonos Cottage, Tarkarli'],
      ['Room / Cottage', task.roomNumber],
      ['Category', task.type],
      ['Status', task.status],
      ['Priority', task.priority],
      ['Assigned Staff', task.assignedTo || 'Unassigned'],
      ['Photo Verified', task.photoVerified ? 'Yes' : 'No'],
      ['Completion Log', task.completionTime || 'Not Started'],
      [''],
      ['Checklist Item', 'Completed'],
      ...task.checklist.map((item) => [item.name, item.checked ? 'Done' : 'Pending']),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `housekeeping-${task.roomNumber.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Exported CSV inspection log for ${task.roomNumber}.`);
  };

  const getCompletedChecklistCount = (task: HousekeepingTask) =>
    task.checklist.filter((item) => item.checked).length;

  return (
    <div
      id="housekeeping-module-container"
      className="flex flex-col w-full bg-[#f8fafc] text-slate-800 font-sans rounded-3xl border border-slate-200/80 overflow-x-hidden shadow-xs"
    >
      {/* 1. TOP HEADER */}
      <header
        id="housekeeping-dashboard-header"
        className="bg-white border-b border-slate-200/80 px-5 sm:px-8 py-4 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <Brush className="w-5 h-5 text-teal-800" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Housekeeping Dashboard
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">
            Mykonos Cottage, Tarkarli • Live Firestore Turnover
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cottages or staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowGuidelinesModal(true)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Housekeeping SOPs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterType('Urgent');
              triggerToast(
                stats.urgentCount > 0
                  ? `${stats.urgentCount} urgent turnover room(s) filtered below.`
                  : 'No urgent housekeeping turnovers pending.'
              );
            }}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 relative transition-colors cursor-pointer"
            title="Filter Urgent Rooms"
          >
            <Bell className="w-4 h-4" />
            {stats.urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="text-right">
              <p className="font-extrabold text-xs text-slate-800 leading-none truncate max-w-[140px]">
                {operatorName}
              </p>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                {operatorRole}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-xs">
              {operatorName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC STATS CARD ROW */}
      <div
        id="hk-stats-banner"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 sm:px-8 pt-6 pb-2 shrink-0"
      >
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Brush className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Rooms to Clean
            </p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
              {String(stats.toClean).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              In Progress
            </p>
            <p className="text-xl font-extrabold text-teal-950 leading-tight mt-0.5">
              {String(stats.inProgress).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Verified Ready
            </p>
            <p className="text-xl font-extrabold text-emerald-950 leading-tight mt-0.5">
              {String(stats.verifiedReady).padStart(2, '0')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateMaintenance?.()}
          className="bg-white border border-slate-200/70 hover:border-rose-300 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Maint. Issues
              </p>
              <p className="text-xl font-extrabold text-rose-950 leading-tight mt-0.5">
                {String(openMaintenanceCount).padStart(2, '0')}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 shrink-0" />
        </button>
      </div>

      {/* 3. BOARD & INSPECTION ROW */}
      <div className="flex-1 flex flex-col xl:flex-row p-5 sm:p-8 gap-6 min-w-0">
        {/* LEFT MAIN BOARD */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                Cleaning Board
              </h2>
              <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded-md text-slate-500">
                {isSaving ? 'Syncing...' : `${tasks.length} Tasks`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl overflow-x-auto">
                {(['All', 'Urgent', 'Unassigned', 'Assigned'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 sm:px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      filterType === type
                        ? 'bg-white text-teal-900 shadow-xs'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleAssignAll()}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Automatically assign idle staff to dirty rooms"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Assign All</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNewTaskModal(true)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                title="Log New Room Cleaning Job"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* THREE KANBAN COLUMNS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="flex flex-col bg-slate-50/50 border border-slate-200/70 rounded-2xl p-3 min-h-[280px]"
                >
                  <div
                    className={`px-2.5 py-1.5 rounded-xl border font-extrabold text-[10px] tracking-wider mb-3 flex items-center justify-between ${col.bg}`}
                  >
                    <span>{col.label}</span>
                    <span className="font-bold opacity-80">
                      {String(colTasks.length).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[540px] pr-0.5">
                    {colTasks.map((task) => {
                      const isSelected = selectedRoomId === task.id;
                      const completedCount = getCompletedChecklistCount(task);
                      const totalCount = task.checklist.length;
                      const progressPct =
                        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedRoomId(task.id)}
                          className={`w-full text-left bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'border-teal-700/80 ring-1 ring-teal-700/80'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-extrabold text-xs text-slate-800">
                              {task.roomNumber}
                            </span>

                            {task.priority === 'Urgent' && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[8px] font-extrabold rounded-md uppercase tracking-wide">
                                Urgent
                              </span>
                            )}
                            {task.priority === 'High' && (
                              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-[8px] font-bold rounded-md uppercase tracking-wide">
                                High Priority
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400 font-medium mb-3">
                            {task.type}
                          </p>

                          {task.status !== 'Pending' ? (
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                <span>PROGRESS</span>
                                <span className="text-slate-600">
                                  {completedCount}/{totalCount} TASKS
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-teal-700 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="h-[23px] mb-3" />
                          )}

                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {task.assignedTo ? (
                                <>
                                  {task.assignedAvatar ? (
                                    <img
                                      src={task.assignedAvatar}
                                      alt={task.assignedTo}
                                      className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-900 font-bold text-[9px] flex items-center justify-center shrink-0">
                                      {task.assignedTo.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-[10px] text-slate-600 font-bold truncate">
                                    {task.assignedTo}
                                  </span>
                                </>
                              ) : (
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      void handleAssignStaff(task.id, e.target.value);
                                    }
                                  }}
                                  defaultValue=""
                                  className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-md py-0.5 px-1.5 focus:outline-none focus:border-teal-700 max-w-[130px]"
                                >
                                  <option value="" disabled>
                                    Assign Staff...
                                  </option>
                                  {hkStaff.map((s) => (
                                    <option key={s.id} value={s.name}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {task.status === 'In Progress' && (
                                <div
                                  className="flex items-center gap-1 text-[9px] font-bold text-teal-700"
                                  title="Active clean status"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {task.completionTime?.replace(' elapsed', '') || 'Active'}
                                  </span>
                                </div>
                              )}

                              {task.status === 'Cleaned' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleApproveVerification(task.id);
                                  }}
                                  className="px-2 py-1 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-[9px] rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}

                              {task.photoVerified && (
                                <span
                                  className="p-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md"
                                  title="Photo verification received"
                                >
                                  <Camera className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className="p-6 text-center text-[11px] text-slate-400 italic">
                        No cottages in this status.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
          {/* ACTIVE HOUSEKEEPING STAFF */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Active Staff</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(true)}
                className="text-[10px] font-extrabold text-teal-800 hover:text-teal-950 cursor-pointer"
              >
                View Metrics
              </button>
            </div>

            {hkStaff.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No housekeeping staff records loaded from Firestore yet.
              </p>
            ) : (
              <div className="space-y-3">
                {hkStaff.slice(0, 4).map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-800 leading-tight truncate">
                          {staff.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold truncate">
                          {staff.activeRoom ? staff.activeRoom : staff.status}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        staff.status === 'In Progress'
                          ? 'bg-teal-600'
                          : staff.status === 'Verification'
                            ? 'bg-purple-500'
                            : 'bg-slate-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSPECTING SELECTED ROOM CHECKLIST */}
          {selectedTask ? (
            <div
              id="inspecting-checklist-card"
              className="bg-emerald-950 text-emerald-100 border border-emerald-900 rounded-3xl p-5 shadow-md flex-1 flex flex-col justify-between min-h-[380px]"
            >
              <div>
                <div className="pb-3.5 border-b border-emerald-900 mb-4">
                  <p className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400">
                    Inspecting Cottage
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <h3 className="text-base font-extrabold text-white truncate">
                      {selectedTask.roomNumber}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 border border-emerald-800 text-[9px] font-bold rounded-md shrink-0">
                      {selectedTask.type}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-emerald-300 uppercase font-extrabold tracking-wider mb-3">
                  Cleaning Checklist
                </p>

                <div className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => void handleToggleChecklist(selectedTask.id, item.id)}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-emerald-900/30 p-1.5 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                          item.checked
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-emerald-700 group-hover:border-emerald-500'
                        }`}
                      >
                        {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <span
                        className={`text-xs ${
                          item.checked
                            ? 'line-through text-emerald-400'
                            : 'text-emerald-100 font-medium'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* PHOTO VERIFICATION (Real Firebase Storage Upload) */}
                <div className="mt-5 pt-4 border-t border-emerald-900 space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-emerald-300 uppercase font-bold tracking-wider">
                    <span>Photo Verification</span>
                    {selectedTask.photoVerified && selectedTask.photoUrl ? (
                      <span className="text-teal-400 font-extrabold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Uploaded</span>
                      </span>
                    ) : (
                      <span className="text-orange-400 font-bold">Awaiting photo</span>
                    )}
                  </div>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handlePhotoFileChange(e)}
                    className="hidden"
                  />

                  {selectedTask.photoUrl ? (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-emerald-900/50 group h-24">
                        <img
                          src={selectedTask.photoUrl}
                          alt={`Verification for ${selectedTask.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setShowPhotoModal(true)}
                            className="p-1.5 bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 border border-white/20 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Fullscreen</span>
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full py-1.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-[10px] font-bold text-emerald-200 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Replace Verification Photo'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full py-3 bg-emerald-900/30 hover:bg-emerald-900/50 disabled:opacity-60 border border-dashed border-emerald-800 rounded-xl text-emerald-300 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="font-bold">
                        {isUploadingPhoto ? 'Uploading to Storage...' : 'Upload Verification Photo'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="mt-4 text-[10px] text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold">Log / Status:</span>
                  <span className="text-white font-extrabold">
                    {selectedTask.completionTime || 'Not Started'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-900 space-y-2">
                <button
                  type="button"
                  onClick={() => void handleApproveVerification(selectedTask.id)}
                  disabled={selectedTask.status === 'Verified' || isSaving}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTask.status === 'Verified'
                      ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-800/40 cursor-not-allowed'
                      : 'bg-white text-emerald-950 hover:bg-teal-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {selectedTask.status === 'Verified'
                      ? 'Room Verified Ready ✓'
                      : 'Mark as Verified'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportRoomReport(selectedTask)}
                  className="w-full py-1.5 bg-emerald-900/20 hover:bg-emerald-900/30 text-[10px] font-bold text-emerald-300 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Inspection CSV</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950 text-emerald-300 border border-emerald-900 rounded-3xl p-6 shadow-xs text-center py-12">
              <Brush className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs">Select a cottage from the board to inspect its checklist.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL A: STAFF PERFORMANCE METRICS (Derived live from Firestore staff & tasks) */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-800" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Housekeeping Team Metrics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 font-medium">
                Live assignment and completion metrics calculated from active Firestore tasks.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {hkStaff.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No housekeeping staff members recorded yet.
                  </p>
                ) : (
                  hkStaff.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.role}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span>{s.completedCount} Verified</span>
                        <span className="font-bold text-amber-500">{s.rating}★</span>
                        <span className="font-semibold text-teal-800 text-[11px]">
                          {s.activeRoom || s.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer"
                >
                  Close Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: CREATE NEW CUSTOM CLEANING REQUEST */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">
                New Cleaning Request
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateNewTask(e)} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Cottage / Room
                </label>
                {rooms.length > 0 ? (
                  <select
                    value={newRoomNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRoomNo(val);
                      const found = rooms.find(
                        (r) =>
                          r.roomName === val ||
                          `Cottage ${r.roomNumber}` === val ||
                          r.roomNumber === val
                      );
                      if (found) setNewRoomType(found.categoryName);
                    }}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="">Choose a cottage...</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={`${r.roomName} (#${r.roomNumber})`}>
                        {r.roomName} (#{r.roomNumber}) — {r.status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. 101, Villa 201"
                    value={newRoomNo}
                    onChange={(e) => setNewRoomNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-700"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Room Type / Category
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                >
                  <option value="Deluxe Sea Facing">Deluxe Sea Facing</option>
                  <option value="Beachfront King">Beachfront King</option>
                  <option value="Private Pool Villa">Private Pool Villa</option>
                  <option value="Heritage Family Suite">Heritage Family Suite</option>
                  <option value="Garden Cocoon Suite">Garden Cocoon Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="newPriority"
                        checked={newPriority === p}
                        onChange={() => setNewPriority(p)}
                        className="text-teal-800 focus:ring-teal-700"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 font-bold">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL C: FULLSCREEN PHOTO PREVIEW */}
      {showPhotoModal && selectedTask?.photoUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Verification Photo — {selectedTask.roomNumber}
                </h3>
                <p className="text-[11px] text-slate-500">{selectedTask.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedTask.photoUrl}
                alt={`Inspection proof for ${selectedTask.roomNumber}`}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL D: HOUSEKEEPING SOP GUIDELINES */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                Mykonos Cottage Turnover SOP
              </h3>
              <button
                type="button"
                onClick={() => setShowGuidelinesModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
              <li>Assign checkout cottages immediately using the dropdown or Assign All.</li>
              <li>Complete all 6 checklist items; status automatically moves to Verification.</li>
              <li>Upload a real room photo to Firebase Storage before manager sign-off.</li>
              <li>Marking a room Verified syncs its cottage status to Available in Rooms &amp; Bookings.</li>
            </ul>
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuidelinesModal(false)}
                className="px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
