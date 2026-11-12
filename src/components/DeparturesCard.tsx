import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Departure } from '../types';

interface DeparturesCardProps {
  departures: Departure[];
  onCheckOut: (id: string) => void;
  onReviewBilling?: (guestName: string, amount: number) => void;
  onNavigateToBookings?: () => void;
}

export default function DeparturesCard({ 
  departures, 
  onCheckOut, 
  onReviewBilling,
  onNavigateToBookings 
}: DeparturesCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Filter based on checked out / pending state
  const activeDepartures = departures.filter(dep => showHistory || dep.status !== 'Checked Out');
  const checkedOutCount = departures.filter(dep => dep.status === 'Checked Out').length;
  const pendingCount = departures.filter(dep => dep.status !== 'Checked Out').length;

  return (
    <div id="departures-card" className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs flex flex-col justify-between font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Today's Departures</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100">
                {checkedOutCount}/{departures.length} Cleared
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Checkout inspection & folio clearing</p>
          </div>
          <button 
            id="departures-viewall-btn"
            onClick={() => onNavigateToBookings ? onNavigateToBookings() : alert(`Departures status: ${checkedOutCount} cleared, ${pendingCount} pending checkout.`)}
            className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Guest List */}
        <div className="mt-3.5 flex flex-col gap-2.5 max-h-[310px] overflow-y-auto pr-1">
          {activeDepartures.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col gap-1.5 items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-700">All scheduled departures cleared for today!</span>
              <p className="text-[11px] text-slate-400">Toggle History below to inspect processed check-out folios.</p>
            </div>
          ) : (
            activeDepartures.map((guest) => {
              const isPending = guest.status === 'Pending';
              const isCheckedOut = guest.status === 'Checked Out';
              const hasDue = Boolean(guest.amountDue && guest.amountDue > 0);
              
              return (
                <div 
                  id={`departure-item-${guest.id}`}
                  key={guest.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-colors gap-2.5 group ${
                    hasDue && !isCheckedOut
                      ? 'border-rose-100 bg-rose-50/20 hover:bg-rose-50/40'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="w-9 h-9 rounded-full bg-slate-150 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200 shrink-0">
                      {guest.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{guest.guestName}</h4>
                        {/* Booking Status Pill */}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          isCheckedOut
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        }`}>
                          {guest.bookingStatus || (isCheckedOut ? 'Completed' : 'Active Stay')}
                        </span>
                      </div>

                      {/* Room & Time & Payment Subtext */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">Cottage {guest.roomNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {guest.checkoutTime || '11:00 AM'}
                        </span>
                        <span>•</span>
                        {/* Payment Status Pill */}
                        {hasDue ? (
                          <span 
                            onClick={() => onReviewBilling?.(guest.guestName, guest.amountDue!)}
                            title="Click to review and collect outstanding balance"
                            className="cursor-pointer inline-flex items-center gap-1 text-[9px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                            <span>Due: ₹{guest.amountDue}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CreditCard className="w-2.5 h-2.5" />
                            <span>Folio Settled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Review Folio button when due */}
                    {hasDue && !isCheckedOut && onReviewBilling && (
                      <button
                        type="button"
                        onClick={() => onReviewBilling(guest.guestName, guest.amountDue!)}
                        className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Collect ₹{guest.amountDue}
                      </button>
                    )}

                    {/* Action badge */}
                    {isCheckedOut ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                        Departed
                      </span>
                    ) : (
                      <button
                        id={`checkout-btn-${guest.id}`}
                        onClick={() => onCheckOut(guest.id)}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer shadow-2xs ${
                          isPending 
                            ? 'bg-[#a64b2a] hover:bg-[#8f3f22] text-white' 
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        Check-out
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer History Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="text-[11px] text-slate-400">
          Turnover target: 30 mins after key return
        </span>
        <button
          id="departures-history-btn"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? "Hide Checked Out" : `Show History (${checkedOutCount})`}</span>
        </button>
      </div>
    </div>
  );
}
