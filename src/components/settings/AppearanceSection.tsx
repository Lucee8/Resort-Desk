import React from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles, 
  Check,
  Type
} from 'lucide-react';
import { AppearanceSettings } from '../../types';

interface AppearanceSectionProps {
  settings: AppearanceSettings;
  onChange: (updated: Partial<AppearanceSettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function AppearanceSection({
  settings,
  onChange,
  triggerToast
}: AppearanceSectionProps) {
  const accentOptions = [
    { key: 'emerald', name: 'Emerald Teal', colorClass: 'bg-teal-900', ringClass: 'ring-teal-900' },
    { key: 'indigo', name: 'Royal Indigo', colorClass: 'bg-indigo-900', ringClass: 'ring-indigo-900' },
    { key: 'terracotta', name: 'Warm Terracotta', colorClass: 'bg-amber-900', ringClass: 'ring-amber-900' },
    { key: 'slate', name: 'Deep Slate', colorClass: 'bg-slate-900', ringClass: 'ring-slate-900' }
  ];

  return (
    <div id="settings-appearance-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Appearance, Theme & Density</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Hospitality Design System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize your dashboard interface theme, primary accent colors, UI information density, and brand headers.
          </p>
        </div>
      </div>

      {/* 2. Theme Mode Selection */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Palette className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Interface Theme Palette</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Resort Light (Stitch Warm)', icon: Sun, desc: 'Warm off-white background with deep teal contrast (Default)' },
            { id: 'slate', name: 'Executive Slate', icon: Monitor, desc: 'Subtle gray background with crisp white card containers' },
            { id: 'dark', name: 'Night Concierge Dark', icon: Moon, desc: 'High-contrast low-light theme for front desk night shifts' }
          ].map((theme) => {
            const Icon = theme.icon;
            const isSelected = settings.theme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onChange({ theme: theme.id as any });
                  if (triggerToast) triggerToast(`Theme updated to ${theme.name}.`);
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-900 bg-teal-50/40 ring-2 ring-teal-900/10 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-teal-900 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900">{theme.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{theme.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Accent Color & Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accent Colors */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Primary Brand Accent</h3>
            <p className="text-xs text-slate-500 mb-4">Select the accent tone for buttons, badges, and focus rings.</p>

            <div className="grid grid-cols-2 gap-3">
              {accentOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChange({ accentColor: opt.key as any })}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    settings.accentColor === opt.key
                      ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${opt.colorClass}`} />
                  <span className="text-xs text-slate-800">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* UI Density */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Information Density</h3>
            <p className="text-xs text-slate-500 mb-4">Adjust padding and font scale for reservation lists and tables.</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'comfortable', title: 'Comfortable', desc: 'Spacious padding (Standard desktop)' },
                { key: 'compact', title: 'Compact (Dense)', desc: 'High data density for busy front desks' }
              ].map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => onChange({ density: d.key as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.density === d.key
                      ? 'border-teal-900 bg-teal-50 font-bold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs text-slate-900">{d.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
