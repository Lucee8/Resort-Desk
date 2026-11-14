import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Sparkles,
  AlertCircle,
  Loader2,
  Database,
  ShieldAlert,
  Ban,
  X,
} from 'lucide-react';
import {
  Booking,
  BookingPaymentMethod,
  GuestCRM,
  RoomUnit,
} from '../types';
import {
  addDaysISO,
  getTodayISO,
  resolveBookingDatesISO,
} from '../utils/bookingUtils';
import {
  cancelBookingAtomic,
  checkInBookingInFirestore,
  checkOutBookingInFirestore,
  createReservationAtomic,
  editReservationAtomic,
  moveBookingRoomAtomic,
  recordBookingPaymentAtomic,
  updateBookingFieldsInFirestore,
} from '../services/bookingsService';
import { useAuth } from '../context/AuthContext';
import BookingKPIStats from './bookings/BookingKPIStats';
import BookingToolbar, {
  BookingViewMode,
  RangeDaysOption,
  StatusTabFilter,
} from './bookings/BookingToolbar';
import ReservationTimeline from './bookings/ReservationTimeline';
import ReservationTableView from './bookings/ReservationTableView';
import ReservationMonthView from './bookings/ReservationMonthView';
import GuestDetailsDrawer from './bookings/GuestDetailsDrawer';
import NewReservationModal from './bookings/NewReservationModal';
import RecordPaymentModal from './bookings/RecordPaymentModal';
import PrintableInvoiceVoucherModal from './bookings/PrintableInvoiceVoucherModal';
import WhatsAppDispatchModal from './bookings/WhatsAppDispatchModal';
import MobileBookingsView from './bookings/MobileBookingsView';
import { MobileFilterState } from './bookings/MobileFilterModal';

interface BookingsViewProps {
  bookings: Booking[];
  rooms: RoomUnit[];
  guests: GuestCRM[];
  loading?: boolean;
  errorMsg?: string | null;
  onSeedStarterData?: () => Promise<void>;
  onNavigateTab?: (tab: string) => void;
  onOpenMobileDrawer?: () => void;
  triggerToast: (msg: string) => void;
  initialStatusFilter?: string;
  initialSearchQuery?: string;
  navigationKey?: number;
}

