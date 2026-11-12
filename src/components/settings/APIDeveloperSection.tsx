import React, { useState } from 'react';
import { 
  Code2, 
  KeyRound, 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { APIKeyItem, WebhookItem } from '../../types';

interface APIDeveloperSectionProps {
  apiKeys: APIKeyItem[];
  webhooks: WebhookItem[];
  onAddApiKey: (item: APIKeyItem) => void;
  onRevokeApiKey: (id: string) => void;
  triggerToast?: (msg: string) => void;
}

export default function APIDeveloperSection({
  apiKeys,
  webhooks,
  onAddApiKey,
  onRevokeApiKey,
  triggerToast
}: APIDeveloperSectionProps) {
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:bookings', 'write:bookings']);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const availableScopes = [
    'read:bookings',
    'write:bookings',
    'read:guests',
    'write:guests',
    'read:invoices',
    'write:invoices',
    'read:inventory',
    'write:inventory'
  ];

  const handleToggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const newKey: APIKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keyPrefix: `rd_live_${randomSuffix}...${Math.random().toString(36).substring(2, 6)}`,
      scopes: selectedScopes,
      createdDate: 'Today',
      lastUsed: 'Never',
      status: 'Active'
    };

    onAddApiKey(newKey);
    if (triggerToast) triggerToast(`API Key "${newKeyName}" generated successfully.`);
    setNewKeyName('');
    setShowGenerateKeyModal(false);
  };

  const handleCopyKey = (id: string) => {
    setCopiedKeyId(id);
    navigator.clipboard.writeText('rd_live_9482810482910482019482');
    if (triggerToast) triggerToast('API Token copied to clipboard.');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleTestWebhook = (wh: WebhookItem) => {
    if (triggerToast) triggerToast(`Test payload dispatched to ${wh.url} (HTTP 200 OK).`);
  };

  return (
    <div id="settings-api-developer-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">API Keys & Developer Webhooks</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              REST & Webhooks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage machine-to-machine authentication tokens, outbound event listeners, and API rate limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGenerateKeyModal(true)}
          className="px-3.5 py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* 2. Active API Keys */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Active API Tokens ({apiKeys.length})</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Rate limit: 120 req / min</span>
        </div>

        <div className="divide-y divide-slate-100">
          {apiKeys.map((k) => (
            <div key={k.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">{k.name}</span>
                  <span className="px-2 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                    {k.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                  <span>{k.keyPrefix}</span>
                  <span>•</span>
                  <span>Created {k.createdDate}</span>
                  <span>•</span>
                  <span>Last used: {k.lastUsed}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {k.scopes.map((sc) => (
                    <span key={sc} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyKey(k.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKeyId === k.id ? 'Copied' : 'Copy Key'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRevokeApiKey(k.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Revoke Token"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Outbound Webhooks List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">Outbound Event Webhooks</h3>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Delivery health 99.9%
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {webhooks.map((wh) => (
            <div key={wh.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
              <div className="flex flex-col gap-1">
                <div className="font-mono text-xs font-bold text-slate-900">{wh.url}</div>
                <div className="text-[11px] text-slate-400">
                  Secret: <span className="font-mono">{wh.secretMasked}</span> • Last delivery: {wh.lastDelivery}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-[9px] font-mono font-bold">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTestWebhook(wh)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Ping</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Generate API Key */}
      {showGenerateKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Generate Production API Key</h3>
              </div>
              <button onClick={() => setShowGenerateKeyModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateKey} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Channel Engine Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Assigned Token Scopes</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => handleToggleScope(scope)}
                      className={`p-2 rounded-xl text-left text-[11px] font-mono transition-all border cursor-pointer ${
                        selectedScopes.includes(scope)
                          ? 'border-teal-800 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateKeyModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Create Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
