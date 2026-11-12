import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  Plus,
  ShieldCheck,
  FileCode2
} from 'lucide-react';
import { WhatsAppSettingsConfig, WhatsAppTemplate } from '../../types';

interface WhatsAppSectionProps {
  config: WhatsAppSettingsConfig;
  onChange: (updated: Partial<WhatsAppSettingsConfig>) => void;
  triggerToast?: (msg: string) => void;
}

export default function WhatsAppSection({
  config,
  onChange,
  triggerToast
}: WhatsAppSectionProps) {
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 98765 00000');
  const [selectedTemplateId, setSelectedTemplateId] = useState(config.templates[0]?.id || '');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhoneNumber) return;
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      if (triggerToast) triggerToast(`Test WhatsApp template dispatched to ${testPhoneNumber} via Meta Cloud API.`);
    }, 1000);
  };

  return (
    <div id="settings-whatsapp-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Section Header & WABA Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">WhatsApp Automation & Cloud API</h2>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WABA Official Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta Cloud API endpoint configuration, approved HSM templates, human handoff triggers, and automated concierge routing.
          </p>
        </div>
      </div>

      {/* 2. WABA Phone & Account Identification */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Registered WhatsApp Business Account</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Registered Business Number
            </label>
            <input
              type="text"
              value={config.phoneNumber}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              WhatsApp Display Name
            </label>
            <input
              type="text"
              value={config.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Meta WABA Account ID
            </label>
            <input
              type="text"
              value={config.wabaId}
              onChange={(e) => onChange({ wabaId: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-800"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Human Handoff Keyword Triggers (Comma-separated)
            </label>
            <input
              type="text"
              value={config.humanHandoffKeywords}
              onChange={(e) => onChange({ humanHandoffKeywords: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
              placeholder="human, manager, complaint, receptionist, emergency"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              When a guest types any of these words, Myra immediately pauses and alerts duty staff.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Approved Meta HSM Templates */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Meta Approved Message Templates</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Pre-approved utility templates for 24-hour window bypass.</p>
          </div>

          <a
            href="https://business.facebook.com/wa/manage/message-templates/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Meta Template Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="divide-y divide-slate-100">
          {config.templates.map((tmpl) => (
            <div key={tmpl.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/50">
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{tmpl.name}</span>
                  <span className="px-2 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                    {tmpl.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">({tmpl.category} • {tmpl.language})</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-sans leading-relaxed">
                  {tmpl.bodyText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Test Dispatcher & Out of Hours Auto-Responder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Dispatcher */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Send className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Send Test WhatsApp Template</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Trigger a live WhatsApp test template to verify end-to-end delivery on your mobile phone.
            </p>

            <form onSubmit={handleSendTestMessage} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Select Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  {config.templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Test Phone Number</label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="mt-2 w-full py-2 bg-teal-900 hover:bg-teal-950 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Dispatching Message...' : 'Dispatch Test Template'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Out-of-Hours Auto-Responder */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-teal-800" />
              <h3 className="text-sm font-bold text-slate-900">Out-of-Hours Auto-Responder</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Automated message sent when guests WhatsApp outside human concierge hours.
            </p>

            <textarea
              rows={4}
              value={config.outOfHoursMessage}
              onChange={(e) => onChange({ outOfHoursMessage: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-teal-800"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Myra AI will seamlessly assist 24/7 if enabled.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
