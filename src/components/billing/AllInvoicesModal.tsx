import React, { useState } from 'react';
import {
  X,
  Search,
  Download,
  Eye,
  CreditCard,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { BillingInvoice } from '../../types';
import { getTodayISO } from '../../utils/bookingUtils';

interface AllInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: BillingInvoice[];
  onViewInvoice: (invoice: BillingInvoice) => void;
  onRecordPayment: (invoice: BillingInvoice) => void;
  onProcessRefund: (invoice: BillingInvoice) => void;
  onSendWhatsApp: (invoice: BillingInvoice) => void;
  onExportCSV: () => void;
  triggerToast: (msg: string) => void;
  gstin?: string;
}

export default function AllInvoicesModal({
  isOpen,
  onClose,
  invoices,
  onViewInvoice,
  onRecordPayment,
  onSendWhatsApp,
  onExportCSV,
  triggerToast,
  gstin = '27AABCM4821K1Z4',
}: AllInvoicesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'invoices' | 'gst_summary'>('invoices');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.bookingId && inv.bookingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeInvoices = filteredInvoices.filter((inv) => inv.status !== 'Refunded');
  const totalInvoiced = activeInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = activeInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalGst = activeInvoices.reduce((acc, inv) => acc + inv.gstAmount, 0);
  const totalTaxable = activeInvoices.reduce((acc, inv) => acc + inv.subtotal, 0);

  const handleDownloadGstr1Json = () => {
    const payload = {
      gstin,
      generatedAt: new Date().toISOString(),
      property: 'Mykonos Cottage, Tarkarli',
      invoiceCount: activeInvoices.length,
      grossTaxableValue: totalTaxable,
      totalGst,
      b2b: activeInvoices
        .filter((i) => Boolean(i.guestGstin))
        .map((i) => ({
          ctin: i.guestGstin,
          inum: i.invoiceNumber,
          idt: i.issueDate,
          val: i.totalAmount,
          txval: i.subtotal,
          camt: i.cgstAmount,
          samt: i.sgstAmount,
        })),
      b2cs: activeInvoices
        .filter((i) => !i.guestGstin)
        .map((i) => ({
          inum: i.invoiceNumber,
          idt: i.issueDate,
          txval: i.subtotal,
          camt: i.cgstAmount,
          samt: i.sgstAmount,
        })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mykonos_GSTR1_${getTodayISO()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded GSTR-1 JSON for ${activeInvoices.length} active invoices.`);
  };

  if (!isOpen) return null;

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(Math.round(val));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Invoices Ledger &amp; GST Audit</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live Firestore billing database and statutory SAC 9963 reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs & Quick Stats */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-[#0c4033] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Invoices ({filteredInvoices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gst_summary')}
              className={`px-4 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                activeTab === 'gst_summary'
                  ? 'bg-[#0c4033] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              GSTR-1 Tax Summary
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>
              Total: <strong className="text-slate-900 font-bold">₹{formatINR(totalInvoiced)}</strong>
            </span>
            <span>
              Collected:{' '}
              <strong className="text-emerald-700 font-bold">₹{formatINR(totalCollected)}</strong>
            </span>
            <span>
              GST: <strong className="text-indigo-700 font-bold">₹{formatINR(totalGst)}</strong>
            </span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="p-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice #, guest, cottage, or booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-700 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['ALL', 'Paid', 'Pending', 'Partial', 'Refunded'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0c4033] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'invoices' ? (
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">INVOICE #</th>
                    <th className="py-3 px-4">GUEST &amp; COTTAGE</th>
                    <th className="py-3 px-3">DATE</th>
                    <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                    <th className="py-3 px-3 text-right">GST (₹)</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No invoices match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inv.guestName}</div>
                          <div className="text-[11px] text-slate-400">
                            {inv.roomNumber} {inv.bookingId && `• ${inv.bookingId}`}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{formatINR(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-indigo-700">
                          ₹{formatINR(inv.gstAmount)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : inv.status === 'Partial'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            ● {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewInvoice(inv)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="View / Print Tax Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {inv.status !== 'Paid' && inv.status !== 'Refunded' && (
                              <button
                                type="button"
                                onClick={() => onRecordPayment(inv)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onSendWhatsApp(inv)}
                              className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg cursor-pointer"
                              title="Send via WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-6 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] uppercase font-bold">
                    Gross Taxable Turnover
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-sans">
                    ₹{formatINR(totalTaxable)}
                  </p>
                  <span className="text-slate-400 text-[10px]">
                    SAC 9963 Accommodation &amp; F&amp;B
                  </span>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-indigo-700 text-[11px] uppercase font-bold">
                    Output CGST
                  </span>
                  <p className="text-2xl font-bold text-indigo-900 mt-1 font-sans">
                    ₹{formatINR(totalGst / 2)}
                  </p>
                  <span className="text-indigo-600 text-[10px]">Central Tax Ledger</span>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-indigo-700 text-[11px] uppercase font-bold">
                    Output SGST
                  </span>
                  <p className="text-2xl font-bold text-indigo-900 mt-1 font-sans">
                    ₹{formatINR(totalGst / 2)}
                  </p>
                  <span className="text-indigo-600 text-[10px]">Maharashtra State Ledger</span>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-sm">GSTR-1 JSON Export Ready</h4>
                  <p className="text-xs text-teal-700 mt-0.5">
                    {activeInvoices.length} active GST invoice{activeInvoices.length === 1 ? '' : 's'} compiled from Firestore ledger.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadGstr1Json}
                  className="px-4 py-2 bg-[#0c4033] hover:bg-[#082e25] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Download GSTR-1 JSON
                </button>
              </div>
            </div>
          )}
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
