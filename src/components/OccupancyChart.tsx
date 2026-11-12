import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Info, BarChart3, Check } from 'lucide-react';
import { OccupancyDay } from '../types';

interface OccupancyChartProps {
  history: OccupancyDay[];
  totalRooms?: number;
}

export default function OccupancyChart({ history, totalRooms = 35 }: OccupancyChartProps) {
  const [selectedRange, setSelectedRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 14-day and 30-day simulated trend sets based on actual 7-day baseline
  const dataSets: Record<'7d' | '14d' | '30d', { label: string; rate: number; bookings: number; adr: number; dateStr: string }[]> = useMemo(() => {
    const base7 = history.map((item, idx) => ({
      label: item.day,
      rate: item.rate,
      bookings: item.bookings,
      adr: 5400 + (item.rate * 25),
      dateStr: `Nov ${10 + idx}`
    }));

    const prev7 = [
      { label: 'Mon-1', rate: 72, bookings: 14, adr: 5100, dateStr: 'Nov 03' },
      { label: 'Tue-1', rate: 68, bookings: 13, adr: 5050, dateStr: 'Nov 04' },
      { label: 'Wed-1', rate: 70, bookings: 14, adr: 5100, dateStr: 'Nov 05' },
      { label: 'Thu-1', rate: 76, bookings: 15, adr: 5300, dateStr: 'Nov 06' },
      { label: 'Fri-1', rate: 84, bookings: 17, adr: 5800, dateStr: 'Nov 07' },
      { label: 'Sat-1', rate: 88, bookings: 18, adr: 6200, dateStr: 'Nov 08' },
      { label: 'Sun-1', rate: 80, bookings: 16, adr: 5600, dateStr: 'Nov 09' },
    ];

    const base14 = [...prev7, ...base7];

    const monthData = [
      { label: 'W1', rate: 74, bookings: 15, adr: 5200, dateStr: 'Oct 20-26' },
      { label: 'W2', rate: 79, bookings: 16, adr: 5400, dateStr: 'Oct 27-Nov 02' },
      { label: 'W3', rate: 77, bookings: 15, adr: 5350, dateStr: 'Nov 03-09' },
      { label: 'W4', rate: 85, bookings: 17, adr: 5850, dateStr: 'Nov 10-16' },
      { label: 'W5 (Proj)', rate: 91, bookings: 18, adr: 6200, dateStr: 'Nov 17-23' }
    ];

    return {
      '7d': base7,
      '14d': base14,
      '30d': monthData
    };
  }, [history]);

  const activeData = dataSets[selectedRange];

  // Calculate statistics
  const averageRate = useMemo(() => {
    if (!activeData.length) return 0;
    const sum = activeData.reduce((acc, curr) => acc + curr.rate, 0);
    return (sum / activeData.length).toFixed(1);
  }, [activeData]);

  const peakDay = useMemo(() => {
    if (!activeData.length) return null;
    return activeData.reduce((max, curr) => curr.rate > max.rate ? curr : max, activeData[0]);
  }, [activeData]);

  const maxValue = 100;

  return (
    <div id="occupancy-chart-card" className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">Occupancy Trend & Forecast</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Avg: {averageRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Beach cottage utilization at Mykonos Cottage, Tarkarli
          </p>
        </div>

        {/* Date Range Selector Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setSelectedRange('7d'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              selectedRange === '7d' 
                ? 'bg-white text-teal-900 shadow-2xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRange('14d'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              selectedRange === '14d' 
                ? 'bg-white text-teal-900 shadow-2xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            14 Days
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRange('30d'); setHoveredIndex(null); }}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              selectedRange === '30d' 
                ? 'bg-white text-teal-900 shadow-2xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Comparison Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="text-slate-500 font-medium">Peak Demand:</span>
          <span className="font-bold text-slate-900">{peakDay?.label} ({peakDay?.rate}%)</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-bold">+4.8% vs Malvan coastal avg</span>
        </div>
      </div>

      {/* SVG / CSS Bar Chart */}
      <div className="mt-2 flex-1 flex flex-col justify-end">
        <div className="relative w-full h-[140px] flex items-end justify-between px-1 gap-1">
          {activeData.map((item, index) => {
            const barHeightPercentage = (item.rate / maxValue) * 100;
            const isHovered = hoveredIndex === index;
            const isPeak = item.rate === (peakDay?.rate || 100);

            return (
              <div 
                key={`${item.label}-${index}`}
                className="flex flex-col items-center flex-1 group relative h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-xl shadow-xl z-30 flex flex-col items-start pointer-events-none min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-teal-300 font-bold text-[11px]">{item.dateStr} ({item.label})</span>
                    <span className="font-extrabold text-sm mt-0.5">{item.rate}% Occupancy</span>
                    <div className="w-full h-px bg-slate-700 my-1" />
                    <span className="text-slate-300 text-[9px] font-medium">
                      {Math.round((totalRooms * item.rate) / 100)} / {totalRooms} cottages active
                    </span>
                    <span className="text-slate-300 text-[9px] font-medium">
                      Est. ADR: ₹{item.adr.toLocaleString('en-IN')}
                    </span>
                    {/* Tiny arrow */}
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1" />
                  </div>
                )}

                {/* Animated Column Bar */}
                <div className="w-full max-w-[28px] flex flex-col justify-end h-full">
                  <div 
                    id={`chart-bar-${item.label}`}
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

                {/* Grid guidelines */}
                <div className="absolute inset-x-0 bottom-0 border-b border-slate-200/80" />
              </div>
            );
          })}
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
          {activeData.map((item, idx) => (
            <span key={`${item.label}-${idx}`} className="flex-1 text-center truncate">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
