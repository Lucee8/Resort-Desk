export type ResortEmailTemplateType =
  | 'booking_confirmation'
  | 'booking_voucher'
  | 'gst_invoice'
  | 'payment_receipt'
  | 'booking_cancellation'
  | 'checkin_info'
  | 'checkout_info';

export interface EmailTemplatePayload {
  templateType: ResortEmailTemplateType;
  guestName: string;
  guestEmail: string;
  bookingCode?: string;
  folioNumber?: string;
  invoiceNumber?: string;
  roomNumber?: string;
  roomCategory?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  nights?: number;
  totalAmount?: number;
  advancePaid?: number;
  balanceDue?: number;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  receiptNumber?: string;
  gstRate?: number;
  sacCode?: string;
  taxableSubtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  refundAmount?: number;
  cancellationReason?: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyGstin?: string;
  supportPhone?: string;
  supportEmail?: string;
  wifiNetwork?: string;
  wifiPassword?: string;
}

function formatINR(amount?: number): string {
  const value = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapLayout(
  title: string,
  badge: string,
  bodyHtml: string,
  payload: EmailTemplatePayload
): string {
  const propertyName = escapeHtml(payload.propertyName || 'Mykonos Cottage, Tarkarli');
  const propertyAddress = escapeHtml(
    payload.propertyAddress || 'Tarkarli Beach Road, Malvan, Sindhudurg, Maharashtra - 416606'
  );
  const supportPhone = escapeHtml(payload.supportPhone || '+91 94224 31800');
  const supportEmail = escapeHtml(payload.supportEmail || 'desk@mykonostarkarli.in');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#17221F;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
          <tr>
            <td style="background:#0C4033;padding:24px 28px;color:#FFFFFF;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#B7F2DC;">${escapeHtml(badge)}</div>
              <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:700;color:#FFFFFF;">${escapeHtml(title)}</h1>
              <div style="margin-top:4px;font-size:12px;color:#D1FAE5;">${propertyName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 28px;font-size:14px;line-height:1.6;color:#1F2937;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#F8FAFC;padding:18px 28px;border-top:1px solid #E5E7EB;font-size:12px;color:#64748B;">
              <div style="font-weight:700;color:#0C4033;">${propertyName}</div>
              <div>${propertyAddress}</div>
              <div style="margin-top:4px;">Front Desk: ${supportPhone} &bull; ${supportEmail}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderEmailTemplate(payload: EmailTemplatePayload): {
  subject: string;
  html: string;
  text: string;
} {
  const guestName = escapeHtml(payload.guestName || 'Valued Guest');
  const bookingRef = escapeHtml(payload.bookingCode || payload.folioNumber || 'MYK-RES');
  const roomLabel = escapeHtml(
    [payload.roomNumber, payload.roomCategory].filter(Boolean).join(' · ') || 'Cottage'
  );
  const checkIn = escapeHtml(payload.checkInDate || 'Scheduled Check-in');
  const checkOut = escapeHtml(payload.checkOutDate || 'Scheduled Check-out');
  const gstin = escapeHtml(payload.propertyGstin || '27AABCM4821K1Z4');

  switch (payload.templateType) {
    case 'booking_confirmation': {
      const subject = `Reservation Confirmed (${bookingRef}) · Mykonos Cottage, Tarkarli`;
      const html = wrapLayout(
        'Your Coastal Stay Is Confirmed',
        'RESERVATION CONFIRMED',
        `<p>Namaste <strong>${guestName}</strong>,</p>
         <p>We are delighted to confirm your upcoming stay at <strong>Mykonos Cottage, Tarkarli</strong>.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#F7F6F3;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Booking ID</strong></td><td align="right">${bookingRef}</td></tr>
           <tr><td><strong>Accommodation</strong></td><td align="right">${roomLabel}</td></tr>
           <tr><td><strong>Check-in</strong></td><td align="right">${checkIn} (${escapeHtml(payload.checkInTime || '02:00 PM')})</td></tr>
           <tr><td><strong>Check-out</strong></td><td align="right">${checkOut} (${escapeHtml(payload.checkOutTime || '11:00 AM')})</td></tr>
           <tr><td><strong>Total Tariff (incl. GST)</strong></td><td align="right"><strong>${formatINR(payload.totalAmount)}</strong></td></tr>
           <tr><td><strong>Advance Paid</strong></td><td align="right">${formatINR(payload.advancePaid)}</td></tr>
           <tr><td><strong>Balance Due</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>
         <p>Please carry a valid government photo ID (Aadhaar / Passport / Driving Licence) for check-in verification.</p>`,
        payload
      );
      const text = `Namaste ${payload.guestName}, your booking ${payload.bookingCode || ''} at Mykonos Cottage, Tarkarli is confirmed. Room: ${payload.roomNumber || ''}. Check-in: ${payload.checkInDate || ''}, Check-out: ${payload.checkOutDate || ''}. Total: ${formatINR(payload.totalAmount)}, Balance Due: ${formatINR(payload.balanceDue)}.`;
      return { subject, html, text };
    }

    case 'booking_voucher': {
      const subject = `Booking Voucher ${bookingRef} · Mykonos Cottage, Tarkarli`;
      const html = wrapLayout(
        'Official Check-in Voucher',
        'STAY VOUCHER',
        `<p>Dear <strong>${guestName}</strong>,</p>
         <p>Present this booking voucher at the Mykonos Cottage reception desk on arrival.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Voucher / Booking Ref</strong></td><td align="right">${bookingRef}</td></tr>
           <tr><td><strong>Cottage / Villa</strong></td><td align="right">${roomLabel}</td></tr>
           <tr><td><strong>Nights</strong></td><td align="right">${escapeHtml(payload.nights || 1)} Night(s)</td></tr>
           <tr><td><strong>Check-in</strong></td><td align="right">${checkIn} · ${escapeHtml(payload.checkInTime || '02:00 PM')}</td></tr>
           <tr><td><strong>Check-out</strong></td><td align="right">${checkOut} · ${escapeHtml(payload.checkOutTime || '11:00 AM')}</td></tr>
           <tr><td><strong>Balance on Arrival</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>
         <p>Address: Tarkarli Beach Road, Malvan, Sindhudurg, Maharashtra 416606.</p>`,
        payload
      );
      const text = `Mykonos Cottage Stay Voucher (${payload.bookingCode || ''}) for ${payload.guestName}. Room: ${payload.roomNumber || ''}, Check-in: ${payload.checkInDate || ''}, Check-out: ${payload.checkOutDate || ''}, Balance: ${formatINR(payload.balanceDue)}.`;
      return { subject, html, text };
    }

    case 'gst_invoice': {
      const invNo = escapeHtml(payload.invoiceNumber || payload.folioNumber || bookingRef);
      const subject = `GST Tax Invoice ${invNo} · Mykonos Cottage, Tarkarli`;
      const isIgst = Number(payload.igst || 0) > 0;
      const html = wrapLayout(
        `Tax Invoice ${invNo}`,
        `GSTIN: ${gstin}`,
        `<p>Dear <strong>${guestName}</strong>,</p>
         <p>Thank you for staying with us at Mykonos Cottage, Tarkarli. Please find your GST tax invoice summary below:</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Invoice Number</strong></td><td align="right">${invNo}</td></tr>
           <tr><td><strong>Accommodation</strong></td><td align="right">${roomLabel}</td></tr>
           <tr><td><strong>SAC Code</strong></td><td align="right">${escapeHtml(payload.sacCode || '996311')}</td></tr>
           <tr><td><strong>Taxable Value</strong></td><td align="right">${formatINR(payload.taxableSubtotal)}</td></tr>
           ${
             isIgst
               ? `<tr><td><strong>IGST (${escapeHtml(payload.gstRate || 12)}%)</strong></td><td align="right">${formatINR(payload.igst)}</td></tr>`
               : `<tr><td><strong>CGST (${escapeHtml((payload.gstRate || 12) / 2)}%)</strong></td><td align="right">${formatINR(payload.cgst)}</td></tr>
                  <tr><td><strong>SGST (${escapeHtml((payload.gstRate || 12) / 2)}%)</strong></td><td align="right">${formatINR(payload.sgst)}</td></tr>`
           }
           <tr><td><strong>Invoice Total</strong></td><td align="right"><strong>${formatINR(payload.totalAmount)}</strong></td></tr>
           <tr><td><strong>Amount Paid</strong></td><td align="right">${formatINR(payload.advancePaid)}</td></tr>
           <tr><td><strong>Balance Due</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>`,
        payload
      );
      const text = `GST Tax Invoice ${payload.invoiceNumber || ''} for ${payload.guestName}. SAC ${payload.sacCode || '996311'}. Total: ${formatINR(payload.totalAmount)}, Paid: ${formatINR(payload.advancePaid)}, Balance: ${formatINR(payload.balanceDue)}. GSTIN: ${payload.propertyGstin || '27AABCM4821K1Z4'}.`;
      return { subject, html, text };
    }

    case 'payment_receipt': {
      const receiptNo = escapeHtml(payload.receiptNumber || `RCP-${Date.now().toString().slice(-5)}`);
      const subject = `Payment Receipt ${receiptNo} · Mykonos Cottage, Tarkarli`;
      const html = wrapLayout(
        'Payment Received — Thank You',
        `RECEIPT ${receiptNo}`,
        `<p>Namaste <strong>${guestName}</strong>,</p>
         <p>We have received your payment for reservation <strong>${bookingRef}</strong>.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Receipt Number</strong></td><td align="right">${receiptNo}</td></tr>
           <tr><td><strong>Amount Received</strong></td><td align="right"><strong>${formatINR(payload.paymentAmount)}</strong></td></tr>
           <tr><td><strong>Payment Mode</strong></td><td align="right">${escapeHtml(payload.paymentMethod || 'UPI / Card')}</td></tr>
           <tr><td><strong>Reference / UTR</strong></td><td align="right">${escapeHtml(payload.paymentReference || 'Verified')}</td></tr>
           <tr><td><strong>Remaining Folio Balance</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>`,
        payload
      );
      const text = `Payment Receipt ${payload.receiptNumber || ''} for ${payload.guestName}. Received: ${formatINR(payload.paymentAmount)} via ${payload.paymentMethod || 'UPI'}. Ref: ${payload.paymentReference || 'Verified'}. Remaining Balance: ${formatINR(payload.balanceDue)}.`;
      return { subject, html, text };
    }

    case 'booking_cancellation': {
      const subject = `Reservation Cancelled (${bookingRef}) · Mykonos Cottage, Tarkarli`;
      const html = wrapLayout(
        'Reservation Cancellation Confirmation',
        'CANCELLED',
        `<p>Dear <strong>${guestName}</strong>,</p>
         <p>Your reservation <strong>${bookingRef}</strong> (${roomLabel}) for ${checkIn} – ${checkOut} has been cancelled as requested.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#FFF1F2;border:1px solid #FECDD3;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Booking ID</strong></td><td align="right">${bookingRef}</td></tr>
           <tr><td><strong>Reason</strong></td><td align="right">${escapeHtml(payload.cancellationReason || 'Guest request')}</td></tr>
           <tr><td><strong>Refund Processed / Approved</strong></td><td align="right"><strong>${formatINR(payload.refundAmount)}</strong></td></tr>
         </table>
         <p>Please allow 3–5 business days for source-mode refunds to reflect on your bank statement.</p>`,
        payload
      );
      const text = `Your reservation ${payload.bookingCode || ''} at Mykonos Cottage, Tarkarli has been cancelled. Refund amount: ${formatINR(payload.refundAmount)}.`;
      return { subject, html, text };
    }

    case 'checkin_info': {
      const subject = `Check-in Guide for Your Stay Today (${bookingRef}) · Mykonos Cottage`;
      const html = wrapLayout(
        'Welcome to Tarkarli — Check-in Details',
        'CHECK-IN GUIDE',
        `<p>Namaste <strong>${guestName}</strong>,</p>
         <p>Your cottage <strong>${roomLabel}</strong> is being prepared for your arrival today.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#F7F6F3;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Check-in Time</strong></td><td align="right">${escapeHtml(payload.checkInTime || '02:00 PM')}</td></tr>
           <tr><td><strong>Cottage Assigned</strong></td><td align="right">${roomLabel}</td></tr>
           <tr><td><strong>Wi-Fi Network</strong></td><td align="right">${escapeHtml(payload.wifiNetwork || 'Mykonos_Tarkarli_Guest')}</td></tr>
           <tr><td><strong>Balance Due at Desk</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>
         <p>Directions: Tarkarli Beach Road, Malvan, Sindhudurg 416606. Call our desk for buggy assistance or airport/station transfers.</p>`,
        payload
      );
      const text = `Welcome ${payload.guestName}! Check-in today at Mykonos Cottage, Tarkarli from ${payload.checkInTime || '02:00 PM'}. Cottage: ${payload.roomNumber || ''}. Balance due: ${formatINR(payload.balanceDue)}.`;
      return { subject, html, text };
    }

    case 'checkout_info': {
      const subject = `Checkout Summary & Thank You (${bookingRef}) · Mykonos Cottage`;
      const html = wrapLayout(
        'Thank You for Staying With Us',
        'CHECKOUT SUMMARY',
        `<p>Dear <strong>${guestName}</strong>,</p>
         <p>We hope you enjoyed your coastal escape at <strong>Mykonos Cottage, Tarkarli</strong>.</p>
         <table width="100%" cellspacing="0" cellpadding="8" style="background:#F7F6F3;border-radius:12px;margin:16px 0;font-size:13px;">
           <tr><td><strong>Standard Check-out</strong></td><td align="right">${escapeHtml(payload.checkOutTime || '11:00 AM')}</td></tr>
           <tr><td><strong>Total Stay Folio</strong></td><td align="right">${formatINR(payload.totalAmount)}</td></tr>
           <tr><td><strong>Paid</strong></td><td align="right">${formatINR(payload.advancePaid)}</td></tr>
           <tr><td><strong>Pending Settlement</strong></td><td align="right"><strong>${formatINR(payload.balanceDue)}</strong></td></tr>
         </table>
         <p>Safe travels ahead! We would be grateful if you shared your experience on Google Reviews.</p>`,
        payload
      );
      const text = `Thank you for staying at Mykonos Cottage, Tarkarli, ${payload.guestName}. Check-out time: ${payload.checkOutTime || '11:00 AM'}. Pending settlement: ${formatINR(payload.balanceDue)}.`;
      return { subject, html, text };
    }
  }
}
