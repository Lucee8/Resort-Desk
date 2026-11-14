import React from 'react';
import { Landmark, FileText, ChevronRight } from 'lucide-react';

interface AdditionalFinanceCardsProps {
  onOpenBankSettlement: () => void;
  onOpenUnbilledStays: () => void;
  nextSettlementDate: string;
  nextSettlementAmount: number;
  bankLabel?: string;
  unbilledRoomsCount: number;
  unbilledTotalAmount: number;
}

export default function AdditionalFinanceCards({
  onOpenBankSettlement,
  onOpenUnbilledStays,
  nextSettlementDate,
  nextSettlementAmount,
  bankLabel = 'HDFC Nodal',
  unbilledRoomsCount,
  unbilledTotalAmount,
}: AdditionalFinanceCardsProps) {
  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN').format(Math.round(val));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {/* 1. BANK SETTLEMENT CARD */}
      <div
        id="card-bank-settlement"
        onClick={onOpenBankSettlement}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-[#0c4033] group-hover:text-white transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Bank Settlement</span>
            </div>

            <div className="mt-3">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                Next: {nextSettlementDate}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {bankLabel} • ₹{formatINR(nextSettlementAmount)}
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* 2. UNBILLED STAYS CARD */}
      <div
        id="card-unbilled-stays"
        onClick={onOpenUnbilledStays}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500">Unbilled Stays</span>
            </div>

            <div className="mt-3">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                {unbilledRoomsCount} {unbilledRoomsCount === 1 ? 'Stay' : 'Stays'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ₹{formatINR(unbilledTotalAmount)} pending folios
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
