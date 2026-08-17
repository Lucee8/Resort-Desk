import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  PlusCircle, 
  RotateCcw, 
  QrCode, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers,
  History,
  Info
} from 'lucide-react';
import { InventoryItem, StockMovement } from '../../types';

interface InventoryItemDetailDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
  onLogMovement: (item: InventoryItem) => void;
  onQuickRestock: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onPrintQR: (item: InventoryItem) => void;
}

export default function InventoryItemDetailDrawer({
  item,
  onClose,
  onLogMovement,
  onQuickRestock,
  onEditItem,
  onPrintQR
}: InventoryItemDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'supplier'>('overview');

  if (!item) return null;

  const stockPercentage = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));

  const getHealthBadge = (level: string) => {
    switch (level) {
      case 'Healthy':
        return (
          <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Healthy Stock Level
          </span>
        );
      case 'Low':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Low Stock Alert
          </span>
        );
      case 'Critical':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-800 text-xs font-bold rounded-full border border-rose-200 flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Critical - Below Safety Threshold
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">
            {level}
          </span>
        );
    }
  };

  const getMovementBadge = (type: StockMovement['type']) => {
    switch (type) {
      case 'Purchase':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Housekeeping':
      case 'Restaurant':
      case 'Room Replacement':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Damaged':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Adjustment':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 shrink-0">
                <Package className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  {item.sku}
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900 mt-1 leading-tight">
                {item.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supplied by <span className="font-semibold text-slate-700">{item.supplier}</span>
              </p>
            </div>
          </div>

          <button
            id="close-item-detail-drawer"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-teal-800 text-teal-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Specifications
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'border-teal-800 text-teal-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Stock Movements ({item.movements?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('supplier')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'supplier'
                ? 'border-teal-800 text-teal-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Procurement & Vendor
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              {/* SECTION 5: Large Visual Stock Status Indicator */}
              <div className="bg-slate-50/90 rounded-3xl p-5 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Current Stock Status
                  </span>
                  {getHealthBadge(item.safetyLevel)}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-slate-900">
                      {item.currentStock}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      {item.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-teal-900">
                      {stockPercentage}%
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Capacity Utilized
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stockPercentage <= 20 ? 'bg-rose-500' : stockPercentage <= 40 ? 'bg-amber-500' : 'bg-teal-700'
                    }`}
                    style={{ width: `${Math.max(5, stockPercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-mono">
                  <span>Min Safety Limit: {item.minStock} {item.unit}</span>
                  <span>Max Capacity: {item.maxStock} {item.unit}</span>
                </div>
              </div>

              {/* Specs & Storage Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Unit Purchase Cost
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    ₹ {item.costPerUnit.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500">Per {item.unit}</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Inventory Value
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    ₹ {item.totalValue.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500">Current held valuation</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Storage Location & Rack
                      </span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {item.storageLocation}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Zone: {item.warehouseZone || 'General'} • Bin: {item.shelfBin || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Last Restocked Date
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {item.lastRestocked}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Next Expected Delivery
                  </span>
                  <p className="text-xs font-bold text-teal-800 mt-1">
                    {item.nextExpectedDelivery || 'None in transit'}
                  </p>
                </div>
              </div>

              {/* Item Description */}
              {item.description && (
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Item Description & Quality Standard
                  </span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Expiry / Batch tracking if applicable */}
              {item.batchNumber && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Batch & Expiry Control (FEFO)
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      Batch: {item.batchNumber} • Expiry: {item.expiryDate}
                    </p>
                  </div>
                  {item.isExpiringSoon && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300">
                      Expiring Soon
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Stock Movement Timeline
                </h4>
                <button
                  onClick={() => onLogMovement(item)}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Movement</span>
                </button>
              </div>

              {item.movements && item.movements.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {item.movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <div key={mov.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isPositive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isPositive ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMovementBadge(mov.type)}`}>
                                {mov.type}
                              </span>
                              <span className="text-xs font-semibold text-slate-800">
                                {mov.reference || 'Operational issue'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Logged by <span className="font-medium text-slate-700">{mov.user}</span> ({mov.role}) • {mov.date}
                            </p>
                            {mov.notes && (
                              <p className="text-[11px] text-slate-600 italic mt-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                &ldquo;{mov.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold font-mono ${
                            isPositive ? 'text-teal-700' : 'text-amber-700'
                          }`}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No stock movement history recorded for this item yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Primary Supplier
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {item.supplier}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold rounded-lg">
                    Preferred Partner
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vendor SKU:</span>
                    <span className="font-mono font-semibold text-slate-800">{item.supplierSku || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Standard Lead Time:</span>
                    <span className="font-semibold text-slate-800">2-3 Business Days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Min Order Qty (MOQ):</span>
                    <span className="font-semibold text-slate-800">{item.reorderQuantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contract Rate:</span>
                    <span className="font-mono font-semibold text-slate-800">₹ {item.costPerUnit} / {item.unit}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-teal-950">
                    Automated Restock Enabled
                  </h5>
                  <p className="text-[11px] text-teal-700 mt-0.5">
                    When stock drops below {item.minStock} {item.unit}, auto-drafts PO for {item.reorderQuantity} {item.unit}.
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintQR(item)}
              className="p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Print QR / Barcode Tag"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditItem(item)}
              className="p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Edit Item Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="drawer-log-movement-btn"
              onClick={() => onLogMovement(item)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              <span>Log Movement</span>
            </button>

            <button
              id="drawer-quick-reorder-btn"
              onClick={() => onQuickRestock(item)}
              className="px-4 py-2.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restock PO ({item.reorderQuantity} {item.unit})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
