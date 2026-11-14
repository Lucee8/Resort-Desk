import {
  BillingGSTSettings,
  Booking,
  BookingSourceChannel,
  MealPlanType,
  RoomUnit,
  WhatsAppSettingsConfig,
} from '../types';
import { initialBillingGSTSettings, initialWhatsAppConfig } from '../data/settingsData';

export const PROPERTY_SETTINGS_STORAGE_KEY = 'resortdesk_settings_v2';

/**
 * Formats an integer/number in Indian Rupees without trailing paise unless needed.
 */
export function formatINR(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/**
 * Local YYYY-MM-DD conversion without UTC timezone shift.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Nights = checkOut - checkIn (check-out exclusive). Minimum 0 if invalid.
 */
export function diffNights(checkInISO: string, checkOutISO: string): number {
  if (!checkInISO || !checkOutISO) return 0;
  const start = parseISODate(checkInISO);
  const end = parseISODate(checkOutISO);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay);
  return diff > 0 ? diff : 0;
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
}

export function formatFullDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRangeLabel(startISO: string, daysCount: number): string {
  const endISO = addDaysISO(startISO, Math.max(0, daysCount - 1));
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const startStr = start.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
  const endStr = end.toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}

/**
 * Normalizes a booking's checkIn/checkOut ISO dates even for legacy bookings using "Oct 14" format.
 */
export function resolveBookingDatesISO(booking: Booking): { checkInISO: string; checkOutISO: string } {
  if (booking.checkInDateISO && booking.checkOutDateISO) {
    return {
      checkInISO: booking.checkInDateISO,
      checkOutISO: booking.checkOutDateISO,
    };
  }
  const today = getTodayISO();
  const nights = Math.max(1, booking.nights || 1);
  // Attempt parsing "Oct 14" or similar in current year
  const currentYear = new Date().getFullYear();
  const parsed = Date.parse(`${booking.startDate} ${currentYear}`);
  if (!Number.isNaN(parsed)) {
    const startISO = toISODate(new Date(parsed));
    return {
      checkInISO: startISO,
      checkOutISO: addDaysISO(startISO, nights),
    };
  }
  return {
    checkInISO: today,
    checkOutISO: addDaysISO(today, nights),
  };
}

/**
 * Overlap check with check-out exclusive semantics:
 * A stay [aStart, aEnd) overlaps [bStart, bEnd) iff aStart < bEnd && aEnd > bStart.
 * Cancelled bookings do NOT block rooms.
 */
export function hasDateOverlap(
  aStartISO: string,
  aEndISO: string,
  bStartISO: string,
  bEndISO: string
): boolean {
  if (!aStartISO || !aEndISO || !bStartISO || !bEndISO) return false;
  return aStartISO < bEndISO && aEndISO > bStartISO;
}

export function isBookingOccupyingDate(booking: Booking, dateISO: string): boolean {
  if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Checked-out') {
    return false;
  }
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  return checkInISO <= dateISO && dateISO < checkOutISO;
}

export function isRoomMatch(booking: Booking, room: RoomUnit): boolean {
  if (booking.roomId && booking.roomId === room.id) return true;
  const bRoom = booking.roomNumber.toLowerCase().trim();
  const rNum = room.roomNumber.toLowerCase().trim();
  const rName = room.roomName.toLowerCase().trim();
  return bRoom === rName || bRoom === rNum || bRoom.includes(rNum);
}

export function getRoomConflict(
  room: RoomUnit,
  bookings: Booking[],
  checkInISO: string,
  checkOutISO: string,
  excludeBookingId?: string
): Booking | undefined {
  return bookings.find((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Checked-out') return false;
    if (!isRoomMatch(b, room)) return false;
    const { checkInISO: bStart, checkOutISO: bEnd } = resolveBookingDatesISO(b);
    return hasDateOverlap(checkInISO, checkOutISO, bStart, bEnd);
  });
}

