import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  MoreVertical, 
  Eye, 
  Edit3, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowUpDown
} from 'lucide-react';
import { MaintenanceTicket, MaintenancePriority, MaintenanceStatus, MaintenanceCategory, Technician } from '../../types';

interface TicketsTableProps {
  tickets: MaintenanceTicket[];
  technicians: Technician[];
  onOpenTicketDetails: (ticket: MaintenanceTicket) => void;
  onOpenRegisterModal: () => void;
  onAssignTechnician: (ticketId: string, tech: Technician) => void;
  onChangeStatus: (ticketId: string, status: MaintenanceStatus) => void;
  onChangePriority: (ticketId: string, priority: MaintenancePriority) => void;
  onCloseTicket: (ticketId: string) => void;
  searchFilter: string;
}

export default function TicketsTable({
  tickets,
  technicians,
  onOpenTicketDetails,
  onOpenRegisterModal,
  onAssignTechnician,
  onChangeStatus,
  onChangePriority,
  onCloseTicket,
  searchFilter
}: TicketsTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('All');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'room'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const priorityOrder: Record<MaintenancePriority, number> = {
    'Emergency': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    // Search match
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchText = (
        ticket.title.toLowerCase().includes(q) ||
        ticket.roomNumber.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q) ||
        (ticket.assignedTechnicianName && ticket.assignedTechnicianName.toLowerCase().includes(q)) ||
        ticket.reportedBy.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    if (selectedCategory !== 'All' && ticket.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && ticket.priority !== selectedPriority) return false;
    if (selectedStatus !== 'All' && ticket.status !== selectedStatus) return false;
    if (selectedTechnician !== 'All') {
      if (selectedTechnician === 'Unassigned' && ticket.assignedTechnicianName) return false;
      if (selectedTechnician !== 'Unassigned' && ticket.assignedTechnicianName !== selectedTechnician) return false;
    }

    return true;
  });

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return sortOrder === 'desc' ? diff : -diff;
    }
    if (sortBy === 'room') {
      return sortOrder === 'desc' 
        ? b.roomNumber.localeCompare(a.roomNumber)
        : a.roomNumber.localeCompare(b.roomNumber);
    }
    return 0;
  });

  const displayedTickets = showAllTickets ? sortedTickets : sortedTickets.slice(0, 5);

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'Emergency':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-100/80 text-rose-800 border border-rose-200">
            EMERGENCY
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-orange-100/90 text-orange-800 border border-orange-200">
            HIGH
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100/80 text-amber-800 border border-amber-200">
            MEDIUM
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
            LOW
          </span>
        );
    }
  };

  const getStatusDisplay = (status: MaintenanceStatus) => {
    switch (status) {
      case 'In Progress':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>In Progress</span>
          </div>
        );
      case 'Waiting for Parts':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>Awaiting Parts</span>
          </div>
        );
      case 'Reported':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Reported</span>
          </div>
        );
      case 'Assigned':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assigned</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </div>
        );
      case 'Closed':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Closed</span>
          </div>
        );
    }
  };

  const categories = ['All', 'HVAC', 'Plumbing', 'Electrical', 'Civil/Structural', 'Door & Lock', 'Internet/Wi-Fi', 'Appliance', 'Other'];
  const priorities = ['All', 'Emergency', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Reported', 'Assigned', 'In Progress', 'Waiting for Parts', 'Resolved', 'Closed'];

  return (
    <div 
      id="section-current-maintenance-tickets"
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden font-sans"
    >
      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Current Maintenance Tickets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {sortedTickets.length} active work orders across resort villas & facilities
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filters Toggle Button */}
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFiltersPanel || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All'
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(selectedCategory !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            )}
          </button>

          {/* Register Complaint Button (Matches Reference Image style) */}
          <button
            id="btn-register-complaint"
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#9c4424] hover:bg-[#85391d] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#9c4424]/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register Complaint</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Bar */}
      {showFiltersPanel && (
        <div className="bg-slate-50/90 p-4 border-b border-slate-200/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Priority:
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Technician:
            </span>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="All">All Technicians</option>
              <option value="Unassigned">Unassigned Only</option>
              {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriority('All');
                setSelectedStatus('All');
                setSelectedTechnician('All');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6 font-semibold">Issue & Room</th>
              <th className="py-3.5 px-4 font-semibold">Priority</th>
              <th className="py-3.5 px-4 font-semibold">Reported</th>
              <th className="py-3.5 px-4 font-semibold">Assigned To</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  No maintenance tickets found matching the specified criteria.
                </td>
              </tr>
            ) : (
              displayedTickets.map((ticket) => (
                <tr 
                  key={ticket.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onOpenTicketDetails(ticket)}
                >
                  {/* Issue & Room */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                          {ticket.title}
                        </span>
                        {ticket.isRoomBlocked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Blocked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">{ticket.roomNumber}</span>
                        {ticket.area && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[11px] truncate max-w-[160px]">{ticket.area}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getPriorityBadge(ticket.priority)}
                  </td>

                  {/* Reported */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-xs text-slate-800 font-semibold leading-tight">
                      {ticket.reportedTime}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {ticket.reportedDate}
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {ticket.assignedTechnicianName ? (
                      <div className="flex items-center gap-2">
                        {ticket.assignedTechnicianAvatar ? (
                          <img
                            src={ticket.assignedTechnicianAvatar}
                            alt={ticket.assignedTechnicianName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                            {ticket.assignedTechnicianName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-800">
                          {ticket.assignedTechnicianName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs italic text-slate-400">
                          Unassigned
                        </span>
                        <button
                          onClick={() => {
                            if (technicians.length > 0) {
                              onAssignTechnician(ticket.id, technicians[0]);
                            }
                          }}
                          className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-[10px] font-bold transition-colors"
                        >
                          + Assign
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStatusDisplay(ticket.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === ticket.id ? null : ticket.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === ticket.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 text-left">
                          <button
                            onClick={() => {
                              onOpenTicketDetails(ticket);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View Full Ticket
                          </button>
                          <button
                            onClick={() => {
                              onChangeStatus(ticket.id, ticket.status === 'In Progress' ? 'Resolved' : 'In Progress');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                            {ticket.status === 'In Progress' ? 'Mark Resolved' : 'Set In Progress'}
                          </button>
                          <button
                            onClick={() => {
                              onChangePriority(ticket.id, ticket.priority === 'Emergency' ? 'High' : 'Emergency');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            {ticket.priority === 'Emergency' ? 'Lower to High' : 'Escalate Emergency'}
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => {
                              onCloseTicket(ticket.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                            Close & Verify
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination button matching screenshot */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center">
        <button
          id="btn-view-all-tickets"
          onClick={() => setShowAllTickets(!showAllTickets)}
          className="text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors inline-flex items-center gap-1 cursor-pointer py-1 px-3 rounded-lg hover:bg-teal-50"
        >
          <span>{showAllTickets ? 'Collapse to top 5 tickets' : `View all ${tickets.length} active tickets`}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllTickets ? '-rotate-90' : 'rotate-90'}`} />
        </button>
      </div>
    </div>
  );
}
