import React, { useState } from 'react';
import { X, Send, Radio } from 'lucide-react';
import { Technician } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StaffRadioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  initialNote?: string;
}

export default function StaffRadioDrawer({
  isOpen,
  onClose,
  technicians,
  initialNote,
}: StaffRadioDrawerProps) {
  const { user } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Front Desk Ops';

  const [activeChannel, setActiveChannel] = useState<
    'General Dispatch' | 'HVAC Team' | 'Plumbing Team' | 'Electrical Team'
  >('General Dispatch');
  const [messageText, setMessageText] = useState(initialNote || '');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ResortDesk Dispatch',
      text: 'Maintenance dispatch channel ready. Broadcast cottage ticket updates to engineering team.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
    },
  ]);

  React.useEffect(() => {
    if (initialNote) setMessageText(initialNote);
  }, [initialNote]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: operatorName,
        text: `[${activeChannel}] ${messageText.trim()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
      },
    ]);
    setMessageText('');
  };

  const quickBroadcasts = [
    'Please prioritize blocked cottages before 1:00 PM check-ins',
    'Spare parts received at store desk',
    'Confirm status update on active ticket',
    'Afternoon shift handover at Reception',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-2xs flex justify-end font-sans">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-200/80 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Staff Dispatch Log</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300">
                {technicians.length} technicians registered • In-session broadcast log
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-100 p-2 flex gap-1 border-b border-slate-200 overflow-x-auto">
          {(
            ['General Dispatch', 'HVAC Team', 'Plumbing Team', 'Electrical Team'] as const
          ).map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() => setActiveChannel(channel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeChannel === channel
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                <span className="font-bold text-slate-700">{m.sender}</span>
                <span>• {m.time}</span>
              </div>
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                  m.isSelf
                    ? 'bg-teal-800 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto flex gap-1.5">
          {quickBroadcasts.map((qc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMessageText(qc)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              {qc}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Broadcast note to #${activeChannel}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
