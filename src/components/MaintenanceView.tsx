import React, { useState } from 'react';
import { 
  Plus, 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Building2,
  Wrench,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { 
  MaintenanceTicket, 
  Technician, 
  MaintenanceUserRole, 
  PredictiveMaintenanceAlert, 
  RecentlyResolvedMaintenance,
  MaintenanceStatus,
  MaintenancePriority
} from '../types';
import { 
  initialMaintenanceTickets, 
  initialTechnicians, 
  initialPredictiveAlerts, 
  initialRecentlyResolved 
} from '../data';

import MaintenanceHeader from './maintenance/MaintenanceHeader';
import MaintenanceKpis from './maintenance/MaintenanceKpis';
import InventoryStatusCard from './maintenance/InventoryStatusCard';
import AvailableTechniciansPanel from './maintenance/AvailableTechniciansPanel';
import TicketsTable from './maintenance/TicketsTable';
import RecentlyResolvedSection from './maintenance/RecentlyResolvedSection';
import PredictiveMaintenanceSection from './maintenance/PredictiveMaintenanceSection';
import RegisterComplaintModal from './maintenance/RegisterComplaintModal';
import TicketDetailDrawer from './maintenance/TicketDetailDrawer';
import TechnicianProfileModal from './maintenance/TechnicianProfileModal';
import AIMaintenanceAssistant from './maintenance/AIMaintenanceAssistant';
import MaintenanceAnalyticsModal from './maintenance/MaintenanceAnalyticsModal';
import BlockedRoomsModal from './maintenance/BlockedRoomsModal';
import ScheduleVendorModal from './maintenance/ScheduleVendorModal';
import NotificationsDropdown from './maintenance/NotificationsDropdown';
import StaffRadioDrawer from './maintenance/StaffRadioDrawer';

export default function MaintenanceView() {
  // State
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets);
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveMaintenanceAlert[]>(initialPredictiveAlerts);
  const [recentlyResolved, setRecentlyResolved] = useState<RecentlyResolvedMaintenance[]>(initialRecentlyResolved);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [userRole, setUserRole] = useState<MaintenanceUserRole>('Manager');
  const [selectedProperty, setSelectedProperty] = useState('Konkan Retreat (Main)');

  // Modals / Drawers state
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [isTechProfileOpen, setIsTechProfileOpen] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isBlockedRoomsModalOpen, setIsBlockedRoomsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  // Sync state notification
  const [pmsSyncToast, setPmsSyncToast] = useState<string | null>(null);

  // Calculate Metrics
  const activeCount = tickets.filter(t => t.status !== 'Closed').length;
  const highPriorityCount = tickets.filter(t => (t.priority === 'Emergency' || t.priority === 'High') && t.status !== 'Closed').length;
  const pendingAssignmentCount = tickets.filter(t => !t.assignedTechnicianName && t.status !== 'Closed').length;
  const completedThisWeekCount = 42;
  const efficiencyRate = 85;
  const blockedRoomsList = tickets.filter(t => t.isRoomBlocked && t.status !== 'Closed');
  const blockedRoomsCount = blockedRoomsList.length;

  // Handlers
  const handleOpenTicket = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDrawerOpen(true);
  };

  const handleOpenTicketById = (ticketId: string) => {
    const found = tickets.find(t => t.id === ticketId);
    if (found) {
      handleOpenTicket(found);
    }
  };

  const handleOpenTechProfile = (tech: Technician) => {
    setSelectedTech(tech);
    setIsTechProfileOpen(true);
  };

  const handleRegisterTicket = (newTicket: MaintenanceTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    // If assigned to a technician, update their workload count
    if (newTicket.assignedTechnicianId) {
      setTechnicians(prev => prev.map(tech => 
        tech.id === newTicket.assignedTechnicianId
          ? { ...tech, activeTicketsCount: tech.activeTicketsCount + 1, status: 'Busy' }
          : tech
      ));
    }
    showToast(`Work order ${newTicket.id} registered successfully.`);
  };

  const handleUpdateTicket = (updated: MaintenanceTicket) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTicket(updated);
  };

  const handleCloseTicket = (ticketId: string) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;

    // Add to recently resolved
    const newResolvedItem: RecentlyResolvedMaintenance = {
      id: `res-${Date.now()}`,
      title: `${target.title.split('-')[0].trim()} Fixed`,
      roomNumber: target.roomNumber,
      technicianName: target.assignedTechnicianName || 'Staff Technician',
      technicianAvatar: target.assignedTechnicianAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      completedAgo: 'Just now',
      resolutionTime: target.actualResolutionTime || '35m',
      verificationStatus: 'Verified'
    };

    setRecentlyResolved(prev => [newResolvedItem, ...prev.slice(0, 3)]);

    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, status: 'Closed', isRoomBlocked: false }
        : t
    ));

    // Reduce technician workload count
    if (target.assignedTechnicianId) {
      setTechnicians(prev => prev.map(tech => 
        tech.id === target.assignedTechnicianId
          ? { 
              ...tech, 
              activeTicketsCount: Math.max(0, tech.activeTicketsCount - 1),
              completedTicketsCount: tech.completedTicketsCount + 1,
              status: tech.activeTicketsCount - 1 === 0 ? 'Available' : 'Busy'
            }
          : tech
      ));
    }

    showToast(`Ticket ${ticketId} verified & closed. Room unblocked in Front Desk PMS.`);
  };

  const handleAssignTechnician = (ticketId: string, tech: Technician) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedTechnicianId: tech.id,
          assignedTechnicianName: tech.name,
          assignedTechnicianAvatar: tech.avatar,
          assignedDepartment: tech.department,
          status: 'Assigned',
          timeline: [
            ...t.timeline,
            {
              id: `tm-${Date.now()}`,
              title: `Assigned to ${tech.name}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              author: 'Arun K. (Ops Manager)',
              note: `${tech.department} specialist assigned`,
              done: true
            }
          ]
        };
      }
      return t;
    }));

    setTechnicians(prev => prev.map(t => 
      t.id === tech.id 
        ? { ...t, activeTicketsCount: t.activeTicketsCount + 1, status: 'Busy' }
        : t
    ));

    showToast(`Assigned to ${tech.name}.`);
  };

  const handleChangeStatus = (ticketId: string, status: MaintenanceStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    showToast(`Status updated to ${status}.`);
  };

  const handleChangePriority = (ticketId: string, priority: MaintenancePriority) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority } : t));
    showToast(`Priority updated to ${priority}.`);
  };

  const handleUnblockRoom = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, isRoomBlocked: false } : t));
    showToast(`Room unblocked and released to PMS.`);
  };

  const handleSyncWithFrontDesk = () => {
    showToast('PMS Synced: 92% room inventory ready for arrivals today.');
  };

  const handleCreatePreventiveTicket = (alert: PredictiveMaintenanceAlert) => {
    const newTkt: MaintenanceTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Preventive: ${alert.issuePrediction}`,
      category: alert.category,
      description: `AI Predictive Sensor Diagnostic: ${alert.reason}. Recommendation: ${alert.recommendedAction}. Equipment: ${alert.equipment}`,
      roomNumber: alert.roomNumber,
      area: alert.equipment,
      priority: alert.riskScore >= 80 ? 'High' : 'Medium',
      status: 'Assigned',
      reportedBy: 'AI Predictive Telemetry',
      reportedDate: 'Today, Oct 24',
      reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedTechnicianName: 'Rajesh Malik',
      assignedDepartment: 'General Maintenance & HVAC',
      estimatedCompletionTime: '1 hour',
      isRoomBlocked: false,
      cost: { parts: 1500, labor: 400, vendor: 0, total: 1900 },
      attachments: [],
      timeline: [
        {
          id: `tm-${Date.now()}`,
          title: 'Predictive Alert Triggered Ticket',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: 'ResortDesk AI Engine',
          note: `Risk Score: ${alert.riskScore}%`,
          done: true
        }
      ],
      parts: [
        {
          id: `p-${Date.now()}`,
          name: 'Preventive Service Kit',
          quantity: 1,
          cost: 1500,
          status: 'In Stock'
        }
      ]
    };

    setTickets(prev => [newTkt, ...prev]);
    showToast(`Preventive work order created for ${alert.roomNumber}.`);
  };

  const showToast = (msg: string) => {
    setPmsSyncToast(msg);
    setTimeout(() => {
      setPmsSyncToast(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-16">
      {/* Toast Notification */}
      {pmsSyncToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{pmsSyncToast}</span>
        </div>
      )}

      {/* 1. Header (Sticky) */}
      <MaintenanceHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        blockedRoomsCount={blockedRoomsCount}
        onOpenBlockedRooms={() => setIsBlockedRoomsModalOpen(true)}
        onOpenAI={() => setIsAIAssistantOpen(true)}
        userRole={userRole}
        onRoleChange={setUserRole}
        selectedProperty={selectedProperty}
        onPropertyChange={setSelectedProperty}
        notificationsCount={2}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessages={() => setIsRadioOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Quick Operational Sub-Bar */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span className="font-bold text-teal-800">Operational View:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
              {userRole === 'Manager' ? 'Facility Manager Console' : `${userRole} Mode`}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Property: <strong>{selectedProperty}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-800" />
              <span>Analytics & Costs</span>
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>AI Copilot</span>
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#9c4424] hover:bg-[#85391d] shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register Complaint</span>
            </button>
          </div>
        </div>

        {/* 2. KPI Cards (4 Cards Matching Reference Screenshot) */}
        <MaintenanceKpis
          activeCount={activeCount}
          highPriorityCount={highPriorityCount}
          pendingAssignmentCount={pendingAssignmentCount}
          completedThisWeekCount={completedThisWeekCount}
          efficiencyRate={efficiencyRate}
          onFilterClick={(type) => {
            if (type === 'high_priority') setSearchQuery('Emergency');
            else if (type === 'unassigned') setSearchQuery('Unassigned');
            else setSearchQuery('');
          }}
          activeFilter={activeFilter}
        />

        {/* 3. Main Two-Column Layout (Matching Screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Tickets Table + Predictive Insights + Recently Resolved (Col 1-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Current Maintenance Tickets Table */}
            <TicketsTable
              tickets={tickets}
              technicians={technicians}
              onOpenTicketDetails={handleOpenTicket}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onAssignTechnician={handleAssignTechnician}
              onChangeStatus={handleChangeStatus}
              onChangePriority={handleChangePriority}
              onCloseTicket={handleCloseTicket}
              searchFilter={searchQuery}
            />

            {/* AI Predictive Maintenance Section */}
            <PredictiveMaintenanceSection
              alerts={predictiveAlerts}
              onCreatePreventiveTicket={handleCreatePreventiveTicket}
            />

            {/* Recently Resolved Cards */}
            <RecentlyResolvedSection
              items={recentlyResolved}
              onOpenItem={(item) => {
                showToast(`Inspecting historical resolution for ${item.roomNumber}`);
              }}
            />

          </div>

          {/* RIGHT COLUMN: Inventory Status + Available Technicians (Col 9-12) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Inventory Status Dark Teal Card */}
            <InventoryStatusCard
              readinessRate={92}
              blockedRoomsCount={blockedRoomsCount}
              onSyncWithFrontDesk={handleSyncWithFrontDesk}
              onViewBlockedRooms={() => setIsBlockedRoomsModalOpen(true)}
            />

            {/* Available Technicians Panel with Workload Progress */}
            <AvailableTechniciansPanel
              technicians={technicians}
              onSelectTechnician={handleOpenTechProfile}
              onScheduleVendor={() => setIsVendorModalOpen(true)}
              onCallTechnician={(tech) => alert(`Connecting to ${tech.name} on staff radio...`)}
              onMessageTechnician={(tech) => {
                setIsRadioOpen(true);
              }}
            />

          </div>

        </div>

      </main>

      {/* MODALS & DRAWERS */}
      
      {/* Register Complaint Modal */}
      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterTicket}
        technicians={technicians}
      />

      {/* Ticket Details Slide-Over Drawer */}
      <TicketDetailDrawer
        ticket={selectedTicket}
        isOpen={isTicketDrawerOpen}
        onClose={() => {
          setIsTicketDrawerOpen(false);
          setSelectedTicket(null);
        }}
        technicians={technicians}
        onUpdateTicket={handleUpdateTicket}
        onCloseTicket={handleCloseTicket}
      />

      {/* Technician Profile Modal */}
      <TechnicianProfileModal
        technician={selectedTech}
        isOpen={isTechProfileOpen}
        onClose={() => {
          setIsTechProfileOpen(false);
          setSelectedTech(null);
        }}
        assignedTickets={tickets.filter(t => t.assignedTechnicianId === selectedTech?.id && t.status !== 'Closed')}
        onOpenTicket={handleOpenTicket}
      />

      {/* AI Maintenance Copilot */}
      <AIMaintenanceAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        tickets={tickets}
        technicians={technicians}
        predictiveAlerts={predictiveAlerts}
        onAssignTicket={handleAssignTechnician}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      {/* Analytics & Cost Tracking Modal */}
      <MaintenanceAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        tickets={tickets}
      />

      {/* Blocked Rooms Inspection Modal */}
      <BlockedRoomsModal
        isOpen={isBlockedRoomsModalOpen}
        onClose={() => setIsBlockedRoomsModalOpen(false)}
        blockedTickets={blockedRoomsList}
        onUnblockRoom={handleUnblockRoom}
        onOpenTicket={handleOpenTicket}
      />

      {/* Schedule External Vendor Modal */}
      <ScheduleVendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onVendorScheduled={(details) => {
          showToast(`Vendor scheduled: ${details.vendorName} on ${details.scheduledDate}`);
        }}
      />

      {/* Notifications Drawer */}
      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenTicketById={handleOpenTicketById}
      />

      {/* Staff Radio & Dispatch Chat Drawer */}
      <StaffRadioDrawer
        isOpen={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
        technicians={technicians}
      />

    </div>
  );
}
