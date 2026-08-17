import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, MessageSquare, Wrench, ShieldAlert } from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTicketById?: (ticketId: string) => void;
}

export default function NotificationsDropdown({
  isOpen,
  onClose,
  onOpenTicketById
}: NotificationsDropdownProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Emergency: AC Leak Escalated',
      desc: 'Deluxe Villa #104 marked as blocked in PMS. Assigned to Rajesh Malik.',
      time: '10 mins ago',
      type: 'critical',
      ticketId: 'TKT-1024'
    },
    {
      id: 'notif-2',
      title: 'Work Order Resolved',
      desc: 'Room 302 faucet leak successfully fixed and water pressure verified.',
      time: '2 hours ago',
      type: 'success',
      ticketId: 'TKT-1019'
    },
    {
      id: 'notif-3',
      title: 'IoT Battery Depletion Warning',
      desc: 'RFID lock battery on Beachfront Villa #005 dropped below 12%.',
      time: '4 hours ago',
      type: 'warning',
      ticketId: 'TKT-1021'
    },
    {
      id: 'notif-4',
      title: 'Technician Shift Check-in',
      desc: '8 technicians checked in on duty across morning & afternoon shifts.',
      time: '6 hours ago',
      type: 'info'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-800" />
            <h3 className="text-base font-bold text-slate-900">Maintenance Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className="py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => {
                if (n.ticketId && onOpenTicketById) onOpenTicketById(n.ticketId);
                onClose();
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  n.type === 'critical' ? 'bg-rose-600 animate-pulse' :
                  n.type === 'warning' ? 'bg-amber-500' :
                  n.type === 'success' ? 'bg-emerald-500' : 'bg-teal-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {n.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-teal-800 hover:underline"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
