import React, { useState } from 'react';
import { 
  Receipt, 
  Percent, 
  Hash, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ArrowUpRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BillingGSTSettings, SACRateItem } from '../../types';

interface BillingGSTSectionProps {
  settings: BillingGSTSettings;
  onChange: (updated: Partial<BillingGSTSettings>) => void;
  onNavigateToBilling?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function BillingGSTSection({
  settings,
  onChange,
  onNavigateToBilling,
  triggerToast
}: BillingGSTSectionProps) {
  const [showAddSacModal, setShowAddSacModal] = useState(false);
  const [newSacCode, setNewSacCode] = useState('');
  const [newSacServiceName, setNewSacServiceName] = useState('');
  const [newSacGstRate, setNewSacGstRate] = useState<number>(18);
  const [newSacDesc, setNewSacDesc] = useState('');

  const handleUpdateSacRate = (index: number, newRate: number) => {
    const updated = [...settings.sacRates];
    updated[index] = { ...updated[index], gstRate: newRate };
    onChange({ sacRates: updated });
  };

  const handleAddSacCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSacCode || !newSacServiceName) return;
    const newItem: SACRateItem = {
      code: newSacCode,
      serviceName: newSacServiceName,
      gstRate: Number(newSacGstRate),
      description: newSacDesc || 'Hospitality Service'
    };
    onChange({ sacRates: [...settings.sacRates, newItem] });
    if (triggerToast) triggerToast(`SAC Code ${newSacCode} mapped with ${newSacGstRate}% GST.`);
    setNewSacCode('');
    setNewSacServiceName('');
    setShowAddSacModal(false);
  };

  const handleDeleteSac = (code: string) => {
    onChange({ sacRates: settings.sacRates.filter(s => s.code !== code) });
  };

  return (
    <div id="settings-billing-gst-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Section Header & Quick Link to Billing Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Billing, GST & Tax Invoicing Rules</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              GSTR-1 & Section 31 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage statutory GST tax rates, HSN/SAC code mapping, automated invoice numbering series, and payment reconciliation.
          </p>
        </div>

        {onNavigateToBilling && (
          <button
            type="button"
            onClick={onNavigateToBilling}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-teal-700 hover:text-teal-900 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Billing Module</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Tax Identification & Invoicing Series */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Hash className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Statutory Tax & Invoice Sequence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Registered GSTIN
            </label>
            <input
              type="text"
              value={settings.gstin}
              onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              State Tax Jurisdiction
            </label>
            <input
              type="text"
              value={settings.stateCode}
              onChange={(e) => onChange({ stateCode: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Financial Year Sequence
            </label>
            <input
              type="text"
              value={settings.fySequence}
              onChange={(e) => onChange({ fySequence: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Invoice Number Prefix
            </label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) => onChange({ invoicePrefix: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
              placeholder="e.g. OGOA-2026/"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Next Invoice Counter
            </label>
            <input
              type="number"
              value={settings.nextInvoiceNumber}
              onChange={(e) => onChange({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Generated Example Preview
            </label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-900">
              {settings.invoicePrefix}{settings.nextInvoiceNumber}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SAC Code Tax Slab Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Hospitality SAC Code Tax Matrix</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify CGST + SGST (Intra-state) and IGST (Inter-state) for individual folio line item categories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSacModal(true)}
            className="px-3.5 py-1.5 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add SAC Code
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">SAC CODE</th>
                <th className="py-3 px-4">SERVICE CATEGORY</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4 text-center">APPLIED GST %</th>
                <th className="py-3 px-4 text-center">BREAKDOWN</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.sacRates.map((item, idx) => (
                <tr key={item.code} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{item.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.serviceName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.description}</td>
                  <td className="py-3.5 px-4 text-center">
                    <select
                      value={item.gstRate}
                      onChange={(e) => handleUpdateSacRate(idx, Number(e.target.value))}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-teal-900 bg-white"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                      <option value={28}>28% GST</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 font-mono">
                    {item.gstRate > 0 ? `${item.gstRate / 2}% CGST + ${item.gstRate / 2}% SGST` : 'Nil Rated'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {settings.sacRates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSac(item.code)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Automated Folio Dispatch & Payment Gateway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Payment Reconciliation & Refunds</h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Auto-Settle Razorpay Transactions</div>
              <div className="text-[11px] text-slate-400">Capture folio payments immediately</div>
            </div>
            <input
              type="checkbox"
              checked={settings.razorpayAutoSettle}
              onChange={(e) => onChange({ razorpayAutoSettle: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Auto-Dispatch Invoice via WhatsApp</div>
              <div className="text-[11px] text-slate-400">Send PDF to guest upon checkout settlement</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoDispatchInvoiceWhatsApp}
              onChange={(e) => onChange({ autoDispatchInvoiceWhatsApp: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Interstate IGST Engine</div>
              <div className="text-[11px] text-slate-400">Auto-detect out-of-state guest GSTIN</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableInterstateIGST}
              onChange={(e) => onChange({ enableInterstateIGST: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Cancellation Retention & Credit Notes</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Under GST Law Section 34(2), credit notes must be linked to the original tax invoice. Retention fees on late cancellations remain subject to standard 18% GST.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Standard Refund Processing SLA (Business Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={settings.refundProcessingDays}
                onChange={(e) => onChange({ refundProcessingDays: parseInt(e.target.value) || 3 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-[11px] text-teal-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Monthly GSTR-1 tables auto-reconciled with Tally ERP.</span>
          </div>
        </div>
      </div>

      {/* MODAL: Add SAC Code */}
      {showAddSacModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Add SAC Code Mapping</h3>
              </div>
              <button onClick={() => setShowAddSacModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSacCode} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">SAC Code (6-digits)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 996332"
                  value={newSacCode}
                  onChange={(e) => setNewSacCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Service Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banquet & Conference Hall"
                  value={newSacServiceName}
                  onChange={(e) => setNewSacServiceName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Statutory GST Slab</label>
                <select
                  value={newSacGstRate}
                  onChange={(e) => setNewSacGstRate(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Event venue hiring & equipment"
                  value={newSacDesc}
                  onChange={(e) => setNewSacDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSacModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Save SAC Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
