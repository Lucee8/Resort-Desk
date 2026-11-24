import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import loginBackdrop from '../../assets/images/mykonos_tarkarli_login_1795524745967.jpg';

export default function LoginPage() {
  const { signIn, resetPassword, firebaseConfigured, configError } = useAuth();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(true);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!firebaseConfigured) {
      setErrorMsg(
        configError ||
          'Firebase client configuration is missing from this build environment.'
      );
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid staff email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await signIn(email.trim(), password, rememberMe);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateEmail(email)) {
      setErrorMsg('Enter your registered staff email address to receive a reset link.');
      return;
    }

    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSuccessMsg(
        `Password reset instructions sent to ${email.trim()}. Check your inbox and spam folder.`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not send password reset email. Verify your email address.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id="login-page-root"
      className="min-h-screen w-full bg-[#F7F6F3] flex flex-col lg:flex-row font-sans text-[#17221F]"
    >
      {/* Left Hospitality Showcase Panel (Desktop only) */}
      <div className="hidden lg:flex relative lg:w-[54%] lg:min-h-screen bg-[#004B38] overflow-hidden flex-col justify-between p-14 text-white">
        {imageLoaded && (
          <img
            src={loginBackdrop}
            alt="Mykonos Cottage coastal veranda in Tarkarli, Malvan"
            onError={() => setImageLoaded(false)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(155deg, rgba(0, 56, 42, 0.88) 0%, rgba(0, 75, 56, 0.68) 48%, rgba(16, 42, 34, 0.90) 100%)',
          }}
        />

        {/* Brand Top Lockup */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center font-serif font-bold text-xl text-white shadow-lg">
              M
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7F2DC]">
                ResortDesk AI
              </p>
              <h1 className="font-serif text-xl font-bold tracking-wide text-white leading-tight">
                Mykonos Cottage
              </h1>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-[#E6FAF2]">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            Tarkarli, Malvan
          </span>
        </div>

        {/* Coastal Property Messaging */}
        <div className="relative z-10 max-w-xl my-auto">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B7F2DC] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Hospitality Operations Portal
          </p>
          <h2 className="font-serif text-[42px] font-bold leading-[1.15] tracking-tight text-white">
            Seamless coastal hospitality, from check-in to sunset.
          </h2>
          <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-md">
            Authorized staff workspace for Mykonos Cottage, Tarkarli. Manage reservations,
            housekeeping turnovers, cottage maintenance, GST billing, and guest care in real time.
          </p>
        </div>

        {/* Footer Property Details */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/15 text-xs text-white/75">
          <span>Mykonos Cottage · Tarkarli Beach Road, Malvan, Maharashtra</span>
          <span className="font-semibold text-[#B7F2DC]">Staff Access Only</span>
        </div>
      </div>

      {/* Right Authentication Card Column */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-10 lg:p-14">
        {/* Compact Brand Lockup (Mobile / Tablet only) */}
        <div className="flex lg:hidden items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#004B38] flex items-center justify-center font-serif font-bold text-lg text-white shadow-sm">
            M
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#004B38]">
              ResortDesk AI
            </p>
            <p className="font-serif text-base font-bold text-slate-900 leading-tight">
              Mykonos Cottage · Tarkarli
            </p>
          </div>
        </div>

        <div className="w-full max-w-[430px] bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-9">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#004B38]">
                {mode === 'login' ? 'Staff Sign In' : 'Password Recovery'}
              </p>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {mode === 'login' ? 'Welcome back' : 'Reset your password'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#004B38]/10 text-[#004B38] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            {mode === 'login'
              ? 'Sign in with your assigned Mykonos Cottage staff credentials to access your department console.'
              : 'Enter your official staff email address and Firebase will send a password reset link.'}
          </p>

          {errorMsg && (
            <div
              id="login-error-alert"
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              id="login-success-alert"
              className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mykonoscottagetarkarli.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004B38] focus:ring-2 focus:ring-[#004B38]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password-input"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    id="login-forgot-btn"
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-[#004B38] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004B38] focus:ring-2 focus:ring-[#004B38]/15 transition-all"
                  />
                  <button
                    id="login-toggle-password"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-600 select-none cursor-pointer pt-0.5">
                <input
                  id="login-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#004B38] focus:ring-[#004B38]"
                />
                <span>Keep me signed in on this terminal</span>
              </label>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={busy}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-65 text-white text-sm font-bold shadow-md shadow-[#004B38]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to ResortDesk</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="reset-email-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-email-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mykonoscottagetarkarli.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004B38] focus:ring-2 focus:ring-[#004B38]/15 transition-all"
                  />
                </div>
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl bg-[#004B38] hover:bg-[#003D2E] disabled:opacity-65 text-white text-sm font-bold shadow-md shadow-[#004B38]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Password Reset Email</span>
                )}
              </button>

              <button
                id="reset-back-btn"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Staff accounts are provisioned internally by the Resort Administrator.
              <br />
              Need access? Contact Mykonos Cottage Management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
