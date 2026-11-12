import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  KeyRound, 
  HardDrive, 
  Trash2, 
  Download, 
  AlertTriangle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { SecurityPrivacySettings } from '../../types';

interface SecurityPrivacySectionProps {
  settings: SecurityPrivacySettings;
  onChange: (updated: Partial<SecurityPrivacySettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function SecurityPrivacySection({
  settings,
  onChange,
  triggerToast
}: SecurityPrivacySectionProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      if (triggerToast) triggerToast('GDPR/DPDP Data export archive generated and downloaded (ZIP, 14.8 MB).');
    }, 1500);
  };

  return (
    <div id="settings-security-privacy-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Security, Authentication & Data Privacy</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              DPDP Act & ISO 27001 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Password complexity policies, session idle timeout, IP restriction firewalls, and guest identity retention schedules.
          </p>
        </div>
      </div>

      {/* 2. Password & Authentication Policy */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Lock className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Staff Password & Credential Policy</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Minimum Password Length
            </label>
            <input
              type="number"
              min={8}
              max={32}
              value={settings.minPasswordLength}
              onChange={(e) => onChange({ minPasswordLength: parseInt(e.target.value) || 10 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              min={30}
              max={365}
              value={settings.passwordExpiryDays}
              onChange={(e) => onChange({ passwordExpiryDays: parseInt(e.target.value) || 90 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Idle Session Timeout (Mins)
            </label>
            <input
              type="number"
              min={15}
              max={480}
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => onChange({ sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div className="sm:col-span-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-teal-800" />
              <div>
                <div className="text-xs font-bold text-slate-800">Require Special Character & Mixed Case</div>
                <div className="text-[11px] text-slate-500">Forces upper/lower case letters and numbers in staff passwords</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireSpecialChar}
              onChange={(e) => onChange({ requireSpecialChar: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>
      </div>

      {/* 3. IP Restriction Firewall */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-800" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">IP Address Allowlist (Property Firewall)</h3>
              <p className="text-[11px] text-slate-400">Restrict access to ResortDesk admin portal to verified property IP subnets.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.ipAllowlistEnabled}
            onChange={(e) => onChange({ ipAllowlistEnabled: e.target.checked })}
            className="w-4 h-4 text-teal-800 rounded accent-teal-800"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Allowed IP CIDR Ranges (Comma-separated)
          </label>
          <input
            type="text"
            disabled={!settings.ipAllowlistEnabled}
            value={settings.allowedIPs}
            onChange={(e) => onChange({ allowedIPs: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 disabled:bg-slate-100"
            placeholder="e.g. 49.36.128.0/24, 103.87.52.0/24"
          />
        </div>
      </div>

      {/* 4. Guest Data Privacy & DPDP Retention */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <EyeOff className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Guest Data Retention & Anonymization (DPDP Compliance)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Guest PII & ID Proof Retention (Years)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.guestPiiRetentionYears}
              onChange={(e) => onChange({ guestPiiRetentionYears: parseInt(e.target.value) || 3 })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">Indian statutory mandate: minimum 3 years for foreigner C-Forms and police registers.</p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="text-xs font-bold text-slate-800">Auto-Anonymize Past Guests</div>
              <div className="text-[11px] text-slate-500">Mask phone numbers and credit card tokens post-retention expiry</div>
            </div>
            <input
              type="checkbox"
              checked={settings.anonymizeCheckedOutGuests}
              onChange={(e) => onChange({ anonymizeCheckedOutGuests: e.target.checked })}
              className="w-4 h-4 text-teal-800 rounded accent-teal-800"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Need a full data dump or right-to-be-forgotten report?
          </div>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-teal-700 hover:text-teal-900 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Privacy Archive</span>
          </button>
        </div>
      </div>

      {/* MODAL: Privacy Export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Export Data Archive</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This creates an encrypted archive of guest folios, consent receipts, and booking logs for legal or DPDP compliance inspection.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isExporting ? 'Generating ZIP...' : 'Download Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
