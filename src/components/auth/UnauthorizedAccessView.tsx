import React from 'react';
import { ShieldAlert, LogOut, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UnauthorizedAccessViewProps {
  title?: string;
  message?: string;
  variant?: 'disabled' | 'unauthorized' | 'restricted';
  onReturnToDashboard?: () => void;
}

export default function UnauthorizedAccessView({
  title,
  message,
  variant = 'restricted',
  onReturnToDashboard,
}: UnauthorizedAccessViewProps) {
  const { user, role, signOut, authMessage } = useAuth();

  const heading =
    title ||
    (variant === 'disabled'
      ? 'Staff Account Deactivated'
      : variant === 'unauthorized'
        ? 'Staff Access Not Provisioned'
        : 'Access Restricted for Your Role');

  const body =
    message ||
    authMessage ||
    (variant === 'disabled'
      ? 'This staff account is currently inactive. Please contact the Resort Administrator to restore access.'
      : variant === 'unauthorized'
        ? 'Your Firebase user account does not have an active Mykonos Cottage staff role assigned yet.'
        : `Your current role (${role || 'Staff'}) does not include permission to view this module.`);

  return (
    <div
      id="unauthorized-access-view"
      className="min-h-[65vh] w-full flex items-center justify-center p-6 font-sans"
    >
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-7 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
          {variant === 'restricted' ? (
            <Lock className="w-6 h-6" />
          ) : (
            <ShieldAlert className="w-6 h-6" />
          )}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
          Mykonos Cottage · Access Control
        </p>
        <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">{heading}</h2>
        <p className="text-xs text-slate-600 leading-relaxed mt-3">{body}</p>

        {user?.email && (
          <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            Signed in as <span className="font-bold text-slate-800">{user.email}</span>
            {role && (
              <span>
                {' '}
                · Role: <span className="font-bold text-[#004B38]">{role}</span>
              </span>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {variant === 'restricted' && onReturnToDashboard && (
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#004B38] hover:bg-[#003D2E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to My Dashboard</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
