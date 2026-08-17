import { 
  BillingInvoice, 
  RevenueMonthlyMetric, 
  BillingSubscriptionUsage, 
  UnbilledStayItem, 
  BankSettlementBatch,
  MyraFinanceAssistantInsight 
} from '../types';

export const initialMonthlyRevenueData: RevenueMonthlyMetric[] = [
  { month: 'Jan', revenue: 1820000, gst: 327600, refunds: 22000, occupancyRate: 74, roomRevenue: 1350000, fnbRevenue: 370000, spaRevenue: 100000 },
  { month: 'Feb', revenue: 2040000, gst: 367200, refunds: 38000, occupancyRate: 82, roomRevenue: 1520000, fnbRevenue: 410000, spaRevenue: 110000 },
  { month: 'Mar', revenue: 1780000, gst: 320400, refunds: 12000, occupancyRate: 71, roomRevenue: 1300000, fnbRevenue: 380000, spaRevenue: 100000 },
  { month: 'Apr', revenue: 2290000, gst: 412200, refunds: 29000, occupancyRate: 86, roomRevenue: 1710000, fnbRevenue: 460000, spaRevenue: 120000 },
  { month: 'May', revenue: 2380000, gst: 428400, refunds: 18000, occupancyRate: 89, roomRevenue: 1780000, fnbRevenue: 475000, spaRevenue: 125000 },
  { month: 'Jun', revenue: 2450000, gst: 441000, refunds: 45000, occupancyRate: 92, roomRevenue: 1840000, fnbRevenue: 485000, spaRevenue: 125000 },
];

export const initialSubscriptionData: BillingSubscriptionUsage = {
  planName: 'Enterprise AI',
  billingCycle: 'Billed Annually',
  description: 'Unlimited properties, full API access.',
  aiMinutesUsed: 4200,
  aiMinutesLimit: 5000,
  whatsappMessagesUsed: 12400,
  whatsappMessagesLimit: 50000,
  amountPerYear: 149999,
  nextBillingDate: 'Nov 14, 2024',
  autoRenew: true
};

