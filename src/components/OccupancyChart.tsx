import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { OccupancyDay } from '../types';

interface OccupancyChartProps {
  history: OccupancyDay[];
  totalRooms?: number;
  isLiveFirestore?: boolean;
}

export default function OccupancyChart({ history, totalRooms = 7, isLiveFirestore = false }: OccupancyChartProps) {
  const [selectedRange, setSelectedRange] = useState<'all' | 'weekday' | 'weekend'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeData = useMemo(() => {
    if (selectedRange === 'weekday') {
      return history.filter(d => ['Mon', 'Tue', 'Wed', 'Thu'].includes(d.day));
    }
    if (selectedRange === 'weekend') {
      return history.filter(d => ['Fri', 'Sat', 'Sun'].includes(d.day));
    }
    return history;
  }, [history, selectedRange]);

  const weeklyAverage = useMemo(() => {
    if (!history.length) return 0;
    const sum = history.reduce((acc, curr) => acc + curr.rate, 0);
    return sum / history.length;
  }, [history]);

  const selectedAverage = useMemo(() => {
    if (!activeData.length) return 0;
    const sum = activeData.reduce((acc, curr) => acc + curr.rate, 0);
    return sum / activeData.length;
  }, [activeData]);

  const peakDay = useMemo(() => {
    if (!activeData.length) return null;
    return activeData.reduce((max, curr) => (curr.rate > max.rate ? curr : max), activeData[0]);
  }, [activeData]);

  const weekendVsWeekdayDelta = useMemo(() => {
    const weekdays = history.filter(d => ['Mon', 'Tue', 'Wed', 'Thu'].includes(d.day));
    const weekend = history.filter(d => ['Fri', 'Sat', 'Sun'].includes(d.day));
    if (!weekdays.length || !weekend.length) return 0;
    const wdAvg = weekdays.reduce((s, d) => s + d.rate, 0) / weekdays.length;
    const weAvg = weekend.reduce((s, d) => s + d.rate, 0) / weekend.length;
    return Number((weAvg - wdAvg).toFixed(1));
  }, [history]);

  const selectedVsWeekDelta = Number((selectedAverage - weeklyAverage).toFixed(1));
  const maxValue = 100;

  return (
    <div id="occupancy-chart-card" className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800">7-Day Occupancy</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Avg: {selectedAverage.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {isLiveFirestore ? 'Live' : 'Derived'} 7-day cottage utilization ({totalRooms} rooms)
          </p>
        </div>

        {/* Date Range Selector over real 7-day dataset */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setSelectedRange('all'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRange === 'all'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRange('weekday'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRange === 'weekday'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mon–Thu
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRange('weekend'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRange === 'weekend'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fri–Sun
          </button>
        </div>
      </div>

      {/* Real Comparison Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
          <span className="text-slate-500 font-medium">Peak Day:</span>
          <span className="font-bold text-slate-900">
            {peakDay ? `${peakDay.day} (${peakDay.rate}%)` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:justify-end">
          {selectedRange === 'all' ? (
            <>
              {weekendVsWeekdayDelta >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span className={`font-bold ${weekendVsWeekdayDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {weekendVsWeekdayDelta >= 0 ? '+' : ''}{weekendVsWeekdayDelta}% weekend vs Mon–Thu
              </span>
            </>
          ) : (
            <>
              {selectedVsWeekDelta >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span className={`font-bold ${selectedVsWeekDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {selectedVsWeekDelta >= 0 ? '+' : ''}{selectedVsWeekDelta}% vs 7-day avg
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mt-2 flex-1 flex flex-col justify-end">
        <div className="relative w-full h-[145px] flex items-end justify-between px-1 gap-1.5">
          {activeData.map((item, index) => {
            const barHeightPercentage = (item.rate / maxValue) * 100;
            const isHovered = hoveredIndex === index;
            const isPeak = item.rate === (peakDay?.rate || 100);
            const deltaVsAvg = Number((item.rate - weeklyAverage).toFixed(1));
            const estimatedRooms = Math.round((totalRooms * item.rate) / 100);

            return (
              <div
                key={`${item.day}-${index}`}
                className="flex flex-col items-center flex-1 group relative h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(isHovered ? null : index)}
              >
                {/* Detailed Hover/Tap Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-xl shadow-xl z-30 flex flex-col items-start pointer-events-none min-w-[140px]">
                    <span className="text-teal-300 font-bold text-[11px]">{item.day} Occupancy</span>
                    <span className="font-extrabold text-sm mt-0.5">{item.rate}%</span>
                    <div className="w-full h-px bg-slate-700 my-1" />
                    <span className="text-slate-300 text-[9px] font-medium">
                      {item.bookings} bookings • {estimatedRooms}/{totalRooms} rooms
                    </span>
                    <span className={`text-[9px] font-semibold mt-0.5 ${deltaVsAvg >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {deltaVsAvg >= 0 ? '+' : ''}{deltaVsAvg}% vs 7-day avg
                    </span>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1" />
                  </div>
                )}

                {/* Value label above bar */}
                <span className="text-[9px] font-bold text-slate-500 mb-1">
                  {item.rate}%
                </span>

                {/* Animated Column Bar */}
                <div className="w-full max-w-[30px] flex flex-col justify-end flex-1">
                  <div
                    id={`chart-bar-${item.day}`}
                    className={`w-full rounded-t-lg transition-all duration-300 origin-bottom ${
                      isHovered
                        ? 'bg-teal-600 shadow-md shadow-teal-700/30 ring-2 ring-teal-400'
                        : isPeak
                          ? 'bg-teal-800'
                          : item.rate >= 80
                            ? 'bg-teal-700/85'
                            : 'bg-teal-600/60'
                    }`}
                    style={{ height: `${barHeightPercentage}%` }}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 border-b border-slate-200/80" />
              </div>
            );
          })}
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-2 px-1">
          {activeData.map((item, idx) => (
            <span key={`${item.day}-${idx}`} className="flex-1 text-center truncate">
              {item.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
