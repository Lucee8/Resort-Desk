import React from 'react';
import {
  Brush,
  Wrench,
  Receipt,
  Bed,
  CalendarClock,
  ArrowRight,
  Activity
} from 'lucide-react';

export interface OperationsNavigationOptions {
  housekeepingFilter?: 'All' | 'Urgent' | 'Unassigned' | 'Assigned';
  maintenanceFilter?: 'all' | 'high_priority' | 'unassigned' | 'completed';
  billingFilter?: string;
  bookingsStatus?: string;
  bookingsSearch?: string;
}

interface TodayOperationsSectionProps {
  pendingHousekeepingCount: number;
  urgentHousekeepingCount: number;
  openMaintenanceCount: number;
  highPriorityMaintenanceCount: number;
  topMaintenanceLabel?: string;
  pendingPaymentsAmount: number;
  pendingPaymentsGuestsCount: number;
  unassignedRoomsCount: number;
  vacantRoomsCount: number;
  unconfirmedBookingsCount: number;
  onNavigateModule: (tab: string, options?: OperationsNavigationOptions) => void;
}

export default function TodayOperationsSection({
  pendingHousekeepingCount,
  urgentHousekeepingCount,
  openMaintenanceCount,
  highPriorityMaintenanceCount,
  topMaintenanceLabel,
  pendingPaymentsAmount,
  pendingPaymentsGuestsCount,
  unassignedRoomsCount,
  vacantRoomsCount,
  unconfirmedBookingsCount,
  onNavigateModule
}: TodayOperationsSectionProps) {
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
      label: 'Pending Housekeeping',
      value: `${pendingHousekeepingCount} ${pendingHousekeepingCount === 1 ? 'Task' : 'Tasks'}`,
      detail:
        pendingHousekeepingCount > 0
          ? `${urgentHousekeepingCount} urgent room turnover${urgentHousekeepingCount === 1 ? '' : 's'} pending`
          : 'All rooms verified clean',
      status: urgentHousekeepingCount > 0 ? `${urgentHousekeepingCount} Urgent` : pendingHousekeepingCount > 0 ? 'In Queue' : 'All Clear',
      statusColor:
        urgentHousekeepingCount > 0
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : pendingHousekeepingCount > 0
            ? 'bg-teal-50 text-teal-800 border-teal-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Brush,
      iconBg: 'bg-teal-50 text-teal-800',
      actionText: urgentHousekeepingCount > 0 ? 'View Urgent Rooms' : 'View Cleaning Queue',
      onClick: () =>
        onNavigateModule('housekeeping', {
          housekeepingFilter: urgentHousekeepingCount > 0 ? 'Urgent' : 'All'
        })
    },
    {
      id: 'maintenance',
      label: 'Open Maintenance',
      value: `${openMaintenanceCount} ${openMaintenanceCount === 1 ? 'Request' : 'Requests'}`,
      detail: topMaintenanceLabel || (openMaintenanceCount > 0 ? 'Open room repair tickets' : 'No open room maintenance alerts'),
      status: highPriorityMaintenanceCount > 0 ? `${highPriorityMaintenanceCount} High Priority` : openMaintenanceCount > 0 ? 'Open' : 'Zero Open',
      statusColor:
        openMaintenanceCount > 0
          ? 'bg-orange-50 text-[#a64b2a] border-orange-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Wrench,
      iconBg: 'bg-orange-50 text-[#a64b2a]',
      actionText: highPriorityMaintenanceCount > 0 ? 'View High Priority' : 'View Maintenance',
      onClick: () =>
        onNavigateModule('maintenance', {
          maintenanceFilter: highPriorityMaintenanceCount > 0 ? 'high_priority' : 'all'
        })
    },
    {
      id: 'billing',
      label: 'Pending Payments',
      value: formatCurrency(pendingPaymentsAmount),
      detail:
        pendingPaymentsGuestsCount > 0
          ? `${pendingPaymentsGuestsCount} departure${pendingPaymentsGuestsCount === 1 ? '' : 's'} with balance due`
          : 'All departure folios settled',
      status: pendingPaymentsAmount > 0 ? 'Payment Due' : 'Settled',
      statusColor:
        pendingPaymentsAmount > 0
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Receipt,
      iconBg: 'bg-rose-50 text-rose-700',
      actionText: 'View Pending Invoices',
      onClick: () =>
        onNavigateModule('billing', {
          billingFilter: pendingPaymentsAmount > 0 ? 'Pending' : 'ALL'
        })
    },
    {
      id: 'unassigned',
      label: 'Unassigned Rooms',
      value: `${unassignedRoomsCount} ${unassignedRoomsCount === 1 ? 'Room' : 'Rooms'}`,
      detail: `${unassignedRoomsCount} HK unassigned • ${vacantRoomsCount} vacant cottages`,
      status: unassignedRoomsCount > 0 ? 'Needs Staff' : 'Assigned',
      statusColor:
        unassignedRoomsCount > 0
          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Bed,
      iconBg: 'bg-indigo-50 text-indigo-700',
      actionText: unassignedRoomsCount > 0 ? 'Assign Housekeeping' : 'View Room Map',
      onClick: () =>
        unassignedRoomsCount > 0
          ? onNavigateModule('housekeeping', { housekeepingFilter: 'Unassigned' })
          : onNavigateModule('rooms')
    },
    {
      id: 'bookings',
      label: 'Unconfirmed Bookings',
      value: `${unconfirmedBookingsCount} ${unconfirmedBookingsCount === 1 ? 'Booking' : 'Bookings'}`,
      detail:
        unconfirmedBookingsCount > 0
          ? 'Pending reservation confirmation'
          : 'All bookings confirmed',
      status: unconfirmedBookingsCount > 0 ? 'Pending Review' : 'Confirmed',
      statusColor:
        unconfirmedBookingsCount > 0
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: CalendarClock,
      iconBg: 'bg-emerald-50 text-emerald-800',
      actionText: 'Review Pending',
      onClick: () =>
        onNavigateModule('bookings', {
          bookingsStatus: unconfirmedBookingsCount > 0 ? 'Pending' : 'All'
        })
    }
  ];

  return (
    <div id="today-operations-section" className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-xs font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-4 h-4 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Operations</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Session Data
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Operational summary across Mykonos Cottage departments
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Select an item to open its filtered view
        </div>
      </div>

      {/* Operational Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
        {operationalItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              id={`operations-card-${item.id}`}
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="text-left group p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-teal-700/40 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border truncate ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-500">{item.label}</h4>
                <div className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {item.value}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug mt-1 font-medium">
                  {item.detail}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-800 group-hover:text-teal-950">
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