export const initialInvoices: BillingInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2023-0891',
    guestName: 'Rohan Mehta',
    bookingId: 'BK-992A',
    guestEmail: 'rohan.mehta@example.com',
    guestPhone: '+91 98200 45892',
    roomNumber: 'Villa 304',
    issueDate: 'Oct 24, 2023',
    dueDate: 'Oct 24, 2023',
    subtotal: 36900,
    gstAmount: 8100,
    cgstAmount: 4050,
    sgstAmount: 4050,
    discount: 0,
    totalAmount: 45000,
    paidAmount: 45000,
    dueAmount: 0,
    status: 'Paid',
    paymentMethod: 'UPI (Google Pay)',
    paymentReference: 'UPI-REF-9948291048',
    notes: 'Family holiday package. Late checkout granted.',
    items: [
      { id: 'item-1', description: 'Luxury Pool Villa (2 Nights)', sacCode: '996311', qty: 2, unitPrice: 15000, gstRate: 18, amount: 30000, gstAmount: 5400 },
      { id: 'item-2', description: 'The Coastal Deck Buffet Dining', sacCode: '996331', qty: 4, unitPrice: 1200, gstRate: 18, amount: 4800, gstAmount: 864 },
      { id: 'item-3', description: 'Ayurvedic Abhyanga Spa Session', sacCode: '999721', qty: 1, unitPrice: 2100, gstRate: 18, amount: 2100, gstAmount: 378 }
    ],
    paymentsHistory: [
      { id: 'pay-1', amount: 45000, method: 'UPI', referenceId: 'UPI-9948291048', timestamp: 'Oct 24, 2023 11:42 AM', collectedBy: 'Amit Joshi (Front Desk)', receiptNumber: 'RCP-891-A' }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2023-0890',
    guestName: 'Priya Sharma',
    bookingId: 'BK-991B',
    guestEmail: 'priya.sharma@gmail.com',
    guestPhone: '+91 97110 88231',
    roomNumber: 'Suite 201 & 202',
    issueDate: 'Oct 23, 2023',
    dueDate: 'Oct 25, 2023',
    subtotal: 92250,
    gstAmount: 20250,
    cgstAmount: 10125,
    sgstAmount: 10125,
    discount: 0,
    totalAmount: 112500,
    paidAmount: 0,
    dueAmount: 112500,
    status: 'Pending',
    notes: 'Scheduled for check-out tomorrow morning. WhatsApp payment link generated.',
    items: [
      { id: 'item-4', description: 'Heritage Sea-Facing Suites (3 Nights)', sacCode: '996311', qty: 3, unitPrice: 24000, gstRate: 18, amount: 72000, gstAmount: 12960 },
      { id: 'item-5', description: 'Private Beach Gazebo Dinner', sacCode: '996331', qty: 1, unitPrice: 12000, gstRate: 18, amount: 12000, gstAmount: 2160 },
      { id: 'item-6', description: 'Speedboat Harbour Island Tour', sacCode: '996411', qty: 1, unitPrice: 8250, gstRate: 18, amount: 8250, gstAmount: 1485 }
    ],
    paymentsHistory: []
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2023-0889',
    guestName: 'TechCorp Retreat',
    bookingId: 'BK-988C',
    guestEmail: 'accounts@techcorp.io',
    guestPhone: '+91 99880 12000',
    companyName: 'TechCorp Solutions Pvt Ltd',
    guestGstin: '27AABCT8892K1Z5',
    roomNumber: 'Conference Wing (8 Villas)',
    issueDate: 'Oct 22, 2023',
    dueDate: 'Nov 05, 2023',
    subtotal: 369000,
    gstAmount: 81000,
    cgstAmount: 40500,
    sgstAmount: 40500,
    discount: 0,
    totalAmount: 450000,
    paidAmount: 200000,
    dueAmount: 250000,
    status: 'Partial',
    paymentMethod: 'Corporate NEFT / IMPS',
    paymentReference: 'NEFT-AXIS-992019482',
    notes: '50% advance received prior to check-in. Balance net-15 on corporate purchase order PO-4481.',
    items: [
      { id: 'item-7', description: 'Annual Leadership Retreat Accommodation', sacCode: '996311', qty: 1, unitPrice: 260000, gstRate: 18, amount: 260000, gstAmount: 46800 },
      { id: 'item-8', description: 'Full-Day Banquet, AV Setup & Gala Dinner', sacCode: '996331', qty: 1, unitPrice: 90000, gstRate: 18, amount: 90000, gstAmount: 16200 },
      { id: 'item-9', description: 'Airport Coach Transfers (3 Vehicles)', sacCode: '996412', qty: 1, unitPrice: 19000, gstRate: 18, amount: 19000, gstAmount: 3420 }
    ],
    paymentsHistory: [
      { id: 'pay-2', amount: 200000, method: 'Netbanking', referenceId: 'NEFT-AXIS-992019482', timestamp: 'Oct 22, 2023 09:15 AM', collectedBy: 'Finance Desk', receiptNumber: 'RCP-889-ADV' }
    ]
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2023-0888',
    guestName: 'Amit Patel',
    bookingId: 'BK-985D',
    guestEmail: 'amit.patel@gmail.com',
    guestPhone: '+91 98920 33419',
    roomNumber: 'Deluxe Cottage 106',
    issueDate: 'Oct 20, 2023',
    dueDate: 'Oct 20, 2023',
    subtotal: 26240,
    gstAmount: 5760,
    cgstAmount: 2880,
    sgstAmount: 2880,
    discount: 0,
    totalAmount: 32000,
    paidAmount: 0,
    dueAmount: 0,
    refundAmount: 32000,
    refundReason: 'Flight cancelled due to monsoon alert; processed full refund under flexible policy.',
    refundDate: 'Oct 20, 2023',
    status: 'Refunded',
    isStrikethrough: true,
    notes: 'Credit note CN-2023-014 issued to original ICICI Credit Card.',
    items: [
      { id: 'item-10', description: 'Deluxe Garden Cottage (2 Nights)', sacCode: '996311', qty: 2, unitPrice: 13120, gstRate: 18, amount: 26240, gstAmount: 4723.2 }
    ],
    paymentsHistory: [
      { id: 'pay-3', amount: 32000, method: 'Credit Card', referenceId: 'PG-ICICI-881923', timestamp: 'Oct 18, 2023', collectedBy: 'Online Gateway', receiptNumber: 'RCP-888-OG' }
    ],
    refundHistory: [
      { id: 'ref-1', amount: 32000, reason: 'Weather cancellation', refundDate: 'Oct 20, 2023 04:30 PM', mode: 'Original Payment Source', approvedBy: 'General Manager (Anand Sharma)', creditNoteNumber: 'CN-2023-014' }
    ]
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2023-0887',
    guestName: 'Dr. Vikramaditya Rao',
    bookingId: 'BK-982A',
    guestEmail: 'dr.rao@apollohospital.org',
    guestPhone: '+91 94440 55123',
    roomNumber: 'Oceanfront Villa 301',
    issueDate: 'Oct 19, 2023',
    dueDate: 'Oct 19, 2023',
    subtotal: 72160,
    gstAmount: 15840,
    cgstAmount: 7920,
    sgstAmount: 7920,
    discount: 0,
    totalAmount: 88000,
    paidAmount: 88000,
    dueAmount: 0,
    status: 'Paid',
    paymentMethod: 'Credit Card (HDFC Diners Black)',
    paymentReference: 'POS-TXN-99410382',
    notes: 'VIP Doctor convention guest. Complimentary welcome fruits provided.',
    items: [
      { id: 'item-11', description: 'Oceanfront Sunset Villa (3 Nights)', sacCode: '996311', qty: 3, unitPrice: 20000, gstRate: 18, amount: 60000, gstAmount: 10800 },
      { id: 'item-12', description: 'Holistic Rejuvenation Wellness Package', sacCode: '999721', qty: 2, unitPrice: 6080, gstRate: 18, amount: 12160, gstAmount: 2188.8 }
    ],
    paymentsHistory: [
      { id: 'pay-4', amount: 88000, method: 'Credit Card', referenceId: 'POS-HDFC-99410382', timestamp: 'Oct 19, 2023 10:20 AM', collectedBy: 'Meera Nair', receiptNumber: 'RCP-887' }
    ]
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2023-0886',
    guestName: 'Sunil & Ananya Deshmukh',
    bookingId: 'BK-979F',
    guestEmail: 'ananya.deshmukh@yahoo.co.in',
    guestPhone: '+91 98230 77412',
    roomNumber: 'Heritage Suite 104',
    issueDate: 'Oct 18, 2023',
    dueDate: 'Oct 18, 2023',
    subtotal: 52890,
    gstAmount: 11610,
    cgstAmount: 5805,
    sgstAmount: 5805,
    discount: 0,
    totalAmount: 64500,
    paidAmount: 64500,
    dueAmount: 0,
    status: 'Paid',
    paymentMethod: 'UPI (PhonePe)',
    paymentReference: 'UPI-PH-9921004812',
    notes: '25th Wedding Anniversary Stay. Flower decoration included.',
    items: [
      { id: 'item-13', description: 'Heritage Suite (2 Nights)', sacCode: '996311', qty: 2, unitPrice: 22000, gstRate: 18, amount: 44000, gstAmount: 7920 },
      { id: 'item-14', description: 'Candlelight Deck Dinner & Wine', sacCode: '996331', qty: 1, unitPrice: 8890, gstRate: 18, amount: 8890, gstAmount: 1600.2 }
    ],
    paymentsHistory: [
      { id: 'pay-5', amount: 64500, method: 'UPI', referenceId: 'UPI-PH-9921004812', timestamp: 'Oct 18, 2023 12:10 PM', collectedBy: 'Amit Joshi', receiptNumber: 'RCP-886' }
    ]
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2023-0885',
    guestName: 'Kalyani Wedding Folio',
    bookingId: 'BK-975W',
    guestEmail: 'deepak.kalyani@kalyanigroup.com',
    guestPhone: '+91 98220 99001',
    companyName: 'Kalyani Holdings',
    guestGstin: '27AAACK1924L1Z2',
    roomNumber: 'Entire Coconut Grove (16 Rooms)',
    issueDate: 'Oct 17, 2023',
    dueDate: 'Oct 30, 2023',
    subtotal: 672400,
    gstAmount: 147600,
    cgstAmount: 73800,
    sgstAmount: 73800,
    discount: 0,
    totalAmount: 820000,
    paidAmount: 500000,
    dueAmount: 320000,
    status: 'Partial',
    paymentMethod: 'RTGS / Wire Transfer',
    paymentReference: 'RTGS-KALYANI-OCT17',
    notes: 'Destination Wedding 3-day block. Second tranche due post event settlement.',
    items: [
      { id: 'item-15', description: 'Resort Block Booking (3 Nights, 16 Rooms)', sacCode: '996311', qty: 1, unitPrice: 480000, gstRate: 18, amount: 480000, gstAmount: 86400 },
      { id: 'item-16', description: 'Lawn Mandap & Sangeet Catering', sacCode: '996331', qty: 1, unitPrice: 192400, gstRate: 18, amount: 192400, gstAmount: 34632 }
    ],
    paymentsHistory: [
      { id: 'pay-6', amount: 500000, method: 'Bank Transfer', referenceId: 'RTGS-KALYANI-OCT17', timestamp: 'Oct 17, 2023', collectedBy: 'Finance Desk', receiptNumber: 'RCP-885-ADV' }
    ]
  }
];

