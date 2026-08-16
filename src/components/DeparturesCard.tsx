import React, { useState } from 'react';
import { History, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Departure } from '../types';

interface DeparturesCardProps {
  departures: Departure[];
  onCheckOut: (id: string) => void;
  onReviewBilling?: (guestName: string, amount: number) => void;
}

export default function DeparturesCard({ departures, onCheckOut, onReviewBilling }: DeparturesCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Filter based on checked out / pending state
  const activeDepartures = departures.filter(dep => showHistory || dep.status !== 'Checked Out');
  const checkedOutCount = departures.filter(dep => dep.status === 'Checked Out').length;

  return (
    <div id="departures-card" className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between min-h-[380px] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Today's Departures</h3>
          <button 
            id="departures-viewall-btn"
            onClick={() => alert(`Completed: ${checkedOutCount} / Scheduled: ${departures.length}`)}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
          >
            View All
          </button>
        </div>

        {/* Guest List */}
        <div className="mt-4 flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
          {activeDepartures.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col gap-1 items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>All departures processed for today!</span>
            </div>
          ) : (
            activeDepartures.map((guest) => {
              const isPending = guest.status === 'Pending';
              const isCheckedOut = guest.status === 'Checked Out';
              const isScheduled = guest.status === 'Scheduled';
              
              return (
                <div 
                  id={`departure-item-${guest.id}`}
                  key={guest.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="w-9 h-9 rounded-full bg-slate-150 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                      {guest.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-800">{guest.guestName}</h4>
                        {isPending && guest.amountDue && guest.amountDue > 0 && (
                          <span 
                            title={`Outstanding due: ₹${guest.amountDue}`}
                            onClick={() => onReviewBilling?.(guest.guestName, guest.amountDue!)}
                            className="cursor-pointer text-[10px] text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 flex items-center gap-0.5"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Due
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Room {guest.roomNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action badge */}
                    {isCheckedOut ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                        Checked Out
                      </span>
                    ) : (
                      <button
                        id={`checkout-btn-${guest.id}`}
                        onClick={() => onCheckOut(guest.id)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all duration-200 ${
                          isPending 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-teal-700 hover:text-white hover:border-teal-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-teal-700 hover:text-white hover:border-teal-700'
                        }`}
                      >
                        {isPending ? 'Pending' : 'Scheduled'}
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
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center">
        <button
          id="departures-history-btn"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? "Hide Checked Out" : "History"}</span>
        </button>
      </div>
    </div>
  );
}
