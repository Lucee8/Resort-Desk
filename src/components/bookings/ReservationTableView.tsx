import React from 'react';
import { CheckCircle2, MessageSquare, FileText, CreditCard, Eye } from 'lucide-react';
import { Booking } from '../../types';
import { formatFullDate, formatINR, resolveBookingDatesISO } from '../../utils/bookingUtils';

interface ReservationTableViewProps {
  bookings: Booking[];
  selectedBookingId: string | null;
  onSelectBooking: (booking: Booking) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onOpenPayment: (booking: Booking) => void;
  onOpenInvoice: (booking: Booking) => void;
  onSendWhatsApp: (booking: Booking) => void;
}

export default function ReservationTableView({
  bookings,
  selectedBookingId,
  onSelectBooking,
  onCheckIn,
  onCheckOut,
  onOpenPayment,
  onOpenInvoice,
  onSendWhatsApp,
}: ReservationTableViewProps) {
  const statusBadge = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'Checked-in':
        return 'bg-[#003D2E] text-white border-[#003D2E]';
      case 'Confirmed':
        return 'bg-[#B7F2DC]/60 text-[#004B38] border-[#004B38]/20';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Checked-out':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9ECE9] bg-[#F7F6F3]/70 text-[10px] font-bold uppercase tracking-wider text-[#777F7B]">
              <th className="py-3 px-4">Guest &amp; ID</th>
              <th className="py-3 px-4">Room / Cottage</th>
              <th className="py-3 px-4">Check-In / Out</th>
              <th className="py-3 px-4 text-right">Total &amp; Balance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9ECE9]/70 text-xs">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#777F7B]">
                  No reservations match your active filters.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
                const advance = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
                const balance = Math.max(0, b.balanceDue ?? b.amount - advance);
                const isSelected = selectedBookingId === b.id;

                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#B7F2DC]/20' : 'hover:bg-[#F7F6F3]/60'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#004B38]/10 text-[#004B38] font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          {b.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#17221F] truncate">{b.guestName}</p>
                          <p className="text-[10px] text-[#777F7B] font-medium tabular-nums">
                            {b.bookingCode || b.id} · {b.guestPhone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#17221F]">{b.roomNumber}</p>
                      <p className="text-[10px] text-[#777F7B] font-medium">{b.roomCategory}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#17221F] tabular-nums">
                        {formatFullDate(checkInISO)} → {formatFullDate(checkOutISO)}
                      </p>
                      <p className="text-[10px] text-[#777F7B] font-medium tabular-nums">
                        {b.nights} {b.nights === 1 ? 'Night' : 'Nights'} · {b.adults || 2} Adults
                        {b.children ? `, ${b.children} Child` : ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <p className="font-extrabold text-[#17221F]">{formatINR(b.amount)}</p>
                      {balance > 0 ? (
                        <p className="text-[10px] font-bold text-amber-700">
                          Due: {formatINR(balance)}
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold text-emerald-700">Paid in Full</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                          b.bookingStatus
                        )}`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {(b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending') && (
                          <button
                            type="button"
                            onClick={() => onCheckIn(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#004B38] hover:bg-[#003D2E] text-white text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Check-in</span>
                          </button>
                        )}
                        {b.bookingStatus === 'Checked-in' && (
                          <button
                            type="button"
                            onClick={() => onCheckOut(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Check-out
                          </button>
                        )}
                        {balance > 0 && b.bookingStatus !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => onOpenPayment(b)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg border border-[#E9ECE9] bg-white hover:bg-[#F7F6F3] text-[#004B38] cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSendWhatsApp(b)}
                          title="Send WhatsApp"
                          className="p-1.5 rounded-lg border border-[#E9ECE9] bg-white hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(b)}
                          title="View Tax Invoice"
                          className="p-1.5 rounded-lg border border-[#E9ECE9] bg-white hover:bg-[#F7F6F3] text-[#17221F] cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectBooking(b)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-[#E9ECE9] bg-white hover:bg-[#F7F6F3] text-[#17221F] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
