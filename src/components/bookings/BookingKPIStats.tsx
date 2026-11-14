import React from 'react';
import { LogIn, LogOut, BedDouble, CalendarClock } from 'lucide-react';
import { Booking, RoomUnit } from '../../types';
import { getTodayISO, isBookingOccupyingDate, resolveBookingDatesISO } from '../../utils/bookingUtils';

interface BookingKPIStatsProps {
  bookings: Booking[];
  rooms: RoomUnit[];
  onQuickFilterStatus: (status: string) => void;
}

export default function BookingKPIStats({
  bookings,
  rooms,
  onQuickFilterStatus,
}: BookingKPIStatsProps) {
  const todayISO = getTodayISO();

  const activeBookings = bookings.filter((b) => b.bookingStatus !== 'Cancelled');

  // 1. Today's Arrivals (check-in == today)
  const arrivalsToday = activeBookings.filter((b) => {
    const { checkInISO } = resolveBookingDatesISO(b);
    return checkInISO === todayISO;
  });
  const checkedInArrivals = arrivalsToday.filter((b) => b.bookingStatus === 'Checked-in').length;
  const expectedArrivals = Math.max(0, arrivalsToday.length - checkedInArrivals);

  // 2. Today's Departures (check-out == today)
  const departuresToday = activeBookings.filter((b) => {
    const { checkOutISO } = resolveBookingDatesISO(b);
    return checkOutISO === todayISO;
  });
  const checkedOutDepartures = departuresToday.filter((b) => b.bookingStatus === 'Checked-out').length;
  const pendingDepartures = Math.max(0, departuresToday.length - checkedOutDepartures);

  // 3. Occupancy Rate today (occupied rooms / total active operational rooms)
  const totalRoomsCount = Math.max(1, rooms.length);
  const occupiedTodaySet = new Set<string>();
  for (const b of activeBookings) {
    if (isBookingOccupyingDate(b, todayISO)) {
      occupiedTodaySet.add(b.roomId || b.roomNumber);
    }
  }
  const occupiedCount = Math.min(totalRoomsCount, occupiedTodaySet.size);
  const occupancyRate = Math.round((occupiedCount / totalRoomsCount) * 100);

  // 4. Pending Bookings
  const pendingBookings = activeBookings.filter((b) => b.bookingStatus === 'Pending');
  const pendingUnpaidCount = pendingBookings.filter((b) => b.paymentStatus !== 'Paid').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 w-full">
      {/* 1. Today's Arrivals */}
      <button
        type="button"
        onClick={() => onQuickFilterStatus('Confirmed')}
        className="text-left bg-white rounded-2xl border border-[#E9ECE9] p-4 shadow-2xs hover:border-[#004B38]/40 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-[#777F7B]">Today&apos;s Arrivals</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#17221F] tabular-nums">
                {arrivalsToday.length}
              </span>
              <span className="text-xs font-bold text-[#17221F]">
                {arrivalsToday.length === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#B7F2DC]/55 text-[#004B38] flex items-center justify-center shrink-0 group-hover:bg-[#004B38] group-hover:text-white transition-colors">
            <LogIn className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#777F7B] mt-3 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span className="tabular-nums">
            {checkedInArrivals} Checked In · {expectedArrivals} Expected
          </span>
        </p>
      </button>

      {/* 2. Today's Departures */}
      <button
        type="button"
        onClick={() => onQuickFilterStatus('Checked-in')}
        className="text-left bg-white rounded-2xl border border-[#E9ECE9] p-4 shadow-2xs hover:border-[#004B38]/40 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-[#777F7B]">Today&apos;s Departures</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#17221F] tabular-nums">
                {departuresToday.length}
              </span>
              <span className="text-xs font-bold text-[#17221F]">
                {departuresToday.length === 1 ? 'Room' : 'Rooms'}
              </span>
              <span className="text-[10px] font-semibold text-[#777F7B] ml-1">Scheduled</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#777F7B] mt-3 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="tabular-nums">
            {checkedOutDepartures} Checked Out · {pendingDepartures} Pending Inspection
          </span>
        </p>
      </button>

      {/* 3. Occupancy Rate */}
      <button
        type="button"
        onClick={() => onQuickFilterStatus('All')}
        className="text-left bg-white rounded-2xl border border-[#E9ECE9] p-4 shadow-2xs hover:border-[#004B38]/40 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-[#777F7B]">Occupancy Rate</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  occupancyRate >= 75
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                    : 'bg-[#B7F2DC]/50 text-[#004B38]'
                }`}
              >
                {occupancyRate >= 75 ? 'High Demand' : occupancyRate >= 40 ? 'Steady' : 'Open'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#17221F] tabular-nums">
                {occupancyRate}%
              </span>
              <span className="text-xs font-medium text-[#777F7B] tabular-nums">
                {occupiedCount}/{totalRoomsCount} Units
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F7F6F3] text-[#17221F] border border-[#E9ECE9] flex items-center justify-center shrink-0">
            <BedDouble className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 bg-[#F7F6F3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#004B38] rounded-full transition-all duration-500"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </button>

      {/* 4. Pending Bookings */}
      <button
        type="button"
        onClick={() => onQuickFilterStatus('Pending')}
        className="text-left bg-white rounded-2xl border border-[#E9ECE9] p-4 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-[#777F7B]">Pending Bookings</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#17221F] tabular-nums">
                {pendingBookings.length}
              </span>
              <span className="text-xs font-bold text-[#17221F]">
                {pendingBookings.length === 1 ? 'Request' : 'Requests'}
              </span>
              {pendingBookings.length > 0 && (
                <span className="text-[10px] font-bold text-amber-700">Action Req.</span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-[11px] text-[#777F7B] mt-3 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span className="tabular-nums">
            {pendingUnpaidCount > 0
              ? `${pendingUnpaidCount} awaiting advance confirmation`
              : 'All holds verified'}
          </span>
        </p>
      </button>
    </div>
  );
}
