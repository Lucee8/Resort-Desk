import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  Plus,
  Truck
} from 'lucide-react';
import { PurchaseOrder } from '../../types';

interface RecentPurchasesPanelProps {
  purchaseOrders: PurchaseOrder[];
  onSeeAll: () => void;
  onSelectPO: (po: PurchaseOrder) => void;
  onNewPO: () => void;
}

export default function RecentPurchasesPanel({
  purchaseOrders,
  onSeeAll,
  onSelectPO,
  onNewPO
}: RecentPurchasesPanelProps) {
  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            RECEIVED
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            IN TRANSIT
          </span>
        );
      case 'Ordered':
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 tracking-wider">
            <FileText className="w-3 h-3 text-sky-600" />
            PENDING
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            DELAYED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 tracking-wider">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getStatusDot = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Received':
        return 'bg-teal-500';
      case 'In Transit':
        return 'bg-amber-500';
      case 'Delayed':
        return 'bg-rose-500';
      case 'Draft':
      case 'Ordered':
      default:
        return 'bg-sky-500';
    }
  };

  return (
    <div 
      id="recent-purchases-card"
      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Card Header matching reference */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-serif">
            Recent Purchases
          </h3>
          <button
            id="see-all-purchases-btn"
            onClick={onSeeAll}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer"
          >
            See All
          </button>
        </div>

        {/* Purchase List matching reference layout */}
        <div className="divide-y divide-slate-100 mt-2">
          {purchaseOrders.slice(0, 5).map((po) => (
            <div
              key={po.id}
              onClick={() => onSelectPO(po)}
              className="py-3.5 flex items-start gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-all cursor-pointer group"
            >
              {/* Status Dot */}
              <span 
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getStatusDot(po.status)}`} 
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                    {po.supplierName}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
                  <span className="font-mono font-semibold text-slate-700">₹ {po.totalAmount.toLocaleString()}</span>
                  <span>•</span>
                  <span>{po.orderDate}</span>
                </div>

                <div className="mt-1.5">
                  {getStatusBadge(po.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {purchaseOrders.length} total orders logged
        </span>
        <button
          onClick={onNewPO}
          className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New PO</span>
        </button>
      </div>
    </div>
  );
}
