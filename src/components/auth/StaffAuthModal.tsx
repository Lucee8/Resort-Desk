import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StaffAuthModal() {
  const {
    user,
    firestoreStatus,
    firestoreMessage,
    signIn,
    signUp,
    signOut,
    resetPassword,
    recheckFirestore,
    isAuthModalOpen,
    closeAuthModal,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your staff email address.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        closeAuthModal();
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setBusy(false);
          return;
        }
        await signUp(email.trim(), password, displayName.trim() || undefined);
        closeAuthModal();
      } else {
        await resetPassword(email.trim());
        setInfoMsg('Password reset instructions sent via Firebase Auth.');
        setMode('signin');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
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
              <h3 className="text-sm font-bold leading-tight">
                {user ? 'Staff Firebase Session' : 'Mykonos Cottage Staff Sign-In'}
              </h3>
              <p className="text-[11px] text-[#B7F2DC]">
                Firebase Auth · resortdesk-mykonos
              </p>
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
              firestoreStatus === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="min-w-0">
              <p className="font-bold">
                Firestore Status:{' '}
                {firestoreStatus === 'connected'
                  ? 'Connected'
                  : firestoreStatus === 'permission-denied'
                    ? 'Permission Denied (Rules / Auth Required)'
                    : firestoreStatus === 'checking'
                      ? 'Checking...'
                      : 'Disconnected'}
              </p>
              {firestoreMessage && firestoreStatus !== 'connected' && (
                <p className="text-[11px] opacity-85 mt-0.5 break-words">{firestoreMessage}</p>
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

          {user ? (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Signed-in Firebase User
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {user.displayName || 'Resort Staff Member'}
                </p>
                <p className="text-xs text-slate-600">{user.email}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">UID: {user.uid}</p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await signOut();
                    closeAuthModal();
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
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Mode switcher */}
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    mode === 'signin' ? 'bg-white text-[#004B38] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    mode === 'signup' ? 'bg-white text-[#004B38] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Register Staff
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

              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Arun Kulkarni"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@mykonoscottage.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#004B38]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px]">
                {mode === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[#004B38] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-slate-500 font-semibold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
              >
                {busy
                  ? 'Please wait...'
                  : mode === 'signin'
                    ? 'Sign In to Mykonos Desk'
                    : mode === 'signup'
                      ? 'Create Staff Account'
                      : 'Send Reset Email'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
