import React, { useState } from 'react';
import { BedDouble, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InventoryStatusCardProps {
  readinessRate?: number;
  blockedRoomsCount?: number;
  onSyncWithFrontDesk: () => void;
  onViewBlockedRooms: () => void;
}

export default function InventoryStatusCard({
  readinessRate = 92,
  blockedRoomsCount = 4,
  onSyncWithFrontDesk,
  onViewBlockedRooms
}: InventoryStatusCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('Just now');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime('1 sec ago');
      onSyncWithFrontDesk();
    }, 900);
  };

  return (
    <div 
      id="card-inventory-status"
      className="bg-gradient-to-br from-[#0c3631] via-[#0f443e] to-[#0a2e2a] text-white rounded-3xl p-6 shadow-md shadow-teal-950/20 border border-teal-800/40 relative overflow-hidden"
    >
      {/* Decorative ambient ring */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest uppercase text-teal-300/90 font-mono">
          INVENTORY STATUS
        </span>
        <div className="w-8 h-8 rounded-xl bg-teal-800/60 border border-teal-700/50 flex items-center justify-center text-teal-200">
          <BedDouble className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-bold tracking-tight text-white font-sans">
            Room Readiness {readinessRate}%
          </h3>
        </div>
        <p className="text-xs text-teal-200/80 font-normal mt-0.5">
          Available Today
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-teal-950/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-teal-700/40">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${readinessRate}%` }}
          />
        </div>
      </div>

      {/* Callout Notice */}
      <div className="mt-5 pt-4 border-t border-teal-800/60 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-100/90 leading-relaxed">
          <button 
            onClick={onViewBlockedRooms}
            className="font-bold underline hover:text-white transition-colors text-left"
          >
            {blockedRoomsCount} rooms are currently blocked
          </button>{' '}
          due to critical maintenance.
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5">
        <button
          id="btn-sync-front-desk"
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full py-2.5 px-4 rounded-xl bg-teal-800/90 hover:bg-teal-700/90 active:bg-teal-900 border border-teal-600/50 text-white text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-200' : 'text-teal-300'}`} />
          <span>{isSyncing ? 'Synchronizing PMS & HK...' : 'Sync with Front Desk'}</span>
        </button>
        <div className="text-center mt-2">
          <span className="text-[10px] text-teal-300/60">
            PMS Auto-sync: {lastSyncedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
