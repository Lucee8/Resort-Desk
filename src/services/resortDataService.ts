import {
  db,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
  runTransaction,
  ref,
  uploadBytes,
  getDownloadURL,
} from '../firebase';
import {
  BankSettlementBatch,
  BillingInvoice,
  BillingSubscriptionUsage,
  Booking,
  GoogleReviewsIntegrationConfig,
  GuestCRM,
  HousekeepingTask,
  InventoryAIInsight,
  InventoryAlert,
  InventoryItem,
  InventorySupplier,
  MaintenanceTicket,
  MyraAIWorkflowInsight,
  PredictiveMaintenanceAlert,
  PropertyAmenity,
  PurchaseOrder,
  RecentlyResolvedMaintenance,
  ResortDeskSettings,
  ReviewAIInsight,
  ReviewItem,
  RoomCategory,
  RoomUnit,
  SentimentTopicMetric,
  StaffAIInsightItem,
  StaffCoverageDay,
  StaffLeaveRequest,
  StaffMember,
  StaffShiftPlan,
  StaffTask,
  Technician,
  WhatsAppMessageLog,
  WhatsAppTemplate,
  WhatsAppWorkflow,
} from '../types';
import { OperationType, handleFirestoreError, stripUndefined } from './firestoreBase';
import {
  MYKONOS_ROOM_UNITS,
  seedMykonosStarterDataset,
} from './bookingsService';
import {
  initialGuestsCRM,
  initialHousekeeping,
  initialMaintenanceTickets,
  initialPredictiveAlerts,
  initialPropertyAmenities,
  initialRecentlyResolved,
  initialTechnicians,
} from '../data';
import {
  initialBankSettlement,
  initialInvoices,
  initialSubscriptionData,
} from '../data/billingData';
import {
  mockInventoryAIInsights,
  mockInventoryAlerts,
  mockInventoryItems,
  mockPurchaseOrders,
  mockSuppliers,
} from '../data/inventoryData';
import {
  initialAIInsights as initialStaffAIInsights,
  initialLeaveRequests,
  initialShiftPlans,
  initialStaffMembers,
  initialStaffTasks,
  initialWeeklyCoverage,
} from '../data/staffData';
import {
  initialGoogleIntegrationConfig,
  initialReviewAIInsights,
  initialReviewsList,
  initialSentimentTopics,
} from '../data/reviewsData';
import {
  initialMessageLogs,
  initialMyraAIInsights,
  initialWhatsAppTemplates,
  initialWorkflows,
} from '../data/whatsappData';
import { initialSettingsData } from '../data/settingsData';
import { PROPERTY_SETTINGS_STORAGE_KEY } from '../utils/bookingUtils';

// ============================================================
// GENERIC COLLECTION SUBSCRIPTION & DOC HELPERS
// ============================================================

