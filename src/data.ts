import { Arrival, Departure, HousekeepingTask, MaintenanceAlert, OccupancyDay, ResortStats, Booking, RoomCategory, PropertyAmenity, RoomMaintenanceStatus, GuestCRM } from './types';

export const initialBookings: Booking[] = [
  {
    id: 'b-1',
    guestName: 'Rajesh Kumar',
    guestEmail: 'rajesh.k@example.com',
    guestPhone: '+91 98765 43210',
    roomNumber: '101 Deluxe',
    roomType: '101 Deluxe',
    roomCategory: 'King Bed',
    startDate: 'Oct 14',
    endDate: 'Oct 17',
    nights: 3,
    amount: 14500,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    avatar: 'RK',
    membership: 'Platinum Member',
    totalSpend: 145200,
    avgDailyRate: 4800,
    notes: [
      "Prefers high floors and extra towels. Allergic to peanuts.",
      "Enjoys kokum sharbat upon arrival. Prefers quiet rooms away from the dining area. Always travels with family during summer breaks."
    ],
    preferences: ["Vegetarian", "Requested sea-view", "High-floor preferred", "Anniversary in March"],
    stayHistory: [
      { id: 'sh-1', room: 'Heritage Sea-View Suite (Room 302)', roomType: 'Suite', dates: 'Oct 12 - Oct 15, 2023', nights: 3, amount: 32500, status: 'PAID' },
      { id: 'sh-2', room: 'Private Pool Villa (Villa 05)', roomType: 'Villa', dates: 'May 02 - May 06, 2023', nights: 4, amount: 48000, status: 'PAID' },
      { id: 'sh-3', room: 'Deluxe Garden Room (Room 108)', roomType: 'Deluxe', dates: 'Dec 20 - Dec 22, 2022', nights: 2, amount: 14500, status: 'PAID' }
    ],
    invoice: {
      invoiceNumber: 'KR-2023-8942',
      date: 'October 24, 2023',
      items: [
        { description: 'Heritage Sea-View Suite', qty: 3, price: 12500, amount: 37500 },
        { description: 'Breakfast Buffet', qty: 3, price: 1200, amount: 3600 },
        { description: 'Extra Bed', qty: 1, price: 2000, amount: 2000 }
      ],
      subtotal: 43100,
      cgst: 3879,
      sgst: 3879,
      total: 50858
    }
  },
  {
    id: 'b-2',
    guestName: 'Anita Singh',
    guestEmail: 'anita.s@example.com',
    guestPhone: '+91 88888 77777',
    roomNumber: '102 Suite',
    roomType: '102 Suite',
    roomCategory: 'Terrace',
    startDate: 'Oct 19',
    endDate: 'Oct 21',
    nights: 2,
    amount: 22000,
    bookingStatus: 'Pending',
    paymentStatus: 'Unpaid',
    avatar: 'AS',
    membership: 'Gold Member',
    totalSpend: 22000,
    avgDailyRate: 11000,
    notes: [
      "Requested early check-in at 10 AM.",
      "Prefers King size bed."
    ],
    preferences: ["Gluten Free", "Early Check-in"],
    stayHistory: [
      { id: 'sh-4', room: 'Deluxe Suite (Room 102)', roomType: 'Suite', dates: 'Aug 12 - Aug 15, 2023', nights: 3, amount: 12400, status: 'PAID' }
    ],
    invoice: {
      invoiceNumber: 'KR-2023-1104',
      date: 'August 15, 2023',
      items: [
        { description: 'Deluxe Suite Stay', qty: 3, price: 3800, amount: 11400 },
        { description: 'Room Service Dinner', qty: 1, price: 1000, amount: 1000 }
      ],
      subtotal: 12400,
      cgst: 1116,
      sgst: 1116,
      total: 14632
    }
  },
  {
    id: 'b-3',
    guestName: 'Vikram Mehta',
    guestEmail: 'vikram.mehta@outlook.com',
    guestPhone: '+91 76543 21098',
    roomNumber: '103 Sea View',
    roomType: '103 Sea View',
    roomCategory: 'Balcony',
    startDate: 'Oct 15',
    endDate: 'Oct 19',
    nights: 4,
    amount: 18000,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    avatar: 'VM',
    membership: 'Regular Guest',
    totalSpend: 18000,
    avgDailyRate: 4500,
    notes: ["Likes coastal seafood and local recommendations."],
    preferences: ["High-floor preferred"],
    stayHistory: [],
    invoice: {
      invoiceNumber: 'KR-2023-4567',
      date: 'October 19, 2023',
      items: [
        { description: 'Sea View Stay', qty: 4, price: 4500, amount: 18000 }
      ],
      subtotal: 18000,
      cgst: 1620,
      sgst: 1620,
      total: 21240
    }
  }
];

