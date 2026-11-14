import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Brush,
  X,
  Layers,
  ShieldAlert,
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardHeader, { OperationalHeaderAlert } from './components/DashboardHeader';
import StatsGrid from './components/StatsGrid';
import TodayOperationsSection, { OperationsNavigationOptions } from './components/TodayOperationsSection';
import ArrivalsCard from './components/ArrivalsCard';
import DeparturesCard from './components/DeparturesCard';
import OccupancyChart from './components/OccupancyChart';
import PendingPaymentsCard from './components/PendingPaymentsCard';
import PulseCard from './components/PulseCard';
import AIDeskCard from './components/AIDeskCard';
import BookingsView from './components/BookingsView';
import RoomsView from './components/RoomsView';
import GuestsCRMView from './components/GuestsCRMView';
import HousekeepingView from './components/HousekeepingView';
import MaintenanceView from './components/MaintenanceView';
import InventoryView from './components/InventoryView';
import StaffManagementView from './components/StaffManagementView';
import ReviewsManagementView from './components/ReviewsManagementView';
import WhatsAppAutomationView from './components/WhatsAppAutomationView';
import BillingView from './components/billing/BillingView';
import SettingsView from './components/settings/SettingsView';
import NewReservationModal from './components/bookings/NewReservationModal';
import StaffAuthModal from './components/auth/StaffAuthModal';

import { useAuth } from './context/AuthContext';
import { resortDetails } from './data';
import { initialSettingsData } from './data/settingsData';

import {
  subscribeBookings,
  subscribeRooms,
  subscribeGuests,
  createReservationAtomic,
  checkInBookingInFirestore,
  checkOutBookingInFirestore,
  recordBookingPaymentAtomic,
  updateRoomStatusInFirestore,
} from './services/bookingsService';

import {
  subscribeCollection,
  upsertCollectionDoc,
  subscribeBlockedDays,
  saveBlockedDays,
  createOrMergeGuestCRM,
  saveHousekeepingTaskAndSyncRoom,
  batchUpdateHousekeepingTasks,
  subscribeResortSettings,
  saveResortSettings,
  subscribeNotificationsReadState,
  markNotificationsReadInFirestore,
  seedAllMykonosCollections,
} from './services/resortDataService';

import {
  addDaysISO,
  diffNights,
  formatFullDate,
  formatShortDate,
  getTodayISO,
  isBookingOccupyingDate,
  parseISODate,
  resolveBookingDatesISO,
} from './utils/bookingUtils';

import {
  Arrival,
  Departure,
  HousekeepingTask,
  MaintenanceAlert,
  MaintenanceTicket,
  Booking,
  RoomCategory,
  PropertyAmenity,
  RoomUnit,
  GuestCRM,
  BillingInvoice,
  InventoryItem,
  StaffMember,
  StaffLeaveRequest,
  ReviewItem,
  WhatsAppMessageLog,
  ResortDeskSettings,
  OccupancyDay,
  ResortStats,
} from './types';

