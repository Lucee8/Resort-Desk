import React from 'react';
import { 
  Building2, 
  Users, 
  Bot, 
  Cable, 
  Receipt, 
  Bell, 
  MessageSquare, 
  CalendarCheck, 
  SlidersHorizontal, 
  ShieldCheck, 
  ScrollText, 
  Code2, 
  HardDrive, 
  Globe2, 
  Palette, 
  AlertTriangle,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { SettingsSectionId, SettingsCategory } from '../../types';

interface SettingsNavProps {
  activeSection: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectSearchResult?: (id: SettingsSectionId) => void;
}

interface NavItemConfig {
  id: SettingsSectionId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlightBadge?: boolean;
}

interface NavGroup {
  category: SettingsCategory;
  title: string;
  items: NavItemConfig[];
}

export default function SettingsNav({
  activeSection,
  onSelectSection,
  searchQuery,
  setSearchQuery,
  onSelectSearchResult
}: SettingsNavProps) {

  const navGroups: NavGroup[] = [
    {
      category: 'GENERAL',
      title: 'GENERAL',
      items: [
        { id: 'resort-profile', name: 'Resort Profile', icon: Building2 },
        { id: 'staff-roles', name: 'Staff & Roles', icon: Users, badge: '42' }
      ]
    },
    {
      category: 'INTELLIGENCE',
      title: 'INTELLIGENCE',
      items: [
        { id: 'myra-ai', name: 'Myra AI Engine', icon: Bot, badge: 'Active', highlightBadge: true }
      ]
    },
    {
      category: 'SYSTEM',
      title: 'SYSTEM',
      items: [
        { id: 'integrations', name: 'Integrations', icon: Cable, badge: '10' },
        { id: 'billing-gst', name: 'Billing & GST', icon: Receipt },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
        { id: 'booking-rules', name: 'Booking & Property Rules', icon: CalendarCheck },
        { id: 'operations', name: 'Operations', icon: SlidersHorizontal }
      ]
    },
    {
      category: 'SECURITY',
      title: 'SECURITY',
      items: [
        { id: 'security-privacy', name: 'Security & Privacy', icon: ShieldCheck },
        { id: 'audit-logs', name: 'Audit Logs', icon: ScrollText },
        { id: 'api-developer', name: 'API & Developer', icon: Code2 },
        { id: 'backup-data', name: 'Backup & Data', icon: HardDrive }
      ]
    },
    {
      category: 'OTHER',
      title: 'OTHER',
      items: [
        { id: 'localization', name: 'Localization', icon: Globe2 },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'emergency-safety', name: 'Emergency & Safety', icon: AlertTriangle, badge: 'SOS', highlightBadge: true }
      ]
    }
  ];

  // Filter items if searchQuery is present
  const query = searchQuery.toLowerCase().trim();

  return (
    <aside id="settings-sidebar-navigation" className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-4">
        {/* Search Settings Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="settings-search-nav-input"
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        <nav className="flex flex-col gap-5">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(item => 
              query === '' || item.name.toLowerCase().includes(query) || group.category.toLowerCase().includes(query)
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="flex flex-col gap-1">
                <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {group.title}
                </div>

                <div className="flex flex-col gap-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`settings-nav-item-${item.id}`}
                        onClick={() => {
                          onSelectSection(item.id);
                          if (onSelectSearchResult) onSelectSearchResult(item.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer ${
                          isActive
                            ? 'bg-teal-900 text-white font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                            isActive ? 'text-teal-200' : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                            isActive
                              ? 'bg-teal-800 text-teal-100'
                              : item.highlightBadge
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* API Usage & Status Card in Settings Sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border border-slate-200/60">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
          <span>API USAGE THIS MONTH</span>
          <span className="text-teal-700 font-bold">85%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-teal-700 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>42.5k / 50k calls</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Online
          </span>
        </div>
      </div>
    </aside>
  );
}
