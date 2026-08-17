import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  Users,
  Check
} from 'lucide-react';
import { StaffTask, StaffMember } from '../../types';

interface StaffTasksTabProps {
  tasks: StaffTask[];
  staffList: StaffMember[];
  onToggleTaskStatus: (taskId: string) => void;
  onAssignTask: (task: Partial<StaffTask>) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffTasksTab({
  tasks,
  staffList,
  onToggleTaskStatus,
  onAssignTask,
  triggerToast
}: StaffTasksTabProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDept, setNewTaskDept] = useState('Housekeeping');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(staffList[0]?.name || '');
  const [newTaskLocation, setNewTaskLocation] = useState('Villa 104');
  const [newTaskPriority, setNewTaskPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || t.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const staff = staffList.find(s => s.name === newTaskAssignedTo);
    onAssignTask({
      title: newTaskTitle,
      department: newTaskDept as any,
      assignedToName: newTaskAssignedTo,
      assignedToId: staff?.id || 'staff-1',
      assignedToAvatar: staff?.avatar || 'VK',
      location: newTaskLocation,
      priority: newTaskPriority,
      status: 'Pending',
      dueTime: 'Today 04:00 PM',
      guestRating: undefined
    });
    setShowNewTaskModal(false);
    setNewTaskTitle('');
    triggerToast(`Task "${newTaskTitle}" assigned to ${newTaskAssignedTo}`);
  };

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">Cross-Department Task Assignments</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
              Synced with PMS & Maintenance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch, track, and close housekeeping turnovers, maintenance repairs, and guest VIP amenities in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-teal-200" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, locations, or staff..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Restaurant">Restaurant</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between gap-4 transition-all ${
              task.status === 'Completed' ? 'border-slate-200 opacity-80' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                  {task.department}
                </span>
                {task.priority === 'Urgent' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    Urgent
                  </span>
                ) : task.priority === 'High' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    High
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                    Normal
                  </span>
                )}
              </div>

              {/* Title & Location */}
              <h4 className={`font-bold text-sm text-slate-900 mt-2.5 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span>📍 {task.location}</span>
                <span>•</span>
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Due: {task.dueTime}</span>
              </p>
            </div>

            {/* Assigned Staff & Status Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">
                  {task.assignedToAvatar}
                </div>
                <span className="text-xs font-semibold text-slate-700">{task.assignedToName}</span>
              </div>

              <button
                onClick={() => onToggleTaskStatus(task.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  task.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : task.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-800 hover:text-white'
                }`}
              >
                {task.status === 'Completed' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Done</span>
                  </>
                ) : (
                  <span>{task.status}</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Assign Operational Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title & Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep clean Villa 202 plunge pool filters"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Staff</label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location / Room</label>
                  <input
                    type="text"
                    value={newTaskLocation}
                    onChange={(e) => setNewTaskLocation(e.target.value)}
                    placeholder="e.g. Villa 104 or Main Pool"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
