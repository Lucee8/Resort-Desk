import React, { useState } from 'react';
import { Search, Bell, Settings, Menu, MapPin, Database, Check } from 'lucide-react';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  onClearNotifications?: () => void;
  onOpenSettings?: () => void;
  onToggleMobileMenu?: () => void;
}

export default function DashboardHeader({
  searchQuery,
  setSearchQuery,
  notificationsCount,
  onClearNotifications,
  onOpenSettings,
  onToggleMobileMenu
}: DashboardHeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const mockAlerts = [
    { id: 1, text: "Room 105 requested Checkout Cleaning", time: "5 mins ago", unread: true },
    { id: 2, text: "Early Arrival: Sarah D'Souza is arriving at 1:30 PM", time: "15 mins ago", unread: true },
    { id: 3, text: "AC Leak reported in Sunset Suite 402 (High Priority)", time: "1 hour ago", unread: false }
  ];

  return (
    <header id="dashboard-header" className="w-full flex items-center justify-between py-3.5 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70 bg-white font-sans shrink-0">
      {/* Left side: Hamburger on mobile + Greeting & Property Tag */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
              Mykonos Cottage
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-100">
              <MapPin className="w-2.5 h-2.5 text-amber-600" />
              Tarkarli, Malvan
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Operations Management Console
          </p>
        </div>
      </div>

      {/* Right side: Search & Utilities */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar - Responsive width */}
        <div className="relative w-36 sm:w-52 md:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="header-search-input"
            type="text"
            placeholder="Search guests or rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 px-1 rounded cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors relative text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationDropdown && (
              <div id="notifications-dropdown" className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Operational Alerts</h4>
                  {notificationsCount > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {mockAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors flex flex-col gap-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${alert.unread ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                          {alert.text}
                        </p>
                        {alert.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Resort Manager"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