export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    query(collection(db, collectionName)),
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as T),
        id: d.id,
      }));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function upsertCollectionDoc<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    await setDoc(doc(db, collectionName, item.id), stripUndefined(item), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

export async function deleteCollectionDoc(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// ============================================================
// ROOM CATEGORIES, AMENITIES & CALENDAR BLOCKED DATES
// ============================================================

export const MYKONOS_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'cat-deluxe-sea',
    name: 'Deluxe Sea Facing',
    description: 'Coastal verandas overlooking Tarkarli waters with modern Konkan interiors.',
    activeCount: 3,
    amenities: ['Sea Facing Veranda', 'Wi-Fi 6', 'Rain Shower', 'Climate Ctrl'],
    basePrice: 7200,
    weekendPrice: 8200,
    peakPrice: 9800,
    iconType: 'sea-view',
  },
  {
    id: 'cat-beachfront-king',
    name: 'Beachfront King',
    description: 'Direct sands access cottage with private sun deck and espresso bar.',
    activeCount: 1,
    amenities: ['Direct Beach Deck', 'King Bed', 'Espresso Bar'],
    basePrice: 8500,
    weekendPrice: 9600,
    peakPrice: 11800,
    iconType: 'sea-view',
  },
  {
    id: 'cat-private-pool-villa',
    name: 'Private Pool Villa',
    description: 'Secluded cove villa featuring a private plunge pool and sunset gazebo.',
    activeCount: 1,
    amenities: ['Plunge Pool', 'Sunset Gazebo', 'Butler Service'],
    basePrice: 9500,
    weekendPrice: 11200,
    peakPrice: 14500,
    iconType: 'suite',
  },
  {
    id: 'cat-heritage-suite',
    name: 'Heritage Family Suite',
    description: 'Spacious two-bay Malvani teak suite designed for families.',
    activeCount: 1,
    amenities: ['2 Sleeping Bays', 'Konkan Teak Decor', 'Veranda'],
    basePrice: 8800,
    weekendPrice: 10200,
    peakPrice: 12800,
    iconType: 'suite',
  },
  {
    id: 'cat-garden-cocoon',
    name: 'Garden Cocoon Suite',
    description: 'Quiet tropical palm grove retreat with outdoor rain shower & hammock.',
    activeCount: 1,
    amenities: ['Private Garden Hammock', 'Outdoor Rain Shower'],
    basePrice: 6200,
    weekendPrice: 7100,
    peakPrice: 8900,
    iconType: 'cottage',
  },
];

export function subscribeBlockedDays(
  onData: (days: number[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    doc(db, 'propertyCalendar', 'blockedDates'),
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.days)) {
        onData(snap.data().days as number[]);
      } else {
        onData([]);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveBlockedDays(days: number[]): Promise<void> {
  try {
    await setDoc(
      doc(db, 'propertyCalendar', 'blockedDates'),
      { days, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'propertyCalendar/blockedDates');
  }
}

// ============================================================
// GUESTS CRM (Deduplicated by phone/email)
// ============================================================

export async function createOrMergeGuestCRM(newGuest: GuestCRM): Promise<GuestCRM> {
  try {
    const snap = await getDocs(collection(db, 'guests'));
    const normalizedPhone = newGuest.phone.replace(/\s+/g, '');
    const match = snap.docs.find((d) => {
      const g = d.data() as GuestCRM;
      const phoneMatch =
        normalizedPhone.length >= 8 && g.phone?.replace(/\s+/g, '') === normalizedPhone;
      const emailMatch =
        Boolean(newGuest.email) &&
        g.email?.toLowerCase() === newGuest.email.toLowerCase();
      return phoneMatch || emailMatch;
    });

    if (match) {
      const existing = match.data() as GuestCRM;
      const merged: GuestCRM = stripUndefined({
        ...existing,
        name: newGuest.name || existing.name,
        phone: newGuest.phone || existing.phone,
        email: newGuest.email || existing.email,
        location: newGuest.location || existing.location,
        isVIP: existing.isVIP || newGuest.isVIP,
        preferences: Array.from(new Set([...(existing.preferences || []), ...(newGuest.preferences || [])])),
      });
      await setDoc(doc(db, 'guests', match.id), merged, { merge: true });
      return merged;
    }

    const clean = stripUndefined(newGuest);
    await setDoc(doc(db, 'guests', clean.id), clean);
    return clean;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'guests');
  }
}

// ============================================================
// HOUSEKEEPING + ROOM STATUS SYNC + PHOTO UPLOAD
// ============================================================

export async function uploadHousekeepingPhoto(taskId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `housekeeping-photos/${taskId}/${Date.now()}_${safeName}`);
  const res = await uploadBytes(storageRef, file);
  return getDownloadURL(res.ref);
}

export async function uploadMaintenancePhoto(ticketId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `maintenance-photos/${ticketId}/${Date.now()}_${safeName}`);
  const res = await uploadBytes(storageRef, file);
  return getDownloadURL(res.ref);
}

