import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { BillingInvoice } from '../../types';

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  onConfirmRefund: (invoiceId: string, refundAmount: number, reason: string) => void;
  triggerToast: (msg: string) => void;
}

export default function ProcessRefundModal({
  isOpen,
  onClose,
  invoice,
  onConfirmRefund,
  triggerToast
}: ProcessRefundModalProps) {
  const [refundAmount, setRefundAmount] = useState<string>(invoice ? String(invoice.paidAmount) : '0');
  const [reason, setReason] = useState('Guest requested cancellation due to travel schedule change.');
  const [refundMode, setRefundMode] = useState('Original Payment Source (Instant Gateway Reversal)');

  React.useEffect(() => {
    if (invoice) {
      setRefundAmount(String(invoice.paidAmount));
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const amt = Number(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please enter a valid refund amount');
      return;
    }

    onConfirmRefund(invoice.id, amt, reason);
    triggerToast(`Credit Note generated. ₹${new Intl.NumberFormat('en-IN').format(amt)} refunded for ${invoice.invoiceNumber}`);
    onClose();
  };

  if (!isOpen || !invoice) return null;

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-950 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Process Refund &amp; Credit Note</h3>
              <p className="text-[11px] text-rose-200/80">{invoice.invoiceNumber} • {invoice.guestName}</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-800">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Statutory GST Credit Note</span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Refunds generate a formal Section 34 GST Credit Note. Output GST liability will adjust automatically in GSTR-1.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Refund Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                max={invoice.paidAmount}
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold text-rose-950 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Refund Reason / Dispute Summary *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Refund Destination
            </label>
            <select
              value={refundMode}
              onChange={(e) => setRefundMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="Original Payment Source">Original Payment Source (UPI / Card Reversal)</option>
              <option value="Direct Bank Transfer (NEFT/RTGS)">Direct Bank Transfer (NEFT/RTGS)</option>
              <option value="Resort Credit Voucher">ResortDesk Credit Voucher (Valid 1 Year)</option>
            </select>
          </div>

          {/* Footer */}
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-md shadow-rose-900/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Authorize Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
