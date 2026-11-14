import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Menu,
  MapPin,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { FirestoreConnectionStatus } from '../services/firestoreBase';

export interface OperationalHeaderAlert {
  id: string;
  text: string;
  time: string;
  unread: boolean;
  tab?: string;
}

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  alerts?: OperationalHeaderAlert[];
  onAlertClick?: (tab?: string) => void;
  onClearNotifications?: () => void;
  onOpenSettings?: () => void;
  onToggleMobileMenu?: () => void;
  propertyName?: string;
  propertyLocation?: string;
  firestoreStatus?: FirestoreConnectionStatus;
  staffLabel?: string | null;
  onOpenAuthModal?: () => void;
}

export default function DashboardHeader({
  searchQuery,
  setSearchQuery,
  notificationsCount,
  alerts = [],
  onAlertClick,
  onClearNotifications,
  onOpenSettings,
  onToggleMobileMenu,
  propertyName = 'Mykonos Cottage',
  propertyLocation = 'Tarkarli, Malvan',
  firestoreStatus = 'checking',
  staffLabel,
  onOpenAuthModal,
}: DashboardHeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  return (
    <header
      id="dashboard-header"
      className="w-full flex items-center justify-between gap-2 py-3.5 px-3 sm:px-6 lg:px-8 border-b border-slate-200/70 bg-white font-sans shrink-0"
    >
      {/* Left side: Hamburger on mobile + Property Tag */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none cursor-pointer shrink-0"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none truncate">
              {propertyName}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-100 shrink-0">
              <MapPin className="w-2.5 h-2.5 text-amber-600" />
              {propertyLocation}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 truncate">
            Operations Console
          </p>
        </div>
      </div>

      {/* Right side: Search & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative w-28 sm:w-48 md:w-60">
          <span className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="header-search-input"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 px-1 rounded cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Auth / Firestore session trigger */}
        {onOpenAuthModal && (
          <button
            id="header-auth-btn"
            type="button"
            onClick={onOpenAuthModal}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
              firestoreStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : firestoreStatus === 'permission-denied'
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Manage Staff Authentication & Firebase Connection"
          >
            {firestoreStatus === 'connected' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="max-w-[120px] truncate">
              {staffLabel
                ? staffLabel
                : firestoreStatus === 'connected'
                ? 'Live Sync'
                : 'Staff Sign In'}
            </span>
          </button>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              id="header-notifications-btn"
              type="button"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors relative text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {showNotificationDropdown && (
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200/80 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-150"
              >
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">Operational Alerts</h4>
                  {notificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearNotifications?.();
                        setShowNotificationDropdown(false);
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      All operational alerts are clear.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => {
                          setShowNotificationDropdown(false);
                          onAlertClick?.(alert.tab);
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs ${
                              alert.unread ? 'font-medium text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {alert.text}
                          </p>
                          {alert.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            id="header-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile / Session Button */}
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 border-l border-slate-200 pl-2.5 sm:pl-3 cursor-pointer"
          title={staffLabel ? `Signed in as ${staffLabel}` : 'Staff Sign In'}
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Resort Staff"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                firestoreStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