function findMatchingRoomUnit(roomLabel: string, rooms: RoomUnit[]): RoomUnit | undefined {
  const cleaned = roomLabel
    .replace(/^(room|cottage|villa|suite|deluxe villa|sunset suite|royal villa|executive suite|garden cottage|deluxe sea view)\s*#?/i, '')
    .trim()
    .toLowerCase();
  return rooms.find(
    (r) =>
      r.roomNumber.toLowerCase() === cleaned ||
      r.roomName.toLowerCase() === roomLabel.toLowerCase().trim() ||
      (cleaned.length >= 2 && r.roomNumber.toLowerCase() === cleaned.split(/\s+/)[0])
  );
}

export async function saveHousekeepingTaskAndSyncRoom(
  task: HousekeepingTask,
  rooms: RoomUnit[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'housekeepingTasks', task.id), stripUndefined(task), { merge: true });

    const matchedRoom = findMatchingRoomUnit(task.roomNumber, rooms);
    if (matchedRoom && matchedRoom.status !== 'Maintenance') {
      if (task.status === 'Verified') {
        batch.set(
          doc(db, 'rooms', matchedRoom.id),
          { status: 'Available', maintenanceNote: '' },
          { merge: true }
        );
      } else if (task.status === 'Pending' || task.status === 'In Progress') {
        if (matchedRoom.status !== 'Occupied') {
          batch.set(
            doc(db, 'rooms', matchedRoom.id),
            { status: 'Deep Clean', maintenanceNote: 'Housekeeping turnover in progress' },
            { merge: true }
          );
        }
      }
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `housekeepingTasks/${task.id}`);
  }
}

export async function batchUpdateHousekeepingTasks(tasks: HousekeepingTask[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const task of tasks) {
      batch.set(doc(db, 'housekeepingTasks', task.id), stripUndefined(task), { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'housekeepingTasks');
  }
}

// ============================================================
// MAINTENANCE TICKETS (Single Canonical Truth Across Modules)
// ============================================================

export async function saveMaintenanceTicketAtomic(
  ticket: MaintenanceTicket,
  rooms: RoomUnit[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'maintenanceTickets', ticket.id), stripUndefined(ticket), { merge: true });

    const matchedRoom = findMatchingRoomUnit(ticket.roomNumber, rooms);
    if (matchedRoom) {
      if (ticket.isRoomBlocked && ticket.status !== 'Closed') {
        batch.set(
          doc(db, 'rooms', matchedRoom.id),
          { status: 'Maintenance', maintenanceNote: ticket.title },
          { merge: true }
        );
      }
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `maintenanceTickets/${ticket.id}`);
  }
}

export async function closeMaintenanceTicketAtomic(
  ticket: MaintenanceTicket,
  resolvedEntry: RecentlyResolvedMaintenance,
  allTickets: MaintenanceTicket[],
  rooms: RoomUnit[],
  updatedTechnician?: Technician
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(
      doc(db, 'maintenanceTickets', ticket.id),
      stripUndefined({ ...ticket, status: 'Closed', isRoomBlocked: false }),
      { merge: true }
    );
    batch.set(
      doc(db, 'recentlyResolvedMaintenance', resolvedEntry.id),
      stripUndefined(resolvedEntry),
      { merge: true }
    );
    if (updatedTechnician) {
      batch.set(
        doc(db, 'technicians', updatedTechnician.id),
        stripUndefined(updatedTechnician),
        { merge: true }
      );
    }

    const matchedRoom = findMatchingRoomUnit(ticket.roomNumber, rooms);
    if (matchedRoom) {
      const otherBlockingTicket = allTickets.some(
        (t) =>
          t.id !== ticket.id &&
          t.isRoomBlocked &&
          t.status !== 'Closed' &&
          findMatchingRoomUnit(t.roomNumber, [matchedRoom])?.id === matchedRoom.id
      );
      if (!otherBlockingTicket && matchedRoom.status === 'Maintenance') {
        batch.set(
          doc(db, 'rooms', matchedRoom.id),
          { status: 'Available', maintenanceNote: '' },
          { merge: true }
        );
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `maintenanceTickets/${ticket.id}`);
  }
}

