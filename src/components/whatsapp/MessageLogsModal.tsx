import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Send, 
  CornerUpLeft, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  User, 
  FileText,
  Filter,
  Check
} from 'lucide-react';
import { WhatsAppMessageLog } from '../../types';

interface MessageLogsModalProps {
  logs: WhatsAppMessageLog[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageLogsModal({
  logs,
  isOpen,
  onClose
}: MessageLogsModalProps) {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'outbound' | 'inbound'>('ALL');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.guestName.toLowerCase().includes(search.toLowerCase()) || 
      l.messageText.toLowerCase().includes(search.toLowerCase()) ||
      (l.roomNumber && l.roomNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesDir = directionFilter === 'ALL' || l.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Live WhatsApp Message Logs
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of outbound automated messages, guest inbound queries, and Myra AI auto-replies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by guest or text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-slate-200/80">
            {(['ALL', 'outbound', 'inbound'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                  directionFilter === dir 
                    ? 'bg-white text-teal-900 shadow-2xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dir === 'ALL' ? 'All Messages' : dir}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Stream */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Direction Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  log.direction === 'outbound'
                    ? log.aiHandled ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {log.aiHandled ? (
                    <Sparkles className="w-4 h-4" />
                  ) : log.direction === 'outbound' ? (
                    <Send className="w-4 h-4" />
                  ) : (
                    <CornerUpLeft className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      {log.guestName}
                    </span>
                    {log.roomNumber && (
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {log.roomNumber}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {log.guestPhone}
                    </span>
                    {log.aiHandled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        <Sparkles className="w-2.5 h-2.5" /> Myra AI Auto-Handled
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white rounded-xl p-2.5 border border-slate-200/80 mt-1">
                    {log.messageText}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>Workflow: <strong className="text-slate-600">{log.workflowName}</strong></span>
                    <span>•</span>
                    <span>Step: {log.nodeTitle}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Status */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-500">{log.timestamp}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                  log.status === 'read' ? 'bg-indigo-50 text-indigo-700' :
                  log.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                  log.status === 'replied' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
