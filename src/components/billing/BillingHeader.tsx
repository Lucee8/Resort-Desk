import React from 'react';
import { Download, Plus, Sparkles, RefreshCw } from 'lucide-react';

interface BillingHeaderProps {
  onExportCSV: () => void;
  onCreateInvoice: () => void;
  onOpenMyraAI?: () => void;
  lastUpdated?: string;
}

export default function BillingHeader({
  onExportCSV,
  onCreateInvoice,
  onOpenMyraAI,
  lastUpdated = 'Just now'
}: BillingHeaderProps) {
  return (
    <div id="billing-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
          Billing &amp; Finance
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl font-normal">
          Manage invoices, track revenue, and monitor your subscription usage. Financial data is updated in real-time.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Export CSV button */}
        <button
          id="btn-export-csv"
          type="button"
          onClick={onExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 transition-all duration-150 shadow-xs cursor-pointer active:scale-98"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export CSV</span>
        </button>

        {/* Create Invoice button */}
        <button
          id="btn-create-invoice"
          type="button"
          onClick={onCreateInvoice}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0c4033] hover:bg-[#082e25] text-white text-xs font-semibold rounded-xl transition-all duration-150 shadow-md shadow-[#0c4033]/20 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create Invoice</span>
        </button>
      </div>
    </div>
  );
}
