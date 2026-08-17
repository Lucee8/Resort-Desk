import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Award, 
  CreditCard, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Download, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  UserCheck,
  Send
} from 'lucide-react';
import { StaffMember } from '../../types';

interface StaffProfileModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onQuickPay: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffProfileModal({
  staff,
  onClose,
  onQuickPay,
  onEditStaff,
  triggerToast
}: StaffProfileModalProps) {
  if (!staff) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'shifts' | 'performance' | 'payroll' | 'documents'>('overview');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header Card with Cover */}
        <div className="bg-[#0c4a45] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-teal-200 hover:text-white bg-black/20 p-1.5 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              {staff.avatarImage ? (
                <img 
                  src={staff.avatarImage} 
                  alt={staff.name} 
                  className="w-18 h-18 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
                />
              ) : (
                <div className={`w-18 h-18 rounded-2xl ${staff.avatarBg || 'bg-teal-100 text-teal-900'} flex items-center justify-center text-xl font-black ring-4 ring-white/20`}>
                  {staff.avatar}
                </div>
              )}
              {staff.isTopPerformer && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-teal-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  ★ TOP 1
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white">{staff.name}</h3>
                <span className="text-xs text-teal-200 font-mono bg-white/10 px-2 py-0.5 rounded">
                  {staff.employeeId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  {staff.status}
                </span>
              </div>
              <p className="text-sm text-teal-100/90 font-medium mt-0.5">
                {staff.role} • <strong className="text-white">{staff.department}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-teal-200/80 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {staff.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {staff.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-center">
              <button
                onClick={() => onQuickPay(staff)}
                className="px-3.5 py-2 bg-white text-teal-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Quick Pay
              </button>
              <button
                onClick={() => triggerToast(`Opening WhatsApp chat with ${staff.name} (${staff.phone})`)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl transition-colors cursor-pointer border border-emerald-400/30"
                title="Message on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'shifts', label: 'Shifts & Roster' },
            { id: 'performance', label: 'Performance' },
            { id: 'payroll', label: 'Payroll & Slips' },
            { id: 'documents', label: 'Documents & Verification' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-800 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs text-slate-700 font-sans">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employment Details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Employment Details</h4>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Employment Type</span>
                    <span className="font-semibold text-slate-800">{staff.employmentType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Joined Date</span>
                    <span className="font-semibold text-slate-800">{staff.joinDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Today's Shift</span>
                    <span className="font-semibold text-teal-800">{staff.todayShift}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Emergency Contact</span>
                    <span className="font-semibold text-slate-800">{staff.emergencyContact || '+91 98230 99999 (Family)'}</span>
                  </div>
                </div>

                {/* Skills & Accreditations */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Skills & Certifications</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {staff.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white rounded-lg text-slate-800 font-semibold border border-slate-200 shadow-2xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-800 font-medium text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aadhaar & Police Verification Background Check Verified</span>
                  </div>
                </div>
              </div>

              {/* Leave Balances Quick Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">Available Leave Balances</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-base font-black text-slate-800">{staff.leaveBalance.casual}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Casual</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-base font-black text-slate-800">{staff.leaveBalance.sick}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Sick</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-base font-black text-slate-800">{staff.leaveBalance.annual}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Annual</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-base font-black text-slate-800">{staff.leaveBalance.emergency}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Emergency</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  <span className="text-lg font-black text-emerald-800">{staff.attendanceRate}%</span>
                  <span className="block text-[10px] font-bold text-emerald-700 uppercase">Attendance Rate</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-lg font-black text-slate-800">23 / 24</span>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Days Present</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                  <span className="text-lg font-black text-amber-800">{staff.overtimeHours} hrs</span>
                  <span className="block text-[10px] font-bold text-amber-700 uppercase">Overtime Logged</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <h4 className="font-bold text-xs text-slate-900">Recent Biometric Logs</h4>
                <div className="flex justify-between py-1.5 border-b border-slate-200 text-[11px]">
                  <span>Aug 24, 2024 (Today)</span>
                  <span className="font-mono text-emerald-700 font-semibold">In: 08:58 AM • Out: In Progress</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 text-[11px]">
                  <span>Aug 23, 2024</span>
                  <span className="font-mono text-slate-700 font-semibold">In: 08:55 AM • Out: 06:05 PM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 text-[11px]">
                  <span>Aug 22, 2024</span>
                  <span className="font-mono text-slate-700 font-semibold">In: 08:52 AM • Out: 07:15 PM (+1.2h OT)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHIFTS */}
          {activeTab === 'shifts' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-xs text-slate-900">Assigned Shift Schedule (Week 34)</h4>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <div key={d} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{d}</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">
                      {i === 6 ? 'OFF' : '09-18'}
                    </span>
                    <span className="text-[9px] text-teal-800 font-medium">Morning</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Overall Rating</span>
                  <div className="flex items-center gap-1 text-xl font-black text-amber-900 mt-0.5">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                    <span>{staff.performanceScore.toFixed(2)} / 5.0</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">{staff.tasksCompleted} Tasks Done</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">{staff.taskCompletionRate}% Completion Rate</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <h4 className="font-bold text-xs text-slate-900">Guest Review Mentions</h4>
                <p className="text-xs text-slate-600 italic">
                  "{staff.name} made our stay unforgettable! Courteous, prompt, and exceptionally warm hospitality."
                </p>
                <span className="text-[10px] text-slate-400 self-end">— Verified Guest, Villa 102</span>
              </div>
            </div>
          )}

          {/* TAB 5: PAYROLL */}
          {activeTab === 'payroll' && (
            <div className="flex flex-col gap-4">
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase">August Net Pay</span>
                  <p className="text-xl font-black text-teal-950">₹{staff.netPay.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => triggerToast(`Payslip generated for ${staff.name}`)}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slip</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Base Salary</span>
                  <span className="font-bold text-slate-800">₹{staff.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Overtime ({staff.overtimeHours} hrs)</span>
                  <span className="font-bold text-emerald-700">+₹{staff.overtimePay.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bonus</span>
                  <span className="font-bold text-amber-700">+₹{staff.bonus.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Deductions (PF + TDS)</span>
                  <span className="font-bold text-rose-600">-₹{staff.deductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-xs text-slate-900">Verified Identity & Compliance Documents</h4>
              {[
                { title: 'Aadhaar Card (UIDAI Verified)', date: 'Verified Aug 2023', status: 'Valid' },
                { title: 'Maharashtra Police Clearance Certificate', date: 'Verified Sep 2023', status: 'Valid' },
                { title: 'FSSAI Food Hygiene Safety Certificate', date: 'Valid till 2025', status: 'Valid' },
                { title: 'Resort Employment Agreement', date: 'Signed on Joining', status: 'Signed' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-teal-800" />
                    <div>
                      <p className="font-bold text-xs text-slate-900">{doc.title}</p>
                      <p className="text-[10px] text-slate-400">{doc.date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onEditStaff(staff)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
