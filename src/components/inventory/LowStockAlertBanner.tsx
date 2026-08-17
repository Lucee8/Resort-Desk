import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

interface LowStockAlertBannerProps {
  criticalCount: number;
  onViewAlerts: () => void;
  onDismiss?: () => void;
}

export default function LowStockAlertBanner({
  criticalCount,
  onViewAlerts,
  onDismiss
}: LowStockAlertBannerProps) {
  if (criticalCount <= 0) return null;

  return (
    <div 
      id="low-stock-alert-banner"
      className="w-full bg-[#fdf6e9] border border-[#f7e0b5] rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-4 shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#faecd1] flex items-center justify-center shrink-0 text-[#b45309]">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#8c4b12] leading-snug">
          <span className="font-bold">{criticalCount} {criticalCount === 1 ? 'item is' : 'items are'}</span> below the safety threshold and require immediate restocking.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="view-low-stock-alerts-link"
          onClick={onViewAlerts}
          className="text-xs sm:text-sm font-semibold text-[#8c4b12] hover:text-[#5f320b] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-[#b45309]/70 hover:text-[#8c4b12] rounded-lg hover:bg-[#faecd1] transition-colors ml-1 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