export default function BookingsView({
  bookings,
  rooms,
  guests,
  loading = false,
  errorMsg = null,
  onSeedStarterData,
  onNavigateTab,
  onOpenMobileDrawer,
  triggerToast,
  initialStatusFilter,
  initialSearchQuery,
  navigationKey,
}: BookingsViewProps) {
  const { firestoreStatus, openAuthModal } = useAuth();
  const todayISO = getTodayISO();

  // Desktop View & Filter States
  const [viewMode, setViewMode] = useState<BookingViewMode>('timeline');
  const [rangeDays, setRangeDays] = useState<RangeDaysOption>(14);
  const [startDateISO, setStartDateISO] = useState<string>(() => addDaysISO(todayISO, -2));
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StatusTabFilter>(
    (initialStatusFilter as StatusTabFilter) || 'All'
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Mobile filter state
  const [mobileFilters, setMobileFilters] = useState<MobileFilterState>({
    searchQuery: initialSearchQuery || '',
    checkInISO: todayISO,
    checkOutISO: addDaysISO(todayISO, 3),
    durationPreset: 'all',
    statuses: [],
    categories: [],
    paymentFilter: 'all',
    sources: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Modal States
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [prefillSlot, setPrefillSlot] = useState<{ room: RoomUnit; checkInISO: string } | null>(
    null
  );
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    booking: Booking;
    mode: 'invoice' | 'voucher';
  } | null>(null);
  const [whatsappModalBooking, setWhatsappModalBooking] = useState<Booking | null>(null);
  const [cancelConfirmBooking, setCancelConfirmBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Sync deep-linked navigation filters
  useEffect(() => {
    if (navigationKey === undefined) return;
    setCategoryFilter('All');
    const nextStatus =
      initialStatusFilter === 'Confirmed' ||
      initialStatusFilter === 'Checked-in' ||
      initialStatusFilter === 'Pending' ||
      initialStatusFilter === 'Maint.'
        ? initialStatusFilter
        : 'All';
    setStatusFilter(nextStatus);
    setSearchQuery(initialSearchQuery || '');
    setMobileFilters((prev) => ({
      ...prev,
      searchQuery: initialSearchQuery || '',
    }));

    if (initialSearchQuery) {
      const q = initialSearchQuery.toLowerCase();
      const match = bookings.find(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.roomNumber.toLowerCase().includes(q) ||
          (b.bookingCode || b.id).toLowerCase().includes(q)
      );
      if (match) setSelectedBookingId(match.id);
    }
  }, [navigationKey, initialStatusFilter, initialSearchQuery, bookings]);

  // Select first active booking if selected ID disappears or nothing selected yet on desktop
  useEffect(() => {
    if (selectedBookingId && bookings.some((b) => b.id === selectedBookingId)) return;
    if (bookings.length > 0 && !selectedBookingId) {
      const firstActive = bookings.find((b) => b.bookingStatus !== 'Cancelled') || bookings[0];
      setSelectedBookingId(firstActive.id);
    }
  }, [bookings, selectedBookingId]);

  const statusCounts = useMemo<Record<StatusTabFilter, number>>(() => {
    const maintCount = rooms.filter(
      (r) => r.status === 'Deep Clean' || r.status === 'Maintenance'
    ).length;
    return {
      All: bookings.filter((b) => b.bookingStatus !== 'Cancelled').length,
      Confirmed: bookings.filter((b) => b.bookingStatus === 'Confirmed').length,
      'Checked-in': bookings.filter((b) => b.bookingStatus === 'Checked-in').length,
      Pending: bookings.filter((b) => b.bookingStatus === 'Pending').length,
      'Maint.': maintCount,
    };
  }, [bookings, rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (categoryFilter !== 'All' && r.categoryName !== categoryFilter) return false;
      if (statusFilter === 'Maint.') {
        return r.status === 'Deep Clean' || r.status === 'Maintenance';
      }
      return true;
    });
  }, [rooms, categoryFilter, statusFilter]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (categoryFilter !== 'All' && b.roomCategory !== categoryFilter) return false;
      if (statusFilter !== 'All' && statusFilter !== 'Maint.') {
        if (b.bookingStatus !== statusFilter) return false;
      }
      if (statusFilter === 'All' && b.bookingStatus === 'Cancelled') {
        return false;
      }
      if (q) {
        const hit =
          b.guestName.toLowerCase().includes(q) ||
          (b.bookingCode || b.id).toLowerCase().includes(q) ||
          b.roomNumber.toLowerCase().includes(q) ||
          b.guestPhone.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [bookings, categoryFilter, statusFilter, searchQuery]);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  // Guard writes when Firestore denies access
  const ensureFirestoreWritable = () => {
    if (firestoreStatus === 'permission-denied') {
      openAuthModal();
      throw new Error('Staff sign-in or Firestore rule permission required before saving changes.');
    }
  };

  const handleSubmitReservation = async (
    booking: Booking,
    room: RoomUnit,
    sendWhatsApp: boolean
  ) => {
    ensureFirestoreWritable();
    if (editingBooking) {
      const saved = await editReservationAtomic(booking, room);
      setSelectedBookingId(saved.id);
      triggerToast(`Updated reservation ${saved.bookingCode || saved.id} for ${saved.guestName}`);
      setEditingBooking(null);
    } else {
      const saved = await createReservationAtomic(booking, room);
      setSelectedBookingId(saved.id);
      triggerToast(`Confirmed ${saved.bookingCode || saved.id} · ${saved.roomNumber}`);
      if (sendWhatsApp) {
        setWhatsappModalBooking(saved);
      }
    }
  };

  const handleCheckIn = async (booking: Booking) => {
    try {
      ensureFirestoreWritable();
      await checkInBookingInFirestore(booking);
      triggerToast(`Checked in ${booking.guestName} to ${booking.roomNumber}`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Check-in failed.');
    }
  };

  const handleCheckOut = async (booking: Booking) => {
    try {
      ensureFirestoreWritable();
      await checkOutBookingInFirestore(booking);
      triggerToast(
        `Checked out ${booking.guestName} · ${booking.roomNumber} queued for Housekeeping turnover.`
      );
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Check-out failed.');
    }
  };

  const handleConfirmPending = async (booking: Booking) => {
    try {
      ensureFirestoreWritable();
      await updateBookingFieldsInFirestore(booking.id, { bookingStatus: 'Confirmed' });
      triggerToast(`Reservation ${booking.bookingCode || booking.id} confirmed.`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Unable to confirm booking.');
    }
  };

  const handleRequestCancel = async (booking: Booking) => {
    setCancelConfirmBooking(booking);
  };

  const executeCancelBooking = async () => {
    if (!cancelConfirmBooking) return;
    setCancelling(true);
    try {
      ensureFirestoreWritable();
      await cancelBookingAtomic(cancelConfirmBooking);
      triggerToast(
        `Cancelled reservation ${cancelConfirmBooking.bookingCode || cancelConfirmBooking.id}`
      );
      setCancelConfirmBooking(null);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Unable to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handleMoveRoom = async (booking: Booking, targetRoom: RoomUnit) => {
    ensureFirestoreWritable();
    await moveBookingRoomAtomic(booking, targetRoom);
    triggerToast(`Moved ${booking.guestName} to ${targetRoom.roomName}`);
  };

  const handleRecordPayment = async (
    booking: Booking,
    amount: number,
    method: BookingPaymentMethod,
    referenceId: string
  ) => {
    ensureFirestoreWritable();
    await recordBookingPaymentAtomic(booking, amount, method, referenceId);
    triggerToast(`Recorded ₹${amount.toLocaleString('en-IN')} payment for ${booking.guestName}`);
  };

  const handleUpdateNotes = async (booking: Booking, noteText: string) => {
    ensureFirestoreWritable();
    await updateBookingFieldsInFirestore(booking.id, {
      conciergeRequest: noteText,
      notes: [noteText, ...booking.notes.slice(1)],
    });
    triggerToast(`Updated concierge notes for ${booking.guestName}`);
  };

  const handleAttachIdDocument = async (booking: Booking, downloadUrl: string) => {
    ensureFirestoreWritable();
    await updateBookingFieldsInFirestore(booking.id, {
      idDocumentUrl: downloadUrl,
      idVerificationStatus: 'Verified',
    });
    triggerToast(`ID scan saved to Firebase Storage for ${booking.guestName}`);
  };

  const handleSeedClick = async () => {
    if (!onSeedStarterData) return;
    setSeeding(true);
    try {
      await onSeedStarterData();
      triggerToast('Mykonos Cottage starter dataset initialized in Cloud Firestore.');
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div id="bookings-module-root" className="w-full max-w-[1440px] mx-auto font-sans">
      {/* Status / Error Banners */}
      {firestoreStatus === 'permission-denied' && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Firestore Permission Required</p>
              <p className="text-amber-800 mt-0.5">
                Sign in with your Firebase staff account to read and persist live reservations in
                project <span className="font-mono font-bold">resortdesk-mykonos</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="px-4 py-2 rounded-xl bg-[#004B38] text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Staff Sign-In
          </button>
        </div>
      )}

      {errorMsg && firestoreStatus !== 'permission-denied' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-12 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-7 h-7 text-[#004B38] animate-spin" />
          <p className="text-sm font-bold text-[#17221F]">
            Syncing Reservations &amp; Cottages from Firestore...
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP & TABLET EXPERIENCE (md+) */}
          <div className="hidden md:flex flex-col gap-5">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-[#17221F] tracking-tight">
                    Bookings &amp; Reservations
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B7F2DC]/60 text-[#004B38] text-[10px] font-bold">
                    {firestoreStatus === 'connected' ? 'Live Firestore Sync' : 'Session View'}
                  </span>
                </div>
                <p className="text-xs text-[#777F7B] font-medium mt-0.5">
                  Mykonos Cottage, Tarkarli · Manage stays, cottage allocations &amp; GST folios
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {bookings.length === 0 && firestoreStatus === 'connected' && onSeedStarterData && (
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={handleSeedClick}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E9ECE9] bg-white hover:bg-[#F7F6F3] text-xs font-bold text-[#004B38] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{seeding ? 'Initializing...' : 'Load Starter Dataset'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingBooking(null);
                    setPrefillSlot(null);
                    setShowReservationModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#B7F2DC]" />
                  <span>New Reservation</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <BookingKPIStats
              bookings={bookings}
              rooms={rooms}
              onQuickFilterStatus={(st) => setStatusFilter(st as StatusTabFilter)}
            />

            {/* Filter & Date Toolbar */}
            <BookingToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              statusCounts={statusCounts}
              startDateISO={startDateISO}
              onShiftDates={(delta) => setStartDateISO((prev) => addDaysISO(prev, delta))}
              onJumpToday={() => setStartDateISO(addDaysISO(getTodayISO(), -2))}
              rangeDays={rangeDays}
              onRangeDaysChange={setRangeDays}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Empty DB Notice when no bookings */}
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E9ECE9] p-10 text-center flex flex-col items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#004B38]" />
                <h3 className="text-base font-extrabold text-[#17221F]">
                  No Reservations in Firestore Yet
                </h3>
                <p className="text-xs text-[#777F7B] max-w-md">
                  Create your first walk-in reservation or load the Mykonos Cottage starter dataset
                  with 7 cottages and sample stays.
                </p>
                <div className="flex items-center gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBooking(null);
                      setPrefillSlot(null);
                      setShowReservationModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#004B38] text-white text-xs font-bold cursor-pointer"
                  >
                    + Create Reservation
                  </button>
                  {firestoreStatus === 'connected' && onSeedStarterData && (
                    <button
                      type="button"
                      disabled={seeding}
                      onClick={handleSeedClick}
                      className="px-4 py-2 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] text-[#17221F] text-xs font-bold cursor-pointer"
                    >
                      {seeding ? 'Seeding...' : 'Seed Starter Cottages & Bookings'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Main Split: Calendar/Table/Month + Right Guest Details Drawer */
              <div className="flex flex-col xl:flex-row gap-5 items-start">
                <div className="flex-1 w-full min-w-0">
                  {viewMode === 'timeline' ? (
                    <ReservationTimeline
                      rooms={filteredRooms}
                      bookings={filteredBookings}
                      startDateISO={startDateISO}
                      rangeDays={rangeDays}
                      selectedBookingId={selectedBookingId}
                      onSelectBooking={(b) => setSelectedBookingId(b.id)}
                      onQuickCreateForSlot={(room, iso) => {
                        setEditingBooking(null);
                        setPrefillSlot({ room, checkInISO: iso });
                        setShowReservationModal(true);
                      }}
                    />
                  ) : viewMode === 'table' ? (
                    <ReservationTableView
                      bookings={filteredBookings}
                      selectedBookingId={selectedBookingId}
                      onSelectBooking={(b) => setSelectedBookingId(b.id)}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onOpenPayment={(b) => setPaymentModalBooking(b)}
                      onOpenInvoice={(b) => setInvoiceModalState({ booking: b, mode: 'invoice' })}
                      onSendWhatsApp={(b) => setWhatsappModalBooking(b)}
                    />
                  ) : (
                    <ReservationMonthView
                      bookings={filteredBookings}
                      rooms={filteredRooms}
                      anchorDateISO={startDateISO}
                      onSelectBooking={(b) => setSelectedBookingId(b.id)}
                    />
                  )}
                </div>

                {selectedBooking && (
                  <GuestDetailsDrawer
                    booking={selectedBooking}
                    rooms={rooms}
                    allBookings={bookings}
                    onClose={() => setSelectedBookingId(null)}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    onConfirmPending={handleConfirmPending}
                    onCancelBooking={handleRequestCancel}
                    onMoveRoom={handleMoveRoom}
                    onOpenPaymentModal={(b) => setPaymentModalBooking(b)}
                    onOpenInvoiceModal={(b, mode = 'invoice') =>
                      setInvoiceModalState({ booking: b, mode })
                    }
                    onSendWhatsApp={(b) => setWhatsappModalBooking(b)}
                    onUpdateNotes={handleUpdateNotes}
                    onAttachIdDocument={handleAttachIdDocument}
                    onEditBooking={(b) => {
                      setPrefillSlot(null);
                      setEditingBooking(b);
                      setShowReservationModal(true);
                    }}
                    onViewFullGuestCRM={() => onNavigateTab?.('guests')}
                  />
                )}
              </div>
            )}
          </div>

          {/* MOBILE EXPERIENCE (< md) */}
          <div className="md:hidden">
            <MobileBookingsView
              bookings={bookings}
              rooms={rooms}
              mobileFilters={mobileFilters}
              onUpdateFilters={(next) => {
                setMobileFilters(next);
                if (next.searchQuery.trim()) {
                  setRecentSearches((prev) =>
                    Array.from(new Set([next.searchQuery.trim(), ...prev])).slice(0, 5)
                  );
                }
              }}
              recentSearches={recentSearches}
              onClearRecent={() => setRecentSearches([])}
              onOpenNewBooking={() => {
                setEditingBooking(null);
                setPrefillSlot(null);
                setShowReservationModal(true);
              }}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onConfirmPending={handleConfirmPending}
              onCancelBooking={handleRequestCancel}
              onMoveRoom={handleMoveRoom}
              onOpenPaymentModal={(b) => setPaymentModalBooking(b)}
              onOpenInvoiceModal={(b, mode = 'invoice') =>
                setInvoiceModalState({ booking: b, mode })
              }
              onSendWhatsApp={(b) => setWhatsappModalBooking(b)}
              onNavigateAppTab={onNavigateTab}
              onOpenMobileDrawer={onOpenMobileDrawer}
            />
          </div>
        </>
      )}

      {/* MODALS */}
      {showReservationModal && (
        <NewReservationModal
          rooms={rooms}
          existingBookings={bookings}
          existingGuests={guests}
          prefillRoom={prefillSlot?.room}
          prefillCheckInISO={prefillSlot?.checkInISO}
          editingBooking={editingBooking}
          onClose={() => {
            setShowReservationModal(false);
            setEditingBooking(null);
            setPrefillSlot(null);
          }}
          onSubmitBooking={handleSubmitReservation}
        />
      )}

      {paymentModalBooking && (
        <RecordPaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onConfirmPayment={handleRecordPayment}
        />
      )}

      {invoiceModalState && (
        <PrintableInvoiceVoucherModal
          booking={invoiceModalState.booking}
          initialMode={invoiceModalState.mode}
          onClose={() => setInvoiceModalState(null)}
        />
      )}

      {whatsappModalBooking && (
        <WhatsAppDispatchModal
          booking={whatsappModalBooking}
          onClose={() => setWhatsappModalBooking(null)}
        />
      )}

      {/* In-App Cancel Reservation Confirmation Modal */}
      {cancelConfirmBooking && (
        <div className="fixed inset-0 z-50 bg-[#17221F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ban className="w-4 h-4" />
                <h3 className="text-sm font-bold">Confirm Booking Cancellation</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelConfirmBooking(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-xs">
              <p className="text-[#17221F] leading-relaxed">
                Are you sure you want to cancel reservation{' '}
                <strong>{cancelConfirmBooking.bookingCode || cancelConfirmBooking.id}</strong> for{' '}
                <strong>{cancelConfirmBooking.guestName}</strong> ({cancelConfirmBooking.roomNumber},{' '}
                {resolveBookingDatesISO(cancelConfirmBooking).checkInISO} to{' '}
                {resolveBookingDatesISO(cancelConfirmBooking).checkOutISO})?
              </p>
              <p className="text-[#777F7B]">
                This frees the cottage dates immediately in Cloud Firestore and restores room status
                if checked in.
              </p>
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelConfirmBooking(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E9ECE9] font-bold text-[#777F7B] hover:bg-[#F7F6F3] cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={executeCancelBooking}
                  className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
