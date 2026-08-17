import React from 'react';
import { 
  Send, 
  CheckCheck, 
  Eye, 
  CornerUpLeft, 
  Zap, 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Filter
} from 'lucide-react';

interface WhatsAppKPIHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onCreateAutomation: () => void;
  onViewAllAutomations: () => void;
  kpiData: {
    messagesSent: number;
    messagesSentGrowth: number;
    deliveryRate: number;
    deliveryRateGrowth: number;
    readRate: number;
    readRateGrowth: number;
    responseRate: number;
    responseRateGrowth: number;
    activeAutomations: number;
  };
}

export default function WhatsAppKPIHeader({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  onCreateAutomation,
  onViewAllAutomations,
  kpiData
}: WhatsAppKPIHeaderProps) {
  const [showDateMenu, setShowDateMenu] = React.useState(false);
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  return (
    <div id="whatsapp-header-section" className="flex flex-col gap-6 mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
            WhatsApp Automation
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Automate guest communication throughout their entire stay.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="whatsapp-search-input"
              type="text"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              id="whatsapp-date-filter-btn"
              onClick={() => {
                setShowDateMenu(!showDateMenu);
                setShowStatusMenu(false);
              }}
              className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateFilter === 'all' ? 'Date' : dateFilter}</span>
            </button>

            {showDateMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {['All Time', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setDateFilter(period);
                      setShowDateMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      dateFilter === period 
                        ? 'bg-teal-50 text-teal-900 font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              id="whatsapp-status-filter-btn"
              onClick={() => {
                setShowStatusMenu(!showStatusMenu);
                setShowDateMenu(false);
              }}
              className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{statusFilter === 'all' ? 'Status' : statusFilter}</span>
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                {['All Statuses', 'Active Only', 'Drafts', 'Paused'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st === 'All Statuses' ? 'all' : st);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      (statusFilter === st || (statusFilter === 'all' && st === 'All Statuses'))
                        ? 'bg-teal-50 text-teal-900 font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Automation Primary Button */}
          <button
            id="whatsapp-create-automation-btn"
            onClick={onCreateAutomation}
            className="flex items-center gap-2 bg-[#0d3b37] hover:bg-[#092b28] text-white rounded-full px-5 py-2 text-sm font-medium transition-all shadow-sm hover:shadow-md cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Messages Sent */}
        <div id="kpi-messages-sent" className="bg-slate-100/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-600">Messages Sent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {kpiData.messagesSent.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              ↑ {kpiData.messagesSentGrowth}%
            </span>
          </div>
        </div>

        {/* Card 2: Delivery Rate */}
        <div id="kpi-delivery-rate" className="bg-slate-100/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-600">Delivery Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {kpiData.deliveryRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              ↑ {kpiData.deliveryRateGrowth}%
            </span>
          </div>
        </div>

        {/* Card 3: Read Rate */}
        <div id="kpi-read-rate" className="bg-slate-100/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-600">Read Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {kpiData.readRate}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              ↑ {kpiData.readRateGrowth}%
            </span>
          </div>
        </div>

        {/* Card 4: Response Rate */}
        <div id="kpi-response-rate" className="bg-slate-100/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <CornerUpLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-600">Response Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {kpiData.responseRate}%
            </span>
            <span className="inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-md">
              -
            </span>
          </div>
        </div>

        {/* Card 5: Active Automations (Dark Green Card) */}
        <div 
          id="kpi-active-automations" 
          onClick={onViewAllAutomations}
          className="bg-[#0f3833] text-white rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:bg-[#0a2824] transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Zap className="w-3.5 h-3.5 fill-emerald-300" />
            <span className="text-xs font-medium text-emerald-100">Active Automations</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-white font-sans tracking-tight">
              {kpiData.activeAutomations}
            </span>
            <span className="text-xs font-medium text-emerald-200/90 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
