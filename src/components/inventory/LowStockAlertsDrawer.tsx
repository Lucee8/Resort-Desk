import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  Package, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { InventoryItem } from '../../types';

interface LowStockAlertsDrawerProps {
  items: InventoryItem[];
  onClose: () => void;
  onQuickRestock: (item: InventoryItem) => void;
  onBulkRestockCritical: (criticalItems: InventoryItem[]) => void;
}

export default function LowStockAlertsDrawer({
  items,
  onClose,
  onQuickRestock,
  onBulkRestockCritical
}: LowStockAlertsDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');

  const alertItems = items.filter(i => i.safetyLevel === 'Critical' || i.safetyLevel === 'Low');
  const criticalItems = items.filter(i => i.safetyLevel === 'Critical');
  const lowItems = items.filter(i => i.safetyLevel === 'Low');

  const displayedItems = filter === 'critical' ? criticalItems : filter === 'low' ? lowItems : alertItems;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Low Stock & Safety Alerts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {alertItems.length} items require prompt restocking attention.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Alerts ({alertItems.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filter === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Critical ({criticalItems.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                filter === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Low ({lowItems.length})
            </button>
          </div>

          {criticalItems.length > 0 && (
            <button
              onClick={() => onBulkRestockCritical(criticalItems)}
              className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Bulk Restock All</span>
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {displayedItems.length > 0 ? (
            displayedItems.map((item) => {
              const isCritical = item.safetyLevel === 'Critical';
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical 
                      ? 'bg-rose-50/40 border-rose-200' 
                      : 'bg-amber-50/30 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isCritical ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {isCritical ? 'CRITICAL DEFICIT' : 'LOW STOCK'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Location: <span className="font-semibold text-slate-700">{item.storageLocation}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block uppercase text-[10px]">Held Stock</span>
                      <span className={`text-lg font-bold font-mono ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Min: {item.minStock} {item.unit}</span>
                    </div>
                  </div>

                  {/* Supplier & Reorder Action Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-600">
                      <span>Vendor: <strong>{item.supplier}</strong></span>
                    </div>

                    <button
                      onClick={() => onQuickRestock(item)}
                      className="px-3 py-1.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restock ({item.reorderQuantity} {item.unit})</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-2" />
              All operational supply levels are currently within safe thresholds.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Automated alerts dispatched to Storekeeper and Purchasing Lead.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
