import React, { useState, useMemo } from 'react';
import { 
  X, 
  Truck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  Building2, 
  DollarSign, 
  Download, 
  Printer, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { PurchaseOrder } from '../../types';

interface PurchaseOrdersModalProps {
  purchaseOrders: PurchaseOrder[];
  onClose: () => void;
  onOpenNewPO: () => void;
  onMarkAsReceived: (poId: string) => void;
}

export default function PurchaseOrdersModal({
  purchaseOrders,
  onClose,
  onOpenNewPO,
  onMarkAsReceived
}: PurchaseOrdersModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const statuses = ['All', 'Ordered', 'In Transit', 'Received', 'Delayed', 'Draft'];

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (selectedStatus !== 'All' && po.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPo = po.poNumber.toLowerCase().includes(query);
        const matchesSup = po.supplierName.toLowerCase().includes(query);
        const matchesItem = po.items.some(i => i.name.toLowerCase().includes(query));
        if (!matchesPo && !matchesSup && !matchesItem) return false;
      }
      return true;
    });
  }, [purchaseOrders, selectedStatus, searchQuery]);

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Received
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            In Transit
          </span>
        );
      case 'Ordered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            Ordered
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <Truck className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Purchase Orders Management
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Track pending deliveries, vendor consignments, and reconcile received goods.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewPO}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create PO</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO # or Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
            />
          </div>
        </div>

        {/* PO List / Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredPOs.length > 0 ? (
            filteredPOs.map((po) => (
              <div
                key={po.id}
                className="p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {po.poNumber}
                    </span>
                    {getStatusBadge(po.status)}
                    <span className="text-[11px] text-slate-400 font-medium">
                      Ordered: {po.orderDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {po.supplierName}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                    <span>
                      Items: <strong className="text-slate-700">{po.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Actions & Amount */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total PO Amount
                    </span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      ₹ {po.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Status: {po.paymentStatus}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {po.status !== 'Received' && (
                      <button
                        onClick={() => onMarkAsReceived(po.id)}
                        className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Mark consignment received & update inventory"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Receive Goods</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No purchase orders found matching the filter criteria.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredPOs.length}</strong> purchase orders
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
