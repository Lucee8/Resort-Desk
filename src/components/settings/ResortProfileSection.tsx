import React, { useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Clock, 
  DollarSign, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { ResortProfileSettings } from '../../types';

interface ResortProfileSectionProps {
  profile: ResortProfileSettings;
  onChange: (updated: Partial<ResortProfileSettings>) => void;
  triggerToast?: (msg: string) => void;
}

export default function ResortProfileSection({ profile, onChange, triggerToast }: ResortProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          onChange({ logoUrl: uploadEvent.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="settings-resort-profile-section" className="flex flex-col gap-6 max-w-5xl">
      {/* 1. Basic Property Information & Brand Logo */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Resort Profile & Identity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Basic information that appears on invoices, guest WhatsApp communications, and booking confirmation passes.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-full border border-teal-100 uppercase tracking-wider">
            Verified Property
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3 relative group">
              {profile.logoUrl ? (
                <img 
                  src={profile.logoUrl} 
                  alt="Property Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-slate-300" />
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleLogoUpload}
            />

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-700 hover:text-teal-800 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Logo
              </button>
              {profile.logoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ logoUrl: '' })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Remove Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Recommended: PNG/JPG 400×400px</p>
          </div>

          {/* Core Name & Legal Entity */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Display Property Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.propertyName}
                onChange={(e) => onChange({ propertyName: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all font-medium"
                placeholder="e.g. The Grand Oberoi Goa & Spa"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Legal Registered Entity Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.legalEntityName}
                onChange={(e) => onChange({ legalEntityName: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                placeholder="e.g. Oberoi Leisure & Hospitality Private Limited"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Primary Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={profile.primaryEmail}
                    onChange={(e) => onChange({ primaryEmail: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                    placeholder="concierge@grandoberoigoa.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Support / Front Desk Phone
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={profile.supportPhone}
                    onChange={(e) => onChange({ supportPhone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                    placeholder="+91 832 249 8000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Official Website URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-3.5 h-3.5" />
                </span>
                <input
                  type="url"
                  value={profile.websiteUrl}
                  onChange={(e) => onChange({ websiteUrl: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                  placeholder="https://grandoberoigoa.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Registered Location & Address */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <MapPin className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Registered Property Address</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Street Address / Landmark
            </label>
            <input
              type="text"
              value={profile.registeredAddress}
              onChange={(e) => onChange({ registeredAddress: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              placeholder="e.g. Aguada-Siolim Coastal Road, Candolim Beach"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              City / Region
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              placeholder="North Goa"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              State / Province
            </label>
            <input
              type="text"
              value={profile.state}
              onChange={(e) => onChange({ state: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              placeholder="Goa"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Postal / PIN Code
            </label>
            <input
              type="text"
              value={profile.pincode}
              onChange={(e) => onChange({ pincode: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              placeholder="403515"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              placeholder="India"
            />
          </div>
        </div>
      </div>

      {/* 3. Operational Timings, Currency & Statutory Tax */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <Clock className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Operational Timings & Tax Identification</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Standard Check-in Time
            </label>
            <input
              type="time"
              value={profile.checkInTime}
              onChange={(e) => onChange({ checkInTime: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Standard Check-out Time
            </label>
            <input
              type="time"
              value={profile.checkOutTime}
              onChange={(e) => onChange({ checkOutTime: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Base Currency
            </label>
            <select
              value={profile.baseCurrency}
              onChange={(e) => {
                const cur = e.target.value;
                const sym = cur === 'INR' ? '₹' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : 'AED';
                onChange({ baseCurrency: cur, currencySymbol: sym });
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              System Timezone
            </label>
            <select
              value={profile.systemTimeZone}
              onChange={(e) => onChange({ systemTimeZone: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white"
            >
              <option value="Asia/Kolkata (GMT+05:30)">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
              <option value="Asia/Dubai (GMT+04:00)">(GMT+04:00) Dubai, Abu Dhabi</option>
              <option value="Europe/London (GMT+01:00)">(GMT+01:00) London</option>
              <option value="America/New_York (GMT-04:00)">(GMT-04:00) Eastern Time (US & Canada)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              GSTIN (Goods and Services Tax Identification Number)
            </label>
            <input
              type="text"
              value={profile.gstin}
              onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 uppercase font-mono"
              placeholder="30AABCO4921B1Z2"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              PAN Number
            </label>
            <input
              type="text"
              value={profile.panNumber}
              onChange={(e) => onChange({ panNumber: e.target.value.toUpperCase() })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 uppercase font-mono"
              placeholder="AABCO4921B"
            />
          </div>
        </div>
      </div>

      {/* 4. Cancellation Policy & Guest Booking Terms */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <FileText className="w-4 h-4 text-teal-800" />
          <h3 className="text-sm font-bold text-slate-900">Legal Clauses, Cancellation Policy & Terms</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Default Cancellation & Refund Policy
            </label>
            <textarea
              rows={3}
              value={profile.cancellationPolicy}
              onChange={(e) => onChange({ cancellationPolicy: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 leading-relaxed"
              placeholder="Enter standard cancellation terms..."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Guest Check-in & House Rules Terms
            </label>
            <textarea
              rows={3}
              value={profile.bookingTerms}
              onChange={(e) => onChange({ bookingTerms: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 leading-relaxed"
              placeholder="Enter mandatory identification and stay rules..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
