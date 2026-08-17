import { 
  Arrival, 
  Departure, 
  HousekeepingTask, 
  MaintenanceAlert, 
  OccupancyDay, 
  ResortStats, 
  Booking, 
  RoomCategory, 
  PropertyAmenity, 
  RoomMaintenanceStatus, 
  GuestCRM,
  MaintenanceTicket,
  Technician,
  RecentlyResolvedMaintenance,
  PredictiveMaintenanceAlert
} from './types';

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

export const initialTechnicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Rajesh Malik',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    department: 'General Repair',
    experience: '12y',
    activeTicketsCount: 2,
    completedTicketsCount: 12,
    efficiency: 85,
    avgResolutionTime: '42 mins',
    status: 'Available',
    phone: '+91 98231 44551',
    rating: 4.9,
    specialization: ['HVAC Systems', 'Pumps & Plumbing', 'Masonry & Tiles']
  },
  {
    id: 'tech-2',
    name: 'Vikram Singh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    department: 'Electrical & HVAC',
    experience: '8y',
    activeTicketsCount: 0,
    completedTicketsCount: 16,
    efficiency: 92,
    avgResolutionTime: '35 mins',
    status: 'Available',
    phone: '+91 98450 11223',
    rating: 4.8,
    specialization: ['Main Distribution Panels', 'IoT Smart Locks', 'Wi-Fi APs & Networking']
  },
  {
    id: 'tech-3',
    name: 'Anaya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    department: 'Interior & Plumbing',
    experience: '6y',
    activeTicketsCount: 2,
    completedTicketsCount: 10,
    efficiency: 88,
    avgResolutionTime: '48 mins',
    status: 'On Break',
    phone: '+91 98711 33445',
    rating: 4.7,
    specialization: ['High-Pressure Showers', 'Custom Carpentry', 'Terracotta Tile Replacement']
  },
  {
    id: 'tech-4',
    name: 'Karan Kumar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    department: 'Appliances & AV',
    experience: '5y',
    activeTicketsCount: 1,
    completedTicketsCount: 9,
    efficiency: 82,
    avgResolutionTime: '50 mins',
    status: 'Busy',
    phone: '+91 99002 88991',
    rating: 4.6,
    specialization: ['Mini-bar Chillers', 'Smart TVs', 'Kitchen Equipment']
  },
  {
    id: 'tech-5',
    name: 'Ramesh Singh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    department: 'Civil & Structural',
    experience: '14y',
    activeTicketsCount: 0,
    completedTicketsCount: 14,
    efficiency: 90,
    avgResolutionTime: '65 mins',
    status: 'Available',
    phone: '+91 98111 22334',
    rating: 4.9,
    specialization: ['Waterproofing & Sealants', 'Balcony Deck Wood Care', 'Roofing Tiles']
  }
];

