import React from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu, 
  Building, 
  FileCheck, 
  UserCheck, 
  Send,
  Zap
} from 'lucide-react';

interface AutoRestockPipelineProps {
  onTriggerPipelineAudit: () => void;
}

export default function AutoRestockPipelineSection({
  onTriggerPipelineAudit
}: AutoRestockPipelineProps) {
  const steps = [
    {
      num: '01',
      title: 'Stock Level Drops',
      desc: 'Real-time telemetry from Housekeeping & F&B logs',
      icon: ArrowDown,
      status: 'Live Monitored'
    },
    {
      num: '02',
      title: 'Safety Buffer Hit',
      desc: 'Triggers when qty falls below minimum safe limit',
      icon: ShieldAlert,
      status: 'Auto Trigger'
    },
    {
      num: '03',
      title: 'AI Qty Optimization',
      desc: 'Calculates dynamic burn rate + lead-time buffer',
      icon: Cpu,
      status: 'Smart Sizing'
    },
    {
      num: '04',
      title: 'Preferred Vendor',
      desc: 'Evaluates supplier rates, SLA, and reliability score',
      icon: Building,
      status: 'Lowest Cost'
    },
    {
      num: '05',
      title: 'Manager Approval',
      desc: '1-click verification prevents unauthorized bulk spend',
      icon: UserCheck,
      status: 'Human in Loop'
    },
    {
      num: '06',
      title: 'PO Auto-Dispatched',
      desc: 'Sent via WhatsApp & Email directly to vendor rep',
      icon: Send,
      status: 'Order Placed'
    }
  ];

  return (
    <div 
      id="auto-restock-pipeline-card"
      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Automated Restock & Replenishment Pipeline
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Zero-stockout protocol maintaining 99.8% operational supply readiness for resort suites.
          </p>
        </div>

        <button
          onClick={onTriggerPipelineAudit}
          className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          Run Pipeline Check
        </button>
      </div>

      {/* 6-Step Visual Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.num}
              className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-3.5 flex flex-col justify-between relative group hover:bg-white hover:border-teal-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    Step {step.num}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2.5 leading-snug">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  {step.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-teal-800">
                  {step.status}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