export const initialArrivals: Arrival[] = [
  {
    id: 'arr-1',
    guestName: 'Rajesh Kumar',
    roomNumber: '102',
    status: 'Checked In',
    avatar: 'RK',
    phone: '+91 98765 43210',
    checkInTime: '09:30 AM'
  },
  {
    id: 'arr-2',
    guestName: 'Sarah D\'Souza',
    roomNumber: '204',
    status: 'Arriving',
    avatar: 'SD',
    phone: '+91 87654 32109',
    checkInTime: '01:30 PM'
  },
  {
    id: 'arr-3',
    guestName: 'Vikram Mehta',
    roomNumber: '108',
    status: 'Expected',
    avatar: 'VM',
    phone: '+91 76543 21098',
    checkInTime: '03:00 PM'
  },
  {
    id: 'arr-4',
    guestName: 'Neha Sharma',
    roomNumber: '302',
    status: 'Expected',
    avatar: 'NS',
    phone: '+91 65432 10987',
    checkInTime: '05:30 PM'
  }
];

export const initialDepartures: Departure[] = [
  {
    id: 'dep-1',
    guestName: 'Amit Shah',
    roomNumber: '105',
    status: 'Pending',
    avatar: 'AS',
    checkoutTime: '11:00 AM',
    amountDue: 4500
  },
  {
    id: 'dep-2',
    guestName: 'Priya Rai',
    roomNumber: '301',
    status: 'Checked Out',
    avatar: 'PR',
    checkoutTime: '09:15 AM',
    amountDue: 0
  },
  {
    id: 'dep-3',
    guestName: 'John Doe',
    roomNumber: '215',
    status: 'Scheduled',
    avatar: 'JD',
    checkoutTime: '12:00 PM',
    amountDue: 3700
  },
  {
    id: 'dep-4',
    guestName: 'Rohan Gupta',
    roomNumber: '110',
    status: 'Scheduled',
    avatar: 'RG',
    checkoutTime: '12:30 PM',
    amountDue: 0
  }
];

export const initialHousekeeping: HousekeepingTask[] = [
  {
    id: 'hk-1',
    roomNumber: 'Room 204',
    type: 'Deluxe Sea View',
    status: 'Pending',
    priority: 'Urgent',
    assignedTo: undefined,
    assignedAvatar: undefined,
    photoVerified: false,
    completionTime: 'Not Started',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: false },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: false },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
      { id: 't4', name: 'Dusting & Surface Polish', checked: false },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
      { id: 't6', name: 'Quality Photo Verification', checked: false }
    ]
  },
  {
    id: 'hk-2',
    roomNumber: 'Room 102',
    type: 'Standard Garden',
    status: 'Pending',
    priority: 'Normal',
    assignedTo: 'Rohan K.',
    assignedAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    photoVerified: false,
    completionTime: '0/6 Tasks',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: false },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: false },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
      { id: 't4', name: 'Dusting & Surface Polish', checked: false },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
      { id: 't6', name: 'Quality Photo Verification', checked: false }
    ]
  },
  {
    id: 'hk-3',
    roomNumber: 'Room 301',
    type: 'Premium Suite',
    status: 'In Progress',
    priority: 'Normal',
    assignedTo: 'Meena S.',
    assignedAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    photoVerified: false,
    completionTime: '25m elapsed',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: true },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: true },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: true },
      { id: 't4', name: 'Dusting & Surfaces', checked: true },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
      { id: 't6', name: 'Balcony Glass Cleaning', checked: false },
      { id: 't7', name: 'Replenish Coffee & Herbal Tea pods', checked: false },
      { id: 't8', name: 'Quality Photo Verification', checked: false }
    ]
  },
  {
    id: 'hk-4',
    roomNumber: 'Room 205',
    type: 'Deluxe Sea View',
    status: 'Cleaned',
    priority: 'High',
    assignedTo: 'Arjun V.',
    assignedAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    photoVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80',
    completionTime: '42 mins',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: true },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: true },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: true },
      { id: 't4', name: 'Dusting & Surface Polish', checked: true },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: true },
      { id: 't6', name: 'Quality Photo Verification', checked: true }
    ]
  },
  {
    id: 'hk-5',
    roomNumber: 'Room 105',
    type: 'Luxury Beach Villa',
    status: 'Pending',
    priority: 'High',
    assignedTo: undefined,
    assignedAvatar: undefined,
    photoVerified: false,
    completionTime: 'Not Started',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: false },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: false },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
      { id: 't4', name: 'Dusting & Surface Polish', checked: false },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
      { id: 't6', name: 'Private Pool deck cleaning', checked: false },
      { id: 't7', name: 'Jacuzzi Sanitation', checked: false },
      { id: 't8', name: 'Quality Photo Verification', checked: false }
    ]
  },
  {
    id: 'hk-6',
    roomNumber: 'Room 108',
    type: 'Deluxe Suite',
    status: 'In Progress',
    priority: 'Normal',
    assignedTo: 'Sunita Bai',
    assignedAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    photoVerified: false,
    completionTime: '12m elapsed',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: true },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: true },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: false },
      { id: 't4', name: 'Dusting & Surface Polish', checked: false },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: false },
      { id: 't6', name: 'Quality Photo Verification', checked: false }
    ]
  },
  {
    id: 'hk-7',
    roomNumber: 'Room 110',
    type: 'Standard Garden',
    status: 'Verified',
    priority: 'Normal',
    assignedTo: 'Karan Kumar',
    assignedAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    photoVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=500&q=80',
    completionTime: '28 mins',
    checklist: [
      { id: 't1', name: 'Strip Bedding & Linen', checked: true },
      { id: 't2', name: 'Sanitize Bathroom & Fixtures', checked: true },
      { id: 't3', name: 'Replenish Minibar & Amenities', checked: true },
      { id: 't4', name: 'Dusting & Surface Polish', checked: true },
      { id: 't5', name: 'Floor Vacuuming & Mopping', checked: true },
      { id: 't6', name: 'Quality Photo Verification', checked: true }
    ]
  }
];

