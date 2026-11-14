import React, { useState } from 'react';
import { X, MessageSquare, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { Booking } from '../../types';
import {
  buildBookingVoucherMessage,
  buildWhatsAppLink,
  getPropertyWhatsAppSettings,
} from '../../utils/bookingUtils';

interface WhatsAppDispatchModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function WhatsAppDispatchModal({
  booking,
  onClose,
}: WhatsAppDispatchModalProps) {
  const waSettings = getPropertyWhatsAppSettings();
  const [messageText, setMessageText] = useState(() => buildBookingVoucherMessage(booking));
  const [copied, setCopied] = useState(false);

  const waUrl = buildWhatsAppLink(booking.guestPhone, messageText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17221F]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-[#004B38] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-[#B7F2DC]" />
            <div>
              <h3 className="text-sm font-bold">Send WhatsApp Confirmation</h3>
              <p className="text-[11px] text-[#B7F2DC]">
                {booking.guestName} · {booking.guestPhone}
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

        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-[11px] text-[#17221F] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#004B38] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Direct WhatsApp Web / App Launch (Safe Fallback)</p>
              <p className="text-[#777F7B] mt-0.5">
                {waSettings.status === 'Verified & Active'
                  ? 'No server-side Meta Cloud API webhook token is active in this browser session. Opening prefilled WhatsApp message directly so delivery is never misreported.'
                  : 'WhatsApp Cloud provider is not configured. Use the prefilled WhatsApp link below to send directly.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#17221F] mb-1.5">
              Message Preview (Editable)
            </label>
            <textarea
              rows={8}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/50 p-3 text-xs text-[#17221F] leading-relaxed focus:outline-none focus:border-[#004B38]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] text-xs font-bold text-[#17221F] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Message'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(onClose, 300)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
