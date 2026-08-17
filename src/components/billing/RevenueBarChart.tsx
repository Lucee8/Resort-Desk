import React, { useState } from 'react';
import { RevenueMonthlyMetric } from '../../types';
import { initialMonthlyRevenueData } from '../../data/billingData';
import { Info, TrendingUp, Filter } from 'lucide-react';

interface RevenueBarChartProps {
  data?: RevenueMonthlyMetric[];
  onSelectMonth?: (month: string) => void;
}

export default function RevenueBarChart({
  data = initialMonthlyRevenueData,
  onSelectMonth
}: RevenueBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(5); // Default highlight June
  const [selectedRange, setSelectedRange] = useState<'6M' | '3M' | 'FY'>('6M');

  const chartData = selectedRange === '3M' ? data.slice(3) : data;

  // Max value calculation for bar height scaling (e.g. 35,00,000 max ceiling)
  const maxRevenue = 3000000; 

  const formatINR = (val: number) => {
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(2)} L`;
    }
    return `₹ ${new Intl.NumberFormat('en-IN').format(val)}`;
  };

  const formatExactINR = (val: number) => {
    return `₹ ${new Intl.NumberFormat('en-IN').format(val)}`;
  };

  return (
    <div id="revenue-analytics-chart-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue vs GST vs Refunds
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Last 6 months performance
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0c4033] inline-block" />
            <span className="text-[11px] font-semibold text-slate-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3730a3] inline-block" />
            <span className="text-[11px] font-semibold text-slate-600">GST</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] inline-block" />
            <span className="text-[11px] font-semibold text-slate-600">Refunds</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2 h-64 flex flex-col justify-end">
        {/* Horizontal background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-300 w-full" />
        </div>

        {/* Hover Tooltip display */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs shadow-lg flex items-center gap-4 z-20 border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="font-bold text-teal-300 border-r border-slate-700 pr-3">
              {chartData[hoveredIndex].month} 2023
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>Rev: <strong className="text-white font-semibold">{formatExactINR(chartData[hoveredIndex].revenue)}</strong></span>
              <span>GST: <strong className="text-indigo-300 font-semibold">{formatExactINR(chartData[hoveredIndex].gst)}</strong></span>
              <span>Refunds: <strong className="text-red-300 font-semibold">{formatExactINR(chartData[hoveredIndex].refunds)}</strong></span>
            </div>
          </div>
        )}

        {/* Grouped Bars Container */}
        <div className="relative z-10 flex items-end justify-between px-4 sm:px-8 h-48">
          {chartData.map((item, idx) => {
            const revHeightPct = Math.min(100, Math.max(10, (item.revenue / maxRevenue) * 100));
            const gstHeightPct = Math.min(100, Math.max(5, (item.gst / maxRevenue) * 100 * 2.8)); // scaled visually for clear proportions
            const refHeightPct = Math.min(100, Math.max(3, (item.refunds / maxRevenue) * 100 * 14)); // scaled visually

            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => onSelectMonth && onSelectMonth(item.month)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                {/* 3 Bars Cluster */}
                <div className="flex items-end gap-1.5 sm:gap-2 h-44">
                  {/* Revenue Bar (Dark Forest Green) */}
                  <div
                    style={{ height: `${revHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#0c4033] rounded-t-sm transition-all duration-300 ${
                      isHovered ? 'bg-[#082e25] ring-2 ring-teal-600/30 brightness-110 shadow-sm' : 'hover:brightness-105'
                    }`}
                  />
                  {/* GST Bar (Indigo) */}
                  <div
                    style={{ height: `${gstHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#3730a3] rounded-t-sm transition-all duration-300 ${
                      isHovered ? 'bg-[#312e81] ring-2 ring-indigo-500/30 brightness-110 shadow-sm' : 'hover:brightness-105'
                    }`}
                  />
                  {/* Refunds Bar (Crimson Red) */}
                  <div
                    style={{ height: `${refHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#dc2626] rounded-t-sm transition-all duration-300 ${
                      isHovered ? 'bg-[#b91c1c] ring-2 ring-red-500/30 brightness-110 shadow-sm' : 'hover:brightness-105'
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className={`text-xs transition-colors duration-150 ${
                  isHovered || idx === chartData.length - 1 
                    ? 'font-bold text-slate-900' 
                    : 'font-medium text-slate-500'
                }`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info & filter toggle */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/60 mt-1">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>GST calculated @ SAC 9963 applicable rates (12% / 18%)</span>
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedRange('6M')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
              selectedRange === '6M' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            6M
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange('3M')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
              selectedRange === '3M' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3M
          </button>
        </div>
      </div>
    </div>
  );
}
