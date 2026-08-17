import React, { useState } from 'react';
import { X, Calendar, Plus, Sparkles, User, AlertCircle } from 'lucide-react';
import { StaffMember, LeaveType, StaffLeaveRequest } from '../../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onApplyLeave: (newLeave: Partial<StaffLeaveRequest>) => void;
  triggerToast: (msg: string) => void;
}

export default function ApplyLeaveModal({
  isOpen,
  onClose,
  staffList,
  onApplyLeave,
  triggerToast
}: ApplyLeaveModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState('Aug 27, 2024');
  const [endDate, setEndDate] = useState('Aug 28, 2024');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('Family occasion in Ratnagiri');
  const [coveragePlan, setCoveragePlan] = useState('Rahul Bhosale covering evening shift');

  const selectedStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    onApplyLeave({
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffRole: selectedStaff.role,
      department: selectedStaff.department,
      avatar: selectedStaff.avatar,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'Pending',
      appliedOn: 'Aug 24, 2024',
      coveragePlan,
      isUrgent: false
    });

    triggerToast(`Leave application submitted for ${selectedStaff.name}.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Leave Management</span>
              <h3 className="font-bold text-base text-white">Apply Time-Off for Staff</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-sans text-slate-700">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Staff Member</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role} - {s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Sick Leave (SL)</option>
                <option value="Annual Leave">Annual Leave (AL)</option>
                <option value="Emergency Leave">Emergency Leave</option>
                <option value="Marriage Leave">Marriage Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Duration (Days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Date</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. Aug 27, 2024"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">End Date</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="e.g. Aug 28, 2024"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Reason for Leave</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending sister's wedding ceremony in Chiplun"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Shift Replacement / Coverage Plan</label>
            <input
              type="text"
              value={coveragePlan}
              onChange={(e) => setCoveragePlan(e.target.value)}
              placeholder="e.g. Assigned Priya Sharma for evening shift"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
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
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
