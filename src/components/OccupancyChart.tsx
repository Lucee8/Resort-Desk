import React, { useState } from 'react';
import { MoreHorizontal, Info } from 'lucide-react';
import { OccupancyDay } from '../types';

interface OccupancyChartProps {
  history: OccupancyDay[];
}

export default function OccupancyChart({ history }: OccupancyChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<'7days' | '30days'>('7days');

  // Max value for scaling
  const maxValue = 100;
  
  return (
    <div id="occupancy-chart-card" className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm font-sans flex flex-col justify-between h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">7-Day Occupancy</h3>
          <p className="text-[10px] text-slate-400 font-medium">Weekly occupancy percentage trend</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Chart range dropdown */}
          <select 
            id="chart-range-select"
            value={selectedRange} 
            onChange={(e) => {
              setSelectedRange(e.target.value as '7days' | '30days');
              alert("Range filter updated to " + (e.target.value === '7days' ? 'Past 7 Days' : 'Past Month'));
            }}
            className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-100"
          >
            <option value="7days">7 Days</option>
            <option value="30days">30 Days</option>
          </select>
          <button 
            id="chart-context-menu"
            onClick={() => alert("Daily insights: Weekend bookings are up by 15% due to the Local Seafood Festival!")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
            title="View insights"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="mt-4 flex-1 flex flex-col justify-end">
        <div className="relative w-full h-[140px] flex items-end justify-between px-2">
          {history.map((item, index) => {
            const barHeightPercentage = (item.rate / maxValue) * 100;
            const isHovered = hoveredBar === item.day;
            
            return (
              <div 
                key={item.day}
                className="flex flex-col items-center flex-1 group relative h-full justify-end"
                onMouseEnter={() => setHoveredBar(item.day)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] py-1.5 px-2.5 rounded-xl shadow-lg z-20 flex flex-col items-center pointer-events-none transition-all duration-150 animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-bold">{item.rate}% Occupied</span>
                    <span className="text-slate-300 text-[9px]">{item.bookings} Active Bookings</span>
                    {/* Tiny arrow */}
                    <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 mt-0.5 absolute top-full -translate-y-[4px]" />
                  </div>
                )}

                {/* Animated Column Bar */}
                <div className="w-5 flex flex-col justify-end h-full">
                  <div 
                    id={`chart-bar-${item.day}`}
                    className={`w-full rounded-t-lg transition-all duration-500 origin-bottom cursor-pointer ${
                      isHovered 
                        ? 'bg-teal-700 shadow-md shadow-teal-700/20' 
                        : item.rate >= 90
                          ? 'bg-teal-800/90'
                          : item.rate >= 80
                            ? 'bg-teal-700/80'
                            : 'bg-teal-600/60'
                    }`}
                    style={{ height: `${barHeightPercentage}%` }}
                  />
                </div>

                {/* Grid guidelines */}
                <div className="absolute inset-x-0 bottom-0 border-b border-slate-100" />
              </div>
            );
          })}
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-4">
          {history.map((item) => (
            <span key={item.day} className="w-5 text-center">{item.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
