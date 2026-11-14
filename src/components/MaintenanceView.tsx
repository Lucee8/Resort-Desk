import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, Sparkles } from 'lucide-react';
import {
  MaintenanceTicket,
  Technician,
  MaintenanceUserRole,
  PredictiveMaintenanceAlert,
  RecentlyResolvedMaintenance,
  MaintenanceStatus,
  MaintenancePriority,
  RoomUnit,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  closeMaintenanceTicketAtomic,
  saveMaintenanceTicketAtomic,
  subscribeCollection,
  upsertCollectionDoc,
} from '../services/resortDataService';
import { formatShortDate, getTodayISO } from '../utils/bookingUtils';

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

interface MaintenanceViewProps {
  tickets: MaintenanceTicket[];
  rooms?: RoomUnit[];
  initialFilter?: 'all' | 'high_priority' | 'unassigned' | 'completed';
  navigationKey?: number;
  triggerToast: (msg: string) => void;
}

export default function MaintenanceView({
  tickets,
  rooms = [],
  initialFilter,
  navigationKey,
  triggerToast,
}: MaintenanceViewProps) {
  const { user, firestoreStatus } = useAuth();
  const operatorName =
    user?.displayName || user?.email?.split('@')[0] || 'Mykonos Staff';

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveMaintenanceAlert[]>([]);
  const [recentlyResolved, setRecentlyResolved] = useState<RecentlyResolvedMaintenance[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'all');
  const [userRole, setUserRole] = useState<MaintenanceUserRole>('Manager');
  const [selectedProperty, setSelectedProperty] = useState(
    'Mykonos Cottage (All Cottages)'
  );

  useEffect(() => {
    if (navigationKey === undefined) return;
    setActiveFilter(initialFilter || 'all');
    setSearchQuery('');
  }, [navigationKey, initialFilter]);

  useEffect(() => {
    if (firestoreStatus === 'permission-denied') return;
    const unsubTechs = subscribeCollection<Technician>('technicians', setTechnicians);
    const unsubAlerts = subscribeCollection<PredictiveMaintenanceAlert>(
      'predictiveAlerts',
      setPredictiveAlerts
    );
    const unsubResolved = subscribeCollection<RecentlyResolvedMaintenance>(
      'recentlyResolvedMaintenance',
      setRecentlyResolved
    );
    return () => {
      unsubTechs();
      unsubAlerts();
      unsubResolved();
    };
  }, [firestoreStatus]);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
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
  const [radioNote, setRadioNote] = useState('');

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  // Derived real metrics from live Firestore tickets & rooms
  const activeCount = tickets.filter((t) => t.status !== 'Closed').length;
  const highPriorityCount = tickets.filter(
    (t) =>
      (t.priority === 'Emergency' || t.priority === 'High') && t.status !== 'Closed'
  ).length;
  const pendingAssignmentCount = tickets.filter(
    (t) => !t.assignedTechnicianName && t.status !== 'Closed'
  ).length;
  const completedCount = tickets.filter(
    (t) => t.status === 'Closed' || t.status === 'Resolved'
  ).length;
  const efficiencyRate =
    tickets.length > 0 ? Math.round((completedCount / tickets.length) * 100) : 100;

  const blockedRoomsList = tickets.filter(
    (t) => t.isRoomBlocked && t.status !== 'Closed'
  );
  const blockedRoomsCount = blockedRoomsList.length;

  const readinessRate = useMemo(() => {
    if (rooms.length === 0) return 100;
    const ready = rooms.filter((r) => r.status !== 'Maintenance').length;
    return Math.round((ready / rooms.length) * 100);
  }, [rooms]);

  const notificationsCount = tickets.filter(
    (t) =>
      t.status !== 'Closed' &&
      (t.priority === 'Emergency' ||
        t.priority === 'High' ||
        t.isRoomBlocked ||
        !t.assignedTechnicianName)
  ).length;

  const handleOpenTicket = (ticket: MaintenanceTicket) => {
    setSelectedTicketId(ticket.id);
    setIsTicketDrawerOpen(true);
  };

  const handleOpenTicketById = (ticketId: string) => {
    const found = tickets.find((t) => t.id === ticketId);
    if (found) handleOpenTicket(found);
  };

  const handleOpenTechProfile = (tech: Technician) => {
    setSelectedTech(tech);
    setIsTechProfileOpen(true);
  };

  const handleRegisterTicket = async (newTicket: MaintenanceTicket) => {
    try {
      await saveMaintenanceTicketAtomic(newTicket, rooms);
      if (newTicket.assignedTechnicianId) {
        const tech = technicians.find((t) => t.id === newTicket.assignedTechnicianId);
        if (tech) {
          await upsertCollectionDoc('technicians', {
            ...tech,
            activeTicketsCount: tech.activeTicketsCount + 1,
            status: 'Busy',
          });
        }
      }
      triggerToast(`Work order ${newTicket.id} saved to Firestore.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to create work order.'
      );
      throw err;
    }
  };

  const handleUpdateTicket = async (updated: MaintenanceTicket) => {
    try {
      await saveMaintenanceTicketAtomic(updated, rooms);
      triggerToast(`Work order ${updated.id} updated in Firestore.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update work order.'
      );
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const newResolvedItem: RecentlyResolvedMaintenance = {
      id: `res-${Date.now()}`,
      title: `${target.title.split('-')[0].trim()} Fixed`,
      roomNumber: target.roomNumber,
      technicianName: target.assignedTechnicianName || operatorName,
      technicianAvatar:
        target.assignedTechnicianAvatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      completedAgo: `Resolved ${formatShortDate(getTodayISO())}`,
      resolutionTime: target.actualResolutionTime || '35m',
      verificationStatus: 'Verified',
    };

    const assignedTech = target.assignedTechnicianId
      ? technicians.find((t) => t.id === target.assignedTechnicianId)
      : undefined;

    const updatedTechnician = assignedTech
      ? {
          ...assignedTech,
          activeTicketsCount: Math.max(0, assignedTech.activeTicketsCount - 1),
          completedTicketsCount: assignedTech.completedTicketsCount + 1,
          status:
            assignedTech.activeTicketsCount - 1 <= 0
              ? ('Available' as const)
              : ('Busy' as const),
        }
      : undefined;

    try {
      await closeMaintenanceTicketAtomic(
        target,
        newResolvedItem,
        tickets,
        rooms,
        updatedTechnician
      );
      triggerToast(
        `Ticket ${ticketId} closed & cottage released in Rooms / Bookings.`
      );
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to close ticket.'
      );
    }
  };

  const handleAssignTechnician = async (ticketId: string, tech: Technician) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const updatedTicket: MaintenanceTicket = {
      ...target,
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.name,
      assignedTechnicianAvatar: tech.avatar,
      assignedDepartment: tech.department,
      status: target.status === 'Reported' ? 'Assigned' : target.status,
      timeline: [
        ...target.timeline,
        {
          id: `tm-${Date.now()}`,
          title: `Assigned to ${tech.name}`,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          author: operatorName,
          note: `${tech.department} specialist assigned`,
          done: true,
        },
      ],
    };

    try {
      await saveMaintenanceTicketAtomic(updatedTicket, rooms);
      await upsertCollectionDoc('technicians', {
        ...tech,
        activeTicketsCount: tech.activeTicketsCount + 1,
        status: 'Busy',
      });
      triggerToast(`Assigned ${ticketId} to ${tech.name}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to assign technician.'
      );
    }
  };

  const handleChangeStatus = async (ticketId: string, status: MaintenanceStatus) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    try {
      await saveMaintenanceTicketAtomic({ ...target, status }, rooms);
      triggerToast(`Ticket ${ticketId} status set to ${status}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update status.'
      );
    }
  };

  const handleChangePriority = async (
    ticketId: string,
    priority: MaintenancePriority
  ) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    try {
      await saveMaintenanceTicketAtomic({ ...target, priority }, rooms);
      triggerToast(`Ticket ${ticketId} priority set to ${priority}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to update priority.'
      );
    }
  };

  const handleUnblockRoom = async (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;
    try {
      await closeMaintenanceTicketAtomic(
        target,
        {
          id: `res-${Date.now()}`,
          title: `${target.title} (Room Unblocked)`,
          roomNumber: target.roomNumber,
          technicianName: target.assignedTechnicianName || operatorName,
          technicianAvatar:
            target.assignedTechnicianAvatar ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          completedAgo: formatShortDate(getTodayISO()),
          resolutionTime: target.actualResolutionTime || '30m',
          verificationStatus: 'Verified',
        },
        tickets,
        rooms
      );
      triggerToast(`${target.roomNumber} unblocked and released to Available.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to unblock cottage.'
      );
    }
  };

  const handleSyncWithFrontDesk = () => {
    triggerToast(
      `PMS Inventory Check: ${readinessRate}% of Mykonos cottages (${rooms.filter((r) => r.status !== 'Maintenance').length}/${rooms.length}) are clear of maintenance blocks.`
    );
  };

  const handleCreatePreventiveTicket = async (alert: PredictiveMaintenanceAlert) => {
    const defaultTech = technicians.find((t) => t.status === 'Available') || technicians[0];
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newTkt: MaintenanceTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      title: `Preventive: ${alert.issuePrediction}`,
      category: alert.category,
      description: `Preventive Check: ${alert.reason}. Recommended action: ${alert.recommendedAction}. Equipment: ${alert.equipment}`,
      roomNumber: alert.roomNumber,
      area: alert.equipment,
      priority: alert.riskScore >= 80 ? 'High' : 'Medium',
      status: defaultTech ? 'Assigned' : 'Reported',
      reportedBy: `${operatorName} (Preventive Alert)`,
      reportedDate: `Today, ${formatShortDate(getTodayISO())}`,
      reportedTime: nowTime,
      assignedTechnicianId: defaultTech?.id,
      assignedTechnicianName: defaultTech?.name,
      assignedTechnicianAvatar: defaultTech?.avatar,
      assignedDepartment: defaultTech?.department,
      estimatedCompletionTime: '1 hour',
      isRoomBlocked: false,
      cost: { parts: 1200, labor: 400, vendor: 0, total: 1600 },
      attachments: [],
      timeline: [
        {
          id: `tm-${Date.now()}`,
          title: 'Preventive Alert Converted to Ticket',
          time: nowTime,
          author: operatorName,
          note: `Risk Score: ${alert.riskScore}%`,
          done: true,
        },
      ],
      parts: [
        {
          id: `p-${Date.now()}`,
          name: 'Preventive Service Kit',
          quantity: 1,
          cost: 1200,
          status: 'In Stock',
        },
      ],
    };

    try {
      await saveMaintenanceTicketAtomic(newTkt, rooms);
      triggerToast(`Preventive work order created for ${alert.roomNumber}.`);
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : 'Failed to create preventive ticket.'
      );
    }
  };

  const visibleTickets = useMemo(() => {
    if (activeFilter === 'high_priority') {
      return tickets.filter(
        (t) =>
          (t.priority === 'Emergency' || t.priority === 'High') &&
          t.status !== 'Closed'
      );
    }
    if (activeFilter === 'unassigned') {
      return tickets.filter(
        (t) => !t.assignedTechnicianName && t.status !== 'Closed'
      );
    }
    if (activeFilter === 'completed') {
      return tickets.filter(
        (t) => t.status === 'Resolved' || t.status === 'Closed'
      );
    }
    return tickets;
  }, [tickets, activeFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-16 rounded-3xl overflow-x-hidden border border-slate-200/70">
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
        notificationsCount={notificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessages={() => {
          setRadioNote('');
          setIsRadioOpen(true);
        }}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
            <span className="font-bold text-teal-800">Operational View:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
              {userRole === 'Manager' ? 'Facility Manager Console' : `${userRole} Mode`}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Zone: <strong>{selectedProperty}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-800" />
              <span>Analytics &amp; Costs</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>AI Copilot</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#9c4424] hover:bg-[#85391d] shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Complaint</span>
            </button>
          </div>
        </div>

        <MaintenanceKpis
          activeCount={activeCount}
          highPriorityCount={highPriorityCount}
          pendingAssignmentCount={pendingAssignmentCount}
          completedThisWeekCount={completedCount}
          efficiencyRate={efficiencyRate}
          onFilterClick={(type) => {
            setActiveFilter(type);
            setSearchQuery('');
          }}
          activeFilter={activeFilter}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <TicketsTable
              tickets={visibleTickets}
              technicians={technicians}
              onOpenTicketDetails={handleOpenTicket}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onAssignTechnician={(id, tech) => void handleAssignTechnician(id, tech)}
              onChangeStatus={(id, st) => void handleChangeStatus(id, st)}
              onChangePriority={(id, pr) => void handleChangePriority(id, pr)}
              onCloseTicket={(id) => void handleCloseTicket(id)}
              searchFilter={searchQuery}
            />

            <PredictiveMaintenanceSection
              alerts={predictiveAlerts}
              onCreatePreventiveTicket={(alert) => void handleCreatePreventiveTicket(alert)}
            />

            <RecentlyResolvedSection
              items={recentlyResolved}
              onOpenItem={(item) => {
                triggerToast(
                  `${item.roomNumber} resolved by ${item.technicianName} (${item.resolutionTime}).`
                );
              }}
            />
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 min-w-0">
            <InventoryStatusCard
              readinessRate={readinessRate}
              blockedRoomsCount={blockedRoomsCount}
              onSyncWithFrontDesk={handleSyncWithFrontDesk}
              onViewBlockedRooms={() => setIsBlockedRoomsModalOpen(true)}
            />

            <AvailableTechniciansPanel
              technicians={technicians}
              onSelectTechnician={handleOpenTechProfile}
              onScheduleVendor={() => setIsVendorModalOpen(true)}
              onCallTechnician={(tech) => {
                setRadioNote(`@${tech.name} (${tech.phone}): Please report status.`);
                setIsRadioOpen(true);
              }}
              onMessageTechnician={(tech) => {
                setRadioNote(`@${tech.name}: `);
                setIsRadioOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterTicket}
        technicians={technicians}
        rooms={rooms}
      />

      <TicketDetailDrawer
        ticket={selectedTicket}
        isOpen={isTicketDrawerOpen}
        onClose={() => {
          setIsTicketDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        technicians={technicians}
        onUpdateTicket={handleUpdateTicket}
        onCloseTicket={handleCloseTicket}
        onOpenRadio={(techName) => {
          if (techName) setRadioNote(`@${techName} (${selectedTicket?.roomNumber || ''}): `);
          setIsRadioOpen(true);
        }}
        onNotify={triggerToast}
      />

      <TechnicianProfileModal
        technician={selectedTech}
        isOpen={isTechProfileOpen}
        onClose={() => {
          setIsTechProfileOpen(false);
          setSelectedTech(null);
        }}
        assignedTickets={tickets.filter(
          (t) => t.assignedTechnicianId === selectedTech?.id && t.status !== 'Closed'
        )}
        onOpenTicket={handleOpenTicket}
        onPingTechnician={(tech) => {
          setRadioNote(`@${tech.name}: `);
          setIsRadioOpen(true);
        }}
      />

      <AIMaintenanceAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        tickets={tickets}
        technicians={technicians}
        predictiveAlerts={predictiveAlerts}
        onAssignTicket={handleAssignTechnician}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      <MaintenanceAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        tickets={tickets}
      />

      <BlockedRoomsModal
        isOpen={isBlockedRoomsModalOpen}
        onClose={() => setIsBlockedRoomsModalOpen(false)}
        blockedTickets={blockedRoomsList}
        onUnblockRoom={(id) => void handleUnblockRoom(id)}
        onOpenTicket={handleOpenTicket}
      />

      <ScheduleVendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onVendorScheduled={(details) => {
          void upsertCollectionDoc('maintenanceVendors', {
            id: `vendor-${Date.now()}`,
            ...details,
            createdAt: new Date().toISOString(),
          })
            .then(() =>
              triggerToast(
                `Vendor scheduled: ${details.vendorName} on ${details.scheduledDate}`
              )
            )
            .catch((err) =>
              triggerToast(
                err instanceof Error ? err.message : 'Failed to schedule vendor.'
              )
            );
        }}
      />

      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        tickets={tickets}
        onOpenTicketById={handleOpenTicketById}
      />

      <StaffRadioDrawer
        isOpen={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
        technicians={technicians}
        initialNote={radioNote}
      />
    </div>
  );
}
