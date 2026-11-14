import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  ArrowRight,
  Brush,
  Wrench,
  CreditCard,
  CalendarClock
} from 'lucide-react';
import { Arrival, Booking, Departure, HousekeepingTask, MaintenanceAlert } from '../types';
import { OperationsNavigationOptions } from './TodayOperationsSection';

interface AIDeskCardProps {
  arrivals: Arrival[];
  departures: Departure[];
  housekeeping: HousekeepingTask[];
  maintenance: MaintenanceAlert[];
  bookings: Booking[];
  onTakeAction: () => void;
  onNewBookingClick: () => void;
  onNavigateModule: (tab: string, options?: OperationsNavigationOptions) => void;
  onReviewBilling: (name: string, amt: number) => void;
}

export default function AIDeskCard({
  arrivals,
  departures,
  housekeeping,
  maintenance,
  bookings,
  onTakeAction,
  onNewBookingClick,
  onNavigateModule,
  onReviewBilling
}: AIDeskCardProps) {
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);

  const recommendations = useMemo(() => {
    const items: {
      id: string;
      badge: string;
      badgeColor: string;
      icon: typeof Brush;
      title: string;
      description: string;
      actionLabel: string;
      actionHandler: () => void;
    }[] = [];

    // 1. Housekeeping priority derived from live housekeeping + arrivals arrays
    const priorityTask =
      housekeeping.find(t => t.status !== 'Verified' && t.priority === 'Urgent') ||
      housekeeping.find(t => t.status !== 'Verified' && !t.assignedTo) ||
      housekeeping.find(t => t.status !== 'Verified');

    if (priorityTask) {
      const normalizedRoom = priorityTask.roomNumber.replace(/^Room\s+/i, '');
      const matchingArrival = arrivals.find(
        a => a.roomNumber === normalizedRoom && a.status !== 'Checked In'
      );
      const unassignedCount = housekeeping.filter(t => !t.assignedTo && t.status !== 'Verified').length;

      items.push({
        id: 'hk-priority',
        badge: priorityTask.priority === 'Urgent' ? 'Turnaround Priority' : 'Housekeeping Queue',
        badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
        icon: Brush,
        title: matchingArrival
          ? `${matchingArrival.guestName} arriving at ${matchingArrival.checkInTime || '02:00 PM'} (${priorityTask.roomNumber})`
          : `${priorityTask.roomNumber} (${priorityTask.type}) is ${priorityTask.status}`,
        description: priorityTask.assignedTo
          ? `Assigned to ${priorityTask.assignedTo}. Open Housekeeping to review checklist progress.`
          : `${unassignedCount} room${unassignedCount === 1 ? '' : 's'} currently lack an attendant assignment.`,
        actionLabel: !priorityTask.assignedTo ? 'Open Unassigned Queue' : 'Dispatch Cleaners',
        actionHandler: () =>
          !priorityTask.assignedTo
            ? onNavigateModule('housekeeping', { housekeepingFilter: 'Unassigned' })
            : onTakeAction()
      });
    }

    // 2. Maintenance alert derived from live maintenance array
    const openMaint =
      maintenance.find(m => m.status !== 'Resolved' && m.priority === 'High') ||
      maintenance.find(m => m.status !== 'Resolved');

    if (openMaint) {
      const openCount = maintenance.filter(m => m.status !== 'Resolved').length;
      items.push({
        id: 'maint-priority',
        badge: `${openMaint.priority} Priority`,
        badgeColor: 'bg-orange-400/20 text-orange-200 border-orange-400/30',
        icon: Wrench,
        title: `${openMaint.roomNumber}: ${openMaint.title}`,
        description: `${openCount} open maintenance alert${openCount === 1 ? '' : 's'} on the dashboard require technician follow-up.`,
        actionLabel: 'Open Maintenance Queue',
        actionHandler: () =>
          onNavigateModule('maintenance', {
            maintenanceFilter: openMaint.priority === 'High' ? 'high_priority' : 'all'
          })
      });
    }

    // 3. Billing due or unconfirmed bookings derived from departures + bookings
    const dueDeparture = departures.find(
      d => d.status !== 'Checked Out' && d.amountDue && d.amountDue > 0
    );
    const pendingBooking = bookings.find(b => b.bookingStatus === 'Pending');

    if (dueDeparture && dueDeparture.amountDue) {
      items.push({
        id: 'billing-priority',
        badge: 'Folio Settlement',
        badgeColor: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
        icon: CreditCard,
        title: `${dueDeparture.guestName} (Cottage ${dueDeparture.roomNumber}) balance due`,
        description: `₹${dueDeparture.amountDue.toLocaleString('en-IN')} pending ahead of ${dueDeparture.checkoutTime || '11:00 AM'} checkout.`,
        actionLabel: 'Open Pending Billing',
        actionHandler: () => onNavigateModule('billing', { billingFilter: 'Pending' })
      });
    } else if (pendingBooking) {
      items.push({
        id: 'booking-priority',
        badge: 'Unconfirmed Hold',
        badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
        icon: CalendarClock,
        title: `${pendingBooking.guestName} (${pendingBooking.roomNumber}) pending confirmation`,
        description: `${pendingBooking.nights} nights (${pendingBooking.startDate} – ${pendingBooking.endDate}) marked Unpaid & Pending.`,
        actionLabel: 'Review Pending Bookings',
        actionHandler: () => onNavigateModule('bookings', { bookingsStatus: 'Pending' })
      });
    }

    if (items.length === 0) {
      items.push({
        id: 'all-clear',
        badge: 'All Clear',
        badgeColor: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
        icon: Sparkles,
        title: 'All priority housekeeping, maintenance & folios are clear',
        description: 'Review upcoming reservations or register a new walk-in guest for Mykonos Cottage.',
        actionLabel: 'View Bookings Calendar',
        actionHandler: () => onNavigateModule('bookings', { bookingsStatus: 'All' })
      });
    }

    return items;
  }, [arrivals, departures, housekeeping, maintenance, bookings, onNavigateModule, onTakeAction]);

  const safeIndex = Math.min(activeRecommendationIndex, recommendations.length - 1);
  const currentRec = recommendations[safeIndex];
  const Icon = currentRec.icon;

  return (
    <div
      id="ai-desk-card"
      className="bg-teal-900 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[250px] font-sans relative overflow-hidden group border border-teal-800"
    >
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-700/30 rounded-full blur-2xl group-hover:bg-teal-700/40 transition-colors pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-teal-800 rounded-xl text-teal-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-wider uppercase block leading-none">ResortDesk AI</span>
              <span className="text-[10px] text-teal-300/80 font-medium block truncate mt-0.5">
                Mykonos Operations Recommendations
              </span>
            </div>
          </div>

          {recommendations.length > 1 && (
            <div className="flex items-center gap-1 bg-teal-950/60 p-1 rounded-xl border border-teal-800/80 shrink-0">
              {recommendations.map((rec, idx) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setActiveRecommendationIndex(idx)}
                  className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    safeIndex === idx
                      ? 'bg-teal-700 text-white'
                      : 'text-teal-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Actionable Recommendation Card */}
        <div className="mt-4 bg-teal-950/50 p-3.5 rounded-2xl border border-teal-800/80">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentRec.badgeColor}`}>
              {currentRec.badge}
            </span>
            <span className="text-[10px] text-teal-300/70 font-semibold">
              {safeIndex + 1} of {recommendations.length}
            </span>
          </div>
          <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span className="truncate">{currentRec.title}</span>
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-teal-100/90 font-medium">
            {currentRec.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-4 z-10">
        <button
          id="ai-take-action-btn"
          type="button"
          onClick={currentRec.actionHandler}
          className="w-full sm:flex-1 py-2.5 px-3 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white rounded-xl text-xs font-bold border border-teal-600/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>{currentRec.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 text-teal-200" />
        </button>

        <button
          id="ai-new-booking-btn"
          type="button"
          onClick={onNewBookingClick}
          className="w-full sm:w-auto py-2.5 px-3.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-teal-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-teal-800" />
          <span>New Walk-in</span>
        </button>
      </div>
    </div>
  );
}
