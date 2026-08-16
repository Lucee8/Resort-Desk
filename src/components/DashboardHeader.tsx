import React, { useState } from 'react';
import { Search, Bell, Settings, SearchCode } from 'lucide-react';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  onClearNotifications?: () => void;
}

export default function DashboardHeader({
  searchQuery,
  setSearchQuery,
  notificationsCount,
  onClearNotifications
}: DashboardHeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const mockAlerts = [
    { id: 1, text: "Room 105 requested Checkout Cleaning", time: "5 mins ago", unread: true },
    { id: 2, text: "Early Arrival: Sarah D'Souza is arriving at 1:30 PM", time: "15 mins ago", unread: true },
    { id: 3, text: "AC Leak reported in Room 212 (High Priority)", time: "1 hour ago", unread: false }
  ];

  return (
    <header id="dashboard-header" className="w-full flex items-center justify-between py-4 px-8 border-b border-slate-200/60 bg-white font-sans shrink-0">
      {/* Left side: Greeting */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Welcome back, Resort Manager
        </p>
      </div>

      {/* Right side: Search & Utilities */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="header-search-input"
            type="text"
            placeholder="Search guests or rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 px-1 rounded"
            >
              clear
            </button>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors relative text-slate-600 hover:text-slate-900"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationDropdown && (
              <div id="notifications-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
                  {notificationsCount > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[10px] text-teal-600 hover:text-teal-800 font-semibold"
                    >
                      Mark all as read
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
            onClick={() => alert("Resort settings panel coming soon in Module 2!")}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 border-l border-slate-200/80 pl-4">
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
