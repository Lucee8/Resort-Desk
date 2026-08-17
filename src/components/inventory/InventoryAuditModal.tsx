import React, { useState } from 'react';
import { 
  X, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryAuditModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onApplyReconciliation: (updates: { itemId: string; newStock: number; reason: string }[]) => void;
}

export default function InventoryAuditModal({
  items,
  onClose,
  onApplyReconciliation
}: InventoryAuditModalProps) {
  // Initialize counted values with current stock
  const [counts, setCounts] = useState<Record<string, { physical: number; reason: string }>>(
    items.reduce((acc, item) => {
      // simulate variance on first 2 items
      const variance = item.id === 'inv-1' ? -5 : item.id === 'inv-4' ? -3 : 0;
      acc[item.id] = {
        physical: Math.max(0, item.currentStock + variance),
        reason: variance < 0 ? 'Laundry damage / discarded' : 'Accurate match'
      };
      return acc;
    }, {} as Record<string, { physical: number; reason: string }>)
  );

  const [auditorName, setAuditorName] = useState('Vikram Deshmukh (Operations Manager)');
  const [auditDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));

  const handlePhysicalChange = (itemId: string, val: number) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        physical: Math.max(0, val)
      }
    }));
  };

  const handleReasonChange = (itemId: string, reason: string) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reason
      }
    }));
  };

  // Discrepancy stats
  const discrepancies = items.map(item => {
    const physical = counts[item.id]?.physical ?? item.currentStock;
    const diff = physical - item.currentStock;
    const valueVariance = diff * item.costPerUnit;
    return {
      item,
      system: item.currentStock,
      physical,
      diff,
      valueVariance,
      reason: counts[item.id]?.reason || ''
    };
  });

  const totalVarianceValue = discrepancies.reduce((sum, d) => sum + d.valueVariance, 0);
  const discrepancyItemsCount = discrepancies.filter(d => d.diff !== 0).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = discrepancies
      .filter(d => d.diff !== 0)
      .map(d => ({
        itemId: d.item.id,
        newStock: d.physical,
        reason: d.reason || 'Physical Audit Reconciliation'
      }));

    onApplyReconciliation(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <ClipboardCheck className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Physical Stock Count & Variance Audit
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Reconcile physical warehouse counts with digital ledger balances.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Meta & Discrepancy Summary Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Auditor</span>
              <span className="font-semibold text-slate-800">{auditorName}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Audit Date</span>
              <span className="font-semibold text-slate-800">{auditDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Items with Variance: </span>
              <strong className={discrepancyItemsCount > 0 ? 'text-amber-600' : 'text-teal-700'}>
                {discrepancyItemsCount}
              </strong>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Net Variance Value: </span>
              <strong className={`font-mono ${totalVarianceValue < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                ₹ {totalVarianceValue.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-2.5 px-3">Item / SKU</th>
                <th className="py-2.5 px-3">System Qty</th>
                <th className="py-2.5 px-3 min-w-[110px]">Physical Count</th>
                <th className="py-2.5 px-3">Variance (+/-)</th>
                <th className="py-2.5 px-3">Value Impact</th>
                <th className="py-2.5 px-3 min-w-[180px]">Discrepancy Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discrepancies.map((d) => (
                <tr key={d.item.id} className="hover:bg-slate-50/60">
                  {/* Name */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{d.item.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{d.item.sku} • {d.item.category}</span>
                  </td>

                  {/* System Qty */}
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    {d.system} {d.item.unit}
                  </td>

                  {/* Physical Count Input */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="0"
                      value={d.physical}
                      onChange={(e) => handlePhysicalChange(d.item.id, parseInt(e.target.value) || 0)}
                      className="w-24 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-700"
                    />
                  </td>

                  {/* Variance */}
                  <td className="py-3 px-3 font-mono font-bold">
                    {d.diff === 0 ? (
                      <span className="text-slate-400">0</span>
                    ) : d.diff > 0 ? (
                      <span className="text-teal-700">+{d.diff} {d.item.unit}</span>
                    ) : (
                      <span className="text-rose-600">{d.diff} {d.item.unit}</span>
                    )}
                  </td>

                  {/* Value Variance */}
                  <td className="py-3 px-3 font-mono font-semibold">
                    {d.valueVariance === 0 ? (
                      <span className="text-slate-400">₹0</span>
                    ) : (
                      <span className={d.valueVariance < 0 ? 'text-rose-600' : 'text-teal-700'}>
                        ₹ {d.valueVariance.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Reason Code */}
                  <td className="py-3 px-3">
                    <select
                      value={d.reason}
                      onChange={(e) => handleReasonChange(d.item.id, e.target.value)}
                      disabled={d.diff === 0}
                      className="w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 text-[11px] rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
                    >
                      <option value="Accurate match">Accurate match</option>
                      <option value="Laundry damage / discarded">Laundry damage / discarded</option>
                      <option value="Room turnover shrinkage">Room turnover shrinkage</option>
                      <option value="Expired / Evaporated">Expired / Evaporated</option>
                      <option value="Misplaced / Found Extra">Misplaced / Found Extra</option>
                      <option value="Unrecorded purchase arrival">Unrecorded purchase arrival</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Applying will write adjustment logs and update held stock levels immediately.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#0c4a45] hover:bg-[#083834] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Apply Reconciliation & Adjust Stock</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