export function isRoomAvailableForRange(
  room: RoomUnit,
  bookings: Booking[],
  checkInISO: string,
  checkOutISO: string,
  excludeBookingId?: string
): boolean {
  if (room.status === 'Maintenance') return false;
  return !getRoomConflict(room, bookings, checkInISO, checkOutISO, excludeBookingId);
}

/**
 * Loads live property BillingGST & WhatsApp settings from persisted Settings store,
 * falling back to defaults from settingsData.ts (never hardcoding GST rates in components).
 */
export function getPropertyBillingGSTSettings(): BillingGSTSettings {
  try {
    const raw = localStorage.getItem(PROPERTY_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.billingGst) {
        return parsed.billingGst as BillingGSTSettings;
      }
    }
  } catch {
    // fallback
  }
  return initialBillingGSTSettings;
}

export function getPropertyWhatsAppSettings(): WhatsAppSettingsConfig {
  try {
    const raw = localStorage.getItem(PROPERTY_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.whatsapp) {
        return parsed.whatsapp as WhatsAppSettingsConfig;
      }
    }
  } catch {
    // fallback
  }
  return initialWhatsAppConfig;
}

export const MEAL_PLAN_RATES_PER_PERSON: Record<MealPlanType, number> = {
  'Room Only': 0,
  'CP (Breakfast)': 450,
  'MAP (Breakfast & Dinner)': 1200,
  'AP (All Meals)': 1850,
};

export interface FolioCalculationInput {
  nightlyRate: number;
  nights: number;
  adults: number;
  children: number;
  mealPlan: MealPlanType;
  extrasAmount: number;
  discountAmount: number;
  isInterstateIGST?: boolean;
  gstSettings?: BillingGSTSettings;
}

