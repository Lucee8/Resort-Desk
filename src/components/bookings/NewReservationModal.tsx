import React, { useMemo, useState } from 'react';
import {
  X,
  Calendar,
  BedDouble,
  UserCheck,
  Receipt,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import {
  Booking,
  BookingPaymentMethod,
  BookingSourceChannel,
  GuestCRM,
  MealPlanType,
  RoomUnit,
} from '../../types';
import {
  addDaysISO,
  calculateBookingFolio,
  diffNights,
  formatFullDate,
  formatINR,
  formatShortDate,
  getPropertyBillingGSTSettings,
  getTodayISO,
  isRoomAvailableForRange,
  MEAL_PLAN_RATES_PER_PERSON,
  SOURCE_CHANNELS,
} from '../../utils/bookingUtils';
import { ROOM_CATEGORIES_META, uploadGuestIdDocument } from '../../services/bookingsService';

interface NewReservationModalProps {
  rooms: RoomUnit[];
  existingBookings: Booking[];
  existingGuests: GuestCRM[];
  prefillRoom?: RoomUnit | null;
  prefillCheckInISO?: string | null;
  editingBooking?: Booking | null;
  onClose: () => void;
  onSubmitBooking: (booking: Booking, room: RoomUnit, sendWhatsApp: boolean) => Promise<void>;
}

const MEAL_PLANS: MealPlanType[] = [
  'Room Only',
  'CP (Breakfast)',
  'MAP (Breakfast & Dinner)',
  'AP (All Meals)',
];

const PAYMENT_MODES: BookingPaymentMethod[] = ['UPI / GPay', 'Cash', 'Card', 'NEFT / IMPS'];

export default function NewReservationModal({
  rooms,
  existingBookings,
  existingGuests,
  prefillRoom,
  prefillCheckInISO,
  editingBooking,
  onClose,
  onSubmitBooking,
}: NewReservationModalProps) {
  const defaultCheckIn =
    editingBooking?.checkInDateISO || prefillCheckInISO || getTodayISO();
  const defaultCheckOut =
    editingBooking?.checkOutDateISO || addDaysISO(defaultCheckIn, 2);

  // Step 1: Stay Dates & Room Allocation
  const [checkInISO, setCheckInISO] = useState(defaultCheckIn);
  const [checkOutISO, setCheckOutISO] = useState(defaultCheckOut);
  const [adults, setAdults] = useState(editingBooking?.adults || 2);
  const [children, setChildren] = useState(editingBooking?.children || 0);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    editingBooking?.roomCategory || prefillRoom?.categoryName || 'Private Pool Villa'
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    editingBooking?.roomId || prefillRoom?.id || ''
  );

  // Step 2: Guest Particulars & Identity
  const [guestLookup, setGuestLookup] = useState('');
  const [selectedExistingGuestId, setSelectedExistingGuestId] = useState<string | null>(
    editingBooking?.guestId || null
  );
  const [guestName, setGuestName] = useState(editingBooking?.guestName || '');
  const [guestPhone, setGuestPhone] = useState(editingBooking?.guestPhone || '+91 ');
  const [guestEmail, setGuestEmail] = useState(editingBooking?.guestEmail || '');
  const [guestCity, setGuestCity] = useState(editingBooking?.guestCity || '');
  const [sourceChannel, setSourceChannel] = useState<BookingSourceChannel>(
    editingBooking?.source || 'Direct Walk-in / Phone'
  );
  const [idProofType, setIdProofType] = useState<'Aadhaar Card' | 'Passport' | 'Driving License' | 'Voter ID'>(
    (editingBooking?.idProofType as 'Aadhaar Card' | 'Passport' | 'Driving License' | 'Voter ID') || 'Aadhaar Card'
  );
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);

  // Step 3: Folio & Advance
  const [mealPlan, setMealPlan] = useState<MealPlanType>(
    editingBooking?.mealPlan || 'CP (Breakfast)'
  );
  const [extrasAmountStr, setExtrasAmountStr] = useState('0');
  const [extrasLabel] = useState('Scuba / Speedboat Transfer');
  const [discountStr, setDiscountStr] = useState(String(editingBooking?.discount || 0));
  const [isInterstateIGST, setIsInterstateIGST] = useState(
    Boolean(editingBooking?.invoice?.igst && editingBooking.invoice.igst > 0)
  );
  const [advanceStr, setAdvanceStr] = useState(
    String(
      editingBooking
        ? editingBooking.advancePaid ??
            (editingBooking.paymentStatus === 'Paid' ? editingBooking.amount : 0)
        : 0
    )
  );
  const [paymentMode, setPaymentMode] = useState<BookingPaymentMethod>('UPI / GPay');
  const [transactionRef, setTransactionRef] = useState('');

  // Step 4: Concierge & Operational Notes
  const [arrivalTime, setArrivalTime] = useState(editingBooking?.arrivalTime || '02:00 PM');
  const [occasionTag, setOccasionTag] = useState(editingBooking?.occasionTag || '');
  const [conciergeRequest, setConciergeRequest] = useState(
    editingBooking?.conciergeRequest || editingBooking?.notes?.[0] || ''
  );
  const [housekeepingNote, setHousekeepingNote] = useState(editingBooking?.housekeepingNote || '');
  const [internalStaffNote, setInternalStaffNote] = useState(editingBooking?.internalStaffNote || '');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nights = diffNights(checkInISO, checkOutISO);
  const gstSettings = getPropertyBillingGSTSettings();

  // Compute live available rooms per category for [checkInISO, checkOutISO)
  const categoryStats = useMemo(() => {
    return ROOM_CATEGORIES_META.map((cat) => {
      const catRooms = rooms.filter((r) => r.categoryName === cat);
      const availRooms =
        nights > 0
          ? catRooms.filter((r) =>
              isRoomAvailableForRange(
                r,
                existingBookings,
                checkInISO,
                checkOutISO,
                editingBooking?.id
              )
            )
          : [];
      const minRate = catRooms.length > 0 ? Math.min(...catRooms.map((r) => r.ratePerNight)) : 0;
      return {
        category: cat,
        totalUnits: catRooms.length,
        availableUnits: availRooms,
        availableCount: availRooms.length,
        minRate,
      };
    });
  }, [rooms, existingBookings, checkInISO, checkOutISO, nights, editingBooking?.id]);

  const availableRoomsInCategory = useMemo(() => {
    const found = categoryStats.find((c) => c.category === selectedCategory);
    return found?.availableUnits || [];
  }, [categoryStats, selectedCategory]);

  const activeRoom = useMemo(() => {
    const exact = availableRoomsInCategory.find((r) => r.id === selectedRoomId);
    return exact || availableRoomsInCategory[0] || null;
  }, [availableRoomsInCategory, selectedRoomId]);

  const matchingGuests = useMemo(() => {
    const q = guestLookup.trim().toLowerCase();
    if (!q) return [];
    return existingGuests
      .filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          g.email.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [existingGuests, guestLookup]);

  const folio = useMemo(() => {
    return calculateBookingFolio({
      nightlyRate: activeRoom?.ratePerNight || 0,
      nights: Math.max(1, nights),
      adults,
      children,
      mealPlan,
      extrasAmount: Number(extrasAmountStr) || 0,
      discountAmount: Number(discountStr) || 0,
      isInterstateIGST,
      gstSettings,
    });
  }, [
    activeRoom,
    nights,
    adults,
    children,
    mealPlan,
    extrasAmountStr,
    discountStr,
    isInterstateIGST,
    gstSettings,
  ]);

  const advanceNum = Math.max(0, Number(advanceStr) || 0);
  const balanceDue = Math.max(0, folio.grandTotal - advanceNum);

  const handleSelectExistingGuest = (g: GuestCRM) => {
    setSelectedExistingGuestId(g.id);
    setGuestName(g.name);
    setGuestPhone(g.phone);
    setGuestEmail(g.email);
    setGuestCity(g.location);
    setGuestLookup('');
  };

  const handleCreateReservation = async (mode: 'tentative' | 'confirmed') => {
    setErrorMsg(null);

    if (nights <= 0) {
      setErrorMsg('Check-out date must be at least 1 night after check-in date.');
      return;
    }
    if (!activeRoom) {
      setErrorMsg('No available room unit selected for these dates.');
      return;
    }
    if (!guestName.trim()) {
      setErrorMsg('Guest full name is required.');
      return;
    }
    if (guestPhone.replace(/[^\d]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp / contact phone number.');
      return;
    }
    if (advanceNum > folio.grandTotal) {
      setErrorMsg('Advance amount cannot exceed the Grand Total.');
      return;
    }
    if (!editingBooking && advanceNum > 0 && paymentMode !== 'Cash' && !transactionRef.trim()) {
      setErrorMsg(`Please provide a transaction reference ID for ${paymentMode}.`);
      return;
    }

    setSubmitting(true);
    try {
      const codeDigits = String(Math.floor(1000 + Math.random() * 9000));
      const bookingId = editingBooking?.id || `bk-mc-${Date.now()}`;
      const prefix = gstSettings.invoicePrefix.replace(/\/$/, '');
      const folioNo =
        editingBooking?.folioNumber ||
        editingBooking?.invoice?.invoiceNumber ||
        `${prefix}-${codeDigits}`;

      let uploadedUrl: string | undefined;
      if (idFile) {
        try {
          uploadedUrl = await uploadGuestIdDocument(
            selectedExistingGuestId || bookingId,
            idFile
          );
        } catch (uploadErr) {
          console.warn('ID upload skipped or failed:', uploadErr);
        }
      }

      const items = [
        {
          description: `${activeRoom.roomName} · ${activeRoom.categoryName} (${nights} Nights)`,
          qty: nights,
          price: activeRoom.ratePerNight,
          amount: folio.roomTariffSubtotal,
          sacCode: folio.roomSacCode,
          gstRate: folio.roomGstRate,
        },
      ];
      if (folio.extraGuestCharges > 0) {
        items.push({
          description: 'Extra Adult / Child Stay Supplement',
          qty: nights,
          price: Math.round(folio.extraGuestCharges / nights),
          amount: folio.extraGuestCharges,
          sacCode: folio.roomSacCode,
          gstRate: folio.roomGstRate,
        });
      }
      if (folio.mealPlanSubtotal > 0) {
        items.push({
          description: `${mealPlan} (${adults} Adults × ${nights}N)`,
          qty: nights,
          price: MEAL_PLAN_RATES_PER_PERSON[mealPlan] * adults,
          amount: folio.mealPlanSubtotal,
          sacCode: '996331',
          gstRate: folio.fnbGstRate,
        });
      }
      if (folio.extrasSubtotal > 0) {
        items.push({
          description: extrasLabel || 'Resort Experiences & Add-ons',
          qty: 1,
          price: folio.extrasSubtotal,
          amount: folio.extrasSubtotal,
          sacCode: folio.roomSacCode,
          gstRate: folio.roomGstRate,
        });
      }

      const initials = guestName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const existingPayments = editingBooking?.payments || [];
      const existingAdvance = editingBooking
        ? editingBooking.advancePaid ??
          (editingBooking.paymentStatus === 'Paid' ? editingBooking.amount : 0)
        : advanceNum;
      const finalAdvance = editingBooking ? existingAdvance : advanceNum;
      const finalBalance = Math.max(0, folio.grandTotal - finalAdvance);

      const newBooking: Booking = {
        ...(editingBooking || {}),
        id: bookingId,
        bookingCode: editingBooking?.bookingCode || `BK-${codeDigits}`,
        folioNumber: folioNo,
        guestId: selectedExistingGuestId || editingBooking?.guestId,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        guestCity: guestCity.trim() || 'India',
        roomId: activeRoom.id,
        roomNumber: activeRoom.roomName,
        roomType: activeRoom.categoryName,
        roomCategory: activeRoom.categoryName,
        startDate: formatShortDate(checkInISO),
        endDate: formatShortDate(checkOutISO),
        checkInDateISO: checkInISO,
        checkOutDateISO: checkOutISO,
        arrivalTime,
        checkoutTime: editingBooking?.checkoutTime || '11:00 AM',
        nights,
        adults,
        children,
        mealPlan,
        source: sourceChannel,
        amount: folio.grandTotal,
        advancePaid: finalAdvance,
        balanceDue: finalBalance,
        discount: folio.discountAmount,
        gstRateApplied: folio.roomGstRate,
        sacCode: folio.roomSacCode,
        bookingStatus: editingBooking
          ? editingBooking.bookingStatus
          : mode === 'tentative'
            ? 'Pending'
            : 'Confirmed',
        paymentStatus:
          finalBalance === 0 ? 'Paid' : finalAdvance > 0 ? 'Partial' : 'Unpaid',
        payments: editingBooking
          ? existingPayments
          : advanceNum > 0
            ? [
                {
                  id: `pay-${Date.now()}`,
                  amount: advanceNum,
                  method: paymentMode,
                  referenceId: transactionRef.trim() || 'CASH-COUNTER',
                  recordedAt: new Date().toLocaleString('en-IN'),
                  recordedBy: 'Front Desk',
                  type: 'Advance',
                },
              ]
            : [],
        avatar: initials || 'GU',
        membership:
          editingBooking?.membership ||
          (selectedExistingGuestId ? 'Repeat Guest' : 'Direct Guest'),
        occasionTag: occasionTag.trim() || undefined,
        totalSpend: editingBooking?.totalSpend ?? finalAdvance,
        avgDailyRate: activeRoom.ratePerNight,
        notes: [
          conciergeRequest.trim() ||
            internalStaffNote.trim() ||
            `Booked via ${sourceChannel}.`,
        ],
        conciergeRequest: conciergeRequest.trim() || undefined,
        housekeepingNote: housekeepingNote.trim() || undefined,
        internalStaffNote: internalStaffNote.trim() || undefined,
        preferences: [mealPlan, activeRoom.categoryName],
        idProofType,
        idProofNumberMasked: idProofNumber.trim()
          ? `XXXX-${idProofNumber.trim().slice(-4)}`
          : editingBooking?.idProofNumberMasked,
        idVerificationStatus:
          uploadedUrl || idProofNumber.trim()
            ? 'Verified'
            : editingBooking?.idVerificationStatus || 'Pending',
        idDocumentUrl: uploadedUrl || editingBooking?.idDocumentUrl,
        tentativeExpiresAt:
          !editingBooking && mode === 'tentative'
            ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
            : editingBooking?.tentativeExpiresAt,
        stayHistory: editingBooking?.stayHistory || [],
        invoice: {
          invoiceNumber: folioNo,
          date: editingBooking?.invoice?.date || formatFullDate(getTodayISO()),
          items,
          subtotal: folio.taxableSubtotal,
          cgst: folio.cgst,
          sgst: folio.sgst,
          igst: folio.igst,
          total: folio.grandTotal,
        },
      };

      await onSubmitBooking(newBooking, activeRoom, !editingBooking && mode === 'confirmed');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17221F]/60 backdrop-blur-xs flex items-center justify-center sm:p-4">
      <div className="bg-[#F7F6F3] w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl border border-[#E9ECE9] shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-[#004B38] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#B7F2DC]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight leading-tight">
                {editingBooking
                  ? `Edit Reservation · ${editingBooking.bookingCode || editingBooking.id}`
                  : 'New Reservation / Walk-In'}
              </h2>
              <p className="text-[11px] text-[#B7F2DC]">
                Mykonos Cottage, Tarkarli · Live Room &amp; GST Allocation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable 4-Step Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: STAY DATES & ROOM ALLOCATION */}
          <section className="bg-white rounded-2xl border border-[#E9ECE9] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E9ECE9] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-[#17221F] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#004B38]" />
                  <span>Stay Dates &amp; Room Allocation</span>
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#B7F2DC]/60 text-[#004B38] text-[11px] font-extrabold tabular-nums">
                {nights > 0 ? `${nights} ${nights === 1 ? 'Night' : 'Nights'}` : 'Invalid Dates'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInISO}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCheckInISO(val);
                    if (val >= checkOutISO) setCheckOutISO(addDaysISO(val, 1));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] focus:outline-none focus:border-[#004B38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutISO}
                  min={addDaysISO(checkInISO, 1)}
                  onChange={(e) => setCheckOutISO(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] focus:outline-none focus:border-[#004B38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] tabular-nums"
                />
              </div>
            </div>

            {/* Live Room Category Cards */}
            <div>
              <p className="text-[11px] font-bold text-[#777F7B] mb-2">
                Select Room Category (Live Availability for Selected Dates)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {categoryStats.map((stat) => {
                  const soldOut = stat.availableCount === 0;
                  const active = selectedCategory === stat.category;
                  return (
                    <button
                      key={stat.category}
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        setSelectedCategory(stat.category);
                        setSelectedRoomId(stat.availableUnits[0]?.id || '');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        soldOut
                          ? 'bg-slate-50 border-[#E9ECE9] opacity-55 cursor-not-allowed'
                          : active
                            ? 'bg-[#B7F2DC]/30 border-[#004B38] shadow-2xs'
                            : 'bg-white border-[#E9ECE9] hover:border-[#004B38]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-[#17221F] truncate">
                          {stat.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                            soldOut
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-[#004B38] text-white'
                          }`}
                        >
                          {soldOut ? 'Sold Out' : `${stat.availableCount} Avail`}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#004B38] mt-1 tabular-nums">
                        {formatINR(stat.minRate)} / night
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Unit Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#17221F] mb-1.5 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-[#004B38]" />
                <span>Assign Cottage / Villa Unit</span>
              </label>
              {availableRoomsInCategory.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                  All units in {selectedCategory} are booked or under maintenance for these dates.
                  Please choose another category.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableRoomsInCategory.map((unit) => {
                    const isPicked = activeRoom?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setSelectedRoomId(unit.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isPicked
                            ? 'bg-[#004B38] text-white border-[#004B38]'
                            : 'bg-[#F7F6F3] text-[#17221F] border-[#E9ECE9] hover:border-[#004B38]'
                        }`}
                      >
                        {unit.roomName} · {formatINR(unit.ratePerNight)}/N
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* STEP 2: GUEST PARTICULARS & IDENTITY */}
          <section className="bg-white rounded-2xl border border-[#E9ECE9] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E9ECE9] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-extrabold text-[#17221F] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#004B38]" />
                  <span>Guest Particulars &amp; Identity</span>
                </h3>
              </div>
            </div>

            {/* Existing Guest Quick Lookup */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                Search Returning Guest (Auto-links CRM profile to avoid duplicates)
              </label>
              <input
                type="text"
                value={guestLookup}
                onChange={(e) => setGuestLookup(e.target.value)}
                placeholder="Type returning guest name or phone..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F] focus:outline-none focus:border-[#004B38]"
              />
              {matchingGuests.length > 0 && (
                <div className="mt-1 bg-white border border-[#E9ECE9] rounded-xl shadow-lg divide-y divide-[#E9ECE9] overflow-hidden">
                  {matchingGuests.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectExistingGuest(g)}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#B7F2DC]/25 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-bold text-[#17221F]">{g.name}</span>
                      <span className="text-[#777F7B] tabular-nums">{g.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Siddharth Mehta"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-semibold text-[#17221F] focus:outline-none focus:border-[#004B38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98201 44321"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-semibold text-[#17221F] tabular-nums focus:outline-none focus:border-[#004B38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F] focus:outline-none focus:border-[#004B38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  City &amp; Booking Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={guestCity}
                    onChange={(e) => setGuestCity(e.target.value)}
                    placeholder="City (Mumbai)"
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                  />
                  <select
                    value={sourceChannel}
                    onChange={(e) => setSourceChannel(e.target.value as BookingSourceChannel)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-semibold text-[#17221F]"
                  >
                    {SOURCE_CHANNELS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ID Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Govt. ID Type
                </label>
                <select
                  value={idProofType}
                  onChange={(e) =>
                    setIdProofType(
                      e.target.value as
                        | 'Aadhaar Card'
                        | 'Passport'
                        | 'Driving License'
                        | 'Voter ID'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-semibold text-[#17221F]"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="Last 4 digits or full ID"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                />
              </div>
              <div>
                <label className="w-full py-2 px-3 rounded-xl border border-dashed border-[#004B38]/40 bg-[#B7F2DC]/20 text-xs font-bold text-[#004B38] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#B7F2DC]/40">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate">{idFile ? idFile.name : 'Upload ID Scan'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* STEP 3: FOLIO CALCULATION & ADVANCE */}
          <section className="bg-white rounded-2xl border border-[#E9ECE9] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E9ECE9] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-extrabold text-[#17221F] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#004B38]" />
                  <span>Folio Calculation &amp; Advance</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#777F7B]">
                SAC {folio.roomSacCode} · GST {folio.roomGstRate}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Meal Plan
                </label>
                <select
                  value={mealPlan}
                  onChange={(e) => setMealPlan(e.target.value as MealPlanType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-semibold text-[#17221F]"
                >
                  {MEAL_PLANS.map((mp) => (
                    <option key={mp} value={mp}>
                      {mp} ({formatINR(MEAL_PLAN_RATES_PER_PERSON[mp])}/pax/N)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Add-on Activities / Extras (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={extrasAmountStr}
                  onChange={(e) => setExtrasAmountStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={discountStr}
                  onChange={(e) => setDiscountStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs font-bold text-[#17221F] tabular-nums"
                />
              </div>
            </div>

            {/* Live Folio Breakdown */}
            <div className="bg-[#F7F6F3] rounded-xl border border-[#E9ECE9] p-3.5 flex flex-col gap-1.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#777F7B]">
                  Room Tariff ({nights}N × {formatINR(activeRoom?.ratePerNight || 0)})
                </span>
                <span className="font-bold text-[#17221F]">
                  {formatINR(folio.roomTariffSubtotal)}
                </span>
              </div>
              {folio.extraGuestCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#777F7B]">Extra Guests / Child Supplement</span>
                  <span className="font-bold text-[#17221F]">
                    {formatINR(folio.extraGuestCharges)}
                  </span>
                </div>
              )}
              {folio.mealPlanSubtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#777F7B]">Meal Plan ({mealPlan})</span>
                  <span className="font-bold text-[#17221F]">
                    {formatINR(folio.mealPlanSubtotal)}
                  </span>
                </div>
              )}
              {folio.extrasSubtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#777F7B]">{extrasLabel}</span>
                  <span className="font-bold text-[#17221F]">{formatINR(folio.extrasSubtotal)}</span>
                </div>
              )}
              {folio.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Privilege Discount</span>
                  <span>-{formatINR(folio.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#777F7B]">
                  GST ({isInterstateIGST ? 'IGST' : 'CGST + SGST'})
                </span>
                <span className="font-bold text-[#17221F]">{formatINR(folio.gstAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E9ECE9] text-sm font-extrabold text-[#004B38]">
                <span>Grand Total (incl. GST)</span>
                <span>{formatINR(folio.grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 font-semibold text-[#777F7B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInterstateIGST}
                  onChange={(e) => setIsInterstateIGST(e.target.checked)}
                  className="rounded accent-[#004B38]"
                />
                <span>Interstate Corporate GST (Apply IGST instead of CGST+SGST)</span>
              </label>
            </div>

            {/* Advance Payment Capture */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E9ECE9]">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Advance Received (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={folio.grandTotal}
                  value={advanceStr}
                  onChange={(e) => setAdvanceStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-white text-xs font-extrabold text-[#004B38] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as BookingPaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-white text-xs font-semibold text-[#17221F]"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Transaction Ref {advanceNum > 0 && paymentMode !== 'Cash' ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR / PhonePe Ref"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-white text-xs text-[#17221F]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FDF4EB] border border-amber-200/70 text-xs font-bold text-amber-900 tabular-nums">
              <span>Balance Due on Arrival</span>
              <span className="text-sm font-extrabold">{formatINR(balanceDue)}</span>
            </div>
          </section>

          {/* STEP 4: CONCIERGE & OPERATIONAL NOTES */}
          <section className="bg-white rounded-2xl border border-[#E9ECE9] p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#E9ECE9] pb-3">
              <span className="w-6 h-6 rounded-full bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-extrabold text-[#17221F]">
                Concierge &amp; Operational Notes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Estimated Arrival Time
                </label>
                <input
                  type="text"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Special Occasion Tag
                </label>
                <input
                  type="text"
                  value={occasionTag}
                  onChange={(e) => setOccasionTag(e.target.value)}
                  placeholder="e.g. Anniversary, Honeymoon, Family Trip"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                Guest Concierge / Dietary Requests
              </label>
              <textarea
                rows={2}
                value={conciergeRequest}
                onChange={(e) => setConciergeRequest(e.target.value)}
                placeholder="e.g. Ground floor access, Malvani seafood pre-order, Tarkarli scuba pickup..."
                className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Housekeeping Preparation Note
                </label>
                <input
                  type="text"
                  value={housekeepingNote}
                  onChange={(e) => setHousekeepingNote(e.target.value)}
                  placeholder="e.g. Extra crib / floral setup"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#777F7B] mb-1">
                  Internal Staff Note
                </label>
                <input
                  type="text"
                  value={internalStaffNote}
                  onChange={(e) => setInternalStaffNote(e.target.value)}
                  placeholder="Front desk internal note"
                  className="w-full px-3 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-xs text-[#17221F]"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="bg-white border-t border-[#E9ECE9] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-[#E9ECE9] text-xs font-bold text-[#777F7B] hover:bg-[#F7F6F3] cursor-pointer"
          >
            Discard &amp; Close
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {!editingBooking && (
              <button
                type="button"
                disabled={submitting || !activeRoom}
                onClick={() => handleCreateReservation('tentative')}
                className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save as Tentative Hold (24h)'}
              </button>
            )}

            <button
              type="button"
              disabled={submitting || !activeRoom}
              onClick={() => handleCreateReservation('confirmed')}
              className="px-5 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B7F2DC]" />
              {!editingBooking && <MessageSquare className="w-3.5 h-3.5 text-[#B7F2DC]" />}
              <span>
                {submitting
                  ? 'Saving...'
                  : editingBooking
                    ? 'Save Reservation Changes'
                    : 'Confirm & Send WhatsApp Voucher'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
