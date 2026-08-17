import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  FileText, 
  Plus, 
  Sparkles, 
  Boxes, 
  Truck, 
  Users, 
  BarChart3, 
  ClipboardCheck, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { InventoryUserRole } from '../../types';

interface InventoryHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userRole: InventoryUserRole;
  onRoleChange: (role: InventoryUserRole) => void;
  onOpenLogPurchase: () => void;
  onOpenAddItem: () => void;
  onOpenSuppliers: () => void;
  onOpenPurchaseOrders: () => void;
  onOpenAnalytics: () => void;
  onOpenAudit: () => void;
  onOpenAICopilot: () => void;
  onOpenAlerts: () => void;
  alertCount: number;
}

export default function InventoryHeader({
  searchQuery,
  onSearchChange,
  userRole,
  onRoleChange,
  onOpenLogPurchase,
  onOpenAddItem,
  onOpenSuppliers,
  onOpenPurchaseOrders,
  onOpenAnalytics,
  onOpenAudit,
  onOpenAICopilot,
  onOpenAlerts,
  alertCount
}: InventoryHeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: InventoryUserRole[] = [
    'Reception Desk' as unknown as InventoryUserRole,
    'Resort Owner',
    'Manager',
    'Storekeeper',
    'Housekeeping',
    'Restaurant Staff',
    'Accountant'
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar matching reference: Konkan PMS | Search bar | Notification | Message | User profile */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Konkan PMS
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[11px] font-semibold rounded-full border border-teal-200">
            Supplies & Stock v2.0
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Search Bar matching reference */}
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-global-search-input"
              type="text"
              placeholder="Search inventory items, SKU, suppliers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full pl-10 pr-4 py-2 border border-slate-200 focus:border-teal-700 focus:outline-none transition-all"
            />
          </div>

          {/* Notifications Icon with Badge */}
          <div className="relative">
            <button
              id="inventory-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inventory Notifications</h4>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                    {alertCount} Active
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs py-1">
                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Critical Stock: Surface Disinfectant</p>
                      <p className="text-[11px] text-slate-500">Only 2 cans remaining in Chemical Bunker.</p>
                      <span className="text-[10px] text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Low Stock: Premium Hand Wash</p>
                      <p className="text-[11px] text-slate-500">12 liters left (Min: 25L). Reorder recommended.</p>
                      <span className="text-[10px] text-slate-400">4 hours ago</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Delivery Received: PO-2023-118</p>
                      <p className="text-[11px] text-slate-500">80 luxury towels from Oceanic Textiles received.</p>
                      <span className="text-[10px] text-slate-400">Oct 18</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onOpenAlerts();
                  }}
                  className="w-full mt-2 py-1.5 text-center text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                >
                  View All Alerts ({alertCount})
                </button>
              </div>
            )}
          </div>

          {/* Quick AI Assistant Icon */}
          <button
            id="inventory-ai-copilot-quick-btn"
            onClick={onOpenAICopilot}
            className="p-2 text-teal-800 hover:bg-teal-50 rounded-full transition-colors cursor-pointer"
            title="Inventory AI Copilot"
          >
            <Sparkles className="w-5 h-5 text-teal-700" />
          </button>

          {/* Role Switcher / User Profile matching reference */}
          <div className="relative">
            <button
              id="inventory-user-role-menu-btn"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                alt="User Avatar"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-700/30"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {userRole}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Konkan Staff
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Active Role
                  </span>
                </div>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                      userRole === role 
                        ? 'bg-teal-50 text-teal-900 font-bold' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{role}</span>
                    {userRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Section Header: Operational Supplies + Top-right actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Operational Supplies
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage and track your resort&apos;s essential stock levels.
          </p>
        </div>

        {/* Top-Right Action Buttons matching reference */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Log Purchase Button */}
          <button
            id="inventory-log-purchase-btn"
            onClick={onOpenLogPurchase}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm hover:border-slate-400 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Log Purchase</span>
          </button>

          {/* Add New Item Button */}
          <button
            id="inventory-add-item-btn"
            onClick={onOpenAddItem}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-semibold rounded-xl shadow-md shadow-teal-950/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 overflow-x-auto pb-1">
        <button
          onClick={onOpenPurchaseOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5 text-slate-500" />
          <span>Purchase Orders</span>
        </button>

        <button
          onClick={onOpenSuppliers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Suppliers Directory</span>
        </button>

        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Valuation & Analytics</span>
        </button>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Physical Audit</span>
        </button>

        <button
          onClick={onOpenAICopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200/80 hover:bg-teal-100 transition-colors ml-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>AI Intelligence</span>
        </button>
      </div>
    </div>
  );
}
