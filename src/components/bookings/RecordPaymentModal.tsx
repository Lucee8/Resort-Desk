import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Booking, BookingPaymentMethod } from '../../types';
import { formatINR } from '../../utils/bookingUtils';

interface RecordPaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirmPayment: (
    booking: Booking,
    amount: number,
    method: BookingPaymentMethod,
    referenceId: string
  ) => Promise<void>;
}

const PAYMENT_MODES: BookingPaymentMethod[] = ['UPI / GPay', 'Cash', 'Card', 'NEFT / IMPS'];

export default function RecordPaymentModal({
  booking,
  onClose,
  onConfirmPayment,
}: RecordPaymentModalProps) {
  const currentAdvance = booking.advancePaid ?? (booking.paymentStatus === 'Paid' ? booking.amount : 0);
  const currentBalance = Math.max(0, booking.balanceDue ?? booking.amount - currentAdvance);

  const [amountStr, setAmountStr] = useState(String(currentBalance > 0 ? currentBalance : 0));
  const [method, setMethod] = useState<BookingPaymentMethod>('UPI / GPay');
  const [referenceId, setReferenceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsedAmount = Number(amountStr) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than ₹0.');
      return;
    }
    if (parsedAmount > currentBalance && currentBalance > 0) {
      setErrorMsg(`Amount cannot exceed remaining balance of ${formatINR(currentBalance)}.`);
      return;
    }
    if (method !== 'Cash' && !referenceId.trim()) {
      setErrorMsg(`Please enter a valid transaction / UTR reference for ${method}.`);
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmPayment(booking, parsedAmount, method, referenceId.trim());
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payment in Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17221F]/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#004B38] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-[#B7F2DC]" />
            <div>
              <h3 className="text-sm font-bold leading-tight">Record Payment</h3>
              <p className="text-[11px] text-[#B7F2DC]">
                {booking.guestName} · {booking.folioNumber || booking.invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Summary Box */}
          <div className="bg-[#F7F6F3] border border-[#E9ECE9] rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-semibold text-[#777F7B]">Gross Total</p>
              <p className="text-xs font-extrabold text-[#17221F] tabular-nums mt-0.5">
                {formatINR(booking.amount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#777F7B]">Paid So Far</p>
              <p className="text-xs font-extrabold text-emerald-700 tabular-nums mt-0.5">
                {formatINR(currentAdvance)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#777F7B]">Balance Due</p>
              <p className="text-xs font-extrabold text-amber-800 tabular-nums mt-0.5">
                {formatINR(currentBalance)}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Amount Collected (INR)
            </label>
            <input
              type="number"
              min={1}
              max={currentBalance > 0 ? currentBalance : undefined}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-sm font-extrabold text-[#17221F] tabular-nums focus:outline-none focus:border-[#004B38] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    method === m
                      ? 'bg-[#004B38] text-white border-[#004B38]'
                      : 'bg-white text-[#17221F] border-[#E9ECE9] hover:bg-[#F7F6F3]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Transaction / UTR Reference{' '}
              {method === 'Cash' ? '(Optional for Cash)' : '(Required)'}
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder={
                method === 'Cash'
                  ? 'e.g. Counter Receipt #104'
                  : 'e.g. UPI Ref 429910488 or Auth Code'
              }
              required={method !== 'Cash'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-medium text-[#17221F] focus:outline-none focus:border-[#004B38] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-[#E9ECE9] text-xs font-bold text-[#777F7B] hover:bg-[#F7F6F3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || currentBalance === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : `Record ${formatINR(parsedAmount)}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
