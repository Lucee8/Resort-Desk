import React, { useState } from 'react';
import {
  X,
  Search,
  Send,
  CornerUpLeft,
  Sparkles,
  Clock,
  RefreshCw,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { EmailLogItem, WhatsAppMessageLog } from '../../types';

interface MessageLogsModalProps {
  logs: WhatsAppMessageLog[];
  emailLogs?: EmailLogItem[];
  isOpen: boolean;
  onClose: () => void;
  onRetryWhatsApp?: () => Promise<void>;
  onRetryEmails?: () => Promise<void>;
}

export default function MessageLogsModal({
  logs,
  emailLogs = [],
  isOpen,
  onClose,
  onRetryWhatsApp,
  onRetryEmails,
}: MessageLogsModalProps) {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'outbound' | 'inbound'>('ALL');
  const [retrying, setRetrying] = useState(false);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.guestName.toLowerCase().includes(search.toLowerCase()) ||
      l.messageText.toLowerCase().includes(search.toLowerCase()) ||
      (l.roomNumber && l.roomNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesDir = directionFilter === 'ALL' || l.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  const filteredEmails = emailLogs.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.guestName.toLowerCase().includes(q) ||
      e.guestEmail.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const failedWaCount = logs.filter((l) => l.status === 'failed').length;
  const failedEmailCount = emailLogs.filter((e) => e.status === 'failed').length;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      if (channel === 'whatsapp' && onRetryWhatsApp) {
        await onRetryWhatsApp();
      } else if (channel === 'email' && onRetryEmails) {
        await onRetryEmails();
      }
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shrink-0">
              {channel === 'whatsapp' ? <Clock className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 font-sans truncate">
                {channel === 'whatsapp'
                  ? 'Live WhatsApp Delivery & Webhook Logs'
                  : 'Transactional Email Delivery Logs'}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {channel === 'whatsapp'
                  ? 'Cloud API template dispatches, Meta webhook status callbacks & guest replies'
                  : 'Booking vouchers, GST invoices, payment receipts & automated retries'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {((channel === 'whatsapp' && failedWaCount > 0 && onRetryWhatsApp) ||
              (channel === 'email' && failedEmailCount > 0 && onRetryEmails)) && (
              <button
                type="button"
                disabled={retrying}
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                <span>Retry Failed</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel & Filters */}
        <div className="px-6 py-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold border border-slate-200/80">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  channel === 'whatsapp' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                WhatsApp ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  channel === 'email' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Email ({emailLogs.length})
              </button>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, text, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>
          </div>

          {channel === 'whatsapp' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-slate-200/80">
              {(['ALL', 'outbound', 'inbound'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setDirectionFilter(dir)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                    directionFilter === dir
                      ? 'bg-white text-teal-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dir === 'ALL' ? 'All' : dir}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logs Stream */}
        <div className="p-6 overflow-y-auto flex flex-col gap-3">
          {channel === 'whatsapp' ? (
            filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No WhatsApp message logs match your filter.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        log.direction === 'outbound'
                          ? log.aiHandled
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
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
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {log.roomNumber}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {log.guestPhone}
                        </span>
                        {log.wamid && (
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {log.wamid}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white rounded-xl p-2.5 border border-slate-200/80 mt-1">
                        {log.messageText}
                      </p>

                      {log.errorReason && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{log.errorReason}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                        <span>
                          Workflow: <strong className="text-slate-600">{log.workflowName}</strong>
                        </span>
                        <span>•</span>
                        <span>Step: {log.nodeTitle}</span>
                        {typeof log.retryCount === 'number' && log.retryCount > 0 && (
                          <>
                            <span>•</span>
                            <span>Retries: {log.retryCount}/3</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-right">
                    <span className="text-xs font-semibold text-slate-500">{log.timestamp}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${
                        log.status === 'read'
                          ? 'bg-indigo-50 text-indigo-700'
                          : log.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'failed'
                              ? 'bg-rose-50 text-rose-700'
                              : log.status === 'replied'
                                ? 'bg-teal-50 text-teal-800'
                                : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No email delivery logs recorded yet.
            </div>
          ) : (
            filteredEmails.map((em) => (
              <div
                key={em.id}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{em.guestName}</span>
                    <span className="text-[11px] font-mono text-slate-500">{em.guestEmail}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      {em.templateType}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{em.subject}</p>
                  {em.errorReason && (
                    <p className="text-[11px] text-rose-700 mt-1">{em.errorReason}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Provider: {em.provider} {em.messageId ? `• ID: ${em.messageId}` : ''}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                  <span className="text-[11px] text-slate-500">
                    {em.createdAtISO ? new Date(em.createdAtISO).toLocaleString('en-IN') : ''}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                      em.status === 'sent'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {em.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/70">
          <button
            type="button"
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
