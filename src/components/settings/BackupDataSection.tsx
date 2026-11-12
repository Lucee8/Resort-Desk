import React, { useState } from 'react';
import { 
  HardDrive, 
  CloudDownload, 
  RotateCcw, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  AlertTriangle,
  Play
} from 'lucide-react';
import { BackupHistoryItem } from '../../types';

interface BackupDataSectionProps {
  backupHistory: BackupHistoryItem[];
  onTakeBackup: () => void;
  triggerToast?: (msg: string) => void;
}

export default function BackupDataSection({
  backupHistory,
  onTakeBackup,
  triggerToast
}: BackupDataSectionProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState<BackupHistoryItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleStartBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      onTakeBackup();
      if (triggerToast) triggerToast('On-demand database snapshot generated and stored in encrypted S3 bucket.');
    }, 2000);
  };

  const handleConfirmRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      setSelectedRestoreBackup(null);
      if (triggerToast) triggerToast('Database state restored successfully to chosen snapshot point.');
    }, 2500);
  };

  const handleFullExport = (format: 'JSON' | 'CSV') => {
    if (triggerToast) triggerToast(`Full property database archive exported in .${format.toLowerCase()} format.`);
  };

  return (
    <div id="settings-backup-data-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Backup, Data Export & Disaster Recovery</h2>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase">
              RPO: 1 hr • RTO: 5 mins
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated daily cloud snapshots, point-in-time rollbacks, and complete exportable property archives.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartBackup}
          disabled={isBackingUp}
          className="px-4 py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          {isBackingUp ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 text-teal-300 fill-teal-300" />
          )}
          <span>{isBackingUp ? 'Creating Snapshot...' : 'Take Snapshot Now'}</span>
        </button>
      </div>

      {/* 2. Automated Backup Status Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-teal-50 text-teal-800 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Daily Cloud Backups</h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              Backups run automatically every night at <strong>02:00 AM IST</strong> with 30-day retention and multi-region AWS S3 redundancy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleFullExport('JSON')}
            className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => handleFullExport('CSV')}
            className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Snapshot History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Cloud Snapshot Archives ({backupHistory.length})</h3>
          </div>
          <span className="text-[11px] text-slate-400">All backups verified with SHA-256 integrity checks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">SNAPSHOT TIMESTAMP</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">STORAGE REGION</th>
                <th className="py-3 px-4">INTEGRITY</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupHistory.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{bk.timestamp}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{bk.type}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{bk.size}</td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500">{bk.storageLocation}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRestoreBackup(bk)}
                        className="px-2.5 py-1 text-slate-600 hover:text-teal-900 font-semibold text-xs rounded hover:bg-slate-100 cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Restore Backup Confirmation */}
      {selectedRestoreBackup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-2">Confirm Point-in-Time Restore</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Restoring database to <strong>{selectedRestoreBackup.timestamp}</strong> will roll back any modifications made after this snapshot. Current sessions will be refreshed.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRestoreBackup(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isRestoring ? 'Restoring Snapshot...' : 'Yes, Restore Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
