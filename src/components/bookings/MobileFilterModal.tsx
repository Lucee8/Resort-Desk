import React, { useMemo, useState } from 'react';
import {
  Search,
  X,
  Calendar,
  Check,
  SlidersHorizontal,
  ArrowLeft,
  BedDouble,
} from 'lucide-react';
import {
  Booking,
  BookingSourceChannel,
  BookingStatusType,
  RoomUnit,
} from '../../types';
import {
  addDaysISO,
  diffNights,
  formatFullDate,
  getTodayISO,
  isRoomAvailableForRange,
  resolveBookingDatesISO,
  SOURCE_CHANNELS,
} from '../../utils/bookingUtils';
import { ROOM_CATEGORIES_META } from '../../services/bookingsService';

export interface MobileFilterState {
  searchQuery: string;
  checkInISO: string;
  checkOutISO: string;
  durationPreset: 'all' | 'current' | '7d' | '14d' | 'month';
  statuses: BookingStatusType[]; // empty = all
  categories: string[]; // empty = all
  paymentFilter: 'all' | 'Paid' | 'Partial' | 'Unpaid';
  sources: BookingSourceChannel[]; // empty = all
}

interface MobileFilterModalProps {
  initialFilters: MobileFilterState;
  bookings: Booking[];
  rooms: RoomUnit[];
  recentSearches: string[];
  onClearRecent: () => void;
  onApply: (filters: MobileFilterState) => void;
  onClose: () => void;
}

export function countMatchingMobileFilters(
  bookings: Booking[],
  f: MobileFilterState
): Booking[] {
  return bookings.filter((b) => {
    const q = f.searchQuery.trim().toLowerCase();
    if (q) {
      const hit =
        b.guestName.toLowerCase().includes(q) ||
        (b.bookingCode || b.id).toLowerCase().includes(q) ||
        b.roomNumber.toLowerCase().includes(q) ||
        b.guestPhone.toLowerCase().includes(q);
      if (!hit) return false;
    }

    if (f.statuses.length > 0 && !f.statuses.includes(b.bookingStatus)) {
      return false;
    }

    if (f.categories.length > 0 && !f.categories.includes(b.roomCategory)) {
      return false;
    }

    if (f.paymentFilter !== 'all' && b.paymentStatus !== f.paymentFilter) {
      return false;
    }

    if (f.sources.length > 0 && (!b.source || !f.sources.includes(b.source))) {
      return false;
    }

    if (f.durationPreset !== 'all' && f.checkInISO && f.checkOutISO) {
      const { checkInISO: bStart, checkOutISO: bEnd } = resolveBookingDatesISO(b);
      if (!(bStart < f.checkOutISO && bEnd > f.checkInISO)) {
        return false;
      }
    }

    return true;
  });
}

