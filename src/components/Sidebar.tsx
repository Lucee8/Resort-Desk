import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  Brush, 
  Receipt, 
  LifeBuoy, 
  LogOut,
  Sparkles,
  ShieldAlert,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  branding: string;
  housekeepingCount: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  branding,
  housekeepingCount 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'guests', name: 'Guests', icon: Users },
    { id: 'bookings', name: 'Bookings', icon: CalendarRange },
    { id: 'rooms', name: 'Room Management', icon: Sliders },
    { id: 'housekeeping', name: 'Housekeeping', icon: Brush, badge: housekeepingCount > 0 ? housekeepingCount : undefined },
    { id: 'billing', name: 'Billing', icon: Receipt },
  ];


  return (
    <div id="resort-sidebar" className="w-64 h-screen bg-slate-50 border-r border-slate-200/80 flex flex-col justify-between py-6 px-4 shrink-0 font-sans">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="px-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shadow-teal-700/20">
              M
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-teal-900 tracking-wide leading-tight">
                {branding}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Staff Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`sidebar-item-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-teal-800 text-white shadow-md shadow-teal-900/10' 
                    : 'text-slate-600 hover:bg-slate-150 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-4">
        <button
          id="sidebar-support-btn"
          onClick={() => alert("ResortDesk Premium Support is available 24/7 at support@resortdesk.ai")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-150 hover:text-slate-800 transition-all duration-200 group"
        >
          <LifeBuoy className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-600" />
          <span>Support</span>
        </button>
        <button
          id="sidebar-signout-btn"
          onClick={() => {
            if(confirm("Are you sure you want to sign out from ResortDesk AI?")) {
              alert("Signing out... (Demo reset)");
              window.location.reload();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group"
        >
          <LogOut className="w-[18px] h-[18px] text-slate-400 group-hover:text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
