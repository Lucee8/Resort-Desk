import React from 'react';
import { CheckCircle2, Wrench, Plus } from 'lucide-react';
import { Booking, RoomUnit } from '../../types';
import {
  addDaysISO,
  diffNights,
  formatINR,
  getTodayISO,
  isBookingOccupyingDate,
  isRoomMatch,
  parseISODate,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';
import { RangeDaysOption } from './BookingToolbar';

interface ReservationTimelineProps {
  rooms: RoomUnit[];
  bookings: Booking[];
  startDateISO: string;
  rangeDays: RangeDaysOption;
  selectedBookingId: string | null;
  onSelectBooking: (booking: Booking) => void;
  onQuickCreateForSlot: (room: RoomUnit, checkInISO: string) => void;
}

export default function ReservationTimeline({
  rooms,
  bookings,
  startDateISO,
  rangeDays,
  selectedBookingId,
  onSelectBooking,
  onQuickCreateForSlot,
}: ReservationTimelineProps) {
  const todayISO = getTodayISO();

  const days = Array.from({ length: rangeDays }, (_, idx) => {
    const iso = addDaysISO(startDateISO, idx);
    const d = parseISODate(iso);
    return {
      iso,
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
      dayNum: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      monthShort: d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday: iso === todayISO,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  const endWindowExclusiveISO = addDaysISO(startDateISO, rangeDays);
  const colMinWidthPx = rangeDays <= 7 ? 110 : rangeDays <= 14 ? 76 : 54;

  const getStatusCardStyle = (b: Booking, isSelected: boolean) => {
    const ring = isSelected ? 'ring-2 ring-[#004B38] ring-offset-2' : '';
    if (b.bookingStatus === 'Checked-in') {
      return `bg-[#003D2E] text-white border border-[#004B38] ${ring}`;
    }
    if (b.bookingStatus === 'Confirmed') {
      return `bg-[#067A5A] text-white border border-[#056349] ${ring}`;
    }
    if (b.bookingStatus === 'Pending') {
      return `bg-[#FEF3C7] text-[#78350F] border border-[#F59E0B]/60 ${ring}`;
    }
    if (b.bookingStatus === 'Checked-out') {
      return `bg-slate-200 text-slate-700 border border-slate-300 ${ring}`;
    }
    return `bg-slate-100 text-slate-600 border border-slate-200 ${ring}`;
  };

  // Compute Available Rooms per day
  const availableRoomsPerDay = days.map((day) => {
    let available = 0;
    for (const room of rooms) {
      if (room.status === 'Maintenance') continue;
      const occupied = bookings.some(
        (b) => isRoomMatch(b, room) && isBookingOccupyingDate(b, day.iso)
      );
      if (!occupied) available += 1;
    }
    return available;
  });

  const monthHeaderLabel = (() => {
    const first = parseISODate(startDateISO);
    const last = parseISODate(addDaysISO(startDateISO, rangeDays - 1));
    const m1 = first.toLocaleDateString('en-IN', { month: 'short' });
    const m2 = last.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return m1 === m2.split(' ')[0] ? m2 : `${m1} / ${m2}`;
  })();

  return (
    <div className="bg-white rounded-2xl border border-[#E9ECE9] shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <div
          className="min-w-max"
          style={{
            width: `${230 + rangeDays * colMinWidthPx}px`,
          }}
        >
          {/* Timeline Header Row */}
          <div className="flex border-b border-[#E9ECE9] bg-[#F7F6F3]/60 sticky top-0 z-20">
            <div className="w-[230px] shrink-0 px-4 py-3 border-r border-[#E9ECE9] bg-white sticky left-0 z-30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#17221F]">
                  ROOMS · TARKARLI
                </p>
                <p className="text-[11px] font-bold text-[#004B38] mt-0.5 tabular-nums">
                  {rooms.length} Units
                </p>
              </div>
              <span className="text-[10px] font-semibold text-[#777F7B]">{monthHeaderLabel}</span>
            </div>

            <div className="flex flex-1">
              {days.map((day) => (
                <div
                  key={day.iso}
                  style={{ width: `${colMinWidthPx}px` }}
                  className={`shrink-0 py-2.5 px-1 text-center border-r border-[#E9ECE9]/70 flex flex-col items-center justify-center ${
                    day.isToday
                      ? 'bg-[#004B38] text-white'
                      : day.isWeekend
                        ? 'bg-[#F7F6F3]/80 text-[#17221F]'
                        : 'bg-white text-[#17221F]'
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold tracking-wider ${
                      day.isToday ? 'text-[#B7F2DC]' : 'text-[#777F7B]'
                    }`}
                  >
                    {day.isToday ? 'TODAY' : day.dayName}
                  </span>
                  <span className="text-xs font-extrabold mt-0.5 tabular-nums">{day.dayNum}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Rows */}
          {rooms.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#777F7B]">
              No rooms match your selected category or filter.
            </div>
          ) : (
            rooms.map((room) => {
              // Active bookings for this room overlapping visible window
              const roomBookings = bookings.filter((b) => {
                if (b.bookingStatus === 'Cancelled') return false;
                if (!isRoomMatch(b, room)) return false;
                const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
                return checkInISO < endWindowExclusiveISO && checkOutISO > startDateISO;
              });

              return (
                <div
                  key={room.id}
                  className="flex border-b border-[#E9ECE9] hover:bg-[#F7F6F3]/30 transition-colors"
                >
                  {/* Sticky Left Room Column */}
                  <div className="w-[230px] shrink-0 px-4 py-3.5 border-r border-[#E9ECE9] bg-white sticky left-0 z-10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#17221F] truncate">
                          {room.roomName}
                        </span>
                        {room.status === 'Occupied' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#004B38] shrink-0" title="Occupied" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#777F7B] font-medium truncate mt-0.5">
                        {room.subtitle}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tabular-nums shrink-0 ${
                        room.status === 'Occupied'
                          ? 'bg-[#004B38] text-white border-[#004B38]'
                          : 'bg-[#F7F6F3] text-[#17221F] border-[#E9ECE9]'
                      }`}
                    >
                      {formatINR(room.ratePerNight)}
                    </span>
                  </div>

                  {/* Interactive Grid Track */}
                  <div className="relative flex flex-1 min-h-[64px]">
                    {/* Background day slots */}
                    {days.map((day) => (
                      <button
                        key={day.iso}
                        type="button"
                        onClick={() => onQuickCreateForSlot(room, day.iso)}
                        style={{ width: `${colMinWidthPx}px` }}
                        title={`Click to book ${room.roomName} from ${day.dayNum} ${day.monthShort}`}
                        className={`shrink-0 h-full border-r border-[#E9ECE9]/60 group relative transition-colors cursor-pointer ${
                          day.isToday
                            ? 'bg-[#B7F2DC]/15 hover:bg-[#B7F2DC]/30'
                            : 'hover:bg-[#F7F6F3]'
                        }`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[#004B38] transition-opacity">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}

                    {/* Deep Clean / Maintenance Badge if applicable */}
                    {(room.status === 'Deep Clean' || room.status === 'Maintenance') &&
                      roomBookings.length === 0 && (
                        <div
                          style={{
                            left: `${days.findIndex((d) => d.isToday) >= 0 ? days.findIndex((d) => d.isToday) * colMinWidthPx + 4 : 4}px`,
                            width: `${colMinWidthPx - 8}px`,
                          }}
                          className="absolute top-2.5 bottom-2.5 bg-[#F7F6F3] border border-dashed border-[#777F7B]/40 rounded-xl flex flex-col items-center justify-center text-[#777F7B] px-1 pointer-events-none"
                        >
                          <Wrench className="w-3 h-3 mb-0.5" />
                          <span className="text-[9px] font-bold truncate max-w-full">
                            {room.status}
                          </span>
                        </div>
                      )}

                    {/* Positioned Booking Pills */}
                    {roomBookings.map((b) => {
                      const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
                      const visibleStart = checkInISO < startDateISO ? startDateISO : checkInISO;
                      const visibleEnd =
                        checkOutISO > endWindowExclusiveISO ? endWindowExclusiveISO : checkOutISO;
                      const offsetCols = Math.max(0, diffNights(startDateISO, visibleStart));
                      const spanCols = Math.max(1, diffNights(visibleStart, visibleEnd));
                      const leftPx = offsetCols * colMinWidthPx + 4;
                      const widthPx = spanCols * colMinWidthPx - 8;
                      const isSelected = selectedBookingId === b.id;

                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onSelectBooking(b)}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                          }}
                          title={`${b.bookingCode || b.id}: ${b.guestName} (${b.nights}N · ${b.bookingStatus})`}
                          className={`absolute top-2 bottom-2 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-xs hover:brightness-105 transition-all cursor-pointer text-left z-10 overflow-hidden ${getStatusCardStyle(
                            b,
                            isSelected
                          )}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-full text-[9px] font-extrabold flex items-center justify-center shrink-0 ${
                                b.bookingStatus === 'Pending'
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-white/15 text-white'
                              }`}
                            >
                              {b.bookingStatus === 'Checked-in' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#B7F2DC]" />
                              ) : (
                                b.avatar
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate leading-tight">
                                {b.bookingCode || b.id}: {b.guestName}
                              </p>
                              <p
                                className={`text-[9px] font-medium truncate mt-0.5 tabular-nums ${
                                  b.bookingStatus === 'Pending' ? 'text-amber-900/80' : 'text-white/80'
                                }`}
                              >
                                {b.nights}N · {b.adults || 2} Adults · {b.paymentStatus}
                              </p>
                            </div>
                          </div>

                          {widthPx > 140 && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                b.bookingStatus === 'Checked-in'
                                  ? 'bg-[#B7F2DC] text-[#003D2E]'
                                  : b.bookingStatus === 'Pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white/20 text-white'
                              }`}
                            >
                              {b.bookingStatus}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Available Rooms Summary Footer Row */}
          <div className="flex bg-[#F7F6F3]/80">
            <div className="w-[230px] shrink-0 px-4 py-3 border-r border-[#E9ECE9] bg-[#F7F6F3] sticky left-0 z-10 flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#17221F]">Available Rooms</span>
              <span className="text-[10px] font-semibold text-[#777F7B]">Per Day</span>
            </div>
            <div className="flex flex-1">
              {availableRoomsPerDay.map((availCount, idx) => (
                <div
                  key={days[idx].iso}
                  style={{ width: `${colMinWidthPx}px` }}
                  className={`shrink-0 py-3 text-center text-xs font-extrabold tabular-nums border-r border-[#E9ECE9]/60 ${
                    availCount === 0
                      ? 'text-rose-700 bg-rose-50/50'
                      : days[idx].isToday
                        ? 'text-[#004B38] bg-[#B7F2DC]/35'
                        : 'text-[#004B38]'
                  }`}
                >
                  {availCount}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
