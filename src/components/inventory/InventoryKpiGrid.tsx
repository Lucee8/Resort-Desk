import React from 'react';
import { 
  Package, 
  AlertCircle, 
  Truck, 
  CalendarClock, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

interface InventoryKpiGridProps {
  totalItemsCount: number;
  lowStockCount: number;
  recentDeliveriesCount: number;
  pendingOrdersCount: number;
  onFilterLowStock?: () => void;
  onViewDeliveries?: () => void;
  onViewPendingOrders?: () => void;
}

export default function InventoryKpiGrid({
  totalItemsCount,
  lowStockCount,
  recentDeliveriesCount,
  pendingOrdersCount,
  onFilterLowStock,
  onViewDeliveries,
  onViewPendingOrders
}: InventoryKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Items Card */}
      <div 
        id="kpi-total-items"
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/60">
            <Package className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            <TrendingUp className="w-3 h-3 text-teal-600" />
            +2 this week
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-500 block">
            Total Items
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {totalItemsCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Across 8 categories
            </span>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Alerts Card (Orange/Critical state) */}
      <div 
        id="kpi-low-stock-alerts"
        onClick={onFilterLowStock}
        className="bg-white rounded-3xl p-5 border border-amber-200/80 bg-amber-50/20 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-[#fde8c2] px-2.5 py-1 rounded-full border border-amber-300">
            Critical
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-600 block">
            Low Stock Alerts
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-bold font-mono text-amber-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
              {lowStockCount < 10 ? `0${lowStockCount}` : lowStockCount}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 group-hover:underline flex items-center gap-0.5">
              Requires attention
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recent Deliveries Card */}
      <div 
        id="kpi-recent-deliveries"
        onClick={onViewDeliveries}
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#faece4] text-[#a64b2a] flex items-center justify-center border border-[#f5d9cd]">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Verified
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-500 block">
            Recent Deliveries
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight group-hover:text-[#a64b2a] transition-colors">
              {recentDeliveriesCount < 10 ? `0${recentDeliveriesCount}` : recentDeliveriesCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pending Orders Card */}
      <div 
        id="kpi-pending-orders"
        onClick={onViewPendingOrders}
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#faece4] text-[#a64b2a] flex items-center justify-center border border-[#f5d9cd]">
            <CalendarClock className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
            In Pipeline
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-500 block">
            Pending Orders
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight group-hover:text-teal-900 transition-colors">
              {pendingOrdersCount < 10 ? `0${pendingOrdersCount}` : pendingOrdersCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Purchase orders
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
