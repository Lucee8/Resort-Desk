import React, { useState } from 'react';
import { RevenueMonthlyMetric } from '../../types';
import { Info } from 'lucide-react';

interface RevenueBarChartProps {
  data: RevenueMonthlyMetric[];
  onSelectMonth?: (month: string) => void;
}

export default function RevenueBarChart({ data, onSelectMonth }: RevenueBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    data.length > 0 ? data.length - 1 : null
  );
  const [selectedRange, setSelectedRange] = useState<'6M' | '3M'>('6M');

  const chartData = selectedRange === '3M' ? data.slice(-3) : data;
  const maxRevenue = Math.max(
    100000,
    ...chartData.map((d) => Math.max(d.revenue, d.gst, d.refunds))
  );
  const currentYear = new Date().getFullYear();

  const formatExactINR = (val: number) =>
    `₹ ${new Intl.NumberFormat('en-IN').format(Math.round(val))}`;

  return (
    <div
      id="revenue-analytics-chart-card"
      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full"
    >
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue vs GST vs Refunds
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Derived from live ledger invoices ({selectedRange === '3M' ? 'Last 3 months' : 'Last 6 months'})
          </p>
        </div>

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
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-200 border-dashed w-full" />
          <div className="border-b border-slate-300 w-full" />
        </div>

        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-xl text-xs shadow-lg flex items-center gap-4 z-20 border border-slate-700 pointer-events-none max-w-full overflow-x-auto">
            <div className="font-bold text-teal-300 border-r border-slate-700 pr-3 shrink-0">
              {chartData[hoveredIndex].month} {currentYear}
            </div>
            <div className="flex items-center gap-3 text-[11px] shrink-0">
              <span>
                Rev:{' '}
                <strong className="text-white font-semibold">
                  {formatExactINR(chartData[hoveredIndex].revenue)}
                </strong>
              </span>
              <span>
                GST:{' '}
                <strong className="text-indigo-300 font-semibold">
                  {formatExactINR(chartData[hoveredIndex].gst)}
                </strong>
              </span>
              <span>
                Refunds:{' '}
                <strong className="text-red-300 font-semibold">
                  {formatExactINR(chartData[hoveredIndex].refunds)}
                </strong>
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 flex items-end justify-between px-4 sm:px-8 h-48">
          {chartData.map((item, idx) => {
            const revHeightPct = item.revenue > 0 ? Math.min(100, Math.max(8, (item.revenue / maxRevenue) * 100)) : 4;
            const gstHeightPct = item.gst > 0 ? Math.min(100, Math.max(6, (item.gst / maxRevenue) * 100 * 2)) : 2;
            const refHeightPct = item.refunds > 0 ? Math.min(100, Math.max(6, (item.refunds / maxRevenue) * 100 * 3)) : 2;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => {
                  setHoveredIndex(idx);
                  onSelectMonth?.(item.month);
                }}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="flex items-end gap-1.5 sm:gap-2 h-44">
                  <div
                    style={{ height: `${revHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#0c4033] rounded-t-sm transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#082e25] ring-2 ring-teal-600/30 brightness-110 shadow-sm'
                        : 'hover:brightness-105'
                    }`}
                  />
                  <div
                    style={{ height: `${gstHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#3730a3] rounded-t-sm transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#312e81] ring-2 ring-indigo-500/30 brightness-110 shadow-sm'
                        : 'hover:brightness-105'
                    }`}
                  />
                  <div
                    style={{ height: `${refHeightPct}%` }}
                    className={`w-3.5 sm:w-5 bg-[#dc2626] rounded-t-sm transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#b91c1c] ring-2 ring-red-500/30 brightness-110 shadow-sm'
                        : 'hover:brightness-105'
                    }`}
                  />
                </div>

                <span
                  className={`text-xs transition-colors duration-150 ${
                    isHovered || idx === chartData.length - 1
                      ? 'font-bold text-slate-900'
                      : 'font-medium text-slate-500'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

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
