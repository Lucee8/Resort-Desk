import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Key, 
  Sparkles, 
  Check, 
  ExternalLink,
  AlertCircle,
  Sliders,
  Radio
} from 'lucide-react';
import { GoogleReviewsIntegrationConfig } from '../../types';

interface GoogleIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleReviewsIntegrationConfig;
  onSaveConfig: (updated: GoogleReviewsIntegrationConfig) => void;
  onForceSync: () => void;
  triggerToast: (msg: string) => void;
}

export default function GoogleIntegrationModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onForceSync,
  triggerToast
}: GoogleIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'oauth' | 'sync' | 'autoreply'>('oauth');
  const [formData, setFormData] = useState<GoogleReviewsIntegrationConfig>(config);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleSimulateOAuthConnect = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const updated: GoogleReviewsIntegrationConfig = {
        ...formData,
        isConnected: true,
        lastSyncedAt: 'Just now (Synced 642 reviews)',
        totalGoogleReviews: 642,
        averageGoogleRating: 4.9
      };
      setFormData(updated);
      onSaveConfig(updated);
      triggerToast("Successfully authorized Google Business Profile OAuth connection!");
    }, 1200);
  };

  const handleDisconnect = () => {
    if (confirm("Disconnect Google Business Profile integration? Real-time review sync will pause.")) {
      const updated: GoogleReviewsIntegrationConfig = {
        ...formData,
        isConnected: false,
        lastSyncedAt: 'Disconnected'
      };
      setFormData(updated);
      onSaveConfig(updated);
      triggerToast("Google Business Profile integration disconnected.");
    }
  };

  const handleSave = () => {
    onSaveConfig(formData);
    triggerToast("Google Reviews integration settings updated.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="google-integration-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Google Business Profile Integration</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  formData.isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}>
                  {formData.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                OAuth 2.0 Live Review Sync & Management Reply Publishing
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'oauth' 
                ? 'border-teal-800 text-teal-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            OAuth Credentials & Account
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sync' 
                ? 'border-teal-800 text-teal-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sync & Webhook Rules
          </button>
          <button
            onClick={() => setActiveTab('autoreply')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'autoreply' 
                ? 'border-teal-800 text-teal-900 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Myra AI Auto-Reply Engine
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="bg-teal-50/60 border border-teal-200/70 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900 space-y-1">
                  <p className="font-bold">Official Google Business Profile API (v1)</p>
                  <p className="text-teal-800/90 leading-relaxed">
                    ResortDesk AI authenticates with Google using OAuth 2.0 to stream verified guest reviews directly into your operations console and publish executive responses on behalf of resort management.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Connected Account</label>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{formData.connectedAccount}</p>
                  </div>
                  {formData.isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleSimulateOAuthConnect}
                      disabled={isAuthenticating}
                      className="px-4 py-1.5 bg-teal-800 text-white hover:bg-teal-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Connect Google Account</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Business Listing</span>
                    <p className="text-xs font-medium text-slate-800 mt-0.5">{formData.businessName}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Place ID</span>
                    <code className="text-xs font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 mt-0.5 inline-block">
                      {formData.placeId}
                    </code>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Verified Location Address</span>
                  <p className="text-xs text-slate-600 mt-0.5">{formData.verifiedLocationAddress}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Granted OAuth 2.0 Scopes</label>
                <div className="space-y-1.5">
                  {formData.oauthScopes.map((scope, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono text-slate-700">
                      <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>{scope}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Google Policy Notice:</strong> Customer reviews on Google Maps are user-generated and cannot be altered or deleted by business owners. ResortDesk AI allows authorized general managers to publish, update, and manage official business replies in compliance with Google My Business policies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Automated Real-time Sync</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automatically poll and ingest new Google reviews in background.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.autoSyncEnabled} 
                    onChange={(e) => setFormData({ ...formData, autoSyncEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-800"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Sync Frequency</label>
                <select
                  value={formData.syncFrequencyMinutes}
                  onChange={(e) => setFormData({ ...formData, syncFrequencyMinutes: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value={15}>Every 15 minutes (High traffic)</option>
                  <option value={30}>Every 30 minutes (Recommended)</option>
                  <option value={60}>Every 1 hour</option>
                  <option value={360}>Every 6 hours</option>
                  <option value={1440}>Once daily</option>
                </select>
              </div>

              <div className="p-4 bg-teal-50/50 border border-teal-200/60 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-950 block">Last Successful Sync</span>
                  <span className="text-xs text-teal-800">{formData.lastSyncedAt}</span>
                </div>
                <button
                  onClick={() => {
                    onForceSync();
                    setFormData(prev => ({ ...prev, lastSyncedAt: 'Just now' }));
                  }}
                  className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'autoreply' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">Smart Auto-Reply for 5-Star Reviews</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Utilize Myra AI to automatically draft and publish graceful, personalized responses to 5-star Google ratings.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.autoReplyEnabled} 
                    onChange={(e) => setFormData({ ...formData, autoReplyEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-800"></div>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Minimum Star Rating to Auto-Reply</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoReplyMinRating: 5 })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.autoReplyMinRating === 5 
                        ? 'border-teal-800 bg-teal-50/70 text-teal-950 font-bold shadow-xs' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">5 Stars Only (Recommended)</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Negative and neutral reviews will always require manual GM approval.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoReplyMinRating: 4 })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.autoReplyMinRating === 4 
                        ? 'border-teal-800 bg-teal-50/70 text-teal-950 font-bold shadow-xs' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">4 & 5 Stars</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automates replies for all positive guest feedback.</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Default AI Tone</label>
                <select
                  value={formData.autoReplyTone}
                  onChange={(e) => setFormData({ ...formData, autoReplyTone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="Warm & Hospitable">Warm & Hospitable (Signature Luxury Resort)</option>
                  <option value="Luxury Concierge">Luxury Concierge & Sophisticated</option>
                  <option value="Executive & Crisp">Executive & Crisp</option>
                  <option value="Empathetic Problem Solver">Empathetic Problem Solver</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
