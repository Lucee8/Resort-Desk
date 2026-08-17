import React from 'react';
import { TrendingUp, Clock, ArrowUpRight, HelpCircle } from 'lucide-react';
import { BillingInvoice } from '../../types';

interface BillingKPICardsProps {
  invoices: BillingInvoice[];
  netRevenue?: number;
  collected?: number;
  pending?: number;
  gstLiable?: number;
  refunds?: number;
  refundsCount?: number;
  onFilterStatus?: (status: string) => void;
  activeFilter?: string;
}

export default function BillingKPICards({
  invoices,
  netRevenue = 2450000,
  collected = 2180000,
  pending = 270000,
  gstLiable = 441000,
  refunds = 45000,
  refundsCount = 3,
  onFilterStatus,
  activeFilter
}: BillingKPICardsProps) {
  // Format Indian Rupees helper (e.g. 24,50,000)
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div id="billing-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. NET REVENUE CARD */}
      <div 
        id="kpi-card-net-revenue"
        onClick={() => onFilterStatus && onFilterStatus('ALL')}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
      >
        <div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-[11px] font-bold tracking-wider uppercase">Net Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1 text-slate-900">
            <span className="text-sm font-semibold text-slate-600">₹</span>
            <span className="text-2xl lg:text-3xl font-bold tracking-tight font-sans">
              {formatINR(netRevenue)}
            </span>
          </div>
        </div>
        <div className="mt-3.5 flex items-center gap-1">
          <span className="text-xs font-semibold text-emerald-600">
            +12.4% vs last month
          </span>
        </div>
      </div>

      {/* 2. COLLECTED CARD */}
      <div 
        id="kpi-card-collected"
        onClick={() => onFilterStatus && onFilterStatus('Paid')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
          activeFilter === 'Paid' ? 'border-[#0c4033] ring-2 ring-[#0c4033]/15 shadow-sm' : 'border-slate-200/80 hover:shadow-md'
        }`}
      >
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            Collected
          </span>
          <div className="mt-2.5 flex items-baseline gap-1 text-slate-900">
            <span className="text-sm font-semibold text-slate-600">₹</span>
            <span className="text-2xl font-bold tracking-tight font-sans">
              {formatINR(collected)}
            </span>
          </div>
        </div>
        <div className="mt-3.5">
          {/* Progress bar pill */}
          <div className="h-1.5 w-16 bg-[#0c4033] rounded-full" />
        </div>
      </div>

      {/* 3. PENDING CARD */}
      <div 
        id="kpi-card-pending"
        onClick={() => onFilterStatus && onFilterStatus('Pending')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
          activeFilter === 'Pending' ? 'border-amber-700 ring-2 ring-amber-700/15 shadow-sm' : 'border-slate-200/80 hover:shadow-md'
        }`}
      >
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            Pending
          </span>
          <div className="mt-2.5 flex items-baseline gap-1 text-slate-900">
            <span className="text-sm font-semibold text-slate-600">₹</span>
            <span className="text-2xl font-bold tracking-tight font-sans">
              {formatINR(pending)}
            </span>
          </div>
        </div>
        <div className="mt-3.5">
          {/* Progress bar pill */}
          <div className="h-1.5 w-10 bg-amber-800/90 rounded-full" />
        </div>
      </div>

      {/* 4. GST LIABLE CARD */}
      <div 
        id="kpi-card-gst"
        onClick={() => onFilterStatus && onFilterStatus('ALL')}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
      >
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            GST Liable
          </span>
          <div className="mt-2.5 flex items-baseline gap-1 text-indigo-700">
            <span className="text-sm font-semibold text-indigo-500">₹</span>
            <span className="text-2xl font-bold tracking-tight font-sans">
              {formatINR(gstLiable)}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-md border border-indigo-100/80">
            18% Avg
          </span>
        </div>
      </div>

      {/* 5. REFUNDS CARD */}
      <div 
        id="kpi-card-refunds"
        onClick={() => onFilterStatus && onFilterStatus('Refunded')}
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
          activeFilter === 'Refunded' ? 'border-red-600 ring-2 ring-red-600/15 shadow-sm' : 'border-slate-200/80 hover:shadow-md'
        }`}
      >
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            Refunds
          </span>
          <div className="mt-2.5 flex items-baseline gap-1 text-red-600">
            <span className="text-sm font-semibold text-red-500">₹</span>
            <span className="text-2xl font-bold tracking-tight font-sans">
              {formatINR(refunds)}
            </span>
          </div>
        </div>
        <div className="mt-3.5 flex items-center gap-1.5 text-slate-500 text-xs font-normal">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{refundsCount} claims</span>
        </div>
      </div>
    </div>
  );
}
