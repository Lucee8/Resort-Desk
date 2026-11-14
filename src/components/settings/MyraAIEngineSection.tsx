import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RotateCcw, 
  BookOpen, 
  Languages, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Flame,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { MyraAISettings, KnowledgeBaseItem } from '../../types';

interface MyraAIEngineSectionProps {
  settings: MyraAISettings;
  knowledgeBase: KnowledgeBaseItem[];
  onChangeSettings: (updated: Partial<MyraAISettings>) => void;
  onAddKnowledgeItem: (item: Omit<KnowledgeBaseItem, 'id' | 'lastUpdated'>) => void;
  onDeleteKnowledgeItem: (id: string) => void;
  triggerToast?: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'myra';
  text: string;
  time: string;
  confidence?: number;
  intent?: string;
  latency?: string;
}

export default function MyraAIEngineSection({
  settings,
  knowledgeBase,
  onChangeSettings,
  onAddKnowledgeItem,
  onDeleteKnowledgeItem,
  triggerToast
}: MyraAIEngineSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'core' | 'kb' | 'tone' | 'logs' | 'channels'>('core');
  
  // Knowledge Base category filter & add modal
  const [kbCategory, setKbCategory] = useState<string>('All');
  const [showAddKbModal, setShowAddKbModal] = useState(false);
  const [newKbCategory, setNewKbCategory] = useState<'Policies' | 'Amenities' | 'Dining' | 'Transport' | 'Local Guide'>('Amenities');
  const [newKbQuestion, setNewKbQuestion] = useState('');
  const [newKbAnswer, setNewKbAnswer] = useState('');

  // Add language state
  const [showAddLangModal, setShowAddLangModal] = useState(false);
  const [newLangInput, setNewLangInput] = useState('');

  // Context logs modal state
  const [showContextLogsModal, setShowContextLogsModal] = useState(false);

  // Live Simulator State
  const [simulatorInput, setSimulatorInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Hi, I have a booking for next week (Smith family). Do you provide airport pickup from GOX?',
      time: '10:42 AM'
    },
    {
      id: 'msg-2',
      sender: 'myra',
      text: `Hello! Yes, we provide private airport transfers from Manohar International Airport, Mopa (GOX). 🚕\n\nA luxury sedan is ₹2,500 + GST one way. Would you like me to add this to your reservation for the Smith family?`,
      time: '10:43 AM',
      confidence: 98,
      intent: 'airport_transfer_inquiry',
      latency: '240ms'
    }
  ]);

  const quickPrompts = [
    'Yes, please book it',
    'What about a larger van?',
    'What are the breakfast timings?',
    'Can I get late check-out till 2 PM?'
  ];

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setSimulatorInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      let confidence = 94;
      let intent = 'general_inquiry';

      const lower = userText.toLowerCase();

      if (!settings.enabled) {
        botResponse = 'Myra AI Engine is currently offline in settings. A human front desk manager will attend to your inquiry shortly.';
        confidence = 0;
      } else if (lower.includes('book') || lower.includes('yes, please')) {
        if (settings.autoBookingEngine) {
          botResponse = `Wonderful! I have created a tentative reservation addon for your luxury sedan transfer from GOX. A confirmation voucher has been sent to your registered WhatsApp number. 🛎️`;
          intent = 'booking_addon_confirmed';
          confidence = 99;
        } else {
          botResponse = `I have noted your request for the transfer and forwarded it to our Front Desk team for manual confirmation.`;
          intent = 'human_escalation';
          confidence = 88;
        }
      } else if (lower.includes('van') || lower.includes('innova') || lower.includes('large')) {
        if (settings.aiUpselling) {
          botResponse = `For larger groups or extra luggage, we offer a luxury Toyota Innova Crysta for ₹3,500 + GST. It comfortably seats up to 6 guests with ample space. Shall I reserve this for you instead?`;
          intent = 'upsell_vehicle_upgrade';
          confidence = 96;
        } else {
          botResponse = `Yes, larger vehicles are available upon request. Our concierge will contact you.`;
        }
      } else if (lower.includes('breakfast') || lower.includes('dining') || lower.includes('food')) {
        botResponse = `Complimentary buffet breakfast is served at The Palm Grove restaurant from 07:00 AM to 10:30 AM daily. We also offer 24/7 in-room dining featuring fresh coastal Malvani specialties! 🍳🥞`;
        intent = 'dining_hours_inquiry';
        confidence = 98;
      } else if (lower.includes('late') || lower.includes('checkout')) {
        botResponse = `Standard check-out is 11:00 AM. Complimentary late check-out till 12:00 PM is subject to availability on your departure morning. For check-out till 2:00 PM, a nominal hourly tariff of ₹600 applies. Would you like me to request a priority late departure pass?`;
        intent = 'late_checkout_inquiry';
        confidence = 95;
      } else {
        const toneGreeting = settings.tone === 'formal' 
          ? 'Dear Guest, ' 
          : settings.tone === 'friendly' 
            ? 'Hey there! 😊 ' 
            : 'Hello! ';
        botResponse = `${toneGreeting}Thank you for your question. As your AI Concierge at Mykonos Cottage, Tarkarli, I am always here to assist with dining reservations, spa bookings, and local recommendations. How else may I assist your stay?`;
        confidence = 90;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'myra',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence,
        intent,
        latency: '310ms'
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetSimulator = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'myra',
        text: 'SYSTEM: Engine initialized with current property context. Type any guest inquiry to test autonomous response behaviors.',
        time: 'Just now',
        confidence: 100
      }
    ]);
  };

  const handleAddLanguage = () => {
    if (!newLangInput.trim()) return;
    if (!settings.supportedLanguages.includes(newLangInput.trim())) {
      onChangeSettings({ supportedLanguages: [...settings.supportedLanguages, newLangInput.trim()] });
      if (triggerToast) triggerToast(`Added "${newLangInput.trim()}" to Myra supported languages.`);
    }
    setNewLangInput('');
    setShowAddLangModal(false);
  };

  const handleRemoveLanguage = (lang: string) => {
    onChangeSettings({ supportedLanguages: settings.supportedLanguages.filter(l => l !== lang) });
  };

  const handleSaveKbArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbQuestion || !newKbAnswer) return;
    onAddKnowledgeItem({
      category: newKbCategory,
      question: newKbQuestion,
      answer: newKbAnswer,
      isPublished: true
    });
    if (triggerToast) triggerToast('Knowledge base article published and indexed into vector memory.');
    setNewKbQuestion('');
    setNewKbAnswer('');
    setShowAddKbModal(false);
  };

  return (
    <div id="settings-myra-ai-section" className="flex flex-col gap-6 max-w-6xl">
      {/* 1. Section Header & Sub-Tabs Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-900 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Myra AI Engine & Live Simulator</h2>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
                v2.4.1 Production
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure autonomous capabilities, tone tuning, custom knowledge articles, and live test guest responses in real time.
            </p>
          </div>
        </div>

        {/* Master AI Toggle */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-700">Autonomous AI Mode:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => {
                onChangeSettings({ enabled: e.target.checked });
                if (triggerToast) triggerToast(e.target.checked ? "Myra AI Engine activated." : "Myra AI Engine paused.");
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
          </label>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('core')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'core'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Core Configuration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('kb')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'kb'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Base ({knowledgeBase.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tone')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'tone'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Language & Tone</span>
        </button>
      </div>

      {/* 2. Main Two-Column Layout: Settings on Left, Live Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Active SubTab Form (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {activeSubTab === 'core' && (
            <div className="flex flex-col gap-5">
              {/* Autonomous Capabilities Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <Zap className="w-4 h-4 text-teal-800" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Autonomous Capabilities</h3>
                    <p className="text-[11px] text-slate-400">Define what actions Myra can take without human intervention.</p>
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                  {/* 1. Autonomous Chatbot */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Autonomous Chatbot</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Allow Myra to respond instantly to guest inquiries via WhatsApp and Web Widget.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.autonomousChatbot}
                        onChange={(e) => onChangeSettings({ autonomousChatbot: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
                    </label>
                  </div>

                  {/* 2. Auto-Booking Engine */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-slate-800">Auto-Booking Engine</div>
                        <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[9px] font-bold rounded">
                          BETA
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Allow AI to create tentative holds, check room availability and calculate quote tariffs.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.autoBookingEngine}
                        onChange={(e) => onChangeSettings({ autoBookingEngine: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
                    </label>
                  </div>

                  {/* 3. AI Upselling */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">AI Upselling & Concierge Addons</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Recommend cab transfers, spa packages, romantic candle-lit dining, and room upgrades.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.aiUpselling}
                        onChange={(e) => onChangeSettings({ aiUpselling: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
                    </label>
                  </div>

                  {/* 4. Complaint Handling & Sentiment Triage */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Smart Complaint Handling</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Detect dissatisfied tone, apologize empathetically, and auto-dispatch urgent staff alerts.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.complaintHandling}
                        onChange={(e) => onChangeSettings({ complaintHandling: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
                    </label>
                  </div>

                  {/* 5. Post-Stay Follow-Up */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Post-Stay Follow-up & Review Booster</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Send automated feedback requests on WhatsApp 2 hours post-checkout.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.postStayFollowUp}
                        onChange={(e) => onChangeSettings({ postStayFollowUp: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Confidence Threshold & Human Escalation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-teal-800" />
                  <h3 className="text-sm font-bold text-slate-900">Escalation & Safety Guardrails</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        Autonomous Confidence Threshold
                      </label>
                      <span className="text-xs font-bold text-teal-900 px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100">
                        {settings.confidenceThreshold}% Minimum
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={95}
                      step={5}
                      value={settings.confidenceThreshold}
                      onChange={(e) => onChangeSettings({ confidenceThreshold: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-900"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>50% (Permissive)</span>
                      <span>75% (Standard Recommendation)</span>
                      <span>95% (Strict Handoff)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      If intent confidence drops below <strong>{settings.confidenceThreshold}%</strong>, Myra will automatically hand off the guest conversation to the Front Desk WhatsApp inbox.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'kb' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Resort Knowledge Articles</h3>
                  <p className="text-xs text-slate-500">Myra references these verified answers during autonomous guest conversations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddKbModal(true)}
                  className="px-3.5 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Article
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Transport', 'Policies', 'Dining', 'Amenities', 'Local Guide'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setKbCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      kbCategory === cat
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* KB Cards List */}
              <div className="flex flex-col gap-3">
                {knowledgeBase
                  .filter(item => kbCategory === 'All' || item.category === kbCategory)
                  .map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-teal-700/40 transition-all flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md border border-teal-100 uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400">Updated {item.lastUpdated}</span>
                        </div>
                        <button
                          onClick={() => onDeleteKnowledgeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {item.question}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {item.answer}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeSubTab === 'tone' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personality & Language Tuning</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calibrate Myra's greeting style, voice tone, and multi-lingual fluency.</p>
              </div>

              {/* Tone Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Conversation Tone</label>
                  <span className="text-xs font-bold text-teal-900 capitalize">
                    {settings.tone === 'formal' ? 'Strictly Formal' : settings.tone === 'warm' ? 'Professional yet Warm' : 'Casual & Friendly'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'formal', label: 'Strictly Formal', desc: 'Luxury heritage hotel demeanor' },
                    { key: 'warm', label: 'Professional yet Warm', desc: 'Resort standard (Recommended)' },
                    { key: 'friendly', label: 'Casual & Friendly', desc: 'Relaxed boutique vibe' }
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => onChangeSettings({ tone: t.key as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.tone === t.key
                          ? 'border-teal-900 bg-teal-50/50 ring-2 ring-teal-900/10'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{t.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Supported Languages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Supported Guest Languages</label>
                  <button
                    type="button"
                    onClick={() => setShowAddLangModal(true)}
                    className="text-xs text-teal-800 hover:text-teal-950 font-semibold cursor-pointer"
                  >
                    + Add Language
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.supportedLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full flex items-center gap-1.5 border border-slate-200"
                    >
                      {lang}
                      {settings.supportedLanguages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Greeting Prefix & Signature */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Default Welcome Greeting
                  </label>
                  <input
                    type="text"
                    value={settings.greetingPrefix}
                    onChange={(e) => onChangeSettings({ greetingPrefix: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    WhatsApp Message Sign-off
                  </label>
                  <input
                    type="text"
                    value={settings.signatureText}
                    onChange={(e) => onChangeSettings({ signatureText: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Simulator (5 Cols) - Exactly matching Screenshot 2 & 3 */}
        <div className="lg:col-span-5 flex flex-col gap-3 sticky top-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
            {/* Simulator Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold tracking-wide">Live Simulator</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                  Test Mode Active
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetSimulator}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Simulator"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulator Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-sans bg-slate-900/90">
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                  TODAY
                </span>
              </div>

              {messages.map((msg) => {
                const isMyra = msg.sender === 'myra';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMyra ? 'items-start' : 'items-end'}`}
                  >
                    {isMyra && (
                      <div className="flex items-center gap-1 text-[10px] text-teal-400 mb-1 font-semibold">
                        <Sparkles className="w-3 h-3" /> Myra AI
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMyra
                          ? 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-sm'
                          : 'bg-teal-800 text-white rounded-tr-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                      {msg.confidence !== undefined && (
                        <span className="text-[9px] text-teal-400 font-mono">
                          Confidence: {msg.confidence}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1 p-3 bg-slate-800 rounded-2xl max-w-[100px] border border-slate-700/60">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-[10px] font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Simulator Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(simulatorInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message to test Myra..."
                  value={simulatorInput}
                  onChange={(e) => setSimulatorInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  disabled={!simulatorInput.trim() || isTyping}
                  className="p-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Vector Memory Synced
                </span>
                <button
                  type="button"
                  onClick={() => setShowContextLogsModal(true)}
                  className="hover:text-teal-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Context Logs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Knowledge Base Article */}
      {showAddKbModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-teal-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-sm">Add Knowledge Base Article</h3>
              </div>
              <button onClick={() => setShowAddKbModal(false)} className="text-teal-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKbArticle} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Article Category</label>
                <select
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value="Policies">Policies & Timings</option>
                  <option value="Amenities">Amenities & Recreation</option>
                  <option value="Dining">Dining & Restaurants</option>
                  <option value="Transport">Transport & Airport Pickup</option>
                  <option value="Local Guide">Local Guide & Attractions</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Guest Question / Query</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can we arrange a beach candlelight dinner?"
                  value={newKbQuestion}
                  onChange={(e) => setNewKbQuestion(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Verified Answer</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise pricing, operational hours, and booking guidelines..."
                  value={newKbAnswer}
                  onChange={(e) => setNewKbAnswer(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-teal-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddKbModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-900 text-white rounded-xl text-xs font-semibold hover:bg-teal-950 shadow-sm cursor-pointer"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Language */}
      {showAddLangModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Add Supported Language</h3>
            <p className="text-xs text-slate-500 mb-4">Enter the display name or native script of the language.</p>
            <input
              type="text"
              placeholder="e.g. Gujarati (ગુજરાતી)"
              value={newLangInput}
              onChange={(e) => setNewLangInput(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 mb-4 focus:outline-none focus:border-teal-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddLangModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-3 py-1.5 bg-teal-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Context Logs */}
      {showContextLogsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full p-6 font-mono text-xs">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
              <span className="font-bold text-teal-400">Myra Context Reasoning Logs</span>
              <button onClick={() => setShowContextLogsModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-[11px] text-slate-300 max-h-72 overflow-y-auto">
              <p className="text-emerald-400">[SYSTEM]: Loaded 4 Knowledge Base embeddings (FAISS/Gemini)</p>
              <p>[INTENT]: airport_transfer_inquiry (Confidence: 0.98)</p>
              <p>[ENTITIES]: Location: GOX (Mopa Airport), Vehicle: Luxury Sedan, Tariff: ₹2,500 + GST</p>
              <p>[POLICY]: Allowed autonomous quote generation (autoBookingEngine = true)</p>
              <p>[LATENCY]: Embedding lookup: 42ms | Inference: 198ms | Total: 240ms</p>
              <p className="text-teal-300">[RESPONSE_DISPATCH]: Generated structured WhatsApp message.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
