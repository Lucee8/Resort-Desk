import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
} from 'lucide-react';
import { firebaseConfigDiagnostics, firebaseInitError } from '../../firebase/config';

interface FirebaseConfigErrorScreenProps {
  onOpenDiagnostics?: () => void;
}

export default function FirebaseConfigErrorScreen({
  onOpenDiagnostics,
}: FirebaseConfigErrorScreenProps) {
  const checks = firebaseConfigDiagnostics.envVarChecks;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Top Property & Error Header */}
        <div className="bg-[#004B38] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#B7F2DC]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B7F2DC]">
                Mykonos Cottage, Tarkarli · ResortDesk AI
              </p>
              <h1 className="text-lg font-bold leading-snug">
                Firebase Environment Configuration Missing
              </h1>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-mono bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg text-[#B7F2DC]">
            resortdesk-mykonos
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Primary Diagnostic Alert */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 space-y-1">
              <p className="font-bold">
                Unable to initialize Firebase Web SDK in this production bundle.
              </p>
              <p className="text-rose-800 leading-relaxed">
                {firebaseInitError ||
                  'One or more required VITE_FIREBASE_* environment variables were missing when Vite built this application.'}
              </p>
            </div>
          </div>

          {/* Environment Variable Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#004B38]" />
                <span>Build-Time Environment Variables Status</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Values never exposed in UI
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
              {checks.map((item) => {
                const badgeClass =
                  item.status === 'configured'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.status === 'defaulted'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : !item.required
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200';

                const badgeLabel =
                  item.status === 'configured'
                    ? 'Configured'
                    : item.status === 'defaulted'
                      ? 'Defaulted'
                      : item.status === 'invalid'
                        ? 'Invalid'
                        : item.required
                          ? 'Missing'
                          : 'Optional';

                return (
                  <div
                    key={item.key}
                    className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white text-xs"
                  >
                    <div className="min-w-0">
                      <code className="font-mono font-bold text-slate-900">
                        {item.key}
                      </code>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.note}
                      </p>
                    </div>
                    <span
                      className={`self-start sm:self-auto px-2.5 py-0.5 rounded-lg border text-[11px] font-bold shrink-0 ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup Guidance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ServerCrash className="w-4 h-4 text-[#004B38]" />
              <span>How to Resolve for Production Deployment</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li>
                Open <strong>Firebase Console → Project Settings → General → Your apps</strong> for{' '}
                <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                  resortdesk-mykonos
                </code>{' '}
                and copy all <code className="bg-white px-1 py-0.5 rounded border border-slate-200">VITE_FIREBASE_*</code> values.
              </li>
              <li>
                Add those variables to your Hostinger build environment (or{' '}
                <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                  .env.production
                </code>{' '}
                if building locally for <code className="bg-white px-1 py-0.5 rounded border border-slate-200">public_html</code>).
              </li>
              <li>
                Run <code className="bg-white px-1 py-0.5 rounded border border-slate-200">npm run build</code>{' '}
                again (Vite embeds <code className="bg-white px-1 py-0.5 rounded border border-slate-200">VITE_*</code> variables at build time) and redeploy <code className="bg-white px-1 py-0.5 rounded border border-slate-200">dist/</code>.
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#004B38]" />
              <span>Real Firebase mode preserved (no mock fallback loaded)</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenDiagnostics && (
                <button
                  type="button"
                  onClick={onOpenDiagnostics}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Open Auth Modal
                </button>
              )}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