export interface FolioCalculationResult {
  roomTariffSubtotal: number;
  extraGuestCharges: number;
  mealPlanSubtotal: number;
  extrasSubtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  roomGstRate: number;
  roomSacCode: string;
  fnbGstRate: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

/**
 * Calculates itemized folio totals using dynamic property GST/SAC settings.
 */
export function calculateBookingFolio(input: FolioCalculationInput): FolioCalculationResult {
  const settings = input.gstSettings || getPropertyBillingGSTSettings();
  const nights = Math.max(1, input.nights || 1);
  const nightlyRate = Math.max(0, input.nightlyRate || 0);

  // Determine statutory room slab from property SAC settings
  const lowSlab = settings.sacRates.find((s) => s.code === '996311');
  const highSlab = settings.sacRates.find((s) => s.code === '996312');
  const roomSacCode = nightlyRate >= 7500 ? '996312' : '996311';
  const roomGstRate =
    nightlyRate >= 7500
      ? highSlab?.gstRate ?? settings.defaultGstRate
      : lowSlab?.gstRate ?? 12;

  const fnbGstRate = settings.fnbGstRate ?? 5;

  const roomTariffSubtotal = nightlyRate * nights;
  const extraAdults = Math.max(0, input.adults - 2);
  const extraGuestCharges = extraAdults * 1500 * nights + Math.max(0, input.children) * 800 * nights;
  const mealRate = MEAL_PLAN_RATES_PER_PERSON[input.mealPlan] || 0;
  const mealPlanSubtotal = mealRate * Math.max(1, input.adults) * nights;
  const extrasSubtotal = Math.max(0, input.extrasAmount || 0);
  const grossPreDiscount = roomTariffSubtotal + extraGuestCharges + mealPlanSubtotal + extrasSubtotal;
  const discountAmount = Math.min(grossPreDiscount, Math.max(0, input.discountAmount || 0));

  const discountRatio = grossPreDiscount > 0 ? (grossPreDiscount - discountAmount) / grossPreDiscount : 1;
  const roomTaxable = (roomTariffSubtotal + extraGuestCharges + extrasSubtotal) * discountRatio;
  const fnbTaxable = mealPlanSubtotal * discountRatio;
  const taxableSubtotal = Math.round(roomTaxable + fnbTaxable);

  const roomTax = (roomTaxable * roomGstRate) / 100;
  const fnbTax = (fnbTaxable * fnbGstRate) / 100;
  const gstAmount = Math.round(roomTax + fnbTax);

  const useIgst = Boolean(input.isInterstateIGST && settings.enableInterstateIGST);
  const cgst = useIgst ? 0 : Math.round(gstAmount / 2);
  const sgst = useIgst ? 0 : gstAmount - cgst;
  const igst = useIgst ? gstAmount : 0;

  const grandTotal = taxableSubtotal + gstAmount;

  return {
    roomTariffSubtotal,
    extraGuestCharges,
    mealPlanSubtotal,
    extrasSubtotal,
    discountAmount,
    taxableSubtotal,
    roomGstRate,
    roomSacCode,
    fnbGstRate,
    gstAmount,
    cgst,
    sgst,
    igst,
    grandTotal,
  };
}

/**
 * Builds a clean WhatsApp prefilled link (`wa.me`) as a safe fallback when WABA cloud relay isn't active.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildBookingVoucherMessage(booking: Booking): string {
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  const balance = Math.max(0, booking.balanceDue ?? booking.amount - (booking.advancePaid || 0));
  return [
    `Namaste ${booking.guestName}! 🌴`,
    `Your reservation at *Mykonos Cottage, Tarkarli* is ${booking.bookingStatus.toUpperCase()}.`,
    ``,
    `• Booking ID: ${booking.bookingCode || booking.id}`,
    `• Cottage / Villa: ${booking.roomNumber} (${booking.roomCategory})`,
    `• Check-in: ${formatFullDate(checkInISO)} (${booking.arrivalTime || '02:00 PM'})`,
    `• Check-out: ${formatFullDate(checkOutISO)} (${booking.checkoutTime || '11:00 AM'})`,
    `• Total Tariff (incl. GST): ${formatINR(booking.amount)}`,
    `• Advance Paid: ${formatINR(booking.advancePaid || 0)}`,
    `• Balance Due on Arrival: ${formatINR(balance)}`,
    ``,
    `Location: Tarkarli Beach Road, Malvan, Sindhudurg 416606.`,
    `Looking forward to hosting you!`,
  ].join('\n');
}

export function exportBookingsToCSV(bookings: Booking[], filenamePrefix = 'mykonos-reservations'): void {
  const headers = [
    'Booking ID',
    'Folio Number',
    'Guest Name',
    'Phone',
    'Email',
    'Room',
    'Category',
    'Check-In',
    'Check-Out',
    'Nights',
    'Adults',
    'Children',
    'Booking Status',
    'Payment Status',
    'Total Amount (INR)',
    'Advance Paid (INR)',
    'Balance Due (INR)',
    'Source Channel',
  ];

  const escapeCSV = (val: string | number | undefined) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = bookings.map((b) => {
    const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
    const adv = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
    const bal = Math.max(0, b.balanceDue ?? b.amount - adv);
    return [
      b.bookingCode || b.id,
      b.folioNumber || b.invoice.invoiceNumber,
      b.guestName,
      b.guestPhone,
      b.guestEmail,
      b.roomNumber,
      b.roomCategory,
      checkInISO,
      checkOutISO,
      b.nights,
      b.adults ?? 2,
      b.children ?? 0,
      b.bookingStatus,
      b.paymentStatus,
      b.amount,
      adv,
      bal,
      b.source || 'Direct Walk-in / Phone',
    ]
      .map(escapeCSV)
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}-${getTodayISO()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const SOURCE_CHANNELS: BookingSourceChannel[] = [
  'Direct Walk-in / Phone',
  'WhatsApp Bot (Myra AI)',
  'Booking.com',
  'Airbnb',
  'MakeMyTrip',
];
