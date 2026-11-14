import {
  ResortProfileSettings,
  StaffRoleItem,
  ModulePermissionRow,
  StaffSession,
  LoginHistoryItem,
  MyraAISettings,
  KnowledgeBaseItem,
  IntegrationItem,
  BillingGSTSettings,
  NotificationRuleItem,
  WhatsAppSettingsConfig,
  BookingRulesSettings,
  OperationsSettings,
  SecurityPrivacySettings,
  AuditLogRecord,
  APIKeyItem,
  WebhookItem,
  BackupHistoryItem,
  LocalizationSettings,
  AppearanceSettings,
  EmergencyContactItem,
  SettingsSearchIndexItem,
  ResortDeskSettings
} from '../types';
import { initialStaffMembers } from './staffData';

export const settingsSearchIndex: SettingsSearchIndexItem[] = [
  // GENERAL
  {
    id: 'resort-profile',
    category: 'GENERAL',
    title: 'Resort Profile & Legal Details',
    description: 'Basic property info, logo, contact, address, check-in times, GSTIN and policies',
    keywords: ['profile', 'logo', 'property name', 'address', 'gstin', 'pan', 'checkin', 'checkout', 'terms', 'cancellation policy', 'email', 'phone', 'website']
  },
  {
    id: 'staff-roles',
    category: 'GENERAL',
    title: 'Staff & Roles Permission Matrix',
    description: 'Granular role-based access control, active sessions, 2FA, staff members, and login history',
    keywords: ['staff', 'roles', 'permissions', 'matrix', 'access control', 'manager', 'front desk', 'housekeeping', 'finance', '2fa', 'sessions', 'audit', 'users']
  },
  // INTELLIGENCE
  {
    id: 'myra-ai',
    category: 'INTELLIGENCE',
    title: 'Myra AI Engine & Live Simulator',
    description: 'Autonomous guest concierge, upselling, tone tuning, multi-language, knowledge base and testing',
    keywords: ['myra', 'ai', 'chatbot', 'intelligence', 'autonomous', 'upselling', 'tone', 'simulator', 'knowledge base', 'languages', 'confidence', 'prompt', 'escalation']
  },
  // SYSTEM
  {
    id: 'integrations',
    category: 'SYSTEM',
    title: 'Integrations & External Channels',
    description: 'Connect WhatsApp WABA, OTAs (Booking.com, Airbnb), Razorpay, Google Business, Tally, and Webhooks',
    keywords: ['integrations', 'whatsapp', 'booking.com', 'airbnb', 'razorpay', 'stripe', 'tally', 'google business', 'google sheets', 'webhooks', 'ota', 'channel manager', 'api']
  },
  {
    id: 'billing-gst',
    category: 'SYSTEM',
    title: 'Billing, GST & Invoicing Rules',
    description: 'GSTIN tax slabs, SAC codes (9963, 996331), invoice numbering prefix, payment gateways, and refunds',
    keywords: ['billing', 'gst', 'tax', 'sac code', 'invoice prefix', 'cgst', 'sgst', 'igst', 'razorpay', 'pos', 'refund', 'credit note', 'financials']
  },
  {
    id: 'notifications',
    category: 'SYSTEM',
    title: 'Notifications & Alerts Matrix',
    description: 'Multi-channel notification rules for bookings, payments, check-ins, low inventory, and SOS alerts',
    keywords: ['notifications', 'alerts', 'whatsapp notifications', 'sms', 'email', 'push', 'quiet hours', 'dnd', 'emergency alert', 'escalation']
  },
  {
    id: 'whatsapp',
    category: 'SYSTEM',
    title: 'WhatsApp Automation & Cloud API',
    description: 'WABA configuration, Meta Cloud API, approved HSM message templates, business hours and handoff',
    keywords: ['whatsapp', 'waba', 'cloud api', 'meta', 'templates', 'bot', 'handoff', 'business hours', 'auto responder', 'message']
  },
  {
    id: 'booking-rules',
    category: 'SYSTEM',
    title: 'Booking & Property Rules',
    description: 'Min/max stay nights, advance deposits, cancellation tiers, early/late checkout fees, and child/pet policies',
    keywords: ['booking rules', 'min stay', 'advance deposit', 'cancellation', 'late checkout', 'early checkin', 'extra bed', 'child policy', 'pet policy', 'overbooking']
  },
  {
    id: 'operations',
    category: 'SYSTEM',
    title: 'Operations & Maintenance SLAs',
    description: 'Housekeeping turnaround standards, maintenance priority resolution SLAs, and low-stock auto orders',
    keywords: ['operations', 'housekeeping sla', 'turnover', 'maintenance sla', 'inventory threshold', 'photo verification', 'preventative maintenance', 'sla']
  },
  // SECURITY
  {
    id: 'security-privacy',
    category: 'SECURITY',
    title: 'Security, 2FA & Privacy',
    description: 'Password policies, two-factor authentication, active login sessions, IP allowlist, and data retention',
    keywords: ['security', 'password', '2fa', 'two-factor', 'sessions', 'ip allowlist', 'privacy', 'gdpr', 'dpdp', 'retention', 'data deletion', 'encryption']
  },
  {
    id: 'audit-logs',
    category: 'SECURITY',
    title: 'Audit Logs & Security Trail',
    description: 'Real-time immutable audit records with user diffs, module filters, IP tracking, and CSV export',
    keywords: ['audit logs', 'security trail', 'user activity', 'diff', 'compliance', 'history', 'timestamp', 'ip address', 'export log']
  },
  {
    id: 'api-developer',
    category: 'SECURITY',
    title: 'API Keys & Developer Webhooks',
    description: 'Manage REST API tokens, configure outbound webhook triggers, inspect delivery logs and rate limits',
    keywords: ['api', 'developer', 'api keys', 'webhooks', 'tokens', 'secret', 'endpoints', 'rate limit', 'payloads', 'postman']
  },
  {
    id: 'backup-data',
    category: 'SECURITY',
    title: 'Backup, Export & Disaster Recovery',
    description: 'Automated daily cloud backups, on-demand snapshots, point-in-time restore, and complete data export',
    keywords: ['backup', 'restore', 'disaster recovery', 'export data', 'json', 'csv', 'cloud snapshot', 'retention', 'database']
  },
  // OTHER
  {
    id: 'localization',
    category: 'OTHER',
    title: 'Localization & Currency',
    description: 'Language preferences (English, Hindi, Marathi, Konkani), currency formatting, timezones, and date format',
    keywords: ['localization', 'language', 'currency', 'inr', 'rupee', 'timezone', 'date format', 'number format', 'hindi', 'marathi', 'konkani']
  },
  {
    id: 'appearance',
    category: 'OTHER',
    title: 'Appearance & Resort Theme',
    description: 'Dark/Light/Slate themes, accent brand colors, interface density, and header branding style',
    keywords: ['appearance', 'theme', 'dark mode', 'light mode', 'accent color', 'emerald', 'indigo', 'density', 'compact', 'branding']
  },
  {
    id: 'emergency-safety',
    category: 'OTHER',
    title: 'Emergency Contacts & Safety Protocols',
    description: 'One-touch SOS directory (Police, Fire, Hospital, Doctor), emergency escalation, and mass alert broadcaster',
    keywords: ['emergency', 'safety', 'sos', 'police', 'fire', 'hospital', 'doctor', 'physician', 'evacuation', 'broadcast alert', 'disaster']
  }
];