export default function App() {
  const { user, firestoreStatus, firestoreMessage, openAuthModal, recheckFirestore } = useAuth();

  // Navigation & mobile drawer state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Deep navigation filter states
  const [navFilterKey, setNavFilterKey] = useState<number>(0);
  const [bookingsNavFilter, setBookingsNavFilter] = useState<{ status?: string; search?: string }>({});
  const [housekeepingNavFilter, setHousekeepingNavFilter] = useState<
    'All' | 'Urgent' | 'Unassigned' | 'Assigned'
  >('All');
  const [maintenanceNavFilter, setMaintenanceNavFilter] = useState<
    'all' | 'high_priority' | 'unassigned' | 'completed'
  >('all');
  const [billingNavFilter, setBillingNavFilter] = useState<string>('ALL');

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Firestore states
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<RoomUnit[]>([]);
  const [guestsCRM, setGuestsCRM] = useState<GuestCRM[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<PropertyAmenity[]>([]);
  const [blockedDays, setBlockedDays] = useState<number[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [staffLeaveRequests, setStaffLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppMessageLog[]>([]);
  const [settings, setSettings] = useState<ResortDeskSettings>(initialSettingsData);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Modal toggle states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showAiActionModal, setShowAiActionModal] = useState(false);
  const [isCollectingBilling, setIsCollectingBilling] = useState(false);
  const [isDispatchingAi, setIsDispatchingAi] = useState(false);

  // Toast banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected billing detail for dashboard quick collection modal
  const [billingDetail, setBillingDetail] = useState<{
    name: string;
    amount: number;
    roomNumber?: string;
    bookingId?: string;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Subscribe to Firestore collections when connected
  useEffect(() => {
    if (firestoreStatus === 'checking') {
      setDataLoading(true);
      return;
    }
    if (firestoreStatus !== 'connected') {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setFirestoreError(null);
    let initialLoaded = 0;
    const markOneLoaded = () => {
      initialLoaded += 1;
      if (initialLoaded >= 3) {
        setDataLoading(false);
      }
    };

    const handleSubError = (err: Error) => {
      setFirestoreError(err.message);
      setDataLoading(false);
    };

    const unsubs = [
      subscribeBookings(
        (list) => {
          setBookings(list);
          markOneLoaded();
        },
        handleSubError
      ),
      subscribeRooms(
        (list) => {
          setRooms(list);
          markOneLoaded();
        },
        handleSubError
      ),
      subscribeGuests(
        (list) => {
          setGuestsCRM(list);
          markOneLoaded();
        },
        handleSubError
      ),
      subscribeCollection<HousekeepingTask>('housekeepingTasks', setHousekeeping, handleSubError),
      subscribeCollection<MaintenanceTicket>('maintenanceTickets', setMaintenanceTickets, handleSubError),
      subscribeCollection<RoomCategory>('roomCategories', setCategories, handleSubError),
      subscribeCollection<PropertyAmenity>('propertyAmenities', setPropertyAmenities, handleSubError),
      subscribeBlockedDays(setBlockedDays, handleSubError),
      subscribeCollection<BillingInvoice>('invoices', setInvoices, handleSubError),
      subscribeCollection<InventoryItem>('inventoryItems', setInventoryItems, handleSubError),
      subscribeCollection<StaffMember>('staffMembers', setStaffMembers, handleSubError),
      subscribeCollection<StaffLeaveRequest>('staffLeaveRequests', setStaffLeaveRequests, handleSubError),
      subscribeCollection<ReviewItem>('reviews', setReviews, handleSubError),
      subscribeCollection<WhatsAppMessageLog>('whatsappLogs', setWhatsappLogs, handleSubError),
      subscribeResortSettings(setSettings, handleSubError),
      subscribeNotificationsReadState(setReadNotificationIds),
    ];

    const fallbackTimer = setTimeout(() => setDataLoading(false), 1800);
    return () => {
      clearTimeout(fallbackTimer);
      unsubs.forEach((u) => u());
    };
  }, [firestoreStatus]);

  // Seed Mykonos starter dataset on explicit click
  const handleSeedStarterDataset = async () => {
    setSeeding(true);
    try {
      await seedAllMykonosCollections();
      await recheckFirestore();
      triggerToast('Mykonos Cottage starter dataset initialized in Firestore.');
    } catch (err: any) {
      triggerToast(err?.message || 'Unable to initialize starter dataset in Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  // Navigate to module with optional pre-applied filter/search
  const navigateToModule = (tab: string, options?: OperationsNavigationOptions) => {
    if (tab === 'bookings') {
      setBookingsNavFilter({
        status: options?.bookingsStatus || 'All',
        search: options?.bookingsSearch || '',
      });
    } else if (tab === 'housekeeping') {
      setHousekeepingNavFilter(options?.housekeepingFilter || 'All');
    } else if (tab === 'maintenance') {
      setMaintenanceNavFilter(options?.maintenanceFilter || 'all');
    } else if (tab === 'billing') {
      setBillingNavFilter(options?.billingFilter || 'ALL');
    }
    setNavFilterKey((prev) => prev + 1);
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const todayISO = getTodayISO();

  // Room categories synchronized with live RoomUnits count when available
  const syncedCategories = useMemo(() => {
    if (rooms.length === 0) return categories;
    return categories.map((cat) => {
      const matchedCount = rooms.filter(
        (r) => r.categoryName.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return matchedCount > 0 ? { ...cat, activeCount: matchedCount } : cat;
    });
  }, [categories, rooms]);

  const totalRooms = useMemo(() => {
    if (rooms.length > 0) return rooms.length;
    return categories.reduce((sum, cat) => sum + cat.activeCount, 0);
  }, [rooms, categories]);

  // Today's occupancy derived strictly from active non-cancelled, non-checked-out bookings overlapping today
  const occupiedRoomsCount = useMemo(() => {
    const occupiedRoomKeys = new Set<string>();
    bookings.forEach((b) => {
      if (isBookingOccupyingDate(b, todayISO)) {
        occupiedRoomKeys.add(b.roomId || b.roomNumber);
      }
    });
    return Math.min(totalRooms || occupiedRoomKeys.size, occupiedRoomKeys.size);
  }, [bookings, todayISO, totalRooms]);

  const occupancyRate = useMemo(() => {
    if (totalRooms <= 0) return 0;
    return Math.min(100, Math.round((occupiedRoomsCount / totalRooms) * 100));
  }, [occupiedRoomsCount, totalRooms]);

  const vacantRoomsCount = Math.max(0, totalRooms - occupiedRoomsCount);

  // Derive Today's Arrivals from Firestore bookings
  const arrivals: Arrival[] = useMemo(() => {
    return bookings
      .filter((b) => {
        if (b.bookingStatus === 'Cancelled') return false;
        const { checkInISO } = resolveBookingDatesISO(b);
        return checkInISO === todayISO;
      })
      .map((b) => {
        const adv = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
        const bal = Math.max(0, b.balanceDue ?? b.amount - adv);
        const arrivalStatus: Arrival['status'] =
          b.bookingStatus === 'Checked-in' || b.bookingStatus === 'Checked-out'
            ? 'Checked In'
            : b.arrivalTime
            ? 'Arriving'
            : 'Expected';
        return {
          id: b.id,
          guestName: b.guestName,
          roomNumber: b.roomNumber.replace(/^(Cottage|Villa|Suite|Room)\s+/i, ''),
          status: arrivalStatus,
          avatar:
            b.avatar ||
            b.guestName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          phone: b.guestPhone,
          checkInTime: b.arrivalTime || settings.profile.checkInTime || '02:00 PM',
          bookingStatus: b.bookingStatus === 'Pending' ? 'Tentative' : 'Confirmed',
          paymentStatus: bal === 0 ? 'Paid' : adv > 0 ? 'Partial' : 'Pending',
          amountDue: bal,
          nights: b.nights,
          bookingId: b.id,
        };
      });
  }, [bookings, todayISO, settings.profile.checkInTime]);

  // Derive Today's Departures from Firestore bookings
  const departures: Departure[] = useMemo(() => {
    return bookings
      .filter((b) => {
        if (b.bookingStatus === 'Cancelled') return false;
        const { checkOutISO } = resolveBookingDatesISO(b);
        return checkOutISO === todayISO;
      })
      .map((b) => {
        const adv = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
        const bal = Math.max(0, b.balanceDue ?? b.amount - adv);
        const isCheckedOut = b.bookingStatus === 'Checked-out';
        return {
          id: b.id,
          guestName: b.guestName,
          roomNumber: b.roomNumber.replace(/^(Cottage|Villa|Suite|Room)\s+/i, ''),
          status: isCheckedOut ? 'Checked Out' : bal > 0 ? 'Pending' : 'Scheduled',
          avatar:
            b.avatar ||
            b.guestName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          checkoutTime: b.checkoutTime || settings.profile.checkOutTime || '11:00 AM',
          amountDue: bal,
          bookingStatus: isCheckedOut ? 'Completed' : 'Active',
          paymentStatus: bal === 0 ? 'Paid' : 'Due',
          bookingId: b.id,
        };
      });
  }, [bookings, todayISO, settings.profile.checkOutTime]);

  // Derive Revenue & Pending Balances without double counting between invoices & bookings
  const { totalCollectedRevenue, totalPendingPayments, unconfirmedBookingsCount } = useMemo(() => {
    const invoicedBookingIds = new Set<string>();
    let collectedSum = 0;
    let pendingSum = 0;

    invoices.forEach((inv) => {
      if (inv.bookingId) invoicedBookingIds.add(inv.bookingId);
      if (inv.status !== 'Refunded') {
        collectedSum += Number(inv.paidAmount) || 0;
        pendingSum += Number(inv.dueAmount) || 0;
      }
    });

    let unconfirmedCount = 0;
    bookings.forEach((b) => {
      if (b.bookingStatus === 'Pending') unconfirmedCount += 1;
      if (b.bookingStatus === 'Cancelled') return;
      const matchesInvoice =
        invoicedBookingIds.has(b.id) || (b.bookingCode ? invoicedBookingIds.has(b.bookingCode) : false);
      if (!matchesInvoice) {
        const adv = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
        const bal = Math.max(0, b.balanceDue ?? b.amount - adv);
        collectedSum += adv;
        pendingSum += bal;
      }
    });

    return {
      totalCollectedRevenue: Math.round(collectedSum),
      totalPendingPayments: Math.round(pendingSum),
      unconfirmedBookingsCount: unconfirmedCount,
    };
  }, [invoices, bookings]);

  // 7-day trailing occupancy computed directly from bookings vs totalRooms
  const occupancyHistory: OccupancyDay[] = useMemo(() => {
    const days: OccupancyDay[] = [];
    for (let offset = -6; offset <= 0; offset += 1) {
      const iso = addDaysISO(todayISO, offset);
      const dateObj = parseISODate(iso);
      const dayLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
      const activeForDay = bookings.filter((b) => isBookingOccupyingDate(b, iso));
      const uniqueRooms = new Set(activeForDay.map((b) => b.roomId || b.roomNumber)).size;
      const rate = totalRooms > 0 ? Math.min(100, Math.round((uniqueRooms / totalRooms) * 100)) : 0;
      days.push({
        day: dayLabel,
        rate,
        bookings: activeForDay.length,
      });
    }
    return days;
  }, [bookings, todayISO, totalRooms]);

  const stats: ResortStats = useMemo(
    () => ({
      occupancyRate,
      occupancyGrowth: 0,
      revenue: totalCollectedRevenue,
      revenueGrowth: 0,
      arrivalsTodayCount: arrivals.length,
      departuresTodayCount: departures.length,
      pendingPaymentsAmount: totalPendingPayments,
    }),
    [occupancyRate, totalCollectedRevenue, arrivals.length, departures.length, totalPendingPayments]
  );

  // Operational counts
  const checkedInArrivalsCount = useMemo(
    () => arrivals.filter((a) => a.status === 'Checked In').length,
    [arrivals]
  );
  const earliestPendingArrival = useMemo(
    () => arrivals.find((a) => a.status !== 'Checked In')?.checkInTime,
    [arrivals]
  );
  const clearedDeparturesCount = useMemo(
    () => departures.filter((d) => d.status === 'Checked Out').length,
    [departures]
  );
  const pendingDeparturesWithBalance = useMemo(
    () => departures.filter((d) => d.status !== 'Checked Out' && (d.amountDue || 0) > 0),
    [departures]
  );

  const pendingHousekeepingCount = useMemo(
    () => housekeeping.filter((h) => h.status !== 'Verified').length,
    [housekeeping]
  );
  const urgentHousekeepingCount = useMemo(
    () => housekeeping.filter((h) => h.status !== 'Verified' && h.priority === 'Urgent').length,
    [housekeeping]
  );
  const unassignedHousekeepingCount = useMemo(
    () => housekeeping.filter((h) => h.status !== 'Verified' && !h.assignedTo).length,
    [housekeeping]
  );

  // Single canonical source for Maintenance across Dashboard, Sidebar, Housekeeping & Rooms
  const canonicalMaintenanceAlerts: MaintenanceAlert[] = useMemo(() => {
    return maintenanceTickets.map((t) => ({
      id: t.id,
      roomNumber: t.roomNumber,
      title: t.title,
      priority: t.priority === 'Emergency' || t.priority === 'High' ? 'High' : t.priority === 'Medium' ? 'Medium' : 'Low',
      status: t.status === 'Closed' || t.status === 'Resolved' ? 'Resolved' : t.status === 'In Progress' ? 'In Progress' : 'Open',
    }));
  }, [maintenanceTickets]);

  const openMaintenanceList = useMemo(
    () => canonicalMaintenanceAlerts.filter((m) => m.status !== 'Resolved'),
    [canonicalMaintenanceAlerts]
  );
  const openMaintenanceCount = openMaintenanceList.length;
  const highPriorityMaintenanceCount = useMemo(
    () => openMaintenanceList.filter((m) => m.priority === 'High').length,
    [openMaintenanceList]
  );
  const topMaintenanceLabel = openMaintenanceList[0]
    ? `${openMaintenanceList[0].roomNumber}: ${openMaintenanceList[0].title}`
    : undefined;

  // Sidebar badge counts derived strictly from Firestore collections
  const inventoryAlertCount = useMemo(
    () =>
      inventoryItems.filter(
        (i) => i.safetyLevel === 'Low' || i.safetyLevel === 'Critical' || i.safetyLevel === 'Out of Stock'
      ).length,
    [inventoryItems]
  );
  const staffAlertCount = useMemo(
    () => staffLeaveRequests.filter((l) => l.status === 'Pending').length,
    [staffLeaveRequests]
  );
  const reviewsAlertCount = useMemo(
    () => reviews.filter((r) => r.status === 'Unreplied' || r.sentiment === 'Negative').length,
    [reviews]
  );
  const whatsappPendingCount = useMemo(
    () => whatsappLogs.filter((w) => w.status === 'Failed').length,
    [whatsappLogs]
  );

  // Dynamic operational alerts for DashboardHeader
  const operationalAlerts: OperationalHeaderAlert[] = useMemo(() => {
    const list: OperationalHeaderAlert[] = [];
    housekeeping
      .filter((h) => h.status === 'Pending' && h.priority === 'Urgent')
      .slice(0, 2)
      .forEach((h) => {
        const id = `alert-hk-${h.id}`;
        list.push({
          id,
          text: `${h.roomNumber} (${h.type}) urgent turnover pending`,
          time: h.completionTime || 'Housekeeping Queue',
          unread: !readNotificationIds.includes(id),
          tab: 'housekeeping',
        });
      });

    arrivals
      .filter((a) => a.status !== 'Checked In')
      .slice(0, 2)
      .forEach((a) => {
        const id = `alert-arr-${a.id}`;
        list.push({
          id,
          text: `Arrival: ${a.guestName} (Cottage ${a.roomNumber}) at ${a.checkInTime}`,
          time: 'Today Check-In',
          unread: !readNotificationIds.includes(id),
          tab: 'bookings',
        });
      });

    maintenanceTickets
      .filter((m) => m.status !== 'Closed' && (m.priority === 'Emergency' || m.priority === 'High'))
      .slice(0, 2)
      .forEach((m) => {
        const id = `alert-mt-${m.id}`;
        list.push({
          id,
          text: `${m.title} in ${m.roomNumber} (${m.priority})`,
          time: m.reportedTime || 'Maintenance',
          unread: !readNotificationIds.includes(id),
          tab: 'maintenance',
        });
      });

    return list;
  }, [housekeeping, arrivals, maintenanceTickets, readNotificationIds]);

  const unreadNotificationsCount = useMemo(
    () => operationalAlerts.filter((a) => a.unread).length,
    [operationalAlerts]
  );

  // Handler: ArrivalsCard inline quick arrival -> persists as real Firestore Booking
  const handleAddArrival = async (newArr: Omit<Arrival, 'id' | 'avatar'>) => {
    if (firestoreStatus !== 'connected') {
      openAuthModal();
      triggerToast('Sign in to add arrivals to Firestore.');
      return;
    }

    const cleanedRoomNo = newArr.roomNumber.trim().toLowerCase();
    const matchedRoom =
      rooms.find(
        (r) =>
          r.roomNumber.toLowerCase() === cleanedRoomNo ||
          r.roomName.toLowerCase().includes(cleanedRoomNo)
      ) || rooms[0];

    if (!matchedRoom) {
      triggerToast('No cottage units configured in Firestore yet. Initialize rooms first.');
      return;
    }

    const checkInISO = todayISO;
    const checkOutISO = addDaysISO(todayISO, 1);
    const total = Math.round(matchedRoom.ratePerNight * 1.12);
    const adv = newArr.paymentStatus === 'Paid' ? total : newArr.paymentStatus === 'Partial' ? Math.round(total * 0.5) : 0;

    const bookingPayload: Booking = {
      id: `bk-${Date.now()}`,
      guestName: newArr.guestName.trim(),
      guestEmail: '',
      guestPhone: newArr.phone || '',
      roomId: matchedRoom.id,
      roomNumber: matchedRoom.roomName,
      roomType: matchedRoom.subtitle,
      roomCategory: matchedRoom.categoryName,
      checkInDateISO: checkInISO,
      checkOutDateISO: checkOutISO,
      startDate: formatShortDate(checkInISO),
      endDate: formatShortDate(checkOutISO),
      nights: 1,
      adults: 2,
      children: 0,
      mealPlan: 'Room Only',
      source: 'Direct Walk-in / Phone',
      arrivalTime: newArr.checkInTime || '02:00 PM',
      checkoutTime: settings.profile.checkOutTime || '11:00 AM',
      amount: total,
      advancePaid: adv,
      balanceDue: Math.max(0, total - adv),
      bookingStatus: 'Confirmed',
      paymentStatus: adv >= total ? 'Paid' : adv > 0 ? 'Partial' : 'Unpaid',
      avatar: newArr.guestName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      membership: 'Regular Guest',
      totalSpend: total,
      avgDailyRate: matchedRoom.ratePerNight,
      notes: ['Scheduled via Dashboard Quick Arrival form.'],
      preferences: [],
      stayHistory: [],
      invoice: {
        invoiceNumber: `${settings.billingGst.invoicePrefix.replace(/\/$/, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: formatFullDate(checkInISO),
        items: [
          {
            description: `${matchedRoom.roomName} (${matchedRoom.categoryName})`,
            qty: 1,
            price: matchedRoom.ratePerNight,
            amount: matchedRoom.ratePerNight,
          },
        ],
        subtotal: matchedRoom.ratePerNight,
        cgst: Math.round((total - matchedRoom.ratePerNight) / 2),
        sgst: total - matchedRoom.ratePerNight - Math.round((total - matchedRoom.ratePerNight) / 2),
        total,
      },
    };

    try {
      await createReservationAtomic(bookingPayload, matchedRoom);
      triggerToast(`Booking created in Firestore for ${newArr.guestName} (${matchedRoom.roomName}).`);
    } catch (err: any) {
      triggerToast(err?.message || 'Could not save arrival booking.');
    }
  };

  // Handler: Guest Check-In Action -> Firestore
  const handleCheckInGuest = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;
    try {
      await checkInBookingInFirestore(targetBooking);
      triggerToast(`Checked In: ${targetBooking.guestName} (${targetBooking.roomNumber}).`);
    } catch (err: any) {
      triggerToast(err?.message || 'Check-in failed.');
    }
  };

  // Handler: Guest Check-Out Action -> Firestore + auto housekeeping task
  const handleCheckOutGuest = async (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;
    try {
      await checkOutBookingInFirestore(targetBooking);
      triggerToast(`Checked Out: ${targetBooking.guestName}. Housekeeping turnover queued.`);
    } catch (err: any) {
      triggerToast(err?.message || 'Check-out failed.');
    }
  };

  // Handler: AI Assistant Housekeeping Queue Dispatch -> Firestore
  const confirmAiHousekeepingClean = async () => {
    const targets = housekeeping.filter(
      (t) => t.status === 'Pending' || t.status === 'In Progress'
    );
    if (targets.length === 0) {
      setShowAiActionModal(false);
      return;
    }
    setIsDispatchingAi(true);
    try {
      const updated = targets.map((task) => ({
        ...task,
        status: 'Cleaned' as const,
        assignedTo: task.assignedTo || staffMembers[0]?.name || 'Ramesh Singh',
      }));
      await batchUpdateHousekeepingTasks(updated);
      triggerToast(`${updated.length} housekeeping room turnovers marked Cleaned in Firestore.`);
      setShowAiActionModal(false);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed updating housekeeping tasks.');
    } finally {
      setIsDispatchingAi(false);
    }
  };

  // Handler: Review guest bill from Pending Payments / Departures
  const handleReviewBilling = (name: string, amount: number) => {
    const matchedBooking = bookings.find(
      (b) =>
        b.bookingStatus !== 'Cancelled' &&
        b.guestName.toLowerCase() === name.toLowerCase() &&
        (b.balanceDue ?? 0) > 0
    );
    setBillingDetail({
      name,
      amount: matchedBooking?.balanceDue ?? amount,
      roomNumber: matchedBooking?.roomNumber || 'Pending Folios',
      bookingId: matchedBooking?.id,
    });
    setShowBillingModal(true);
  };

  const handleConfirmDashboardCollection = async () => {
    if (!billingDetail) return;
    const booking = billingDetail.bookingId
      ? bookings.find((b) => b.id === billingDetail.bookingId)
      : undefined;

    if (!booking) {
      setShowBillingModal(false);
      setBillingDetail(null);
      navigateToModule('billing', { billingFilter: 'Pending' });
      return;
    }

    setIsCollectingBilling(true);
    try {
      await recordBookingPaymentAtomic(
        booking.id,
        billingDetail.amount,
        'UPI / GPay',
        `DESK-${Date.now().toString().slice(-6)}`,
        'Settlement'
      );
      triggerToast(
        `Collected ₹${billingDetail.amount.toLocaleString('en-IN')} for ${booking.guestName}.`
      );
      setShowBillingModal(false);
      setBillingDetail(null);
    } catch (err: any) {
      triggerToast(err?.message || 'Payment collection failed.');
    } finally {
      setIsCollectingBilling(false);
    }
  };

  const handleClearNotifications = async () => {
    const allIds = operationalAlerts.map((a) => a.id);
    if (allIds.length === 0) return;
    setReadNotificationIds(allIds);
    try {
      await markNotificationsReadInFirestore(allIds);
      triggerToast('All notifications marked as read.');
    } catch {
      // local read state already updated
    }
  };

  // Filter Dashboard arrivals & departures by top search query
  const filteredArrivals = useMemo(() => {
    if (!searchQuery) return arrivals;
    const q = searchQuery.toLowerCase();
    return arrivals.filter(
      (arr) => arr.guestName.toLowerCase().includes(q) || arr.roomNumber.toLowerCase().includes(q)
    );
  }, [arrivals, searchQuery]);

  const filteredDepartures = useMemo(() => {
    if (!searchQuery) return departures;
    const q = searchQuery.toLowerCase();
    return departures.filter(
      (dep) => dep.guestName.toLowerCase().includes(q) || dep.roomNumber.toLowerCase().includes(q)
    );
  }, [departures, searchQuery]);

  const showEmptyStarterBanner =
    firestoreStatus === 'connected' && !dataLoading && rooms.length === 0 && bookings.length === 0;

  return (
    <div
      id="resortdesk-container"
      className="flex h-screen bg-slate-100 overflow-hidden text-slate-800 font-sans"
    >
      {/* Toast banner notifications */}
      {toastMessage && (
        <div
          id="toast-banner"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-950 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl border border-teal-800 flex items-center gap-2 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToModule(tab)}
        branding={settings.profile.propertyName || resortDetails.branding}
        housekeepingCount={pendingHousekeepingCount}
        maintenanceCount={openMaintenanceCount}
        inventoryAlertCount={inventoryAlertCount}
        staffAlertCount={staffAlertCount}
        reviewsAlertCount={reviewsAlertCount}
        whatsappCount={whatsappPendingCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationsCount={unreadNotificationsCount}
          alerts={operationalAlerts}
          onAlertClick={(tab) => {
            if (tab) navigateToModule(tab);
          }}
          onClearNotifications={handleClearNotifications}
          onOpenSettings={() => navigateToModule('settings')}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          propertyName={settings.profile.propertyName || resortDetails.name}
          propertyLocation={`${settings.profile.city || 'Tarkarli'}, Malvan`}
          firestoreStatus={firestoreStatus}
          staffLabel={user ? user.displayName || user.email?.split('@')[0] || 'Staff' : null}
          onOpenAuthModal={openAuthModal}
        />

        {/* Dynamic Navigation Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* Global Firestore Permission / Error Banners */}
          {firestoreStatus === 'permission-denied' && (
            <div className="max-w-7xl mx-auto mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    Staff Authentication Required for Cloud Firestore (`resortdesk-mykonos`)
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {firestoreMessage ||
                      'Firestore security rules require an authenticated staff session to read and write property records.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAuthModal}
                className="px-4 py-2 bg-teal-900 hover:bg-teal-950 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
              >
                Staff Sign In
              </button>
            </div>
          )}

          {firestoreError && firestoreStatus === 'connected' && (
            <div className="max-w-7xl mx-auto mb-5 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Firestore listener error: {firestoreError}</span>
              </div>
              <button
                type="button"
                onClick={() => void recheckFirestore()}
                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {showEmptyStarterBanner && (
            <div className="max-w-7xl mx-auto mb-5 bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Database className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-teal-950">
                    Firestore Connected — Mykonos Cottage Database is Currently Empty
                  </p>
                  <p className="text-[11px] text-teal-800 mt-0.5">
                    Initialize the 7 cottages (101–105, Villa 201, Suite 301), sample reservations, housekeeping, maintenance, staff, inventory &amp; settings collections.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={seeding}
                onClick={() => void handleSeedStarterDataset()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <span>Initialize Starter Data</span>
                )}
              </button>
            </div>
          )}

          {activeTab === 'dashboard' ? (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              {/* Morning Overview Banner Title */}
              <div
                id="dashboard-title-area"
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-2"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-teal-950 tracking-tight leading-none">
                    Morning Overview
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-2 font-medium">
                    Daily front-desk &amp; property summary for{' '}
                    <span className="font-bold text-teal-800">
                      {settings.profile.propertyName || resortDetails.name}
                    </span>
                    , {settings.profile.city || 'Tarkarli'}, {settings.profile.state || 'Maharashtra'}.
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                    firestoreStatus === 'connected'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  {dataLoading
                    ? 'Connecting to Firestore...'
                    : firestoreStatus === 'connected'
                    ? `Live Firestore • ${bookings.length} Bookings`
                    : 'Sign in required for Firestore'}
                </span>
              </div>

              {/* 4 Clickable Stat Cards Row */}
              <StatsGrid
                stats={stats}
                totalRooms={totalRooms}
                checkedInArrivals={checkedInArrivalsCount}
                clearedDepartures={clearedDeparturesCount}
                earliestPendingArrival={earliestPendingArrival}
                onNavigateTab={(tab) => navigateToModule(tab)}
              />

              {/* Compact Today's Operations Hub */}
              <TodayOperationsSection
                pendingHousekeepingCount={pendingHousekeepingCount}
                urgentHousekeepingCount={urgentHousekeepingCount}
                openMaintenanceCount={openMaintenanceCount}
                highPriorityMaintenanceCount={highPriorityMaintenanceCount}
                topMaintenanceLabel={topMaintenanceLabel}
                pendingPaymentsAmount={stats.pendingPaymentsAmount}
                pendingPaymentsGuestsCount={pendingDeparturesWithBalance.length}
                unassignedRoomsCount={unassignedHousekeepingCount}
                vacantRoomsCount={vacantRoomsCount}
                unconfirmedBookingsCount={unconfirmedBookingsCount}
                onNavigateModule={navigateToModule}
                isLiveFirestore={firestoreStatus === 'connected'}
              />

              {/* Lower Section Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                  <ArrivalsCard
                    arrivals={filteredArrivals}
                    onAddArrival={(newArr) => {
                      void handleAddArrival(newArr);
                    }}
                    onCheckIn={(id) => {
                      void handleCheckInGuest(id);
                    }}
                    onViewBooking={(guestName) =>
                      navigateToModule('bookings', { bookingsSearch: guestName })
                    }
                    onNavigateToBookings={() => navigateToModule('bookings')}
                  />

                  <DeparturesCard
                    departures={filteredDepartures}
                    onCheckOut={(id) => {
                      void handleCheckOutGuest(id);
                    }}
                    onReviewBilling={(name, amt) => handleReviewBilling(name, amt)}
                    onViewBooking={(guestName) =>
                      navigateToModule('bookings', { bookingsSearch: guestName })
                    }
                    onNavigateToBookings={() => navigateToModule('bookings')}
                  />
                </div>

                <div className="flex flex-col gap-6 min-w-0">
                  <OccupancyChart
                    history={occupancyHistory}
                    totalRooms={totalRooms}
                    isLiveFirestore={firestoreStatus === 'connected'}
                  />

                  <PendingPaymentsCard
                    amount={stats.pendingPaymentsAmount}
                    onReview={() => {
                      const firstDue = pendingDeparturesWithBalance[0];
                      if (firstDue && firstDue.amountDue) {
                        handleReviewBilling(firstDue.guestName, firstDue.amountDue);
                      } else {
                        navigateToModule('billing', { billingFilter: 'Pending' });
                      }
                    }}
                  />

                  <AIDeskCard
                    arrivals={arrivals}
                    departures={departures}
                    housekeeping={housekeeping}
                    maintenance={canonicalMaintenanceAlerts}
                    bookings={bookings}
                    onTakeAction={() => setShowAiActionModal(true)}
                    onNewBookingClick={() => setShowBookingModal(true)}
                    onNavigateModule={navigateToModule}
                    onReviewBilling={(name, amt) => handleReviewBilling(name, amt)}
                  />
                </div>
              </div>

              <PulseCard
                propertyName={settings.profile.propertyName || resortDetails.name}
                location={`${settings.profile.city || 'Tarkarli'}, Malvan`}
                address={settings.profile.registeredAddress || resortDetails.address}
                checkInTime={settings.profile.checkInTime || resortDetails.checkInTime}
                checkOutTime={settings.profile.checkOutTime || resortDetails.checkOutTime}
              />
            </div>
          ) : activeTab === 'rooms' ? (
            <RoomsView
              categories={syncedCategories}
              rooms={rooms}
              amenities={propertyAmenities}
              maintenanceTickets={maintenanceTickets}
              blockedDays={blockedDays}
              onUpdateCategory={async (updated) => {
                await upsertCollectionDoc('roomCategories', updated);
                triggerToast(`Pricing rates updated in Firestore for ${updated.name}`);
              }}
              onAddCategory={async (newC) => {
                await upsertCollectionDoc('roomCategories', newC);
                triggerToast(`New category ${newC.name} saved to Firestore!`);
              }}
              onUpdateAmenity={async (updated) => {
                await upsertCollectionDoc('propertyAmenities', updated);
                triggerToast(`${updated.name} amenity status set to ${updated.status}`);
              }}
              onAddAmenity={async (newA) => {
                await upsertCollectionDoc('propertyAmenities', newA);
                triggerToast(`Property amenity ${newA.name} added to Firestore!`);
              }}
              onUpdateRoomStatus={async (roomId, status, note) => {
                await updateRoomStatusInFirestore(roomId, status, note);
                triggerToast(`Room status updated to ${status}`);
              }}
              onSaveBlockedDays={async (nextDays) => {
                await saveBlockedDays(nextDays);
                triggerToast(`Inventory calendar updated (${nextDays.length} blocked dates saved).`);
              }}
              onOpenMaintenanceModule={() => navigateToModule('maintenance')}
              triggerToast={triggerToast}
            />
          ) : activeTab === 'inventory' ? (
            <InventoryView triggerToast={triggerToast} />
          ) : activeTab === 'staff' ? (
            <StaffManagementView triggerToast={triggerToast} />
          ) : activeTab === 'whatsapp' ? (
            <WhatsAppAutomationView triggerToast={triggerToast} />
          ) : activeTab === 'reviews' ? (
            <ReviewsManagementView
              onNavigateToMaintenance={() => navigateToModule('maintenance')}
              onNavigateToStaff={() => navigateToModule('staff')}
              triggerToast={triggerToast}
            />
          ) : activeTab === 'guests' ? (
            <GuestsCRMView
              guests={guestsCRM}
              bookings={bookings}
              invoices={invoices}
              onUpdateGuest={async (updated) => {
                await upsertCollectionDoc('guests', updated);
                triggerToast(`CRM profile updated in Firestore for ${updated.name}`);
              }}
              onAddGuest={async (newGuest) => {
                const saved = await createOrMergeGuestCRM(newGuest);
                triggerToast(`Guest profile saved to Firestore for ${saved.name}`);
              }}
              triggerToast={triggerToast}
            />
          ) : activeTab === 'billing' ? (
            <BillingView
              invoices={invoices}
              bookings={bookings}
              rooms={rooms}
              settings={settings}
              triggerToast={triggerToast}
              initialStatusFilter={billingNavFilter}
              navigationKey={navFilterKey}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView
              settings={settings}
              onSaveSettings={async (nextSettings) => {
                await saveResortSettings(nextSettings);
                setSettings(nextSettings);
              }}
              onNavigateToBilling={() => navigateToModule('billing')}
              triggerToast={triggerToast}
            />
          ) : activeTab === 'bookings' ? (
            <BookingsView
              bookings={bookings}
              rooms={rooms}
              guests={guestsCRM}
              loading={dataLoading}
              errorMsg={firestoreError}
              onSeedStarterData={handleSeedStarterDataset}
              onNavigateTab={(tab) => navigateToModule(tab)}
              onOpenMobileDrawer={() => setIsMobileSidebarOpen(true)}
              triggerToast={triggerToast}
              initialStatusFilter={bookingsNavFilter.status}
              initialSearchQuery={bookingsNavFilter.search}
              navigationKey={navFilterKey}
            />
          ) : activeTab === 'housekeeping' ? (
            <HousekeepingView
              tasks={housekeeping}
              rooms={rooms}
              staffMembers={staffMembers}
              openMaintenanceCount={openMaintenanceCount}
              onSaveTask={async (updatedTask) => {
                await saveHousekeepingTaskAndSyncRoom(updatedTask, rooms);
              }}
              onNavigateMaintenance={() => navigateToModule('maintenance')}
              triggerToast={triggerToast}
              initialFilter={housekeepingNavFilter}
              navigationKey={navFilterKey}
            />
          ) : activeTab === 'maintenance' || activeTab === 'reports' ? (
            <MaintenanceView
              tickets={maintenanceTickets}
              rooms={rooms}
              initialFilter={maintenanceNavFilter}
              navigationKey={navFilterKey}
              triggerToast={triggerToast}
            />
          ) : (
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center py-20 flex flex-col items-center gap-4">
              <div className="p-4 bg-teal-50 text-teal-800 rounded-full">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 capitalize">{activeTab} Module</h3>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Staff Firebase Authentication Modal */}
      <StaffAuthModal />

      {/* MODAL 1: WALK-IN / NEW BOOKING (Uses real overlap-checked NewReservationModal) */}
      {showBookingModal && (
        <NewReservationModal
          onClose={() => setShowBookingModal(false)}
          rooms={rooms}
          existingBookings={bookings}
          existingGuests={guestsCRM}
          onSubmitBooking={async (newB, room) => {
            await createReservationAtomic(newB, room);
            triggerToast(`Reservation ${newB.bookingCode || ''} saved for ${newB.guestName}`);
          }}
        />
      )}

      {/* MODAL 2: REVIEW PENDING BILLING */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-950 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-200" />
                <h3 className="font-bold text-base">Guest Outstanding Balance</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBillingModal(false);
                  setBillingDetail(null);
                }}
                className="text-orange-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Primary Guest</h4>
                  <p className="text-sm font-bold text-slate-800">
                    {billingDetail?.name || 'Guest Folio'}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Cottage</h4>
                  <p className="text-sm font-bold text-slate-800">
                    {billingDetail?.roomNumber || 'Pending Folios'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Pending Folio Balance (Stay &amp; Incidentals)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(billingDetail?.amount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-rose-600 bg-rose-50 px-2.5 py-2 rounded-lg border border-rose-100">
                  <span>Outstanding Balance Due</span>
                  <span>₹{(billingDetail?.amount ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillingModal(false);
                    setBillingDetail(null);
                    navigateToModule('billing', { billingFilter: 'Pending' });
                  }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Open Billing Ledger
                </button>
                <button
                  type="button"
                  disabled={isCollectingBilling}
                  onClick={() => void handleConfirmDashboardCollection()}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-teal-900/10 cursor-pointer"
                >
                  {isCollectingBilling
                    ? 'Saving...'
                    : `Collect ₹${(billingDetail?.amount ?? 0).toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI DISPATCH ACTION OVERLAY */}
      {showAiActionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-teal-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brush className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-base">Housekeeping Priority Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiActionModal(false)}
                className="text-teal-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Pending and in-progress housekeeping rooms currently queued in Firestore:
              </p>

              <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto">
                {housekeeping
                  .filter((t) => t.status === 'Pending' || t.status === 'In Progress')
                  .slice(0, 4)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {task.roomNumber} ({task.type})
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {task.assignedTo
                            ? `Assigned: ${task.assignedTo}`
                            : 'Unassigned — ready to dispatch'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 font-semibold rounded-lg ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiActionModal(false);
                    navigateToModule('housekeeping', { housekeepingFilter: 'Urgent' });
                  }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Open Housekeeping
                </button>
                <button
                  type="button"
                  disabled={isDispatchingAi}
                  onClick={() => void confirmAiHousekeepingClean()}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  {isDispatchingAi ? 'Updating...' : 'Mark Queue Cleaned'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
