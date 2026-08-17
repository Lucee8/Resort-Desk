import React, { useState } from 'react';
import { X, Plus, User, Mail, Phone, Briefcase, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { StaffMember, StaffDepartment, StaffRole, EmploymentType } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStaff: (staffData: Partial<StaffMember>) => void;
  staffToEdit?: StaffMember | null;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  onSaveStaff,
  staffToEdit
}: AddStaffModalProps) {
  const [name, setName] = useState(staffToEdit?.name || '');
  const [role, setRole] = useState<StaffRole>(staffToEdit?.role || 'Front Desk Associate');
  const [department, setDepartment] = useState<StaffDepartment>(staffToEdit?.department || 'Front Desk');
  const [phone, setPhone] = useState(staffToEdit?.phone || '+91 98200 12345');
  const [email, setEmail] = useState(staffToEdit?.email || '');
  const [baseSalary, setBaseSalary] = useState(staffToEdit?.baseSalary ? String(staffToEdit.baseSalary) : '28000');
  const [shift, setShift] = useState(staffToEdit?.todayShift || '09:00 AM - 06:00 PM');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(staffToEdit?.employmentType || 'Full-time');
  const [skills, setSkills] = useState(staffToEdit?.skills.join(', ') || 'Guest Relations, Opera PMS, English, Marathi');
  const [bankName, setBankName] = useState(staffToEdit?.bankDetails?.bankName || 'HDFC Bank - Alibaug');
  const [accountNumber, setAccountNumber] = useState(staffToEdit?.bankDetails?.accountNumber || '•••• •••• 4589');

  React.useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name || '');
      setRole(staffToEdit.role || 'Front Desk Associate');
      setDepartment(staffToEdit.department || 'Front Desk');
      setPhone(staffToEdit.phone || '+91 98200 12345');
      setEmail(staffToEdit.email || '');
      setBaseSalary(staffToEdit.baseSalary ? String(staffToEdit.baseSalary) : '28000');
      setShift(staffToEdit.todayShift || '09:00 AM - 06:00 PM');
      setEmploymentType(staffToEdit.employmentType || 'Full-time');
      setSkills(staffToEdit.skills.join(', ') || 'Guest Relations, Opera PMS, English, Marathi');
      setBankName(staffToEdit.bankDetails?.bankName || 'HDFC Bank - Alibaug');
      setAccountNumber(staffToEdit.bankDetails?.accountNumber || '•••• •••• 4589');
    }
  }, [staffToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const salaryNum = parseFloat(baseSalary) || 25000;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    onSaveStaff({
      ...(staffToEdit ? { id: staffToEdit.id } : {}),
      name,
      role,
      department,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@resortdesk.ai`,
      baseSalary: salaryNum,
      todayShift: shift,
      employmentType,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      avatar: initials,
      avatarBg: 'bg-teal-100 text-teal-800',
      status: staffToEdit?.status || 'On Duty',
      attendanceRate: staffToEdit?.attendanceRate || 98.0,
      performanceScore: staffToEdit?.performanceScore || 4.8,
      tasksCompleted: staffToEdit?.tasksCompleted || 0,
      taskCompletionRate: staffToEdit?.taskCompletionRate || 98,
      responseTimeMins: staffToEdit?.responseTimeMins || 6.0,
      guestRating: staffToEdit?.guestRating || 4.8,
      complaintsCount: 0,
      overtimeHours: staffToEdit?.overtimeHours || 0,
      overtimePay: staffToEdit?.overtimePay || 0,
      bonus: staffToEdit?.bonus || 0,
      deductions: staffToEdit?.deductions || 800,
      netPay: salaryNum - (staffToEdit?.deductions || 800),
      payrollStatus: staffToEdit?.payrollStatus || 'Ready',
      joinDate: staffToEdit?.joinDate || 'August 2024',
      leaveBalance: staffToEdit?.leaveBalance || { casual: 5, sick: 7, annual: 10, emergency: 2 },
      bankDetails: {
        bankName,
        accountNumber,
        ifsc: 'HDFC0001824'
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Staff Management</span>
            <h3 className="font-bold text-base text-white">
              {staffToEdit ? 'Edit Staff Profile' : 'Add New Staff Member'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs font-sans">
          {/* Full Name & Employee ID */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-700 focus:bg-white"
            />
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Front Desk">Front Desk</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Security">Security</option>
                <option value="Spa & Wellness">Spa & Wellness</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Role / Designation</label>
              <input
                type="text"
                required
                placeholder="e.g. Front Desk Associate"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="staff@resortdesk.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Salary & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Monthly Base Salary (₹)</label>
              <input
                type="number"
                required
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="09:00 AM - 06:00 PM">Morning (09:00 AM - 06:00 PM)</option>
                <option value="08:00 AM - 05:00 PM">Early (08:00 AM - 05:00 PM)</option>
                <option value="02:00 PM - 11:00 PM">Evening (02:00 PM - 11:00 PM)</option>
                <option value="08:00 PM - 05:00 AM">Night Shift (08:00 PM - 05:00 AM)</option>
              </select>
            </div>
          </div>

          {/* Employment Type & Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Seasonal">Seasonal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Skills (Comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Bank Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
            <span className="font-bold text-slate-800">Payroll Disbursement Details</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Bank Name & Branch"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              {staffToEdit ? 'Save Changes' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
