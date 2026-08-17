import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Calendar, Users, Sliders, Check } from 'lucide-react';
import { StaffCoverageDay } from '../../types';

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: () => void;
  triggerToast: (msg: string) => void;
}

export default function AIScheduleModal({
  isOpen,
  onClose,
  onApplySchedule,
  triggerToast
}: AIScheduleModalProps) {
  const [targetWeek, setTargetWeek] = useState('Week 35 (Aug 26 - Sep 1)');
  const [factorOccupancy, setFactorOccupancy] = useState(true);
  const [enforceRestHours, setEnforceRestHours] = useState(true);
  const [balanceWeekendFairness, setBalanceWeekendFairness] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 1000);
  };

  const handleApply = () => {
    onApplySchedule();
    triggerToast("AI Optimized shift schedule applied and published to staff.");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0c4a45] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">AI Shift Optimization</span>
              <h3 className="font-bold text-base text-white">Generate 24/7 Smart Shift Schedule</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-xs font-sans text-slate-700">
          {!generated ? (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Schedule Week</label>
                <select
                  value={targetWeek}
                  onChange={(e) => setTargetWeek(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Week 35 (Aug 26 - Sep 1)">Week 35 (Aug 26 – Sep 1, 2024)</option>
                  <option value="Week 36 (Sep 2 - Sep 8)">Week 36 (Sep 2 – Sep 8, 2024)</option>
                </select>
              </div>

              {/* Optimization Constraints */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Optimization Parameters</span>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">Forecasted Occupancy Spikes</p>
                    <p className="text-[11px] text-slate-500">Auto-add +2 staff on Friday & Saturday (96% projected booking)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={factorOccupancy}
                    onChange={(e) => setFactorOccupancy(e.target.checked)}
                    className="rounded text-teal-800 focus:ring-teal-700 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800">11-Hour Minimum Rest Period</p>
                    <p className="text-[11px] text-slate-500">Prevent evening-to-morning turnaround fatigue</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enforceRestHours}
                    onChange={(e) => setEnforceRestHours(e.target.checked)}
                    className="rounded text-teal-800 focus:ring-teal-700 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800">Fair Weekend Rotation</p>
                    <p className="text-[11px] text-slate-500">Ensure fair distribution of Sunday off-days among front desk & kitchen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={balanceWeekendFairness}
                    onChange={(e) => setBalanceWeekendFairness(e.target.checked)}
                    className="rounded text-teal-800 focus:ring-teal-700 w-4 h-4"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{isGenerating ? 'Balancing Roster...' : 'Generate Optimized Schedule'}</span>
                </button>
              </div>
            </>
          ) : (
            /* GENERATED PREVIEW */
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-emerald-900">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">100% Coverage Verified (Zero Gaps)</p>
                  <p className="text-[11px] text-emerald-800">All 15 staff members scheduled within 48hr weekly legal limits.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Front Desk Coverage:</span>
                  <span className="font-bold text-slate-800">Fully Staffed (3 Morning, 3 Evening, 2 Night)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kitchen & F&B:</span>
                  <span className="font-bold text-slate-800">6 Cooks & Servers during Weekend Banquet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sneha Patil Leave Coverage:</span>
                  <span className="font-semibold text-teal-800">Assigned Priya Sharma on Wednesday</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setGenerated(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Adjust Parameters
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Publish Schedule</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
