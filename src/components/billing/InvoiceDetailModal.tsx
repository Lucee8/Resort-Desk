import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  MessageSquare, 
  CreditCard, 
  RotateCcw, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { BillingInvoice } from '../../types';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  onRecordPayment: (invoice: BillingInvoice) => void;
  onProcessRefund: (invoice: BillingInvoice) => void;
  onSendWhatsApp: (invoice: BillingInvoice) => void;
  triggerToast: (msg: string) => void;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  onProcessRefund,
  onSendWhatsApp,
  triggerToast
}: InvoiceDetailModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    triggerToast('Print dialog initiated for Tax Invoice.');
  };

  const handleDownloadPDF = () => {
    triggerToast(`Downloading PDF for ${invoice?.invoiceNumber}...`);
  };

  if (!isOpen || !invoice) return null;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-teal-300">
              {invoice.invoiceNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              invoice.status === 'Paid' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : invoice.status === 'Pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : invoice.status === 'Partial'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              ● {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Print Tax Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSendWhatsApp(invoice)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Send to Guest via WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-teal-300" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Canvas */}
        <div ref={printRef} className="p-8 overflow-y-auto bg-white text-slate-800 flex flex-col gap-6 text-xs font-sans">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#0c4033] pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0c4033] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
                  RD
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#0c4033] tracking-wide">
                    ResortDesk Luxury Resort &amp; Spa
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">A Premium Oceanfront Hospitality Property</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Awas Beach Road, Mandwa Jetty, Alibaug, Maharashtra - 402201<br />
                <strong>GSTIN:</strong> 27AAACR9921K1Z8 | <strong>PAN:</strong> AAACR9921K | <strong>SAC Code:</strong> 9963
              </p>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-xl font-bold uppercase tracking-wider text-slate-900 font-sans block">
                TAX INVOICE
              </span>
              <span className="text-xs text-slate-400 font-mono">Original for Recipient</span>
              <div className="mt-2 text-[11px] font-semibold text-slate-700">
                Invoice Date: <span className="font-bold text-slate-900">{invoice.issueDate}</span>
              </div>
            </div>
          </div>

          {/* Guest & Place of Supply Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Guest Details)
              </span>
              <h4 className="text-sm font-bold text-slate-900">{invoice.guestName}</h4>
              {invoice.companyName && (
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{invoice.companyName}</p>
              )}
              <p className="text-slate-600 mt-1">Room: <strong>{invoice.roomNumber}</strong></p>
              {invoice.bookingId && <p className="text-slate-500 text-[11px]">Booking ID: {invoice.bookingId}</p>}
              {invoice.guestPhone && <p className="text-slate-500 text-[11px]">Phone: {invoice.guestPhone}</p>}
              {invoice.guestGstin && (
                <p className="text-xs font-mono font-semibold text-teal-900 mt-1 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                  GSTIN: {invoice.guestGstin}
                </p>
              )}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Invoice Meta
                </span>
                <p className="text-slate-600">Place of Supply: <strong>27 - Maharashtra</strong></p>
                <p className="text-slate-600">Due Date: <strong>{invoice.dueDate}</strong></p>
                <p className="text-slate-600">Payment Status: <strong>{invoice.status}</strong></p>
                {invoice.paymentMethod && (
                  <p className="text-slate-500 text-[11px] mt-1">Mode: {invoice.paymentMethod}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0c4033] text-white text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Goods / Services</th>
                  <th className="py-2.5 px-2 text-center">SAC</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-2 text-center">GST %</th>
                  <th className="py-2.5 px-4 text-right">Taxable (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoice.items.map((it, idx) => (
                  <tr key={it.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{it.description}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-500">{it.sacCode || '996311'}</td>
                    <td className="py-3 px-2 text-center font-medium">{it.qty}</td>
                    <td className="py-3 px-3 text-right">₹{formatINR(it.unitPrice)}</td>
                    <td className="py-3 px-2 text-center font-semibold text-indigo-700">{it.gstRate}%</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{formatINR(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary, GST Slabs, & UPI Scan to Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
            {/* Left: GST Slab Breakdown & UPI Payment */}
            <div className="flex flex-col gap-4">
              {/* GST Slab box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px]">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Statutory Tax Breakdown
                </span>
                <div className="flex justify-between text-slate-600 py-0.5">
                  <span>CGST (Central Tax @ 9%):</span>
                  <span className="font-semibold text-slate-800">₹{formatINR(invoice.cgstAmount || invoice.gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 py-0.5">
                  <span>SGST (State Tax @ 9%):</span>
                  <span className="font-semibold text-slate-800">₹{formatINR(invoice.sgstAmount || invoice.gstAmount / 2)}</span>
                </div>
                {invoice.igstAmount && invoice.igstAmount > 0 && (
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span>IGST (Integrated Tax @ 18%):</span>
                    <span className="font-semibold text-slate-800">₹{formatINR(invoice.igstAmount)}</span>
                  </div>
                )}
              </div>

              {/* UPI QR Pay Box */}
              {invoice.status !== 'Paid' && invoice.status !== 'Refunded' && (
                <div className="p-4 bg-teal-50/80 border border-teal-200/80 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl border border-teal-200 shadow-2xs shrink-0 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-teal-900" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-teal-950">Instant UPI Scan &amp; Pay</h5>
                    <p className="text-[11px] text-teal-800/80 mt-0.5">
                      VPA: <strong>resortdesk@hdfcbank</strong>
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/80 px-2 py-0.5 rounded-md inline-block mt-1">
                      Amount: ₹{formatINR(invoice.dueAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Totals Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>Total GST (18%):</span>
                <span className="font-semibold">₹{formatINR(invoice.gstAmount)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">- ₹{formatINR(invoice.discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-300 my-1 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-[#0c4033] font-bold text-lg">₹{formatINR(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-semibold text-emerald-700">₹{formatINR(invoice.paidAmount)}</span>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  <span>Balance Due:</span>
                  <span>₹{formatINR(invoice.dueAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Notice if Refunded */}
          {invoice.status === 'Refunded' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Refund Processed:</strong> ₹{formatINR(invoice.refundAmount || invoice.totalAmount)} refunded on {invoice.refundDate || invoice.issueDate}.
                {invoice.refundReason && <p className="text-rose-600 text-[11px] mt-0.5">Reason: {invoice.refundReason}</p>}
              </div>
            </div>
          )}

          {/* Terms & Footer Signature */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-end text-[10px] text-slate-400 gap-4">
            <div>
              <p>1. Invoices are computer-generated under Rule 48(4) of the CGST Rules, 2017.</p>
              <p>2. Subject to Alibaug / Mumbai jurisdiction.</p>
            </div>
            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-600 text-xs">Anand Sharma</div>
              <p className="font-sans font-semibold text-slate-500">Authorised Signatory • ResortDesk</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            {invoice.status !== 'Paid' && invoice.status !== 'Refunded' && (
              <button
                type="button"
                onClick={() => onRecordPayment(invoice)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment (₹{formatINR(invoice.dueAmount)})</span>
              </button>
            )}

            {invoice.status === 'Paid' && (
              <button
                type="button"
                onClick={() => onProcessRefund(invoice)}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Refund</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSendWhatsApp(invoice)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0c4033] hover:bg-[#082e25] rounded-xl transition-all shadow-md shadow-[#0c4033]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>Send WhatsApp Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
