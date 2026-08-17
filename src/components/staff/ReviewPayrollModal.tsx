import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  Download, 
  AlertCircle, 
  Lock,
  ArrowRight,
  Sparkles,
  Building
} from 'lucide-react';
import { StaffMember } from '../../types';

interface ReviewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onConfirmRelease: () => void;
  triggerToast: (msg: string) => void;
}

export default function ReviewPayrollModal({
  isOpen,
  onClose,
  staffList,
  onConfirmRelease,
  triggerToast
}: ReviewPayrollModalProps) {
  const [managerPin, setManagerPin] = useState('8892');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalBase = staffList.reduce((acc, s) => acc + s.baseSalary, 0);
  const totalOvertime = staffList.reduce((acc, s) => acc + s.overtimePay, 0);
  const totalBonus = staffList.reduce((acc, s) => acc + s.bonus, 0);
  const totalDeductions = staffList.reduce((acc, s) => acc + s.deductions, 0);
  const totalDisbursement = staffList.reduce((acc, s) => acc + s.netPay, 0);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      setIsSuccess(true);
      onConfirmRelease();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0c4a45] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-teal-200 hover:text-white bg-black/20 p-1.5 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Payroll Authorization</span>
              <h3 className="text-lg font-bold text-white">Release August 2024 Payroll</h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        {!isSuccess ? (
          <form onSubmit={handleRelease} className="p-6 flex flex-col gap-4 text-xs font-sans text-slate-700">
            {/* Total Net Card */}
            <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider">Total Batch Amount</span>
                <p className="text-2xl font-black text-teal-950">₹{totalDisbursement.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                  Reconciled for 15 active resort staff accounts
                </p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-teal-900 border border-teal-200 shadow-2xs">
                  NEFT / IMPS Ready
                </span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                Disbursement Ledger Summary
              </h4>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Gross Salaries (15 Staff)</span>
                <span className="font-bold text-slate-800">₹{totalBase.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-emerald-700 font-medium">Overtime Additions (72 Hours)</span>
                <span className="font-bold text-emerald-700">+₹{totalOvertime.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-amber-700 font-medium">Performance Incentives & Bonus</span>
                <span className="font-bold text-amber-700">+₹{totalBonus.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-rose-600 font-medium">Statutory Deductions (PF / TDS / ESI)</span>
                <span className="font-bold text-rose-600">-₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 font-black text-slate-900 text-sm">
                <span>Net Bank Transfer</span>
                <span className="text-teal-950">₹{totalDisbursement.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Manager Security PIN */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Lock className="w-4 h-4 text-teal-800" />
                <span>Manager Security Authorization</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Enter your 4-digit Resort Manager PIN to authenticate bank batch release:
              </p>
              <input
                type="password"
                maxLength={4}
                required
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                placeholder="PIN (Default 8892)"
                className="w-32 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center text-sm font-bold tracking-widest focus:border-teal-700"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAuthorizing}
                className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAuthorizing ? (
                  <span>Processing Batch...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-200" />
                    <span>Authorize & Disburse Funds</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="p-8 flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">Payroll Released Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                ₹{totalDisbursement.toLocaleString('en-IN')} has been scheduled for disbursement to 15 bank accounts. Payslips and WhatsApp notifications have been transmitted.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left w-full text-xs flex flex-col gap-1 text-slate-600">
              <div className="flex justify-between">
                <span>Batch Reference ID:</span>
                <span className="font-mono font-bold text-slate-900">RD-PAY-202408-8842</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Bank Integration:</span>
                <span className="font-semibold text-emerald-700">HDFC Corporate Gateway Synced</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => {
                  triggerToast("Bank transfer receipt downloaded.");
                  onClose();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Download Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