export const initialUnbilledStays: UnbilledStayItem[] = [
  {
    id: 'unb-1',
    roomNumber: 'Villa 304',
    guestName: 'Anand Sharma',
    bookingId: 'BK-1002',
    checkInDate: 'Oct 23, 2023',
    checkOutDate: 'Oct 25, 2023',
    nightsStayed: 2,
    roomTariffPending: 30000,
    diningPending: 4850,
    spaPending: 3500,
    laundryPending: 650,
    totalPending: 39000,
    status: 'Checking Out Today',
    contactPhone: '+91 98200 99482'
  },
  {
    id: 'unb-2',
    roomNumber: 'Suite 102',
    guestName: 'Anita Singh',
    bookingId: 'BK-1004',
    checkInDate: 'Oct 22, 2023',
    checkOutDate: 'Oct 26, 2023',
    nightsStayed: 3,
    roomTariffPending: 48000,
    diningPending: 6200,
    spaPending: 0,
    laundryPending: 400,
    totalPending: 54600,
    status: 'In-House',
    contactPhone: '+91 88888 77777'
  },
  {
    id: 'unb-3',
    roomNumber: 'Cottage 204',
    guestName: 'Sarah D\'Souza',
    bookingId: 'BK-1008',
    checkInDate: 'Oct 24, 2023',
    checkOutDate: 'Oct 27, 2023',
    nightsStayed: 1,
    roomTariffPending: 18000,
    diningPending: 2400,
    spaPending: 4200,
    laundryPending: 0,
    totalPending: 24600,
    status: 'In-House',
    contactPhone: '+91 99201 22891'
  },
  {
    id: 'unb-4',
    roomNumber: 'Deluxe 108',
    guestName: 'Kabir & Sanjana Malhotra',
    bookingId: 'BK-1011',
    checkInDate: 'Oct 23, 2023',
    checkOutDate: 'Oct 25, 2023',
    nightsStayed: 2,
    roomTariffPending: 26000,
    diningPending: 7400,
    spaPending: 5000,
    laundryPending: 800,
    totalPending: 39200,
    status: 'Checking Out Today',
    contactPhone: '+91 98112 33491'
  },
  {
    id: 'unb-5',
    roomNumber: 'Villa 308',
    guestName: 'Aarav Singhania',
    bookingId: 'BK-1015',
    checkInDate: 'Oct 24, 2023',
    checkOutDate: 'Oct 28, 2023',
    nightsStayed: 1,
    roomTariffPending: 22000,
    diningPending: 3800,
    spaPending: 0,
    laundryPending: 0,
    totalPending: 25800,
    status: 'In-House',
    contactPhone: '+91 97721 00481'
  },
  {
    id: 'unb-6',
    roomNumber: 'Suite 205',
    guestName: 'Meenakshi Sundaram',
    bookingId: 'BK-1019',
    checkInDate: 'Oct 24, 2023',
    checkOutDate: 'Oct 26, 2023',
    nightsStayed: 1,
    roomTariffPending: 16000,
    diningPending: 1200,
    spaPending: 0,
    laundryPending: 0,
    totalPending: 17200,
    status: 'In-House',
    contactPhone: '+91 94441 22391'
  }
];