export const initialMaintenance: MaintenanceAlert[] = [
  {
    id: 'maint-1',
    roomNumber: '212',
    title: 'AC cooling unit leakage',
    priority: 'High',
    status: 'In Progress'
  },
  {
    id: 'maint-2',
    roomNumber: '104',
    title: 'Geyser thermostat malfunctioning',
    priority: 'Medium',
    status: 'Open'
  },
  {
    id: 'maint-3',
    roomNumber: '305',
    title: 'Balcony door lock jammed',
    priority: 'Low',
    status: 'Open'
  }
];

export const initialOccupancyHistory: OccupancyDay[] = [
  { day: 'Mon', rate: 65, bookings: 13 },
  { day: 'Tue', rate: 70, bookings: 14 },
  { day: 'Wed', rate: 75, bookings: 15 },
  { day: 'Thu', rate: 80, bookings: 16 },
  { day: 'Fri', rate: 90, bookings: 18 },
  { day: 'Sat', rate: 95, bookings: 19 },
  { day: 'Sun', rate: 85, bookings: 17 }
];

export const initialStats: ResortStats = {
  occupancyRate: 85,
  occupancyGrowth: 2,
  revenue: 24500,
  revenueGrowth: 12,
  arrivalsTodayCount: 4,
  departuresTodayCount: 6,
  pendingPaymentsAmount: 8200
};

export const resortDetails = {
  name: 'Konkan Retreat',
  branding: 'Mykonos Cottage',
  tagline: 'Luxury Coastal Sanctuary',
  location: 'Ratnagiri, Konkan',
  weather: '28°C Sunny',
  event: 'Local Seafood Festival nearby',
  bannerImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
};

export const initialRoomCategories: RoomCategory[] = [
  {
    id: 'cat-1',
    name: 'Luxury Suite',
    description: 'Spacious panoramic ocean views with private terrace.',
    activeCount: 8,
    amenities: ['Jacuzzi', 'Mini-bar'],
    basePrice: 12500,
    weekendPrice: 15000,
    peakPrice: 22000,
    iconType: 'suite'
  },
  {
    id: 'cat-2',
    name: 'Deluxe Sea View',
    description: 'Mid-range comfort featuring premium coastal breeze.',
    activeCount: 12,
    amenities: ['Wi-Fi 6', 'Climate Ctrl'],
    basePrice: 8500,
    weekendPrice: 10200,
    peakPrice: 14500,
    iconType: 'sea-view'
  },
  {
    id: 'cat-3',
    name: 'Garden Cottage',
    description: 'Quiet retreats nestled in lush local tropical flora.',
    activeCount: 15,
    amenities: ['Private Deck'],
    basePrice: 6200,
    weekendPrice: 7400,
    peakPrice: 9800,
    iconType: 'cottage'
  }
];

export const initialPropertyAmenities: PropertyAmenity[] = [
  { id: 'pa-1', name: 'Infinity Pool', status: 'Enabled', icon: 'pool' },
  { id: 'pa-2', name: 'High-speed Wi-Fi', status: 'Enabled', icon: 'wifi' },
  { id: 'pa-3', name: 'Ayurvedic Spa', status: 'Offline', icon: 'spa' },
  { id: 'pa-4', name: 'In-room Dining', status: 'Enabled', icon: 'dining' }
];

