import React from 'react';
import { Bed, TrendingUp, LogIn, LogOut, ArrowUpRight } from 'lucide-react';
import { ResortStats } from '../types';

interface StatsGridProps {
  stats: ResortStats;
  totalRooms?: number;
  checkedInArrivals?: number;
  clearedDepartures?: number;
  onNavigateTab?: (tab: string) => void;
  onAdjustStats?: () => void;
}

export default function StatsGrid({ 
  stats, 
  totalRooms = 35,
  checkedInArrivals = 1,
  clearedDepartures = 2,
  onNavigateTab 
}: StatsGridProps) {
  // Format numbers to Indian currency (INR)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const occupiedRooms = Math.round((totalRooms * stats.occupancyRate) / 100);
  const vacantRooms = totalRooms - occupiedRooms;
  const pendingArrivals = Math.max(0, stats.arrivalsTodayCount - checkedInArrivals);
  const pendingDepartures = Math.max(0, stats.departuresTodayCount - clearedDepartures);

  return (
    <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full font-sans">
      {/* 1. Today's Occupancy Card */}
      <div 
        id="stat-card-occupancy"
        onClick={() => onNavigateTab?.('rooms')}
        role="button"
        tabIndex={0}
        title="Click to view Room Management & Category Inventory"
        className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md hover:border-teal-700/40 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xl group-hover:bg-teal-800 group-hover:text-white transition-colors">
            <Bed className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              +{stats.occupancyGrowth}%
            </span>
            <span className="text-slate-300 group-hover:text-teal-700 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Occupancy
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.occupancyRate}%
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              ({occupiedRooms}/{totalRooms} rooms)
            </span>
          </div>

          {/* Supporting Room Breakdown Progress */}
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-teal-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
              <span>{occupiedRooms} occupied cottages</span>
              <span className="text-emerald-700 font-semibold">{vacantRooms} vacant</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-teal-700/10 group-hover:bg-teal-700 transition-colors" />
      </div>

      {/* 2. Today's Revenue Card */}
      <div 
        id="stat-card-revenue"
        onClick={() => onNavigateTab?.('billing')}
        role="button"
        tabIndex={0}
        title="Click to view Financial Invoices & GST Ledgers"
        className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md hover:border-amber-700/40 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl group-hover:bg-[#a64b2a] group-hover:text-white transition-colors">
            <span className="font-serif font-bold text-base leading-none block w-5 h-5 flex items-center justify-center">₹</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              +{stats.revenueGrowth}%
            </span>
            <span className="text-slate-300 group-hover:text-[#a64b2a] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Revenue
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(stats.revenue)}
            </h3>
          </div>

          {/* Supporting Payment Outstanding Info */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-100/70 text-amber-900 font-medium">
              <span>Pending Folios:</span>
              <span className="font-bold text-amber-950">{formatCurrency(stats.pendingPaymentsAmount)}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium text-right">
              Click to view billing ledger
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#a64b2a]/10 group-hover:bg-[#a64b2a] transition-colors" />
      </div>

      {/* 3. Arrivals Today Card */}
      <div 
        id="stat-card-arrivals"
        onClick={() => onNavigateTab?.('bookings')}
        role="button"
        tabIndex={0}
        title="Click to view Bookings & Guest Check-in desk"
        className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md hover:border-emerald-700/40 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              {checkedInArrivals} Checked In
            </span>
            <span className="text-slate-300 group-hover:text-emerald-700 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Arrivals
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.arrivalsTodayCount}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              guest arrivals
            </span>
          </div>

          {/* Supporting Check-in Breakdown */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-medium">
              <span className="text-slate-500">Remaining Today:</span>
              <span className="font-bold text-teal-800">{pendingArrivals} pending arrival</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium text-right">
              Earliest arrival: 01:30 PM
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-600/10 group-hover:bg-emerald-600 transition-colors" />
      </div>

      {/* 4. Departures Today Card */}
      <div 
        id="stat-card-departures"
        onClick={() => onNavigateTab?.('bookings')}
        role="button"
        tabIndex={0}
        title="Click to view Bookings & Guest Check-outs"
        className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs hover:shadow-md hover:border-rose-700/40 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl group-hover:bg-rose-800 group-hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              {clearedDepartures} Cleared
            </span>
            <span className="text-slate-300 group-hover:text-rose-700 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Today's Departures
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.departuresTodayCount}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              guest departures
            </span>
          </div>

          {/* Supporting Departure Breakdown */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-medium">
              <span className="text-slate-500">Pending Checkout:</span>
              <span className="font-bold text-rose-800">{pendingDepartures} remaining</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium text-right">
              Standard checkout: 11:00 AM
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-rose-600/10 group-hover:bg-rose-600 transition-colors" />
      </div>
    </div>
  );
}
