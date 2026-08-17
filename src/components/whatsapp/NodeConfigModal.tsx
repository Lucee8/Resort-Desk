import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  Send, 
  Sparkles, 
  Bell, 
  Split, 
  Bed, 
  FileText, 
  Smartphone,
  Plus,
  Trash2,
  HelpCircle,
  Sliders,
  Bot
} from 'lucide-react';
import { 
  WhatsAppWorkflowNode, 
  WhatsAppNodeType, 
  WhatsAppTemplate,
  WhatsAppButtonAction
} from '../../types';

interface NodeConfigModalProps {
  node: WhatsAppWorkflowNode | null;
  templates: WhatsAppTemplate[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNode: (updatedNode: WhatsAppWorkflowNode) => void;
}

export default function NodeConfigModal({
  node,
  templates,
  isOpen,
  onClose,
  onSaveNode
}: NodeConfigModalProps) {
  const [title, setTitle] = useState(node?.title || '');
  const [subtitle, setSubtitle] = useState(node?.subtitle || '');
  const [nodeType, setNodeType] = useState<WhatsAppNodeType>(node?.type || 'action');
  const [config, setConfig] = useState(node?.config ? { ...node.config } : {});

  // Sync state whenever node changes
  React.useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setSubtitle(node.subtitle || '');
      setNodeType(node.type);
      setConfig({ ...node.config });
    }
  }, [node]);

  const availableVariables = [
    { label: 'Guest Name', var: '{{GuestName}}' },
    { label: 'Resort Name', var: '{{ResortName}}' },
    { label: 'Room Number', var: '{{RoomNumber}}' },
    { label: 'Check-in Date', var: '{{CheckInDate}}' },
    { label: 'Check-out Date', var: '{{CheckOutDate}}' },
    { label: 'Booking ID', var: '{{BookingID}}' },
    { label: 'Total Amount', var: '{{TotalAmount}}' },
    { label: 'Front Desk Phone', var: '{{FrontDeskPhone}}' }
  ];

  const handleInsertVariable = (varCode: string) => {
    const current = config.messageText || '';
    setConfig({
      ...config,
      messageText: current ? `${current} ${varCode}` : varCode
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setConfig({
        ...config,
        templateId: tmpl.id,
        templateName: tmpl.name,
        messageText: tmpl.body,
        buttons: tmpl.buttons || []
      });
      setTitle(tmpl.name.replace(/resort_|v\d+|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }
  };

  const handleAddButton = () => {
    const currentButtons = config.buttons || [];
    if (currentButtons.length < 3) {
      setConfig({
        ...config,
        buttons: [...currentButtons, { type: 'quick_reply', label: 'New Option' }]
      });
    }
  };

  const handleUpdateButton = (index: number, label: string) => {
    const currentButtons = [...(config.buttons || [])];
    currentButtons[index] = { ...currentButtons[index], label };
    setConfig({ ...config, buttons: currentButtons });
  };

  const handleRemoveButton = (index: number) => {
    const currentButtons = (config.buttons || []).filter((_, i) => i !== index);
    setConfig({ ...config, buttons: currentButtons });
  };

  const handleSave = () => {
    if (!node) return;
    onSaveNode({
      ...node,
      title,
      subtitle,
      type: nodeType,
      config
    });
    onClose();
  };

  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              {nodeType === 'trigger' && <Bed className="w-4 h-4" />}
              {nodeType === 'wait' && <Clock className="w-4 h-4" />}
              {nodeType === 'action' && <Send className="w-4 h-4" />}
              {nodeType === 'ai_action' && <Sparkles className="w-4 h-4" />}
              {nodeType === 'condition' && <Split className="w-4 h-4" />}
              {nodeType === 'notification' && <Bell className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Configure Step: {title}
              </h3>
              <p className="text-xs text-slate-500">
                Type: <span className="font-semibold uppercase text-teal-800">{nodeType}</span>
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
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-slate-800 text-sm">
          {/* Step Title & Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Step Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtitle / Note
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Allows payment processing to settle"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700/20 focus:outline-none"
              />
            </div>
          </div>

          {/* TRIGGER CONFIGURATION */}
          {nodeType === 'trigger' && (
            <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex flex-col gap-3">
              <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider">
                Enrollment Trigger Event
              </label>
              <select
                value={config.triggerEvent || 'booking_created'}
                onChange={(e) => setConfig({ ...config, triggerEvent: e.target.value as any })}
                className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              >
                <option value="booking_created">New Booking Created (All Channels & Direct)</option>
                <option value="checkin_reminder">Pre-Arrival Window (2-3 Days Before Check-in)</option>
                <option value="guest_checked_in">Guest Checked-In (Physical / Digital Key Issued)</option>
                <option value="guest_checked_out">Guest Checked-Out (Departure Complete)</option>
                <option value="payment_pending">Payment Outstanding (Balance &gt; $0 at T-24h)</option>
                <option value="special_request">Special Concierge Request / Honeymoon / VIP</option>
                <option value="vip_arrival">VIP Penthouse / Villa Allocation</option>
              </select>
              <p className="text-xs text-teal-800/80">
                When this trigger event fires from ResortDesk or PMS webhook, guest enters this automated WhatsApp journey.
              </p>
            </div>
          )}

          {/* WAIT CONFIGURATION */}
          {nodeType === 'wait' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delay & Timing Schedule
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Duration</label>
                  <input
                    type="number"
                    min="1"
                    value={config.waitDuration || 5}
                    onChange={(e) => setConfig({ ...config, waitDuration: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Unit</label>
                  <select
                    value={config.waitUnit || 'minutes'}
                    onChange={(e) => setConfig({ ...config, waitUnit: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Timing Reference</label>
                <select
                  value={config.waitTimingType || 'after_previous'}
                  onChange={(e) => setConfig({ ...config, waitTimingType: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="after_previous">After previous step finishes</option>
                  <option value="before_checkin">Before Guest Check-in Date (e.g. 2 Days Before)</option>
                  <option value="after_checkin">After Guest Check-in Time</option>
                  <option value="before_checkout">Before Checkout Date</option>
                  <option value="after_checkout">After Guest Checkout (e.g. 1 Day Post-Stay)</option>
                </select>
              </div>
            </div>
          )}

          {/* ACTION (WHATSAPP MESSAGE) CONFIGURATION */}
          {nodeType === 'action' && (
            <div className="flex flex-col gap-4">
              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Approved Template
                </label>
                <select
                  value={config.templateId || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700/20"
                >
                  <option value="">-- Custom Message (Within 24h Session Window) --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Body Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message Content
                  </label>
                  <span className="text-xs text-slate-400">WhatsApp Formatting (*bold*, _italic_)</span>
                </div>
                <textarea
                  rows={4}
                  value={config.messageText || ''}
                  onChange={(e) => setConfig({ ...config, messageText: e.target.value })}
                  placeholder="Hi {{GuestName}}, welcome to {{ResortName}}..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-700/20 leading-relaxed"
                />
              </div>

              {/* Dynamic Variables Tool */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Insert Personalization Variables
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariables.map((v) => (
                    <button
                      key={v.var}
                      type="button"
                      onClick={() => handleInsertVariable(v.var)}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Quick Reply Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick Reply Buttons (Max 3)
                  </label>
                  {(config.buttons?.length || 0) < 3 && (
                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Button
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {(config.buttons || []).map((btn, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) => handleUpdateButton(idx, e.target.value)}
                        placeholder="Button label..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-700/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI ACTION (MYRA AI CONCIERGE) CONFIGURATION */}
          {nodeType === 'ai_action' && (
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Myra AI Agent Instructions</span>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  AI Context Directives & Knowledge Access
                </label>
                <textarea
                  rows={3}
                  value={config.aiPrompt || ''}
                  onChange={(e) => setConfig({ ...config, aiPrompt: e.target.value })}
                  placeholder="Answer guest inquiries politely about dining hours, Wi-Fi, spa appointments..."
                  className="w-full bg-white border border-purple-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-purple-700/20 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 font-medium block mb-1">Tone Archetype</label>
                  <select
                    value={config.aiTone || 'Warm & Hospitable'}
                    onChange={(e) => setConfig({ ...config, aiTone: e.target.value as any })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Warm & Hospitable">Warm & Hospitable</option>
                    <option value="Empathetic Problem Solver">Empathetic Problem Solver</option>
                    <option value="Luxury Concierge">Luxury Concierge</option>
                    <option value="Executive & Crisp">Executive & Crisp</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Human Handover</span>
                    <span className="text-[11px] text-slate-500">Alert desk on low confidence</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.fallbackToHuman ?? true}
                    onChange={(e) => setConfig({ ...config, fallbackToHuman: e.target.checked })}
                    className="w-4 h-4 accent-purple-700 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONDITION CONFIGURATION */}
          {nodeType === 'condition' && (
            <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 flex flex-col gap-3">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                Branching Condition Rule
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Evaluation Field</label>
                  <select
                    value={config.conditionField || 'has_replied'}
                    onChange={(e) => setConfig({ ...config, conditionField: e.target.value as any })}
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="has_replied">Guest has replied to previous message</option>
                    <option value="special_requests">Special Requests / Addons Booked</option>
                    <option value="room_type">Villa / Penthouse vs Standard Room</option>
                    <option value="stay_length">Stay length &gt; 3 nights</option>
                    <option value="guest_type">VIP Tier 1 vs Regular</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Condition Rule</label>
                  <select
                    value={config.conditionOperator || 'is_true'}
                    onChange={(e) => setConfig({ ...config, conditionOperator: e.target.value as any })}
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="is_true">Is TRUE</option>
                    <option value="is_false">Is FALSE</option>
                    <option value="contains">Contains Keyword</option>
                    <option value="equals">Equals Exact Value</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <label className="text-xs text-emerald-800 font-bold block mb-1">TRUE Branch Action</label>
                  <input
                    type="text"
                    value={config.trueBranchLabel || 'Continue Journey'}
                    onChange={(e) => setConfig({ ...config, trueBranchLabel: e.target.value })}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold block mb-1">FALSE Branch Action</label>
                  <input
                    type="text"
                    value={config.falseBranchLabel || 'Skip Step'}
                    onChange={(e) => setConfig({ ...config, falseBranchLabel: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION CONFIGURATION */}
          {nodeType === 'notification' && (
            <div className="bg-orange-50/50 border border-orange-200/70 rounded-xl p-4 flex flex-col gap-3">
              <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider">
                Staff Department Notification
              </label>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Target Department / Role</label>
                <select
                  value={config.notifyRole || 'manager'}
                  onChange={(e) => setConfig({ ...config, notifyRole: e.target.value as any })}
                  className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="front_desk">Front Office &amp; Reception Team</option>
                  <option value="concierge">Concierge &amp; Butler Team</option>
                  <option value="manager">General Manager &amp; Duty Manager</option>
                  <option value="housekeeping">Housekeeping Supervisor</option>
                  <option value="fnb_lead">Food &amp; Beverage Team</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Alert Message</label>
                <textarea
                  rows={2}
                  value={config.notificationBody || ''}
                  onChange={(e) => setConfig({ ...config, notificationBody: e.target.value })}
                  placeholder="VIP guest arrival imminent. Ensure welcome amenities prepared."
                  className="w-full bg-white border border-orange-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