export const initialRoomMaintenance: RoomMaintenanceStatus[] = [
  { id: 'rm-1', roomNumber: 'Room 402', roomType: 'Suite', issue: 'AC Leak Repair', status: 'Under Repair' },
  { id: 'rm-2', roomNumber: 'Room 105', roomType: 'Cottage', issue: 'Check-out Inspection', status: 'Pending' },
  { id: 'rm-3', roomNumber: 'Room 208', roomType: 'Deluxe', issue: 'Ready for Check-in', status: 'Verified' },
  { id: 'rm-4', roomNumber: 'Room 301', roomType: 'Deluxe', issue: 'Deep Clean Schedule', status: 'Scheduled' }
];

export const initialGuestsCRM: GuestCRM[] = [
  {
    id: 'g-1',
    name: 'Arjun Mehta',
    phone: '+91 98765 43210',
    email: 'arjun.mehta@outlook.com',
    location: 'Mumbai, India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isVIP: true,
    birthday: 'Oct 12',
    anniversary: 'Dec 05',
    preferences: ['Jain food', 'Nut Allergy', 'Sea View', 'High Floor'],
    generalNotes: 'Loves morning yoga by the beach. Always requests two extra towels and caffeine-free tea in the evening.',
    visitHistory: [
      { id: 'vh-1', roomName: 'Sea-View Premium Suite', dateRange: 'Dec 12 - Dec 15, 2023', nightsCount: 3, status: 'Completed' },
      { id: 'vh-2', roomName: 'Luxury Beach Villa', dateRange: 'Oct 10 - Oct 14, 2023', nightsCount: 4, status: 'Completed' }
    ],
    feedback: [
      { id: 'fb-1', rating: 5, comments: 'The hospitality here is unmatched. The team remembered my preference for Jain food from my last visit without me mentioning it.', stayLabel: 'Stay: Dec 2023 • Sea-View Suite' },
      { id: 'fb-2', rating: 4, comments: 'Beautiful property and excellent staff. Would have loved a slightly earlier breakfast option for early morning beach walks.', stayLabel: 'Stay: Oct 2023 • Beach Villa' }
    ],
    payments: [
      { id: 'py-1', invoiceId: '#KR-2023-4421', date: 'Dec 15, 2023', amount: 45200, status: 'Paid via Card' },
      { id: 'py-2', invoiceId: '#KR-2023-1289', date: 'Oct 14, 2023', amount: 82450, status: 'Paid via UPI' }
    ]
  },
  {
    id: 'g-2',
    name: 'Anita Singh',
    phone: '+91 88888 77777',
    email: 'anita.s@example.com',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    isVIP: false,
    birthday: 'Aug 15',
    anniversary: 'Feb 14',
    preferences: ['Gluten Free', 'Early Check-in', 'Extra Pillows'],
    generalNotes: 'Prefers low-floor garden cottages. Allergic to gluten. Enjoys chamomile tea before sleep.',
    visitHistory: [
      { id: 'vh-3', roomName: 'Deluxe Suite (Room 102)', dateRange: 'Aug 12 - Aug 15, 2023', nightsCount: 3, status: 'Completed' }
    ],
    feedback: [
      { id: 'fb-3', rating: 5, comments: 'Lovely stay. The room service was prompt and the room was incredibly clean.', stayLabel: 'Stay: Aug 2023 • Suite 102' }
    ],
    payments: [
      { id: 'py-3', invoiceId: '#KR-2023-1104', date: 'Aug 15, 2023', amount: 12400, status: 'Paid via Card' }
    ]
  },
  {
    id: 'g-3',
    name: 'Rajesh Kumar',
    phone: '+91 99112 23344',
    email: 'rajesh.k@example.com',
    location: 'Bengaluru, India',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isVIP: true,
    birthday: 'Mar 22',
    anniversary: 'May 10',
    preferences: ['Vegetarian', 'High-floor preferred', 'Extra Towels'],
    generalNotes: 'Prefers quiet rooms away from dining areas. Travels with family during summer breaks.',
    visitHistory: [
      { id: 'vh-4', roomName: 'Heritage Sea-View Suite (Room 302)', dateRange: 'Oct 12 - Oct 15, 2023', nightsCount: 3, status: 'Completed' }
    ],
    feedback: [
      { id: 'fb-4', rating: 4.5, comments: 'Excellent hospitality. The sunset view from room 302 is breathtaking.', stayLabel: 'Stay: Oct 2023 • Sea-View Suite' }
    ],
    payments: [
      { id: 'py-4', invoiceId: '#KR-2023-8942', date: 'Oct 15, 2023', amount: 50858, status: 'Paid via UPI' }
    ]
  }
];