export const initialResortProfile: ResortProfileSettings = {
  logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
  propertyName: 'Mykonos Cottage, Tarkarli',
  legalEntityName: 'Mykonos Hospitality LLP, Tarkarli',
  primaryEmail: 'concierge@mykonoscottage.in',
  supportPhone: '+91 94220 54120',
  websiteUrl: 'https://mykonoscottagetarkarli.in',
  registeredAddress: 'Tarkarli Beach Road, Malvan',
  city: 'Malvan, Sindhudurg',
  state: 'Maharashtra',
  pincode: '416606',
  country: 'India',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  baseCurrency: 'INR',
  currencySymbol: '₹',
  systemTimeZone: 'Asia/Kolkata (GMT+05:30)',
  gstin: '27AABCM4921B1Z5',
  panNumber: 'AABCM4921B',
  cancellationPolicy: 'Free cancellation up to 48 hours prior to check-in (14:00 IST). Cancellations within 24 to 48 hours incur a 50% tariff charge. Cancellations within 24 hours or no-shows are 100% non-refundable.',
  bookingTerms: 'Government-approved photo ID (Aadhaar, Passport, Voter ID) required upon check-in. PAN cards are not accepted for identity verification. Incidental deposit of ₹5,000 required upon room key handover.'
};

export const initialStaffRoles: StaffRoleItem[] = [
  {
    id: 'gm',
    name: 'General Manager',
    roleKey: 'manager',
    badgeType: 'SYSTEM DEFAULT',
    description: 'Full administrative access across all modules. Can manage billing, staff, and view aggregated analytics.',
    memberCount: 4,
    membersAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'fd',
    name: 'Front Desk & Concierge',
    roleKey: 'front_desk',
    badgeType: 'SYSTEM DEFAULT',
    description: 'Front-line reservations, check-in folios, guest CRM profiles, and room key assignment.',
    memberCount: 16,
    membersAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'hk',
    name: 'Housekeeping & Maintenance',
    roleKey: 'housekeeping',
    badgeType: 'SYSTEM DEFAULT',
    description: 'Room cleaning checklists, turnover timer tracking, maintenance work orders and inventory consumption.',
    memberCount: 18,
    membersAvatars: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'fin',
    name: 'Finance & Accountant',
    roleKey: 'finance',
    badgeType: 'SYSTEM DEFAULT',
    description: 'GST tax ledgers, Section 34 credit notes, GSTR-1 export, and bank settlement reconciliation.',
    memberCount: 3,
    membersAvatars: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'myra',
    name: 'Myra AI Autonomous Agent',
    roleKey: 'myra_agent',
    badgeType: 'SYSTEM DEFAULT',
    description: 'Autonomous WhatsApp guest messaging, tentative booking holds, and instant inquiry responses.',
    memberCount: 1,
    membersAvatars: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'
    ]
  }
];

