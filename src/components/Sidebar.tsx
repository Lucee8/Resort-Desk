import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  Brush, 
  Receipt, 
  LifeBuoy, 
  LogOut,
  Sliders, 
  Wrench, 
  BarChart3, 
  Boxes, 
  UserCheck, 
  Star, 
  MessageSquare, 
  Settings,
  X,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  branding: string;
  housekeepingCount: number;
  maintenanceCount?: number;
  inventoryAlertCount?: number;
  staffAlertCount?: number;
  reviewsAlertCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  branding,
  housekeepingCount,
  maintenanceCount = 18,
  inventoryAlertCount = 3,
  staffAlertCount = 3,
  reviewsAlertCount = 2,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Home', icon: LayoutDashboard },
    { id: 'bookings', name: 'Bookings', icon: CalendarRange },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, badge: 8 },
    { id: 'reviews', name: 'Reviews', icon: Star, badge: reviewsAlertCount > 0 ? reviewsAlertCount : undefined },
    { id: 'reports', name: 'Analytics', icon: BarChart3 },
    { id: 'guests', name: 'Guests', icon: Users },
    { id: 'rooms', name: 'Room Management', icon: Sliders },
    { id: 'housekeeping', name: 'Housekeeping', icon: Brush, badge: housekeepingCount > 0 ? housekeepingCount : undefined },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench, badge: maintenanceCount > 0 ? maintenanceCount : undefined },
    { id: 'inventory', name: 'Inventory', icon: Boxes, badge: inventoryAlertCount > 0 ? inventoryAlertCount : undefined },
    { id: 'staff', name: 'Staff', icon: UserCheck, badge: staffAlertCount > 0 ? staffAlertCount : undefined },
    { id: 'billing', name: 'Billing', icon: Receipt },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="w-64 h-full bg-slate-50 border-r border-slate-200/80 flex flex-col justify-between py-6 px-4 font-sans select-none overflow-y-auto">
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className="px-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shadow-teal-900/20 shrink-0">
              M
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-base text-teal-950 tracking-wide leading-tight truncate">
                {branding || 'Mykonos Cottage'}
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-amber-600" />
                <span>Tarkarli, Malvan</span>
              </p>
            </div>
          </div>

          {/* Close button on mobile view */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                  isActive 
                    ? item.id === 'maintenance'
                      ? 'bg-[#a64b2a] text-white shadow-md shadow-[#a64b2a]/20'
                      : 'bg-teal-800 text-white shadow-md shadow-teal-900/10' 
                    : 'text-slate-600 hover:bg-slate-150/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.id === 'maintenance'
                        ? 'bg-orange-50 text-[#a64b2a] border border-orange-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
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
      <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-4 mt-4">
        <button
          id="sidebar-support-btn"
          type="button"
          onClick={() => handleSelectTab('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 hover:text-slate-800 transition-all duration-150 cursor-pointer"
        >
          <LifeBuoy className="w-4 h-4 text-slate-400" />
          <span>Support &amp; Settings</span>
        </button>
        <button
          id="sidebar-signout-btn"
          type="button"
          onClick={() => window.location.reload()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Reset Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (visible on lg and above) */}
      <aside id="resort-sidebar-desktop" className="hidden lg:block h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Sidebar (visible on mobile / tablet when opened) */}
      {isMobileOpen && (
        <div id="resort-sidebar-mobile-drawer" className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          />
          {/* Drawer content */}
          <div className="relative z-10 animate-in slide-in-from-left duration-250 shadow-2xl h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
