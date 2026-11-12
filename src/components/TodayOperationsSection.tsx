import React from 'react';
import { 
  Brush, 
  Wrench, 
  Receipt, 
  Bed, 
  CalendarClock, 
  ArrowRight, 
  AlertCircle,
  Activity
} from 'lucide-react';

interface TodayOperationsSectionProps {
  pendingHousekeepingCount: number;
  openMaintenanceCount: number;
  pendingPaymentsAmount: number;
  vacantRoomsCount?: number;
  unconfirmedBookingsCount?: number;
  onNavigateTab: (tab: string) => void;
  onReviewBilling?: (name: string, amt: number) => void;
}

export default function TodayOperationsSection({
  pendingHousekeepingCount,
  openMaintenanceCount,
  pendingPaymentsAmount,
  vacantRoomsCount = 6,
  unconfirmedBookingsCount = 2,
  onNavigateTab,
  onReviewBilling
}: TodayOperationsSectionProps) {
  // Format numbers to Indian currency (INR)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const operationalItems = [
    {
      id: 'housekeeping',
      label: 'Housekeeping Queue',
      value: `${pendingHousekeepingCount} Tasks`,
      detail: 'Rooms requiring inspection & turnover',
      status: pendingHousekeepingCount > 0 ? 'Action Needed' : 'All Clear',
      statusColor: pendingHousekeepingCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Brush,
      iconBg: 'bg-teal-50 text-teal-800',
      tab: 'housekeeping',
      actionText: 'View Cleaning Queue'
    },
    {
      id: 'maintenance',
      label: 'Open Maintenance',
      value: `${openMaintenanceCount} Work Orders`,
      detail: '1 urgent AC drip ticket in Room 402',
      status: openMaintenanceCount > 0 ? '1 High Priority' : 'Zero Active',
      statusColor: openMaintenanceCount > 0 ? 'bg-orange-50 text-[#a64b2a] border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Wrench,
      iconBg: 'bg-orange-50 text-[#a64b2a]',
      tab: 'maintenance',
      actionText: 'Dispatch Technician'
    },
    {
      id: 'billing',
      label: 'Pending Folios',
      value: formatCurrency(pendingPaymentsAmount),
      detail: '2 departures with uncollected balance',
      status: pendingPaymentsAmount > 0 ? 'Payment Due' : 'Settled',
      statusColor: pendingPaymentsAmount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Receipt,
      iconBg: 'bg-rose-50 text-rose-700',
      tab: 'billing',
      actionText: 'Review Balances',
      customAction: () => onReviewBilling ? onReviewBilling('Amit Shah', 4500) : onNavigateTab('billing')
    },
    {
      id: 'rooms',
      label: 'Unassigned / Vacant',
      value: `${vacantRoomsCount} Cottages`,
      detail: 'Ready for walk-in arrivals & booking',
      status: 'Available Now',
      statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      icon: Bed,
      iconBg: 'bg-indigo-50 text-indigo-700',
      tab: 'rooms',
      actionText: 'View Cottage Map'
    },
    {
      id: 'whatsapp',
      label: 'Unconfirmed Holds',
      value: `${unconfirmedBookingsCount} Holds`,
      detail: 'Tentative WhatsApp reservations pending ID',
      status: 'Expiring Today',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: CalendarClock,
      iconBg: 'bg-emerald-50 text-emerald-800',
      tab: 'whatsapp',
      actionText: 'Check WhatsApp Holds'
    }
  ];

  return (
    <div id="today-operations-section" className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Operations Hub</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                Live Status
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time operational bottlenecks across Mykonos Cottage property departments
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Click any department card to manage tasks
        </div>
      </div>

      {/* Operational Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
        {operationalItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              id={`operations-card-${item.id}`}
              key={item.id}
              onClick={() => {
                if (item.customAction) {
                  item.customAction();
                } else {
                  onNavigateTab(item.tab);
                }
              }}
              role="button"
              tabIndex={0}
              className="group p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-teal-700/40 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-500">{item.label}</h4>
                <div className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {item.value}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug mt-1 font-medium">
                  {item.detail}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-800 group-hover:text-teal-950">
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