export const initialModulePermissions: ModulePermissionRow[] = [
  {
    moduleId: 'reservations',
    moduleName: 'Reservations & Front Desk',
    description: 'Folios, check-in/out, room allocations and calendar view',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: true, createEdit: true, delete: false, export: true, approve: false },
      housekeeping: { view: true, createEdit: false, delete: false, export: false, approve: false },
      finance: { view: true, createEdit: false, delete: false, export: true, approve: false },
      myra_agent: { view: true, createEdit: true, delete: false, export: false, approve: false }
    }
  },
  {
    moduleId: 'billing_gst',
    moduleName: 'Financials, Billing & GST',
    description: 'Invoices, payments, tax ledgers, refunds, and bank settlements',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: true, createEdit: true, delete: false, export: false, approve: false },
      housekeeping: { view: false, createEdit: false, delete: false, export: false, approve: false },
      finance: { view: true, createEdit: true, delete: true, export: true, approve: true },
      myra_agent: { view: false, createEdit: false, delete: false, export: false, approve: false }
    }
  },
  {
    moduleId: 'housekeeping_maint',
    moduleName: 'Housekeeping & Maintenance',
    description: 'Room turnover status, inspections, cleaning checklists, repair tickets',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: true, createEdit: true, delete: false, export: false, approve: false },
      housekeeping: { view: true, createEdit: true, delete: false, export: false, approve: true },
      finance: { view: false, createEdit: false, delete: false, export: false, approve: false },
      myra_agent: { view: true, createEdit: true, delete: false, export: false, approve: false }
    }
  },
  {
    moduleId: 'guest_crm',
    moduleName: 'Guest CRM & Identity Data',
    description: 'VIP preferences, past stay history, contact info, and WhatsApp chats',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: true, createEdit: true, delete: false, export: true, approve: false },
      housekeeping: { view: true, createEdit: false, delete: false, export: false, approve: false },
      finance: { view: true, createEdit: false, delete: false, export: true, approve: false },
      myra_agent: { view: true, createEdit: true, delete: false, export: false, approve: false }
    }
  },
  {
    moduleId: 'inventory_proc',
    moduleName: 'Inventory & Procurement',
    description: 'Stock levels, minibar requisitions, linen supplies, PO approval',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: true, createEdit: false, delete: false, export: false, approve: false },
      housekeeping: { view: true, createEdit: true, delete: false, export: false, approve: false },
      finance: { view: true, createEdit: true, delete: false, export: true, approve: true },
      myra_agent: { view: false, createEdit: false, delete: false, export: false, approve: false }
    }
  },
  {
    moduleId: 'settings_security',
    moduleName: 'System Security & Settings',
    description: 'API keys, integrations, password policies, audit logs, and backups',
    permissions: {
      manager: { view: true, createEdit: true, delete: true, export: true, approve: true },
      front_desk: { view: false, createEdit: false, delete: false, export: false, approve: false },
      housekeeping: { view: false, createEdit: false, delete: false, export: false, approve: false },
      finance: { view: false, createEdit: false, delete: false, export: false, approve: false },
      myra_agent: { view: false, createEdit: false, delete: false, export: false, approve: false }
    }
  }
];

export const initialStaffSessions: StaffSession[] = [
  {
    id: 'sess-01',
    userName: 'Arjun Rao (You)',
    userRole: 'General Manager',
    device: 'MacBook Pro 16" (macOS 15.3)',
    browser: 'Chrome 128.0',
    ipAddress: '49.36.128.45',
    location: 'Malvan, Maharashtra, India',
    loginTime: 'Active now',
    isCurrent: true
  },
  {
    id: 'sess-02',
    userName: 'Priya Sharma',
    userRole: 'Front Desk Lead',
    device: 'Dell OptiPlex 7090 (Windows 11)',
    browser: 'Edge 127.0',
    ipAddress: '103.87.52.12',
    location: 'Tarkarli, Malvan, India',
    loginTime: '28 mins ago',
    isCurrent: false
  },
  {
    id: 'sess-03',
    userName: 'Vikram Joshi',
    userRole: 'Head of Housekeeping',
    device: 'Samsung Galaxy Tab S9 (Android 14)',
    browser: 'Chrome Mobile',
    ipAddress: '103.87.52.19',
    location: 'Tarkarli, Malvan, India',
    loginTime: '2 hours ago',
    isCurrent: false
  },
  {
    id: 'sess-04',
    userName: 'Aravind S.',
    userRole: 'Duty Manager',
    device: 'iPhone 15 Pro (iOS 18)',
    browser: 'Safari Mobile',
    ipAddress: '49.36.130.88',
    location: 'Sindhudurg, Maharashtra, India',
    loginTime: '4 hours ago',
    isCurrent: false
  }
];

export const initialLoginHistory: LoginHistoryItem[] = [
  {
    id: 'log-101',
    userName: 'Arjun Rao',
    role: 'General Manager',
    ipAddress: '49.36.128.45',
    timestamp: 'Today, 08:30 AM',
    status: 'Success',
    location: 'Malvan, Maharashtra'
  },
  {
    id: 'log-102',
    userName: 'Priya Sharma',
    role: 'Front Desk Lead',
    ipAddress: '103.87.52.12',
    timestamp: 'Today, 07:15 AM',
    status: 'Success',
    location: 'Tarkarli, Malvan'
  },
  {
    id: 'log-103',
    userName: 'Finance Accountant',
    role: 'Finance',
    ipAddress: '157.34.19.82',
    timestamp: 'Yesterday, 11:42 PM',
    status: 'Blocked (2FA)',
    location: 'Mumbai, MH (Unrecognized Device)'
  },
  {
    id: 'log-104',
    userName: 'Vikram Joshi',
    role: 'Housekeeping',
    ipAddress: '103.87.52.19',
    timestamp: 'Yesterday, 06:45 AM',
    status: 'Success',
    location: 'Tarkarli, Malvan'
  }
];

