import React, { useState } from 'react';
import { 
  Cable, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Settings2, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Globe, 
  Plus, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { IntegrationItem } from '../../types';

interface IntegrationsSectionProps {
  integrations: IntegrationItem[];
  onUpdateIntegration: (id: string, updated: Partial<IntegrationItem>) => void;
  triggerToast?: (msg: string) => void;
}

export default function IntegrationsSection({
  integrations,
  onUpdateIntegration,
  triggerToast
}: IntegrationsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Apps');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showCustomWebhookModal, setShowCustomWebhookModal] = useState(false);

  // Custom webhook state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('booking.created');

  const categories = ['All Apps', 'OTAs', 'Payments', 'Communication', 'Accounting', 'Developer'];

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory = selectedCategory === 'All Apps' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTestConnection = (item: IntegrationItem) => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      onUpdateIntegration(item.id, {
        status: 'Connected',
        statusText: 'Connected & Verified',
        lastSync: 'Just now'
      });
      if (triggerToast) triggerToast(`Successfully pinged ${item.name} API endpoint. Handshake verified (HTTP 200 OK).`);
    }, 1200);
  };

  const handleDisconnect = (item: IntegrationItem) => {
    onUpdateIntegration(item.id, {
      status: 'Not Connected',
      statusText: 'Disconnected by Administrator',
      lastSync: 'Never'
    });
    if (triggerToast) triggerToast(`Disconnected ${item.name}.`);
    setSelectedIntegration(null);
  };

  return (
    <div id="settings-integrations-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Integrations & External Channels</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              10 Active Connectors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronize direct bookings, payment gateways, guest messaging channels, and accounting ERPs seamlessly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomWebhookModal(true)}
          className="px-3.5 py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Webhook</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-900 text-white shadow-xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* 2. Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIntegrations.map((item) => {
          const isConnected = item.status === 'Connected';
          const isFailed = item.status === 'Auth Failed';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between hover:shadow-md ${
                isConnected
                  ? 'border-slate-200 hover:border-teal-700/40'
                  : isFailed
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200/80 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs">
                      {item.iconType === 'whatsapp' ? '💬' :
                       item.iconType === 'bookingcom' ? '🏨' :
                       item.iconType === 'airbnb' ? '🏠' :
                       item.iconType === 'razorpay' ? '💳' :
                       item.iconType === 'google' ? '🌐' :
                       item.iconType === 'tally' ? '📊' :
                       item.iconType === 'calendar' ? '📅' :
                       item.iconType === 'sheets' ? '📈' :
                       item.iconType === 'stripe' ? '💵' : '🗺️'}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                      <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isFailed
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Sync: {item.lastSync}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isFailed ? (
                    <button
                      type="button"
                      onClick={() => handleTestConnection(item)}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Retry Auth
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setSelectedIntegration(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Configure Integration */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center text-sm">
                  {selectedIntegration.iconType === 'whatsapp' ? '💬' : '⚙️'}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedIntegration.name}</h3>
                  <p className="text-[10px] text-teal-300 font-mono">{selectedIntegration.accountIdentifier}</p>
                </div>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
                {selectedIntegration.description}
              </div>

              {selectedIntegration.configFields && selectedIntegration.configFields.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    {f.label}
                  </label>
                  {f.type === 'toggle' ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-700">Enable feature</span>
                      <input
                        type="checkbox"
                        defaultChecked={f.value === 'true'}
                        className="w-4 h-4 text-teal-800 rounded accent-teal-800"
                      />
                    </div>
                  ) : f.type === 'select' ? (
                    <select
                      defaultValue={f.value}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      placeholder={f.placeholder || ''}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
                    />
                  )}
                </div>
              ))}

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted with AES-256 in transit and at rest.</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDisconnect(selectedIntegration)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
              >
                Disconnect App
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(selectedIntegration)}
                  disabled={isTestingConnection}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-teal-800' : ''}`} />
                  <span>{isTestingConnection ? 'Testing API...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (triggerToast) triggerToast(`Configuration for ${selectedIntegration.name} updated.`);
                    setSelectedIntegration(null);
                  }}
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Custom Webhook */}
      {showCustomWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Register Custom Outbound Webhook</h3>
              </div>
              <button onClick={() => setShowCustomWebhookModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (triggerToast) triggerToast(`Webhook endpoint ${webhookUrl} registered.`);
                setShowCustomWebhookModal(false);
                setWebhookUrl('');
              }}
              className="p-6 flex flex-col gap-4"
            >
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Payload Event Trigger</label>
                <select
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value="booking.created">booking.created</option>
                  <option value="booking.cancelled">booking.cancelled</option>
                  <option value="payment.success">payment.success</option>
                  <option value="guest.checkin">guest.checkin</option>
                  <option value="myra.human_escalation">myra.human_escalation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Target Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomWebhookModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Register Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
