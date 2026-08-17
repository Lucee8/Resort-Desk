import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  CheckCircle, 
  Clock, 
  FileText, 
  Eye, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck,
  AlertCircle,
  Building,
  Check
} from 'lucide-react';
import { StaffMember } from '../../types';

interface StaffPayrollTabProps {
  staffList: StaffMember[];
  onQuickPay: (staff: StaffMember) => void;
  onOpenReleasePayroll: () => void;
  onSelectStaff: (staff: StaffMember) => void;
  triggerToast: (msg: string) => void;
}

export default function StaffPayrollTab({
  staffList,
  onQuickPay,
  onOpenReleasePayroll,
  onSelectStaff,
  triggerToast
}: StaffPayrollTabProps) {
  const [selectedMonth, setSelectedMonth] = useState('August 2024');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<StaffMember | null>(null);

  const totalBase = staffList.reduce((acc, s) => acc + s.baseSalary, 0);
  const totalOvertime = staffList.reduce((acc, s) => acc + s.overtimePay, 0);
  const totalBonus = staffList.reduce((acc, s) => acc + s.bonus, 0);
  const totalDeductions = staffList.reduce((acc, s) => acc + s.deductions, 0);
  const totalNet = staffList.reduce((acc, s) => acc + s.netPay, 0);

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-200">
      {/* 1. HERO PAYROLL READY BANNER */}
      <div className="bg-[#0c4a45] text-white rounded-2xl p-6 shadow-md shadow-teal-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">August 2024 Payroll Ready</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-teal-950">
                15 Staff Ready
              </span>
            </div>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              Calculations reconciled against biometric attendance, approved overtime (72 hrs), festival bonuses, and PF deductions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => triggerToast("Payroll summary statement downloaded as PDF.")}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Bank Batch File</span>
          </button>
          <button
            id="btn-release-payroll-tab"
            onClick={onOpenReleasePayroll}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-teal-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Review & Release Payroll (₹{totalNet.toLocaleString('en-IN')})
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Salaries</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">₹{totalBase.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">15 Active Employees</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Overtime Pay</span>
          <span className="text-lg font-black text-emerald-700 mt-1 block">+₹{totalOvertime.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">72 Logged Hours</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Bonuses & Tips</span>
          <span className="text-lg font-black text-amber-700 mt-1 block">+₹{totalBonus.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">Performance Incentives</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Deductions & TDS</span>
          <span className="text-lg font-black text-rose-700 mt-1 block">-₹{totalDeductions.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">PF, ESI & Advances</span>
        </div>

        <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Total Net Disbursement</span>
          <span className="text-lg font-black text-teal-950 mt-1 block">₹{totalNet.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-teal-700 font-semibold">Ready for Bank Transfer</span>
        </div>
      </div>

      {/* 3. STAFF PAYROLL REGISTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff payroll by name or ID..."
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
              <option value="Front Desk">Front Desk</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Security">Security</option>
            </select>

            <button
              onClick={() => triggerToast("All August payslips compiled and generated.")}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bulk Payslips</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">EMPLOYEE</th>
                <th className="py-3.5 px-3">DEPARTMENT</th>
                <th className="py-3.5 px-3 text-right">BASE SALARY</th>
                <th className="py-3.5 px-3 text-right">OVERTIME</th>
                <th className="py-3.5 px-3 text-right">BONUS</th>
                <th className="py-3.5 px-3 text-right">DEDUCTIONS</th>
                <th className="py-3.5 px-3 text-right">NET PAY</th>
                <th className="py-3.5 px-3 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((staff) => (
                <tr 
                  key={staff.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectStaff(staff)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${staff.avatarBg || 'bg-teal-100 text-teal-800'} flex items-center justify-center font-bold text-xs`}>
                        {staff.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-teal-800 text-xs">{staff.name}</p>
                        <p className="text-[10px] text-slate-400">{staff.employeeId} • {staff.bankDetails?.bankName.split('-')[0] || 'HDFC'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-600">{staff.department}</td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                    ₹{staff.baseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-emerald-700">
                    {staff.overtimePay > 0 ? `+₹${staff.overtimePay.toLocaleString('en-IN')}` : '---'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-amber-700">
                    {staff.bonus > 0 ? `+₹${staff.bonus.toLocaleString('en-IN')}` : '---'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-rose-600">
                    -₹{staff.deductions.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-900 text-xs">
                    ₹{staff.netPay.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100 uppercase">
                      {staff.payrollStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPayslipStaff(staff)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View Official Payslip"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Slip</span>
                      </button>
                      <button
                        onClick={() => onQuickPay(staff)}
                        className="px-3 py-1 bg-[#eaf6f6] hover:bg-[#d5eeee] text-teal-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Quick Pay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYSLIP PREVIEW MODAL */}
      {selectedPayslipStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Official Salary Slip</span>
                <h3 className="font-bold text-base text-white">August 2024 Payslip</h3>
              </div>
              <button
                onClick={() => setSelectedPayslipStaff(null)}
                className="text-teal-200 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 flex flex-col gap-4 text-xs font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedPayslipStaff.name}</h4>
                  <p className="text-slate-500">{selectedPayslipStaff.role} ({selectedPayslipStaff.department})</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedPayslipStaff.employeeId}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Vanya Boutique Resort</p>
                  <p className="text-slate-400 text-[11px]">Konkan Coast, Maharashtra</p>
                  <p className="text-emerald-700 font-bold text-[11px]">Direct Bank Transfer</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider block pb-1 border-b border-slate-200">
                    Earnings
                  </span>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Base Salary</span>
                    <span className="font-semibold text-slate-800">₹{selectedPayslipStaff.baseSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Overtime ({selectedPayslipStaff.overtimeHours} hrs)</span>
                    <span className="font-semibold text-emerald-700">+₹{selectedPayslipStaff.overtimePay.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Performance Bonus</span>
                    <span className="font-semibold text-amber-700">+₹{selectedPayslipStaff.bonus.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider block pb-1 border-b border-slate-200">
                    Deductions
                  </span>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Provident Fund (PF)</span>
                    <span className="font-semibold text-rose-600">-₹{(selectedPayslipStaff.deductions * 0.6).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Professional Tax & TDS</span>
                    <span className="font-semibold text-rose-600">-₹{(selectedPayslipStaff.deductions * 0.4).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Advance Balance</span>
                    <span>₹0</span>
                  </div>
                </div>
              </div>

              {/* Net Total */}
              <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider">Net Amount Payable</span>
                  <p className="text-lg font-black text-teal-950">₹{selectedPayslipStaff.netPay.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right text-[11px] text-teal-900">
                  <p className="font-bold">Bank: {selectedPayslipStaff.bankDetails?.bankName}</p>
                  <p className="font-mono text-slate-500 text-[10px]">A/C: {selectedPayslipStaff.bankDetails?.accountNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => triggerToast(`Payslip for ${selectedPayslipStaff.name} downloaded.`)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    onQuickPay(selectedPayslipStaff);
                    setSelectedPayslipStaff(null);
                  }}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Disburse Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
