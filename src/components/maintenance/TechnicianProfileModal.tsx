import React from 'react';
import { X, Phone, MessageSquare } from 'lucide-react';
import { Technician, MaintenanceTicket } from '../../types';

interface TechnicianProfileModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
  assignedTickets: MaintenanceTicket[];
  onOpenTicket: (ticket: MaintenanceTicket) => void;
  onPingTechnician?: (tech: Technician) => void;
}

export default function TechnicianProfileModal({
  technician,
  isOpen,
  onClose,
  assignedTickets,
  onOpenTicket,
  onPingTechnician,
}: TechnicianProfileModalProps) {
  if (!isOpen || !technician) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200/80 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={technician.avatar}
                alt={technician.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-teal-700/20"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  technician.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{technician.name}</h3>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {technician.department}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff ID: {technician.id} • Experience: {technician.experience}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                <a
                  href={`tel:${technician.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1 text-teal-800 font-semibold hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>{technician.phone}</span>
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Completed Tickets
              </span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                {technician.completedTicketsCount}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Logged total</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Efficiency Rating
              </span>
              <p className="text-xl font-bold text-teal-800 font-mono mt-1">
                {technician.efficiency}%
              </p>
              <span className="text-[10px] text-teal-600 font-medium">Speed &amp; Quality</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Avg Resolution
              </span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">
                {technician.avgResolutionTime}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Standard fixes</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Skills &amp; Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {technician.specialization.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 text-xs font-semibold rounded-lg"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Currently Assigned Work Orders ({assignedTickets.length})
            </h4>
            {assignedTickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No active work orders assigned to {technician.name}.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onOpenTicket(t);
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{t.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{t.id}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {t.roomNumber} • Priority: {t.priority}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-teal-800">{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onPingTechnician?.(technician);
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Dispatch Chat</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
