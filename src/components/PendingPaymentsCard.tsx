import React from 'react';
import { ArrowUpRight, Receipt, ShieldAlert } from 'lucide-react';

interface PendingPaymentsCardProps {
  amount: number;
  onReview: () => void;
}

export default function PendingPaymentsCard({ amount, onReview }: PendingPaymentsCardProps) {
  // Format Indian Rupees
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div 
      id="pending-payments-card" 
      className="bg-[#9b4922] text-white rounded-3xl p-6 shadow-md font-sans relative overflow-hidden group border border-[#853e1c]"
    >
      {/* Background visual highlight */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300" />

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold tracking-wider uppercase">
            <Receipt className="w-3.5 h-3.5 text-orange-200" />
            <span>Pending Payments</span>
          </div>
          <h3 className="text-3xl font-extrabold mt-2 tracking-tight drop-shadow-sm">
            {formatCurrency(amount)}
          </h3>
        </div>
        <span className="p-1.5 bg-white/10 rounded-lg text-orange-200">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
        </span>
      </div>

      <div className="mt-5">
        <button
          id="btn-review-billing"
          onClick={onReview}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs rounded-xl border border-white/20 hover:border-white/45 transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Review Billing</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