export const initialBankSettlement: BankSettlementBatch = {
  id: 'set-1',
  batchNumber: 'SET-2023-1028-01',
  date: 'Oct 27, 2023',
  settlementDate: 'Oct 28, 2023',
  grossAmount: 1862348,
  gatewayFee: 18940,
  gstOnFee: 3408,
  netPayout: 1840000,
  status: 'Scheduled',
  bankName: 'HDFC Bank - Commercial Branch',
  accountNumberMasked: '•••• •••• 9821',
  utrNumber: 'HDFCR520231028001948'
};

export const bankSettlementHistory: BankSettlementBatch[] = [
  {
    id: 'set-h1',
    batchNumber: 'SET-2023-1025-01',
    date: 'Oct 24, 2023',
    settlementDate: 'Oct 25, 2023',
    grossAmount: 1422000,
    gatewayFee: 14476,
    gstOnFee: 2605,
    netPayout: 1404919,
    status: 'Settled',
    bankName: 'HDFC Bank - Commercial Branch',
    accountNumberMasked: '•••• •••• 9821',
    utrNumber: 'HDFCR520231025008912'
  },
  {
    id: 'set-h2',
    batchNumber: 'SET-2023-1022-01',
    date: 'Oct 21, 2023',
    settlementDate: 'Oct 22, 2023',
    grossAmount: 2180000,
    gatewayFee: 22192,
    gstOnFee: 3994,
    netPayout: 2153814,
    status: 'Settled',
    bankName: 'HDFC Bank - Commercial Branch',
    accountNumberMasked: '•••• •••• 9821',
    utrNumber: 'HDFCR520231022003891'
  },
  {
    id: 'set-h3',
    batchNumber: 'SET-2023-1018-01',
    date: 'Oct 17, 2023',
    settlementDate: 'Oct 18, 2023',
    grossAmount: 1890000,
    gatewayFee: 19240,
    gstOnFee: 3463,
    netPayout: 1867297,
    status: 'Settled',
    bankName: 'HDFC Bank - Commercial Branch',
    accountNumberMasked: '•••• •••• 9821',
    utrNumber: 'HDFCR520231018006721'
  }
];

