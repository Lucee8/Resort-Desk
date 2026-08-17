import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ShieldAlert, 
  ChevronDown, 
  Building2, 
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MaintenanceUserRole } from '../../types';

interface MaintenanceHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blockedRoomsCount: number;
  onOpenBlockedRooms: () => void;
  onOpenAI: () => void;
  userRole: MaintenanceUserRole;
  onRoleChange: (role: MaintenanceUserRole) => void;
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  notificationsCount: number;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
}

export default function MaintenanceHeader({
  searchQuery,
  onSearchChange,
  blockedRoomsCount,
  onOpenBlockedRooms,
  onOpenAI,
  userRole,
  onRoleChange,
  selectedProperty,
  onPropertyChange,
  notificationsCount,
  onOpenNotifications,
  onOpenMessages
}: MaintenanceHeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

  const roles: MaintenanceUserRole[] = ['Resort Owner', 'Manager', 'Technician', 'Receptionist'];
  const properties = ['Konkan Retreat (Main)', 'Mykonos Villas (Beachfront)', 'Coconut Grove Cottages'];

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Maintenance Console
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Live Telemetry
          </span>
        </div>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Monitor, assign, and resolve property maintenance issues.
        </p>
      </div>

      {/* Center Search & Blocked Rooms Alert */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-0 md:mx-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="maintenance-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets, rooms or staff (or ask AI)..."
            className="w-full pl-9.5 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 4 Rooms Blocked Badge (Matches Screenshot) */}
        <button
          id="btn-view-blocked-rooms"
          onClick={onOpenBlockedRooms}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 text-amber-800 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs group"
          title="Click to inspect rooms blocked from guest check-in"
        >
          <div className="w-4 h-4 rounded-md bg-amber-200 flex items-center justify-center text-amber-900 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-2.5 h-2.5" />
          </div>
          <span>{blockedRoomsCount} Rooms Blocked</span>
        </button>
      </div>

      {/* Top-Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* AI Assistant Quick Trigger */}
        <button
          id="btn-header-ai-assistant"
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-800 to-teal-900 hover:from-teal-900 hover:to-teal-950 text-white rounded-xl text-xs font-semibold shadow-xs shadow-teal-900/10 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-200" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
          title="Maintenance Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Messages */}
        <button
          id="btn-header-messages"
          onClick={onOpenMessages}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
          title="Staff Radio / Dispatch Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Property Selector */}
        <div className="relative">
          <button
            id="btn-property-selector"
            onClick={() => {
              setShowPropertyDropdown(!showPropertyDropdown);
              setShowRoleDropdown(false);
            }}
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="max-w-[130px] truncate">{selectedProperty}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPropertyDropdown && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 font-sans">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Property Location
              </div>
              {properties.map(prop => (
                <button
                  key={prop}
                  onClick={() => {
                    onPropertyChange(prop);
                    setShowPropertyDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    selectedProperty === prop ? 'font-semibold text-teal-800 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{prop}</span>
                  {selectedProperty === prop && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            id="btn-user-profile-role"
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowPropertyDropdown(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Arun K."
              className="w-7 h-7 rounded-full object-cover ring-2 ring-teal-700/20"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">Arun K.</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {userRole === 'Manager' ? 'Facility Manager' : userRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 font-sans">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Arun Kadam</p>
                <p className="text-[11px] text-slate-500">arun.ops@resortdesk.ai</p>
              </div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Switch Role Mode
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    userRole === r ? 'font-semibold text-teal-800 bg-teal-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r}</span>
                  </div>
                  {userRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
