import React, { useState } from 'react';
import { X, UserCheck, Check, Clock, AlertTriangle, Users } from 'lucide-react';
import { StaffMember, AttendanceStatus } from '../../types';

interface MarkBulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onSaveBulkAttendance: (attendanceMap: Record<string, AttendanceStatus>) => void;
  triggerToast: (msg: string) => void;
}

export default function MarkBulkAttendanceModal({
  isOpen,
  onClose,
  staffList,
  onSaveBulkAttendance,
  triggerToast
}: MarkBulkAttendanceModalProps) {
  if (!isOpen) return null;

  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    staffList.forEach(s => {
      map[s.id] = s.status === 'On Leave' ? 'On Leave' : s.status === 'On Duty' ? 'Present' : 'Present';
    });
    return map;
  });

  const handleSetAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    staffList.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleToggle = (id: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [id]: status
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBulkAttendance(attendanceState);
    triggerToast("Today's bulk attendance roster locked and saved.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Attendance Console</span>
              <h3 className="font-bold text-base text-white">Mark Bulk Daily Attendance (Aug 24)</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Quick Set All:</span>
            <button
              type="button"
              onClick={() => handleSetAll('Present')}
              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg font-bold cursor-pointer transition-colors"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('Absent')}
              className="px-2.5 py-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg font-bold cursor-pointer transition-colors"
            >
              All Absent
            </button>
          </div>

          <span className="text-slate-500 font-medium">15 Staff Profiles</span>
        </div>

        {/* List of Staff with 4-choice buttons */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-2.5 text-xs font-sans">
          {staffList.map((staff) => {
            const current = attendanceState[staff.id] || 'Present';
            return (
              <div
                key={staff.id}
                className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {staff.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{staff.name}</p>
                    <p className="text-[10px] text-slate-400">{staff.role} • {staff.department}</p>
                  </div>
                </div>

                {/* Status Toggle Button Group */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  {(['Present', 'Late', 'On Leave', 'Absent'] as AttendanceStatus[]).map((status) => {
                    const isSelected = current === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleToggle(staff.id, status)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : status === 'Late'
                                ? 'bg-orange-500 text-white shadow-xs'
                                : status === 'On Leave'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              Lock & Save Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
