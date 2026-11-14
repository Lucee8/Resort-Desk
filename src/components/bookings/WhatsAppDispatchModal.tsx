import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Booking } from '../../types';
import {
  buildBookingVoucherMessage,
  buildWhatsAppLink,
  formatFullDate,
  formatINR,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';
import {
  CloudDispatchResponse,
  sendWhatsAppViaCloudAPI,
  WhatsAppCloudMessageType,
} from '../../services/messagingService';

interface WhatsAppDispatchModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function WhatsAppDispatchModal({
  booking,
  onClose,
}: WhatsAppDispatchModalProps) {
  const [messageType, setMessageType] =
    useState<WhatsAppCloudMessageType>('booking_confirmation');
  const [messageText, setMessageText] = useState(() =>
    buildBookingVoucherMessage(booking)
  );
  const [copied, setCopied] = useState(false);
  const [sendingCloud, setSendingCloud] = useState(false);
  const [cloudResult, setCloudResult] = useState<CloudDispatchResponse | null>(null);

  const waUrl = buildWhatsAppLink(booking.guestPhone, messageText);
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  const balanceDue = Math.max(
    0,
    booking.balanceDue ?? booking.amount - (booking.advancePaid || 0)
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSendCloudAPI = async () => {
    setSendingCloud(true);
    setCloudResult(null);
    const res = await sendWhatsAppViaCloudAPI({
      messageType,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      roomNumber: booking.roomNumber,
      bookingId: booking.id,
      bookingCode: booking.bookingCode || booking.id,
      invoiceNumber: booking.folioNumber || booking.invoice.invoiceNumber,
      templateParams: [
        booking.guestName,
        booking.bookingCode || booking.id,
        booking.roomNumber,
        formatFullDate(checkInISO),
        formatFullDate(checkOutISO),
        formatINR(balanceDue),
      ],
      fallbackText: messageText,
    });
    setCloudResult(res);
    setSendingCloud(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17221F]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-[#004B38] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-[#B7F2DC]" />
            <div>
              <h3 className="text-sm font-bold">Dispatch Guest WhatsApp</h3>
              <p className="text-[11px] text-[#B7F2DC]">
                {booking.guestName} · {booking.guestPhone || 'No phone on file'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Approved Meta Template Purpose
            </label>
            <select
              value={messageType}
              onChange={(e) =>
                setMessageType(e.target.value as WhatsAppCloudMessageType)
              }
              className="w-full rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] px-3 py-2 text-xs font-semibold text-[#17221F] focus:outline-none focus:border-[#004B38]"
            >
              <option value="booking_confirmation">Booking Confirmation</option>
              <option value="booking_voucher">Booking Stay Voucher</option>
              <option value="payment_confirmation">Payment Confirmation</option>
              <option value="checkin_reminder">Check-in Reminder</option>
              <option value="checkout_reminder">Checkout Reminder</option>
              <option value="payment_reminder">Outstanding Payment Reminder</option>
              <option value="review_request">Post-Stay Google Review Request</option>
            </select>
          </div>

          {cloudResult ? (
            <div
              className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                cloudResult.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {cloudResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {cloudResult.ok
                    ? 'Meta WhatsApp Cloud API Dispatch Confirmed'
                    : cloudResult.status === 'needs-credentials'
                      ? 'Meta Cloud API Secrets Not Configured'
                      : cloudResult.status === 'needs-deployment'
                        ? 'Cloud Function Not Deployed Yet'
                        : 'WhatsApp Cloud API Dispatch Failed'}
                </p>
                <p className="mt-0.5 leading-relaxed">{cloudResult.message}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-[11px] text-[#17221F] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#004B38] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Meta WhatsApp Cloud API + Manual Fallback</p>
                <p className="text-[#777F7B] mt-0.5">
                  Uses the secure <code className="font-mono">sendWhatsAppMessage</code> Firebase Cloud Function in <code className="font-mono">asia-south1</code> with delivery status tracking, or launches WhatsApp Web directly below.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Message Preview (Editable for wa.me Fallback)
            </label>
            <textarea
              rows={7}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/50 p-3 text-xs text-[#17221F] leading-relaxed focus:outline-none focus:border-[#004B38]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={sendingCloud || !booking.guestPhone}
              onClick={handleSendCloudAPI}
              className="w-full py-2.5 px-4 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {sendingCloud ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>
                {sendingCloud
                  ? 'Sending via Cloud API...'
                  : 'Send via Meta WhatsApp Cloud API'}
              </span>
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] text-xs font-bold text-[#17221F] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in WhatsApp (wa.me)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