export const myraFinanceInsights: MyraFinanceAssistantInsight[] = [
  {
    id: 'mfi-1',
    type: 'pending',
    title: '₹2,70,000 in Pending Guest Receivables',
    description: 'Priya Sharma (₹1,12,500) and TechCorp balance (₹2,50,000) are nearing checkout due dates. Myra can auto-dispatch WhatsApp payment links with UPI QR.',
    amount: '₹2,70,000',
    impact: 'Accelerates cashflow by 48 hours',
    actionText: 'Dispatch WhatsApp Payment Links',
    actionType: 'send_whatsapp_reminder'
  },
  {
    id: 'mfi-2',
    type: 'gst',
    title: 'GSTR-1 Liability Estimate: ₹4,41,000 (18% Avg)',
    description: 'CGST: ₹2,20,500 | SGST: ₹2,20,500. Total output tax matches SAC 9963 accommodation & dining collections. All 8 B2B invoices have validated GSTINs.',
    amount: '₹4,41,000',
    impact: 'Audit-ready for monthly compliance',
    actionText: 'Review GST Tax Report',
    actionType: 'filter_gst'
  },
  {
    id: 'mfi-3',
    type: 'unbilled',
    title: '14 Active Rooms with ₹1,94,200 in Unbilled Folios',
    description: '6 rooms (including Villa 304 and Deluxe 108) check out today with unbilled restaurant & spa tabs. Folios are ready for instant checkout generation.',
    amount: '14 Rooms (₹1.94L)',
    impact: 'Prevents checkout queue delays',
    actionText: 'View Unbilled Rooms',
    actionType: 'open_unbilled'
  },
  {
    id: 'mfi-4',
    type: 'subscription',
    title: 'Myra AI Quota at 84% (4,200 / 5,000 mins)',
    description: 'AI Guest Concierge usage has grown 32% this month due to peak weekend bookings. At current burn rate, quota renews in 28 days.',
    amount: '84% consumed',
    impact: 'Optional +2,000 mins safety pack available',
    actionText: 'Manage Subscription',
    actionType: 'open_subscription'
  },
  {
    id: 'mfi-5',
    type: 'refund',
    title: 'Refund Claims Kept Below 1.8% of Gross Volume',
    description: 'Only 3 claims this month (₹45,000 total), primarily due to monsoon weather flight rescheduling. Guest satisfaction retention is 94%.',
    amount: '₹45,000 (3 claims)',
    impact: 'Within target SLA (< 2.5%)',
    actionText: 'View Refunded Invoices',
    actionType: 'filter_refunds'
  }
];

export const initialInvoicesData = initialInvoices;

