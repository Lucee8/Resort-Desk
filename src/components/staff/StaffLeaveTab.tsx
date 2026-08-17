import React, { useState } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Sparkles,
  Users
} from 'lucide-react';
import { StaffLeaveRequest, StaffMember, LeaveType } from '../../types';

interface StaffLeaveTabProps {
  leaveRequests: StaffLeaveRequest[];
  staffList: StaffMember[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string, reason?: string) => void;
  onOpenLeaveDetails: (req: StaffLeaveRequest) => void;
  onOpenApplyLeave: () => void;
  triggerToast: (msg: string) => void;
}

export default function StaffLeaveTab({
  leaveRequests,
  staffList,
  onApproveLeave,
  onRejectLeave,
  onOpenLeaveDetails,
  onOpenApplyLeave,
  triggerToast
}: StaffLeaveTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'rejected' | 'balances'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = leaveRequests.filter(l => l.status === 'Pending');
  const approvedRequests = leaveRequests.filter(l => l.status === 'Approved');
  const rejectedRequests = leaveRequests.filter(l => l.status === 'Rejected');

  const filteredRequests = (
    activeSubTab === 'pending' ? pendingRequests :
    activeSubTab === 'approved' ? approvedRequests :
    rejectedRequests
  ).filter(r => 
    !searchQuery ||
    r.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-900">Leave & Time-Off Management</h3>
            {pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {pendingRequests.length} Pending Approval
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review paid time off, medical certificates, marriage leaves, and view real-time shift coverage replacements.
          </p>
        </div>

        <button
          onClick={onOpenApplyLeave}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-teal-200" />
          <span>Apply Staff Leave</span>
        </button>
      </div>

      {/* Sub-tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-black">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('approved')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Approved ({approvedRequests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rejected')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'rejected' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rejected ({rejectedRequests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('balances')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'balances' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Leave Balances
          </button>
        </div>

        {activeSubTab !== 'balances' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff or leave type..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700"
            />
          </div>
        )}
      </div>

      {/* Main Content: Leave Requests Cards or Balances Table */}
      {activeSubTab !== 'balances' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {req.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{req.staffName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {req.staffRole} • {req.department}
                      </p>
                    </div>
                  </div>

                  {req.isUrgent && req.status === 'Pending' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                      Urgent
                    </span>
                  )}
                  {req.status === 'Approved' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      Approved
                    </span>
                  )}
                </div>

                {/* Dates & Reason */}
                <div className="mt-3.5 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{req.leaveType}</span>
                    <span className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {req.days} Day{req.days > 1 ? 's' : ''} ({req.startDate} {req.days > 1 ? `– ${req.endDate}` : ''})
                    </span>
                  </div>
                  <p className="text-slate-600 italic">
                    "{req.reason}"
                  </p>
                  {req.coveragePlan && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-teal-800 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{req.coveragePlan}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  Applied on {req.appliedOn}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenLeaveDetails(req)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  {req.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onRejectLeave(req.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApproveLeave(req.id)}
                        className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <p className="text-sm font-semibold">No {activeSubTab} leave requests found.</p>
            </div>
          )}
        </div>
      ) : (
        /* LEAVE BALANCES TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">STAFF MEMBER</th>
                  <th className="py-3.5 px-4">DEPARTMENT</th>
                  <th className="py-3.5 px-3 text-center">CASUAL (DAYS)</th>
                  <th className="py-3.5 px-3 text-center">SICK (DAYS)</th>
                  <th className="py-3.5 px-3 text-center">ANNUAL (DAYS)</th>
                  <th className="py-3.5 px-3 text-center">EMERGENCY</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs`}>
                          {staff.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{staff.name}</p>
                          <p className="text-[10px] text-slate-400">{staff.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{staff.department}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.leaveBalance.casual}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.leaveBalance.sick}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.leaveBalance.annual}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">{staff.leaveBalance.emergency}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => triggerToast(`Leave balance ledger opened for ${staff.name}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