// ============================================================
// BILLING INVOICES & ATOMIC PAYMENT / REFUND SYNC
// ============================================================

export async function createBillingInvoiceAtomic(invoice: BillingInvoice): Promise<void> {
  try {
    const clean = stripUndefined(invoice);
    await setDoc(doc(db, 'invoices', clean.id), clean, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `invoices/${invoice.id}`);
  }
}

export async function recordBillingInvoicePaymentAtomic(
  invoice: BillingInvoice,
  amount: number,
  method: string,
  referenceId: string
): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Payment amount must be greater than ₹0.');
  }

  await runTransaction(db, async (tx) => {
    const invRef = doc(db, 'invoices', invoice.id);
    const invSnap = await tx.get(invRef);
    const currentInv = (invSnap.exists() ? invSnap.data() : invoice) as BillingInvoice;

    if (currentInv.dueAmount <= 0) {
      throw new Error('This invoice is already fully settled.');
    }
    if (amount > currentInv.dueAmount) {
      throw new Error(
        `Payment exceeds due amount (₹${currentInv.dueAmount.toLocaleString('en-IN')}).`
      );
    }
    if (
      referenceId.trim() &&
      method !== 'Cash' &&
      (currentInv.paymentsHistory || []).some(
        (p) => p.referenceId.trim().toLowerCase() === referenceId.trim().toLowerCase()
      )
    ) {
      throw new Error(`Duplicate payment reference "${referenceId}" already recorded on this invoice.`);
    }

    const payId = `pay-${Date.now()}`;
    const paymentEntry = {
      id: payId,
      amount: Math.round(amount),
      method: (method.includes('UPI')
        ? 'UPI'
        : method.includes('Credit')
          ? 'Credit Card'
          : method.includes('Debit')
            ? 'Debit Card'
            : method.includes('NEFT') || method.includes('Net')
              ? 'Netbanking'
              : method.includes('Bank')
                ? 'Bank Transfer'
                : 'Cash') as 'UPI' | 'Credit Card' | 'Debit Card' | 'Netbanking' | 'Cash' | 'Bank Transfer',
      referenceId: referenceId.trim() || `CASH-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      collectedBy: 'Finance / Front Desk',
      receiptNumber: `RCP-${Date.now().toString().slice(-5)}`,
    };

    const nextPaid = Math.min(currentInv.totalAmount, currentInv.paidAmount + paymentEntry.amount);
    const nextDue = Math.max(0, currentInv.totalAmount - nextPaid);
    const nextStatus = nextDue === 0 ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Pending';

    // Read linked booking first (all tx.get calls must precede tx.set/tx.update)
    let linkedBooking: Booking | null = null;
    if (currentInv.bookingId) {
      const bSnap = await tx.get(doc(db, 'bookings', currentInv.bookingId));
      if (bSnap.exists()) {
        linkedBooking = bSnap.data() as Booking;
      }
    }

    tx.set(
      invRef,
      stripUndefined({
        ...currentInv,
        paidAmount: nextPaid,
        dueAmount: nextDue,
        status: nextStatus,
        paymentMethod: method,
        paymentReference: paymentEntry.referenceId,
        paymentsHistory: [...(currentInv.paymentsHistory || []), paymentEntry],
      }),
      { merge: true }
    );

    tx.set(
      doc(db, 'payments', payId),
      stripUndefined({
        ...paymentEntry,
        invoiceId: currentInv.id,
        invoiceNumber: currentInv.invoiceNumber,
        bookingId: currentInv.bookingId || null,
        guestName: currentInv.guestName,
      })
    );

    if (linkedBooking && currentInv.bookingId) {
      const bMethod = method.includes('UPI')
        ? 'UPI / GPay'
        : method.includes('Card')
          ? 'Card'
          : method.includes('Cash')
            ? 'Cash'
            : 'NEFT / IMPS';

      tx.update(
        doc(db, 'bookings', currentInv.bookingId),
        stripUndefined({
          advancePaid: nextPaid,
          balanceDue: nextDue,
          paymentStatus: nextDue === 0 ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Unpaid',
          payments: [
            ...(linkedBooking.payments || []),
            {
              id: payId,
              amount: paymentEntry.amount,
              method: bMethod,
              referenceId: paymentEntry.referenceId,
              recordedAt: paymentEntry.timestamp,
              recordedBy: 'Billing Desk',
              type: 'Settlement',
            },
          ],
          updatedAt: new Date().toISOString(),
        })
      );
    }
  });
}

export async function processBillingRefundAtomic(
  invoice: BillingInvoice,
  refundAmount: number,
  reason: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const todayLabel = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const refundRecord = {
      id: `ref-${Date.now()}`,
      amount: Math.round(refundAmount),
      reason,
      refundDate: todayLabel,
      mode: 'Original Payment Source' as const,
      approvedBy: 'Resort Manager',
      creditNoteNumber: `CN-${Date.now().toString().slice(-5)}`,
    };

    batch.set(
      doc(db, 'invoices', invoice.id),
      stripUndefined({
        status: 'Refunded',
        refundAmount: Math.round(refundAmount),
        refundDate: todayLabel,
        refundReason: reason,
        dueAmount: 0,
        isStrikethrough: true,
        refundHistory: [...(invoice.refundHistory || []), refundRecord],
      }),
      { merge: true }
    );

    if (invoice.bookingId) {
      batch.set(
        doc(db, 'bookings', invoice.bookingId),
        {
          bookingStatus: 'Cancelled',
          balanceDue: 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `invoices/${invoice.id}`);
  }
}

export function subscribeBillingDoc<T>(
  docId: string,
  fallback: T,
  onData: (val: T) => void
) {
  return onSnapshot(
    doc(db, 'billingConfig', docId),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as T);
      } else {
        onData(fallback);
      }
    },
    () => onData(fallback)
  );
}

export async function saveBillingDoc<T extends Record<string, unknown>>(
  docId: string,
  data: T
): Promise<void> {
  try {
    await setDoc(doc(db, 'billingConfig', docId), stripUndefined(data), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `billingConfig/${docId}`);
  }
}

// ============================================================
// SETTINGS, NOTIFICATIONS & REVIEWS GOOGLE CONFIG
// ============================================================

export function subscribeResortSettings(
  onData: (settings: ResortDeskSettings) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    doc(db, 'settings', 'resortDesk'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ResortDeskSettings;
        try {
          localStorage.setItem(PROPERTY_SETTINGS_STORAGE_KEY, JSON.stringify(data));
        } catch {
          // ignore localStorage quota errors
        }
        onData(data);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveResortSettings(settings: ResortDeskSettings): Promise<void> {
  try {
    const clean = stripUndefined(settings);
    await setDoc(doc(db, 'settings', 'resortDesk'), clean, { merge: true });
    try {
      localStorage.setItem(PROPERTY_SETTINGS_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/resortDesk');
  }
}

export function subscribeNotificationsReadState(
  onData: (readIds: string[]) => void
) {
  return onSnapshot(
    doc(db, 'notifications', 'readState'),
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.readIds)) {
        onData(snap.data().readIds as string[]);
      } else {
        onData([]);
      }
    },
    () => onData([])
  );
}

export async function markNotificationsReadInFirestore(readIds: string[]): Promise<void> {
  try {
    await setDoc(
      doc(db, 'notifications', 'readState'),
      { readIds, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'notifications/readState');
  }
}

export function subscribeGoogleReviewsConfig(
  onData: (config: GoogleReviewsIntegrationConfig) => void
) {
  return onSnapshot(
    doc(db, 'reviewConfig', 'google'),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as GoogleReviewsIntegrationConfig);
      }
    },
    () => {}
  );
}

export async function saveGoogleReviewsConfig(
  config: GoogleReviewsIntegrationConfig
): Promise<void> {
  try {
    await setDoc(doc(db, 'reviewConfig', 'google'), stripUndefined(config), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'reviewConfig/google');
  }
}

// ============================================================
// COMPLETE MYKONOS STARTER DATASET SEEDER (Explicit / Empty DB)
// ============================================================

export async function seedAllMykonosCollections(): Promise<void> {
  await seedMykonosStarterDataset();

  const commits: Promise<void>[] = [];
  const writeChunked = async <T extends { id: string }>(
    colName: string,
    items: T[]
  ) => {
    const batch = writeBatch(db);
    for (const item of items) {
      batch.set(doc(db, colName, item.id), stripUndefined(item), { merge: true });
    }
    await batch.commit();
  };

  commits.push(writeChunked('roomCategories', MYKONOS_ROOM_CATEGORIES));
  commits.push(writeChunked('propertyAmenities', initialPropertyAmenities));
  commits.push(writeChunked('housekeepingTasks', initialHousekeeping));
  commits.push(writeChunked('maintenanceTickets', initialMaintenanceTickets));
  commits.push(writeChunked('technicians', initialTechnicians));
  commits.push(writeChunked('predictiveAlerts', initialPredictiveAlerts));
  commits.push(writeChunked('recentlyResolvedMaintenance', initialRecentlyResolved));
  commits.push(writeChunked('guests', initialGuestsCRM));
  commits.push(writeChunked('invoices', initialInvoices));
  commits.push(writeChunked('inventoryItems', mockInventoryItems));
  commits.push(writeChunked('purchaseOrders', mockPurchaseOrders));
  commits.push(writeChunked('inventorySuppliers', mockSuppliers));
  commits.push(writeChunked('inventoryAlerts', mockInventoryAlerts));
  commits.push(writeChunked('inventoryAIInsights', mockInventoryAIInsights));
  commits.push(writeChunked('staffMembers', initialStaffMembers));
  commits.push(writeChunked('staffLeaveRequests', initialLeaveRequests));
  commits.push(
    writeChunked(
      'staffWeeklyCoverage',
      initialWeeklyCoverage.map((d) => ({ ...d, id: d.day.toLowerCase() }))
    )
  );
  commits.push(writeChunked('staffShiftPlans', initialShiftPlans));
  commits.push(writeChunked('staffTasks', initialStaffTasks));
  commits.push(writeChunked('staffAIInsights', initialStaffAIInsights));
  commits.push(writeChunked('reviews', initialReviewsList));
  commits.push(
    writeChunked(
      'reviewSentimentTopics',
      initialSentimentTopics.map((t, idx) => ({ ...t, id: `topic-${idx + 1}` }))
    )
  );
  commits.push(writeChunked('reviewAIInsights', initialReviewAIInsights));
  commits.push(writeChunked('whatsappWorkflows', initialWorkflows));
  commits.push(writeChunked('whatsappTemplates', initialWhatsAppTemplates));
  commits.push(writeChunked('whatsappInsights', initialMyraAIInsights));
  commits.push(writeChunked('whatsappLogs', initialMessageLogs));

  commits.push(
    setDoc(
      doc(db, 'billingConfig', 'subscription'),
      stripUndefined(initialSubscriptionData),
      { merge: true }
    )
  );
  commits.push(
    setDoc(
      doc(db, 'billingConfig', 'bankSettlement'),
      stripUndefined(initialBankSettlement),
      { merge: true }
    )
  );
  commits.push(
    setDoc(
      doc(db, 'reviewConfig', 'google'),
      stripUndefined(initialGoogleIntegrationConfig),
      { merge: true }
    )
  );
  commits.push(saveResortSettings(initialSettingsData));

  await Promise.all(commits);
}

/**
 * Checks whether core operational collections exist; if rooms are completely empty
 * and Firestore is writable, callers can inspect before seeding.
 */
export async function checkFirestoreRoomsEmpty(): Promise<boolean> {
  const snap = await getDocs(collection(db, 'rooms'));
  return snap.empty;
}
