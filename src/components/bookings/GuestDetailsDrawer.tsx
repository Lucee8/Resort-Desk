import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  CheckCircle2,
  CreditCard,
  ArrowRightLeft,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  FileText,
  Upload,
  Ban,
  User,
} from 'lucide-react';
import { Booking, RoomUnit } from '../../types';
import {
  formatFullDate,
  formatINR,
  getPropertyBillingGSTSettings,
  isRoomAvailableForRange,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';
import { uploadGuestIdDocument } from '../../services/bookingsService';

interface GuestDetailsDrawerProps {
  booking: Booking;
  rooms: RoomUnit[];
  allBookings: Booking[];
  onClose: () => void;
  onCheckIn: (booking: Booking) => Promise<void>;
  onCheckOut: (booking: Booking) => Promise<void>;
  onConfirmPending: (booking: Booking) => Promise<void>;
  onCancelBooking: (booking: Booking) => Promise<void>;
  onMoveRoom: (booking: Booking, targetRoom: RoomUnit) => Promise<void>;
  onOpenPaymentModal: (booking: Booking) => void;
  onOpenInvoiceModal: (booking: Booking, mode?: 'invoice' | 'voucher') => void;
  onSendWhatsApp: (booking: Booking) => void;
  onUpdateNotes: (booking: Booking, noteText: string) => Promise<void>;
  onAttachIdDocument: (booking: Booking, downloadUrl: string) => Promise<void>;
  onEditBooking?: (booking: Booking) => void;
  onViewFullGuestCRM?: (booking: Booking) => void;
}

export default function GuestDetailsDrawer({
  booking,
  rooms,
  allBookings,
  onClose,
  onCheckIn,
  onCheckOut,
  onConfirmPending,
  onCancelBooking,
  onMoveRoom,
  onOpenPaymentModal,
  onOpenInvoiceModal,
  onSendWhatsApp,
  onUpdateNotes,
  onAttachIdDocument,
  onEditBooking,
  onViewFullGuestCRM,
}: GuestDetailsDrawerProps) {
  const [showMoveRoomPicker, setShowMoveRoomPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(
    booking.conciergeRequest || booking.notes[0] || ''
  );
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setNoteDraft(booking.conciergeRequest || booking.notes[0] || '');
    setEditingNote(false);
    setShowMoveRoomPicker(false);
    setShowMoreMenu(false);
    setActionError(null);
  }, [booking.id, booking.conciergeRequest, booking.notes]);

  const gstSettings = getPropertyBillingGSTSettings();
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  const advancePaid = booking.advancePaid ?? (booking.paymentStatus === 'Paid' ? booking.amount : 0);
  const balanceDue = Math.max(0, booking.balanceDue ?? booking.amount - advancePaid);
  const gstRate = booking.gstRateApplied ?? gstSettings.defaultGstRate;
  const sacCode = booking.sacCode ?? '996311';

  const availableTargetRooms = rooms.filter(
    (r) =>
      r.id !== booking.roomId &&
      r.roomName !== booking.roomNumber &&
      isRoomAvailableForRange(r, allBookings, checkInISO, checkOutISO, booking.id)
  );

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setActionError(null);
    setBusyAction(key);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUploadId = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runAction('upload-id', async () => {
      const url = await uploadGuestIdDocument(booking.guestId || booking.id, file);
      await onAttachIdDocument(booking, url);
    });
  };

  return (
    <aside className="w-full xl:w-[390px] shrink-0 bg-white rounded-2xl border border-[#E9ECE9] shadow-sm flex flex-col overflow-hidden h-fit xl:sticky xl:top-4">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E9ECE9] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#004B38] shrink-0" />
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold text-[#17221F]">Guest Details &amp; Booking</h3>
            <p className="text-[10px] text-[#777F7B] font-medium truncate tabular-nums">
              Folio #{booking.folioNumber || booking.invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenInvoiceModal(booking, 'invoice')}
            title="Print Tax Invoice"
            className="p-1.5 rounded-lg text-[#777F7B] hover:text-[#17221F] hover:bg-[#F7F6F3] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Collapse drawer"
            className="p-1.5 rounded-lg text-[#777F7B] hover:text-[#17221F] hover:bg-[#F7F6F3] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="p-5 flex flex-col gap-4 max-h-[calc(100vh-210px)] overflow-y-auto">
        {actionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
            {actionError}
          </div>
        )}

        {/* Guest Header Card */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {booking.avatarUrl ? (
                <img
                  src={booking.avatarUrl}
                  alt={booking.guestName}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E9ECE9] shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#004B38] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {booking.avatar}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-base font-extrabold text-[#17221F] truncate">
                  {booking.guestName}
                </h4>
                <p className="text-[11px] font-medium text-[#777F7B] tabular-nums">
                  {booking.guestPhone}
                </p>
                <p className="text-[11px] font-medium text-[#777F7B] truncate">
                  {booking.guestEmail}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSendWhatsApp(booking)}
              title="Send WhatsApp Message"
              className="p-2 rounded-xl bg-[#B7F2DC]/50 text-[#004B38] hover:bg-[#B7F2DC] transition-colors shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Guest Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B7F2DC]/55 text-[#004B38] border border-[#004B38]/15">
              ★ {booking.membership || 'Guest'}
            </span>
            {booking.source && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {booking.source}
              </span>
            )}
            {booking.occasionTag && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200/70">
                🎉 {booking.occasionTag}
              </span>
            )}
          </div>
        </div>

        {/* STAY SCHEDULE */}
        <div className="border-t border-[#E9ECE9] pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B]">
              STAY SCHEDULE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#B7F2DC]/50 text-[#004B38] text-[10px] font-bold tabular-nums">
              {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} Total
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-[#777F7B]">Check-In</p>
              <p className="font-bold text-[#17221F] mt-0.5">{formatFullDate(checkInISO)}</p>
              <p className="text-[10px] text-[#777F7B]">From {booking.arrivalTime || '02:00 PM'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#777F7B]">Check-Out</p>
              <p className="font-bold text-[#17221F] mt-0.5">{formatFullDate(checkOutISO)}</p>
              <p className="text-[10px] text-[#777F7B]">Until {booking.checkoutTime || '11:00 AM'}</p>
            </div>
          </div>

          {/* Room Unit Card + Inline Move Room */}
          <div className="mt-3 p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#17221F] truncate">
                  {booking.roomNumber} · {booking.roomCategory}
                </p>
                <p className="text-[10px] text-[#777F7B] font-medium mt-0.5">
                  {booking.adults || 2} Adults
                  {booking.children
                    ? `, ${booking.children} Child${booking.childrenNotes ? ` (${booking.childrenNotes})` : ''}`
                    : ''}{' '}
                  · {booking.mealPlan || 'Room Only'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoveRoomPicker((v) => !v)}
                className="text-[11px] font-bold text-[#004B38] hover:underline shrink-0 cursor-pointer"
              >
                {showMoveRoomPicker ? 'Close' : 'Change'}
              </button>
            </div>

            {showMoveRoomPicker && (
              <div className="mt-2.5 pt-2.5 border-t border-[#E9ECE9] flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-[#777F7B] uppercase">
                  Move to Available Cottage / Villa
                </p>
                {availableTargetRooms.length === 0 ? (
                  <p className="text-[11px] text-rose-700 font-medium">
                    No other units are free for these dates.
                  </p>
                ) : (
                  availableTargetRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={busyAction === 'move-room'}
                      onClick={() =>
                        runAction('move-room', async () => {
                          await onMoveRoom(booking, r);
                          setShowMoveRoomPicker(false);
                        })
                      }
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-[#E9ECE9] hover:border-[#004B38] text-[11px] font-bold text-[#17221F] flex items-center justify-between cursor-pointer"
                    >
                      <span>
                        {r.roomName} · {r.categoryName}
                      </span>
                      <span className="text-[#004B38] tabular-nums">{formatINR(r.ratePerNight)}/N</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* BILLING & TAX INVOICE */}
        <div className="border-t border-[#E9ECE9] pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B]">
                BILLING &amp; TAX INVOICE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#004B38] text-white text-[9px] font-bold">
                GST {gstRate}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#777F7B]">SAC: {sacCode}</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            {booking.invoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-2 text-[#17221F]">
                <span className="text-[#777F7B] truncate">{item.description}</span>
                <span className="font-semibold tabular-nums shrink-0">
                  {formatINR(item.amount, true)}
                </span>
              </div>
            ))}
            <div className="flex justify-between gap-2 text-[#17221F]">
              <span className="text-[#777F7B]">
                Goods &amp; Services Tax (CGST {gstRate / 2}% + SGST {gstRate / 2}%)
              </span>
              <span className="font-semibold tabular-nums shrink-0">
                {formatINR(booking.invoice.cgst + booking.invoice.sgst + (booking.invoice.igst || 0), true)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-[#E9ECE9]">
            <span className="text-xs font-extrabold text-[#17221F]">Gross Total Amount</span>
            <span className="text-base font-extrabold text-[#17221F] tabular-nums">
              {formatINR(booking.amount, true)}
            </span>
          </div>

          {/* Advance Received */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-[#17221F]">Advance Received</p>
                <p className="text-[10px] text-[#777F7B]">
                  {booking.payments && booking.payments.length > 0
                    ? `${booking.payments[booking.payments.length - 1].method} (${
                        booking.payments[booking.payments.length - 1].referenceId || 'Verified'
                      })`
                    : 'No advance logged'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-emerald-700 tabular-nums">
              {formatINR(advancePaid, true)}
            </span>
          </div>

          {/* Balance Due */}
          <div className="mt-2 p-3 rounded-xl bg-[#FDF4EB] border border-amber-200/70 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                {balanceDue > 0 ? 'BALANCE DUE ON ARRIVAL' : 'FOLIO SETTLED'}
              </p>
              <p className="text-[10px] text-[#777F7B]">
                {balanceDue > 0 ? 'Collect via Card / UPI Terminal' : 'Zero outstanding balance'}
              </p>
            </div>
            <span className="text-sm font-extrabold text-[#17221F] tabular-nums">
              {formatINR(balanceDue, true)}
            </span>
          </div>
        </div>

        {/* CONCIERGE & GUEST REQUESTS */}
        <div className="border-t border-[#E9ECE9] pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#004B38]" />
              CONCIERGE &amp; GUEST REQUESTS
            </span>
            <button
              type="button"
              onClick={() => setEditingNote((v) => !v)}
              className="text-[10px] font-bold text-[#004B38] hover:underline cursor-pointer"
            >
              {editingNote ? 'Cancel' : 'Edit Note'}
            </button>
          </div>

          {editingNote ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="w-full rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] p-2.5 text-xs text-[#17221F] focus:outline-none focus:border-[#004B38]"
              />
              <button
                type="button"
                disabled={busyAction === 'save-note'}
                onClick={() =>
                  runAction('save-note', async () => {
                    await onUpdateNotes(booking, noteDraft);
                    setEditingNote(false);
                  })
                }
                className="self-end px-3 py-1.5 rounded-lg bg-[#004B38] text-white text-[11px] font-bold cursor-pointer"
              >
                {busyAction === 'save-note' ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-xs italic text-[#17221F] leading-relaxed">
              &ldquo;{booking.conciergeRequest || booking.notes[0] || 'No special concierge instructions recorded.'}&rdquo;
            </div>
          )}
        </div>

        {/* ID Verification */}
        <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck
              className={`w-4 h-4 shrink-0 ${
                booking.idVerificationStatus === 'Verified'
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#17221F] truncate">
                {booking.idProofType || 'Aadhaar Card'}{' '}
                {booking.idVerificationStatus || 'Pending'}
              </p>
              <p className="text-[10px] text-[#777F7B] truncate">
                {booking.idProofNumberMasked ? `ID: ${booking.idProofNumberMasked}` : 'Upload ID proof at check-in'}
              </p>
            </div>
          </div>

          <label className="px-2.5 py-1 rounded-lg bg-white border border-[#E9ECE9] text-[10px] font-bold text-[#004B38] hover:bg-[#B7F2DC]/30 cursor-pointer flex items-center gap-1 shrink-0">
            <Upload className="w-3 h-3" />
            <span>{busyAction === 'upload-id' ? 'Uploading...' : booking.idDocumentUrl ? 'Replace' : 'Upload'}</span>
            <input type="file" accept="image/*,.pdf" onChange={handleUploadId} className="hidden" />
          </label>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 border-t border-[#E9ECE9] bg-white flex flex-col gap-2 relative">
        <div className="grid grid-cols-2 gap-2">
          {booking.bookingStatus === 'Pending' ? (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runAction('confirm', () => onConfirmPending(booking))}
              className="py-2.5 px-3 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{busyAction === 'confirm' ? 'Confirming...' : 'Confirm Hold'}</span>
            </button>
          ) : booking.bookingStatus === 'Checked-in' ? (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runAction('checkout', () => onCheckOut(booking))}
              className="py-2.5 px-3 rounded-xl bg-[#003D2E] hover:bg-[#17221F] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{busyAction === 'checkout' ? 'Processing...' : 'Check-out Guest'}</span>
            </button>
          ) : booking.bookingStatus === 'Confirmed' ? (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runAction('checkin', () => onCheckIn(booking))}
              className="py-2.5 px-3 rounded-xl bg-[#003D2E] hover:bg-[#004B38] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{busyAction === 'checkin' ? 'Checking in...' : 'Check-in Guest'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenInvoiceModal(booking, 'invoice')}
              className="py-2.5 px-3 rounded-xl bg-[#17221F] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Invoice</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSendWhatsApp(booking)}
            className="py-2.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send WhatsApp</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onOpenPaymentModal(booking)}
            disabled={balanceDue === 0 || booking.bookingStatus === 'Cancelled'}
            className="py-2 px-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] hover:bg-[#E9ECE9]/60 disabled:opacity-50 text-[11px] font-bold text-[#17221F] flex items-center justify-center gap-1 cursor-pointer"
          >
            <CreditCard className="w-3 h-3" />
            <span>Record Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMoveRoomPicker((v) => !v)}
            disabled={booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Checked-out'}
            className="py-2 px-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] hover:bg-[#E9ECE9]/60 disabled:opacity-50 text-[11px] font-bold text-[#17221F] flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Move Room</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((v) => !v)}
              className="w-full py-2 px-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] hover:bg-[#E9ECE9]/60 text-[11px] font-bold text-[#17221F] flex items-center justify-center gap-1 cursor-pointer"
            >
              <MoreHorizontal className="w-3 h-3" />
              <span>More</span>
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-11 right-0 w-48 bg-white rounded-xl border border-[#E9ECE9] shadow-xl py-1.5 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenInvoiceModal(booking, 'invoice');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F7F6F3] font-semibold text-[#17221F] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#004B38]" />
                  <span>View Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenInvoiceModal(booking, 'voucher');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F7F6F3] font-semibold text-[#17221F] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#004B38]" />
                  <span>Booking Voucher</span>
                </button>
                {onEditBooking && booking.bookingStatus !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onEditBooking(booking);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#F7F6F3] font-semibold text-[#17221F] flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#004B38]" />
                    <span>Edit Dates / Stay</span>
                  </button>
                )}
                {onViewFullGuestCRM && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onViewFullGuestCRM(booking);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#F7F6F3] font-semibold text-[#17221F] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#004B38]" />
                    <span>Open Guest CRM</span>
                  </button>
                )}
                {booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Checked-out' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      void onCancelBooking(booking);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 font-semibold text-rose-700 flex items-center gap-2 cursor-pointer border-t border-[#E9ECE9] mt-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
