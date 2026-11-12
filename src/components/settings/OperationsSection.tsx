import React from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Wrench, 
  Package, 
  Clock, 
  CheckCircle2, 
  Camera,
  AlertCircle
} from 'lucide-react';
import { OperationsSettings } from '../../types';

interface OperationsSectionProps {
  settings: OperationsSettings;
  onChange: (updated: Partial<OperationsSettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function OperationsSection({
  settings,
  onChange,
  triggerToast
}: OperationsSectionProps) {
  return (
    <div id="settings-operations-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Operations, Housekeeping & Maintenance SLAs</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Service Level Targets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnover duration targets, mandatory room inspection photo verification, and maintenance priority SLAs.
          </p>
        </div>
      </div>

      {/* 2. Housekeeping Turnaround Standards */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Clock className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Housekeeping Standards & Turnaround Time</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Standard Room Turnover (Mins)
            </label>
            <input
              type="number"
              min={15}
              max={120}
              value={settings.housekeepingTurnoverMins}
              onChange={(e) => onChange({ housekeepingTurnoverMins: parseInt(e.target.value) || 30 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Luxury Suite Turnover (Mins)
            </label>
            <input
              type="number"
              min={20}
              max={180}
              value={settings.suiteTurnoverMins}
              onChange={(e) => onChange({ suiteTurnoverMins: parseInt(e.target.value) || 45 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Deep Clean Cycle Interval (Days)
            </label>
            <input
              type="number"
              min={3}
              max={60}
              value={settings.deepCleanIntervalDays}
              onChange={(e) => onChange({ deepCleanIntervalDays: parseInt(e.target.value) || 7 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div className="sm:col-span-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-teal-800" />
              <div>
                <div className="text-xs font-bold text-slate-800">Require Photo Verification for Clean Status</div>
                <div className="text-[11px] text-slate-500">Staff must photograph minibar and bathroom to mark room ready</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requirePhotoVerification}
              onChange={(e) => onChange({ requirePhotoVerification: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Maintenance Priority SLAs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Wrench className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Maintenance Resolution SLAs (Max Hours)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="text-xs font-bold text-rose-900 mb-1">Emergency (Level 1)</div>
            <div className="text-[10px] text-rose-700 mb-2">Power, gas, lock failure</div>
            <input
              type="number"
              min={1}
              max={12}
              value={settings.maintenanceSlaEmergencyHours}
              onChange={(e) => onChange({ maintenanceSlaEmergencyHours: parseInt(e.target.value) || 1 })}
              className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs text-rose-950 font-bold bg-white"
            />
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="text-xs font-bold text-amber-900 mb-1">High Priority (Level 2)</div>
            <div className="text-[10px] text-amber-700 mb-2">AC malfunction, plumbing</div>
            <input
              type="number"
              min={1}
              max={24}
              value={settings.maintenanceSlaHighHours}
              onChange={(e) => onChange({ maintenanceSlaHighHours: parseInt(e.target.value) || 4 })}
              className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-amber-950 font-bold bg-white"
            />
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="text-xs font-bold text-blue-900 mb-1">Medium (Level 3)</div>
            <div className="text-[10px] text-blue-700 mb-2">TV remote, light bulb</div>
            <input
              type="number"
              min={1}
              max={48}
              value={settings.maintenanceSlaMediumHours}
              onChange={(e) => onChange({ maintenanceSlaMediumHours: parseInt(e.target.value) || 12 })}
              className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 text-xs text-blue-950 font-bold bg-white"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="text-xs font-bold text-slate-800 mb-1">Low (Level 4)</div>
            <div className="text-[10px] text-slate-500 mb-2">Cosmetic touchups</div>
            <input
              type="number"
              min={1}
              max={72}
              value={settings.maintenanceSlaLowHours}
              onChange={(e) => onChange({ maintenanceSlaLowHours: parseInt(e.target.value) || 24 })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Inventory Thresholds & PO Automation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Package className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Inventory Thresholds & Procurement</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Low-Stock Auto-Alert Trigger %
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={settings.inventoryLowStockThresholdPercent}
              onChange={(e) => onChange({ inventoryLowStockThresholdPercent: parseInt(e.target.value) || 15 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">Alert fires when minibar, linen, or toiletries fall below this quantity.</p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="text-xs font-bold text-slate-800">Auto-Draft Vendor Purchase Orders</div>
              <div className="text-[11px] text-slate-500">Drafts PO in Finance module for GM one-click approval</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoDraftVendorPO}
              onChange={(e) => onChange({ autoDraftVendorPO: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
