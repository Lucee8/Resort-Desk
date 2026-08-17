import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { BillingInvoice, InvoicePaymentRecord } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  onConfirmPayment: (invoiceId: string, amount: number, method: string, referenceId: string) => void;
  triggerToast: (msg: string) => void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onConfirmPayment,
  triggerToast
}: RecordPaymentModalProps) {
  const [payAmount, setPayAmount] = useState<string>(invoice ? String(invoice.dueAmount) : '0');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit Card' | 'Debit Card' | 'Netbanking' | 'Cash' | 'Corporate Cheque' | 'Bank Transfer'>('UPI');
  const [referenceId, setReferenceId] = useState<string>(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [collectedBy, setCollectedBy] = useState('Anand Sharma (General Manager)');

  React.useEffect(() => {
    if (invoice) {
      setPayAmount(String(invoice.dueAmount));
      setReferenceId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please enter a valid payment amount');
      return;
    }

    onConfirmPayment(invoice.id, amt, paymentMethod, referenceId);
    triggerToast(`Payment of ₹${new Intl.NumberFormat('en-IN').format(amt)} recorded for ${invoice.invoiceNumber}`);
    onClose();
  };

  if (!isOpen || !invoice) return null;

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0c4033] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Record Guest Payment</h3>
              <p className="text-[11px] text-emerald-200/80">{invoice.invoiceNumber} • {invoice.guestName}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-800">
          {/* Outstanding Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Total Outstanding</span>
              <p className="text-xl font-bold text-amber-950 font-sans mt-0.5">₹{formatINR(invoice.dueAmount)}</p>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg font-medium">
              {invoice.roomNumber}
            </span>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Amount to Collect (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                max={invoice.dueAmount}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-700 transition-all"
              />
            </div>
          </div>

          {/* Quick Pay Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPayAmount(String(invoice.dueAmount))}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
            >
              Full Balance (₹{formatINR(invoice.dueAmount)})
            </button>
            <button
              type="button"
              onClick={() => setPayAmount(String(Math.round(invoice.dueAmount / 2)))}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
            >
              50% Partial
            </button>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / QR Scan)</option>
              <option value="Credit Card">Credit Card (Swipe / Tap POS)</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Netbanking">Netbanking / IMPS / NEFT</option>
              <option value="Cash">Cash at Reception</option>
              <option value="Corporate Cheque">Corporate Cheque</option>
              <option value="Bank Transfer">Direct RTGS / Wire</option>
            </select>
          </div>

          {/* Reference ID */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Transaction Ref / UTR / Receipt No.
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-teal-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0c4033] hover:bg-[#082e25] rounded-xl shadow-md shadow-[#0c4033]/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Confirm &amp; Issue Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
