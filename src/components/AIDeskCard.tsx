import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Brush, 
  Wrench, 
  CreditCard,
  ChevronRight,
  RotateCw
} from 'lucide-react';

interface AIDeskCardProps {
  housekeepingTaskCount: number;
  maintenanceAlertCount: number;
  onTakeAction: () => void;
  onNewBookingClick: () => void;
  onNavigateTab?: (tab: string) => void;
  onReviewBilling?: (name: string, amt: number) => void;
}

export default function AIDeskCard({ 
  housekeepingTaskCount, 
  maintenanceAlertCount, 
  onTakeAction, 
  onNewBookingClick,
  onNavigateTab,
  onReviewBilling
}: AIDeskCardProps) {
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);

  const recommendations = [
    {
      id: 'hk-priority',
      badge: 'Turnaround Priority',
      badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
      icon: Brush,
      title: "Sarah D'Souza early check-in at 01:30 PM",
      description: "Room 204 requires expedited sanitization & linen replacement before guest arrival.",
      actionLabel: 'Dispatch Cleaners',
      actionHandler: onTakeAction,
      viewLabel: 'Open Housekeeping',
      viewTab: 'housekeeping'
    },
    {
      id: 'maint-priority',
      badge: 'Equipment Alert',
      badgeColor: 'bg-orange-400/20 text-orange-200 border-orange-400/30',
      icon: Wrench,
      title: "Main Pool multi-port valve repair in progress",
      description: "Technician Rajesh Malik dispatched to ensure clean water before afternoon swim.",
      actionLabel: 'Review Work Order',
      actionHandler: () => onNavigateTab?.('maintenance'),
      viewLabel: 'Open Maintenance',
      viewTab: 'maintenance'
    },
    {
      id: 'billing-priority',
      badge: 'Folio Settlement',
      badgeColor: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
      icon: CreditCard,
      title: "Amit Shah (Room 105) checkout pending",
      description: "Outstanding folio balance of ₹4,500 for stay & room service ready for POS settlement.",
      actionLabel: 'Collect ₹4,500 Due',
      actionHandler: () => onReviewBilling ? onReviewBilling('Amit Shah', 4500) : onNavigateTab?.('billing'),
      viewLabel: 'Open Billing',
      viewTab: 'billing'
    }
  ];

  const currentRec = recommendations[activeRecommendationIndex];
  const Icon = currentRec.icon;

  return (
    <div 
      id="ai-desk-card" 
      className="bg-teal-900 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[260px] font-sans relative overflow-hidden group border border-teal-800"
    >
      {/* Background radial highlight */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-700/30 rounded-full blur-2xl group-hover:bg-teal-700/40 transition-colors pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-800 rounded-xl text-teal-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase block leading-none">ResortDesk AI</span>
              <span className="text-[10px] text-teal-300/80 font-medium">Mykonos Operations Intelligence</span>
            </div>
          </div>

          {/* Recommendation switcher tabs */}
          <div className="flex items-center gap-1 bg-teal-950/60 p-1 rounded-xl border border-teal-800/80">
            {recommendations.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveRecommendationIndex(idx)}
                className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center transition-colors ${
                  activeRecommendationIndex === idx
                    ? 'bg-teal-700 text-white'
                    : 'text-teal-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Actionable Recommendation Card */}
        <div className="mt-4 bg-teal-950/50 p-3.5 rounded-2xl border border-teal-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentRec.badgeColor}`}>
              {currentRec.badge}
            </span>
            <span className="text-[10px] text-teal-300/70 font-semibold">
              Recommendation {activeRecommendationIndex + 1} of 3
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
