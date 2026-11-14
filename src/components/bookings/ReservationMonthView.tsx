import React from 'react';
import { Booking, RoomUnit } from '../../types';
import {
  getTodayISO,
  isBookingOccupyingDate,
  parseISODate,
  toISODate,
} from '../../utils/bookingUtils';

interface ReservationMonthViewProps {
  bookings: Booking[];
  rooms: RoomUnit[];
  anchorDateISO: string;
  onSelectBooking: (booking: Booking) => void;
}

export default function ReservationMonthView({
  bookings,
  rooms,
  anchorDateISO,
  onSelectBooking,
}: ReservationMonthViewProps) {
  const anchor = parseISODate(anchorDateISO);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const todayISO = getTodayISO();

  const firstDay = new Date(year, month, 1, 12, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
  const startOffset = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const cells: Array<{ iso: string; dayNum: number } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month, d, 12, 0, 0);
    cells.push({ iso: toISODate(dt), dayNum: d });
  }

  const monthTitle = firstDay.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const totalRoomsCount = Math.max(1, rooms.length);

  return (
    <div className="bg-white rounded-2xl border border-[#E9ECE9] p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#17221F]">{monthTitle}</h3>
          <p className="text-xs text-[#777F7B]">
            Monthly room occupancy overview across {totalRoomsCount} Mykonos Cottage units
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-[#777F7B] py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="min-h-[96px] rounded-xl bg-[#F7F6F3]/40" />;
          }

          const dayBookings = bookings.filter(
            (b) => b.bookingStatus !== 'Cancelled' && isBookingOccupyingDate(b, cell.iso)
          );
          const occPct = Math.min(
            100,
            Math.round((dayBookings.length / totalRoomsCount) * 100)
          );
          const isToday = cell.iso === todayISO;

          return (
            <div
              key={cell.iso}
              className={`min-h-[104px] rounded-xl border p-2 flex flex-col justify-between transition-colors ${
                isToday
                  ? 'border-[#004B38] bg-[#B7F2DC]/20'
                  : 'border-[#E9ECE9] bg-white hover:bg-[#F7F6F3]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold tabular-nums ${
                    isToday ? 'text-[#004B38]' : 'text-[#17221F]'
                  }`}
                >
                  {cell.dayNum}
                </span>
                <span className="text-[9px] font-bold text-[#777F7B] tabular-nums">
                  {occPct}%
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-1.5 overflow-hidden">
                {dayBookings.slice(0, 2).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBooking(b)}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer ${
                      b.bookingStatus === 'Checked-in'
                        ? 'bg-[#003D2E] text-white'
                        : b.bookingStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-[#067A5A] text-white'
                    }`}
                  >
                    {b.roomNumber.replace('Cottage ', 'C')} · {b.guestName.split(' ')[0]}
                  </button>
                ))}
                {dayBookings.length > 2 && (
                  <span className="text-[9px] font-bold text-[#004B38] pl-1">
                    +{dayBookings.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
