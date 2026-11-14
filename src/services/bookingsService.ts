import {
  db,
  storage,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  writeBatch,
  ref,
  uploadBytes,
  getDownloadURL,
} from '../firebase';
import {
  Booking,
  BookingPaymentEntry,
  BookingPaymentMethod,
  GuestCRM,
  HousekeepingTask,
  RoomUnit,
} from '../types';
import {
  OperationType,
  handleFirestoreError,
  stripUndefined,
} from './firestoreBase';
import {
  addDaysISO,
  diffNights,
  formatFullDate,
  formatShortDate,
  getPropertyBillingGSTSettings,
  getTodayISO,
  hasDateOverlap,
  resolveBookingDatesISO,
} from '../utils/bookingUtils';

export const MYKONOS_ROOM_UNITS: RoomUnit[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    roomName: 'Cottage 101',
    categoryName: 'Deluxe Sea Facing',
    subtitle: 'Deluxe Sea View · Ground',
    floorOrWing: 'Ground Beachfront Wing',
    ratePerNight: 7200,
    maxAdults: 3,
    maxChildren: 1,
    status: 'Available',
    amenities: ['Sea Facing Veranda', 'Wi-Fi 6', 'Rain Shower', 'Climate Ctrl'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-102',
    roomNumber: '102',
    roomName: 'Cottage 102',
    categoryName: 'Deluxe Sea Facing',
    subtitle: 'Deluxe Sea View · Upper',
    floorOrWing: 'Upper Sea Wing',
    ratePerNight: 7200,
    maxAdults: 3,
    maxChildren: 1,
    status: 'Available',
    amenities: ['Private Balcony', 'Wi-Fi 6', 'Mini-bar'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-103',
    roomNumber: '103',
    roomName: 'Cottage 103',
    categoryName: 'Beachfront King',
    subtitle: 'Beachfront King · Direct Access',
    floorOrWing: 'Direct Sands Front',
    ratePerNight: 8500,
    maxAdults: 2,
    maxChildren: 1,
    status: 'Available',
    amenities: ['Direct Beach Deck', 'King Bed', 'Espresso Bar'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-201',
    roomNumber: '201',
    roomName: 'Villa 201',
    categoryName: 'Private Pool Villa',
    subtitle: 'Private Pool Villa · Beach',
    floorOrWing: 'Private Cove',
    ratePerNight: 9500,
    maxAdults: 4,
    maxChildren: 2,
    status: 'Available',
    amenities: ['Plunge Pool', 'King Bed', 'Sunset Gazebo', 'Butler Service'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-301',
    roomNumber: '301',
    roomName: 'Suite 301',
    categoryName: 'Heritage Family Suite',
    subtitle: 'Heritage Malvani Suite',
    floorOrWing: 'Heritage Courtyard',
    ratePerNight: 8800,
    maxAdults: 4,
    maxChildren: 2,
    status: 'Available',
    amenities: ['2 Sleeping Bays', 'Konkan Teak Decor', 'Veranda'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-104',
    roomNumber: '104',
    roomName: 'Cottage 104',
    categoryName: 'Deluxe Sea Facing',
    subtitle: 'Sea Facing Double',
    floorOrWing: 'South Coastal Wing',
    ratePerNight: 6800,
    maxAdults: 2,
    maxChildren: 1,
    status: 'Deep Clean',
    maintenanceNote: 'Deep Clean scheduled after morning checkout',
    amenities: ['Ocean Breeze Deck', 'Wi-Fi 6', 'Smart TV'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'room-105',
    roomNumber: '105',
    roomName: 'Cottage 105',
    categoryName: 'Garden Cocoon Suite',
    subtitle: 'Garden Cocoon Suite',
    floorOrWing: 'Palm Grove Garden',
    ratePerNight: 6200,
    maxAdults: 2,
    maxChildren: 1,
    status: 'Available',
    amenities: ['Private Garden Hammock', 'Outdoor Rain Shower', 'Quiet Zone'],
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=300&q=80',
  },
];

export const ROOM_CATEGORIES_META = [
  'Deluxe Sea Facing',
  'Beachfront King',
  'Private Pool Villa',
  'Heritage Family Suite',
  'Garden Cocoon Suite',
] as const;

export function subscribeBookings(
  onData: (bookings: Booking[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'bookings'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Booking[] = snapshot.docs.map((d) => {
        const data = d.data() as Booking;
        return {
          ...data,
          id: d.id,
        };
      });
      list.sort((a, b) => {
        const aDate = resolveBookingDatesISO(a).checkInISO;
        const bDate = resolveBookingDatesISO(b).checkInISO;
        return aDate.localeCompare(bDate);
      });
      onData(list);
    },
    (error) => {
      onError(error);
    }
  );
}

export function subscribeRooms(
  onData: (rooms: RoomUnit[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'rooms'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: RoomUnit[] = snapshot.docs.map((d) => ({
        ...(d.data() as RoomUnit),
        id: d.id,
      }));
      list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
      onData(list);
    },
    (error) => {
      onError(error);
    }
  );
}

export function subscribeGuests(
  onData: (guests: GuestCRM[]) => void,
  onError: (err: Error) => void
) {
  const q = query(collection(db, 'guests'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: GuestCRM[] = snapshot.docs.map((d) => ({
        ...(d.data() as GuestCRM),
        id: d.id,
      }));
      onData(list);
    },
    (error) => {
      onError(error);
    }
  );
}

export async function initializeRoomsCatalogInFirestore(): Promise<void> {
  const batch = writeBatch(db);
  for (const room of MYKONOS_ROOM_UNITS) {
    batch.set(doc(db, 'rooms', room.id), room, { merge: true });
  }
  await batch.commit();
}

export function buildSampleMykonosBookings(): Booking[] {
  const today = getTodayISO();
  const billingSettings = getPropertyBillingGSTSettings();
  const prefix = billingSettings.invoicePrefix.replace(/\/$/, '');

  const d = (offset: number) => addDaysISO(today, offset);

  return [
    {
      id: 'bk-mc-8940',
      bookingCode: 'BK-8940',
      folioNumber: `${prefix}-8940`,
      guestId: 'guest-siddharth-mehta',
      guestName: 'Siddharth Mehta',
      guestEmail: 'siddharth.m@mehtagroup.in',
      guestPhone: '+91 98201 44321',
      guestCity: 'Mumbai, Maharashtra',
      roomId: 'room-201',
      roomNumber: 'Villa 201',
      roomType: 'Private Pool Villa',
      roomCategory: 'Private Pool Villa',
      startDate: formatShortDate(d(0)),
      endDate: formatShortDate(d(4)),
      checkInDateISO: d(0),
      checkOutDateISO: d(4),
      arrivalTime: '02:00 PM',
      checkoutTime: '11:00 AM',
      nights: 4,
      adults: 2,
      children: 1,
      childrenNotes: 'Aarav, 6 yrs',
      mealPlan: 'CP (Breakfast)',
      source: 'WhatsApp Bot (Myra AI)',
      amount: 53336,
      advancePaid: 30000,
      balanceDue: 23336,
      discount: 0,
      gstRateApplied: 18,
      sacCode: '996312',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Partial',
      payments: [
        {
          id: 'pay-8940-1',
          amount: 30000,
          method: 'UPI / GPay',
          referenceId: '429910488',
          recordedAt: `${d(-3)} 04:20 PM`,
          recordedBy: 'Front Desk',
          type: 'Advance',
        },
      ],
      avatar: 'SM',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      membership: 'Repeat Guest (3 Stays)',
      occasionTag: 'Anniversary',
      totalSpend: 168400,
      avgDailyRate: 9500,
      notes: [
        'Prefers ground access & sunset views. Speedboat pickup requested at Tarkarli jetty.',
      ],
      conciergeRequest:
        'Prefers ground floor cottage direct garden access. Anniversary celebration — complimentary Malvani ukadiche modak requested. Arrange speed boat pickup at Tarkarli jetty.',
      housekeepingNote: 'Prepare anniversary floral bed setup before 01:30 PM.',
      internalStaffNote: 'VIP repeat guest from Mumbai.',
      preferences: ['Repeat Guest (3 Stays)', 'WhatsApp Engine', 'Anniversary'],
      idProofType: 'Aadhaar Card',
      idProofNumberMasked: 'XXXX-XXXX-9102',
      idVerificationStatus: 'Verified',
      whatsappStatus: 'WhatsApp Fallback',
      createdAt: d(-3),
      updatedAt: d(0),
      stayHistory: [
        {
          id: 'sh-sm-1',
          room: 'Villa 201 · Private Pool Villa',
          roomType: 'Private Pool Villa',
          dates: 'Jan 12 - Jan 15',
          nights: 3,
          amount: 34200,
          status: 'PAID',
        },
      ],
      invoice: {
        invoiceNumber: `${prefix}-8940`,
        date: formatFullDate(d(0)),
        items: [
          {
            description: 'Room Tariff (4 Nights @ ₹9,500/night)',
            qty: 4,
            price: 9500,
            amount: 38000,
            sacCode: '996312',
            gstRate: 18,
          },
          {
            description: 'Malvani Seafood Dinner Pre-order',
            qty: 1,
            price: 3200,
            amount: 3200,
            sacCode: '996331',
            gstRate: 18,
          },
          {
            description: 'Tarkarli Scuba Diving Package (2 Pax)',
            qty: 2,
            price: 2000,
            amount: 4000,
            sacCode: '996312',
            gstRate: 18,
          },
        ],
        subtotal: 45200,
        cgst: 4068,
        sgst: 4068,
        total: 53336,
      },
    },
    {
      id: 'bk-mc-8924',
      bookingCode: 'BK-8924',
      folioNumber: `${prefix}-8924`,
      guestId: 'guest-rajesh-kumar',
      guestName: 'Rajesh Kumar',
      guestEmail: 'rajesh.k@example.com',
      guestPhone: '+91 98765 43210',
      guestCity: 'Pune, Maharashtra',
      roomId: 'room-101',
      roomNumber: 'Cottage 101',
      roomType: 'Deluxe Sea Facing',
      roomCategory: 'Deluxe Sea Facing',
      startDate: formatShortDate(d(-1)),
      endDate: formatShortDate(d(2)),
      checkInDateISO: d(-1),
      checkOutDateISO: d(2),
      arrivalTime: '01:00 PM',
      checkoutTime: '11:00 AM',
      nights: 3,
      adults: 2,
      children: 0,
      mealPlan: 'CP (Breakfast)',
      source: 'Direct Walk-in / Phone',
      amount: 24192,
      advancePaid: 24192,
      balanceDue: 0,
      discount: 0,
      gstRateApplied: 12,
      sacCode: '996311',
      bookingStatus: 'Checked-in',
      paymentStatus: 'Paid',
      payments: [
        {
          id: 'pay-8924-1',
          amount: 24192,
          method: 'Card',
          referenceId: 'HDFC-POS-77219',
          recordedAt: `${d(-1)} 01:15 PM`,
          recordedBy: 'Front Desk',
          type: 'Settlement',
        },
      ],
      avatar: 'RK',
      membership: 'Platinum Member',
      totalSpend: 145200,
      avgDailyRate: 7200,
      notes: ['Vegetarian breakfast requested. Allergic to peanuts.'],
      conciergeRequest: 'Prefers kokum sharbat on arrival and quiet sea-facing corner.',
      preferences: ['Vegetarian', 'Sea View', 'Quiet Zone'],
      idProofType: 'Aadhaar Card',
      idProofNumberMasked: 'XXXX-XXXX-4418',
      idVerificationStatus: 'Verified',
      stayHistory: [],
      invoice: {
        invoiceNumber: `${prefix}-8924`,
        date: formatFullDate(d(-1)),
        items: [
          {
            description: 'Cottage 101 · Deluxe Sea Facing (3 Nights)',
            qty: 3,
            price: 7200,
            amount: 21600,
            sacCode: '996311',
            gstRate: 12,
          },
        ],
        subtotal: 21600,
        cgst: 1296,
        sgst: 1296,
        total: 24192,
      },
    },
    {
      id: 'bk-mc-8931',
      bookingCode: 'BK-8931',
      folioNumber: `${prefix}-8931`,
      guestId: 'guest-ananya-joshi',
      guestName: 'Ananya Joshi',
      guestEmail: 'ananya.joshi@gmail.com',
      guestPhone: '+91 97654 22119',
      guestCity: 'Bengaluru, Karnataka',
      roomId: 'room-102',
      roomNumber: 'Cottage 102',
      roomType: 'Deluxe Sea Facing',
      roomCategory: 'Deluxe Sea Facing',
      startDate: formatShortDate(d(0)),
      endDate: formatShortDate(d(2)),
      checkInDateISO: d(0),
      checkOutDateISO: d(2),
      arrivalTime: '03:00 PM',
      checkoutTime: '11:00 AM',
      nights: 2,
      adults: 2,
      children: 0,
      mealPlan: 'MAP (Breakfast & Dinner)',
      source: 'Booking.com',
      amount: 18592,
      advancePaid: 18592,
      balanceDue: 0,
      discount: 0,
      gstRateApplied: 12,
      sacCode: '996311',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      payments: [
        {
          id: 'pay-8931-1',
          amount: 18592,
          method: 'NEFT / IMPS',
          referenceId: 'BDC-PREPAID-1182',
          recordedAt: `${d(-4)} 11:00 AM`,
          recordedBy: 'OTA Sync',
          type: 'Settlement',
        },
      ],
      avatar: 'AJ',
      membership: 'First Visit',
      totalSpend: 18592,
      avgDailyRate: 7200,
      notes: ['Booking.com prepaid reservation. Early check-in if upper cottage is cleaned.'],
      preferences: ['Upper Balcony', 'Pre-paid'],
      idProofType: 'Passport',
      idProofNumberMasked: 'ZXXXX4812',
      idVerificationStatus: 'Pending',
      stayHistory: [],
      invoice: {
        invoiceNumber: `${prefix}-8931`,
        date: formatFullDate(d(0)),
        items: [
          {
            description: 'Cottage 102 · Deluxe Sea Facing (2 Nights)',
            qty: 2,
            price: 7200,
            amount: 14400,
            sacCode: '996311',
            gstRate: 12,
          },
          {
            description: 'MAP Dinner & Breakfast Plan (2 Pax)',
            qty: 2,
            price: 1200,
            amount: 2400,
            sacCode: '996331',
            gstRate: 5,
          },
        ],
        subtotal: 16800,
        cgst: 896,
        sgst: 896,
        total: 18592,
      },
    },
    {
      id: 'bk-mc-8935',
      bookingCode: 'BK-8935',
      folioNumber: `${prefix}-8935`,
      guestId: 'guest-neha-sharma',
      guestName: 'Neha Sharma',
      guestEmail: 'neha.sharma@corp.in',
      guestPhone: '+91 99203 77881',
      guestCity: 'Mumbai, Maharashtra',
      roomId: 'room-103',
      roomNumber: 'Cottage 103',
      roomType: 'Beachfront King',
      roomCategory: 'Beachfront King',
      startDate: formatShortDate(d(1)),
      endDate: formatShortDate(d(3)),
      checkInDateISO: d(1),
      checkOutDateISO: d(3),
      arrivalTime: '02:00 PM',
      checkoutTime: '11:00 AM',
      nights: 2,
      adults: 2,
      children: 0,
      mealPlan: 'Room Only',
      source: 'WhatsApp Bot (Myra AI)',
      amount: 20060,
      advancePaid: 0,
      balanceDue: 20060,
      discount: 0,
      gstRateApplied: 18,
      sacCode: '996312',
      bookingStatus: 'Pending',
      paymentStatus: 'Unpaid',
      payments: [],
      avatar: 'NS',
      membership: 'New Guest',
      totalSpend: 0,
      avgDailyRate: 8500,
      notes: ['Requires 50% advance UPI confirmation within 24h hold window.'],
      conciergeRequest: 'Interested in evening dolphin boat tour.',
      preferences: ['Beach Access'],
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'Unverified',
      stayHistory: [],
      invoice: {
        invoiceNumber: `${prefix}-8935`,
        date: formatFullDate(d(1)),
        items: [
          {
            description: 'Cottage 103 · Beachfront King (2 Nights)',
            qty: 2,
            price: 8500,
            amount: 17000,
            sacCode: '996312',
            gstRate: 18,
          },
        ],
        subtotal: 17000,
        cgst: 1530,
        sgst: 1530,
        total: 20060,
      },
    },
    {
      id: 'bk-mc-8919',
      bookingCode: 'BK-8919',
      folioNumber: `${prefix}-8919`,
      guestId: 'guest-tanvi-borkar',
      guestName: 'Tanvi Borkar',
      guestEmail: 'tanvi.borkar@gmail.com',
      guestPhone: '+91 98230 55412',
      guestCity: 'Kolhapur, Maharashtra',
      roomId: 'room-301',
      roomNumber: 'Suite 301',
      roomType: 'Heritage Family Suite',
      roomCategory: 'Heritage Family Suite',
      startDate: formatShortDate(d(-3)),
      endDate: formatShortDate(d(0)),
      checkInDateISO: d(-3),
      checkOutDateISO: d(0),
      arrivalTime: '02:00 PM',
      checkoutTime: '11:00 AM',
      nights: 3,
      adults: 4,
      children: 1,
      mealPlan: 'MAP (Breakfast & Dinner)',
      source: 'MakeMyTrip',
      amount: 46800,
      advancePaid: 35000,
      balanceDue: 11800,
      discount: 0,
      gstRateApplied: 18,
      sacCode: '996312',
      bookingStatus: 'Checked-in',
      paymentStatus: 'Partial',
      payments: [
        {
          id: 'pay-8919-1',
          amount: 35000,
          method: 'UPI / GPay',
          referenceId: 'MMT-UPI-661209',
          recordedAt: `${d(-3)} 02:30 PM`,
          recordedBy: 'Front Desk',
          type: 'Advance',
        },
      ],
      avatar: 'TB',
      membership: 'Repeat Guest (2 Stays)',
      totalSpend: 78500,
      avgDailyRate: 8800,
      notes: ['Checking out today at 11 AM. Balance ₹11,800 to settle at reception.'],
      conciergeRequest: 'Requested packed Malvani snacks before departure.',
      preferences: ['Family Suite', 'Late Morning Tea'],
      idProofType: 'Driving License',
      idProofNumberMasked: 'MH09-XXXX-2219',
      idVerificationStatus: 'Verified',
      stayHistory: [],
      invoice: {
        invoiceNumber: `${prefix}-8919`,
        date: formatFullDate(d(-3)),
        items: [
          {
            description: 'Suite 301 · Heritage Family Suite (3 Nights)',
            qty: 3,
            price: 8800,
            amount: 26400,
            sacCode: '996312',
            gstRate: 18,
          },
          {
            description: 'Extra Guest & Meal Charges',
            qty: 3,
            price: 4420,
            amount: 13260,
            sacCode: '996331',
            gstRate: 18,
          },
        ],
        subtotal: 39660,
        cgst: 3570,
        sgst: 3570,
        total: 46800,
      },
    },
    {
      id: 'bk-mc-8944',
      bookingCode: 'BK-8944',
      folioNumber: `${prefix}-8944`,
      guestId: 'guest-rohan-deshmukh',
      guestName: 'Rohan Deshmukh',
      guestEmail: 'rohan.d@techventures.in',
      guestPhone: '+91 98192 33011',
      guestCity: 'Mumbai, Maharashtra',
      roomId: 'room-105',
      roomNumber: 'Cottage 105',
      roomType: 'Garden Cocoon Suite',
      roomCategory: 'Garden Cocoon Suite',
      startDate: formatShortDate(d(2)),
      endDate: formatShortDate(d(5)),
      checkInDateISO: d(2),
      checkOutDateISO: d(5),
      arrivalTime: '01:00 PM',
      checkoutTime: '11:00 AM',
      nights: 3,
      adults: 2,
      children: 0,
      mealPlan: 'CP (Breakfast)',
      source: 'Airbnb',
      amount: 20832,
      advancePaid: 10000,
      balanceDue: 10832,
      discount: 0,
      gstRateApplied: 12,
      sacCode: '996311',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Partial',
      payments: [
        {
          id: 'pay-8944-1',
          amount: 10000,
          method: 'UPI / GPay',
          referenceId: 'ABNB-901223',
          recordedAt: `${d(-1)} 06:45 PM`,
          recordedBy: 'Airbnb Payout',
          type: 'Advance',
        },
      ],
      avatar: 'RD',
      membership: 'New Guest',
      totalSpend: 10000,
      avgDailyRate: 6200,
      notes: ['Requests hammock setup and early morning filter coffee.'],
      preferences: ['Garden View', 'Quiet Corner'],
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'Pending',
      stayHistory: [],
      invoice: {
        invoiceNumber: `${prefix}-8944`,
        date: formatFullDate(d(2)),
        items: [
          {
            description: 'Cottage 105 · Garden Cocoon Suite (3 Nights)',
            qty: 3,
            price: 6200,
            amount: 18600,
            sacCode: '996311',
            gstRate: 12,
          },
        ],
        subtotal: 18600,
        cgst: 1116,
        sgst: 1116,
        total: 20832,
      },
    },
  ];
}

export async function seedMykonosStarterDataset(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const room of MYKONOS_ROOM_UNITS) {
      batch.set(doc(db, 'rooms', room.id), stripUndefined(room), { merge: true });
    }
    const sampleBookings = buildSampleMykonosBookings();
    for (const booking of sampleBookings) {
      batch.set(doc(db, 'bookings', booking.id), stripUndefined(booking), { merge: true });
      if (booking.guestId) {
        const guestDoc: GuestCRM = {
          id: booking.guestId,
          name: booking.guestName,
          phone: booking.guestPhone,
          email: booking.guestEmail,
          location: booking.guestCity || 'Maharashtra, India',
          avatar:
            booking.avatarUrl ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          isVIP: booking.membership.toLowerCase().includes('repeat') || booking.membership.toLowerCase().includes('platinum'),
          birthday: '',
          anniversary: booking.occasionTag === 'Anniversary' ? 'Oct 28' : '',
          preferences: booking.preferences,
          generalNotes: booking.conciergeRequest || booking.notes[0] || '',
          visitHistory: [
            {
              id: `vh-${booking.id}`,
              roomName: `${booking.roomNumber} (${booking.roomCategory})`,
              dateRange: `${booking.startDate} - ${booking.endDate}`,
              nightsCount: booking.nights,
              status: booking.bookingStatus === 'Checked-in' ? 'Active' : 'Upcoming',
            },
          ],
          feedback: [],
          payments: (booking.payments || []).map((p) => ({
            id: p.id,
            invoiceId: booking.invoice.invoiceNumber,
            date: p.recordedAt,
            amount: p.amount,
            status: p.method.includes('Cash')
              ? 'Paid via Cash'
              : p.method.includes('Card')
                ? 'Paid via Card'
                : 'Paid via UPI',
          })),
        };
        batch.set(doc(db, 'guests', booking.guestId), stripUndefined(guestDoc), { merge: true });
      }
      const invoiceDocId = booking.invoice.invoiceNumber.replace(/[^\w-]/g, '_');
      batch.set(
        doc(db, 'invoices', invoiceDocId),
        stripUndefined({
          id: invoiceDocId,
          invoiceNumber: booking.invoice.invoiceNumber,
          bookingId: booking.id,
          guestId: booking.guestId,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          guestEmail: booking.guestEmail,
          roomNumber: booking.roomNumber,
          issueDate: booking.invoice.date,
          dueDate: booking.invoice.date,
          items: booking.invoice.items.map((it, idx) => ({
            id: `it-${booking.id}-${idx + 1}`,
            description: it.description,
            sacCode: it.sacCode || booking.sacCode || '996311',
            qty: it.qty,
            unitPrice: it.price,
            gstRate: it.gstRate ?? booking.gstRateApplied ?? 12,
            amount: it.amount,
            gstAmount: Math.round((it.amount * (it.gstRate ?? booking.gstRateApplied ?? 12)) / 100),
          })),
          subtotal: booking.invoice.subtotal,
          cgstAmount: booking.invoice.cgst,
          sgstAmount: booking.invoice.sgst,
          igstAmount: booking.invoice.igst || 0,
          gstAmount: booking.invoice.cgst + booking.invoice.sgst + (booking.invoice.igst || 0),
          discount: booking.discount || 0,
          totalAmount: booking.amount,
          paidAmount: booking.advancePaid || 0,
          dueAmount: booking.balanceDue ?? booking.amount,
          status: booking.paymentStatus === 'Paid' ? 'Paid' : booking.paymentStatus === 'Partial' ? 'Partial' : 'Pending',
        }),
        { merge: true }
      );
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bookings/rooms/guests/invoices');
  }
}

export async function createReservationAtomic(
  newBooking: Booking,
  room: RoomUnit
): Promise<Booking> {
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(newBooking);
  const nights = diffNights(checkInISO, checkOutISO);
  if (nights <= 0) {
    throw new Error('Check-out date must be at least 1 night after check-in date.');
  }

  // Query active bookings for this room outside transaction to check candidate docs, then verify inside transaction
  const roomBookingsSnap = await getDocs(
    query(collection(db, 'bookings'), where('roomId', '==', room.id))
  );
  const candidateDocRefs = roomBookingsSnap.docs.map((d) => doc(db, 'bookings', d.id));

  // Look up existing guest by phone/email to avoid duplicates
  const normalizedPhone = newBooking.guestPhone.replace(/\s+/g, '');
  const guestsSnap = await getDocs(collection(db, 'guests'));
  const existingGuestDoc = guestsSnap.docs.find((g) => {
    const data = g.data() as GuestCRM;
    const phoneMatch = data.phone?.replace(/\s+/g, '') === normalizedPhone && normalizedPhone.length >= 8;
    const emailMatch =
      newBooking.guestEmail &&
      data.email?.toLowerCase() === newBooking.guestEmail.toLowerCase();
    return phoneMatch || emailMatch;
  });

  const guestId = existingGuestDoc?.id || newBooking.guestId || `guest-${Date.now()}`;
  const finalBooking: Booking = stripUndefined({
    ...newBooking,
    guestId,
    roomId: room.id,
    roomNumber: room.roomName,
    roomType: room.categoryName,
    roomCategory: room.categoryName,
    nights,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await runTransaction(db, async (tx) => {
    const roomSnap = await tx.get(doc(db, 'rooms', room.id));
    if (roomSnap.exists()) {
      const roomData = roomSnap.data() as RoomUnit;
      if (roomData.status === 'Maintenance') {
        throw new Error(`${room.roomName} is currently under Maintenance and cannot be booked.`);
      }
    }

    for (const refDoc of candidateDocRefs) {
      const snap = await tx.get(refDoc);
      if (!snap.exists()) continue;
      const existing = snap.data() as Booking;
      if (existing.bookingStatus === 'Cancelled' || existing.bookingStatus === 'Checked-out') {
        continue;
      }
      const { checkInISO: bStart, checkOutISO: bEnd } = resolveBookingDatesISO(existing);
      const existingPhone = existing.guestPhone?.replace(/\s+/g, '');
      if (
        normalizedPhone.length >= 8 &&
        existingPhone === normalizedPhone &&
        bStart === checkInISO &&
        bEnd === checkOutISO
      ) {
        throw new Error(
          `Duplicate reservation prevented: ${existing.guestName} already has ${existing.bookingCode || existing.id} for these exact dates.`
        );
      }
      if (hasDateOverlap(checkInISO, checkOutISO, bStart, bEnd)) {
        throw new Error(
          `Date conflict: ${room.roomName} is already reserved for ${existing.guestName} (${bStart} to ${bEnd}).`
        );
      }
    }

    // Write booking
    tx.set(doc(db, 'bookings', finalBooking.id), finalBooking);

    // Upsert guest CRM record cleanly without duplicating
    if (existingGuestDoc) {
      const prevGuest = existingGuestDoc.data() as GuestCRM;
      const updatedVisits = [
        {
          id: `vh-${finalBooking.id}`,
          roomName: `${room.roomName} (${room.categoryName})`,
          dateRange: `${finalBooking.startDate} - ${finalBooking.endDate}`,
          nightsCount: nights,
          status: 'Upcoming' as const,
        },
        ...(prevGuest.visitHistory || []),
      ];
      tx.update(doc(db, 'guests', guestId), stripUndefined({
        name: finalBooking.guestName,
        phone: finalBooking.guestPhone,
        email: finalBooking.guestEmail || prevGuest.email,
        location: finalBooking.guestCity || prevGuest.location,
        visitHistory: updatedVisits,
      }));
    } else {
      const freshGuest: GuestCRM = {
        id: guestId,
        name: finalBooking.guestName,
        phone: finalBooking.guestPhone,
        email: finalBooking.guestEmail || '',
        location: finalBooking.guestCity || 'India',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isVIP: false,
        birthday: '',
        anniversary: finalBooking.occasionTag === 'Anniversary' ? 'Logged' : '',
        preferences: finalBooking.preferences || [],
        generalNotes: finalBooking.conciergeRequest || finalBooking.notes[0] || '',
        visitHistory: [
          {
            id: `vh-${finalBooking.id}`,
            roomName: `${room.roomName} (${room.categoryName})`,
            dateRange: `${finalBooking.startDate} - ${finalBooking.endDate}`,
            nightsCount: nights,
            status: 'Upcoming',
          },
        ],
        feedback: [],
        payments: [],
      };
      tx.set(doc(db, 'guests', guestId), stripUndefined(freshGuest));
    }

    // Write invoice doc
    const invoiceDocId = finalBooking.invoice.invoiceNumber.replace(/[^\w-]/g, '_');
    tx.set(doc(db, 'invoices', invoiceDocId), stripUndefined({
      id: invoiceDocId,
      invoiceNumber: finalBooking.invoice.invoiceNumber,
      bookingId: finalBooking.id,
      guestId,
      guestName: finalBooking.guestName,
      guestPhone: finalBooking.guestPhone,
      guestEmail: finalBooking.guestEmail,
      roomNumber: finalBooking.roomNumber,
      issueDate: finalBooking.invoice.date,
      dueDate: finalBooking.invoice.date,
      items: finalBooking.invoice.items.map((it, idx) => ({
        id: `it-${finalBooking.id}-${idx + 1}`,
        description: it.description,
        sacCode: it.sacCode || finalBooking.sacCode || '996311',
        qty: it.qty,
        unitPrice: it.price,
        gstRate: it.gstRate ?? finalBooking.gstRateApplied ?? 12,
        amount: it.amount,
        gstAmount: Math.round((it.amount * (it.gstRate ?? finalBooking.gstRateApplied ?? 12)) / 100),
      })),
      subtotal: finalBooking.invoice.subtotal,
      cgstAmount: finalBooking.invoice.cgst,
      sgstAmount: finalBooking.invoice.sgst,
      igstAmount: finalBooking.invoice.igst || 0,
      gstAmount: finalBooking.invoice.cgst + finalBooking.invoice.sgst + (finalBooking.invoice.igst || 0),
      discount: finalBooking.discount || 0,
      totalAmount: finalBooking.amount,
      paidAmount: finalBooking.advancePaid || 0,
      dueAmount: finalBooking.balanceDue ?? finalBooking.amount,
      status:
        finalBooking.paymentStatus === 'Paid'
          ? 'Paid'
          : finalBooking.paymentStatus === 'Partial'
            ? 'Partial'
            : 'Pending',
    }));

    // Write payment doc if verified advance > 0
    if (finalBooking.payments && finalBooking.payments.length > 0) {
      for (const pay of finalBooking.payments) {
        tx.set(doc(db, 'payments', pay.id), stripUndefined({
          ...pay,
          bookingId: finalBooking.id,
          guestName: finalBooking.guestName,
          folioNumber: finalBooking.folioNumber || finalBooking.invoice.invoiceNumber,
        }));
      }
    }
  });

  return finalBooking;
}

export async function editReservationAtomic(
  updatedBooking: Booking,
  room: RoomUnit
): Promise<Booking> {
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(updatedBooking);
  const nights = diffNights(checkInISO, checkOutISO);
  if (nights <= 0) {
    throw new Error('Check-out date must be at least 1 night after check-in date.');
  }

  const roomBookingsSnap = await getDocs(
    query(collection(db, 'bookings'), where('roomId', '==', room.id))
  );
  const candidateRefs = roomBookingsSnap.docs.map((d) => doc(db, 'bookings', d.id));

  const nextBooking: Booking = stripUndefined({
    ...updatedBooking,
    roomId: room.id,
    roomNumber: room.roomName,
    roomType: room.categoryName,
    roomCategory: room.categoryName,
    nights,
    updatedAt: new Date().toISOString(),
  });

  await runTransaction(db, async (tx) => {
    const roomSnap = await tx.get(doc(db, 'rooms', room.id));
    if (roomSnap.exists() && (roomSnap.data() as RoomUnit).status === 'Maintenance') {
      throw new Error(`${room.roomName} is currently under Maintenance.`);
    }

    for (const refDoc of candidateRefs) {
      const snap = await tx.get(refDoc);
      if (!snap.exists()) continue;
      const existing = snap.data() as Booking;
      if (existing.id === nextBooking.id) continue;
      if (existing.bookingStatus === 'Cancelled' || existing.bookingStatus === 'Checked-out') {
        continue;
      }
      const { checkInISO: bStart, checkOutISO: bEnd } = resolveBookingDatesISO(existing);
      if (hasDateOverlap(checkInISO, checkOutISO, bStart, bEnd)) {
        throw new Error(
          `Date conflict: ${room.roomName} is already booked by ${existing.guestName} (${bStart} to ${bEnd}).`
        );
      }
    }

    tx.set(doc(db, 'bookings', nextBooking.id), nextBooking, { merge: true });

    const invoiceDocId = nextBooking.invoice.invoiceNumber.replace(/[^\w-]/g, '_');
    tx.set(
      doc(db, 'invoices', invoiceDocId),
      stripUndefined({
        id: invoiceDocId,
        invoiceNumber: nextBooking.invoice.invoiceNumber,
        bookingId: nextBooking.id,
        guestName: nextBooking.guestName,
        guestPhone: nextBooking.guestPhone,
        guestEmail: nextBooking.guestEmail,
        roomNumber: nextBooking.roomNumber,
        items: nextBooking.invoice.items.map((it, idx) => ({
          id: `it-${nextBooking.id}-${idx + 1}`,
          description: it.description,
          sacCode: it.sacCode || nextBooking.sacCode || '996311',
          qty: it.qty,
          unitPrice: it.price,
          gstRate: it.gstRate ?? nextBooking.gstRateApplied ?? 12,
          amount: it.amount,
          gstAmount: Math.round((it.amount * (it.gstRate ?? nextBooking.gstRateApplied ?? 12)) / 100),
        })),
        subtotal: nextBooking.invoice.subtotal,
        cgstAmount: nextBooking.invoice.cgst,
        sgstAmount: nextBooking.invoice.sgst,
        igstAmount: nextBooking.invoice.igst || 0,
        gstAmount:
          nextBooking.invoice.cgst + nextBooking.invoice.sgst + (nextBooking.invoice.igst || 0),
        discount: nextBooking.discount || 0,
        totalAmount: nextBooking.amount,
        paidAmount: nextBooking.advancePaid || 0,
        dueAmount: nextBooking.balanceDue ?? Math.max(0, nextBooking.amount - (nextBooking.advancePaid || 0)),
        status:
          nextBooking.paymentStatus === 'Paid'
            ? 'Paid'
            : nextBooking.paymentStatus === 'Partial'
              ? 'Partial'
              : 'Pending',
      }),
      { merge: true }
    );
  });

  return nextBooking;
}

export async function cancelBookingAtomic(booking: Booking): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'bookings', booking.id), {
      bookingStatus: 'Cancelled',
      updatedAt: new Date().toISOString(),
    });
    if (booking.roomId && booking.bookingStatus === 'Checked-in') {
      batch.set(doc(db, 'rooms', booking.roomId), { status: 'Available' }, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
  }
}

export async function checkInBookingInFirestore(booking: Booking): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'bookings', booking.id), {
      bookingStatus: 'Checked-in',
      updatedAt: new Date().toISOString(),
    });
    if (booking.roomId) {
      batch.set(
        doc(db, 'rooms', booking.roomId),
        { status: 'Occupied' },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
  }
}

export async function checkOutBookingInFirestore(booking: Booking): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'bookings', booking.id), {
      bookingStatus: 'Checked-out',
      updatedAt: new Date().toISOString(),
    });
    if (booking.roomId) {
      batch.set(
        doc(db, 'rooms', booking.roomId),
        { status: 'Deep Clean', maintenanceNote: 'Turnover clean after checkout' },
        { merge: true }
      );
    }
    // Automatically queue a Housekeeping turnover task upon checkout
    const hkTask: HousekeepingTask = {
      id: `hk-co-${booking.id}`,
      roomNumber: booking.roomNumber,
      type: booking.roomType || booking.roomCategory || 'Cottage',
      status: 'Pending',
      priority: 'High',
      photoVerified: false,
      completionTime: 'Not Started',
      checklist: [
        { id: 't1', name: 'Strip Bedding & Linen', checked: false },
        { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: false },
        { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
        { id: 't4', name: 'Dusting & Surface Polish', checked: false },
        { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
        { id: 't6', name: 'Quality Photo Verification', checked: false },
      ],
    };
    batch.set(doc(db, 'housekeepingTasks', hkTask.id), stripUndefined(hkTask), { merge: true });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
  }
}

