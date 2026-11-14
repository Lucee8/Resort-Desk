import React, { useMemo, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  MessageSquare,
  FileText,
  CreditCard,
  ArrowLeft,
  Calendar,
  BedDouble,
  LogIn,
  LogOut,
  CalendarClock,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Menu,
  MoreHorizontal,
} from 'lucide-react';
import { Booking, RoomUnit } from '../../types';
import {
  formatFullDate,
  formatINR,
  getTodayISO,
  isBookingOccupyingDate,
  isRoomAvailableForRange,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';
import MobileFilterModal, {
  countMatchingMobileFilters,
  MobileFilterState,
} from './MobileFilterModal';

export type MobileBookingsScreen = 'dashboard' | 'list' | 'details' | 'filter';

interface MobileBookingsViewProps {
  bookings: Booking[];
  rooms: RoomUnit[];
  mobileFilters: MobileFilterState;
  onUpdateFilters: (f: MobileFilterState) => void;
  recentSearches: string[];
  onClearRecent: () => void;
  onOpenNewBooking: () => void;
  onCheckIn: (booking: Booking) => Promise<void>;
  onCheckOut: (booking: Booking) => Promise<void>;
  onConfirmPending: (booking: Booking) => Promise<void>;
  onCancelBooking: (booking: Booking) => Promise<void>;
  onMoveRoom: (booking: Booking, targetRoom: RoomUnit) => Promise<void>;
  onOpenPaymentModal: (booking: Booking) => void;
  onOpenInvoiceModal: (booking: Booking, mode?: 'invoice' | 'voucher') => void;
  onSendWhatsApp: (booking: Booking) => void;
  onNavigateAppTab?: (tab: string) => void;
  onOpenMobileDrawer?: () => void;
}

export default function MobileBookingsView({
  bookings,
  rooms,
  mobileFilters,
  onUpdateFilters,
  recentSearches,
  onClearRecent,
  onOpenNewBooking,
  onCheckIn,
  onCheckOut,
  onConfirmPending,
  onCancelBooking,
  onMoveRoom,
  onOpenPaymentModal,
  onOpenInvoiceModal,
  onSendWhatsApp,
  onNavigateAppTab,
  onOpenMobileDrawer,
}: MobileBookingsViewProps) {
  const [screen, setScreen] = useState<MobileBookingsScreen>('list');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showMoveRoomList, setShowMoveRoomList] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const todayISO = getTodayISO();
  const activeBookings = bookings.filter((b) => b.bookingStatus !== 'Cancelled');

  const arrivalsToday = activeBookings.filter(
    (b) => resolveBookingDatesISO(b).checkInISO === todayISO
  );
  const departuresToday = activeBookings.filter(
    (b) => resolveBookingDatesISO(b).checkOutISO === todayISO
  );
  const pendingBookings = activeBookings.filter((b) => b.bookingStatus === 'Pending');
  const occupiedCount = rooms.filter((r) =>
    activeBookings.some(
      (b) =>
        (b.roomId === r.id || b.roomNumber === r.roomName) &&
        isBookingOccupyingDate(b, todayISO)
    )
  ).length;
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  const filteredBookings = useMemo(
    () => countMatchingMobileFilters(bookings, mobileFilters),
    [bookings, mobileFilters]
  );

  const activeBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (mobileFilters.searchQuery.trim()) c++;
    if (mobileFilters.durationPreset !== 'all') c++;
    if (mobileFilters.statuses.length > 0) c++;
    if (mobileFilters.categories.length > 0) c++;
    if (mobileFilters.paymentFilter !== 'all') c++;
    if (mobileFilters.sources.length > 0) c++;
    return c;
  }, [mobileFilters]);

  // ---------------------------------------------------
  // SCREEN 4: MOBILE SEARCH & FILTER
  // ---------------------------------------------------
  if (screen === 'filter') {
    return (
      <MobileFilterModal
        initialFilters={mobileFilters}
        bookings={bookings}
        rooms={rooms}
        recentSearches={recentSearches}
        onClearRecent={onClearRecent}
        onApply={(next) => {
          onUpdateFilters(next);
          setScreen('list');
        }}
        onClose={() => setScreen('list')}
      />
    );
  }

  // ---------------------------------------------------
  // SCREEN 3: FULL-SCREEN MOBILE GUEST DETAILS
  // ---------------------------------------------------
  if (screen === 'details' && activeBooking) {
    const { checkInISO, checkOutISO } = resolveBookingDatesISO(activeBooking);
    const adv =
      activeBooking.advancePaid ??
      (activeBooking.paymentStatus === 'Paid' ? activeBooking.amount : 0);
    const bal = Math.max(0, activeBooking.balanceDue ?? activeBooking.amount - adv);
    const availableTargetRooms = rooms.filter(
      (r) =>
        r.id !== activeBooking.roomId &&
        isRoomAvailableForRange(r, bookings, checkInISO, checkOutISO, activeBooking.id)
    );

    return (
      <div className="flex flex-col min-h-full bg-[#F7F6F3] pb-24">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E9ECE9] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setScreen('list')}
            className="min-h-[44px] flex items-center gap-1.5 text-xs font-extrabold text-[#17221F]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to List</span>
          </button>
          <span className="text-[11px] font-bold text-[#777F7B] tabular-nums">
            {activeBooking.folioNumber || activeBooking.invoice.invoiceNumber}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3.5">
          {/* Guest Card */}
          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#004B38] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
              {activeBooking.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-[#17221F] truncate">
                {activeBooking.guestName}
              </h3>
              <p className="text-xs text-[#777F7B] tabular-nums">{activeBooking.guestPhone}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#B7F2DC]/60 text-[#004B38] text-[10px] font-bold">
                  {activeBooking.bookingStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F7F6F3] border border-[#E9ECE9] text-[#17221F] text-[10px] font-bold">
                  {activeBooking.membership}
                </span>
              </div>
            </div>
          </div>

          {/* Stay & Room Details */}
          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B]">
                Stay &amp; Room Allocation
              </span>
              <button
                type="button"
                onClick={() => setShowMoveRoomList((v) => !v)}
                className="text-xs font-bold text-[#004B38]"
              >
                {showMoveRoomList ? 'Close Move' : 'Move Room'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-[#777F7B]">Check-In</p>
                <p className="font-bold text-[#17221F]">{formatFullDate(checkInISO)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#777F7B]">Check-Out</p>
                <p className="font-bold text-[#17221F]">{formatFullDate(checkOutISO)}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-xs">
              <p className="font-extrabold text-[#17221F]">
                {activeBooking.roomNumber} · {activeBooking.roomCategory}
              </p>
              <p className="text-[11px] text-[#777F7B] mt-0.5">
                {activeBooking.nights} Nights · {activeBooking.adults || 2} Adults ·{' '}
                {activeBooking.mealPlan || 'Room Only'}
              </p>
            </div>

            {showMoveRoomList && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E9ECE9]">
                {availableTargetRooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={async () => {
                      await onMoveRoom(activeBooking, r);
                      setShowMoveRoomList(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-xs font-bold text-left flex justify-between"
                  >
                    <span>
                      {r.roomName} ({r.categoryName})
                    </span>
                    <span className="text-[#004B38]">{formatINR(r.ratePerNight)}/N</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Billing & Balance */}
          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-2 text-xs tabular-nums">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B]">
                Billing &amp; Invoice Summary
              </span>
              <button
                type="button"
                onClick={() => onOpenInvoiceModal(activeBooking, 'invoice')}
                className="text-xs font-bold text-[#004B38]"
              >
                View Tax Invoice
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777F7B]">Total Amount (incl. GST)</span>
              <span className="font-extrabold text-[#17221F]">{formatINR(activeBooking.amount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Advance Received</span>
              <span>{formatINR(adv)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FDF4EB] border border-amber-200/70 font-extrabold text-amber-900 mt-1">
              <span>Balance Due</span>
              <span>{formatINR(bal)}</span>
            </div>
            {bal > 0 && activeBooking.bookingStatus !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => onOpenPaymentModal(activeBooking)}
                className="mt-1 min-h-[44px] w-full rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] font-bold text-[#004B38] flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}
          </div>

          {/* Concierge & ID */}
          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-2.5 text-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#777F7B]">
              Concierge &amp; Verification
            </p>
            <p className="italic text-[#17221F]">
              &ldquo;{activeBooking.conciergeRequest || activeBooking.notes[0] || 'No special requests.'}&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E9ECE9] text-[#004B38] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {activeBooking.idProofType || 'Govt ID'} ·{' '}
                {activeBooking.idVerificationStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E9ECE9] px-4 py-3 flex items-center gap-2 shadow-lg">
          <button
            type="button"
            onClick={() => onSendWhatsApp(activeBooking)}
            className="min-h-[46px] px-3.5 rounded-xl bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {activeBooking.bookingStatus === 'Pending' ? (
            <button
              type="button"
              onClick={() => onConfirmPending(activeBooking)}
              className="flex-1 min-h-[46px] rounded-xl bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Booking</span>
            </button>
          ) : activeBooking.bookingStatus === 'Checked-in' ? (
            <button
              type="button"
              onClick={() => onCheckOut(activeBooking)}
              className="flex-1 min-h-[46px] rounded-xl bg-[#003D2E] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Check-out Guest</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCheckIn(activeBooking)}
              className="flex-1 min-h-[46px] rounded-xl bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check-in Guest</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions((v) => !v)}
              className="min-h-[46px] min-w-[46px] rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] flex items-center justify-center text-[#17221F]"
              aria-label="More Actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMoreActions && (
              <div className="absolute bottom-14 right-0 w-48 bg-white rounded-xl border border-[#E9ECE9] shadow-xl py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    onOpenInvoiceModal(activeBooking, 'invoice');
                  }}
                  className="w-full text-left px-3.5 py-2.5 font-bold text-[#17221F]"
                >
                  View Tax Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    onOpenPaymentModal(activeBooking);
                  }}
                  className="w-full text-left px-3.5 py-2.5 font-bold text-[#17221F]"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    onCancelBooking(activeBooking);
                  }}
                  className="w-full text-left px-3.5 py-2.5 font-bold text-rose-700 border-t border-[#E9ECE9]"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // SCREENS 1 & 2: MOBILE DASHBOARD / RESERVATION LIST
  // ---------------------------------------------------
  return (
    <div className="flex flex-col min-h-full bg-[#F7F6F3] pb-24">
      {/* Top Sub-Switcher */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center bg-white border border-[#E9ECE9] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              screen === 'dashboard' ? 'bg-[#004B38] text-white' : 'text-[#777F7B]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setScreen('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              screen === 'list' ? 'bg-[#004B38] text-white' : 'text-[#777F7B]'
            }`}
          >
            Reservations ({filteredBookings.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setScreen('filter')}
          className="min-h-[40px] px-3 rounded-xl bg-white border border-[#E9ECE9] text-xs font-bold text-[#17221F] flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#004B38]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#004B38] text-white text-[10px] tabular-nums">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {screen === 'dashboard' ? (
        /* SCREEN 1: MOBILE BOOKINGS OVERVIEW */
        <div className="p-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-[#E9ECE9] p-3.5">
              <div className="flex items-center justify-between text-[#004B38]">
                <LogIn className="w-4 h-4" />
                <span className="text-[10px] font-bold text-[#777F7B]">Today</span>
              </div>
              <p className="text-2xl font-extrabold text-[#17221F] mt-2 tabular-nums">
                {arrivalsToday.length}
              </p>
              <p className="text-[11px] font-bold text-[#777F7B]">Arrivals</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E9ECE9] p-3.5">
              <div className="flex items-center justify-between text-indigo-700">
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold text-[#777F7B]">Today</span>
              </div>
              <p className="text-2xl font-extrabold text-[#17221F] mt-2 tabular-nums">
                {departuresToday.length}
              </p>
              <p className="text-[11px] font-bold text-[#777F7B]">Departures</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E9ECE9] p-3.5">
              <div className="flex items-center justify-between text-[#004B38]">
                <BedDouble className="w-4 h-4" />
                <span className="text-[10px] font-bold text-[#777F7B] tabular-nums">
                  {occupiedCount}/{rooms.length}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-[#17221F] mt-2 tabular-nums">
                {occupancyPct}%
              </p>
              <p className="text-[11px] font-bold text-[#777F7B]">Occupancy Rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E9ECE9] p-3.5">
              <div className="flex items-center justify-between text-amber-700">
                <CalendarClock className="w-4 h-4" />
                <span className="text-[10px] font-bold text-amber-700">Action</span>
              </div>
              <p className="text-2xl font-extrabold text-[#17221F] mt-2 tabular-nums">
                {pendingBookings.length}
              </p>
              <p className="text-[11px] font-bold text-[#777F7B]">Pending Holds</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#777F7B]">
                Today&apos;s Key Arrivals
              </h3>
              <button
                type="button"
                onClick={() => setScreen('list')}
                className="text-xs font-bold text-[#004B38]"
              >
                View All →
              </button>
            </div>
            {arrivalsToday.length === 0 ? (
              <p className="text-xs text-[#777F7B] py-2">No scheduled arrivals today.</p>
            ) : (
              arrivalsToday.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBookingId(b.id);
                    setScreen('details');
                  }}
                  className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#17221F]">{b.guestName}</p>
                    <p className="text-[11px] text-[#777F7B]">
                      {b.roomNumber} · {b.arrivalTime || '02:00 PM'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#B7F2DC] text-[#004B38] text-[10px] font-bold">
                    {b.bookingStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* SCREEN 2: MOBILE RESERVATION LIST */
        <div className="p-4 flex flex-col gap-3">
          {/* Quick Search Trigger */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#777F7B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mobileFilters.searchQuery}
              onChange={(e) =>
                onUpdateFilters({ ...mobileFilters, searchQuery: e.target.value })
              }
              placeholder="Search guest, room # or booking ID..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-white border border-[#E9ECE9] text-xs font-semibold text-[#17221F] focus:outline-none focus:border-[#004B38]"
            />
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E9ECE9] p-8 text-center text-xs text-[#777F7B]">
              No reservations match your filters.
            </div>
          ) : (
            filteredBookings.map((b) => {
              const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
              const adv =
                b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
              const bal = Math.max(0, b.balanceDue ?? b.amount - adv);

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[#E9ECE9] p-4 shadow-2xs flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                        {b.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#17221F] truncate">
                          {b.guestName}
                        </h4>
                        <p className="text-[11px] text-[#777F7B] tabular-nums">
                          {b.bookingCode || b.id} · {b.guestPhone}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        b.bookingStatus === 'Checked-in'
                          ? 'bg-[#003D2E] text-white'
                          : b.bookingStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#B7F2DC] text-[#004B38]'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#777F7B] block">Room</span>
                      <span className="font-bold text-[#17221F]">{b.roomNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#777F7B] block">Stay</span>
                      <span className="font-bold text-[#17221F] tabular-nums">
                        {b.nights}N · {b.adults || 2} Adults
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#E9ECE9] flex justify-between tabular-nums">
                      <span className="text-[#777F7B]">
                        {formatFullDate(checkInISO)} → {formatFullDate(checkOutISO)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-[#777F7B] block">Total / Advance</span>
                      <span className="font-extrabold text-[#17221F]">
                        {formatINR(b.amount)}{' '}
                        <span className="text-emerald-700 font-bold">({formatINR(adv)} paid)</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#777F7B] block">Balance Due</span>
                      <span
                        className={`font-extrabold ${
                          bal > 0 ? 'text-amber-800' : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(bal)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E9ECE9]">
                    {b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => onCheckIn(b)}
                        className="min-h-[42px] rounded-xl bg-[#004B38] text-white text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check-in</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenInvoiceModal(b, 'invoice')}
                        className="min-h-[42px] rounded-xl bg-[#F7F6F3] border border-[#E9ECE9] text-[#17221F] text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setScreen('details');
                      }}
                      className="min-h-[42px] rounded-xl border border-[#E9ECE9] bg-white text-[#17221F] text-[11px] font-bold"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendWhatsApp(b)}
                      className="min-h-[42px] rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Floating + New Booking Button (Positioned cleanly above bottom nav) */}
      <button
        type="button"
        onClick={onOpenNewBooking}
        className="fixed right-4 bottom-20 z-30 h-12 px-4 rounded-full bg-[#004B38] text-white text-xs font-extrabold shadow-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4 text-[#B7F2DC]" />
        <span>New Booking</span>
      </button>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E9ECE9] grid grid-cols-4 h-16">
        <button
          type="button"
          onClick={() => onNavigateAppTab?.('dashboard')}
          className="flex flex-col items-center justify-center gap-1 text-[#777F7B]"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen('list')}
          className="flex flex-col items-center justify-center gap-1 text-[#004B38]"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-extrabold">Bookings</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateAppTab?.('guests')}
          className="flex flex-col items-center justify-center gap-1 text-[#777F7B]"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Guests</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenMobileDrawer?.()}
          className="flex flex-col items-center justify-center gap-1 text-[#777F7B]"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </div>
  );
}
