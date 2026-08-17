import React, { useState } from 'react';
import { X, FileText, ChevronRight, Calculator, CheckCircle2, Clock, Utensils, Sparkles } from 'lucide-react';
import { UnbilledStayItem } from '../../types';
import { initialUnbilledStays } from '../../data/billingData';

interface UnbilledStaysDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unbilledStays?: UnbilledStayItem[];
  onGenerateInvoiceForStay: (stay: UnbilledStayItem) => void;
  triggerToast: (msg: string) => void;
}

export default function UnbilledStaysDrawer({
  isOpen,
  onClose,
  unbilledStays = initialUnbilledStays,
  onGenerateInvoiceForStay,
  triggerToast
}: UnbilledStaysDrawerProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'Checking Out Today' | 'In-House'>('ALL');

  const filtered = unbilledStays.filter(s => {
    if (filterType === 'ALL') return true;
    return s.status === filterType;
  });

  const totalUnbilledAmount = unbilledStays.reduce((acc, s) => acc + s.totalPending, 0);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base">Unbilled In-House Rooms</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {unbilledStays.length} Rooms with active accumulated folios (Total: ₹{formatINR(totalUnbilledAmount)})
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              filterType === 'ALL' ? 'bg-[#0c4033] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All 14 Rooms
          </button>
          <button
            type="button"
            onClick={() => setFilterType('Checking Out Today')}
            className={`px-3 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              filterType === 'Checking Out Today' ? 'bg-amber-700 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Checking Out Today (6)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('In-House')}
            className={`px-3 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              filterType === 'In-House' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            In-House Mid-Stay
          </button>
        </div>

        {/* List of unbilled stays */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3 flex-1">
          {filtered.map((stay) => (
            <div
              key={stay.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-700/50 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{stay.roomNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stay.status === 'Checking Out Today' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}>
                      {stay.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-700 mt-1">{stay.guestName}</h4>
                  <p className="text-[11px] text-slate-400">
                    {stay.checkInDate} - {stay.checkOutDate} • {stay.nightsStayed} nights logged
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 font-sans">
                    ₹{formatINR(stay.totalPending)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">+ 18% GST</span>
                </div>
              </div>

              {/* Folio Breakdown */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Room Tariff</span>
                  <span className="font-semibold text-slate-800">₹{formatINR(stay.roomTariffPending)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">F&amp;B Orders</span>
                  <span className="font-semibold text-slate-800">₹{formatINR(stay.diningPending)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Spa &amp; Extras</span>
                  <span className="font-semibold text-slate-800">₹{formatINR(stay.spaPending + stay.laundryPending)}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onGenerateInvoiceForStay(stay);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c4033] hover:bg-[#082e25] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Create Checkout Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Unbilled folios sync live from POS &amp; Housekeeping
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