export const initialMyraAISettings: MyraAISettings = {
  enabled: true,
  autonomousChatbot: true,
  autoBookingEngine: true,
  aiUpselling: true,
  complaintHandling: true,
  postStayFollowUp: true,
  humanEscalation: true,
  confidenceThreshold: 75,
  tone: 'warm',
  greetingPrefix: 'Namaste! Welcome to Mykonos Cottage, Tarkarli. I am Myra, your AI Concierge.',
  signatureText: '— Myra, ResortDesk AI Concierge 🌺',
  supportedLanguages: ['English', 'Hindi', 'Marathi', 'Konkani', 'Russian'],
  autoAssignRoom: true,
  tentativeHoldHours: 4,
  monthlyMinutesLimit: 5000,
  monthlyMinutesUsed: 4200,
  whatsappMessageLimit: 50000,
  whatsappMessagesUsed: 12400,
  guestMemoryRetentionDays: 365
};

export const initialKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: 'kb-1',
    category: 'Transport',
    question: 'Do you provide airport pickup and drop-off from Sindhudurg (SDW) or Goa Mopa (GOX)?',
    answer: 'Yes, we provide private chauffeur airport transfers. A sedan is ₹2,200 + 18% GST from Sindhudurg Airport (Chipi SDW - approx 35 mins) and ₹3,500 + 18% GST from Goa Mopa (GOX - approx 90 mins).',
    lastUpdated: '2 days ago',
    isPublished: true
  },
  {
    id: 'kb-2',
    category: 'Policies',
    question: 'What are the check-in and check-out timings? Is early check-in allowed?',
    answer: 'Standard check-in is 2:00 PM and check-out is 11:00 AM. Early check-in from 10:00 AM is complimentary subject to room readiness. For guaranteed arrival before 10:00 AM, a 50% day tariff applies.',
    lastUpdated: '1 week ago',
    isPublished: true
  },
  {
    id: 'kb-3',
    category: 'Dining',
    question: 'What are the breakfast and dining restaurant timings?',
    answer: 'The Palm Grove multi-cuisine restaurant serves complimentary buffet breakfast from 07:00 AM to 10:30 AM. In-room dining is available 24/7. Coastal Spice seafood specialty restaurant operates 12:30 PM - 03:30 PM & 07:00 PM - 11:00 PM.',
    lastUpdated: '3 days ago',
    isPublished: true
  },
  {
    id: 'kb-4',
    category: 'Amenities',
    question: 'Is the infinity pool and spa heated? What are the operating hours?',
    answer: 'Our beachfront infinity pool is temperature-controlled and open daily from 06:00 AM to 08:00 PM. The Maya Ayurvedic & Wellness Spa operates 08:00 AM to 09:00 PM (prior appointment recommended).',
    lastUpdated: '2 weeks ago',
    isPublished: true
  }
];

