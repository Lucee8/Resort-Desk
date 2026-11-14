import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  CheckCircle2,
  FileText,
  Mail,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Booking } from '../../types';
import {
  buildBookingVoucherMessage,
  buildWhatsAppLink,
  formatFullDate,
  formatINR,
  getPropertyBillingGSTSettings,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';
import { initialResortProfile } from '../../data/settingsData';
import {
  CloudDispatchResponse,
  sendEmailViaCloudFunction,
} from '../../services/messagingService';

interface PrintableInvoiceVoucherModalProps {
  booking: Booking;
  initialMode?: 'invoice' | 'voucher';
  onClose: () => void;
}

export default function PrintableInvoiceVoucherModal({
  booking,
  initialMode = 'invoice',
  onClose,
}: PrintableInvoiceVoucherModalProps) {
  const [docMode, setDocMode] = useState<'invoice' | 'voucher'>(initialMode);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<CloudDispatchResponse | null>(null);
  const gstSettings = getPropertyBillingGSTSettings();
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  const advancePaid = booking.advancePaid ?? (booking.paymentStatus === 'Paid' ? booking.amount : 0);
  const balanceDue = Math.max(0, booking.balanceDue ?? booking.amount - advancePaid);
  const waUrl = buildWhatsAppLink(booking.guestPhone, buildBookingVoucherMessage(booking));

  const handleEmailDocument = async () => {
    if (!booking.guestEmail) {
      setEmailStatus({
        ok: false,
        status: 'error',
        message: 'No guest email address is recorded on this reservation.',
      });
      return;
    }
    setSendingEmail(true);
    setEmailStatus(null);
    const res = await sendEmailViaCloudFunction({
      templateType: docMode === 'invoice' ? 'gst_invoice' : 'booking_voucher',
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      bookingId: booking.id,
      bookingCode: booking.bookingCode || booking.id,
      folioNumber: booking.folioNumber || booking.invoice.invoiceNumber,
      invoiceNumber: booking.invoice.invoiceNumber,
      roomNumber: booking.roomNumber,
      roomCategory: booking.roomCategory,
      checkInDate: formatFullDate(checkInISO),
      checkOutDate: formatFullDate(checkOutISO),
      checkInTime: booking.arrivalTime || '02:00 PM',
      checkOutTime: booking.checkoutTime || '11:00 AM',
      nights: booking.nights,
      totalAmount: booking.amount,
      advancePaid,
      balanceDue,
      gstRate: booking.gstRateApplied ?? gstSettings.defaultGstRate,
      sacCode: booking.sacCode ?? '996311',
      taxableSubtotal: booking.invoice.subtotal,
      cgst: booking.invoice.cgst,
      sgst: booking.invoice.sgst,
    });
    setEmailStatus(res);
    setSendingEmail(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17221F]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-[#F7F6F3] rounded-2xl border border-[#E9ECE9] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:border-0 print:shadow-none print:bg-white">
        {/* Top Modal Controls (hidden on print) */}
        <div className="bg-white border-b border-[#E9ECE9] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2 bg-[#F7F6F3] p-1 rounded-xl border border-[#E9ECE9]">
            <button
              type="button"
              onClick={() => setDocMode('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                docMode === 'invoice' ? 'bg-[#004B38] text-white' : 'text-[#777F7B] hover:text-[#17221F]'
              }`}
            >
              GST Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => setDocMode('voucher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                docMode === 'voucher' ? 'bg-[#004B38] text-white' : 'text-[#777F7B] hover:text-[#17221F]'
              }`}
            >
              Booking Voucher
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={sendingEmail}
              onClick={handleEmailDocument}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {sendingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>{sendingEmail ? 'Emailing...' : 'Email Guest'}</span>
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E9ECE9] text-[#777F7B] hover:text-[#17221F] hover:bg-[#F7F6F3] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {emailStatus && (
          <div
            className={`mx-4 sm:mx-8 mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 print:hidden ${
              emailStatus.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {emailStatus.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <span>{emailStatus.message}</span>
          </div>
        )}

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-4">
          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-6 sm:p-8 shadow-2xs print:border-0 print:shadow-none">
            {/* Property Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E9ECE9] pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#004B38] text-white flex items-center justify-center font-serif font-bold text-xl">
                  M
                </div>
                <div>
                  <h2 className="text-lg font-extrabold font-serif text-[#17221F]">
                    Mykonos Cottage, Tarkarli
                  </h2>
                  <p className="text-[11px] text-[#777F7B] font-medium">
                    {initialResortProfile.registeredAddress}, {initialResortProfile.city} -{' '}
                    {initialResortProfile.pincode}
                  </p>
                  <p className="text-[11px] text-[#17221F] font-semibold mt-0.5">
                    GSTIN: {gstSettings.gstin || initialResortProfile.gstin} ·{' '}
                    {initialResortProfile.supportPhone}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B7F2DC]/60 text-[#004B38]">
                  <FileText className="w-3 h-3" />
                  {docMode === 'invoice' ? 'Tax Invoice' : 'Confirmation Voucher'}
                </span>
                <p className="text-sm font-extrabold text-[#17221F] mt-2 tabular-nums">
                  {booking.folioNumber || booking.invoice.invoiceNumber}
                </p>
                <p className="text-[11px] text-[#777F7B]">
                  Booking ID: {booking.bookingCode || booking.id} · Issued: {booking.invoice.date}
                </p>
              </div>
            </div>

            {/* Guest & Stay Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#E9ECE9] text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#777F7B]">
                  Guest / Billed To
                </p>
                <p className="text-sm font-extrabold text-[#17221F] mt-1">{booking.guestName}</p>
                <p className="text-[#777F7B] mt-0.5">{booking.guestPhone}</p>
                <p className="text-[#777F7B]">{booking.guestEmail}</p>
                {booking.guestCity && <p className="text-[#777F7B]">{booking.guestCity}</p>}
              </div>

              <div className="bg-[#F7F6F3] rounded-xl p-3.5 border border-[#E9ECE9] grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#777F7B]">Check-In</p>
                  <p className="font-bold text-[#17221F] mt-0.5">{formatFullDate(checkInISO)}</p>
                  <p className="text-[10px] text-[#777F7B]">{booking.arrivalTime || '02:00 PM'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#777F7B]">Check-Out</p>
                  <p className="font-bold text-[#17221F] mt-0.5">{formatFullDate(checkOutISO)}</p>
                  <p className="text-[10px] text-[#777F7B]">{booking.checkoutTime || '11:00 AM'}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#E9ECE9] flex items-center justify-between">
                  <span className="font-bold text-[#004B38]">
                    {booking.roomNumber} · {booking.roomCategory}
                  </span>
                  <span className="font-bold text-[#17221F] tabular-nums">
                    {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} · {booking.adults || 2}{' '}
                    Adults
                  </span>
                </div>
              </div>
            </div>

            {docMode === 'invoice' ? (
              <>
                {/* Itemized Billing Table */}
                <table className="w-full text-left text-xs my-6 border-collapse">
                  <thead>
                    <tr className="border-b border-[#E9ECE9] text-[10px] uppercase font-bold text-[#777F7B]">
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-center">SAC</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Rate</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECE9]/70">
                    {booking.invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-3 font-semibold text-[#17221F]">{item.description}</td>
                        <td className="py-3 text-center text-[#777F7B] font-mono text-[11px]">
                          {item.sacCode || booking.sacCode || '996311'}
                        </td>
                        <td className="py-3 text-center tabular-nums">{item.qty}</td>
                        <td className="py-3 text-right tabular-nums">{formatINR(item.price, true)}</td>
                        <td className="py-3 text-right font-bold text-[#17221F] tabular-nums">
                          {formatINR(item.amount, true)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tax & Totals */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-[#E9ECE9] pt-5">
                  <div className="text-xs text-[#777F7B] max-w-xs">
                    <p className="font-bold text-[#17221F] mb-1">Payments Recorded</p>
                    {booking.payments && booking.payments.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {booking.payments.map((p) => (
                          <p key={p.id} className="tabular-nums">
                            • {formatINR(p.amount)} via {p.method} (Ref: {p.referenceId || 'N/A'})
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p>No advance payments recorded yet.</p>
                    )}
                  </div>

                  <div className="w-full sm:w-72 flex flex-col gap-2 text-xs tabular-nums">
                    <div className="flex justify-between text-[#777F7B]">
                      <span>Taxable Subtotal</span>
                      <span className="font-bold text-[#17221F]">
                        {formatINR(booking.invoice.subtotal, true)}
                      </span>
                    </div>
                    {booking.invoice.igst && booking.invoice.igst > 0 ? (
                      <div className="flex justify-between text-[#777F7B]">
                        <span>IGST ({booking.gstRateApplied || gstSettings.defaultGstRate}%)</span>
                        <span className="font-semibold text-[#17221F]">
                          {formatINR(booking.invoice.igst, true)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-[#777F7B]">
                          <span>
                            CGST ({(booking.gstRateApplied || gstSettings.defaultGstRate) / 2}%)
                          </span>
                          <span className="font-semibold text-[#17221F]">
                            {formatINR(booking.invoice.cgst, true)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#777F7B]">
                          <span>
                            SGST ({(booking.gstRateApplied || gstSettings.defaultGstRate) / 2}%)
                          </span>
                          <span className="font-semibold text-[#17221F]">
                            {formatINR(booking.invoice.sgst, true)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#E9ECE9] text-sm font-extrabold text-[#17221F]">
                      <span>Gross Total Amount</span>
                      <span>{formatINR(booking.amount, true)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Advance Paid</span>
                      <span>-{formatINR(advancePaid, true)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 font-extrabold">
                      <span>Balance Due</span>
                      <span>{formatINR(balanceDue, true)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Voucher View */
              <div className="py-6 flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#B7F2DC]/30 border border-[#004B38]/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#004B38] shrink-0" />
                  <div>
                    <p className="font-extrabold text-[#003D2E] text-sm">
                      Reservation Status: {booking.bookingStatus}
                    </p>
                    <p className="text-[#17221F] mt-0.5">
                      Please present a valid Govt. Photo ID (Aadhaar / Passport / Driving License)
                      at reception during check-in.
                    </p>
                  </div>
                </div>

                {booking.conciergeRequest && (
                  <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9]">
                    <p className="text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                      Guest Requests &amp; Preferences
                    </p>
                    <p className="text-[#17221F] italic">&ldquo;{booking.conciergeRequest}&rdquo;</p>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-[#E9ECE9]">
                  <p className="text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                    Cancellation &amp; Resort Policy
                  </p>
                  <p className="text-[#777F7B] leading-relaxed">
                    {initialResortProfile.cancellationPolicy}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-[#E9ECE9] text-center text-[10px] text-[#777F7B]">
              Thank you for choosing Mykonos Cottage, Tarkarli · {initialResortProfile.primaryEmail}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
