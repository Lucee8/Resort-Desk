import React from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  Table2,
  CalendarDays,
  X,
} from 'lucide-react';
import { formatRangeLabel } from '../../utils/bookingUtils';
import { ROOM_CATEGORIES_META } from '../../services/bookingsService';

export type BookingViewMode = 'timeline' | 'table' | 'month';
export type RangeDaysOption = 7 | 14 | 30;
export type StatusTabFilter = 'All' | 'Confirmed' | 'Checked-in' | 'Pending' | 'Maint.';

interface BookingToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: StatusTabFilter;
  onStatusChange: (status: StatusTabFilter) => void;
  statusCounts: Record<StatusTabFilter, number>;
  startDateISO: string;
  onShiftDates: (deltaDays: number) => void;
  onJumpToday: () => void;
  rangeDays: RangeDaysOption;
  onRangeDaysChange: (days: RangeDaysOption) => void;
  viewMode: BookingViewMode;
  onViewModeChange: (mode: BookingViewMode) => void;
}

export default function BookingToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  startDateISO,
  onShiftDates,
  onJumpToday,
  rangeDays,
  onRangeDaysChange,
  viewMode,
  onViewModeChange,
}: BookingToolbarProps) {
  const tabs: StatusTabFilter[] = ['All', 'Confirmed', 'Checked-in', 'Pending', 'Maint.'];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Row 1: Search + Category Dropdown + Date Navigator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#777F7B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search guest, booking ID, room # or phone..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#E9ECE9] rounded-xl text-xs font-medium text-[#17221F] placeholder-[#777F7B] focus:outline-none focus:border-[#004B38] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777F7B] hover:text-[#17221F]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Room Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 bg-white border border-[#E9ECE9] rounded-xl text-xs font-bold text-[#17221F] focus:outline-none focus:border-[#004B38] cursor-pointer shadow-2xs"
          >
            <option value="All">All Room Categories ({ROOM_CATEGORIES_META.length} Types)</option>
            {ROOM_CATEGORIES_META.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Navigation & Range / View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white border border-[#E9ECE9] rounded-xl px-1.5 py-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onShiftDates(-rangeDays)}
              className="p-1.5 rounded-lg text-[#777F7B] hover:text-[#17221F] hover:bg-[#F7F6F3] transition-colors cursor-pointer"
              title="Previous period"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onJumpToday}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#17221F] hover:text-[#004B38] cursor-pointer whitespace-nowrap"
              title="Jump to today"
            >
              <Calendar className="w-3.5 h-3.5 text-[#004B38]" />
              <span>{formatRangeLabel(startDateISO, rangeDays)}</span>
            </button>
            <button
              type="button"
              onClick={() => onShiftDates(rangeDays)}
              className="p-1.5 rounded-lg text-[#777F7B] hover:text-[#17221F] hover:bg-[#F7F6F3] transition-colors cursor-pointer"
              title="Next period"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 7D / 14D / 30D Toggle */}
          <div className="flex items-center bg-white border border-[#E9ECE9] rounded-xl p-1 shadow-2xs">
            {([7, 14, 30] as RangeDaysOption[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onRangeDaysChange(days)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  rangeDays === days
                    ? 'bg-[#004B38] text-white'
                    : 'text-[#777F7B] hover:text-[#17221F]'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          {/* Timeline / Table / Month Switcher */}
          <div className="flex items-center bg-white border border-[#E9ECE9] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-[#004B38] text-white'
                  : 'text-[#777F7B] hover:text-[#17221F]'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#004B38] text-white'
                  : 'text-[#777F7B] hover:text-[#17221F]'
              }`}
            >
              <Table2 className="w-3 h-3" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#004B38] text-white'
                  : 'text-[#777F7B] hover:text-[#17221F]'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>Month</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Booking Status Filter Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onStatusChange(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-white text-[#17221F] border-[#004B38]/40 shadow-2xs'
                    : 'bg-transparent text-[#777F7B] border-transparent hover:bg-white/70 hover:text-[#17221F]'
                }`}
              >
                <span>{tab}</span>
                <span className="ml-1 text-[11px] font-semibold text-[#777F7B] tabular-nums">
                  ({statusCounts[tab] ?? 0})
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] font-semibold text-[#777F7B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003D2E]" />
            Checked-in
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
            Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            Deep Clean / Maint.
          </span>
        </div>
      </div>
    </div>
  );
}