export const initialIntegrations: IntegrationItem[] = [
  {
    id: 'int-whatsapp',
    name: 'WhatsApp Business Cloud API',
    category: 'Communication',
    description: 'Send automated booking confirmations, digital check-in keys, and AI guest chat concierge.',
    iconType: 'whatsapp',
    status: 'Connected',
    statusText: 'Verified & Active (+91 98765 43210)',
    lastSync: 'Live (Real-time)',
    accountIdentifier: 'WABA ID: 1092837491029',
    configFields: [
      { key: 'phone', label: 'Registered Business Phone', type: 'text', value: '+91 98765 43210' },
      { key: 'wabaId', label: 'Meta WABA Account ID', type: 'text', value: '1092837491029' },
      { key: 'apiToken', label: 'System User Permanent Access Token', type: 'password', value: 'EAAG****************************' },
      { key: 'aiReplies', label: 'Allow Myra AI to auto-reply to guest chats', type: 'toggle', value: 'true' }
    ]
  },
  {
    id: 'int-bookingcom',
    name: 'Booking.com Channel Manager',
    category: 'OTAs',
    description: 'Two-way sync for reservations, inventory availability, room rates, and guest messaging.',
    iconType: 'bookingcom',
    status: 'Connected',
    statusText: 'Connected & Syncing',
    lastSync: '2 mins ago',
    accountIdentifier: 'Hotel ID: 894210',
    configFields: [
      { key: 'hotelId', label: 'Booking.com Property ID', type: 'text', value: '894210' },
      { key: 'username', label: 'Channel XML Username', type: 'text', value: 'mykonos_tarkarli_channel' },
      { key: 'syncFreq', label: 'Sync Frequency', type: 'select', value: 'Real-time Webhook', options: ['Real-time Webhook', 'Every 5 Minutes', 'Every 15 Minutes'] }
    ]
  },
  {
    id: 'int-airbnb',
    name: 'Airbnb Direct Sync',
    category: 'OTAs',
    description: 'Sync availability calendar, instant booking reservations, and automated guest check-in messages.',
    iconType: 'airbnb',
    status: 'Connected',
    statusText: 'Connected & Syncing',
    lastSync: '5 mins ago',
    accountIdentifier: 'Host ID: 4829104',
    configFields: [
      { key: 'hostId', label: 'Airbnb Host ID', type: 'text', value: '4829104' },
      { key: 'icalSync', label: 'Enable iCal & API Bidirectional Sync', type: 'toggle', value: 'true' }
    ]
  },
  {
    id: 'int-razorpay',
    name: 'Razorpay Payment Gateway',
    category: 'Payments',
    description: 'Process domestic & international credit cards, UPI Dynamic QR, Netbanking, and automated refunds.',
    iconType: 'razorpay',
    status: 'Auth Failed',
    statusText: 'API keys expired / Secret mismatch',
    lastSync: '3 hours ago',
    accountIdentifier: 'Merchant ID: mid_849201948',
    configFields: [
      { key: 'merchantId', label: 'Razorpay Key ID', type: 'text', value: 'rzp_live_9482910482' },
      { key: 'keySecret', label: 'Razorpay Key Secret', type: 'password', value: '************************' },
      { key: 'autoCapture', label: 'Auto-capture payments on success', type: 'toggle', value: 'true' },
      { key: 'upiQr', label: 'Generate dynamic UPI QR on invoices', type: 'toggle', value: 'true' }
    ]
  },
  {
    id: 'int-gmb',
    name: 'Google Business Profile',
    category: 'Communication',
    description: 'Manage verified reviews, sync resort photos, FAQs, and Google Search & Maps listings.',
    iconType: 'google',
    status: 'Not Connected',
    statusText: 'Authorization required',
    lastSync: 'Never',
    accountIdentifier: 'Unlinked',
    configFields: [
      { key: 'locationId', label: 'Google Place / Location ID', type: 'text', value: 'ChIJN1t_tDeuEmsRUsoyG83frY4', placeholder: 'Enter Place ID' },
      { key: 'autoReviewReply', label: 'Auto-draft AI response for 5-star reviews', type: 'toggle', value: 'true' }
    ]
  },
  {
    id: 'int-tally',
    name: 'Tally Prime ERP & GST',
    category: 'Accounting',
    description: 'Export daily revenue sales ledgers, GST tax invoices, and payment vouchers directly to Tally Prime.',
    iconType: 'tally',
    status: 'Not Connected',
    statusText: 'ODBC Bridge disconnected',
    lastSync: 'Never',
    accountIdentifier: 'Port: 9000',
    configFields: [
      { key: 'companyName', label: 'Tally Company Name', type: 'text', value: 'MYKONOS COTTAGE TARKARLI 2026-27' },
      { key: 'tallyHost', label: 'Tally XML / Server URL', type: 'text', value: 'http://192.168.1.100:9000' }
    ]
  },
  {
    id: 'int-gcal',
    name: 'Google Calendar Sync',
    category: 'Communication',
    description: 'Sync room turnover schedules, VIP arrival agendas, and banquets to staff Google Calendars.',
    iconType: 'calendar',
    status: 'Connected',
    statusText: 'Connected (resortdesk-sync@google.com)',
    lastSync: '12 mins ago',
    accountIdentifier: 'resortdesk-sync@google.com',
    configFields: [
      { key: 'calId', label: 'Primary Calendar ID', type: 'text', value: 'concierge@mykonoscottage.in' }
    ]
  },
  {
    id: 'int-gsheets',
    name: 'Google Sheets Live Ledger',
    category: 'Accounting',
    description: 'Live real-time spreadsheet backup of every completed checkout, invoice folio, and guest log.',
    iconType: 'sheets',
    status: 'Connected',
    statusText: 'Connected & Streaming rows',
    lastSync: '1 min ago',
    accountIdentifier: 'ResortDesk_Mykonos_Master_2026',
    configFields: [
      { key: 'sheetUrl', label: 'Google Spreadsheet URL', type: 'text', value: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZj_mykonos' }
    ]
  },
  {
    id: 'int-stripe',
    name: 'Stripe Global Payments',
    category: 'Payments',
    description: 'Accept international credit cards (USD, EUR, GBP, AUD) with 3D Secure and automatic currency conversion.',
    iconType: 'stripe',
    status: 'Not Connected',
    statusText: 'Setup required',
    lastSync: 'Never',
    accountIdentifier: 'Unlinked',
    configFields: [
      { key: 'pubKey', label: 'Publishable Key', type: 'text', value: 'pk_live_********************' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', value: 'sk_live_********************' }
    ]
  },
  {
    id: 'int-maps',
    name: 'Google Maps Platform',
    category: 'Developer',
    description: 'Display interactive arrival routing, tourist landmarks, and beach distance calculators for guests.',
    iconType: 'maps',
    status: 'Connected',
    statusText: 'Active (Places & Routes API)',
    lastSync: 'Live',
    accountIdentifier: 'API Project: resortdesk-maps-prod',
    configFields: [
      { key: 'apiKey', label: 'Google Maps API Key', type: 'password', value: 'AIzaSy********************' }
    ]
  }
];

export const initialBillingGSTSettings: BillingGSTSettings = {
  gstin: '27AABCM4921B1Z2',
  legalBusinessName: 'Mykonos Hospitality LLP, Tarkarli',
  stateCode: '27 (Maharashtra)',
  invoicePrefix: 'MYK-2026/',
  nextInvoiceNumber: 1042,
  fySequence: '2026-27',
  defaultGstRate: 18,
  fnbGstRate: 5,
  spaGstRate: 18,
  sacRates: [
    { code: '996311', serviceName: 'Room Accommodation (< ₹7,500)', gstRate: 12, description: 'Hotel stay below statutory threshold' },
    { code: '996312', serviceName: 'Luxury Room Accommodation (≥ ₹7,500)', gstRate: 18, description: 'Luxury hotel rooms & private villas' },
    { code: '996331', serviceName: 'Restaurant & In-Room Dining', gstRate: 5, description: 'Food & non-alcoholic beverage service' },
    { code: '999721', serviceName: 'Spa, Massage & Ayurvedic Wellness', gstRate: 18, description: 'Wellness therapy & salon services' },
    { code: '996411', serviceName: 'Chauffeur Airport Transfers', gstRate: 5, description: 'Passenger transport services' }
  ],
  enableInterstateIGST: true,
  autoDispatchInvoiceWhatsApp: true,
  autoDispatchInvoiceEmail: true,
  razorpayMerchantId: 'rzp_live_9482910482',
  razorpayAutoSettle: true,
  refundProcessingDays: 3,
  cancellationRetentionGSTRules: true
};

export const initialNotificationRules: NotificationRuleItem[] = [
  {
    id: 'notif-1',
    event: 'New Reservation Created',
    description: 'Instant notification when a booking is confirmed via WhatsApp, Website or OTAs',
    category: 'Reservations',
    whatsapp: true,
    email: true,
    sms: false,
    inApp: true,
    targetRole: 'Front Desk & GM'
  },
  {
    id: 'notif-2',
    event: 'Payment Received / Invoice Paid',
    description: 'Alert when advance deposit or final folio checkout is collected',
    category: 'Financial',
    whatsapp: true,
    email: true,
    sms: true,
    inApp: true,
    targetRole: 'Finance & GM'
  },
  {
    id: 'notif-3',
    event: 'Guest Check-in & Key Handover',
    description: 'Trigger notification to housekeeping for welcome amenity delivery',
    category: 'Reservations',
    whatsapp: true,
    email: false,
    sms: false,
    inApp: true,
    targetRole: 'Housekeeping & Concierge'
  },
  {
    id: 'notif-4',
    event: '1 to 3 Star Negative Review Received',
    description: 'High-priority escalation when a dissatisfied guest rates below 4 stars',
    category: 'Urgent',
    whatsapp: true,
    email: true,
    sms: true,
    inApp: true,
    targetRole: 'Duty Manager & GM'
  },
  {
    id: 'notif-5',
    event: 'High-Priority Maintenance Ticket',
    description: 'Immediate alert for AC breakdown, plumbing leak, or door lock failure',
    category: 'Operations',
    whatsapp: true,
    email: false,
    sms: true,
    inApp: true,
    targetRole: 'Maintenance Team'
  },
  {
    id: 'notif-6',
    event: 'Inventory Low Stock (< 15%)',
    description: 'Alert when guest toiletries, minibar beverages or cleaning supplies reach safety threshold',
    category: 'Operations',
    whatsapp: false,
    email: true,
    sms: false,
    inApp: true,
    targetRole: 'Procurement Lead'
  },
  {
    id: 'notif-7',
    event: 'Emergency SOS Broadcast',
    description: 'Life-safety emergency trigger requiring immediate property-wide response',
    category: 'Urgent',
    whatsapp: true,
    email: true,
    sms: true,
    inApp: true,
    targetRole: 'All Staff & Emergency Contacts'
  }
];

export const initialWhatsAppConfig: WhatsAppSettingsConfig = {
  phoneNumber: '+91 98765 43210',
  wabaId: 'WABA_1092837491029',
  displayName: 'Mykonos Cottage Tarkarli AI Desk',
  status: 'Verified & Active',
  autoBotReplies: true,
  humanHandoffKeywords: 'human, manager, reception, complaint, emergency, talk to person',
  businessHoursStart: '06:00',
  businessHoursEnd: '23:30',
  outOfHoursMessage: 'Thank you for contacting Mykonos Cottage, Tarkarli. Our human concierge desk is resting, but Myra AI is online 24/7 to assist with bookings, transfers, and dining orders.',
  templates: [
    {
      id: 'tmpl-1',
      name: 'booking_confirmation_v2',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      bodyText: 'Dear {{1}}, your reservation at Mykonos Cottage, Tarkarli is confirmed! Booking ID: {{2}}. Check-in: {{3}} at 2:00 PM. Tap below for your digital check-in pass.',
      lastUpdated: 'Aug 12, 2026'
    },
    {
      id: 'tmpl-2',
      name: 'pre_arrival_concierge',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      bodyText: 'Namaste {{1}}! We look forward to welcoming you tomorrow. Would you like to schedule a transfer from Sindhudurg Airport or reserve a table at Coastal Spice?',
      lastUpdated: 'Aug 04, 2026'
    },
    {
      id: 'tmpl-3',
      name: 'checkout_tax_invoice',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      bodyText: 'Dear {{1}}, thank you for staying with us! Your Tax Invoice #{{2}} for ₹{{3}} has been settled. Tap here to download your official GST invoice PDF.',
      lastUpdated: 'Jul 28, 2026'
    },
    {
      id: 'tmpl-4',
      name: 'google_review_request',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      bodyText: 'Hi {{1}}, we hope you enjoyed your stay at Mykonos Cottage, Tarkarli! Could you take 30 seconds to share your experience on Google? It means the world to our team: {{2}}',
      lastUpdated: 'Jul 15, 2026'
    }
  ]
};

export const initialBookingRules: BookingRulesSettings = {
  minStayNights: 1,
  maxStayNights: 30,
  weekendMinStayNights: 2,
  advanceDepositPercentage: 50,
  peakSeasonAdvanceDeposit: 100,
  freeCancellationHours: 48,
  tier2CancellationHours: 24,
  tier2RetentionPercentage: 50,
  earlyCheckInHourlyFee: 500,
  lateCheckOutHourlyFee: 600,
  extraGuestAdultCharge: 1500,
  extraChildCharge: 800,
  rollawayBedCharge: 1200,
  petPolicyAllowed: true,
  petSanitizationFee: 1000,
  autoRoomAssignmentMode: 'Cleanest & Balanced',
  overbookingSafetyBufferPercentage: 0
};

export const initialOperationsSettings: OperationsSettings = {
  housekeepingTurnoverMins: 30,
  suiteTurnoverMins: 45,
  deepCleanIntervalDays: 7,
  requirePhotoVerification: true,
  maintenanceSlaEmergencyHours: 1,
  maintenanceSlaHighHours: 4,
  maintenanceSlaMediumHours: 12,
  maintenanceSlaLowHours: 24,
  preventativeAcServiceDays: 30,
  preventativeWaterTankDays: 15,
  inventoryLowStockThresholdPercent: 15,
  autoDraftVendorPO: true
};

export const initialSecurityPrivacy: SecurityPrivacySettings = {
  minPasswordLength: 10,
  requireSpecialChar: true,
  passwordExpiryDays: 90,
  enforce2FAForManagers: true,
  enforce2FAForAll: false,
  sessionTimeoutMinutes: 60,
  ipAllowlistEnabled: false,
  allowedIPs: '49.36.128.*, 103.87.52.*',
  guestPiiRetentionYears: 3,
  anonymizeCheckedOutGuests: false
};

export const initialAuditLogs: AuditLogRecord[] = [
  {
    id: 'aud-901',
    user: 'Arjun Rao',
    userRole: 'General Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    action: 'UPDATE',
    module: 'Myra AI Engine',
    summary: 'Updated AI confidence threshold from 70% to 75% and enabled auto-booking engine.',
    oldValue: 'confidenceThreshold: 70',
    newValue: 'confidenceThreshold: 75',
    ipAddress: '49.36.128.45',
    timestamp: 'Today, 10:45 AM'
  },
  {
    id: 'aud-902',
    user: 'Priya Sharma',
    userRole: 'Front Desk Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    action: 'CREATE',
    module: 'Reservations',
    summary: 'Created walk-in booking for Amitav Roy in Room 204 (Deluxe Suite).',
    oldValue: 'None',
    newValue: 'Booking #OGOA-8942',
    ipAddress: '103.87.52.12',
    timestamp: 'Today, 09:30 AM'
  },
  {
    id: 'aud-903',
    user: 'Finance Lead',
    userRole: 'Finance',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    action: 'UPDATE',
    module: 'Billing & GST',
    summary: 'Modified SAC Code 996311 GST rate mapping to standard 12%.',
    oldValue: 'gstRate: 18%',
    newValue: 'gstRate: 12%',
    ipAddress: '103.87.52.18',
    timestamp: 'Yesterday, 04:15 PM'
  },
  {
    id: 'aud-904',
    user: 'System Admin',
    userRole: 'Security Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    action: 'AUTH',
    module: 'Security & 2FA',
    summary: 'Enforced mandatory Two-Factor Authentication for all managerial accounts.',
    oldValue: 'enforce2FAForManagers: false',
    newValue: 'enforce2FAForManagers: true',
    ipAddress: '49.36.128.45',
    timestamp: 'Yesterday, 02:10 PM'
  },
  {
    id: 'aud-905',
    user: 'Arjun Rao',
    userRole: 'General Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    action: 'EXPORT',
    module: 'Audit & Compliance',
    summary: 'Exported GSTR-1 monthly tax ledger for July 2026.',
    oldValue: 'None',
    newValue: 'Exported GSTR-1_July2026.csv (428 records)',
    ipAddress: '49.36.128.45',
    timestamp: 'Aug 14, 2026'
  }
];

export const initialAPIKeys: APIKeyItem[] = [
  {
    id: 'key-1',
    name: 'Production Website Booking Engine',
    keyPrefix: 'rd_live_9482...e49a',
    scopes: ['read:bookings', 'write:bookings', 'read:availability'],
    createdDate: 'May 10, 2026',
    lastUsed: '2 mins ago',
    status: 'Active'
  },
  {
    id: 'key-2',
    name: 'Zapier WhatsApp & Sheets Bridge',
    keyPrefix: 'rd_live_3821...bc78',
    scopes: ['read:guests', 'read:folios', 'write:leads'],
    createdDate: 'Jun 18, 2026',
    lastUsed: '15 mins ago',
    status: 'Active'
  },
  {
    id: 'key-3',
    name: 'Tally Accounting Sync Connector',
    keyPrefix: 'rd_live_7712...01aa',
    scopes: ['read:invoices', 'read:gst', 'write:vouchers'],
    createdDate: 'Jul 01, 2026',
    lastUsed: 'Yesterday',
    status: 'Active'
  }
];

export const initialWebhooks: WebhookItem[] = [
  {
    id: 'wh-1',
    url: 'https://hooks.zapier.com/hooks/catch/948291/mykonos_booking',
    events: ['booking.created', 'booking.cancelled', 'payment.success'],
    status: 'Active',
    secretMasked: 'whsec_9842****************',
    lastDelivery: '2 mins ago (HTTP 200 OK)',
    successRate: '99.9%'
  },
  {
    id: 'wh-2',
    url: 'https://api.mykonoscottage.in/webhooks/myra-escalation',
    events: ['myra.human_escalation', 'review.negative_alert'],
    status: 'Active',
    secretMasked: 'whsec_3810****************',
    lastDelivery: '1 hour ago (HTTP 200 OK)',
    successRate: '100%'
  }
];

export const initialBackupHistory: BackupHistoryItem[] = [
  {
    id: 'bk-1',
    timestamp: 'Today, 02:00 AM IST',
    size: '48.2 MB',
    type: 'Automated Daily',
    status: 'Completed (Verified)',
    storageLocation: 'Encrypted AWS S3 (Mumbai ap-south-1)',
    downloadUrl: '#'
  },
  {
    id: 'bk-2',
    timestamp: 'Yesterday, 02:00 AM IST',
    size: '47.9 MB',
    type: 'Automated Daily',
    status: 'Completed (Verified)',
    storageLocation: 'Encrypted AWS S3 (Mumbai ap-south-1)',
    downloadUrl: '#'
  },
  {
    id: 'bk-3',
    timestamp: 'Aug 15, 2026 11:30 PM',
    size: '47.5 MB',
    type: 'Manual Snapshot',
    status: 'Completed (Verified)',
    storageLocation: 'Encrypted AWS S3 (Mumbai ap-south-1)',
    downloadUrl: '#'
  }
];

export const initialLocalization: LocalizationSettings = {
  primaryLanguage: 'English (US/UK)',
  additionalLanguages: ['Hindi (हिन्दी)', 'Marathi (मराठी)', 'Konkani (कोंकणी)', 'Gujarati (ગુજરાતી)', 'Russian (Русский)', 'French (Français)'],
  currencyCode: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata (GMT+05:30)',
  dateFormat: 'DD/MM/YYYY (e.g. 17/08/2026)',
  numberFormat: 'Indian (12,50,000.00)',
  temperatureUnit: 'Celsius (°C)'
};

export const initialAppearance: AppearanceSettings = {
  theme: 'light',
  accentColor: 'emerald',
  density: 'comfortable',
  customBrandingName: 'Mykonos Cottage, Tarkarli',
  highContrastMode: false
};

export const initialEmergencyContacts: EmergencyContactItem[] = [
  {
    id: 'em-1',
    type: 'Police',
    name: 'Malvan Police Station',
    organization: 'Maharashtra State Police (Sindhudurg)',
    phone: '+91 2365 252 100',
    alternatePhone: '100 / 112 (Emergency Control)',
    address: 'Bazar Peth Road, Malvan, Sindhudurg 416606',
    isPrimary: true
  },
  {
    id: 'em-2',
    type: 'Fire',
    name: 'Malvan Municipal Fire & Rescue',
    organization: 'Sindhudurg Fire & Emergency Services',
    phone: '+91 2365 252 201',
    alternatePhone: '101',
    address: 'Malvan Nagar Parishad, Sindhudurg',
    isPrimary: true
  },
  {
    id: 'em-3',
    type: 'Hospital',
    name: 'Malvan Rural Sub-District Hospital (24/7)',
    organization: 'Sindhudurg District Health Services',
    phone: '+91 2365 252 333',
    alternatePhone: '108 (National Ambulance)',
    address: 'Hospital Road, Malvan, Maharashtra 416606',
    isPrimary: true
  },
  {
    id: 'em-4',
    type: 'Doctor',
    name: 'Dr. Suresh Kamat, MD',
    organization: 'Resort Designated On-Call Physician',
    phone: '+91 98221 44556',
    address: 'Tarkarli Road Clinic, Malvan',
    isPrimary: false
  },
  {
    id: 'em-5',
    type: 'Security',
    name: 'Col. Ranjit Varma (Retd.)',
    organization: 'Chief Security Officer — Mykonos Cottage',
    phone: '+91 98765 00001',
    address: 'Internal Security Operations Command, Ext 901',
    isPrimary: true
  }
];

export const initialSettingsData: ResortDeskSettings = {
  profile: initialResortProfile,
  staff: initialStaffMembers,
  staffRoles: initialStaffRoles,
  modulePermissions: initialModulePermissions,
  staffSessions: initialStaffSessions,
  loginHistory: initialLoginHistory,
  myraEngine: initialMyraAISettings,
  knowledgeBase: initialKnowledgeBase,
  integrations: initialIntegrations,
  billingGst: initialBillingGSTSettings,
  notifications: initialNotificationRules,
  whatsapp: initialWhatsAppConfig,
  bookingRules: initialBookingRules,
  operations: initialOperationsSettings,
  security: initialSecurityPrivacy,
  auditLogs: initialAuditLogs,
  apiKeys: initialAPIKeys,
  webhooks: initialWebhooks,
  backups: initialBackupHistory,
  localization: initialLocalization,
  appearance: initialAppearance,
  emergencyContacts: initialEmergencyContacts
};

