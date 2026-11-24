import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

export default function StaffAuthModal() {
  const {
    user,
    staffProfile,
    role,
    firebaseConfigured,
    configError,
    firestoreStatus,
    firestoreMessage,
    signOut,
    resetPassword,
    recheckFirestore,
    isAuthModalOpen,
    closeAuthModal,
  } = useAuth();
  const { navigate } = useRouter();

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendPasswordReset = async () => {
    const email = staffProfile?.email || user?.email;
    if (!email) return;
    setBusy(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await resetPassword(email);
      setInfoMsg(`Password reset email sent to ${email}.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send reset email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#004B38] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#B7F2DC]" />
            <div>
              <h3 className="text-sm font-bold leading-tight">Staff Profile &amp; Session</h3>
              <p className="text-[11px] text-[#B7F2DC]">Mykonos Cottage · Tarkarli</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Firestore connection summary */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
              !firebaseConfigured
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : firestoreStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="min-w-0">
              <p className="font-bold">
                {!firebaseConfigured
                  ? 'Firebase Environment Configuration Missing'
                  : `Cloud Sync: ${
                      firestoreStatus === 'connected'
                        ? 'Connected'
                        : firestoreStatus === 'checking'
                          ? 'Checking...'
                          : 'Restricted'
                    }`}
              </p>
              {(configError || (firestoreMessage && firestoreStatus !== 'connected')) && (
                <p className="text-[11px] opacity-85 mt-0.5 break-words">
                  {configError || firestoreMessage}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void recheckFirestore()}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
              title="Re-test Firestore connection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {user && (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Staff Member
                  </p>
                  {role && (
                    <span className="px-2 py-0.5 rounded-md bg-[#004B38] text-white text-[10px] font-bold">
                      {role}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {staffProfile?.fullName || user.displayName || 'Resort Staff Member'}
                </p>
                <p className="text-xs text-slate-600">{staffProfile?.email || user.email}</p>
                {staffProfile?.department && (
                  <p className="text-[11px] text-slate-500">
                    Department: <span className="font-semibold">{staffProfile.department}</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSendPasswordReset()}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#004B38]" />
                <span>Send Password Reset Email</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await signOut();
                    closeAuthModal();
                    navigate('/login', { replace: true });
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