export default function MobileFilterModal({
  initialFilters,
  bookings,
  rooms,
  recentSearches,
  onClearRecent,
  onApply,
  onClose,
}: MobileFilterModalProps) {
  const [draft, setDraft] = useState<MobileFilterState>(initialFilters);
  const todayISO = getTodayISO();

  const activeCount = useMemo(() => {
    let c = 0;
    if (draft.searchQuery.trim()) c++;
    if (draft.durationPreset !== 'all') c++;
    if (draft.statuses.length > 0) c++;
    if (draft.categories.length > 0) c++;
    if (draft.paymentFilter !== 'all') c++;
    if (draft.sources.length > 0) c++;
    return c;
  }, [draft]);

  const previewMatches = useMemo(
    () => countMatchingMobileFilters(bookings, draft),
    [bookings, draft]
  );

  const toggleStatus = (status: BookingStatusType) => {
    setDraft((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleCategory = (cat: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleSource = (src: BookingSourceChannel) => {
    setDraft((prev) => ({
      ...prev,
      sources: prev.sources.includes(src)
        ? prev.sources.filter((s) => s !== src)
        : [...prev.sources, src],
    }));
  };

  const applyPreset = (preset: MobileFilterState['durationPreset']) => {
    if (preset === 'all') {
      setDraft((prev) => ({ ...prev, durationPreset: 'all' }));
      return;
    }
    if (preset === 'current') {
      setDraft((prev) => ({
        ...prev,
        durationPreset: 'current',
        checkInISO: todayISO,
        checkOutISO: addDaysISO(todayISO, 3),
      }));
    } else if (preset === '7d') {
      setDraft((prev) => ({
        ...prev,
        durationPreset: '7d',
        checkInISO: todayISO,
        checkOutISO: addDaysISO(todayISO, 7),
      }));
    } else if (preset === '14d') {
      setDraft((prev) => ({
        ...prev,
        durationPreset: '14d',
        checkInISO: todayISO,
        checkOutISO: addDaysISO(todayISO, 14),
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        durationPreset: 'month',
        checkInISO: todayISO,
        checkOutISO: addDaysISO(todayISO, 30),
      }));
    }
  };

  const handleClear = () => {
    setDraft({
      searchQuery: '',
      checkInISO: todayISO,
      checkOutISO: addDaysISO(todayISO, 3),
      durationPreset: 'all',
      statuses: [],
      categories: [],
      paymentFilter: 'all',
      sources: [],
    });
  };

  const nights = diffNights(draft.checkInISO, draft.checkOutISO);

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F6F3] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#E9ECE9] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-[#17221F] rounded-xl"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#004B38]" />
            <h2 className="text-base font-extrabold text-[#17221F]">Search &amp; Filter</h2>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#B7F2DC] text-[#004B38] text-[11px] font-extrabold tabular-nums">
          {activeCount} Active
        </span>
      </div>

      {/* Scrollable Filter Sections */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 flex flex-col gap-4">
        {/* Search Input + Recent Searches */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#777F7B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={draft.searchQuery}
              onChange={(e) => setDraft((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Guest name, booking ID, room # or phone..."
              className="w-full min-h-[44px] pl-10 pr-10 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3]/60 text-sm font-semibold text-[#17221F] focus:outline-none focus:border-[#004B38]"
            />
            {draft.searchQuery && (
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, searchQuery: '' }))}
                className="min-h-[44px] min-w-[44px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#777F7B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#777F7B] mb-2">
                <span className="font-semibold">Recent Searches</span>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="font-bold text-[#17221F] hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, searchQuery: term }))}
                    className="px-3 py-1.5 rounded-full bg-[#F7F6F3] border border-[#E9ECE9] text-xs font-semibold text-[#17221F]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stay Duration Card */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#17221F] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#004B38]" />
              Stay Duration
            </span>
            <span className="text-[11px] font-bold text-[#004B38] tabular-nums">
              {nights > 0 ? `${nights} Nights Stay` : 'All Dates'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9]">
              <p className="text-[10px] font-semibold text-[#777F7B]">Check-In</p>
              <input
                type="date"
                value={draft.checkInISO}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    durationPreset: 'current',
                    checkInISO: e.target.value,
                  }))
                }
                className="w-full bg-transparent text-xs font-extrabold text-[#17221F] mt-0.5 focus:outline-none"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7F6F3] border border-[#E9ECE9]">
              <p className="text-[10px] font-semibold text-[#777F7B]">Check-Out</p>
              <input
                type="date"
                value={draft.checkOutISO}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    durationPreset: 'current',
                    checkOutISO: e.target.value,
                  }))
                }
                className="w-full bg-transparent text-xs font-extrabold text-[#17221F] mt-0.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'All Dates' },
                { id: 'current', label: 'Current Stay' },
                { id: '7d', label: 'Next 7 Days' },
                { id: '14d', label: 'Next 14 Days' },
                { id: 'month', label: 'This Month' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${
                  draft.durationPreset === p.id
                    ? 'bg-[#B7F2DC] text-[#004B38] border-[#004B38]/30'
                    : 'bg-[#F7F6F3] text-[#777F7B] border-[#E9ECE9]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Status Multi-Select */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#17221F]">Booking Status</span>
            <span className="text-[10px] font-semibold text-[#777F7B]">Multi-select</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, statuses: [] }))}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                draft.statuses.length === 0
                  ? 'bg-[#004B38] text-white border-[#004B38]'
                  : 'bg-[#F7F6F3] text-[#17221F] border-[#E9ECE9]'
              }`}
            >
              All Statuses
            </button>
            {(
              ['Confirmed', 'Checked-in', 'Checked-out', 'Pending', 'Cancelled'] as BookingStatusType[]
            ).map((status) => {
              const active = draft.statuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#004B38] text-white border-[#004B38]'
                      : status === 'Pending'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-[#F7F6F3] text-[#17221F] border-[#E9ECE9]'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{status === 'Pending' ? 'Pending Approval' : status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Room Category Cards with Live Availability */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold text-[#17221F] flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#004B38]" />
              Room Category
            </span>
            <span className="text-[10px] font-semibold text-[#777F7B]">Mykonos Cottage</span>
          </div>

          {ROOM_CATEGORIES_META.map((cat) => {
            const catRooms = rooms.filter((r) => r.categoryName === cat);
            const unitNames = catRooms.map((r) => r.roomName.replace('Cottage ', '')).join(', ');
            const avail = catRooms.filter((r) =>
              isRoomAvailableForRange(
                r,
                bookings,
                draft.checkInISO || todayISO,
                draft.checkOutISO || addDaysISO(todayISO, 1)
              )
            ).length;
            const checked = draft.categories.includes(cat);
            const thumb = catRooms[0]?.thumbnailUrl;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-colors ${
                  checked
                    ? 'bg-[#B7F2DC]/35 border-[#004B38]'
                    : 'bg-[#F7F6F3]/60 border-[#E9ECE9]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={cat}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#E9ECE9]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E9ECE9] flex items-center justify-center shrink-0">
                      <BedDouble className="w-4 h-4 text-[#777F7B]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#17221F] truncate">{cat}</p>
                    <p className="text-[11px] text-[#004B38] font-semibold truncate tabular-nums">
                      Units {unitNames || '—'} · {avail} Available
                    </p>
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    checked
                      ? 'bg-[#004B38] border-[#004B38] text-white'
                      : 'bg-white border-[#777F7B]/40'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#17221F]">₹ Payment Status</span>
            <span className="text-[10px] font-semibold text-[#777F7B]">GST Compliant</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'all', label: 'All Payments' },
                { id: 'Paid', label: 'Fully Paid' },
                { id: 'Partial', label: 'Partial Advance' },
                { id: 'Unpaid', label: 'Pay at Check-in' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, paymentFilter: p.id }))}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left ${
                  draft.paymentFilter === p.id
                    ? 'bg-[#004B38] text-white border-[#004B38]'
                    : 'bg-[#F7F6F3] text-[#17221F] border-[#E9ECE9]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Source Channel */}
        <div className="bg-white rounded-2xl border border-[#E9ECE9] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold text-[#17221F]">Booking Source Channel</span>
            <span className="text-[10px] font-semibold text-[#777F7B]">Direct &amp; OTAs</span>
          </div>
          {SOURCE_CHANNELS.map((src) => {
            const checked = draft.sources.includes(src);
            return (
              <button
                key={src}
                type="button"
                onClick={() => toggleSource(src)}
                className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  checked
                    ? 'bg-[#B7F2DC]/35 border-[#004B38] text-[#003D2E]'
                    : 'bg-[#F7F6F3]/60 border-[#E9ECE9] text-[#17221F]'
                }`}
              >
                <span>{src}</span>
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    checked
                      ? 'bg-[#004B38] border-[#004B38] text-white'
                      : 'bg-white border-[#777F7B]/40'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action Bar (No overlapping FAB here!) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E9ECE9] px-4 py-3 flex items-center gap-3 shadow-lg">
        <button
          type="button"
          onClick={handleClear}
          className="min-h-[46px] px-4 rounded-xl border border-[#E9ECE9] bg-[#F7F6F3] text-xs font-extrabold text-[#17221F]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="flex-1 min-h-[46px] rounded-xl bg-[#004B38] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Apply Filters ({previewMatches.length} Bookings)</span>
        </button>
      </div>
    </div>
  );
}
