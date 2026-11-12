import React, { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  AppWindow, 
  Moon, 
  Clock, 
  ShieldAlert, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { NotificationRuleItem } from '../../types';

interface NotificationsSectionProps {
  rules: NotificationRuleItem[];
  onUpdateRule: (id: string, updated: Partial<NotificationRuleItem>) => void;
  triggerToast?: (msg: string) => void;
}

export default function NotificationsSection({
  rules,
  onUpdateRule,
  triggerToast
}: NotificationsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  const categories = ['All', 'Reservations', 'Financial', 'Operations', 'Urgent'];

  const filteredRules = rules.filter(r => selectedCategory === 'All' || r.category === selectedCategory);

  return (
    <div id="settings-notifications-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Notifications & Multi-Channel Alerts</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Omnichannel Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated event routing via WhatsApp, SMS, Email, and In-App Push alerts to assigned staff roles.
          </p>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Notification Rules Matrix Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">EVENT TRIGGER</th>
                <th className="py-3 px-4">TARGET RECIPIENTS</th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WHATSAPP</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>EMAIL</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>SMS</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AppWindow className="w-3.5 h-3.5 text-teal-700" />
                    <span>IN-APP</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{rule.event}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        rule.category === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : rule.category === 'Financial'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rule.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rule.description}</div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rule.targetRole}</span>
                    </div>
                  </td>

                  {/* WhatsApp Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.whatsapp}
                      onChange={(e) => onUpdateRule(rule.id, { whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                  </td>

                  {/* Email Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.email}
                      onChange={(e) => onUpdateRule(rule.id, { email: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                  </td>

                  {/* SMS Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.sms}
                      onChange={(e) => onUpdateRule(rule.id, { sms: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                    />
                  </td>

                  {/* In-App Toggle */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={rule.inApp}
                      onChange={(e) => onUpdateRule(rule.id, { inApp: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 accent-teal-800 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Quiet Hours / DND Settings */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-teal-800" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quiet Hours (Do Not Disturb)</h3>
              <p className="text-[11px] text-slate-400">Suppress non-critical guest and non-urgent staff notifications overnight.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={quietHoursEnabled}
              onChange={(e) => {
                setQuietHoursEnabled(e.target.checked);
                if (triggerToast) triggerToast(e.target.checked ? "Quiet hours schedule enabled." : "Quiet hours disabled.");
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-900"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Quiet Period Start (Night)
            </label>
            <input
              type="time"
              value={quietHoursStart}
              disabled={!quietHoursEnabled}
              onChange={(e) => setQuietHoursStart(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Quiet Period End (Morning)
            </label>
            <input
              type="time"
              value={quietHoursEnd}
              disabled={!quietHoursEnabled}
              onChange={(e) => setQuietHoursEnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Life-safety alerts and high-priority maintenance tickets bypass quiet hours automatically.</span>
        </div>
      </div>
    </div>
  );
}