export async function moveBookingRoomAtomic(
  booking: Booking,
  targetRoom: RoomUnit
): Promise<void> {
  const { checkInISO, checkOutISO } = resolveBookingDatesISO(booking);
  const targetSnap = await getDocs(
    query(collection(db, 'bookings'), where('roomId', '==', targetRoom.id))
  );
  const candidateRefs = targetSnap.docs.map((d) => doc(db, 'bookings', d.id));

  await runTransaction(db, async (tx) => {
    const roomSnap = await tx.get(doc(db, 'rooms', targetRoom.id));
    if (roomSnap.exists() && (roomSnap.data() as RoomUnit).status === 'Maintenance') {
      throw new Error(`${targetRoom.roomName} is currently blocked under Maintenance.`);
    }

    for (const refDoc of candidateRefs) {
      const snap = await tx.get(refDoc);
      if (!snap.exists()) continue;
      const existing = snap.data() as Booking;
      if (existing.id === booking.id) continue;
      if (existing.bookingStatus === 'Cancelled' || existing.bookingStatus === 'Checked-out') {
        continue;
      }
      const { checkInISO: bStart, checkOutISO: bEnd } = resolveBookingDatesISO(existing);
      if (hasDateOverlap(checkInISO, checkOutISO, bStart, bEnd)) {
        throw new Error(
          `Cannot move to ${targetRoom.roomName}: overlapping stay with ${existing.guestName}.`
        );
      }
    }

    tx.update(doc(db, 'bookings', booking.id), {
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomName,
      roomType: targetRoom.categoryName,
      roomCategory: targetRoom.categoryName,
      updatedAt: new Date().toISOString(),
    });

    if (booking.bookingStatus === 'Checked-in') {
      if (booking.roomId) {
        tx.set(doc(db, 'rooms', booking.roomId), { status: 'Deep Clean' }, { merge: true });
      }
      tx.set(doc(db, 'rooms', targetRoom.id), { status: 'Occupied' }, { merge: true });
    }
  });
}

