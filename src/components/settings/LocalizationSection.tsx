import React from 'react';
import { 
  Globe2, 
  DollarSign, 
  Clock, 
  Calendar, 
  Thermometer,
  CheckCircle2
} from 'lucide-react';
import { LocalizationSettings } from '../../types';

interface LocalizationSectionProps {
  settings: LocalizationSettings;
  onChange: (updated: Partial<LocalizationSettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function LocalizationSection({
  settings,
  onChange,
  triggerToast
}: LocalizationSectionProps) {
  return (
    <div id="settings-localization-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Localization, Currency & Formatting</h2>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
              Regional Config
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Set default currency symbols, date & time formatting standards, numerical separators, and multi-language presets.
          </p>
        </div>
      </div>

      {/* 2. Language & Regional Formatting Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Globe2 className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Regional Display Standards</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Primary System Language
            </label>
            <select
              value={settings.primaryLanguage}
              onChange={(e) => onChange({ primaryLanguage: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="English (US/UK)">English (US / UK)</option>
              <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              <option value="Marathi (मराठी)">Marathi (मराठी)</option>
              <option value="Konkani (कोंकणी)">Konkani (कोंकणी)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Default Currency Code
            </label>
            <select
              value={settings.currencyCode}
              onChange={(e) => {
                const c = e.target.value;
                const s = c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : '£';
                onChange({ currencyCode: c, currencySymbol: s });
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Date Display Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => onChange({ dateFormat: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="DD/MM/YYYY (e.g. 17/08/2026)">DD/MM/YYYY (e.g. 17/08/2026)</option>
              <option value="MM/DD/YYYY (e.g. 08/17/2026)">MM/DD/YYYY (e.g. 08/17/2026)</option>
              <option value="YYYY-MM-DD (ISO 8601)">YYYY-MM-DD (ISO Standard)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Number Formatting System
            </label>
            <select
              value={settings.numberFormat}
              onChange={(e) => onChange({ numberFormat: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="Indian (12,50,000.00)">Indian Lakhs & Crores (12,50,000.00)</option>
              <option value="International (1,250,000.00)">International Millions (1,250,000.00)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Temperature Unit
            </label>
            <select
              value={settings.temperatureUnit}
              onChange={(e) => onChange({ temperatureUnit: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="Celsius (°C)">Celsius (°C)</option>
              <option value="Fahrenheit (°F)">Fahrenheit (°F)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Timezone Standard
            </label>
            <input
              type="text"
              readOnly
              value={settings.timeZone}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 bg-slate-50 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