export const initialMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'TKT-1041',
    title: 'AC Leaking - Water dripping',
    description: 'Continuous water dripping from the indoor split AC unit above the master luggage rack. Condensation tray is overflowed and needs drain pipe flush.',
    roomNumber: 'Deluxe Villa #104',
    area: 'Master Bedroom / Luggage Annex',
    category: 'HVAC',
    priority: 'Emergency',
    status: 'In Progress',
    reportedBy: 'Anita Desai (Housekeeping)',
    reportedDate: 'Today, Oct 24',
    reportedTime: '10:45 AM',
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Rajesh M.',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'General Repair',
    estimatedCompletionTime: '45 mins',
    actualResolutionTime: undefined,
    isRoomBlocked: true,
    cost: {
      parts: 1800,
      labor: 800,
      vendor: 0,
      total: 2600
    },
    attachments: [
      { id: 'att-1', name: 'AC_Drip_Photo.jpg', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', type: 'image', size: '2.4 MB' },
      { id: 'att-2', name: 'Drain_Telemetry.pdf', url: '#', type: 'doc', size: '340 KB' }
    ],
    timeline: [
      { id: 'tm-1', title: 'Ticket Created', time: '10:45 AM', author: 'Anita Desai (Housekeeping)', note: 'Guest noticed puddle under luggage rack.', done: true },
      { id: 'tm-2', title: 'Assigned to Rajesh Malik', time: '10:48 AM', author: 'Arun K. (Ops Manager)', note: 'High priority dispatch.', done: true },
      { id: 'tm-3', title: 'Technician Started Work', time: '10:55 AM', author: 'Rajesh Malik', note: 'Inspecting evaporator coil and condensation pan.', done: true },
      { id: 'tm-4', title: 'Part Required', time: '11:10 AM', author: 'Rajesh Malik', note: 'Flexible drain siphon pipe replacement.', done: true },
      { id: 'tm-5', title: 'Part Added from Store', time: '11:20 AM', author: 'Inventory Desk', note: 'Part #DP-14 Issued ($22).', done: false },
      { id: 'tm-6', title: 'Repair Completed', time: 'Pending', author: 'Rajesh Malik', done: false },
      { id: 'tm-7', title: 'Manager Verified', time: 'Pending', author: 'Arun K.', done: false },
      { id: 'tm-8', title: 'Ticket Closed & Room Unblocked', time: 'Pending', author: 'Front Desk', done: false }
    ],
    parts: [
      { id: 'prt-1', name: 'Flexible Drain Siphon Pipe (1.5m)', quantity: 1, cost: 1200, status: 'Ordered' },
      { id: 'prt-2', name: 'Condensation Sealant Ring', quantity: 2, cost: 600, status: 'In Stock' }
    ],
    managerNotes: 'Urgent room turnaround required before 02:00 PM VIP check-in.'
  },
  {
    id: 'TKT-1042',
    title: 'Broken Tile - Balcony',
    description: 'Hairline crack and loose non-slip terracotta tile on the sea-facing balcony corner. Potential trip hazard for guests.',
    roomNumber: 'Sunset Suite #202',
    area: 'Private Sea Balcony',
    category: 'Civil/Structural',
    priority: 'Medium',
    status: 'Waiting for Parts',
    reportedBy: 'Housekeeping Team',
    reportedDate: 'Today, Oct 24',
    reportedTime: '08:12 AM',
    assignedTechnicianId: 'tech-3',
    assignedTechnicianName: 'Anaya S.',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'Interior & Plumbing',
    estimatedCompletionTime: '2 hours',
    isRoomBlocked: false,
    cost: {
      parts: 950,
      labor: 600,
      vendor: 0,
      total: 1550
    },
    attachments: [
      { id: 'att-3', name: 'Balcony_Tile_Crack.jpg', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', type: 'image', size: '1.8 MB' }
    ],
    timeline: [
      { id: 'tm-11', title: 'Ticket Created', time: '08:12 AM', author: 'Housekeeping Team', note: 'Spotted during morning checkout cleaning.', done: true },
      { id: 'tm-12', title: 'Assigned to Anaya Sharma', time: '08:30 AM', author: 'Arun K.', done: true },
      { id: 'tm-13', title: 'Part Required', time: '09:00 AM', author: 'Anaya Sharma', note: 'Matching Konkan terracotta outdoor tile required from vendor.', done: true },
      { id: 'tm-14', title: 'Awaiting Vendor Delivery', time: '09:15 AM', author: 'Procurement Dept', done: false }
    ],
    parts: [
      { id: 'prt-3', name: 'Terracotta Non-slip Tile (30x30cm)', quantity: 3, cost: 950, status: 'Ordered' }
    ]
  },
  {
    id: 'TKT-1043',
    title: 'Door Lock Malfunction',
    description: 'RFID smart lock reader fails intermittently after morning sea fog. Keycards flash red 4 out of 5 attempts. Battery voltage low warning.',
    roomNumber: 'Beachfront #005',
    area: 'Main Entrance Door',
    category: 'Door & Lock',
    priority: 'High',
    status: 'Reported',
    reportedBy: 'Front Desk (Arun K.)',
    reportedDate: 'Yesterday, Oct 23',
    reportedTime: '05:40 PM',
    assignedTechnicianId: undefined,
    assignedTechnicianName: undefined,
    assignedDepartment: undefined,
    estimatedCompletionTime: '30 mins',
    isRoomBlocked: true,
    cost: {
      parts: 2400,
      labor: 500,
      vendor: 0,
      total: 2900
    },
    attachments: [],
    timeline: [
      { id: 'tm-21', title: 'Ticket Created', time: '05:40 PM', author: 'Arun K. (Front Desk)', note: 'Guest reported lock refused NFC card 3 times.', done: true }
    ],
    parts: [
      { id: 'prt-4', name: 'CR123A Lithium Cells (4-pack)', quantity: 1, cost: 1200, status: 'In Stock' },
      { id: 'prt-5', name: 'RFID Antenna Moisture Shield', quantity: 1, cost: 1200, status: 'In Stock' }
    ]
  },
  {
    id: 'TKT-1044',
    title: 'Jacuzzi Jet Pressure Low',
    description: 'Circulation hydro-pump in private outdoor jacuzzi making humming noise with reduced water pressure. Flow sensor reading 40% below benchmark.',
    roomNumber: 'Royal Villa #108',
    area: 'Private Jacuzzi Deck',
    category: 'Plumbing',
    priority: 'High',
    status: 'In Progress',
    reportedBy: 'Guest: Arjun M.',
    reportedDate: 'Today, Oct 24',
    reportedTime: '09:30 AM',
    assignedTechnicianId: 'tech-2',
    assignedTechnicianName: 'Vikram Singh',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'Electrical & HVAC',
    estimatedCompletionTime: '1 hour',
    isRoomBlocked: true,
    cost: {
      parts: 3200,
      labor: 1200,
      vendor: 0,
      total: 4400
    },
    attachments: [
      { id: 'att-4', name: 'Pump_Audio_Recording.mp3', url: '#', type: 'video', size: '3.1 MB' }
    ],
    timeline: [
      { id: 'tm-31', title: 'Ticket Created', time: '09:30 AM', author: 'Guest App', done: true },
      { id: 'tm-32', title: 'Assigned to Vikram Singh', time: '09:35 AM', author: 'Arun K.', done: true },
      { id: 'tm-33', title: 'Technician Started Work', time: '09:50 AM', author: 'Vikram Singh', note: 'Impeller de-clogging and capacitor test underway.', done: true }
    ]
  },
  {
    id: 'TKT-1045',
    title: 'WiFi Repeater Offline',
    description: 'Wi-Fi 6 access point signal drops in master bathroom and study desk. Gateway port ping test timed out.',
    roomNumber: 'Garden Cottage #304',
    area: 'Study Corner & Bathroom',
    category: 'Internet/Wi-Fi',
    priority: 'Low',
    status: 'Assigned',
    reportedBy: 'Guest App Report',
    reportedDate: 'Today, Oct 24',
    reportedTime: '11:20 AM',
    assignedTechnicianId: 'tech-2',
    assignedTechnicianName: 'Vikram Singh',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'Electrical & HVAC',
    estimatedCompletionTime: '20 mins',
    isRoomBlocked: false,
    cost: {
      parts: 0,
      labor: 400,
      vendor: 0,
      total: 400
    },
    attachments: [],
    timeline: [
      { id: 'tm-41', title: 'Ticket Created', time: '11:20 AM', author: 'Guest App', done: true },
      { id: 'tm-42', title: 'Assigned to Vikram Singh', time: '11:25 AM', author: 'Arun K.', done: true }
    ]
  },
  {
    id: 'TKT-1046',
    title: 'Shower Basin Drainage Slow',
    description: 'Shower basin takes ~10 minutes to drain after bath. Sand and organic buildup suspected from private beach access.',
    roomNumber: 'Deluxe Sea View #205',
    area: 'Master En-suite Bathroom',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'In Progress',
    reportedBy: 'Sunita Bai (Housekeeping)',
    reportedDate: 'Yesterday, Oct 23',
    reportedTime: '03:15 PM',
    assignedTechnicianId: 'tech-3',
    assignedTechnicianName: 'Anaya S.',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'Interior & Plumbing',
    estimatedCompletionTime: '35 mins',
    isRoomBlocked: false,
    cost: {
      parts: 450,
      labor: 500,
      vendor: 0,
      total: 950
    },
    attachments: [],
    timeline: [
      { id: 'tm-51', title: 'Ticket Created', time: '03:15 PM', author: 'Sunita Bai', done: true },
      { id: 'tm-52', title: 'Assigned to Anaya Sharma', time: '03:30 PM', author: 'Arun K.', done: true },
      { id: 'tm-53', title: 'Technician Started Work', time: '04:00 PM', author: 'Anaya Sharma', done: true }
    ]
  },
  {
    id: 'TKT-1047',
    title: 'Mini Bar Chiller Vibration',
    description: 'Subtle humming vibration from compressor foot mount when chilling beverage inventory.',
    roomNumber: 'Executive Suite #301',
    area: 'Bar Cabinet',
    category: 'Appliance',
    priority: 'Low',
    status: 'Resolved',
    reportedBy: 'Karan Kumar',
    reportedDate: 'Yesterday, Oct 23',
    reportedTime: '02:15 PM',
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Rajesh Malik',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'General Repair',
    estimatedCompletionTime: '25 mins',
    actualResolutionTime: '22 mins',
    isRoomBlocked: false,
    cost: {
      parts: 350,
      labor: 400,
      vendor: 0,
      total: 750
    },
    attachments: [],
    timeline: [
      { id: 'tm-61', title: 'Ticket Created', time: '02:15 PM', author: 'Karan Kumar', done: true },
      { id: 'tm-62', title: 'Repaired & Leveled', time: '02:37 PM', author: 'Rajesh Malik', note: 'Replaced rubber anti-vibration foot pad.', done: true },
      { id: 'tm-63', title: 'Manager Verified', time: '03:00 PM', author: 'Arun K.', done: true }
    ]
  },
  {
    id: 'TKT-1048',
    title: 'Main Pool Multi-port Sand Filter Valve Sticking',
    description: 'Sand filtration valve stuck in recirculate mode. Pool zone cordoned off for routine backwash and chlorine dosing check.',
    roomNumber: 'Infinity Pool Zone A',
    area: 'Outdoor Amenities',
    category: 'Plumbing',
    priority: 'Emergency',
    status: 'In Progress',
    reportedBy: 'Facility Ops',
    reportedDate: 'Today, Oct 24',
    reportedTime: '07:00 AM',
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Rajesh Malik',
    assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    assignedDepartment: 'General Repair',
    estimatedCompletionTime: '3 hours',
    isRoomBlocked: true,
    cost: {
      parts: 4500,
      labor: 1500,
      vendor: 3000,
      total: 9000
    },
    attachments: [],
    timeline: [
      { id: 'tm-71', title: 'Ticket Created', time: '07:00 AM', author: 'Facility Ops', done: true },
      { id: 'tm-72', title: 'Dispatched to Rajesh Malik', time: '07:10 AM', author: 'Arun K.', done: true },
      { id: 'tm-73', title: 'Technician on Site', time: '07:25 AM', author: 'Rajesh Malik', done: true }
    ]
  }
];

