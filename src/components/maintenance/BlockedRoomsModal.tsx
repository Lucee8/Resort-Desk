import React from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, BedDouble, Wrench, ArrowRight } from 'lucide-react';
import { MaintenanceTicket } from '../../types';

interface BlockedRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedTickets: MaintenanceTicket[];
  onUnblockRoom: (ticketId: string) => void;
  onOpenTicket: (ticket: MaintenanceTicket) => void;
}

export default function BlockedRoomsModal({
  isOpen,
  onClose,
  blockedTickets,
  onUnblockRoom,
  onOpenTicket
}: BlockedRoomsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Blocked Guest Rooms ({blockedTickets.length})
              </h3>
              <p className="text-xs text-slate-500">
                These rooms are held from Front Desk check-in until engineering clears the work orders.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {blockedTickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">All Rooms Are Guest Ready!</p>
              <p className="text-xs text-slate-400">No rooms are currently blocked in PMS.</p>
            </div>
          ) : (
            blockedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 font-sans">
                      {ticket.roomNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {ticket.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold mt-1">
                    {ticket.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assigned to: <span className="font-semibold text-slate-700">{ticket.assignedTechnicianName || 'Unassigned'}</span> • Est: {ticket.estimatedCompletionTime || '45 mins'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onOpenTicket(ticket);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Ticket
                  </button>
                  <button
                    onClick={() => onUnblockRoom(ticket.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unblock for PMS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>PMS Status: Auto-synchronized</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
