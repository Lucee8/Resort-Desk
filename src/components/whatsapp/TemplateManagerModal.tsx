import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  FileCode2, 
  Copy, 
  Check, 
  Sparkles,
  Sliders,
  ExternalLink,
  MessageSquare,
  Globe
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types';

interface TemplateManagerModalProps {
  templates: WhatsAppTemplate[];
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (newTemplate: WhatsAppTemplate) => void;
  onSelectTemplateForWorkflow?: (template: WhatsAppTemplate) => void;
}

export default function TemplateManagerModal({
  templates,
  isOpen,
  onClose,
  onCreateTemplate,
  onSelectTemplateForWorkflow
}: TemplateManagerModalProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Template Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('UTILITY');
  const [body, setBody] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopyBody = (tmpl: WhatsAppTemplate) => {
    navigator.clipboard.writeText(tmpl.body);
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveNewTemplate = () => {
    if (!name || !body) return;

    // Extract variables inside {{...}}
    const matches = body.match(/\{\{([^}]+)\}\}/g) || [];
    const vars = matches.map(m => m.replace(/[{}]/g, ''));

    const newTmpl: WhatsAppTemplate = {
      id: `tmpl-${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, '_'),
      category,
      language: 'en_US',
      status: 'APPROVED',
      body,
      variables: vars,
      sampleValues: {
        GuestName: 'Anand Sharma',
        ResortName: 'Majestic Serenity Resort',
        RoomNumber: 'Villa 304',
        CheckInDate: 'Aug 18, 2026'
      },
      lastUsed: 'Just now',
      useCount: 0
    };

    onCreateTemplate(newTmpl);
    setShowCreateForm(false);
    setName('');
    setBody('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                WhatsApp Template Library
              </h3>
              <p className="text-xs text-slate-500">
                Official Meta &amp; WhatsApp Cloud API approved templates with variable parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search and Category Filter */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium border border-slate-200/80">
                {(['ALL', 'UTILITY', 'MARKETING'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      categoryFilter === cat 
                        ? 'bg-white text-teal-900 shadow-2xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Template Button */}
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateForm ? 'Cancel Creation' : 'New Template'}</span>
            </button>
          </div>

          {/* New Template Form if open */}
          {showCreateForm && (
            <div className="bg-teal-50/40 border border-teal-200/80 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Create New WhatsApp Template
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Template Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. resort_breakfast_upsell_v1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-teal-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="UTILITY">UTILITY (Standard Confirmation, Keys, Check-in)</option>
                    <option value="MARKETING">MARKETING (Promotions, Spa, Dining Upsell)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (OTP, Wi-Fi Codes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Template Body (use {'{{GuestName}}'}, {'{{ResortName}}'}, {'{{RoomNumber}}'} etc.)
                </label>
                <textarea
                  rows={3}
                  placeholder="Hi {{GuestName}}, welcome to {{ResortName}}! Your {{RoomNumber}} is ready..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-white border border-teal-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewTemplate}
                  disabled={!name || !body}
                  className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Submit for WhatsApp Approval
                </button>
              </div>
            </div>
          )}

          {/* Templates Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:bg-white hover:shadow-sm transition-all"
              >
                <div>
                  {/* Top Bar: Name + Status badge + Category */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-mono">
                        {template.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {template.category} • {template.language}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  </div>

                  {/* Body Preview */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 font-normal leading-relaxed">
                    <p className="whitespace-pre-wrap">{template.body}</p>

                    {/* Variables Tags */}
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-100">
                        {template.variables.map(v => (
                          <span key={v} className="text-[10px] font-mono bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded border border-teal-100">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>Used {template.useCount || 0} times</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyBody(template)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === template.id ? <Check className="w-3 h-3 text-teal-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === template.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    {onSelectTemplateForWorkflow && (
                      <button
                        onClick={() => {
                          onSelectTemplateForWorkflow(template);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium transition-colors cursor-pointer"
                      >
                        Use in Journey
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Synced with WhatsApp Business Account ID: <strong className="text-slate-700">WABA-9820-2026</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
