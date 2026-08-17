import React from 'react';
import { X, Landmark, CheckCircle2, ShieldCheck, ArrowDownRight, Clock, Building2 } from 'lucide-react';
import { BankSettlementBatch } from '../../types';
import { initialBankSettlement, bankSettlementHistory } from '../../data/billingData';

interface BankSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBatch?: BankSettlementBatch;
  history?: BankSettlementBatch[];
  triggerToast: (msg: string) => void;
}

export default function BankSettlementModal({
  isOpen,
  onClose,
  currentBatch = initialBankSettlement,
  history = bankSettlementHistory,
  triggerToast
}: BankSettlementModalProps) {
  if (!isOpen) return null;

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Bank Payout &amp; Escrow Settlements</h3>
              <p className="text-xs text-slate-400 mt-0.5">T+1 Automated Razorpay / PayU Nodal Clearing</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-700">
          {/* Upcoming Payout Card */}
          <div className="p-5 bg-gradient-to-br from-[#0c4033] to-slate-900 rounded-2xl text-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                  Scheduled Next Payout
                </span>
                <h4 className="text-3xl font-bold font-sans mt-1">
                  ₹{formatINR(currentBatch.netPayout)}
                </h4>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Expected in Account on <strong>{currentBatch.settlementDate}</strong> (06:00 AM IST)
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
                Scheduled
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-[11px]">
              <div>
                <span className="text-slate-300 block">Gross Inflows</span>
                <strong className="text-white">₹{formatINR(currentBatch.grossAmount)}</strong>
              </div>
              <div>
                <span className="text-slate-300 block">Gateway MDR (1.02%)</span>
                <strong className="text-rose-200">- ₹{formatINR(currentBatch.gatewayFee)}</strong>
              </div>
              <div>
                <span className="text-slate-300 block">GST on Fee (18%)</span>
                <strong className="text-rose-200">- ₹{formatINR(currentBatch.gstOnFee)}</strong>
              </div>
            </div>
          </div>

          {/* Linked Bank Account Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-bold text-slate-800">{currentBatch.bankName}</p>
                <p className="text-slate-500 text-[11px]">A/C Number: {currentBatch.accountNumberMasked} • IFSC: HDFC0001048</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Nodal A/C
            </span>
          </div>

          {/* Settlement History */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Recent Settlement Transcripts
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {history.map((batch) => (
                <div key={batch.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{batch.batchNumber}</span>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                        Settled
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {batch.settlementDate} • UTR: <span className="font-mono text-slate-600">{batch.utrNumber}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 font-sans">
                      ₹{formatINR(batch.netPayout)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Fee: ₹{formatINR(batch.gatewayFee + batch.gstOnFee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
