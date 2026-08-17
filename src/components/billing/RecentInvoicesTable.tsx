import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  MoreVertical, 
  Eye, 
  Receipt, 
  MessageSquare, 
  RotateCcw, 
  CreditCard, 
  CheckCircle2,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { BillingInvoice, InvoiceStatus } from '../../types';

interface RecentInvoicesTableProps {
  invoices: BillingInvoice[];
  onViewInvoice: (invoice: BillingInvoice) => void;
  onRecordPayment: (invoice: BillingInvoice) => void;
  onProcessRefund: (invoice: BillingInvoice) => void;
  onSendWhatsApp: (invoice: BillingInvoice) => void;
  onViewAllInvoices: () => void;
  selectedStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export default function RecentInvoicesTable({
  invoices,
  onViewInvoice,
  onRecordPayment,
  onProcessRefund,
  onSendWhatsApp,
  onViewAllInvoices,
  selectedStatusFilter = 'ALL',
  onStatusFilterChange
}: RecentInvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = 
      selectedStatusFilter === 'ALL' || 
      inv.status.toLowerCase() === selectedStatusFilter.toLowerCase();

    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.bookingId && inv.bookingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Status badge styling helper matching reference image
  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Paid</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Partial</span>
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>Refunded</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="recent-invoices-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Card Header & Filter Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Invoices
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoice or guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-36 sm:w-48 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-700 transition-all"
            />
          </div>

          {/* All Statuses Filter Pill Button */}
          <div className="relative">
            <button
              id="btn-filter-status-dropdown"
              type="button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-600" />
              <span>{selectedStatusFilter === 'ALL' ? 'All Statuses' : selectedStatusFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {/* Status Dropdown Menu */}
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {['ALL', 'Paid', 'Pending', 'Partial', 'Refunded'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      if (onStatusFilterChange) onStatusFilterChange(status);
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      selectedStatusFilter === status ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{status === 'ALL' ? 'All Statuses' : status}</span>
                    {selectedStatusFilter === status && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[220px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-5 font-semibold">INVOICE #</th>
              <th className="py-3 px-4 font-semibold">GUEST / BOOKING</th>
              <th className="py-3 px-4 font-semibold">DATE</th>
              <th className="py-3 px-4 font-semibold">AMOUNT (₹)</th>
              <th className="py-3 px-4 font-semibold">GST</th>
              <th className="py-3 px-4 font-semibold">STATUS</th>
              <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.slice(0, 6).map((invoice) => {
                const isActionOpen = activeActionMenuId === invoice.id;

                return (
                  <tr 
                    key={invoice.id} 
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    {/* INVOICE # */}
                    <td className="py-3.5 px-5 font-medium">
                      <span className={`font-mono text-xs ${
                        invoice.status === 'Refunded' || invoice.isStrikethrough
                          ? 'line-through text-slate-400' 
                          : 'text-slate-900 font-semibold'
                      }`}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>

                    {/* GUEST / BOOKING */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">
                          {invoice.guestName}
                        </span>
                        {invoice.bookingId && (
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {invoice.bookingId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="py-3.5 px-4 text-slate-600 font-normal whitespace-nowrap">
                      {invoice.issueDate}
                    </td>

                    {/* AMOUNT */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatINR(invoice.totalAmount)}
                    </td>

                    {/* GST (Indigo font as per reference) */}
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">
                      {formatINR(invoice.gstAmount)}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(invoice.status)}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => onViewInvoice(invoice)}
                          title="View Tax Invoice"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenuId(isActionOpen ? null : invoice.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isActionOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  onViewInvoice(invoice);
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                                <span>View / Print PDF</span>
                              </button>

                              {invoice.status !== 'Paid' && invoice.status !== 'Refunded' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRecordPayment(invoice);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Record Payment</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  onSendWhatsApp(invoice);
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                                <span>Send via WhatsApp</span>
                              </button>

                              {invoice.status === 'Paid' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onProcessRefund(invoice);
                                    setActiveActionMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Process Refund</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer link to View All Invoices */}
      <div className="p-3.5 border-t border-slate-100 text-center bg-white">
        <button
          id="btn-view-all-invoices"
          type="button"
          onClick={onViewAllInvoices}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-50"
        >
          <span>View All Invoices</span>
        </button>
      </div>
    </div>
  );
}