export async function recordBookingPaymentAtomic(
  booking: Booking,
  amount: number,
  method: BookingPaymentMethod,
  referenceId: string,
  recordedBy = 'Front Desk'
): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Payment amount must be greater than ₹0.');
  }
  if (method !== 'Cash' && !referenceId.trim()) {
    throw new Error(`Transaction / UTR reference is required for ${method}.`);
  }

  const entry: BookingPaymentEntry = {
    id: `pay-${Date.now()}`,
    amount: Math.round(amount),
    method,
    referenceId: referenceId.trim() || 'CASH-COUNTER',
    recordedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    recordedBy,
    type: 'Settlement',
  };

  await runTransaction(db, async (tx) => {
    const bRef = doc(db, 'bookings', booking.id);
    const snap = await tx.get(bRef);
    const current = (snap.exists() ? snap.data() : booking) as Booking;

    // Duplicate reference guard for non-cash payments
    if (
      method !== 'Cash' &&
      (current.payments || []).some(
        (p) => p.referenceId.trim().toLowerCase() === entry.referenceId.toLowerCase()
      )
    ) {
      throw new Error(`Duplicate payment reference "${entry.referenceId}" already recorded on this booking.`);
    }

    const prevAdvance = current.advancePaid ?? (current.paymentStatus === 'Paid' ? current.amount : 0);
    const remainingDue = Math.max(0, current.amount - prevAdvance);
    if (remainingDue <= 0) {
      throw new Error('This booking folio is already fully paid.');
    }
    if (entry.amount > remainingDue) {
      throw new Error(`Payment exceeds remaining balance due (₹${remainingDue.toLocaleString('en-IN')}).`);
    }

    const nextAdvance = Math.min(current.amount, prevAdvance + entry.amount);
    const nextBalance = Math.max(0, current.amount - nextAdvance);
    const nextPaymentStatus =
      nextBalance === 0 ? 'Paid' : nextAdvance > 0 ? 'Partial' : 'Unpaid';

    const nextPayments = [...(current.payments || []), entry];

    tx.update(bRef, stripUndefined({
      advancePaid: nextAdvance,
      balanceDue: nextBalance,
      paymentStatus: nextPaymentStatus,
      payments: nextPayments,
      updatedAt: new Date().toISOString(),
    }));

    tx.set(doc(db, 'payments', entry.id), stripUndefined({
      ...entry,
      bookingId: booking.id,
      guestName: current.guestName,
      folioNumber: current.folioNumber || current.invoice.invoiceNumber,
    }));

    const invoiceDocId = current.invoice.invoiceNumber.replace(/[^\w-]/g, '_');
    tx.set(
      doc(db, 'invoices', invoiceDocId),
      stripUndefined({
        paidAmount: nextAdvance,
        dueAmount: nextBalance,
        paymentMethod: method,
        paymentReference: entry.referenceId,
        status: nextPaymentStatus === 'Paid' ? 'Paid' : nextPaymentStatus === 'Partial' ? 'Partial' : 'Pending',
      }),
      { merge: true }
    );
  });
}

export async function updateBookingFieldsInFirestore(
  bookingId: string,
  patch: Partial<Booking>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), stripUndefined({
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function updateRoomStatusInFirestore(
  roomId: string,
  status: RoomUnit['status'],
  maintenanceNote?: string
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'rooms', roomId),
      stripUndefined({ status, maintenanceNote: maintenanceNote || '' }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

export async function uploadGuestIdDocument(guestKey: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `guest-ids/${guestKey}/${Date.now()}_${safeName}`);
  const result = await uploadBytes(storageRef, file);
  return getDownloadURL(result.ref);
}
