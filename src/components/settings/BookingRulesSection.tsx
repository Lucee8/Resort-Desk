import React from 'react';
import { 
  CalendarCheck, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  PawPrint,
  Sliders
} from 'lucide-react';
import { BookingRulesSettings } from '../../types';

interface BookingRulesSectionProps {
  rules: BookingRulesSettings;
  onChange: (updated: Partial<BookingRulesSettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function BookingRulesSection({
  rules,
  onChange,
  triggerToast
}: BookingRulesSectionProps) {
  return (
    <div id="settings-booking-rules-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Booking & Property Rules</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Reservation Engine Logic
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure stay constraints, advance deposits, cancellation penalties, extra guest fees, and pet policies.
          </p>
        </div>
      </div>

      {/* 2. Minimum Stay & Advance Deposits */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <CalendarCheck className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Stay Duration & Deposit Requirements</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Standard Min Stay (Nights)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={rules.minStayNights}
              onChange={(e) => onChange({ minStayNights: parseInt(e.target.value) || 1 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Weekend Min Stay (Nights)
            </label>
            <input
              type="number"
              min={1}
              max={7}
              value={rules.weekendMinStayNights}
              onChange={(e) => onChange({ weekendMinStayNights: parseInt(e.target.value) || 2 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Standard Advance Deposit %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={rules.advanceDepositPercentage}
              onChange={(e) => onChange({ advanceDepositPercentage: parseInt(e.target.value) || 50 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Peak Season Deposit %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={rules.peakSeasonAdvanceDeposit}
              onChange={(e) => onChange({ peakSeasonAdvanceDeposit: parseInt(e.target.value) || 100 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Cancellation Penalty Tiers */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Cancellation & Retention Tiers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="text-xs font-bold text-emerald-900 mb-1">Tier 1: Free Cancellation</div>
            <div className="text-[11px] text-emerald-700 mb-3">100% refund up to cutoff window</div>
            <div>
              <label className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
                Hours Prior to Check-in (14:00)
              </label>
              <input
                type="number"
                value={rules.freeCancellationHours}
                onChange={(e) => onChange({ freeCancellationHours: parseInt(e.target.value) || 48 })}
                className="w-full border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs text-emerald-950 font-bold bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="text-xs font-bold text-amber-900 mb-1">Tier 2: Partial Retention</div>
            <div className="text-[11px] text-amber-700 mb-3">{rules.tier2RetentionPercentage}% tariff retained</div>
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                Hours Window (24h - 48h)
              </label>
              <input
                type="number"
                value={rules.tier2CancellationHours}
                onChange={(e) => onChange({ tier2CancellationHours: parseInt(e.target.value) || 24 })}
                className="w-full border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-amber-950 font-bold bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="text-xs font-bold text-rose-900 mb-1">Tier 3: No-Show & Late Notice</div>
            <div className="text-[11px] text-rose-700 mb-3">100% non-refundable</div>
            <div className="text-[11px] text-rose-800 bg-white p-2.5 rounded-lg border border-rose-200 font-medium">
              Within 24 hours of arrival or failure to check-in by 23:59 IST.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Early Check-in, Late Checkout & Extra Guest Tariffs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Flexi-Timing Hourly Fees</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Early Check-in (₹ / hr)
              </label>
              <input
                type="number"
                value={rules.earlyCheckInHourlyFee}
                onChange={(e) => onChange({ earlyCheckInHourlyFee: parseInt(e.target.value) || 500 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Late Check-out (₹ / hr)
              </label>
              <input
                type="number"
                value={rules.lateCheckOutHourlyFee}
                onChange={(e) => onChange({ lateCheckOutHourlyFee: parseInt(e.target.value) || 600 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Room Assignment Strategy
            </label>
            <select
              value={rules.autoRoomAssignmentMode}
              onChange={(e) => onChange({ autoRoomAssignmentMode: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="Cleanest & Balanced">Cleanest & Balanced (Rotates room wear & tear)</option>
              <option value="Proximity to Lobby">Proximity to Lobby (Convenience first)</option>
              <option value="Consecutive Floor Clustering">Consecutive Floor Clustering (Energy efficient)</option>
            </select>
          </div>
        </div>

        {/* Extra Guests & Pet Policy */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Users className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Extra Guests & Pet Policy</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Extra Adult Fee (₹ / night)
              </label>
              <input
                type="number"
                value={rules.extraGuestAdultCharge}
                onChange={(e) => onChange({ extraGuestAdultCharge: parseInt(e.target.value) || 1500 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Rollaway Bed (₹ / night)
              </label>
              <input
                type="number"
                value={rules.rollawayBedCharge}
                onChange={(e) => onChange({ rollawayBedCharge: parseInt(e.target.value) || 1200 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <PawPrint className="w-4 h-4 text-teal-800" />
              <div>
                <div className="text-xs font-bold text-slate-800">Pet Friendly Accommodation</div>
                <div className="text-[11px] text-slate-500">₹{rules.petSanitizationFee} sanitization surcharge</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={rules.petPolicyAllowed}
              onChange={(e) => onChange({ petPolicyAllowed: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
