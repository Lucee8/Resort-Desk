import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  ShieldCheck, 
  User, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { AuditLogRecord } from '../../types';

interface AuditLogsSectionProps {
  logs: AuditLogRecord[];
  triggerToast?: (msg: string) => void;
}

export default function AuditLogsSection({ logs, triggerToast }: AuditLogsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogRecord | null>(null);

  const modules = ['All', 'Myra AI Engine', 'Reservations', 'Billing & GST', 'Security & 2FA', 'Audit & Compliance'];
  const actions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'AUTH', 'EXPORT'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchQuery === '' || 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    const matchesModule = selectedModule === 'All' || log.module === selectedModule;
    const matchesAction = selectedAction === 'All' || log.action === selectedAction;
    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportCSV = () => {
    if (triggerToast) triggerToast(`Exported ${filteredLogs.length} audit trail records as CSV.`);
  };

  return (
    <div id="settings-audit-logs-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Audit Logs & Security Trail</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped audit records tracking configuration changes, user logins, data exports, and AI prompt modifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:border-teal-700 hover:text-teal-900 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, action or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white font-medium"
          >
            {modules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white font-medium"
          >
            {actions.map(a => <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>)}
          </select>
        </div>
      </div>

      {/* 3. Audit Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">USER & ROLE</th>
                <th className="py-3 px-3 text-center">ACTION</th>
                <th className="py-3 px-4">MODULE</th>
                <th className="py-3 px-6">SUMMARY & DIFF</th>
                <th className="py-3 px-4">IP & TIME</th>
                <th className="py-3 px-4 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* User */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2.5">
                      {log.avatar ? (
                        <img src={log.avatar} alt={log.user} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{log.user}</div>
                        <div className="text-[10px] text-slate-400">{log.userRole}</div>
                      </div>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      log.action === 'CREATE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.action === 'UPDATE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.action === 'AUTH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Module */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {log.module}
                  </td>

                  {/* Summary & Old/New Diff */}
                  <td className="py-3.5 px-6 max-w-sm">
                    <div className="text-slate-800 font-medium leading-snug">{log.summary}</div>
                    {log.oldValue && log.newValue && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        <span className="bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded line-through">{log.oldValue}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">{log.newValue}</span>
                      </div>
                    )}
                  </td>

                  {/* IP & Timestamp */}
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="font-mono text-[11px] text-slate-600">{log.ipAddress}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>

                  {/* Details button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLogForDiff(log)}
                      className="p-1 text-slate-400 hover:text-teal-900 rounded cursor-pointer"
                      title="Inspect record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Diff Viewer */}
      {selectedLogForDiff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Audit Record #{selectedLogForDiff.id}</h3>
              <button onClick={() => setSelectedLogForDiff(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Actor:</span>
                <p className="text-slate-900 font-semibold">{selectedLogForDiff.user} ({selectedLogForDiff.userRole})</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Module:</span>
                <p className="text-slate-900">{selectedLogForDiff.module}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Action Detail:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">{selectedLogForDiff.summary}</p>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-100">
                <span>IP: {selectedLogForDiff.ipAddress}</span>
                <span>{selectedLogForDiff.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
