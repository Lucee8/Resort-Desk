import React from 'react';
import { Bed, TrendingUp, DollarSign, LogIn, LogOut } from 'lucide-react';
import { ResortStats } from '../types';

interface StatsGridProps {
  stats: ResortStats;
  onAdjustStats?: () => void;
}

export default function StatsGrid({ stats, onAdjustStats }: StatsGridProps) {
  // Format numbers to Indian currency (INR)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full font-sans">
      {/* 1. Today's Occupancy Card */}
      <div 
        id="stat-card-occupancy"
        className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xl">
            <Bed className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{stats.occupancyGrowth}%
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Occupancy
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {stats.occupancyRate}%
          </h3>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-teal-700/10 group-hover:bg-teal-700/30 transition-colors" />
      </div>

      {/* 2. Today's Revenue Card */}
      <div 
        id="stat-card-revenue"
        className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-orange-50 text-orange-700 rounded-xl">
            {/* Custom Indian Rupee Icon or Dollar Sign */}
            <span className="font-sans font-bold text-base leading-none block w-5 h-5 flex items-center justify-center">₹</span>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{stats.revenueGrowth}%
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Revenue
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {formatCurrency(stats.revenue)}
          </h3>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-orange-500/10 group-hover:bg-orange-500/30 transition-colors" />
      </div>

      {/* 3. Arrivals Today Card */}
      <div 
        id="stat-card-arrivals"
        className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <LogIn className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
            Expected
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Arrivals Today
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {stats.arrivalsTodayCount}
          </h3>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-600/10 group-hover:bg-emerald-600/30 transition-colors" />
      </div>

      {/* 4. Departures Today Card */}
      <div 
        id="stat-card-departures"
        className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">
            Scheduled
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Departures Today
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {stats.departuresTodayCount}
          </h3>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-rose-600/10 group-hover:bg-rose-600/30 transition-colors" />
      </div>
    </div>
  );
}
