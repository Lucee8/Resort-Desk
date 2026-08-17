import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Wrench,
  Cpu
} from 'lucide-react';
import { PredictiveMaintenanceAlert } from '../../types';

interface PredictiveMaintenanceSectionProps {
  alerts: PredictiveMaintenanceAlert[];
  onCreatePreventiveTicket: (alert: PredictiveMaintenanceAlert) => void;
}

export default function PredictiveMaintenanceSection({
  alerts,
  onCreatePreventiveTicket
}: PredictiveMaintenanceSectionProps) {
  return (
    <div id="section-predictive-maintenance" className="mt-8 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-teal-200" />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            AI Predictive Maintenance Insights
          </h3>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Real-time IoT Sensors
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert) => {
          const isExtremeRisk = alert.riskScore >= 80;
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isExtremeRisk 
                  ? 'border-rose-200/90 hover:border-rose-300' 
                  : 'border-slate-200/90 hover:border-teal-200'
              }`}
            >
              <div>
                {/* Risk score header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {alert.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isExtremeRisk 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    Risk: {alert.riskScore}%
                  </span>
                </div>

                {/* Prediction title & room */}
                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {alert.issuePrediction}
                  </h4>
                  <p className="text-xs font-bold text-teal-800 mt-1">
                    {alert.roomNumber}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {alert.equipment}
                  </p>
                </div>

                {/* AI Reason */}
                <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-700">Telemetry Reason:</span> {alert.reason}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="mt-2.5">
                  <p className="text-[11px] font-semibold text-slate-800">
                    <span className="text-teal-800 font-bold">Recommended:</span> {alert.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onCreatePreventiveTicket(alert)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-800 hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  <span>Create Maintenance Ticket</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