export const initialRecentlyResolved: RecentlyResolvedMaintenance[] = [
  {
    id: 'rr-1',
    title: 'Faucet Leak Fixed',
    roomNumber: 'Room 302',
    technicianName: 'Rajesh M.',
    technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    completedAgo: '2h ago',
    resolutionTime: '28 mins',
    verificationStatus: 'Verified'
  },
  {
    id: 'rr-2',
    title: 'WiFi Router Reset',
    roomNumber: 'Room 104',
    technicianName: 'Vikram S.',
    technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    completedAgo: '4h ago',
    resolutionTime: '15 mins',
    verificationStatus: 'Verified'
  },
  {
    id: 'rr-3',
    title: 'Balcony Lock Lubrication',
    roomNumber: 'Villa #205',
    technicianName: 'Anaya S.',
    technicianAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    completedAgo: '6h ago',
    resolutionTime: '20 mins',
    verificationStatus: 'Verified'
  },
  {
    id: 'rr-4',
    title: 'Ceiling Fan Regulator Replaced',
    roomNumber: 'Room 110',
    technicianName: 'Vikram S.',
    technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    completedAgo: 'Yesterday',
    resolutionTime: '32 mins',
    verificationStatus: 'Auto-Closed'
  }
];

export const initialPredictiveAlerts: PredictiveMaintenanceAlert[] = [
  {
    id: 'pma-1',
    equipment: 'Daikin Multi-Split Inverter AC',
    roomNumber: 'Villa #104',
    issuePrediction: 'Possible HVAC Failure',
    riskScore: 82,
    reason: '3 HVAC-related complaints in the last 30 days. Most recent issue was reported today. Telemetry indicates elevated compressor head temperature.',
    recommendedAction: 'Schedule preventive inspection and chemical coil flush before next guest check-in.',
    category: 'HVAC'
  },
  {
    id: 'pma-2',
    equipment: 'Grohe Pressure Balance Cartridge',
    roomNumber: 'Villa #205',
    issuePrediction: 'Water Pressure Drop Risk',
    riskScore: 67,
    reason: 'Inline pressure sensor telemetry detected an 18% variance under high resort occupancy hours.',
    recommendedAction: 'Inspect inline booster pressure regulator and replace internal mesh filter.',
    category: 'Plumbing'
  },
  {
    id: 'pma-3',
    equipment: 'Assa Abloy RFID Smart Deadbolt',
    roomNumber: 'Beachfront #005',
    issuePrediction: 'Door Lock Battery Depletion',
    riskScore: 91,
    reason: 'Lock telemetry reported battery voltage dropped to 3.2V (critical threshold 3.0V). Humidity degradation detected on contacts.',
    recommendedAction: 'Replace CR123A battery cells and apply silicone gasket sealant immediately.',
    category: 'Door & Lock'
  },
  {
    id: 'pma-4',
    equipment: 'Solar Water Heating System (Zone B)',
    roomNumber: 'Cottages 201-206',
    issuePrediction: 'Thermal Exchanger Mineral Scaling',
    riskScore: 74,
    reason: 'Thermal transfer coefficient down 14% over 4 weeks due to Konkan coastal groundwater hardness.',
    recommendedAction: 'Execute non-toxic citric acid descaling flush during tomorrow morning low-demand window.',
    category: 'Electrical'
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

export const initialMaintenance: MaintenanceAlert[] = [
  { id: 'm-1', roomNumber: 'Room 402', title: 'AC Leak Repair', priority: 'High', status: 'Open' },
  { id: 'm-2', roomNumber: 'Room 105', title: 'Door Lock Battery', priority: 'Medium', status: 'Open' },
  { id: 'm-3', roomNumber: 'Room 208', title: 'Water Pressure Low', priority: 'Low', status: 'Resolved' }
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


