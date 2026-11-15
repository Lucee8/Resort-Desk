import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

interface RootErrorBoundaryState {
  error: Error | null;
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  RootErrorBoundaryState
> {
  declare readonly props: { children: React.ReactNode };
  state: RootErrorBoundaryState;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ResortDesk Unhandled App Error]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                !
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  ResortDesk AI Encountered a Runtime Error
                </h1>
                <p className="text-xs text-slate-500">
                  Mykonos Cottage, Tarkarli (`resortdesk-mykonos`)
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 break-words">
              {this.state.error.message}
            </div>
            <p className="text-xs text-slate-600">
              If this occurred after deploying a new build, verify that all{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_FIREBASE_*</code>{' '}
              environment variables are configured in your hosting build settings and rebuild.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#004B38] text-white text-xs font-bold cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RootErrorBoundary>
  </StrictMode>
);
