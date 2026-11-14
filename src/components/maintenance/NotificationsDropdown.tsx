import React from 'react';
import { X, Bell } from 'lucide-react';
import { MaintenanceTicket } from '../../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  tickets?: MaintenanceTicket[];
  onOpenTicketById?: (ticketId: string) => void;
}

export default function NotificationsDropdown({
  isOpen,
  onClose,
  tickets = [],
  onOpenTicketById,
}: NotificationsDropdownProps) {
  if (!isOpen) return null;

  const notifications = tickets
    .filter(
      (t) =>
        t.status !== 'Closed' &&
        (t.priority === 'Emergency' ||
          t.priority === 'High' ||
          t.isRoomBlocked ||
          !t.assignedTechnicianName)
    )
    .slice(0, 8)
    .map((t) => ({
      id: `notif-${t.id}`,
      title: `${t.priority}: ${t.title}`,
      desc: `${t.roomNumber} • ${t.isRoomBlocked ? 'Blocked in PMS' : 'Open'}${
        t.assignedTechnicianName ? ` • Assigned to ${t.assignedTechnicianName}` : ' • Unassigned'
      }`,
      time: t.reportedTime || t.reportedDate,
      type:
        t.priority === 'Emergency'
          ? 'critical'
          : t.priority === 'High' || t.isRoomBlocked
            ? 'warning'
            : 'info',
      ticketId: t.id,
    }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-800" />
            <h3 className="text-base font-bold text-slate-900">
              Maintenance Alerts ({notifications.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No urgent, blocked, or unassigned maintenance alerts active.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => {
                  if (n.ticketId && onOpenTicketById) onOpenTicketById(n.ticketId);
                  onClose();
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.type === 'critical'
                        ? 'bg-rose-600 animate-pulse'
                        : n.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-teal-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-teal-800 hover:underline cursor-pointer"
          >
            Close Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
