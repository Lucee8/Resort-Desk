import React, { useState, useMemo } from 'react';
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
  FileText, 
  Filter, 
  Sparkles,
  Compass, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { HousekeepingTask, HousekeepingChecklistItem } from '../types';

interface HousekeepingViewProps {
  tasks: HousekeepingTask[];
  onUpdateTasks: (updated: HousekeepingTask[]) => void;
  triggerToast: (msg: string) => void;
}

export default function HousekeepingView({
  tasks,
  onUpdateTasks,
  triggerToast
}: HousekeepingViewProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected task for checklist/inspection sidebar - default to Room 301 (Premium Suite)
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    tasks.find(t => t.roomNumber === 'Room 301')?.id || tasks[0]?.id || ''
  );

  // Filter state ('All', 'Urgent', 'Unassigned', 'Assigned')
  const [filterType, setFilterType] = useState<'All' | 'Urgent' | 'Unassigned' | 'Assigned'>('All');

  // Staff Modal state
  const [showStaffModal, setShowStaffModal] = useState(false);

  // New task dialog state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newRoomNo, setNewRoomNo] = useState('');
  const [newRoomType, setNewRoomType] = useState('Deluxe Sea View');
  const [newPriority, setNewPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // Staff registry
  const staffMembers = [
    { name: 'Rohan K.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', activeRoom: 'Room 102', status: 'In Progress' },
    { name: 'Meena S.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', activeRoom: 'Room 301', status: 'In Progress' },
    { name: 'Arjun V.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', activeRoom: 'Room 205', status: 'Verification' },
    { name: 'Sunita Bai', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', activeRoom: 'Room 108', status: 'In Progress' },
    { name: 'Karan Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', activeRoom: 'Room 110', status: 'Idle' },
    { name: 'Ramesh Singh', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', activeRoom: undefined, status: 'Idle' }
  ];

  // Active loaded task details for inspection
  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedRoomId) || tasks[0];
  }, [tasks, selectedRoomId]);

  // Derived dashboard stats
  const stats = useMemo(() => {
    const toClean = tasks.filter(t => t.status !== 'Verified').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const verifiedReady = tasks.filter(t => t.status === 'Verified').length;
    const pendingCount = tasks.filter(t => t.status === 'Pending').length;
    return { toClean, inProgress, verifiedReady, pendingCount };
  }, [tasks]);

  // Search and Filter rooms
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.roomNumber.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    // Filter Type filter
    if (filterType === 'Urgent') {
      result = result.filter(t => t.priority === 'Urgent');
    } else if (filterType === 'Unassigned') {
      result = result.filter(t => !t.assignedTo);
    } else if (filterType === 'Assigned') {
      result = result.filter(t => !!t.assignedTo);
    }

    return result;
  }, [tasks, searchQuery, filterType]);

  // Columns for the Kanban Cleaning Board
  const columns = [
    { id: 'Pending', label: 'DIRTY / PENDING', bg: 'border-amber-200 bg-amber-50/20 text-amber-800' },
    { id: 'In Progress', label: 'CLEANING', bg: 'border-teal-200 bg-teal-50/20 text-teal-800' },
    { id: 'Cleaned', label: 'VERIFICATION', bg: 'border-purple-200 bg-purple-50/20 text-purple-800' }
  ];

  // Update a single task in parent state
  const updateSingleTask = (updated: HousekeepingTask) => {
    onUpdateTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  // Toggle checklist checkbox
  const handleToggleChecklist = (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map(item => {
      if (item.id === itemId) {
        const nextState = !item.checked;
        
        // If they toggle photo verification checklist item, auto-toggle the photoVerified boolean
        if (item.name.toLowerCase().includes('photo')) {
          task.photoVerified = nextState;
          if (nextState && !task.photoUrl) {
            // Give a default room preview photo
            task.photoUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80';
          }
        }

        return { ...item, checked: nextState };
      }
      return item;
    });

    // Check if ALL tasks are checked now. If yes, and status was 'In Progress', we can auto-advance to 'Cleaned'!
    let nextStatus = task.status;
    const allChecked = updatedChecklist.every(item => item.checked);
    if (allChecked && task.status === 'In Progress') {
      nextStatus = 'Cleaned';
      task.completionTime = `${Math.floor(20 + Math.random() * 25)} mins`;
      triggerToast(`${task.roomNumber} is fully cleaned! Moved to Manager Verification.`);
    } else if (!allChecked && task.status === 'Cleaned') {
      // If unchecked, move back to In Progress
      nextStatus = 'In Progress';
    }

    updateSingleTask({
      ...task,
      checklist: updatedChecklist,
      status: nextStatus
    });
  };

  // Assign staff to room
  const handleAssignStaff = (taskId: string, staffName: string) => {
    const staff = staffMembers.find(s => s.name === staffName);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated: HousekeepingTask = {
      ...task,
      assignedTo: staffName,
      assignedAvatar: staff?.avatar,
      status: task.status === 'Pending' ? 'In Progress' : task.status,
      completionTime: task.status === 'Pending' ? '0m elapsed' : task.completionTime
    };

    updateSingleTask(updated);
    triggerToast(`${staffName} successfully assigned to ${task.roomNumber}`);
  };

  // Automation: "Assign All" unassigned tasks to idle staff
  const handleAssignAll = () => {
    let unassigned = tasks.filter(t => !t.assignedTo);
    if (unassigned.length === 0) {
      triggerToast("All housekeeping rooms are already assigned!");
      return;
    }

    // Find staff who don't have active rooms or are idle
    const idleStaffNames = staffMembers
      .filter(s => s.status === 'Idle' || !s.activeRoom)
      .map(s => s.name);

    if (idleStaffNames.length === 0) {
      // Just fall back to any available staff member
      idleStaffNames.push('Ramesh Singh', 'Karan Kumar', 'Rohan K.');
    }

    const updatedTasks = tasks.map((task, idx) => {
      if (!task.assignedTo) {
        const staffName = idleStaffNames[idx % idleStaffNames.length];
        const staff = staffMembers.find(s => s.name === staffName);
        return {
          ...task,
          assignedTo: staffName,
          assignedAvatar: staff?.avatar,
          status: 'In Progress' as const,
          completionTime: '1m elapsed'
        };
      }
      return task;
    });

    onUpdateTasks(updatedTasks);
    triggerToast(`Automated assignment complete! Assigned ${unassigned.length} rooms to housekeeping staff.`);
  };

  // Manager approves room clean -> moves to "Verified" (Ready for check-in)
  const handleApproveVerification = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Tick all checklist items just in case
    const verifiedChecklist = task.checklist.map(item => ({ ...item, checked: true }));

    updateSingleTask({
      ...task,
      status: 'Verified',
      checklist: verifiedChecklist,
      photoVerified: true,
      photoUrl: task.photoUrl || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=500&q=80',
      completionTime: task.completionTime && task.completionTime !== 'Not Started' ? task.completionTime : '35 mins'
    });

    triggerToast(`Inspection complete: ${task.roomNumber} is now marked VERIFIED & ready for guests!`);
  };

  // Simulate photo upload for the inspecting room
  const handleSimulatePhotoUpload = () => {
    if (!selectedTask) return;
    
    // Choose beautiful resort room images
    const roomPhotos = [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=500&q=80'
    ];
    const chosenPhoto = roomPhotos[Math.floor(Math.random() * roomPhotos.length)];

    // Toggles the checklist item with "photo" in the name to true as well!
    const updatedChecklist = selectedTask.checklist.map(item => {
      if (item.name.toLowerCase().includes('photo') || item.name.toLowerCase().includes('verification')) {
        return { ...item, checked: true };
      }
      return item;
    });

    updateSingleTask({
      ...selectedTask,
      photoVerified: true,
      photoUrl: chosenPhoto,
      checklist: updatedChecklist
    });

    triggerToast(`High-resolution verification photo loaded for ${selectedTask.roomNumber}!`);
  };

  // Add custom new housekeeping task/room
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNo.trim()) return;

    const formattedRoom = newRoomNo.toLowerCase().includes('room') 
      ? newRoomNo.trim() 
      : `Room ${newRoomNo.trim()}`;

    // check if already exists
    if (tasks.some(t => t.roomNumber.toLowerCase() === formattedRoom.toLowerCase())) {
      triggerToast(`Alert: Housekeeping log for ${formattedRoom} already exists.`);
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
        { id: 't6', name: 'Quality Photo Verification', checked: false }
      ]
    };

    onUpdateTasks([newTask, ...tasks]);
    setSelectedRoomId(newTask.id);
    setShowNewTaskModal(false);
    setNewRoomNo('');
    triggerToast(`New cleaning request registered for ${formattedRoom}`);
  };

  // Get total tasks count checked
  const getCompletedChecklistCount = (task: HousekeepingTask) => {
    return task.checklist.filter(item => item.checked).length;
  };

  return (
    <div id="housekeeping-module-container" className="flex flex-col h-full w-full bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
      
      {/* 1. TOP HEADER WITH STATS GRID */}
      <header id="housekeeping-dashboard-header" className="bg-white border-b border-slate-200/80 px-8 py-4 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Brand */}
        <div>
          <div className="flex items-center gap-2">
            <Brush className="w-5 h-5 text-teal-800" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Housekeeping Dashboard</h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">
            Resort Operations MS • Real-time Monitoring
          </p>
        </div>

        {/* Dynamic Search & Navigation Actions */}
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rooms or staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-all shadow-inner"
            />
          </div>

          {/* Help & Alerts */}
          <button 
            onClick={() => triggerToast("Housekeeping guidelines loaded. Tap on any Room to inspect its live task checklist.")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Help Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button 
            onClick={() => triggerToast("You have 2 pending high-priority checkout rooms requiring quick preparation.")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 relative transition-colors"
            title="Housekeeping Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>

          {/* User Profile - Anita Desai */}
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="font-extrabold text-xs text-slate-800 leading-none">Anita Desai</p>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-1">OPS MANAGER</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" 
              alt="Anita Desai" 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </header>

      {/* 2. DYNAMIC STATS CARD ROW */}
      <div id="hk-stats-banner" className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-8 pt-6 pb-2 shrink-0">
        
        {/* Metric 1: Rooms to Clean */}
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Brush className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rooms to Clean</p>
            <p className="text-xl font-extrabold text-slate-850 leading-tight mt-0.5">
              {String(stats.toClean).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Metric 2: In Progress */}
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">In Progress</p>
            <p className="text-xl font-extrabold text-teal-950 leading-tight mt-0.5">
              {String(stats.inProgress).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Metric 3: Verified Ready */}
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Ready</p>
            <p className="text-xl font-extrabold text-emerald-950 leading-tight mt-0.5">
              {String(stats.verifiedReady).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Metric 4: Maint. Issues */}
        <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Maint. Issues</p>
            <p className="text-xl font-extrabold text-rose-950 leading-tight mt-0.5">03</p>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC CONTROLS & BOARD ROW */}
      <div className="flex-1 flex overflow-hidden p-8 gap-6">
        
        {/* LEFT MAIN BOARD (SPAN 7) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden h-full">
          
          {/* Cleaning Board Subheader */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">Cleaning Board</h2>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-150 text-[10px] font-bold rounded-md text-slate-500">
                Live Status
              </span>
            </div>

            {/* Controls Filter & Assign All */}
            <div className="flex items-center gap-2">
              {/* Quick Filters */}
              <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl">
                {(['All', 'Urgent', 'Unassigned', 'Assigned'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      filterType === type 
                        ? 'bg-white text-teal-900 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Assign All Automation */}
              <button
                onClick={handleAssignAll}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                title="Automatically assign idle staff to dirty rooms"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Assign All</span>
              </button>

              {/* Create Custom Request */}
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-slate-600 hover:text-slate-800 transition-colors"
                title="Log New Room Cleaning Job"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* THREE KANBAN BOARD COLUMNS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-1 mt-4 overflow-y-auto h-full items-start">
            
            {columns.map((col) => {
              // Map tasks matching this column status
              const colTasks = filteredTasks.filter(t => {
                if (col.id === 'Pending') return t.status === 'Pending';
                if (col.id === 'In Progress') return t.status === 'In Progress';
                if (col.id === 'Cleaned') return t.status === 'Cleaned';
                return false;
              });

              return (
                <div key={col.id} className="flex flex-col h-full bg-slate-50/50 border border-slate-150/60 rounded-2xl p-3 min-h-[350px]">
                  
                  {/* Column Header */}
                  <div className={`px-2.5 py-1.5 rounded-xl border font-extrabold text-[10px] tracking-wider mb-3 flex items-center justify-between ${col.bg}`}>
                    <span>{col.label}</span>
                    <span className="font-bold opacity-80">{String(colTasks.length).padStart(2, '0')}</span>
                  </div>

                  {/* Column Tasks Stack */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-0.5">
                    {colTasks.map((task) => {
                      const isSelected = selectedRoomId === task.id;
                      const completedCount = getCompletedChecklistCount(task);
                      const totalCount = task.checklist.length;
                      const progressPct = Math.round((completedCount / totalCount) * 100) || 0;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedRoomId(task.id)}
                          className={`w-full text-left bg-white border rounded-xl p-3.5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-150 relative ${
                            isSelected 
                              ? 'border-teal-700/80 ring-1 ring-teal-700/80' 
                              : 'border-slate-150 hover:border-slate-300'
                          }`}
                        >
                          
                          {/* Room Header & Priority Badge */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-extrabold text-xs text-slate-800">{task.roomNumber}</span>
                            
                            {task.priority === 'Urgent' && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[8px] font-extrabold rounded-md uppercase tracking-wide flex items-center gap-0.5 animate-pulse">
                                ! Urgent
                              </span>
                            )}
                            {task.priority === 'High' && (
                              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-[8px] font-bold rounded-md uppercase tracking-wide">
                                High Priority
                              </span>
                            )}
                          </div>

                          {/* Room Type */}
                          <p className="text-[10px] text-slate-400 font-medium mb-3">{task.type}</p>

                          {/* Progress bar or unassigned picker */}
                          {task.status !== 'Pending' ? (
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                                <span>PROGRESS</span>
                                <span className="text-slate-600">{completedCount}/{totalCount} TASKS</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-teal-700 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="h-[23px] mb-3" /> // spacer to keep heights symmetric
                          )}

                          {/* Footer with Assignment, Photo & Timer */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            
                            {/* Assigned Staff with quick dropdown selector */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {task.assignedTo ? (
                                <>
                                  <img 
                                    src={task.assignedAvatar} 
                                    alt={task.assignedTo} 
                                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-[10px] text-slate-600 font-bold truncate">
                                    {task.assignedTo}
                                  </span>
                                </>
                              ) : (
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleAssignStaff(task.id, e.target.value)}
                                  defaultValue=""
                                  className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-md py-0.5 px-1 focus:outline-none focus:border-teal-700 max-w-[120px]"
                                >
                                  <option value="" disabled>? Unassigned</option>
                                  {staffMembers.map(s => (
                                    <option key={s.name} value={s.name}>{s.name}</option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Timer indicator & Verification icon */}
                            <div className="flex items-center gap-2 shrink-0 pl-1">
                              {task.status === 'In Progress' && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-teal-700" title="Active clean elapsed timer">
                                  <Clock className="w-3 h-3 animate-spin duration-3000" />
                                  <span>{task.completionTime?.replace(' elapsed', '') || '12m'}</span>
                                </div>
                              )}

                              {task.status === 'Cleaned' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveVerification(task.id);
                                  }}
                                  className="px-2 py-1 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-[9px] rounded-lg shadow-xs transition-colors"
                                >
                                  Approve
                                </button>
                              )}

                              {task.photoVerified && (
                                <span className="p-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md" title="Photo verification received">
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
                        No rooms in this status.
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* RIGHT SIDE PANEL (Active Staff + Selected Checklist Inspection) */}
        <div className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto">
          
          {/* A. ACTIVE HOUSEKEEPING STAFF CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Active Staff</span>
              </h3>
              <button
                onClick={() => setShowStaffModal(true)}
                className="text-[10px] font-extrabold text-teal-800 hover:text-teal-950"
              >
                View Metrics
              </button>
            </div>

            {/* Staff Stack */}
            <div className="space-y-3">
              {staffMembers.slice(0, 4).map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <img 
                      src={staff.avatar} 
                      alt={staff.name} 
                      className="w-9 h-9 rounded-full object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{staff.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        {staff.activeRoom ? staff.activeRoom : 'Idle / Available'}
                      </p>
                    </div>
                  </div>

                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full ${
                    staff.status === 'In Progress' 
                      ? 'bg-teal-600' 
                      : staff.status === 'Verification' 
                      ? 'bg-purple-500' 
                      : 'bg-slate-300'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* B. INSPECTING SELECTED ROOM CHECKLIST CARD */}
          {selectedTask ? (
            <div id="inspecting-checklist-card" className="bg-emerald-950 text-emerald-100 border border-emerald-900 rounded-3xl p-5 shadow-md flex-1 flex flex-col justify-between min-h-[380px]">
              
              <div>
                {/* Header */}
                <div className="pb-3.5 border-b border-emerald-900 mb-4">
                  <p className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400">Inspecting Room</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <h3 className="text-base font-extrabold text-white">{selectedTask.roomNumber}</h3>
                    <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 border border-emerald-800 text-[9px] font-bold rounded-md">
                      {selectedTask.type}
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-[10px] text-emerald-300 uppercase font-extrabold tracking-wider mb-3">
                  Cleaning Checklist
                </p>

                {/* Checklist Checklist stack */}
                <div className="space-y-2.5">
                  {selectedTask.checklist.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleToggleChecklist(selectedTask.id, item.id)}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-emerald-900/30 p-1.5 rounded-lg transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        item.checked 
                          ? 'bg-teal-500 border-teal-500 text-white' 
                          : 'border-emerald-700 group-hover:border-emerald-500'
                      }`}>
                        {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <span className={`text-xs ${item.checked ? 'line-through text-emerald-400' : 'text-emerald-100 font-medium'}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Photo Verification Visual Display */}
                <div className="mt-5 pt-4 border-t border-emerald-900 space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-emerald-300 uppercase font-bold tracking-wider">
                    <span>Photo Verification</span>
                    {selectedTask.photoVerified ? (
                      <span className="text-teal-400 font-extrabold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified photo</span>
                      </span>
                    ) : (
                      <span className="text-orange-400 font-bold">Awaiting photo</span>
                    )}
                  </div>

                  {selectedTask.photoVerified && selectedTask.photoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-900/50 group h-24">
                      <img 
                        src={selectedTask.photoUrl} 
                        alt="Verification proof" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => alert(`Reviewing verification photo for ${selectedTask.roomNumber}`)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 border border-white/20"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Fullscreen</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSimulatePhotoUpload}
                      className="w-full py-3 bg-emerald-900/30 hover:bg-emerald-900/50 border border-dashed border-emerald-800 rounded-xl text-emerald-300 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all text-xs"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Simulate Photo Capture</span>
                    </button>
                  )}
                </div>

                {/* Completion Time Block */}
                <div className="mt-4 text-[10px] text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold">Log / Completion Time:</span>
                  <span className="text-white font-extrabold">{selectedTask.completionTime || 'Not Started'}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-emerald-900 space-y-2">
                <button
                  onClick={() => handleApproveVerification(selectedTask.id)}
                  disabled={selectedTask.status === 'Verified'}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTask.status === 'Verified'
                      ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-800/40 cursor-not-allowed'
                      : 'bg-white text-emerald-950 hover:bg-teal-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{selectedTask.status === 'Verified' ? 'Room Verified Ready ✓' : 'Mark as Verified'}</span>
                </button>

                <button
                  onClick={() => {
                    alert(`Exporting operational housekeeping PDF report for ${selectedTask.roomNumber}. Processing logs...`);
                  }}
                  className="w-full py-1.5 bg-emerald-900/20 hover:bg-emerald-900/30 text-[10px] font-bold text-emerald-300 rounded-lg flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Report</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-emerald-950 text-emerald-300 border border-emerald-900 rounded-3xl p-6 shadow-sm text-center py-12">
              <Brush className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs">Select a room from the board to start audit inspection.</p>
            </div>
          )}

        </div>

      </div>

      {/* ---------------------------------------------------------
          MODAL A: STAFF DETAILED PERFORMANCE METRICS
          --------------------------------------------------------- */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-800" />
                <h3 className="font-extrabold text-slate-900 text-sm">Staff Performance Metrics</h3>
              </div>
              <button 
                onClick={() => setShowStaffModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 font-medium">
                Below are the tracked cleaning statistics, quality score and average room turn-around times.
              </p>

              <div className="space-y-2.5">
                {[
                  { name: 'Meena S.', completed: 14, score: '4.9★', avgTime: '32 mins' },
                  { name: 'Rohan K.', completed: 11, score: '4.8★', avgTime: '35 mins' },
                  { name: 'Arjun V.', completed: 12, score: '4.7★', avgTime: '30 mins' },
                  { name: 'Sunita Bai', completed: 9, score: '4.6★', avgTime: '40 mins' },
                  { name: 'Karan Kumar', completed: 8, score: '4.8★', avgTime: '28 mins' }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                      <span>{s.completed} Cleaned</span>
                      <span className="font-bold text-amber-500">{s.score}</span>
                      <span className="font-semibold text-slate-700">{s.avgTime} avg</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                >
                  Close Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
          MODAL B: CREATE NEW CUSTOM CLEANING REQUEST
          --------------------------------------------------------- */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">New Cleaning Request</h3>
              <button 
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104, 305"
                  value={newRoomNo}
                  onChange={(e) => setNewRoomNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-750"
                  required
                />
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
                  <option value="Deluxe Sea View">Deluxe Sea View</option>
                  <option value="Standard Garden">Standard Garden</option>
                  <option value="Premium Suite">Premium Suite</option>
                  <option value="Luxury Beach Villa">Luxury Beach Villa</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                    <label key={p} className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
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
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs"
                >
                  Create Job
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
