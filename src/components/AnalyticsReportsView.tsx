import React, { useMemo } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  IndianRupee,
  BedDouble,
  Boxes,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import {
  Booking,
  BillingInvoice,
  HousekeepingTask,
  InventoryItem,
  MaintenanceTicket,
  OccupancyDay,
  RoomUnit,
} from '../types';
import { useAuth } from '../context/AuthContext';
import OccupancyChart from './OccupancyChart';
import { getTodayISO } from '../utils/bookingUtils';

interface AnalyticsReportsViewProps {
  bookings: Booking[];
  invoices: BillingInvoice[];
  rooms: RoomUnit[];
  inventoryItems: InventoryItem[];
  housekeeping: HousekeepingTask[];
  maintenanceTickets: MaintenanceTicket[];
  occupancyHistory: OccupancyDay[];
  occupancyRate: number;
  totalRevenue: number;
  pendingPayments: number;
  triggerToast: (msg: string) => void;
}

export default function AnalyticsReportsView({
  bookings,
  invoices,
  rooms,
  inventoryItems,
  housekeeping,
  maintenanceTickets,
  occupancyHistory,
  occupancyRate,
  totalRevenue,
  pendingPayments,
  triggerToast,
}: AnalyticsReportsViewProps) {
  const { role, hasPermission } = useAuth();
  const canExport = hasPermission('export_reports');
  const showFinancials =
    role === 'Administrator' || role === 'General Manager' || role === 'Accountant';
  const showInventory =
    role === 'Administrator' || role === 'General Manager' || role === 'Inventory Manager';
  const showOperations =
    role === 'Administrator' || role === 'General Manager';

  const gstSummary = useMemo(() => {
    const active = invoices.filter((i) => i.status !== 'Refunded');
    const totalGst = active.reduce((sum, i) => sum + (Number(i.gstAmount) || 0), 0);
    const totalPaid = active.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
    const refunded = invoices
      .filter((i) => i.status === 'Refunded')
      .reduce((sum, i) => sum + (Number(i.refundAmount) || 0), 0);
    return { totalGst, totalPaid, refunded, count: active.length };
  }, [invoices]);

  const inventorySummary = useMemo(() => {
    const totalValuation = inventoryItems.reduce(
      (sum, item) => sum + (Number(item.totalValue) || 0),
      0
    );
    const lowOrCritical = inventoryItems.filter(
      (i) => i.safetyLevel === 'Low' || i.safetyLevel === 'Critical' || i.safetyLevel === 'Out of Stock'
    ).length;
    return {
      skuCount: inventoryItems.length,
      totalValuation,
      lowOrCritical,
    };
  }, [inventoryItems]);

  const handleExportReport = () => {
    if (!canExport) {
      triggerToast('Your role does not allow exporting reports.');
      return;
    }

    const lines: string[][] = [['Section', 'Metric', 'Value']];
    if (showFinancials) {
      lines.push(['Finance', 'Total Collected Revenue (INR)', String(totalRevenue)]);
      lines.push(['Finance', 'Pending Balances (INR)', String(pendingPayments)]);
      lines.push(['Finance', 'Active Invoices Count', String(gstSummary.count)]);
      lines.push(['Finance', 'GST Collected (INR)', String(gstSummary.totalGst)]);
      lines.push(['Finance', 'Total Refunds (INR)', String(gstSummary.refunded)]);
    }
    if (showOperations) {
      lines.push(['Occupancy', 'Today Occupancy Rate (%)', `${occupancyRate}%`]);
      lines.push(['Bookings', 'Total Bookings', String(bookings.length)]);
      lines.push(['Rooms', 'Total Cottages', String(rooms.length)]);
    }
    if (showInventory) {
      lines.push(['Inventory', 'Total SKUs', String(inventorySummary.skuCount)]);
      lines.push([
        'Inventory',
        'Total Stock Valuation (INR)',
        String(inventorySummary.totalValuation),
      ]);
      lines.push(['Inventory', 'Low/Critical Items', String(inventorySummary.lowOrCritical)]);
    }

    const csv = lines
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykonos-analytics-report-${getTodayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Analytics report exported as CSV.');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-serif text-teal-950 tracking-tight">
              Analytics &amp; Operational Reports
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-bold">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live Firestore performance metrics scoped to your authorized Mykonos Cottage modules.
          </p>
        </div>

        {canExport && (
          <button
            type="button"
            onClick={handleExportReport}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#B7F2DC]" />
            <span>Export Report CSV</span>
          </button>
        )}
      </div>

      {/* Role-Scoped KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {showFinancials && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Collected Revenue
                </span>
                <IndianRupee className="w-4 h-4 text-[#004B38]" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {gstSummary.count} active invoices recorded
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  GST &amp; Pending
                </span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                ₹{gstSummary.totalGst.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                ₹{pendingPayments.toLocaleString('en-IN')} outstanding dues
              </p>
            </div>
          </>
        )}

        {showOperations && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today&apos;s Occupancy
              </span>
              <BedDouble className="w-4 h-4 text-teal-700" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{occupancyRate}%</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Across {rooms.length} cottages · {bookings.length} total stays
            </p>
          </div>
        )}

        {showInventory && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Inventory Valuation
              </span>
              <Boxes className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">
              ₹{inventorySummary.totalValuation.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {inventorySummary.skuCount} SKUs · {inventorySummary.lowOrCritical} low/critical alerts
            </p>
          </div>
        )}
      </div>

      {/* Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showOperations && (
          <OccupancyChart
            history={occupancyHistory}
            totalRooms={rooms.length}
            isLiveFirestore={true}
          />
        )}

        {showFinancials && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Financial &amp; Tax Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  GST invoices, collections, and credit notes
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-[#004B38]" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Settled Invoice Payments</span>
                <span className="font-bold text-emerald-700">
                  ₹{gstSummary.totalPaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Total GST Tax Collected</span>
                <span className="font-bold text-slate-900">
                  ₹{gstSummary.totalGst.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Refunds &amp; Credit Notes</span>
                <span className="font-bold text-rose-600">
                  ₹{gstSummary.refunded.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Outstanding Receivables</span>
                <span className="font-bold text-amber-700">
                  ₹{pendingPayments.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {showInventory && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stock &amp; Reorder Readiness</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items requiring immediate procurement attention
                </p>
              </div>
              <Boxes className="w-5 h-5 text-purple-700" />
            </div>

            {inventoryItems.filter((i) => i.safetyLevel !== 'Healthy').length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-700 font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span>All resort inventory stock levels are healthy.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {inventoryItems
                  .filter((i) => i.safetyLevel !== 'Healthy')
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.category} · {item.currentStock} / min {item.minStock} {item.unit}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.safetyLevel === 'Out of Stock' || item.safetyLevel === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.safetyLevel}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {showOperations && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Property Operations Health</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Housekeeping &amp; maintenance completion overview
                </p>
              </div>
              <Wrench className="w-5 h-5 text-[#a64b2a]" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-emerald-700 font-semibold">Rooms Verified Ready</p>
                <p className="text-xl font-extrabold text-emerald-950 mt-1">
                  {housekeeping.filter((h) => h.status === 'Verified').length} / {housekeeping.length}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-amber-800 font-semibold">Open Maintenance Tickets</p>
                <p className="text-xl font-extrabold text-amber-950 mt-1">
                  {
                    maintenanceTickets.filter(
                      (m) => m.status !== 'Closed' && m.status !== 'Resolved'
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
